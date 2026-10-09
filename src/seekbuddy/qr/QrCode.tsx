/**
 * 把 QR 矩阵画成一张 SVG。
 *
 * 画法上两个取舍：
 * - **一条 `path` 画完所有黑块**，而不是每个模块一个 `rect`：版本 20 有 9409 个模块，
 *   铺成近万个节点会让弹窗肉眼可见地卡一下；
 * - **留 4 个模块的静区**（规范要求），否则贴着深色背景的码扫不出来。
 *
 * **编码在组件内做**：聚合入口只许转发（`dist/seekbuddy.js` 不能自带运行时代码），
 * 所以纯函数 `encodeQr` 不对外导出，调用方给文本、拿图。编不出来（空串或超出版本 20）时
 * 渲染 `fallback`——典型是一条明文链接，宁可退回链接也不画一张扫不出来的码。
 *
 * @module
 */

import { useMemo, type ReactNode } from 'react'
import clsx from 'clsx'
import { encodeQr } from './qr.ts'
import css from './QrCode.module.css'

/** 静区：规范要求码四周留 4 个模块的空白 */
const QUIET = 4

/**
 * QrCode 属性契约
 */
export interface QrCodeProps {
  /** Text to encode (byte mode, up to 666 bytes). */
  text: string
  /** Accessible name of the image; localized by the caller. */
  label: string
  /** Rendered instead when the text cannot be encoded (empty or too long), typically the link as text. Renders nothing when omitted. */
  fallback?: ReactNode | undefined
  /** Edge length in px. Default 180. */
  size?: number | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

/**
 * QR code drawn as a single-path SVG with a 4-module quiet zone, black on white in both themes
 * (scanners need the contrast, so no theme tokens). Encodes in byte mode at error-correction
 * level M, versions 1–20. Text that cannot be encoded (empty, or over 666 bytes) renders
 * `fallback` instead.
 */
export function QrCode({ text, label, fallback, size = 180, className }: QrCodeProps) {
  const drawing = useMemo(() => {
    const matrix = encodeQr(text)
    if (matrix === null) return null
    // 每个黑模块一段子路径：移到左上角，画一个 1×1 的方块
    let path = ''
    for (let y = 0; y < matrix.size; y += 1) {
      for (let x = 0; x < matrix.size; x += 1) {
        if (matrix.modules[y * matrix.size + x]) path += `M${String(x + QUIET)} ${String(y + QUIET)}h1v1h-1z`
      }
    }
    return { path, extent: matrix.size + QUIET * 2 }
  }, [text])

  if (drawing === null) return fallback ?? null

  return (
    <svg
      className={clsx(css.qr, className)}
      width={size}
      height={size}
      viewBox={`0 0 ${String(drawing.extent)} ${String(drawing.extent)}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      {/* 黑白是**功能**不是主题：跟着深色模式翻转就扫不出来了，所以这两处颜色字面量是刻意的，
          不要「顺手」换成 --dsw-* token。白底同时兼作静区的底。 */}
      <rect width={drawing.extent} height={drawing.extent} fill="#fff" />
      <path d={drawing.path} fill="#000" />
    </svg>
  )
}
