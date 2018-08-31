const axios = require('axios')

axios.defaults.baseURL = 'https://www.shebaotong.com/shebaotong/area'

// / 社保通接口
const apis = {
  getCityList: '/all',
  getBaseInfo: '/getInsOrg',
  getScale: '/cal'
}

// 获取全部缴费城市
function getCityList() {
  return axios
    .get(apis.getCityList)
    .then(res => {
      const {status, list} = res.data
      if (status === '200') {
        return list
      }
    })
}

/**
 * 根据城市获取社保基数
 * @param city
 * @returns {Promise.<TResult>}
 */
function getBaseInfoByCity(city) {
  return axios
    .get(apis.getBaseInfo, {
      params: {
        areaCode: city
      }
    })
    .then(res => {
      return res.data
    })
}

/**
 * 根据城市获取社保比例
 * @param city
 * @returns {Promise.<TResult>}
 */
function getScaleByCity(city) {
  return axios({
    method: 'post',
    url: apis.getScale,
    data: 'sbBase=3396.35&sbCode=anqingshebao', // body一行，用对象传入字符串识别不了
  }).catch(err => console.error(err))
}

module.exports = {
  apis,
  getCityList,
  getBaseInfoByCity,
  getScaleByCity
}