import * as Cesium from "cesium"
import numberOfComponentsForType from "./numberOfComponentsForType"

const ComponentDatatype = Cesium.ComponentDatatype
const defined = Cesium.defined

export default function getAccessorByteStride(gltf, accessor) {
  const bufferViewId = accessor.bufferView
  if (defined(bufferViewId)) {
    const bufferView = gltf.bufferViews[bufferViewId]
    if (defined(bufferView.byteStride) && bufferView.byteStride > 0) {
      return bufferView.byteStride
    }
  }
  return ComponentDatatype["getSizeInBytes"](accessor.componentType) * numberOfComponentsForType(accessor.type)
}
