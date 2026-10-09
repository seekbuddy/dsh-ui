// QR 编码器：拿成熟实现 `qrcode` 的输出当参照物逐模块比对。
// 参照数据是**一次性生成后钉进来的**（重算办法见文件末注），所以这里不引入 qrcode 依赖，
// 线上包里一个字节都不会多。
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

const qr = await import(process.env.QR_CORE_URL)

/** 把矩阵压成一串 0/1 再取 sha256 前 16 位，免得把整张矩阵贴进来 */
const fingerprint = (modules) =>
  createHash('sha256')
    .update(modules.map((dark) => (dark ? '1' : '0')).join(''))
    .digest('hex')
    .slice(0, 16)

/** 几个有代表性的输入：短文本、真实授权链接、单字符、UTF-8 多字节 */
const SAMPLES = [
  { name: '短文本', text: 'HELLO WORLD', version: 1, size: 21, sha: 'f516d851861750f4' },
  {
    name: '钉钉授权链接',
    text: 'https://login.dingtalk.com/oauth2/challenge.htm?client_id=abc&state=xyz',
    version: 5,
    size: 37,
    sha: 'c17dc7b5429c0ee5',
  },
  { name: '单字符', text: 'a', version: 1, size: 21, sha: '2e7add7dfd3288d4' },
  { name: 'UTF-8 多字节', text: '连接器 · 扫码授权', version: 2, size: 25, sha: '73da917fd1695be4' },
]

/** 逐版本各取一个刚好落在该版本的负载：分块表或对齐图形表写错，对应那一行会当场红 */
const PER_VERSION = [
  { version: 1, length: 14, size: 21, sha: '15df6be45de23add' },
  { version: 2, length: 26, size: 25, sha: '623b894c5912eed0' },
  { version: 3, length: 42, size: 29, sha: '1ded32c8ad32a5c5' },
  { version: 4, length: 62, size: 33, sha: 'a6fdd8b5deddf60a' },
  { version: 5, length: 84, size: 37, sha: '6ed5eaca56975e1b' },
  { version: 6, length: 106, size: 41, sha: 'ad2c21ab2357d147' },
  { version: 7, length: 122, size: 45, sha: 'a99968d928103b2f' },
  { version: 8, length: 152, size: 49, sha: '10cea6bc41fd18e0' },
  { version: 9, length: 180, size: 53, sha: '9183185ee6c3b83f' },
  { version: 10, length: 213, size: 57, sha: '46a19b925ebf97f4' },
  { version: 11, length: 251, size: 61, sha: '995e53efafedcdca' },
  { version: 12, length: 287, size: 65, sha: '92f4f80c568c2499' },
  { version: 13, length: 331, size: 69, sha: '6777eca6560ea705' },
  { version: 14, length: 362, size: 73, sha: 'a876877842e041d9' },
  { version: 15, length: 412, size: 77, sha: 'aa93b645788cb931' },
  { version: 16, length: 450, size: 81, sha: 'e9cea1607d7ead7c' },
  { version: 17, length: 504, size: 85, sha: '05fd40c330a63f48' },
  { version: 18, length: 560, size: 89, sha: '7a35ef990fa92e5a' },
  { version: 19, length: 624, size: 93, sha: 'bc98d9d9b108e115' },
  { version: 20, length: 666, size: 97, sha: '5081ac283b9ada05' },
]

/** 版本 1 的可视锚点：整张矩阵贴出来，人眼也能核对三个定位图形与定时行 */
const TINY = [
  '#######..#.##.#######',
  '#.....#.#.##..#.....#',
  '#.###.#.##.#..#.###.#',
  '#.###.#.#.##..#.###.#',
  '#.###.#..#..#.#.###.#',
  '#.....#...##..#.....#',
  '#######.#.#.#.#######',
  '........##...........',
  '#.....#.#.##.##..###.',
  '#..##......###.###..#',
  '..#.###..##.#.##.....',
  '.#.#.#.##..#####.#.#.',
  '##.#..####.##########',
  '........##..#.....#.#',
  '#######..###.#..####.',
  '#.....#...#...#...###',
  '#.###.#..###.#..###..',
  '#.###.#..#.#####.#...',
  '#.###.#..#.###.###.##',
  '#.....#...######.#...',
  '#######.#.#.#..#..##.',
]

test('encodeQr matches the reference implementation module for module', () => {
  for (const sample of SAMPLES) {
    const matrix = qr.encodeQr(sample.text)
    assert.ok(matrix, sample.name)
    assert.equal(matrix.version, sample.version, sample.name)
    assert.equal(matrix.size, sample.size, sample.name)
    assert.equal(fingerprint(matrix.modules), sample.sha, sample.name)
  }
})

test('every supported version 1-20 matches (guards the block and alignment tables)', () => {
  for (const row of PER_VERSION) {
    const label = `v${row.version}`
    const matrix = qr.encodeQr('u'.repeat(row.length))
    assert.ok(matrix, label)
    assert.equal(matrix.version, row.version, label)
    assert.equal(matrix.size, row.size, label)
    assert.equal(fingerprint(matrix.modules), row.sha, label)
  }
})

test('version 1 renders the exact matrix a human can eyeball', () => {
  const matrix = qr.encodeQr('a')
  const rows = []
  for (let y = 0; y < matrix.size; y += 1) {
    let row = ''
    for (let x = 0; x < matrix.size; x += 1) row += matrix.modules[y * matrix.size + x] ? '#' : '.'
    rows.push(row)
  }
  assert.deepEqual(rows, TINY)
})

test('payloads that do not fit return null so callers can fall back to a plain link', () => {
  assert.equal(qr.encodeQr(''), null)
  assert.ok(qr.encodeQr('u'.repeat(666)))
  assert.equal(qr.encodeQr('u'.repeat(667)), null)
})

test('capacity counts UTF-8 bytes, not characters', () => {
  // 版本 1 装 14 字节 = 4 个汉字（12 字节）放得下，5 个（15 字节）就得进版本 2
  assert.equal(qr.encodeQr('连接器啊').version, 1)
  assert.equal(qr.encodeQr('连接器啊哈').version, 2)
})

// 重算参照数据：在装了 qrcode 包的环境里跑
//   QR.create([{ data: text, mode: 'byte' }], { errorCorrectionLevel: 'M' })
// 取 modules.data 拼成 0/1 串后 sha256 前 16 位。
