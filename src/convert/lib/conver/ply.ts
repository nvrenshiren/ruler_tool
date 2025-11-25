import { Conver } from "./conver"

export class PLYConver implements Conver {
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
      const o = this.assimp.ConvertFileList(s, "ply")
      t.push(o)
    }
    return t.map((t, r) => {
      if (!t.IsSuccess() || 0 === t.FileCount()) {
        throw new Error(t.GetErrorCode())
      }
      const i = t.GetFile(0).GetContent()
      return {
        name: e[r].name.split(".")[0] + "_" + e[r].name.split(".")[1] + ".ply",
        content: i
      }
    })
  }
}
