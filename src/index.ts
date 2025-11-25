#!/usr/bin/env node
import { Command } from "commander"
import pkg from "../package.json"
import gltf from "./gltf"
import obj from "./obj"
import compressDracoMeshes from "./gltf/compressDracoMeshes"
import processGltf from "./gltf/processGltf"
import ktx2 from "./ktx"
import convert from "./convert"

const program = new Command("rulerTools")
program.version(pkg.version)
const GltfDefaults = processGltf.defaults
const dracoDefaults = compressDracoMeshes.defaults
const gltfCommand = program
  .command("gltf")
  .description("GLTF转换与Draco压缩")
  .option("-i, --input <path>", "GLTF或GLB文件的输入路径")
  .option("-o, --output <path>", "GLTF或GLB文件的输出路径。单独的资源将保存到同一目录中。")
  .option("-b, --binary", "将输入GLTF转换为GLB", false)
  .option("-a, --allowAbsolute", "允许glTF文件引用其源路径之外的文件URL", false)
  .option("-j, --json", "将输入GLB转换为GLTF", false)
  .option("-s, --separate", "编写单独的缓冲区、着色器和纹理，而不是将它们嵌入到glTF中", GltfDefaults.separate)
  .option("-t, --separateTextures", "输出单独的纹理", GltfDefaults.separateTextures)
  .option("--stats", "将统计信息打印到控制台", GltfDefaults.stats)
  .option("--keepUnusedElements", "保留未使用的材质、节点和网格。", GltfDefaults.keepUnusedElements)
  .option("--keepLegacyExtensions", "当为false时，具有KHR_techniques_webgl、KHR_blend或KHR_materials_mon的材料将转换为PBR", GltfDefaults.keepLegacyExtensions)
  .option("-d, --draco.compressMeshes", "使用Draco压缩网格", GltfDefaults.compressDracoMeshes)
  .option("--draco.compressionLevel <number>", "Draco压缩级别[0-10]", dracoDefaults.compressionLevel.toString())
  .option("--draco.quantizePositionBits <number>", "使用Draco压缩时位置属性的量化位", dracoDefaults.quantizePositionBits.toString())
  .option("--draco.quantizeNormalBits <number>", "使用Draco压缩时，正常属性的量化位", dracoDefaults.quantizeNormalBits.toString())
  .option("--draco.quantizeTexcoordBits <number>", "使用Draco压缩时纹理坐标属性的量化位", dracoDefaults.quantizeTexcoordBits.toString())
  .option("--draco.quantizeColorBits <number>", "使用Draco压缩时颜色属性的量化位", dracoDefaults.quantizeColorBits.toString())
  .option("--draco.quantizeGenericBits <number>", "使用Draco压缩时通用属性的量化位", dracoDefaults.quantizeGenericBits.toString())
  .option("--draco.uncompressedFallback", "添加压缩网格的未压缩回退版本", dracoDefaults.uncompressedFallback)
  .option(
    "--draco.unifiedQuantization",
    "使用由所有图元的统一边界框定义的相同量化网格来量化所有图元的位置。如果未设置此选项，则分别对每个图元应用量化，这可能会导致不同图元之间出现间隙。",
    dracoDefaults.unifiedQuantization
  )
  .option("--baseColorTextureNames", "从KHR_techniques_webgl扩展名更新为PBR材质时，应考虑引用基色纹理的制服名称")
  .option("--baseColorFactorNames", "从KHR_techniques_webgl扩展名更新为PBR材质时，应考虑参考基色因素的制服名称")
  .action(async options => {
    const dracoOptions: Record<string, any> = {}
    Object.keys(options).forEach(key => {
      if (key.startsWith("draco.")) {
        const subKey = key.replace("draco.", "")
        dracoOptions[subKey] = +options[key]
      }
    })
    options.draco = dracoOptions
    gltf(options)
  })

const objCommand = program
  .command("obj")
  .description("OBJ转换")
  .option("-i, --input <path>", "OBJ文件的输入路径")
  .option("-o, --output <path>", "GLTF或GLB文件的输出路径")
  .option("-b, --binary", "将输出保存为二进制glTF (.glb)", false)
  .option("-s, --separate", "编写单独的缓冲区和纹理，而不是将它们嵌入到glTF中", false)
  .option("-t, --separateTextures", "输出单独的纹理", false)
  .option("--checkTransparency", "通过查看每个像素的Alpha通道，对纹理透明度进行更全面的检查。默认情况下，纹理被视为不透明的。", false)
  .option("--secure", "阻止转换器读取输入obj目录以外的纹理或mtl文件。", false)
  .option("--packOcclusion", "将遮挡纹理打包到金属粗糙度纹理的红色通道中。", false)
  .option(
    "--metallicRoughness",
    ".mtl 文件中的值已经是金属粗糙度 PBR 值，不应应用任何转换步骤。金属存储在 Ks 和 map_Ks 插槽中，粗糙度存储在 Ns 和 map_Ns 插槽中-粗糙度工作流程",
    false
  )
  .option(
    "--specularGlossiness",
    ".mtl 文件中的值已经是镜面光泽度 PBR 值，不应应用任何转换步骤。镜面反射存储在 Ks 和 map_Ks 插槽中，光泽度存储在 Ns 和 map_Ns 插槽中。glTF将应用KHR_materials_pbrSpecularGlossiness扩展",
    false
  )
  .option("--unlit", "GLTF将应用KHR_materials_unlit扩展", false)
  .option(
    "--metallicRoughnessOcclusionTexture",
    "金属粗糙度遮挡纹理的路径，该纹理应覆盖 .mtl 文件中的纹理，其中遮挡存储在红色通道中，粗糙度存储在绿色通道中，金属存储在蓝色通道中。模型将使用 pbrMetallicRoughness 材质保存。这在 .mtl 不存在或未设置为使用 PBR 材质的工作流程中通常很方便。适用于具有单一材质的模型"
  )
  .option(
    "--specularGlossinessTexture",
    "应覆盖.mtl文件中纹理的镜面光泽度纹理的路径，其中镜面颜色存储在红色、绿色和蓝色通道中，镜面光泽度存储在alpha通道中。模型将使用KHR_materials_pbrSpecularGlossness扩展名与材质一起保存。"
  )
  .option("--occlusionTexture", "应覆盖.mtl文件中纹理的遮挡纹理的路径。")
  .option("--normalTexture", "应覆盖.mtl文件中纹理的正常纹理的路径。")
  .option("--baseColorTexture", "应覆盖.mtl文件中纹理的baseColor/漫反射纹理的路径。")
  .option("--emissiveTexture", "应覆盖.mtl文件中纹理的发射纹理的路径。")
  .option("--alphaTexture", "应该覆盖.mtl文件中纹理的alpha纹理的路径。")
  .option("--inputUpAxis", "obj的上轴。", "Y")
  .option("--outputUpAxis", "转换后的glTF的上轴。", "Y")
  .option("--triangleWindingOrderSanitization", "采用三角缠绕顺序", false)
  .option("--doubleSidedMaterial", "允许材料属性为双面", false)
  .action(async options => {
    obj(options)
  })
const ktxCommand = program
  .command("ktx")
  .description("图片转换为KTX2")
  .option("-i, --input <path>", "图片文件的输入路径")
  .option("-o, --output <path>", "KTX2文件的输出路径")
  .option("-u, --uastc", "使用UASTC压缩，否则使用ETC1S压缩", false)
  .option("-q, --qualityLevel <number>", "质量等级，范围0-255，默认230", "230")
  .option("-m, --mipmap", "生成mipmap", false)
  .action(async options => {
    await ktx2(options)
  })
const convertCommand = program
  .command("convert")
  .description("模型互相转换")
  .option("-i, --input <path>", "源模型文件的输入路径")
  .option("-t, --type <type>", "转换的格式,obj,ply,glb2,collada,fbx,stl,gltf2,默认gltf2", "gltf2")
  .action(async options => {
    await convert(options)
  })

program.parse(process.argv)
