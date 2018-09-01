const storageKey = {
  location: '_location'
}

/**
 * 根据key获取缓存
 * @param key
 * @returns {*}
 */
function getStorage(key) {
  return wx.getStorageSync(key)
}

/**
 * 根据key设置value到本地缓存
 * @param key
 * @param value
 */
function setStorage(key, value) {
  wx.setStorageSync(key, value)
}

module.exports = {
  storageKey,
  getStorage,
  setStorage
}