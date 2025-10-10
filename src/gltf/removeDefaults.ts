import * as Cesium from "cesium"
import ForEach from "./ForEach"

const defined = Cesium.defined
const Matrix4 = Cesium.Matrix4

export default function removeDefaults(gltf) {
  ForEach.node(gltf, function (node) {
    if (defined(node.matrix) && Matrix4.equals(Matrix4.fromArray(node.matrix), Matrix4.IDENTITY)) {
      delete node.matrix
    }
  })
  ForEach.accessor(gltf, function (accessor) {
    if (accessor.normalized === false) {
      delete accessor.normalized
    }
  })
  return gltf
}
