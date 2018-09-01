const path = require('path')

const dataDirPath = path.resolve(__dirname, '../mock/data')

const dataName = {
  city: 'cityList.json',
  cityBase: 'cityBase.json',
  social: 'socialList.json'
}

module.exports = {
  dataDirPath,
  dataName
}