import { Conver } from "./conver/conver"

export class Converter {
  converters: Record<string, Conver>
  constructor() {
    this.converters = {}
  }
  registerConverter(e: string, t: Conver) {
    this.converters[e] = t
  }
  async convert(e: File[], t: string) {
    const n = this.converters[t]
    if (!n) throw new Error(`No converter registered for target type: ${t}`)
    return await n.convert(e)
  }
}
