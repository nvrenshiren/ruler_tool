import { encodeToKTX2 } from "./node"
import { readFile, writeFile } from "fs/promises"
import sharp from "sharp"

async function imageDecoder(buffer: Uint8Array) {
  const image = sharp(buffer)
  const metadata = await image.metadata()
  const { width, height } = metadata
  const rawBuffer = await image.ensureAlpha().raw().toBuffer()
  const data = new Uint8Array(rawBuffer)

  // 创建 imageData 对象
  const imageData = {
    width: width!,
    height: height!,
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
