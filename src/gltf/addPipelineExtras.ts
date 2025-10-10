import * as Cesium from "cesium"
import ForEach from "./ForEach"

const defined = Cesium.defined

export default function addPipelineExtras(gltf) {
  ForEach.shader(gltf, function (shader) {
    addExtras(shader)
  })
  ForEach.buffer(gltf, function (buffer) {
    addExtras(buffer)
  })
  ForEach.image(gltf, function (image) {
    addExtras(image)
  })

  addExtras(gltf)

  return gltf
}

function addExtras(object) {
  object.extras = defined(object.extras) ? object.extras : {}
  object.extras._pipeline = defined(object.extras._pipeline) ? object.extras._pipeline : {}
}
