import {getCityList, getCityBase, getSocialList} from './api'

/**
 * 检查有效期
 * @description 一个月更新一次
 * @param createTime
 * @returns {boolean}
 */
function checkTheEffective(createTime) {
  return Date.now() - createTime < 30 * 24 * 60 * 60 * 1000
}

/**
 * 获取mock数据
 * @desc 缓存数据过期后，重新获取
 * @param storageKey
 * @param apiHandle
 * @returns {Promise}
 */
function getListInStorage(storageKey, apiHandle) {
  return new Promise(resolve => {
    let {createTime, list} = wx.storage.get(storageKey)
    if (checkTheEffective(createTime)) {
      return resolve(list)
    }
    apiHandle().then(list => {
      wx.storage.set(storageKey, {
        createTime: Date.now(),
        list
      })
      return resolve(list)
    })
  })
}

/**
 * 获取城市列表
 * @returns {Promise}
 */
function getCityListInStorage() {
  return getListInStorage(
    wx.storage.KEY.CITY_LIST,
    getCityList
  )
}

/**
 * 获取社保基数
 * @returns {Promise}
 */
function getCityBaseInStorage() {
  return getListInStorage(
    wx.storage.KEY.CITY_BASE,
    getCityBase
  )
}


/**
 * 获取社保比例
 * @returns {Promise}
 */
function getSocialListInStorage() {
  return getListInStorage(
    wx.storage.KEY.SOCIAL_LIST,
    getSocialList
  )
}

module.exports = {
  getCityListInStorage,
  getCityBaseInStorage,
  getSocialListInStorage
}