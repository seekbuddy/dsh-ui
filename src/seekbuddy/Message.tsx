import clsx from 'clsx'
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconCheckOutlineRegular, IconCloseOutlineRegular, IconWarningOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { Spinner } from './Spinner.tsx'
import css from './Message.module.css'

export type MessageType = 'success' | 'info' | 'warning' | 'error' | 'loading'

export interface MessageOptions {
  /** Default `info`. */
  type?: MessageType | undefined
  /** Message text or nodes. */
  content: ReactNode
  /** Seconds. Default 3; `0` stays until closed. `loading` defaults to 0. */
  duration?: number | undefined
  /** Re-opening with the same key updates that message in place (e.g. loading → success). */
  key?: string | undefined
  /** Replaces the type's default glyph. */
  icon?: ReactNode | undefined
  /** Called after the message has faded out, however it closed: timeout, `close()`, `destroy`, or eviction by `maxCount`. */
  onClose?: (() => void) | undefined
}

/** Closes the message it was returned for. */
export type MessageClose = () => void

export interface MessageApi {
  /** Shows a message with full options; returns a function that closes it. */
  open(options: MessageOptions): MessageClose
  /** Shows a success message; `duration` in seconds (default 3, `0` keeps it open). */
  success(content: ReactNode, duration?: number): MessageClose
  /** Shows an info message; `duration` in seconds (default 3, `0` keeps it open). */
  info(content: ReactNode, duration?: number): MessageClose
  /** Shows a warning message; `duration` in seconds (default 3, `0` keeps it open). */
  warning(content: ReactNode, duration?: number): MessageClose
  /** Shows an error message; `duration` in seconds (default 3, `0` keeps it open). */
  error(content: ReactNode, duration?: number): MessageClose
  /** Shows a loading message; it stays until closed unless `duration` is given. */
  loading(content: ReactNode, duration?: number): MessageClose
  /** Without a key closes every message. */
  destroy(key?: string): void
}

export interface MessageProviderProps {
  /** Distance from the viewport top in px. Default 120, where the upstream Toast sits. */
  top?: number | undefined
  /** Messages shown at once; the oldest closes when exceeded. Default 3. */
  maxCount?: number | undefined
  /** The subtree that may call `useMessage()`. */
  children: ReactNode
}

/** Fade-out length; must agree with the stylesheet's leave animation. */
const FADE_MS = 1000
const DEFAULT_DURATION = 3

interface Entry {
  id: string
  type: MessageType
  content: ReactNode
  icon: ReactNode | undefined
  onClose: (() => void) | undefined
  leaving: boolean
}

const MessageContext = createContext<MessageApi | null>(null)

/**
 * Stacked transient messages: antd's `useMessage` shape on top of the upstream Toast look.
 * The provider owns the stack and renders it through a body portal only while something is
 * showing, so server rendering never touches `document`. A provider per page root, not a global
 * singleton — separately built bundles on one page each include their own copy of this module, so a
 * module-level store would split across them.
 */
export function MessageProvider({ top = 120, maxCount = 3, children }: MessageProviderProps) {
  const prefix = useId()
  const sequence = useRef(0)
  // The store is the source of truth; `entries` mirrors it for rendering. Imperative updates
  // (timers, key replacement, maxCount eviction) stay out of setState callbacks.
  const store = useRef<Entry[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const autoTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const leaveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const settings = useRef({ maxCount })
  settings.current.maxCount = maxCount

  useEffect(() => {
    const auto = autoTimers.current
    const leave = leaveTimers.current
    return () => {
      for (const timer of auto.values()) clearTimeout(timer)
      for (const timer of leave.values()) clearTimeout(timer)
      auto.clear()
      leave.clear()
    }
  }, [])

  const api = useMemo<MessageApi>(() => {
    const sync = () => setEntries(store.current.slice())
    const clearTimers = (id: string) => {
      const auto = autoTimers.current.get(id)
      if (auto !== undefined) clearTimeout(auto)
      autoTimers.current.delete(id)
      const leave = leaveTimers.current.get(id)
      if (leave !== undefined) clearTimeout(leave)
      leaveTimers.current.delete(id)
    }
    const close = (id: string) => {
      const entry = store.current.find((item) => item.id === id)
      if (entry === undefined || entry.leaving) return
      clearTimers(id)
      entry.leaving = true
      sync()
      leaveTimers.current.set(
        id,
        setTimeout(() => {
          leaveTimers.current.delete(id)
          store.current = store.current.filter((item) => item.id !== id)
          sync()
          entry.onClose?.()
        }, FADE_MS),
      )
    }
    const open = (options: MessageOptions): MessageClose => {
      const type = options.type ?? 'info'
      sequence.current += 1
      const id = options.key ?? `${prefix}-${sequence.current}`
      const duration = options.duration ?? (type === 'loading' ? 0 : DEFAULT_DURATION)
      clearTimers(id)
      const entry: Entry = {
        id,
        type,
        content: options.content,
        icon: options.icon,
        onClose: options.onClose,
        leaving: false,
      }
      const index = store.current.findIndex((item) => item.id === id)
      if (index === -1) store.current = [...store.current, entry]
      else store.current = store.current.map((item, position) => (position === index ? entry : item))
      const live = store.current.filter((item) => !item.leaving)
      for (const stale of live.slice(0, Math.max(0, live.length - settings.current.maxCount))) close(stale.id)
      sync()
      if (duration > 0)
        autoTimers.current.set(
          id,
          setTimeout(() => close(id), duration * 1000),
        )
      return () => close(id)
    }
    const shorthand =
      (type: MessageType) =>
      (content: ReactNode, duration?: number): MessageClose =>
        open({ type, content, duration })
    return {
      open,
      success: shorthand('success'),
      info: shorthand('info'),
      warning: shorthand('warning'),
      error: shorthand('error'),
      loading: shorthand('loading'),
      destroy: (key) => {
        if (key !== undefined) close(key)
        else for (const entry of store.current) close(entry.id)
      },
    }
  }, [prefix])

  return (
    <MessageContext.Provider value={api}>
      {children}
      {entries.length > 0 && typeof document !== 'undefined'
        ? createPortal(
            <div className={css.stack} style={{ top }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={clsx(css.message, css[entry.type], entry.leaving && css.leaving)}
                  role={entry.type === 'error' ? 'alert' : 'status'}
                  data-type={entry.type}
                >
                  <span className={css.icon} aria-hidden="true">
                    {entry.icon === undefined ? defaultIcon(entry.type) : entry.icon}
                  </span>
                  <span className={css.content}>{entry.content}</span>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </MessageContext.Provider>
  )
}

/** The message API of the nearest `MessageProvider`; stable across renders. Throws outside one. */
export function useMessage(): MessageApi {
  const api = useContext(MessageContext)
  if (api === null) throw new Error('useMessage() must be called inside a <MessageProvider>')
  return api
}

function defaultIcon(type: MessageType): ReactNode {
  if (type === 'success') return <IconCheckOutlineRegular />
  if (type === 'error') return <IconCloseOutlineRegular />
  if (type === 'warning') return <IconWarningOutlineRegular size={14} />
  if (type === 'loading') return <Spinner size="sm" />
  return <InfoGlyph />
}

/** Upstream ships no info icon; drawn like the Mark glyphs (24 grid, currentColor stroke). */
function InfoGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}
