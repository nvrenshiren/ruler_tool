import addToArray from "./addToArray"

export default function addBuffer(gltf, buffer: Buffer | Uint8Array) {
  const newBuffer = {
    byteLength: buffer.length,
    extras: {
      _pipeline: {
        source: buffer
      }
    }
  }
  const bufferId = addToArray(gltf.buffers, newBuffer)
  const bufferView = {
    buffer: bufferId,
    byteOffset: 0,
    byteLength: buffer.length
  }
  return addToArray(gltf.bufferViews, bufferView)
}
