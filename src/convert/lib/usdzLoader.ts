import { Mesh, Scene } from "three"
import { USDZLoader as THREEUSDZLoader } from "three/examples/jsm/loaders/USDZLoader.js"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"
export class USDZLoader {
  scene: Scene
  loader: THREEUSDZLoader
  constructor() {
    this.scene = new Scene()
    this.loader = new THREEUSDZLoader()
  }
  async loadFile(e: Blob) {
    return this.loader.loadAsync(URL.createObjectURL(e))
  }
  async exportToGLB(e: Mesh, t) {
    return new Promise<File>((n, r) => {
      new GLTFExporter().parse(
        e,
        e => {
          const r = new Blob([JSON.stringify(e)], {
            type: "application/octet-stream"
          })
          const i = t.replace(/\.[^/.]+$/, "") + ".glb"
          const s = new File([r], i, {
            type: "application/octet-stream"
          })
          n(s)
        },
        () => {},
        {
          binary: !0,
          includeCustomExtensions: !0
        }
      )
    })
  }
  async loadAndConvert(e: File) {
    const mesh = await this.loadFile(e)
    const glb = await this.exportToGLB(mesh, e.name)
    this.scene.remove(mesh)
    return glb
  }
}
