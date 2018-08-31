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

module.exports = {
  writeJson,
  obj2array
}