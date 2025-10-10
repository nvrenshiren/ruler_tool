import parseGlb from "./parseGlb"
import processGltf from "./processGltf"

export default function glbToGltf(glb, options) {
  const gltf = parseGlb(glb)
  return processGltf(gltf, options)
}
