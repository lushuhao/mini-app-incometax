const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const mathRound = (number, precision = 2) => {
  if (typeof number !== 'number') {
    return 0
  }
  number = (Math.round(number * 10 ** precision) / 10 ** precision).toFixed(precision)

  return number
}

/**
 * 节流
 * @desc 通过对象是引用的性质，将标志位赋值到外层
 * @param cb
 * @param delay
 * @param context
 * @param args
 */
const throttle = (cb, delay = 1000 / 60, context, ...args) => {
  if (cb.run) return
  cb.run = true
  cb.apply(context, args)
  setTimeout(() => {
    cb.run = false
  }, delay)
}

/**
 * 去抖
 * @desc 通过对象是引用的性质，将tid赋值到外层
 * @param cb
 * @param delay
 * @param context
 */
const debounce = (cb, delay = 100, context) => {
  clearTimeout(cb.tid)
  cb.tid = setTimeout(() => {
    cb.call(context)
  }, delay)
}
/**
 * 取出字符串中的数字
 * @desc 不包括0
 * @param str
 * @returns Number
 */
const splitString2Number = (str) => {
  return str.split(/(\d+)/).map(item => Number(item)).find(item => item)
}

module.exports = {
  formatTime,
  mathRound,
  throttle,
  debounce,
  splitString2Number
}
