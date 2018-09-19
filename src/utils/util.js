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

/**
 * 对数字四舍五入，并保留小数
 * @param number
 * @param precision
 * @returns {*}
 */
const mathRound = (number, precision = 2) => {
  if (typeof number !== 'number') {
    number = 0
  } else {
    number = (Math.round(number * 10 ** precision) / 10 ** precision)
  }
  return number.toFixed(precision)
}

/**
 * 节流
 * @desc 通过对象是引用的性质，将标志位赋值到外层
 * @param cb
 * @param delay
 */
function throttle(cb, delay = 1000 / 60) {
  const [, , context, ...args] = Array.from(arguments)
  if (cb.run) return
  cb.run = true
  setTimeout(() => {
    cb.apply(context, args)
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
  if (typeof str !== 'string') return Number(str) || 0
  return str.split(/(\d+\.\d+)|(\d+)/).map(item => Number(item)).find(item => item)
}

module.exports = {
  formatTime,
  mathRound,
  throttle,
  debounce,
  splitString2Number
}
