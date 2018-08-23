function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

function mathRound (number, precision = 2) {
  if (typeof number !== 'number') {
    return 0
  }
  number = (Math.round(number * 10 ** precision) / 10 ** precision).toFixed(precision)

  return number
}

export {
  formatTime,
  mathRound
}
