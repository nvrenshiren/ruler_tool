import { AssimpLoader } from "./assimpLoader"
import { ColladaConver } from "./conver/collada"
import { FBXConver } from "./conver/fbx"
import { GLB2Conver } from "./conver/glb2"
import { GLTF2Conver } from "./conver/gltf2"
import { OBJConver } from "./conver/obj"
import { PLYConver } from "./conver/ply"
import { STLConver } from "./conver/stl"
import { USDZConver } from "./conver/usdz"
import { Converter } from "./converter"
import { USDZLoader } from "./usdzLoader"
import JSZip from "jszip"

export class ConvertFiles {
  assimpLoader: AssimpLoader
  usdzLoader: USDZLoader
  fileConverter: Converter
  constructor() {
    this.assimpLoader = new AssimpLoader()
    this.usdzLoader = new USDZLoader()
    this.fileConverter = new Converter()
  }
  async initialize() {
    await this.assimpLoader.load()
    const assimp = this.assimpLoader.getAssimp()
    this.fileConverter.registerConverter("glb2", new GLB2Conver(assimp))
    this.fileConverter.registerConverter("ply", new PLYConver(assimp))
    this.fileConverter.registerConverter("stl", new STLConver(assimp))
    this.fileConverter.registerConverter("fbx", new FBXConver(assimp))
    this.fileConverter.registerConverter("usdz", new USDZConver(assimp))
    this.fileConverter.registerConverter("gltf2", new GLTF2Conver(assimp))
    this.fileConverter.registerConverter("obj", new OBJConver(assimp))
    this.fileConverter.registerConverter("collada", new ColladaConver(assimp))
  }
  async loadFiles(e: File[]) {
    const t: File[] = []
    for (const n of e) {
      if ("usdz" === this.getFileExtension(n)) {
        const e = await this.usdzLoader.loadAndConvert(n)
        t.push(e)
      } else t.push(n)
    }
    return t
  }
  getFileExtension(e: File) {
    return e.name.split(".").pop()!.toLowerCase()
  }
  async convertFiles(e: File[], t: string) {
    await this.initialize()
    const n = await this.loadFiles(e)
    const r = await this.fileConverter.convert(n, t)
    return r
  }
}
class ZipModel {
  static async process(
    e: {
      name: string
      content: Uint8Array
    }[]
  ) {
    if (e.length > 1) {
      const jszip = new JSZip()
      e.forEach(e => {
        jszip.file(e.name, e.content)
      })
      return {
        content: await jszip.generateAsync({
          type: "nodebuffer"
        }),
        fileName: "model.zip"
      }
    }
    return {
      content: e[0].content.buffer,
      fileName: e[0].name
    }
  }
}
