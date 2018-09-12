import {getAddressByLocation} from './api'

/**
 * 获取缓存中的位置
 */
function getLocationInStorage() {
  return wx.storage.get(wx.storage.KEY.LOCATION)
}

/**
 * 存储位置的有效期
 * @returns {number}
 */
function locationEffective() {
  return new Date().getDay()
}

/**
 * 检查缓存的location是否在有效期内
 * @returns {boolean}
 */
function checkLocationEffective() {
  const {location, date} = getLocationInStorage()
  return location && date === locationEffective()
}

/**
 * 获取经纬度
 */
function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

/**
 * 存储location
 * @param location
 * @returns {Promise.<TResult>}
 */
function setLocation(location) {
  wx.storage.set(wx.storage.KEY.LOCATION, location)
  const {latitude, longitude} = location
  return getAddressByLocation(latitude, longitude)
    .then(res => {
      const {status, result} = res
      if (status === 0) {
        const {location, address_component} = result
        wx.storage.set(wx.storage.KEY.LOCATION, {
          location,
          address_component,
          date: locationEffective()
        })
      }
    })
}

/**
 * 获取当前地址
 * @returns {Promise}
 */
function getCurrentAddress() {
  return new Promise(resove => {
    if (checkLocationEffective()) {
      return resove(getLocationInStorage())
    }
    return getLocation()
      .then(location => {
        return setLocation(location)
      })
      .then(() => {
        resove(getLocationInStorage())
      })
      .catch((err) => {
        console.error(err)
      })
  })
}

/**
 * 获取当前城市
 */
function getCurrentCity() {
  return wx.storage.get(wx.storage.KEY.CITY)
}

/**
 * 设置当前城市
 * @param city
 */
function setCurrentCity(city) {
  return wx.storage.set(wx.storage.KEY.CITY, city)
}

module.exports = {
  getCurrentAddress,
  getCurrentCity,
  setCurrentCity,
  getLocationInStorage
}