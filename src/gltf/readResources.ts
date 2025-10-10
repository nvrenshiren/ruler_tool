import * as Cesium from "cesium"
import fsExtra from "fs-extra"
import path from "path"
import Promise from "bluebird"
import { URL } from "url"

import addPipelineExtras from "./addPipelineExtras"
import dataUriToBuffer from "./dataUriToBuffer"
import { fileURLToPath, pathToFileURL } from "url"
import ForEach from "./ForEach"

const defined = Cesium.defined
const isDataUri = Cesium["isDataUri"]
const RuntimeError = Cesium.RuntimeError

export default function readResources(gltf, options) {
  addPipelineExtras(gltf)
  options = options ?? {}

  // Make sure its an absolute path with a trailing separator
  options.resourceDirectory = defined(options.resourceDirectory) ? path.resolve(options.resourceDirectory) + path.sep : undefined

  const bufferPromises: any = []
  const resourcePromises: any = []

  ForEach.buffer(gltf, function (buffer) {
    bufferPromises.push(readBuffer(gltf, buffer, options))
  })

  // Buffers need to be read first because images and shader may resolve to bufferViews
  return Promise.all(bufferPromises)
    .then(function () {
      ForEach.shader(gltf, function (shader) {
        resourcePromises.push(readShader(gltf, shader, options))
      })
      ForEach.image(gltf, function (image) {
        resourcePromises.push(readImage(gltf, image, options))
      })
      return Promise.all(resourcePromises)
    })
    .then(function () {
      return gltf
    })
}

async function readBuffer(gltf, buffer, options) {
  const data = await readResource(gltf, buffer, false, options)
  if (defined(data)) {
    buffer.extras._pipeline.source = data
  }
}

async function readImage(gltf, image, options) {
  const data = await readResource(gltf, image, true, options)
  image.extras._pipeline.source = data
}

async function readShader(gltf, shader, options) {
  const data = await readResource(gltf, shader, true, options)
  shader.extras._pipeline.source = data.toString()
}

function readResource(gltf, object, saveResourceId, options) {
  const uri = object.uri
  delete object.uri // Don't hold onto the uri, its contents will be stored in extras._pipeline.source

  // Source already exists if the gltf was converted from a glb
  const source = object.extras._pipeline.source
  if (defined(source)) {
    return Promise.resolve(Buffer.from(source))
  }
  // Handle reading buffer view from 1.0 glb model
  const extensions = object.extensions
  if (defined(extensions)) {
    const khrBinaryGltf = extensions.KHR_binary_glTF
    if (defined(khrBinaryGltf)) {
      return Promise.resolve(readBufferView(gltf, khrBinaryGltf.bufferView, object, saveResourceId))
    }
  }
  if (defined(object.bufferView)) {
    return Promise.resolve(readBufferView(gltf, object.bufferView, object, saveResourceId))
  }
  if (!defined(uri)) {
    return Promise.resolve(undefined)
  }
  if (isDataUri(uri)) {
    return Promise.resolve(dataUriToBuffer(uri))
  }
  return readFile(object, uri, saveResourceId, options)
}

function readBufferView(gltf, bufferViewId, object, saveResourceId) {
  if (saveResourceId) {
    object.extras._pipeline.resourceId = bufferViewId
  }
  const bufferView = gltf.bufferViews[bufferViewId]
  const buffer = gltf.buffers[bufferView.buffer]
  const source = buffer.extras._pipeline.source
  const byteOffset = bufferView.byteOffset ?? 0
  return source.slice(byteOffset, byteOffset + bufferView.byteLength)
}

function readFile(object, uri, saveResourceId, options) {
  const resourceDirectory = options.resourceDirectory
  const hasResourceDirectory = defined(resourceDirectory)
  const uriIsAbsolute = uri.startsWith("/") || uri.startsWith("file:///")
  // Resolve the URL
  let absoluteUrl
  // Since we treat this as a URI,
  // file:///path/to/file, //path/to/file, and /path/to/file would all be considered absolute.
  if (uriIsAbsolute) {
    if (!options.allowAbsolute && hasResourceDirectory) {
      return Promise.reject(new RuntimeError("Absolute paths are not permitted; use the 'allowAbsolute' option to disable this error."))
    }
    if (!hasResourceDirectory) {
      console.warn(`No 'resourceDirectory' provided, so relative paths are impossible; forcing 'allowAbsolute' option to avoid breaking things.`)
    }
  }
  let localUri = uri

  // new URL(`/`, undefined) throws an error because there's no protocol.  Give it one so naked absolute paths
  // survive the next step when `resourceDirectory` is not defined.
  if (!resourceDirectory && localUri.startsWith("/")) {
    localUri = new URL(localUri, "file:///")
  }

  try {
    absoluteUrl = new URL(localUri, hasResourceDirectory ? pathToFileURL(resourceDirectory) : undefined)
  } catch (error) {
    return Promise.reject(new RuntimeError("glTF model references separate files but no resourceDirectory is supplied"))
  }

  // Generate file paths for the resource
  const absolutePath = fileURLToPath(absoluteUrl)
  const relativePath = hasResourceDirectory ? path.relative(resourceDirectory, absolutePath) : path.basename(absolutePath)

  if (!defined(object.name)) {
    const extension = path.extname(relativePath)
    object.name = path.basename(relativePath, extension)
  }

  if (saveResourceId) {
    object.extras._pipeline.resourceId = absolutePath
  }

  object.extras._pipeline.absolutePath = absolutePath
  object.extras._pipeline.relativePath = relativePath
  return fsExtra.readFile(absolutePath)
}
