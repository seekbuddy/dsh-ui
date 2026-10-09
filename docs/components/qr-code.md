# QrCode

English | [中文](qr-code.zh.md)

Draws a QR code for a string as an SVG, with no runtime dependency. Typical use: let a user scan a sign-in or authorization link with their phone.

```tsx
import { QrCode } from '@seekbuddy/dsh-ui/seekbuddy'
```

## Example

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

## Scope

The encoder is deliberately small and covers what scanning a link needs:

- **Byte mode**, so any UTF-8 text works.
- **Error-correction level M** (about 15% redundancy), enough for scanning from a screen.
- **Versions 1–20**, up to 666 bytes. Empty text or longer text cannot be encoded, and `fallback` renders instead (nothing if you omit it), so pass the link as text there.

The code is always black on white with a 4-module quiet zone, in both themes: scanners need the contrast, so it does not follow the theme tokens. It is drawn as a single SVG path, which keeps large codes cheap to render.

The encoder's output is compared module by module with the widely used `qrcode` package in the unit tests (`tests/qr.test.mjs`).

## Accessibility

The SVG is an image named by `label`. Say what the code is for, not just "QR code".

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
