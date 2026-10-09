# Upload

[English](upload.md) | 中文

带状态列表的文件选择组件，实现了 antd `Upload` 的常用子集。选择或拖入文件后，内置的 `accept` / `maxSize` / `maxCount` 检查与你的 `beforeUpload` 依次过滤；每个通过的文件以 `uploading` 状态进入列表，并调用你的 `upload()` 函数，传入进度回调和中止信号。

组件本身从不发起网络请求。multipart POST、预签名 PUT 或其他任何方式，都由你的 `upload()` 函数实现。

```tsx
import { Upload } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 示例

```tsx
import { Upload, type UploadLabels, type UploadProps } from '@seekbuddy/dsh-ui/seekbuddy'

const labels: UploadLabels = {
  trigger: 'Choose a file',
  hint: '.zip only, up to 10 MB',
  list: 'Selected files',
  remove: 'Remove',
  retry: 'Retry',
  uploading: 'Uploading',
  done: 'Uploaded',
  error: 'Upload failed',
}

// XMLHttpRequest reports upload progress; fetch() does not.
const upload: UploadProps['upload'] = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/packages')
    request.upload.onprogress = (event) => onProgress((event.loaded / event.total) * 100)
    request.onload = () =>
      request.status < 300 ? resolve(JSON.parse(request.responseText)) : reject(new Error(request.statusText))
    request.onerror = () => reject(new Error('Network error'))
    signal.addEventListener('abort', () => request.abort())
    const body = new FormData()
    body.append('file', file)
    request.send(body)
  })

export function PackageUpload({ toast }: { toast: (text: string) => void }) {
  return (
    <Upload
      layout="dragger"
      accept=".zip"
      maxSize={10 * 1024 * 1024}
      maxCount={1}
      upload={upload}
      onReject={(rejections) => toast(rejections.map((r) => `${r.file.name}: ${r.reason}`).join('\n'))}
      labels={labels}
    />
  )
}
```

## 行为

- **布局：**`button` 在列表上方放一个描边触发按钮；`dragger` 在同一位置放一个虚线拖放区，它也可以点击，并能通过键盘聚焦。
- **检查顺序：**`accept`（语法与 input 的同名属性相同）、`maxSize`、`maxCount`，最后是 `beforeUpload`。被前三项拒绝的文件会连同原因（`accept`、`size`、`count`）一并报给 `onReject`；被 `beforeUpload` 拒绝的文件会被静默丢弃，需要提示的话在那里自行处理。没有 `multiple` 时，一次拖入多个文件只考虑第一个。
- **`maxCount={1}`** 时，新文件会替换当前文件，与 antd 相同。
- **结果：**`upload()` resolve 时，该项变为 `done`，resolve 的值存为 `response`；reject 时变为 `error` 并带上错误信息，这一行会显示重试按钮。
- **中止：**上传过程中移除某一项会中止它的 `signal`；组件卸载时会中止所有进行中的上传。`onRemove` 返回 `false`（或 resolve 为 `false` 的 Promise）可以保留该项。
- **受控列表：**传入 `items` 并在 `onChange` 中更新，比如用来展示之前已上传的文件（`status: 'done'` 并带 `url`）。没有 `file` 的项无法重试。传入 `onPreview` 后，文件名可以点击。

## 可访问性

列表以 `labels.list` 命名。每一行的状态文字是 `role="status"` 区域，进度条是带 `aria-valuenow` 的 `role="progressbar"`，以 `labels.uploading` 命名。移除和重试是图标按钮，分别以 `labels.remove` 和 `labels.retry` 命名。

## API

<!-- api:props Upload -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `layout` | `"button" \| "dragger"` | `button` | Default `button`. |
| `accept` | `string` |  | Same grammar as the input `accept` attribute; non-matching files go to `onReject('accept')`. |
| `multiple` | `boolean` | `false` | Default `false`: a drop of several files keeps the first. |
| `maxCount` | `number` |  | Upper bound on list length; `1` makes a new file replace the current one (antd). |
| `maxSize` | `number` |  | Bytes; larger files go to `onReject('size')`. |
| `disabled` | `boolean` | `false` | Disables picking, dropping, retry and remove. |
| `items` | `UploadItem[]` |  | Controlled list; echo `onChange` back. Omit for uncontrolled with `defaultItems`. |
| `defaultItems` | `UploadItem[]` |  | Initial list when uncontrolled. |
| `beforeUpload` | `(file: File, files: File[]) => boolean \| Promise<boolean>` |  | Extra check after the built-in ones (e.g. a ZIP magic number); `false` or a rejection keeps the file out. |
| `upload` | `(file: File, context: { onProgress: (percent: number) => void; signal: AbortSignal; }) => Promise<unknown>` | **required** | The only transport hook (antd `customRequest`). Resolve → `done` with the value as `response`; reject → `error` with the message. `signal` aborts when the item is removed mid-flight. |
| `onChange` | `(items: UploadItem[]) => void` |  | Every list change: additions, progress, completion, removal. |
| `onReject` | `(rejections: UploadRejection[]) => void` |  | Files refused by `accept` / `maxSize` / `maxCount`, batched per pick, for the caller to toast. |
| `onRemove` | `(item: UploadItem) => boolean \| Promise<boolean>` |  | Return `false` to keep the item. |
| `onPreview` | `(item: UploadItem) => void` |  | Makes file names clickable. |
| `showList` | `boolean` | `true` | Default `true`. |
| `labels` | `UploadLabels` | **required** | All visible and screen-reader text; see `UploadLabels`. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### UploadItem

<!-- api:type UploadItem -->
| Field | Type | Description |
| --- | --- | --- |
| `uid` | `string` | Stable identity of the item. |
| `name` | `string` | File name shown in the list. |
| `size` | `number` | Bytes. |
| `status` | `UploadStatus` | Transfer state of the item. |
| `percent` | `number` | 0–100. |
| `file?` | `File` | Present for files picked locally; absent on items the caller backfills from history. |
| `response?` | `unknown` | Resolved value of `upload()`. |
| `error?` | `string` | `Error.message` when `upload()` rejected. |
| `url?` | `string` | Address of a backfilled item, for `onPreview`. |
<!-- /api -->

### UploadLabels

<!-- api:type UploadLabels -->
All user-visible text, localized by the caller.

| Field | Type | Description |
| --- | --- | --- |
| `trigger` | `string` | Button caption; the drop zone's title in the `dragger` layout. |
| `hint?` | `string` | Caption under the trigger, e.g. ".zip only, up to 10 MB". |
| `list` | `string` | `aria-label` of the file list. |
| `remove` | `string` | `aria-label` of an item's remove button. |
| `retry` | `string` | `aria-label` of a failed item's retry button. |
| `uploading` | `string` | Status text of an item in progress; also names its progress bar. |
| `done` | `string` | Status text of a finished item. |
| `error` | `string` | Status text of a failed item. |
<!-- /api -->

### UploadRejection

<!-- api:type UploadRejection -->
| Field | Type | Description |
| --- | --- | --- |
| `file` | `File` | The refused file. |
| `reason` | `UploadRejectReason` | Which check refused it. |
<!-- /api -->

### UploadRejectReason

<!-- api:type UploadRejectReason -->
Why a picked file was refused before entering the list.

```ts
type UploadRejectReason = 'accept' | 'size' | 'count'
```
<!-- /api -->

### UploadLayout

<!-- api:type UploadLayout -->
`button`: a trigger button above the list. `dragger`: a dashed drop zone above the list.

```ts
type UploadLayout = 'button' | 'dragger'
```
<!-- /api -->

### UploadStatus

<!-- api:type UploadStatus -->
```ts
type UploadStatus = 'uploading' | 'done' | 'error'
```
<!-- /api -->
