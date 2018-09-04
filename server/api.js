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
 * @returns {Promise}
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
 * 根据社保code获取社保比例
 * @param social
 * @returns {Promise}
 */
function getScaleBySocial(social) {
  return axios({
    method: 'post',
    url: apis.getScale,
    data: `sbBase=0&sbCode=${social}`, // body一行，用对象传入字符串识别不了
  }).then(res => {
    const scocialItems = res.data.shebao.items
    const social = {myScale: {}, companyScale: {}}
    scocialItems.forEach(item => {
      const key = socialInsuranceType[item.itemName]
      if (!key) return
      /**
       * 无百分比的，取固定金额
       * 医疗保险与个人医疗保险重复，取其中有值的进行赋值
       */
      social.myScale[key] = item.empProp.split(/×/)[1] || social.myScale[key] || item.empFee
      social.companyScale[key] = item.orgProp.split(/×/)[1] || social.companyScale[key] || item.orgFee
    })
    return social
  })
}

const socialInsuranceType = {
  ['养老保险']: 'endowment',
  ['医疗保险']: 'medical',
  ['个人医疗保险']: 'medical',
  ['单位医疗保险']: 'medical',
  ['大病医疗保险']: 'seriousDiseases',
  ['失业保险']: 'unemployment',
  ['工伤保险']: 'employment',
  ['生育保险']: 'birth'
}

module.exports = {
  apis,
  getCityList,
  getBaseInfoByCity,
  getScaleBySocial
}