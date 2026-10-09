# QrCode

[English](qr-code.md) | 中文

把一段字符串画成 SVG 二维码，没有运行时依赖。典型用法：让用户用手机扫描登录或授权链接。

```tsx
import { QrCode } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 示例

```tsx
import { QrCode } from '@seekbuddy/dsh-ui/seekbuddy'

export function ScanToSignIn({ url }: { url: string }) {
  return (
    <QrCode
      text={url}
      label="QR code for signing in on your phone"
      size={200}
      fallback={<a href={url}>Open the sign-in link</a>}
    />
  )
}
```

## 范围

编码器刻意保持精简，只覆盖扫描链接所需的部分：

- **byte 模式**，所以任意 UTF-8 文本都可以编码。
- **纠错等级 M**（约 15% 冗余），足够从屏幕上扫描。
- **版本 1–20**，最多 666 字节。空文本或更长的文本无法编码，此时改为渲染 `fallback`（不传则什么都不渲染），所以请在这里以文字形式给出链接。

无论哪种主题，二维码始终是白底黑码，四周留 4 个模块的静区：扫码需要足够的对比度，所以它不跟随主题 token。整个码用一条 SVG path 绘制，大尺寸的码渲染开销也很小。

单元测试（`tests/qr.test.mjs`）会把编码器的输出与广泛使用的 `qrcode` 包逐模块比对。

## 可访问性

SVG 是一张以 `label` 命名的图片。请说明这个码是做什么用的，而不只是写「二维码」。

## API

<!-- api:props QrCode -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | **required** | Text to encode (byte mode, up to 666 bytes). |
| `label` | `string` | **required** | Accessible name of the image; localized by the caller. |
| `fallback` | `ReactNode` |  | Rendered instead when the text cannot be encoded (empty or too long), typically the link as text. Renders nothing when omitted. |
| `size` | `number` | `180` | Edge length in px. Default 180. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->
