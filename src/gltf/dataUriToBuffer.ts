export default function dataUriToBuffer(dataUri: string) {
  const data = dataUri.slice(dataUri.indexOf(",") + 1)
  if (dataUri.indexOf("base64") >= 0) {
    return Buffer.from(data, "base64")
  }
  return Buffer.from(data, "utf8")
}
