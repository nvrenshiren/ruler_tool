import * as Cesium from "cesium"
import ForEach from "./ForEach"

const defined = Cesium.defined

export default function removePipelineExtras(gltf) {
  ForEach.shader(gltf, function (shader) {
    removeExtras(shader)
  })
  ForEach.buffer(gltf, function (buffer) {
    removeExtras(buffer)
  })
  ForEach.image(gltf, function (image) {
    removeExtras(image)
  })

  removeExtras(gltf)

  return gltf
}

function removeExtras(object) {
  if (!defined(object.extras)) {
    return
  }

  if (defined(object.extras._pipeline)) {
    delete object.extras._pipeline
  }

  if (Object.keys(object.extras).length === 0) {
    delete object.extras
  }
}
