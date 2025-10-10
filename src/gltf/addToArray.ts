export default function addToArray(array, element, checkDuplicates?: boolean) {
  checkDuplicates = checkDuplicates ?? false
  if (checkDuplicates) {
    const index = array.indexOf(element)
    if (index > -1) {
      return index
    }
  }

  array.push(element)
  return array.length - 1
}
