const path = require('path')

const colors = require('ansi-colors')
const log = require('fancy-log')

const { getCityList, getBaseInfoByCity, getScaleByCity } = require('./api')
const { dataDirPath, dataName } = require('./config')
const { writeJson, obj2array } = require('./util')

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

  let counter = 0
  const maxLength = cityCodeArray.length || -1
  let data = {}
  const timer = setInterval(() => {
    if (counter >= maxLength) {
      writeJson(data, dataName.cityBase)
      return clearInterval(timer)
    }
    const cityCode = cityCodeArray[counter++]
    getBaseInfoByCity(cityCode)
      .then(res => {
        data[cityCode] = res
        log(colors.green(`[${counter} / ${cityCodeArray.length}]`), colors.cyan(cityCode))
      })
      .catch(err => {
        log(colors.red(`[${counter} / ${maxLength}]`), colors.yellow(cityCode), colors.magenta(err))
      })
  }, 1000)
}

function genAllCityScaleJson() {
  getScaleByCity().then(res => {
    log(res.data.shebao)
  })
}

// genCityListJson().then(() => {
//   genAllCityBaseJson()
// })

genAllCityScaleJson()


