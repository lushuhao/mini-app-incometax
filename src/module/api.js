const apiUrls = {
  geoCoder: 'https://apis.map.qq.com/ws/geocoder/v1/?location=',
  preMock: 'https://wx.lushuhao.xyz',
  cityList: 'https://wx.lushuhao.xyz/mock/cityList.json',
  cityBase: 'https://wx.lushuhao.xyz/mock/cityBase.json',
  socialList: 'https://wx.lushuhao.xyz/mock/socialList.json',
}

/**
 * 封装request
 * @param opts
 * @returns {Promise}
 */
function fetch(opts) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...opts,
      success(res) {
        resolve(res.data)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

/**
 * 通过定位获取地址
 * @description 逆地址解析
 * @param lat 经度
 * @param lng 纬度
 * @returns {*}
 */
function getAddressByLocation(lat, lng) {
  const QQ_MAP_KEY = 'EFVBZ-ZOBKP-O2ZD5-LGKRT-RJVA7-Q2FS6'
  return wx.fetch({
    url: apiUrls.geoCoder,
    data: {
      location: `${lat},${lng}`,
      key: QQ_MAP_KEY
    }
  })
}

/**
 * 获取城市列表
 * @returns {*}
 */
function getCityList() {
  return wx.fetch({
    url: apiUrls.cityList,
  })
}

/**
 * 获取社保基数
 * @returns {*}
 */
function getCityBase() {
  return wx.fetch({
    url: apiUrls.cityBase
  })
}

/**
 * 获取社保比例
 * @returns {*}
 */
function getSocialList() {
  return wx.fetch({
    url: apiUrls.socialList
  })
}

module.exports = {
  fetch,
  getAddressByLocation,
  getCityList,
  getCityBase,
  getSocialList
}