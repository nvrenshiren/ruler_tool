import * as Cesium from "cesium"
import fsExtra from "fs-extra"
import path from "path"
import Promise from "bluebird"

import compressDracoMeshes from "./compressDracoMeshes"
import glbToGltf from "./glbToGltf"
import gltfToGlb from "./gltfToGlb"
import processGlb from "./processGlb"
import processGltf from "./processGltf"

const defined = Cesium.defined

export default function gltf(argv) {
  const args = process.argv
  const inputPath = argv.input
  let outputPath = argv.output

  const inputDirectory = path.dirname(inputPath)
  const inputName = path.basename(inputPath, path.extname(inputPath))
  const inputExtension = path.extname(inputPath).toLowerCase()
  if (inputExtension !== ".gltf" && inputExtension !== ".glb") {
    console.log(`Error: unrecognized file extension "${inputExtension}".`)
    return
  }

  let outputExtension
  if (!defined(outputPath)) {
    if (argv.binary) {
      outputExtension = ".glb"
    } else if (argv.json) {
      outputExtension = ".gltf"
    } else {
      outputExtension = inputExtension
    }
    outputPath = path.join(inputDirectory, `${inputName}-processed${outputExtension}`)
  }

  const outputDirectory = path.dirname(outputPath)
  const outputName = path.basename(outputPath, path.extname(outputPath))
  outputExtension = path.extname(outputPath).toLowerCase()
  if (outputExtension !== ".gltf" && outputExtension !== ".glb") {
    console.log(`Error: unrecognized file extension "${outputExtension}".`)
    return
  }

  let i
  let dracoOptions
  const length = args.length
  for (i = 0; i < length; ++i) {
    const arg = args[i]
    if (arg.indexOf("--draco.") === 0 || arg === "-d") {
      dracoOptions = argv.draco ?? {}
    }
  }

  const options = {
    resourceDirectory: inputDirectory,
    separate: argv.separate,
    separateTextures: argv.separateTextures,
    stats: argv.stats,
    keepUnusedElements: argv.keepUnusedElements,
    keepLegacyExtensions: argv.keepLegacyExtensions,
    name: outputName,
    dracoOptions: dracoOptions,
    baseColorTextureNames: argv.baseColorTextureNames,
    baseColorFactorNames: argv.baseColorFactorNames,
    allowAbsolute: argv.allowAbsolute
  }

  if (options.allowAbsolute) {
    console.warn("Warning: Allowing absolute buffer URIs; please double-check your glTF for potentially dangerous buffer URIs.")
  }

  const inputIsBinary = inputExtension === ".glb"
  const outputIsBinary = outputExtension === ".glb"

  const jsonOptions = {
    spaces: 2
  }

  const read = inputIsBinary ? fsExtra.readFile : fsExtra.readJson
  const write = outputIsBinary ? fsExtra.outputFile : fsExtra.outputJson
  const writeOptions = outputIsBinary ? undefined : jsonOptions
  const run = inputIsBinary ? (outputIsBinary ? processGlb : glbToGltf) : outputIsBinary ? gltfToGlb : processGltf

  function saveSeparateResources(separateResources) {
    const resourcePromises: any = []
    for (const relativePath in separateResources) {
      if (Object.prototype.hasOwnProperty.call(separateResources, relativePath)) {
        const resource = separateResources[relativePath]
        const resourcePath = path.join(outputDirectory, relativePath)
        resourcePromises.push(fsExtra.outputFile(resourcePath, resource))
      }
    }
    return resourcePromises
  }

  console.time("Total")
  //@ts-ignore
  read(inputPath)
    .then(function (gltf) {
      return run(gltf, options)
    })
    .then(function (results) {
      const gltf = results.gltf ?? results.glb
      const separateResources = results.separateResources
      //@ts-ignore
      return Promise.all([write(outputPath, gltf, writeOptions), saveSeparateResources(separateResources)])
    })
    .then(function () {
      console.timeEnd("Total")
    })
    .catch(function (error) {
      console.log(error)
      process.exitCode = 1
    })
}
