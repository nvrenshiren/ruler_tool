"use strict"
import * as Cesium from "cesium"

const defined = Cesium.defined

// /**
//  * Checks whether the glTF uses the given extension.
//  *
//  * @param {object} gltf A javascript object containing a glTF asset.
//  * @param {string} extension The name of the extension.
//  * @returns {boolean} Whether the glTF uses the given extension.
//  *
//  * @private
//  */
export default function usesExtension(gltf, extension) {
  return defined(gltf.extensionsUsed) && gltf.extensionsUsed.indexOf(extension) >= 0
}
