export default function getBufferPadded(buffer) {
  const boundary = 8
  const byteLength = buffer.length
  const remainder = byteLength % boundary
  if (remainder === 0) {
    return buffer
  }
  const padding = remainder === 0 ? 0 : boundary - remainder
  const emptyBuffer = Buffer.alloc(padding)
  return Buffer.concat([buffer, emptyBuffer])
}
