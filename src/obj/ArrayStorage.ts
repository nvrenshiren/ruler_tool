import * as Cesium from "cesium"

const ComponentDatatype = Cesium.ComponentDatatype

const initialLength = 1024 // 2^10
const doublingThreshold = 33554432 // 2^25 (~134 MB for a Float32Array)
const fixedExpansionLength = 33554432 // 2^25 (~134 MB for a Float32Array)

const sizeOfUint16 = 2
const sizeOfUint32 = 4
const sizeOfFloat = 4

export default class ArrayStorage {
  componentDatatype: Cesium.ComponentDatatype
  typedArray: any
  length: number

  constructor(componentDatatype: Cesium.ComponentDatatype) {
    this.componentDatatype = componentDatatype
    this.typedArray = ComponentDatatype["createTypedArray"](componentDatatype, 0)
    this.length = 0
  }

  private resize(length: number) {
    const typedArray = ComponentDatatype["createTypedArray"](this.componentDatatype, length)
    typedArray.set(this.typedArray)
    this.typedArray = typedArray
  }

  push(value: number) {
    const length = this.length
    const typedArrayLength = this.typedArray.length

    if (length === 0) {
      this.resize(initialLength)
    } else if (length === typedArrayLength) {
      if (length < doublingThreshold) {
        this.resize(typedArrayLength * 2)
      } else {
        this.resize(typedArrayLength + fixedExpansionLength)
      }
    }

    this.typedArray[this.length++] = value
  }

  get(index: number) {
    return this.typedArray[index]
  }

  toUint16Buffer() {
    const length = this.length
    const typedArray = this.typedArray
    const paddedLength = length + (length % 2 === 0 ? 0 : 1) // Round to next multiple of 2
    const buffer = Buffer.alloc(paddedLength * sizeOfUint16)
    for (let i = 0; i < length; ++i) {
      buffer.writeUInt16LE(typedArray[i], i * sizeOfUint16)
    }
    return buffer
  }

  toUint32Buffer() {
    const length = this.length
    const typedArray = this.typedArray
    const buffer = Buffer.alloc(length * sizeOfUint32)
    for (let i = 0; i < length; ++i) {
      buffer.writeUInt32LE(typedArray[i], i * sizeOfUint32)
    }
    return buffer
  }

  toFloatBuffer() {
    const length = this.length
    const typedArray = this.typedArray
    const buffer = Buffer.alloc(length * sizeOfFloat)
    for (let i = 0; i < length; ++i) {
      buffer.writeFloatLE(typedArray[i], i * sizeOfFloat)
    }
    return buffer
  }

  getMinMax(components: number) {
    const length = this.length
    const typedArray = this.typedArray
    const count = length / components
    const min = new Array(components).fill(Number.POSITIVE_INFINITY)
    const max = new Array(components).fill(Number.NEGATIVE_INFINITY)
    for (let i = 0; i < count; ++i) {
      for (let j = 0; j < components; ++j) {
        const index = i * components + j
        const value = typedArray[index]
        min[j] = Math.min(min[j], value)
        max[j] = Math.max(max[j], value)
      }
    }
    return {
      min: min,
      max: max
    }
  }
}
