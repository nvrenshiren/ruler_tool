//@ts-ignore
import { defined as _defined } from "cesium"

import { outputFile, outputJson } from "fs-extra"
import { resolve, basename, extname, dirname, join } from "path"

import obj2gltf from "./obj2gltf"
import defaultValue from "./defaultValue"

const defined = _defined

export default function obj(argv) {
  if (argv.metallicRoughness + argv.specularGlossiness > 1) {
    console.error("Only one material type may be set from [--metallicRoughness, --specularGlossiness].")
    process.exitCode = 1
  }

  if (defined(argv.metallicRoughnessOcclusionTexture) && defined(argv.specularGlossinessTexture)) {
    console.error("--metallicRoughnessOcclusionTexture and --specularGlossinessTexture cannot both be set.")
    process.exitCode = 1
  }

  const objPath = argv.input
  let gltfPath = argv.output

  const filename = defaultValue(gltfPath, objPath)
  const name = basename(filename, extname(filename))
  const outputDirectory = dirname(filename)
  const binary = argv.binary || extname(filename).toLowerCase() === ".glb"
  const extension = binary ? ".glb" : ".gltf"

  gltfPath = join(outputDirectory, name + extension)

  const overridingTextures = {
    metallicRoughnessOcclusionTexture: argv.metallicRoughnessOcclusionTexture,
    specularGlossinessTexture: argv.specularGlossinessTexture,
    occlusionTexture: argv.occlusionTexture,
    normalTexture: argv.normalTexture,
    baseColorTexture: argv.baseColorTexture,
    emissiveTexture: argv.emissiveTexture,
    alphaTexture: argv.alphaTexture
  }

  const options = {
    binary: binary,
    separate: argv.separate,
    separateTextures: argv.separateTextures,
    checkTransparency: argv.checkTransparency,
    secure: argv.secure,
    packOcclusion: argv.packOcclusion,
    metallicRoughness: argv.metallicRoughness,
    specularGlossiness: argv.specularGlossiness,
    unlit: argv.unlit,
    overridingTextures: overridingTextures,
    outputDirectory: outputDirectory,
    inputUpAxis: argv.inputUpAxis,
    outputUpAxis: argv.outputUpAxis,
    triangleWindingOrderSanitization: argv.triangleWindingOrderSanitization,
    doubleSidedMaterial: argv.doubleSidedMaterial
  }

  console.time("Total")

  obj2gltf(objPath, options)
    .then(function (gltf) {
      if (binary) {
        // gltf is a glb buffer
        return outputFile(gltfPath, gltf)
      }
      const jsonOptions = {
        spaces: 2
      }
      return outputJson(gltfPath, gltf, jsonOptions)
    })
    .then(function () {
      console.timeEnd("Total")
    })
    .catch(function (error) {
      console.log(error.message)
      process.exitCode = 1
    })
}
