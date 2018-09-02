const path = require('path')

const colors = require('ansi-colors')
const log = require('fancy-log')

const {getCityList, getBaseInfoByCity, getScaleBySocial} = require('./api')
const {dataDirPath, dataName} = require('./config')
const {writeJson, obj2array, recursionGenJson} = require('./util')

function genCityListJson() {
  return getCityList().then(res => {
    return writeJson(res, dataName.city)
  })
}

function genAllCityBaseJson() {
  const cityList = require(path.resolve(dataDirPath, dataName.city))

  // 获取全部城市code
  const cityCodeArray = obj2array(cityList).map(item => {
    return item.value
  })

  recursionGenJson(cityCodeArray, getBaseInfoByCity)
    .then(data => {
      writeJson(data, dataName.cityBase)
    })
}

function genAllCityScaleJson() {
  const cityBase = require(path.resolve(dataDirPath, dataName.cityBase))
  // 获取所有城市社保code
  const socialCodeList = Object.keys(cityBase).map(item => {
    return {
      [item]: cityBase[item].shebao[0].code
    }
  })

  recursionGenJson(socialCodeList, getScaleBySocial)
    .then(data => {
      // console.log(data)
      writeJson(data, dataName.social)
    })
    .catch(res => {
      log(colors.red(res))
    })
}

genCityListJson()
//   .then(() => {
//     genAllCityBaseJson()
//   })

// genAllCityBaseJson()

// genAllCityScaleJson()


