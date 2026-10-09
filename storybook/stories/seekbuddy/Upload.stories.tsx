import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  Upload,
  type UploadItem,
  type UploadLabels,
  type UploadProps,
  type UploadRejection,
} from '@seekbuddy/dsh-ui/seekbuddy'

const labels: UploadLabels = {
  trigger: '选择文件',
  hint: '仅支持 .zip，10 MB 以内',
  list: '已选文件',
  remove: '删除',
  retry: '重试',
  uploading: '上传中',
  done: '已上传',
  error: '上传失败',
}

/** Fake transport: ticks progress every 120 ms, resolves in ~1.5 s, honours abort. */
const simulate =
  (outcome: 'done' | 'error' = 'done'): UploadProps['upload'] =>
  (file, { onProgress, signal }) =>
    new Promise((resolve, reject) => {
      let percent = 0
      const timer = setInterval(() => {
        percent += 8
        if (signal.aborted) {
          clearInterval(timer)
          reject(new Error('aborted'))
          return
        }
        if (percent >= 100) {
          clearInterval(timer)
          if (outcome === 'error') reject(new Error(`服务端拒绝了 ${file.name}：根目录缺少 SKILL.md`))
          else resolve({ upload_id: `up_${file.name}` })
          return
        }
        onProgress(percent)
      }, 120)
    })

const meta = {
  title: 'SeekBuddy 扩展层/Upload',
  component: Upload,
  parameters: {
    docs: {
      description: {
        component: `文件**选择 + 状态列表**，props 对齐 antd Upload 的常用子集。原生 \`<input type="file">\` 没有拖拽、进度与前置校验，上游 primitives 也没有文件选择、拖拽区、进度条任何原子，所以收为扩展组件。

**组件不发请求**：仓库上传走票据三步流（领 \`put_url\` → 无头 PUT 预签名地址 → 消费），antd 的 \`action\` / \`headers\` / \`data\` 等全部不收，唯一传输口是 \`upload(file, { onProgress, signal })\`（antd 的 \`customRequest\`）。resolve 即 \`done\`（返回值进 \`item.response\`），reject 即 \`error\`（\`Error.message\` 进 \`item.error\`）；删除在途项先 \`abort()\`；错误项带重试按钮重新调 \`upload\`。要在真实链路上看到进度，调用方的 PUT 得用 XHR 监听 \`upload.onprogress\`，这不在组件里。

**流程**：选择 / 拖入 → 内置 \`accept\` / \`maxSize\` / \`maxCount\` 过滤，被拒的汇总一次 \`onReject([{ file, reason }])\` 交给调用方弹 toast → \`beforeUpload(file, files)\` 自定义校验（如 ZIP 魔数）→ 进列表为 \`uploading\` 并立即上传 → 每次列表变化 \`onChange(items)\`。\`maxCount=1\` 时新文件替换旧文件并中止其上传（antd）；\`multiple\` 默认 false，拖入多个只留第一个。\`items\` / \`defaultItems\` 受控或非受控二选一。

**两种布局**：\`button\`（上游 outline \`Button\` 当触发器 + 列表）和 \`dragger\`（虚线拖拽区 + 列表，点击、Enter / Space 也能打开选择框；\`dragenter\` / \`dragleave\` 在框上计数，不挂 document）。**不收** antd 的 \`picture\` / \`picture-card\` / \`picture-circle\`（仓库暂无图片上传场景，聊天附件由上游接管）、\`directory\`、\`pastable\`、\`itemRender\` / \`iconRender\`、\`showUploadList\` 子选项、\`progress\` 定制。

**文案全部来自 \`labels\`**（触发器 / 提示 / 列表 aria / 删除 / 重试 / 三种状态），组件无自然语言字。每项的状态文字是 \`role="status"\`，进度条是 \`role="progressbar"\` + \`aria-valuenow\`。

**token**：虚线框 \`--dsw-alias-border-l2\`（与 Empty 同），拖入高亮与进度填充 \`--dsw-alias-state-business-primary\`，进度轨道 \`--dsw-alias-interactive-bg-active\`，错误 \`--dsw-alias-state-error-primary\`，大小与提示 \`--dsw-alias-label-tertiary\`。有 Hook，只从聚合入口取。`,
      },
    },
  },
  args: { layout: 'button', labels, upload: simulate() },
  argTypes: {
    layout: { control: 'inline-radio', options: ['button', 'dragger'] },
    labels: { control: false },
    upload: { control: false },
    items: { control: false },
    defaultItems: { control: false },
    beforeUpload: { control: false },
    onChange: { control: false },
    onReject: { control: false },
    onRemove: { control: false },
    onPreview: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Upload>
export default meta
type Story = StoryObj<typeof meta>

/** 单个上传：`maxCount={1}`，再选一个会替换前一个并中止其上传。选几个文件看进度条走完。 */
export const Single: Story = {
  args: { maxCount: 1, accept: '.zip', maxSize: 10 * 1024 * 1024 },
}

/** 批量：`multiple`，按钮布局，每个文件各自一条进度。 */
export const Multiple: Story = {
  args: { multiple: true },
}

/** 拖拽区：`layout="dragger"`，拖文件进框边框与图标变蓝；也可点击或 Enter / Space 打开选择框。 */
export const Dragger: Story = {
  args: { layout: 'dragger', multiple: true },
}

/** 失败与重试：模拟服务端拒绝，错误项文件名变红、显示错误文案，重试按钮重新走 `upload`。 */
export const Failure: Story = {
  args: { layout: 'dragger', multiple: true, upload: simulate('error') },
}

/** `accept` + `maxSize` + `maxCount`：被拒的文件不进列表，通过 `onReject` 汇总给调用方（这里打到下面的面板）。试着选一个非 zip 或第三个文件。 */
export const Rejections: Story = {
  render: (args) => {
    const [log, setLog] = useState<string[]>([])
    const describe = (rejection: UploadRejection) =>
      `${rejection.file.name}：${rejection.reason === 'accept' ? '类型不允许' : rejection.reason === 'size' ? '超过 1 MB' : '超过 2 个'}`
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Upload
          {...args}
          multiple
          accept=".zip,.tgz"
          maxSize={1024 * 1024}
          maxCount={2}
          labels={{ ...labels, hint: '.zip / .tgz，1 MB 以内，最多 2 个' }}
          onReject={(rejections) => setLog((previous) => [...previous, ...rejections.map(describe)])}
        />
        <ul
          style={{
            margin: 0,
            paddingLeft: 16,
            color: 'var(--dsw-alias-state-error-primary)',
            font: 'var(--dsw-font-xs-13)',
          }}
        >
          {log.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    )
  },
}

/** 受控 `items` 回填历史项：没有 `file` 的项不能重试，点文件名走 `onPreview`。 */
export const Controlled: Story = {
  render: (args) => {
    const [items, setItems] = useState<UploadItem[]>([
      { uid: 'h1', name: 'weather-plugin-1.2.0.zip', size: 184_320, status: 'done', percent: 100, url: '#weather' },
      { uid: 'h2', name: 'notes-plugin-0.9.1.zip', size: 2_411_724, status: 'error', percent: 0, error: '校验未通过' },
    ])
    return (
      <Upload
        {...args}
        layout="dragger"
        multiple
        items={items}
        onChange={setItems}
        onPreview={(item) => window.alert(`${item.name} → ${item.url ?? '(本地文件)'}`)}
      />
    )
  },
}

/** 禁用：触发器与列表操作全部禁用（含在途项），拖入 `dropEffect` 为 none。 */
export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Upload {...args} disabled />
      <Upload
        {...args}
        layout="dragger"
        disabled
        defaultItems={[
          { uid: 'd1', name: 'archive.zip', size: 51_200, status: 'done', percent: 100 },
          { uid: 'd2', name: 'pending.zip', size: 3_145_728, status: 'uploading', percent: 40 },
        ]}
      />
    </div>
  ),
}
