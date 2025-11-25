import { expect, test } from "vitest"
import { encodeToKTX2 } from "../node"
import { readFile } from "fs/promises"
import { Jimp } from "jimp"
async function imageDecoder(buffer: Uint8Array) {
  const image = await Jimp.read(Buffer.from(buffer))

  // 确保有 Alpha 通道
  const { width, height } = image.bitmap

  // 转换为 RGBA 格式
  for (let i = 0; i < image.bitmap.data.length; i += 4) {
    // 如果没有 Alpha 通道，设置为不透明
    if (image.bitmap.data.length % 4 !== 0) {
      image.bitmap.data[i + 3] = 255
    }
  }

  const data = new Uint8Array(image.bitmap.data)

  // 创建 imageData 对象
  const imageData = {
    width,
    height,
    data
  }

  return imageData
}

test("uastc", { timeout: Infinity }, async () => {
  const buffer = await readFile("./public/tests/DuckCM.png")
  const result = await encodeToKTX2(new Uint8Array(buffer), {
    isUASTC: true,
    enableDebug: false,
    qualityLevel: 230,
    generateMipmap: true,
    imageDecoder
  })

  const resultBuffer = await readFile("./public/tests/DuckCM-uastc.ktx2")
  const testArray = Array.from(new Uint8Array(resultBuffer))
  const resultArray = Array.from(result)
  expect(testArray).toEqual(resultArray)
})

test("etc1s", { timeout: Infinity }, async () => {
  const buffer = await readFile("./public/tests/DuckCM.png")
  const result = await encodeToKTX2(new Uint8Array(buffer), {
    isUASTC: false,
    enableDebug: false,
    qualityLevel: 230,
    generateMipmap: true,
    imageDecoder
  })

  const resultBuffer = await readFile("./public/tests/DuckCM-etc1s.ktx2")
  const testArray = Array.from(new Uint8Array(resultBuffer))
  const resultArray = Array.from(result)
  expect(testArray).toEqual(resultArray)
})
