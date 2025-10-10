import * as Cesium from "cesium"
import addExtensionsUsed from "./addExtensionsUsed"
import ForEach from "./ForEach"

const defined = Cesium.defined
const WebGLConstants = Cesium.WebGLConstants

const defaultBlendEquation = [WebGLConstants.FUNC_ADD, WebGLConstants.FUNC_ADD]

const defaultBlendFactors = [WebGLConstants.ONE, WebGLConstants.ZERO, WebGLConstants.ONE, WebGLConstants.ZERO]
const supportedBlendFactors = [
  WebGLConstants.ZERO,
  WebGLConstants.ONE,
  WebGLConstants.SRC_COLOR,
  WebGLConstants.ONE_MINUS_SRC_COLOR,
  WebGLConstants.SRC_ALPHA,
  WebGLConstants.ONE_MINUS_SRC_ALPHA,
  WebGLConstants.DST_ALPHA,
  WebGLConstants.ONE_MINUS_DST_ALPHA,
  WebGLConstants.DST_COLOR,
  WebGLConstants.ONE_MINUS_DST_COLOR
]
function isStateEnabled(renderStates, state) {
  const enabled = renderStates.enable
  if (!defined(enabled)) {
    return false
  }

  return enabled.indexOf(state) > -1
}

function getSupportedBlendFactors(value, defaultValue) {
  if (!defined(value)) {
    return defaultValue
  }

  for (let i = 0; i < 4; i++) {
    if (supportedBlendFactors.indexOf(value[i]) === -1) {
      return defaultValue
    }
  }

  return value
}

export default function moveTechniqueRenderStates(gltf) {
  const blendingForTechnique = {}
  const materialPropertiesForTechnique = {}
  const techniquesLegacy = gltf.techniques
  if (!defined(techniquesLegacy)) {
    return gltf
  }

  ForEach.technique(gltf, function (techniqueLegacy, techniqueIndex) {
    const renderStates = techniqueLegacy.states
    if (defined(renderStates)) {
      const materialProperties: any = (materialPropertiesForTechnique[techniqueIndex] = {})

      // If BLEND is enabled, the material should have alpha mode BLEND
      if (isStateEnabled(renderStates, WebGLConstants.BLEND)) {
        materialProperties.alphaMode = "BLEND"

        const blendFunctions = renderStates.functions
        if (defined(blendFunctions) && (defined(blendFunctions.blendEquationSeparate) || defined(blendFunctions.blendFuncSeparate))) {
          blendingForTechnique[techniqueIndex] = {
            blendEquation: blendFunctions.blendEquationSeparate ?? defaultBlendEquation,
            blendFactors: getSupportedBlendFactors(blendFunctions.blendFuncSeparate, defaultBlendFactors)
          }
        }
      }

      // If CULL_FACE is not enabled, the material should be doubleSided
      if (!isStateEnabled(renderStates, WebGLConstants.CULL_FACE)) {
        materialProperties.doubleSided = true
      }

      delete techniqueLegacy.states
    }
  })

  if (Object.keys(blendingForTechnique).length > 0) {
    if (!defined(gltf.extensions)) {
      gltf.extensions = {}
    }

    addExtensionsUsed(gltf, "KHR_blend")
  }

  ForEach.material(gltf, function (material) {
    if (defined(material.technique)) {
      const materialProperties = materialPropertiesForTechnique[material.technique]
      ForEach.objectLegacy(materialProperties, function (value, property) {
        material[property] = value
      })

      const blending = blendingForTechnique[material.technique]
      if (defined(blending)) {
        if (!defined(material.extensions)) {
          material.extensions = {}
        }

        material.extensions.KHR_blend = blending
      }
    }
  })

  return gltf
}
