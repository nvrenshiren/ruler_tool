import { createReadStream } from "fs-extra"
import Promise from "bluebird"
import { createInterface } from "readline"
import { once } from "events"

export default readLines

/**
 * Read a file line-by-line.
 *
 * @param {String} path Path to the file.
 * @param {Function} callback Function to call when reading each line.
 * @returns {Promise} A promise when the reader is finished.
 *
 * @private
 */
function readLines(path: string, callback) {
  const stream = createReadStream(path)
  return once(stream, "open").then(function () {
    return new Promise(function (resolve, reject) {
      stream.on("error", reject)
      stream.on("end", resolve)

      const lineReader = createInterface({
        input: stream
      })

      const callbackWrapper = function (line) {
        try {
          callback(line)
        } catch (error) {
          reject(error)
        }
      }

      lineReader.on("line", callbackWrapper)
    })
  })
}
