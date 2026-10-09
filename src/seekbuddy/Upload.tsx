import clsx from 'clsx'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import {
  IconCloseOutlineRegular,
  IconPaperclipOutlineRegular,
  IconRefreshOutlineRegular,
} from '@seekbuddy/dsh-ui/icons'
import css from './Upload.module.css'

/** `button`: a trigger button above the list. `dragger`: a dashed drop zone above the list. */
export type UploadLayout = 'button' | 'dragger'

export type UploadStatus = 'uploading' | 'done' | 'error'

export interface UploadItem {
  /** Stable identity of the item. */
  uid: string
  /** File name shown in the list. */
  name: string
  /** Bytes. */
  size: number
  /** Transfer state of the item. */
  status: UploadStatus
  /** 0–100. */
  percent: number
  /** Present for files picked locally; absent on items the caller backfills from history. */
  file?: File | undefined
  /** Resolved value of `upload()`. */
  response?: unknown
  /** `Error.message` when `upload()` rejected. */
  error?: string | undefined
  /** Address of a backfilled item, for `onPreview`. */
  url?: string | undefined
}

/** Why a picked file was refused before entering the list. */
export type UploadRejectReason = 'accept' | 'size' | 'count'

export interface UploadRejection {
  /** The refused file. */
  file: File
  /** Which check refused it. */
  reason: UploadRejectReason
}

/** All user-visible text, localized by the caller. */
export interface UploadLabels {
  /** Button caption; the drop zone's title in the `dragger` layout. */
  trigger: string
  /** Caption under the trigger, e.g. ".zip only, up to 10 MB". */
  hint?: string | undefined
  /** `aria-label` of the file list. */
  list: string
  /** `aria-label` of an item's remove button. */
  remove: string
  /** `aria-label` of a failed item's retry button. */
  retry: string
  /** Status text of an item in progress; also names its progress bar. */
  uploading: string
  /** Status text of a finished item. */
  done: string
  /** Status text of a failed item. */
  error: string
}

export interface UploadProps {
  /** Default `button`. */
  layout?: UploadLayout | undefined
  /** Same grammar as the input `accept` attribute; non-matching files go to `onReject('accept')`. */
  accept?: string | undefined
  /** Default `false`: a drop of several files keeps the first. */
  multiple?: boolean | undefined
  /** Upper bound on list length; `1` makes a new file replace the current one (antd). */
  maxCount?: number | undefined
  /** Bytes; larger files go to `onReject('size')`. */
  maxSize?: number | undefined
  /** Disables picking, dropping, retry and remove. */
  disabled?: boolean | undefined
  /** Controlled list; echo `onChange` back. Omit for uncontrolled with `defaultItems`. */
  items?: UploadItem[] | undefined
  /** Initial list when uncontrolled. */
  defaultItems?: UploadItem[] | undefined
  /** Extra check after the built-in ones (e.g. a ZIP magic number); `false` or a rejection keeps the file out. */
  beforeUpload?: ((file: File, files: File[]) => boolean | Promise<boolean>) | undefined
  /**
   * The only transport hook (antd `customRequest`). Resolve → `done` with the value as `response`;
   * reject → `error` with the message. `signal` aborts when the item is removed mid-flight.
   */
  upload: (file: File, context: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<unknown>
  /** Every list change: additions, progress, completion, removal. */
  onChange?: ((items: UploadItem[]) => void) | undefined
  /** Files refused by `accept` / `maxSize` / `maxCount`, batched per pick, for the caller to toast. */
  onReject?: ((rejections: UploadRejection[]) => void) | undefined
  /** Return `false` to keep the item. */
  onRemove?: ((item: UploadItem) => boolean | Promise<boolean>) | undefined
  /** Makes file names clickable. */
  onPreview?: ((item: UploadItem) => void) | undefined
  /** Default `true`. */
  showList?: boolean | undefined
  /** All visible and screen-reader text; see `UploadLabels`. */
  labels: UploadLabels
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

/**
 * File picker with a status list: pick or drop → built-in `accept` / `maxSize` / `maxCount`
 * filter → `beforeUpload` → the item enters the list as `uploading` and `upload()` runs with a
 * progress callback and an abort signal. The component never talks to the network itself — the
 * transport (multipart POST, presigned PUT, …) belongs to the caller. Text comes
 * from `labels`; the component has no strings of its own. Client Component (state, refs),
 * aggregate entry only.
 */
export function Upload({
  layout = 'button',
  accept,
  multiple = false,
  maxCount,
  maxSize,
  disabled = false,
  items,
  defaultItems,
  beforeUpload,
  upload,
  onChange,
  onReject,
  onRemove,
  onPreview,
  showList = true,
  labels,
  className,
}: UploadProps) {
  const [ownItems, setOwnItems] = useState<UploadItem[]>(() => defaultItems ?? [])
  const list = items ?? ownItems
  // Async upload callbacks patch against the latest committed list, not the render they started in.
  const latest = useRef(list)
  latest.current = list
  const controllers = useRef(new Map<string, AbortController>())
  const mounted = useRef(true)
  const sequence = useRef(0)
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)
  const prefix = useId()

  useEffect(() => {
    mounted.current = true
    const active = controllers.current
    return () => {
      mounted.current = false
      for (const controller of active.values()) controller.abort()
      active.clear()
    }
  }, [])

  const commit = (next: UploadItem[]) => {
    latest.current = next
    if (items === undefined) setOwnItems(next)
    onChange?.(next)
  }
  const patch = (uid: string, change: Partial<UploadItem>) => {
    if (!mounted.current) return
    const index = latest.current.findIndex((item) => item.uid === uid)
    if (index === -1) return
    const next = latest.current.slice()
    next[index] = { ...next[index], ...change }
    commit(next)
  }

  const start = (uid: string, file: File) => {
    controllers.current.get(uid)?.abort()
    const controller = new AbortController()
    controllers.current.set(uid, controller)
    patch(uid, { status: 'uploading', percent: 0, error: undefined })
    upload(file, {
      onProgress: (percent) => {
        if (!controller.signal.aborted) patch(uid, { percent: Math.min(100, Math.max(0, Math.round(percent))) })
      },
      signal: controller.signal,
    }).then(
      (response) => {
        if (!controller.signal.aborted) patch(uid, { status: 'done', percent: 100, response })
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) patch(uid, { status: 'error', error: errorMessage(reason) })
      },
    )
  }

  const add = async (picked: File[]) => {
    if (disabled) return
    const candidates = multiple ? picked : picked.slice(0, 1)
    const rejections: UploadRejection[] = []
    let accepted: File[] = []
    for (const file of candidates) {
      if (accept !== undefined && !matchesAccept(file, accept)) rejections.push({ file, reason: 'accept' })
      else if (maxSize !== undefined && file.size > maxSize) rejections.push({ file, reason: 'size' })
      else accepted.push(file)
    }
    if (maxCount !== undefined) {
      const room = maxCount === 1 ? 1 : Math.max(0, maxCount - latest.current.length)
      for (const file of accepted.slice(room)) rejections.push({ file, reason: 'count' })
      accepted = accepted.slice(0, room)
    }
    if (rejections.length > 0) onReject?.(rejections)
    if (beforeUpload !== undefined) {
      const checks = await Promise.all(
        accepted.map((file) => Promise.resolve(beforeUpload(file, accepted)).catch(() => false)),
      )
      accepted = accepted.filter((_, index) => checks[index])
    }
    if (accepted.length === 0 || !mounted.current) return
    const fresh = accepted.map<UploadItem>((file) => {
      sequence.current += 1
      return {
        uid: `${prefix}-${sequence.current}`,
        name: file.name,
        size: file.size,
        status: 'uploading',
        percent: 0,
        file,
      }
    })
    if (maxCount === 1) {
      for (const item of latest.current) controllers.current.get(item.uid)?.abort()
      commit(fresh)
    } else {
      commit([...latest.current, ...fresh])
    }
    for (const item of fresh) start(item.uid, item.file!)
  }

  const remove = async (item: UploadItem) => {
    if (onRemove !== undefined && !(await onRemove(item))) return
    controllers.current.get(item.uid)?.abort()
    controllers.current.delete(item.uid)
    commit(latest.current.filter((entry) => entry.uid !== item.uid))
  }

  const open = () => {
    if (!disabled) input.current?.click()
  }
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    void add(files)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open()
    }
  }
  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }
  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    void add([...event.dataTransfer.files])
  }

  const picker = (
    <input
      ref={input}
      className={css.input}
      type="file"
      tabIndex={-1}
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      // `open()` calls `input.click()`, and that synthetic click bubbles. In the `dragger` layout the
      // input sits inside the zone whose own `onClick` is `open`, so without this the click re-enters
      // `open()` forever and the file dialog never settles.
      onClick={(event) => event.stopPropagation()}
      onChange={onInputChange}
    />
  )

  return (
    <div className={clsx(css.upload, className)}>
      {layout === 'dragger' ? (
        <div
          className={clsx(css.dropzone, dragging && css.dragging, disabled && css.disabled)}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          onClick={open}
          onKeyDown={onKeyDown}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {picker}
          <span className={css.dropIcon} aria-hidden="true">
            <UploadGlyph />
          </span>
          <span className={css.dropTitle}>{labels.trigger}</span>
          {labels.hint === undefined ? null : <span className={css.hint}>{labels.hint}</span>}
        </div>
      ) : (
        <div className={css.trigger}>
          {picker}
          <Button variant="outline" icon={<UploadGlyph />} disabled={disabled} onClick={open}>
            {labels.trigger}
          </Button>
          {labels.hint === undefined ? null : <span className={css.hint}>{labels.hint}</span>}
        </div>
      )}
      {showList && list.length > 0 ? (
        <ul className={css.list} aria-label={labels.list}>
          {list.map((item) => (
            <li key={item.uid} className={clsx(css.item, css[item.status])} data-status={item.status}>
              <span className={css.fileIcon} aria-hidden="true">
                <IconPaperclipOutlineRegular />
              </span>
              {onPreview === undefined ? (
                <span className={css.name}>{item.name}</span>
              ) : (
                <button type="button" className={clsx(css.name, css.nameButton)} onClick={() => onPreview(item)}>
                  {item.name}
                </button>
              )}
              <span className={css.actions}>
                {item.status === 'error' && item.file !== undefined ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={css.action}
                    aria-label={labels.retry}
                    disabled={disabled}
                    icon={<IconRefreshOutlineRegular />}
                    onClick={() => start(item.uid, item.file!)}
                  />
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className={css.action}
                  aria-label={labels.remove}
                  disabled={disabled}
                  icon={<IconCloseOutlineRegular />}
                  onClick={() => void remove(item)}
                />
              </span>
              <span className={css.meta}>
                <span>{formatBytes(item.size)}</span>
                <span className={css.status} role="status">
                  {statusText(item, labels)}
                </span>
              </span>
              {item.status === 'uploading' ? (
                <span
                  className={css.track}
                  role="progressbar"
                  aria-label={labels.uploading}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.percent}
                >
                  <span className={css.fill} style={{ width: `${item.percent}%` }} />
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function statusText(item: UploadItem, labels: UploadLabels): ReactNode {
  if (item.status === 'uploading') return `${labels.uploading} ${item.percent}%`
  if (item.status === 'error') return item.error === undefined || item.error === '' ? labels.error : item.error
  return labels.done
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : ''
}

/** Browser `accept` grammar: `.ext`, `type/*` or an exact MIME type, comma separated. */
function matchesAccept(file: File, accept: string): boolean {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter((rule) => rule !== '')
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule)
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
      return type === rule
    })
}

function hasFiles(event: DragEvent<HTMLElement>): boolean {
  return [...(event.dataTransfer?.types ?? [])].includes('Files')
}

/** Binary units with one decimal above KB; the unit letters are the same in every common locale. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1).replace(/\.0$/, '')} ${units[unit]}`
}

/** Tray with an up arrow, drawn like the Mark glyphs (24 grid, currentColor stroke). */
function UploadGlyph() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      <path d="M12 15V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
    </svg>
  )
}
