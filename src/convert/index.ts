import path from "path"
import { ConvertFiles } from "./lib/convertFiles"
import { readFileSync, writeFileSync } from "fs-extra"
const fileType = [
  ".amf",
  ".3ds",
  ".ac",
  ".ase",
  ".assbin",
  ".b3d",
  ".bvh",
  ".collada",
  ".dxf",
  ".csm",
  ".hmp",
  ".iqm",
  ".lwo",
  ".lws",
  ".md2",
  ".md3",
  ".md5",
  ".mdc",
  ".mdl",
  ".nff",
  ".ndo",
  ".off",
  ".obj",
  ".ogre",
  ".opengex",
  ".ply",
  ".ms3d",
  ".cob",
  ".blend",
  ".xgl",
  ".fbx",
  ".q3d",
  ".q3bsp",
  ".sib",
  ".smd",
  ".stl",
  ".3d",
  ".x",
  ".gltf",
  ".3mf",
  ".mmd",
  ".glb"
]
const converType = ["obj", "ply", "glb2", "collada", "fbx", "stl", "gltf2", "usdz"]
export default async function convert(argv) {
  const { input, type } = argv

  const convertFiles = new ConvertFiles()

  const inputBuffer = readFileSync(input)
  const fileContent = new Uint8Array(inputBuffer)
  const file = new File([fileContent], input)
  const data = await convertFiles.convertFiles([file], type)
  data.forEach(item => {
    writeFileSync(item.name, item.content)
  })
}
