import { assimpjs } from "../wasm/assimpjs"

export class AssimpLoader {
  assimp: null | any
  error: string | null
  constructor() {
    this.assimp = null
    this.error = null
  }
  async load() {
    if (!this.assimp) {
      try {
        this.assimp = await new Promise(resolve => {
          const module = {
            wasmBinaryFile: "../wasm/assimpjs.wasm"
          }
          assimpjs(module).then(e => {
            resolve(e)
          })
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
  getAssimp() {
    if (!this.assimp) throw new Error("AssimpJS is not loaded yet.")
    return this.assimp
  }
}
