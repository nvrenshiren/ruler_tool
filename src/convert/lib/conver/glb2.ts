import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Conver } from "./conver"
export class GLB2Conver implements Conver {
  assimp: any
  loader: GLTFLoader
  constructor(e) {
    this.assimp = e
    this.loader = new GLTFLoader()
  }
  async convert(e: File[]) {
    const t: any[] = []
    for (let r = 0; r < e.length; r++) {
      const n = e[r]
      const i = await n.arrayBuffer()
      const s = new this.assimp.FileList()
      s.AddFile(n.name, new Uint8Array(i))
      const o = this.assimp.ConvertFileList(s, "glb2")
      t.push(o)
    }
    return t.map((t, r) => {
      if (!t.IsSuccess() || 0 === t.FileCount()) {
        throw new Error(t.GetErrorCode())
      }
      const i = t.GetFile(0).GetContent()
      return {
        name: e[r].name.split(".")[0] + "_" + e[r].name.split(".")[1] + ".glb",
        content: i
      }
    })
  }
  async checkMaterials(e) {
    return new Promise((t, n) => {
      this.loader.parse(
        e.buffer,
        "",
        e => {
          const n: any[] = []
          e.scene.traverse((e: any) => {
            if (e.isMesh) {
              if (e.material) {
                const t = {
                  name: e.material.name || "Unnamed Material",
                  hasTexture: !1
                }
                if (
                  e.material.map ||
                  e.material.aoMap ||
                  e.material.emissiveMap ||
                  e.material.bumpMap ||
                  e.material.normalMap ||
                  e.material.displacementMap ||
                  e.material.roughnessMap ||
                  e.material.metalnessMap ||
                  e.material.alphaMap ||
                  e.material.envMap
                ) {
                  t.hasTexture = !0
                }

                n.push(t)
              } else {
                n.push({
                  name: "Missing Material",
                  hasTexture: !1
                })
              }
            }
          })
          t(n)
        },
        e => {
          n(e)
        }
      )
    })
  }
}
