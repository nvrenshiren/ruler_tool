import * as Cesium from "cesium"

const ComponentDatatype = Cesium.ComponentDatatype
const defined = Cesium.defined

import getAccessorByteStride from "./getAccessorByteStride"
import getComponentReader from "./getComponentReader"
import numberOfComponentsForType from "./numberOfComponentsForType"

export default function findAccessorMinMax(gltf, accessor) {
  const bufferViews = gltf.bufferViews
  const buffers = gltf.buffers
  const bufferViewId = accessor.bufferView
  const numberOfComponents = numberOfComponentsForType(accessor.type)

  // According to the spec, when bufferView is not defined, accessor must be initialized with zeros
  if (!defined(accessor.bufferView)) {
    return {
      min: new Array(numberOfComponents).fill(0.0),
      max: new Array(numberOfComponents).fill(0.0)
    }
  }

  const min = new Array(numberOfComponents).fill(Number.POSITIVE_INFINITY)
  const max = new Array(numberOfComponents).fill(Number.NEGATIVE_INFINITY)

  const bufferView = bufferViews[bufferViewId]
  const bufferId = bufferView.buffer
  const buffer = buffers[bufferId]
  const source = buffer.extras._pipeline.source

  const count = accessor.count
  const byteStride = getAccessorByteStride(gltf, accessor)
  let byteOffset = accessor.byteOffset + bufferView.byteOffset + source.byteOffset
  const componentType = accessor.componentType
  const componentTypeByteLength = ComponentDatatype["getSizeInBytes"](componentType)
  const dataView = new DataView(source.buffer)
  const components = new Array(numberOfComponents)
  const componentReader = getComponentReader(componentType)

  for (let i = 0; i < count; i++) {
    componentReader(dataView, byteOffset, numberOfComponents, componentTypeByteLength, components)
    for (let j = 0; j < numberOfComponents; j++) {
      const value = components[j]
      min[j] = Math.min(min[j], value)
      max[j] = Math.max(max[j], value)
    }
    byteOffset += byteStride
  }

  return {
    min: min,
    max: max
  }
}
