import type { Meta, StoryObj } from '@storybook/react-vite'
import { QrCode } from '@seekbuddy/dsh-ui/seekbuddy'

/** 钉钉那类连接器真实发下来的授权链接（194 字节，编到版本 9）。 */
const AUTH_URL =
  'https://auth.example.com/oauth2/authorize?client_id=abcdef1234567890&response_type=code&scope=openid&state=cli-login&redirect_uri=https%3A%2F%2Fapp.example.com%2Foauth%2Fcallback%2Fqr-login'

const meta = {
  title: 'SeekBuddy 扩展层/QrCode',
  component: QrCode,
  parameters: {
    docs: {
      description: {
        component: `把一段文本编成二维码画出来，典型用法是让用户拿手机扫一条授权链接。

**为什么不装库**：扩展层与插件的浏览器半边都要内联发布，\`qrcode\` 这类成熟实现带 canvas / fs 的 Node 面，整包拉进来只为画一张码不划算。所以编码规则直接写成约 330 行零依赖纯函数。

**刻意收窄的范围**，够用即止，超出时不画码而是渲染 \`fallback\`：只做 **byte 模式**（授权 URL 大小写混排，用不上 alphanumeric 的省位）、只做**纠错等级 M**（屏幕上扫 15% 冗余足够）、只做**版本 1–20**（≤666 字节；再大的码在弹窗里也扫不动）。空串同样回 \`fallback\`。

**正确性**：不靠「看着像个码」——\`tests/qr.test.mjs\` 拿成熟实现 \`qrcode\` 的输出当参照物**逐模块比对**（版本、尺寸、每个模块都要一致），参照数据一次性生成后钉进测试文件，线上包不带这个依赖。开发期正是这套比对揪出了两个肉眼看不出的 bug：格式信息两份拷贝的坐标轴写反、罚分规则 3 两侧都留白时该记两次。

**编码器不对外导出**：聚合入口 \`dist/seekbuddy.js\` 只许转发、不能自带运行时代码（构建断言 \`assertAggregateForwardsOnly\`），所以 \`encodeQr\` 保持内部，调用方给文本、拿图。

**渲染**：**一条 \`path\` 画完所有黑块**（版本 20 有 9409 个模块，铺成近万个 \`rect\` 会让弹窗肉眼可见卡一下）；四周留 **4 个模块静区**（规范要求，贴着深色背景没静区扫不出）；\`role="img"\` + 必填 \`label\`（调用方本地化），\`shapeRendering="crispEdges"\`。

**黑白是写死的字面量，不走 token**：二维码的黑白是**功能**不是主题，跟着深色模式翻转就扫不出来了，白底还兼作静区。切到深色主题看这几张码——它们应当**不变**。`,
      },
    },
  },
  args: { text: 'https://seekbuddy.example/connect?state=demo', label: '扫码授权', size: 180 },
  argTypes: {
    size: { control: { type: 'range', min: 80, max: 320, step: 20 } },
    fallback: { control: false },
  },
} satisfies Meta<typeof QrCode>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：一条短链接，180px。切换明暗主题，码本身不应有任何变化。 */
export const Default: Story = {}

/** 短文本：9 个字节编到版本 1（21×21），是这个编码器画得出的最小的码。 */
export const ShortText: Story = {
  args: { text: 'SEEKBUDDY', label: '扫码授权' },
}

/** 真实授权链接：194 字节，模块密得多；这是授权链接的实际形态。 */
export const AuthUrl: Story = {
  args: { text: AUTH_URL, label: '扫码授权' },
}

/** 编不出来就退回 `fallback`：667 字节超出版本 20 的上限（666），空串同理。宁可给一条能点的链接，也不画一张扫不出来的码。 */
export const Fallback: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12, font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>
      <span>667 字节（超出版本 20）：</span>
      <QrCode {...args} text={'x'.repeat(667)} fallback={<a href="https://seekbuddy.example">打开授权链接</a>} />
      <span>空串：</span>
      <QrCode {...args} text="" fallback={<a href="https://seekbuddy.example">打开授权链接</a>} />
      <span>不给 fallback 时什么都不渲染（下面是空的）：</span>
      <QrCode {...args} text="" />
    </div>
  ),
}

/** `size` 只改 SVG 的宽高，模块数不变——码是矢量的，放大不糊。弹窗里用 160–200 较稳妥。 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
      {[96, 140, 180, 240].map((size) => (
        <figure key={size} style={{ margin: 0, display: 'grid', gap: 6, justifyItems: 'center' }}>
          <QrCode {...args} size={size} />
          <figcaption style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>
            {size}px
          </figcaption>
        </figure>
      ))}
    </div>
  ),
}
