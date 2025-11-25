export class Conver {
  assimp: any
  convert: (e: File[]) => Promise<Array<{ name: string; content: Uint8Array }>>
}
