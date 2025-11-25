import { Conver } from "./conver"

export class GLTF2Conver implements Conver {
  assimp: any
  constructor(e) {
    this.assimp = e
  }
  async convert(e: File[]) {
    const t: any[] = []
    for (let r = 0; r < e.length; r++) {
      const n = e[r]
      const i = await n.arrayBuffer()
      const s = new this.assimp.FileList()
      s.AddFile(n.name, new Uint8Array(i))
      const o = this.assimp.ConvertFileList(s, "gltf2")
      t.push(o)
    }
    return t
      .map((t, r) => {
        if (!t.IsSuccess() || 0 === t.FileCount()) {
          throw new Error(t.GetErrorCode())
        }
        return [
          {
            name: e[r].name.split(".")[0] + "_" + e[r].name.split(".")[1] + ".gltf",
            content: t.GetFile(0).GetContent()
          },
          {
            name: e[r].name.split(".")[0] + "_" + e[r].name.split(".")[1] + ".bin",
            content: t.GetFile(1).GetContent()
          }
        ]
      })
      .flat()
  }
}
