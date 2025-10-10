import * as Cesium from "cesium"

import addExtensionsUsed from "./addExtensionsUsed"
import addToArray from "./addToArray"

const defined = Cesium.defined

export default function addExtensionsRequired(gltf, extension) {
  let extensionsRequired = gltf.extensionsRequired
  if (!defined(extensionsRequired)) {
    extensionsRequired = []
    gltf.extensionsRequired = extensionsRequired
  }
  addToArray(extensionsRequired, extension, true)
  addExtensionsUsed(gltf, extension)
}
