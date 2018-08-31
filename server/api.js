const axios = require('axios')

// / 社保通接口
const apis = {
  getCityList: 'https://www.shebaotong.com/shebaotong/area/all',
  getBaseInfo: 'https://www.shebaotong.com/shebaotong/area/getInsOrg'
}

// 获取全部缴费城市
function getCityList() {
  return axios
    .get(apis.getCityList)
    .then(res => {
      const { status, list } = res.data
      if (status === '200') {
        return list
      }
    })
}

/**
 * 根据城市获取社保基数
 * @param city
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

module.exports = {
  getCityList,
  getBaseInfoByCity
}