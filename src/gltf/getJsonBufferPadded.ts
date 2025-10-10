export default function getJsonBufferPadded(json, byteOffset) {
  byteOffset = byteOffset ?? 0
  let string = JSON.stringify(json)

  const boundary = 8
  const byteLength = Buffer.byteLength(string)
  const remainder = (byteOffset + byteLength) % boundary
  const padding = remainder === 0 ? 0 : boundary - remainder
  let whitespace = ""
  for (let i = 0; i < padding; ++i) {
    whitespace += " "
  }
  string += whitespace

  return Buffer.from(string)
}
