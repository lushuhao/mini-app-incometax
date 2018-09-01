const fs = require('fs')
const path = require('path')

const colors = require('ansi-colors')
const log = require('fancy-log')

const { dataDirPath } = require('./config')

/**
 * 将数据以json文件存入
 * @param data Object
 * @param fileName String
 */
function writeJson(data, fileName) {
  if (typeof data === 'object') {
    data = JSON.stringify(data)
  }
  const filePath = genFilePath(fileName)
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) reject(err)
      log(colors.green(fileName + ' 写入成功'))
      resolve(fileName)
    })
  })
}

/**
 * 生成文件路径
 * @param fileName
 */
function genFilePath(fileName) {
  return path.resolve(dataDirPath, fileName)
}

/**
 * 对象转数组
 * @param obj
 * @returns {Array.<T>}
 */
function obj2array(obj) {
  return Array.prototype.concat(...Object.values(obj))
}

/**
 * 遍历数组调用接口并合并数据
 * @param codeArray
 * @param apiHandle
 * @returns {Promise}
 */
function recursionGenJson(codeArray, apiHandle) {
  return new Promise(resolve => {
    let counter = 0
    const maxLength = codeArray.length || -1
    let data = {}
    const timer = setInterval(() => {
      if (counter >= maxLength) {
        clearInterval(timer)
        return resolve(data)
      }
      const codeInfo = codeArray[counter++]
      const code = typeof codeInfo === 'object' ? Object.values(codeInfo)[0] : codeInfo
      const key = typeof codeInfo === 'object' ? Object.keys(codeInfo)[0] : codeInfo
      apiHandle(code)
        .then(res => {
          data[key] = res
          log(colors.green(`[${counter} / ${codeArray.length}]`), colors.cyan(key))
        })
        .catch(err => {
          log(colors.red(`[${counter} / ${maxLength}]`), colors.yellow(key), colors.magenta(err))
        })
    }, 1000)
  })
}

module.exports = {
  writeJson,
  obj2array,
  recursionGenJson
}