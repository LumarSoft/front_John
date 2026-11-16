/**
 * MD5 of a text, in lowercase hex. Triunfo's web services take the password
 * this way, so the panel hashes it here and the password itself never leaves
 * the browser. Web Crypto has no MD5, hence the implementation (RFC 1321).
 *
 * MD5 is not a safe way to keep a password secret: a short one can be worked
 * out from its hash. It is used only because it is the format Triunfo asks for.
 */

const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4,
  11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]

const CONSTANTS = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)

const BLOCK_BYTES = 64

export function md5Hex(text: string): string {
  const bytes = new TextEncoder().encode(text)
  // The message, a 0x80 byte, zeros, and its length in bits in the last 8 bytes of a whole block.
  const paddedLength = (((bytes.length + 8) >> 6) + 1) * BLOCK_BYTES
  const padded = new Uint8Array(paddedLength)
  padded.set(bytes)
  padded[bytes.length] = 0x80
  const view = new DataView(padded.buffer)
  const bitLength = bytes.length * 8
  view.setUint32(paddedLength - 8, bitLength >>> 0, true)
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 2 ** 32), true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < paddedLength; offset += BLOCK_BYTES) {
    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let i = 0; i < 64; i++) {
      let mixed: number
      let word: number
      if (i < 16) {
        mixed = (b & c) | (~b & d)
        word = i
      } else if (i < 32) {
        mixed = (d & b) | (~d & c)
        word = (5 * i + 1) % 16
      } else if (i < 48) {
        mixed = b ^ c ^ d
        word = (3 * i + 5) % 16
      } else {
        mixed = c ^ (b | ~d)
        word = (7 * i) % 16
      }
      const sum = (a + mixed + CONSTANTS[i] + view.getUint32(offset + word * 4, true)) | 0
      a = d
      d = c
      c = b
      b = (b + ((sum << SHIFTS[i]) | (sum >>> (32 - SHIFTS[i])))) | 0
    }

    a0 = (a0 + a) | 0
    b0 = (b0 + b) | 0
    c0 = (c0 + c) | 0
    d0 = (d0 + d) | 0
  }

  const digest = new DataView(new ArrayBuffer(16))
  ;[a0, b0, c0, d0].forEach((value, i) => digest.setUint32(i * 4, value >>> 0, true))
  return Array.from(new Uint8Array(digest.buffer), byte => byte.toString(16).padStart(2, '0')).join('')
}
