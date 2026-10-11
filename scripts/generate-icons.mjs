import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

// Generates the extension icons (rounded square with a magnifier) without any dependency.
const SIZES = [16, 32, 48, 128]
const SAMPLES = 4
const BACKGROUND = [59, 109, 240]

function crc32(buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), body.length + 4)
  return out
}

function insideRoundedSquare(x, y) {
  const radius = 0.22
  const dx = Math.max(Math.abs(x - 0.5) - (0.5 - radius), 0)
  const dy = Math.max(Math.abs(y - 0.5) - (0.5 - radius), 0)
  return dx * dx + dy * dy <= radius * radius
}

function insideGlyph(x, y) {
  const distance = Math.hypot(x - 0.45, y - 0.45)
  if (distance <= 0.26 && distance >= 0.17) return true
  // Handle: segment from the ring towards the bottom-right corner.
  const t = Math.min(Math.max(((x - 0.64) + (y - 0.64)) / 0.36, 0), 1)
  return Math.hypot(x - (0.64 + 0.18 * t), y - (0.64 + 0.18 * t)) <= 0.055
}

function render(size) {
  const rows = []
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 4)
    for (let px = 0; px < size; px++) {
      let shape = 0
      let glyph = 0
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const x = (px + (sx + 0.5) / SAMPLES) / size
          const y = (py + (sy + 0.5) / SAMPLES) / size
          if (insideRoundedSquare(x, y)) {
            shape++
            if (insideGlyph(x, y)) glyph++
          }
        }
      }
      const total = SAMPLES * SAMPLES
      const mix = shape ? glyph / shape : 0
      const offset = 1 + px * 4
      for (let c = 0; c < 3; c++) row[offset + c] = Math.round(BACKGROUND[c] * (1 - mix) + 255 * mix)
      row[offset + 3] = Math.round((shape / total) * 255)
    }
    rows.push(row)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header.set([8, 6, 0, 0, 0], 8)
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
for (const size of SIZES) writeFileSync(`public/icons/icon-${size}.png`, render(size))