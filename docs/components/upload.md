# Upload

English | [中文](upload.zh.md)

A file picker with a status list, following the commonly used subset of antd's `Upload`. Pick or drop files; built-in `accept` / `maxSize` / `maxCount` checks and your `beforeUpload` filter them; each accepted file enters the list as `uploading` and your `upload()` function runs with a progress callback and an abort signal.

The component never talks to the network itself. Multipart POST, presigned PUT or anything else is your `upload()` function.

```tsx
import { Upload } from '@seekbuddy/dsh-ui/seekbuddy'
```

## Example

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

## Behaviour

- **Layouts:** `button` puts an outline trigger button above the list; `dragger` puts a dashed drop zone there, which is also clickable and keyboard-focusable.
- **Checks, in order:** `accept` (same syntax as the input attribute), `maxSize`, `maxCount`, then `beforeUpload`. Files refused by the first three are reported together to `onReject` with a reason (`accept`, `size`, `count`); files refused by `beforeUpload` are dropped silently, so report them there. Without `multiple`, only the first of several dropped files is considered.
- **`maxCount={1}`** replaces the current file with the new one, as in antd.
- **Result:** when `upload()` resolves, the item becomes `done` with the resolved value as `response`; when it rejects, `error` with the error's message, and the row shows a retry button.
- **Abort:** removing an item while it uploads aborts its `signal`; unmounting the component aborts every upload in flight. `onRemove` can return `false` (or a promise of `false`) to keep the item.
- **Controlled list:** pass `items` and update it from `onChange`, for example to show files uploaded earlier (`status: 'done'` with a `url`). Items without a `file` cannot be retried. `onPreview` makes file names clickable.

## Accessibility

The list is named by `labels.list`. Each row's status text is a `role="status"` region and the progress bar is a `role="progressbar"` with `aria-valuenow`, named by `labels.uploading`. Remove and retry are icon buttons named by `labels.remove` and `labels.retry`.

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
