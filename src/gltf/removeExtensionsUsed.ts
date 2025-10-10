import * as Cesium from "cesium"
import removeExtensionsRequired from "./removeExtensionsRequired"

const defined = Cesium.defined

export default function removeExtensionsUsed(gltf, extension) {
  const extensionsUsed = gltf.extensionsUsed
  if (defined(extensionsUsed)) {
    const index = extensionsUsed.indexOf(extension)
    if (index >= 0) {
      extensionsUsed.splice(index, 1)
    }
    removeExtensionsRequired(gltf, extension)
    if (extensionsUsed.length === 0) {
      delete gltf.extensionsUsed
    }
  }
}
