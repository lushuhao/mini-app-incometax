function objectEntriesPolyFill(obj) {
  return Object.keys(obj).map(key => {
    return [key, obj[key]]
  })
}

function objectValuesPolyFill(obj) {
  return Object.keys(obj).map(key => {
    return obj[key]
  })
}

Object.values = Object.values || objectValuesPolyFill
Object.entries = Object.entries || objectEntriesPolyFill