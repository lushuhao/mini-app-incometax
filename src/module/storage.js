const KEY = {
  LOCATION: '_location',
  CITY: '_city',
  CITYLIST: '_cityList',
}

/**
 * 根据key获取缓存
 * @param key
 * @returns {*}
 */
function get(key) {
  return wx.getStorageSync(key)
}

/**
 * 根据key设置value到本地缓存
 * @param key
 * @param value
 */
function set(key, value) {
  wx.setStorageSync(key, value)
}

module.exports = {
  KEY,
  get,
  set
}