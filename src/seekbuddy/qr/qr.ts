/**
 * 最小 QR 编码器：把一段文本编成 QR 的模块矩阵，纯函数、无依赖、不碰 DOM。
 *
 * **为什么自己写而不是装一个库**：扩展组件会被使用方整份打进浏览器包；
 * 现成的 QR 库要么带 canvas / fs 这类 Node 面（`qrcode` 就是），要么整包拉进来只为画一张码。
 * 而要画的东西非常单一——一段链接——把编码规则直接写下来更省也更可控。
 *
 * **刻意收窄的范围**（够用即止，超出范围时返回 null，由调用方退回纯链接）：
 * - 只做 **byte 模式**：要编的是 URL，大小写混排，用不上 alphanumeric 那套省位；
 * - 只做 **纠错等级 M**：屏幕上扫，15% 冗余足够，也让分块表只需要一列；
 * - 只做 **版本 1–20**（≤666 字节）：链接几百字符封顶，再长的码在屏幕上也难扫。
 *
 * 实现按 ISO/IEC 18004 的常规步骤：选版本 → 拼比特流 → 分块算 RS 纠错 → 交错 →
 * 铺功能图形 → 之字形填数据 → 八种掩模挑罚分最低的 → 写格式信息（v≥7 再写版本信息）。
 *
 * 正确性不靠「看起来像个码」：`tests/qr.test.mjs` 拿 `qrcode` 这个成熟实现当参照物，
 * 逐版本比对整张矩阵（版本、掩模、每一个模块都要一致）。分块表与对齐图形表写错会当场露出来。
 *
 * @module
 */

/** 支持到的最大版本（再大在屏幕上就难扫了） */
const MAX_VERSION = 20

/** 纠错等级 M 的格式信息位（写死一列，够用） */
const EC_LEVEL_BITS = 0b00

/**
 * 纠错等级 M 的分块表，下标即版本号（`[0]` 占位）。
 * 每项：`[每块纠错码字数, 第一组块数, 第一组每块数据码字, 第二组块数, 第二组每块数据码字]`
 */
const EC_BLOCKS: readonly (readonly [number, number, number, number, number])[] = [
  [0, 0, 0, 0, 0],
  [10, 1, 16, 0, 0],
  [16, 1, 28, 0, 0],
  [26, 1, 44, 0, 0],
  [18, 2, 32, 0, 0],
  [24, 2, 43, 0, 0],
  [16, 4, 27, 0, 0],
  [18, 4, 31, 0, 0],
  [22, 2, 38, 2, 39],
  [22, 3, 36, 2, 37],
  [26, 4, 43, 1, 44],
  [30, 1, 50, 4, 51],
  [22, 6, 36, 2, 37],
  [22, 8, 37, 1, 38],
  [24, 4, 40, 5, 41],
  [24, 5, 41, 5, 42],
  [28, 7, 45, 3, 46],
  [28, 10, 46, 1, 47],
  [26, 9, 43, 4, 44],
  [26, 3, 44, 11, 45],
  [26, 3, 41, 13, 42],
]

/** 对齐图形的中心坐标，下标即版本号；版本 1 没有对齐图形 */
const ALIGNMENT: readonly (readonly number[])[] = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
]

// ── GF(256) ────────────────────────────────────────────────────────────────
// Reed-Solomon 在 GF(256) 上做乘除；本原多项式 0x11d。预生成对数表，乘法退化成加法。

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let value = 1
  for (let index = 0; index < 255; index += 1) {
    EXP[index] = value
    LOG[value] = index
    value <<= 1
    if (value & 0x100) value ^= 0x11d
  }
  for (let index = 255; index < 512; index += 1) EXP[index] = EXP[index - 255]
}

/**
 * GF(256) 乘法。
 *
 * @param a - 乘数
 * @param b - 乘数
 * @returns 积
 */
function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]
}

/**
 * 生成多项式：`(x - α^0)(x - α^1)…(x - α^(n-1))` 的系数。
 *
 * @param degree - 纠错码字数
 * @returns 系数（高次在前）
 */
function generator(degree: number): Uint8Array {
  let poly = new Uint8Array([1])
  for (let index = 0; index < degree; index += 1) {
    const next = new Uint8Array(poly.length + 1)
    for (let position = 0; position < poly.length; position += 1) {
      next[position] = next[position] ^ poly[position]
      next[position + 1] = next[position + 1] ^ gfMul(poly[position], EXP[index])
    }
    poly = next
  }
  return poly
}

/**
 * 一个块的纠错码字。
 *
 * @param data - 该块的数据码字
 * @param ecCount - 纠错码字数
 * @returns 纠错码字
 */
function remainder(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = generator(ecCount)
  const buffer = new Uint8Array(data.length + ecCount)
  buffer.set(data)
  for (let index = 0; index < data.length; index += 1) {
    const factor = buffer[index]
    if (factor === 0) continue
    for (let position = 1; position < gen.length; position += 1) {
      buffer[index + position] = buffer[index + position] ^ gfMul(gen[position], factor)
    }
  }
  return buffer.slice(data.length)
}

// ── 比特流 ─────────────────────────────────────────────────────────────────

/** 追加比特用的可增长缓冲 */
class Bits {
  readonly values: number[] = []

  /**
   * 追加 `length` 位。
   *
   * @param value - 数值
   * @param length - 位数
   */
  push(value: number, length: number): void {
    for (let index = length - 1; index >= 0; index -= 1) this.values.push((value >>> index) & 1)
  }
}

/**
 * 某版本在 byte 模式、等级 M 下能装多少字节。
 *
 * @param version - 版本号
 * @returns 可装字节数
 */
function capacityOf(version: number): number {
  const [ecCount, blocks1, data1, blocks2, data2] = EC_BLOCKS[version]
  const dataCodewords = blocks1 * data1 + blocks2 * data2
  void ecCount
  const countBits = version < 10 ? 8 : 16
  return Math.floor((dataCodewords * 8 - 4 - countBits) / 8)
}

/**
 * 拼出交错后的完整码字序列（数据 + 纠错）。
 *
 * @param bytes - 待编码字节
 * @param version - 版本号
 * @returns 码字序列
 */
function codewordsOf(bytes: Uint8Array, version: number): Uint8Array {
  const [ecCount, blocks1, data1, blocks2, data2] = EC_BLOCKS[version]
  const dataTotal = blocks1 * data1 + blocks2 * data2

  // 模式指示符 0100 + 字符计数 + 内容
  const bits = new Bits()
  bits.push(0b0100, 4)
  bits.push(bytes.length, version < 10 ? 8 : 16)
  for (const byte of bytes) bits.push(byte, 8)
  // 结束符最多 4 个 0，再补到整字节
  const terminator = Math.min(4, dataTotal * 8 - bits.values.length)
  bits.push(0, terminator)
  while (bits.values.length % 8 !== 0) bits.values.push(0)

  const data = new Uint8Array(dataTotal)
  for (let index = 0; index < bits.values.length / 8; index += 1) {
    let byte = 0
    for (let offset = 0; offset < 8; offset += 1) byte = (byte << 1) | bits.values[index * 8 + offset]
    data[index] = byte
  }
  // 剩余位置交替填 0xEC / 0x11
  for (let index = bits.values.length / 8; index < dataTotal; index += 1) {
    data[index] = (index - bits.values.length / 8) % 2 === 0 ? 0xec : 0x11
  }

  // 按组切块，各自算纠错
  const dataBlocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []
  let cursor = 0
  for (const [count, size] of [
    [blocks1, data1],
    [blocks2, data2],
  ] as const) {
    for (let index = 0; index < count; index += 1) {
      const block = data.slice(cursor, cursor + size)
      cursor += size
      dataBlocks.push(block)
      ecBlocks.push(remainder(block, ecCount))
    }
  }

  // 交错：先按列取数据码字，再按列取纠错码字
  const out: number[] = []
  const maxData = Math.max(data1, data2)
  for (let index = 0; index < maxData; index += 1) {
    for (const block of dataBlocks) if (index < block.length) out.push(block[index])
  }
  for (let index = 0; index < ecCount; index += 1) {
    for (const block of ecBlocks) out.push(block[index])
  }
  return new Uint8Array(out)
}

// ── 矩阵 ───────────────────────────────────────────────────────────────────

/** 构建中的矩阵：`modules` 是黑白，`reserved` 标记功能图形（数据不能落在上面） */
interface Grid {
  readonly size: number
  readonly modules: Uint8Array
  readonly reserved: Uint8Array
}

/**
 * 落一个模块并标记为功能图形。
 *
 * @param grid - 矩阵
 * @param x - 列
 * @param y - 行
 * @param dark - 是否为黑
 */
function put(grid: Grid, x: number, y: number, dark: boolean): void {
  grid.modules[y * grid.size + x] = dark ? 1 : 0
  grid.reserved[y * grid.size + x] = 1
}

/**
 * 铺功能图形：定位、分隔、对齐、定时、暗模块，并为格式 / 版本信息占位。
 *
 * @param version - 版本号
 * @returns 铺好功能图形的矩阵
 */
function functionPatterns(version: number): Grid {
  const size = version * 4 + 17
  const grid: Grid = { size, modules: new Uint8Array(size * size), reserved: new Uint8Array(size * size) }

  // 三个定位图形 + 分隔带
  for (const [ox, oy] of [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ] as const) {
    for (let y = -1; y <= 7; y += 1) {
      for (let x = -1; x <= 7; x += 1) {
        const px = ox + x
        const py = oy + y
        if (px < 0 || py < 0 || px >= size || py >= size) continue
        const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3))
        put(grid, px, py, x >= 0 && x <= 6 && y >= 0 && y <= 6 && ring !== 2)
      }
    }
  }

  // 对齐图形（与定位图形重叠的位置跳过）
  const centers = ALIGNMENT[version]
  for (const cy of centers) {
    for (const cx of centers) {
      if ((cx === 6 && cy === 6) || (cx === 6 && cy === size - 7) || (cx === size - 7 && cy === 6)) continue
      for (let y = -2; y <= 2; y += 1) {
        for (let x = -2; x <= 2; x += 1) {
          put(grid, cx + x, cy + y, Math.max(Math.abs(x), Math.abs(y)) !== 1)
        }
      }
    }
  }

  // 定时图形
  for (let index = 8; index < size - 8; index += 1) {
    put(grid, index, 6, index % 2 === 0)
    put(grid, 6, index, index % 2 === 0)
  }

  // 固定的暗模块
  put(grid, 8, size - 8, true)

  // 格式信息占位（值稍后按掩模写）
  for (let index = 0; index < 9; index += 1) {
    if (index !== 6) put(grid, index, 8, false)
    if (index !== 6) put(grid, 8, index, false)
  }
  for (let index = 0; index < 8; index += 1) {
    put(grid, size - 1 - index, 8, false)
    if (index < 7) put(grid, 8, size - 1 - index, false)
  }

  // 版本信息占位（v7 起）
  if (version >= 7) {
    for (let index = 0; index < 18; index += 1) {
      const a = Math.floor(index / 3)
      const b = (index % 3) + size - 11
      put(grid, a, b, false)
      put(grid, b, a, false)
    }
  }
  return grid
}

/**
 * 之字形铺数据位：从右下角起，每次两列，右列先于左列，方向逐列翻转。
 *
 * @param grid - 已铺功能图形的矩阵
 * @param codewords - 交错后的码字
 */
function placeData(grid: Grid, codewords: Uint8Array): void {
  const { size } = grid
  let bit = 0
  let upward = true
  for (let right = size - 1; right >= 1; right -= 2) {
    // 第 6 列是竖直定时图形，整列跳过（列号要再左移一格）
    const column = right <= 6 ? right - 1 : right
    for (let step = 0; step < size; step += 1) {
      const y = upward ? size - 1 - step : step
      for (const x of [column, column - 1]) {
        if (grid.reserved[y * size + x] === 1) continue
        const byte = codewords[bit >>> 3]
        const dark = byte !== undefined && ((byte >>> (7 - (bit & 7))) & 1) === 1
        grid.modules[y * size + x] = dark ? 1 : 0
        bit += 1
      }
    }
    upward = !upward
  }
}

/** 八种掩模条件 */
const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

/**
 * 罚分：连续同色、2×2 同色块、类定位图形、黑白比例失衡。
 *
 * @param modules - 掩模后的模块
 * @param size - 边长
 * @returns 罚分
 */
function penalty(modules: Uint8Array, size: number): number {
  let score = 0
  const at = (x: number, y: number) => modules[y * size + x]

  // 规则 1：同色连续 ≥5
  for (let line = 0; line < size; line += 1) {
    for (const horizontal of [true, false]) {
      let run = 1
      for (let index = 1; index < size; index += 1) {
        const current = horizontal ? at(index, line) : at(line, index)
        const previous = horizontal ? at(index - 1, line) : at(line, index - 1)
        if (current === previous) {
          run += 1
          if (run === 5) score += 3
          else if (run > 5) score += 1
        } else run = 1
      }
    }
  }

  // 规则 2：2×2 同色
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const value = at(x, y)
      if (value === at(x + 1, y) && value === at(x, y + 1) && value === at(x + 1, y + 1)) score += 3
    }
  }

  // 规则 3：类定位图形。用 11 位滑窗找 `10111010000` 与 `00001011101` 两种形态，
  // 每命中一次记 40。注意两侧都留着 4 个白时算**两次**（两个窗口各命中一次），不是一次——
  // 这一点决定了掩模的取舍，写成「任一侧」会把罚分少算一半。
  const FINDER_AHEAD = 0b10111010000
  const FINDER_BEHIND = 0b00001011101
  for (let line = 0; line < size; line += 1) {
    let row = 0
    let column = 0
    for (let index = 0; index < size; index += 1) {
      row = ((row << 1) & 0x7ff) | at(index, line)
      column = ((column << 1) & 0x7ff) | at(line, index)
      if (index < 10) continue
      if (row === FINDER_AHEAD || row === FINDER_BEHIND) score += 40
      if (column === FINDER_AHEAD || column === FINDER_BEHIND) score += 40
    }
  }

  // 规则 4：黑模块比例偏离 50%。
  // 取整方向按 `qrcode` 的算法（向上取到 5% 档），而不是规范正文里「取前后两个五的倍数中较小的偏差」——
  // 两种写法都合规（掩模只是可读性启发式，选哪个都能扫），钉住同一种才能让参照比对做成逐模块相等。
  const dark = modules.reduce<number>((total, value) => total + value, 0)
  const ratio = (dark * 100) / (size * size)
  score += Math.abs(Math.ceil(ratio / 5) - 10) * 10
  return score
}

/**
 * 写格式信息（15 位 BCH，两处冗余）。
 *
 * @param grid - 矩阵
 * @param mask - 掩模编号
 */
function writeFormat(grid: Grid, mask: number): void {
  const { size } = grid
  const data = (EC_LEVEL_BITS << 3) | mask
  let rest = data << 10
  for (let index = 4; index >= 0; index -= 1) {
    if (rest & (1 << (index + 10))) rest ^= 0b10100110111 << index
  }
  const bits = ((data << 10) | rest) ^ 0b101010000010010

  // 简单方法：按 (x, y) 落一位
  const set = (x: number, y: number, dark: boolean) => void (grid.modules[y * size + x] = dark ? 1 : 0)

  for (let index = 0; index < 15; index += 1) {
    const dark = ((bits >>> index) & 1) === 1
    // 第一份：左上角定位图形周围，先沿第 8 列往下，拐过定时行后转到第 8 行往左
    if (index < 6) set(8, index, dark)
    else if (index === 6) set(8, 7, dark)
    else if (index === 7) set(8, 8, dark)
    else if (index === 8) set(7, 8, dark)
    else set(14 - index, 8, dark)
    // 第二份：右上沿第 8 行向左，左下沿第 8 列向下
    if (index < 8) set(size - 1 - index, 8, dark)
    else set(8, size - 15 + index, dark)
  }
}

/**
 * 写版本信息（18 位 BCH，v7 起）。
 *
 * @param grid - 矩阵
 * @param version - 版本号
 */
function writeVersion(grid: Grid, version: number): void {
  if (version < 7) return
  const { size } = grid
  let rest = version << 12
  for (let index = 5; index >= 0; index -= 1) {
    if (rest & (1 << (index + 12))) rest ^= 0b1111100100101 << index
  }
  const bits = (version << 12) | rest
  for (let index = 0; index < 18; index += 1) {
    const dark = ((bits >>> index) & 1) === 1 ? 1 : 0
    const a = Math.floor(index / 3)
    const b = (index % 3) + size - 11
    grid.modules[b * size + a] = dark
    grid.modules[a * size + b] = dark
  }
}

/**
 * 编码结果：正方形模块矩阵。
 */
export interface QrMatrix {
  /** 边长（模块数） */
  readonly size: number
  /** 行优先的模块，`true` 为黑 */
  readonly modules: readonly boolean[]
  /** 实际用到的版本号（1–20） */
  readonly version: number
}

/**
 * 把文本编成 QR 矩阵（byte 模式，纠错等级 M）。
 *
 * @param text - 待编码文本（按 UTF-8 取字节）
 * @returns 矩阵；空串或超出版本 20 的容量时返回 null（调用方退回纯链接）
 */
export function encodeQr(text: string): QrMatrix | null {
  if (text === '') return null
  const bytes = new TextEncoder().encode(text)
  let version = 0
  for (let candidate = 1; candidate <= MAX_VERSION; candidate += 1) {
    if (capacityOf(candidate) >= bytes.length) {
      version = candidate
      break
    }
  }
  if (version === 0) return null

  const codewords = codewordsOf(bytes, version)
  const base = functionPatterns(version)
  placeData(base, codewords)

  // 八种掩模各算一遍罚分，取最低的那个（并列时取编号小的）
  let best: { mask: number; modules: Uint8Array } | null = null
  for (let mask = 0; mask < MASKS.length; mask += 1) {
    const modules = Uint8Array.from(base.modules)
    const condition = MASKS[mask]
    for (let y = 0; y < base.size; y += 1) {
      for (let x = 0; x < base.size; x += 1) {
        if (base.reserved[y * base.size + x] === 1) continue
        if (condition(x, y)) modules[y * base.size + x] = modules[y * base.size + x] ^ 1
      }
    }
    const candidate: Grid = { size: base.size, modules, reserved: base.reserved }
    writeFormat(candidate, mask)
    writeVersion(candidate, version)
    if (best === null || penalty(modules, base.size) < penalty(best.modules, base.size)) {
      best = { mask, modules }
    }
  }

  return {
    size: base.size,
    version,
    modules: Array.from(best!.modules, (value) => value === 1),
  }
}
