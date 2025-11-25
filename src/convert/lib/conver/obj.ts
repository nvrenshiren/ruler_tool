import { Texture } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Conver } from "./conver"
import { GLB2Conver } from "./glb2"

class MTLParse {
  parse(e: any) {
    let mtlString = ""
    const n = new Map<string, Texture>()
    e.traverse(e => {
      if (e.isMesh) {
        const r = e.material
        if (r) {
          mtlString += `newmtl ${r.name}\n`
          mtlString += `Tr ${1 - (void 0 !== r.opacity ? r.opacity : 1)}\n`
          mtlString += `Tf ${r.color.r} ${r.color.g} ${r.color.b}\n`
          mtlString += "illum 1\n"
          mtlString += `Pm ${void 0 !== r.metalness ? r.metalness : 0}\n`
          mtlString += `Pr ${void 0 !== r.roughness ? r.roughness : 1}\n`
          mtlString += "Pds 1\n"
          mtlString += "Pl 1\n"
          mtlString += `Ka ${r.color.r} ${r.color.g} ${r.color.b}\n`
          mtlString += `Kd ${r.color.r} ${r.color.g} ${r.color.b}\n`
          mtlString += `Ke ${r.emissive ? r.emissive.r : 0} ${r.emissive ? r.emissive.g : 0} ${r.emissive ? r.emissive.b : 0}\n`
          if (r.map) {
            const e = this.getTextureName(r.map)
            mtlString += `map_Kd ${e}\n`
            n.set(e, r.map)
          }
          if (r.metalnessMap) {
            const e = this.getTextureName(r.metalnessMap)
            mtlString += `map_Pm ${e}\n`
            n.set(e, r.metalnessMap)
          }
          if (r.roughnessMap) {
            const e = this.getTextureName(r.roughnessMap)
            mtlString += `map_Pr ${e}\n`
            n.set(e, r.roughnessMap)
          }
          if (r.normalMap) {
            const e = this.getTextureName(r.normalMap)
            mtlString += `norm ${e}\n`
            n.set(e, r.normalMap)
          }
          if (r.emissiveMap) {
            const e = this.getTextureName(r.emissiveMap)
            mtlString += `map_Ke ${e}\n`
            n.set(e, r.emissiveMap)
          }
          mtlString += "\n"
        }
      }
    })
    const textures: any[] = []
    n.forEach((texture, name) => {
      textures.push({
        name,
        content: this.exportTexture(texture)
      })
    })
    return {
      mtlString,
      textures
    }
  }
  getTextureName(e: Texture) {
    const t = this.getTextureExtension(e)
    return e.name ? `${e.name}.${t}` : `texture_${e.id}.${t}`
  }
  getTextureExtension(e: Texture) {
    if (e.image && e.image.src) {
      const t = new URL(e.image.src).pathname.split(".").pop()
      return t || "jpg"
    }
    return "jpg"
  }
  exportTexture(e: Texture) {
    const t = document.createElement("canvas")
    t.width = e.image.width
    t.height = e.image.height
    t.getContext("2d")?.drawImage(e.image, 0, 0)
    const n = t.toDataURL("image/png").split(",")[1]
    return Uint8Array.from(atob(n), e => e.charCodeAt(0))
  }
}

export class OBJConver implements Conver {
  assimp: any
  constructor(e) {
    this.assimp = e
  }
  async convert_obj(e) {
    let t
    const n: any[] = []
    for (let r = 0; r < e.length; r++) {
      const t = e[r]
      const i = await t.arrayBuffer()
      const s = new this.assimp.FileList()
      s.AddFile(t.name, new Uint8Array(i))
      const o = this.assimp.ConvertFileList(s, "obj")
      n.push(o)
    }
    n.map((n, r) => {
      if (!n.IsSuccess() || 0 === n.FileCount()) {
        throw new Error(n.GetErrorCode())
      }

      const i = n.GetFile(0).GetContent()
      t = {
        name: e[r].name.split(".")[0] + "_" + e[r].name.split(".")[1] + ".obj",
        content: i
      }
    })
    return t as { name: string; content: any }
  }
  async convert(e: File[]) {
    const t = new GLB2Conver(this.assimp)
    const n = await t.convert(e)
    const r: typeof n = []
    const i = new GLTFLoader()
    const s = new MTLParse()
    for (let o = 0; o < e.length; o++) {
      const t = n[o].content.buffer
      const a = await new Promise<typeof n>((n, r) => {
        i.parse(
          t,
          "",
          async t => {
            const i = t.scene
            try {
              const t = await this.convert_obj(e)
              const { mtlString, textures } = s.parse(i)
              if (mtlString) {
                const r = [
                  t,
                  {
                    name: e[o].name.split(".")[0] + "_" + e[o].name.split(".")[1] + ".mtl",
                    content: new TextEncoder().encode(mtlString)
                  }
                ]
                textures.forEach(e => {
                  r.push({
                    name: e.name,
                    content: e.content
                  })
                })
                n(r)
              } else r(new Error("OBJ or MTL export failed"))
            } catch (error) {
              console.error("Error during OBJ/MTL export:", error)
              r(error)
            }
          },
          e => {
            console.error("Error during GLTF loading:", e)
            r(e)
          }
        )
      })
      a && r.push(...a)
    }
    return r
  }
}
