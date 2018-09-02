import {getCityList} from './api'

/**
 * 检查有效期
 * @description 一个月更新一次
 * @param createTime
 * @returns {boolean}
 */
function checkTheEffective(createTime) {
  return Date.now() - createTime < 30*24*60*60*1000
}

function getCityListInStorage() {
  return new Promise(resolve => {
    let {createTime, cityList} = wx.storage.get(wx.storage.KEY.CITYLIST)
    if (checkTheEffective(createTime)) {
      return resolve(cityList)
    }
    getCityList().then(res => {
      wx.storage.set(wx.storage.KEY.CITYLIST, {
        createTime: Date.now(),
        cityList: res
      })
      return resolve(res)
    })
  })
}

module.exports = {
  getCityListInStorage
}