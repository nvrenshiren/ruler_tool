import * as Cesium from "cesium"
import addToArray from "./addToArray"

const defined = Cesium.defined

export default function addExtensionsUsed(gltf, extension) {
  let extensionsUsed = gltf.extensionsUsed
  if (!defined(extensionsUsed)) {
    extensionsUsed = []
    gltf.extensionsUsed = extensionsUsed
  }
  addToArray(extensionsUsed, extension, true)
}
