const apiUrls = {
  geoCoder: 'https://apis.map.qq.com/ws/geocoder/v1/?location='
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

module.exports = {
  fetch,
  getAddressByLocation
}