import parseGlb from "./parseGlb"
import gltfToGlb from "./gltfToGlb"

export default function processGlb(glb, options) {
  const gltf = parseGlb(glb)
  return gltfToGlb(gltf, options)
}
