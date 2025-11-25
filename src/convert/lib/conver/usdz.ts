import { Conver } from "./conver"
import { GLB2Conver } from "./glb2"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js"
export class USDZConver implements Conver {
  assimp: any
  constructor(e) {
    this.assimp = e
  }
  async convert(e: File[]) {
    const t = new GLB2Conver(this.assimp)
    const n = await t.convert(e)
    const r: typeof n = []
    const i = new GLTFLoader()
    const s = new USDZExporter()
    for (let o = 0; o < e.length; o++) {
      const t = n[o].content.buffer
      const a = await new Promise<typeof n>((n, r) => {
        i.parse(
          t,
          "",
          async t => {
            const i = t.scene
            try {
              const t = await s.parseAsync(i)
              t
                ? n([
                    {
                      name: e[o].name.split(".")[0] + "_" + e[o].name.split(".")[1] + ".usdz",
                      content: t
                    }
                  ])
                : r(new Error("USDZ export failed: arrayBufferUSDZ is undefined"))
            } catch (ag) {
              console.error("Error during USDZ export:", ag)
              r(ag)
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
