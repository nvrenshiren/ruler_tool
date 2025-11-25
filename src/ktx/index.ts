import { encodeToKTX2 } from "./node"
import { readFile, writeFile } from "fs/promises"
// import sharp from "sharp"
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

export default async function ktx2(options) {
  if (!options.input) {
    console.error("请输入输入路径")
    return
  }
  if (!options.output) {
    console.error("请输入输出路径")
    return
  }
  const buffer = await readFile(options.input)
  const result = await encodeToKTX2(new Uint8Array(buffer), {
    isUASTC: options.uastc,
    enableDebug: false,
    qualityLevel: +options.qualityLevel,
    generateMipmap: options.mipmap,
    imageDecoder
  })
  await writeFile(options.output, result)
}
