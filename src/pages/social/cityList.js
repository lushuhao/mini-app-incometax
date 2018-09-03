import {setCurrentCity} from '../../module/location'
import {getCityListInStorage} from '../../module/mock'
import {throttle} from '../../utils/util'

Page({
  data: {
    cityList: [],
    cityKeyList: [], // 城市首字母列表
    scrollTop: 0,
    toCityKey: 'a', // 滚动位置的城市首字母
    showToast: false,
    touch: false, // touch事件触发
  },
  onLoad() {
    this.getCityList()
    wx.user.getSystemInfo().then(systemInfo => {
      this.windowHeight = systemInfo.windowHeight
    })
  },
  onReady() {
    // Do something when page ready.
  },
  onShow() {
    // Do something when page show.
  },
  onHide() {
    // Do something when page hide.
  },
  onUnload() {
    // Do something when page close.
  },
  onShareAppMessage() {
    // return custom share data when user share.
  },
  getCityList() {
    getCityListInStorage()
      .then(cityList => {
        this.setData({
          cityList,
          cityKeyList: Object.keys(cityList)
        }, () => {
          this.getShortCutOffset()
        })
      })
  },
  selectCity(e) {
    setCurrentCity(e.currentTarget.dataset.city)
    wx.navigateBack()
  },
  getShortCutOffset() {
    const self = this
    wx.createSelectorQuery().selectAll('.item').boundingClientRect(function (rect) {
      self.targetList = rect
    }).exec()
    wx.createSelectorQuery().selectAll('.cityKey').boundingClientRect(function (rect) {
      self.viewTargetList = rect
    }).exec()
  },
  /**
   * 滚动事件
   * @description touch事件触发时，跳过
   * @param e
   */
  scroll(e) {
    if (this.touch) return
    const scrollY = e.detail.scrollTop
    this.viewTargetList.forEach((item, index) => {
      const {top, bottom} = item
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
      const lastY = top - (top - last.bottom) / 2
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
    const {clientY} = touches[0]
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
      const {key} = target && target.dataset || ''
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