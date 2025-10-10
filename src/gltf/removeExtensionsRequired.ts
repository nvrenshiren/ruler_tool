import * as Cesium from "cesium"

const defined = Cesium.defined

export default function removeExtensionsRequired(gltf, extension) {
  const extensionsRequired = gltf.extensionsRequired
  if (defined(extensionsRequired)) {
    const index = extensionsRequired.indexOf(extension)
    if (index >= 0) {
      extensionsRequired.splice(index, 1)
    }
    if (extensionsRequired.length === 0) {
      delete gltf.extensionsRequired
    }
  }
}
