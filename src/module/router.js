import routers from '../collect/routers'

/**
 * 重新封装路由
 * @param url
 */
function navigateTo(url) {
  wx.navigateTo({
    url
  })
}

module.exports = {
  routers,
  navigateTo
}