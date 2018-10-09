import { setCurrentCity, getLocationInStorage, getCurrentAddress } from '../../module/location'
import { getCityListInStorage } from '../../module/mock'
import { throttle } from '../../utils/util'

const hotCity = ['北京', '上海', '广州', '深圳', '天津', '南京', '杭州', '武汉', '重庆']

Page({
  data: {
    cityList: [],
    cityKeyList: [], // 城市首字母列表
    scrollTop: 0,
    toCityKey: '', // 滚动位置的城市首字母
    showToast: false,
    touch: false, // touch事件触发
    hasAuth: true, // 是否授权定位
  },
  onLoad() {
    this.getCityList()
    wx.user.getSystemInfo().then(systemInfo => {
      this.windowHeight = systemInfo.windowHeight
    })
  },
  getCityList() {
    getCityListInStorage()
      .then(cityList => {
        this.cityList = cityList
        const list = {
          '定': this.setLocationCity(),
          '热': this.setHotCity(),
          ...cityList
        }
        this.setData({
          cityList: list,
          cityKeyList: Object.keys(list)
        }, () => {
          this.getShortCutOffset()
        })
      })
  },
  setLocationCity(location) {
    location = location || getLocationInStorage()
    const { city } = location && location.address_component
    if (city) {
      return [this.getCityInfo(city)]
    } else {
      wx.getSetting({
        success: (res) => {
          const hasAuth = !!res.authSetting['scope.userLocation']
          this.setData({
            hasAuth
          })
        }
      })
    }
    return [{ name: '定位失败' }]
  },
  setHotCity() {
    return hotCity.map(city => {
      return this.getCityInfo(city)
    })
  },
  /**
   * 通过cityName获取详细
   * @param city
   * @returns {T}
   */
  getCityInfo(city) {
    if (!this.list) {
      const keyList = Object.values(this.cityList)
      this.list = [].concat(...keyList)
    }
    return this.list.find(item => city.includes(item.name))
  },
  selectCity(e) {
    const city = e.currentTarget.dataset.city
    if (city.name === '定位失败') return
    setCurrentCity(city)
    wx.navigateBack()
  },
  openSetting(res) {
    const { detail, type } = res
    if (type !== 'opensetting') return
    const hasAuth = detail.authSetting['scope.userLocation'] || ''
    if (hasAuth) {
      getCurrentAddress().then((location) => {
        this.setData({
          'cityList.定': this.setLocationCity(location),
          hasAuth
        })
      })
    }
  },
  getShortCutOffset() {
    wx.createSelectorQuery().selectAll('.item').boundingClientRect((rect) => {
      this.targetList = rect
    }).exec()
    wx.createSelectorQuery().selectAll('.cityKey').boundingClientRect((rect) => {
      this.viewTargetList = rect.map(item => {
        return {...item, bottom: item.bottom + 10, top: item.top - 10}
      })
    }).exec()
  },
  /**
   * 滚动事件
   * @description touch事件触发时，跳过
   * @param e
   */
  scroll(e) {
    if (this.touch) return
    this.target = null
    const scrollY = e.detail.scrollTop
    this.viewTargetList.forEach((item, index) => {
      const { top, bottom } = item
      /**
       * 可视外区域跳过循环
       * target不变跳过循环
       */
      if (top - this.windowHeight / 2 > scrollY ||
        bottom + this.windowHeight / 2 < scrollY ||
        this.target && this.target.id === item.id) {
        return
      }
      /**
       * 三个首字母所在行[lastTop, lastBottom],[top，bottom],[nextTop, nextBottom]
       * 滚动到一定区域认为已滚动到item
       * 上方区域， [lastBottom, top]
       * 下方区域， [bottom, nextTop]
       */
      const lastIndex = index <= 0 ? 0 : index - 1
      const last = this.viewTargetList[lastIndex]
      const nextIndex = index >= this.viewTargetList.length - 1 ? this.viewTargetList.length - 1 : index + 1
      const next = this.viewTargetList[nextIndex]
      const lastY = top - (last.bottom - top) / 2
      const nextY = bottom + (next.top - bottom) / 2
      if (lastY < scrollY && nextY > scrollY) {
        this.target = item
      }
    })
    this.target &&
    this.target.id !== this.data.toCityKey &&
    this.setData({
      showToast: false,
      toCityKey: this.target.id
    })
  },
  /**
   * dom绑定的scroll事件，进行节流
   * @param e
   */
  bindScroll(e) {
    throttle(this.scroll, undefined, this, e)
  },
  touchStart(e) {
    this.setData({
      showToast: true
    })
    this.calculateTouchTarget(e.touches)
  },
  touchMove(e) {
    throttle(this.calculateTouchTarget, undefined, this, e.touches)
  },
  touchEnd(e) {
    this.calculateTouchTarget(e.changedTouches, false)
  },
  calculateTouchTarget(touches, touch = true) {
    const { clientY } = touches[0]
    const target = this.targetList.find(y => {
      return y.top < clientY && y.bottom > clientY
    })
    this.toView(target)
      .then(() => {
        this.touch = touch
      })
  },
  toView(target) {
    return new Promise(resolve => {
      const { key } = target && target.dataset || ''
      if (key &&
        key !== this.data.toCityKey) {
        const toTarget = this.viewTargetList.find(item => {
          return item.id === key
        })
        this.setData({
          scrollTop: toTarget.top,
          toCityKey: key
        }, resolve)
      }
      resolve()
    })
  }
})