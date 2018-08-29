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

module.exports = {
  formatTime,
  mathRound
}
