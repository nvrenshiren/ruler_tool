import { Document } from "@gltf-transform/core"
import { ktx2 } from "../gltf-transform"
import { expect, test, describe } from "vitest"
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

describe("ktx2 transform node", () => {
  test("converts png to ktx2", async () => {
    const document = new Document()
    const texture = document
      .createTexture("test")
      .setImage(await readFile("./public/tests/DuckCM.png"))
      .setMimeType("image/png")

    await document.transform(
      ktx2({
        isUASTC: true,
        enableDebug: false,
        qualityLevel: 230,
        generateMipmap: true,
        imageDecoder
      })
    )

    expect(texture.getMimeType()).toBe("image/ktx2")

    const ktx2Data = Array.from(texture.getImage()!)
    const expectedData = Array.from(new Uint8Array(await readFile("./public/tests/DuckCM-uastc.ktx2")))
    expect(ktx2Data).toEqual(expectedData)
  })

  test("filters textures by pattern", async () => {
    const document = new Document()
    const imageBuffer = await readFile("./public/tests/DuckCM.png")

    const texture1 = document.createTexture("color").setImage(imageBuffer).setMimeType("image/png").setURI("color.png")

    const texture2 = document.createTexture("normal").setImage(imageBuffer).setMimeType("image/png").setURI("normal.png")

    await document.transform(
      ktx2({
        pattern: /^color/,
        isUASTC: true,
        imageDecoder
      })
    )

    expect(texture1.getMimeType()).toBe("image/ktx2")
    expect(texture2.getMimeType()).toBe("image/png")
  })
})
