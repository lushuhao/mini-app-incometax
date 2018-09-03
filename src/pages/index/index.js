//index.js
import { getCurrentAddress, getCurrentCity } from '../../module/location'
import cityList from '../../collect/cityList'
import cityBase from '../../collect/cityBase'
import socialList from '../../collect/socialList'

import { mathRound } from '../../utils/util'

const incomeTaxList = [0, 3000, 12000, 25000, 35000, 55000, 80000]
const incomeTaxScaleList = [0, 0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]

const mySocialTaxInsurance = (socialTaxBase) => ({
  endowment: socialTaxBase * 0.08,
  medical: socialTaxBase * 0.02,
  unemployment: socialTaxBase * 0.005,
})
const companySocialTaxInsurance = (socialTaxBase) => ({
  endowment: socialTaxBase * 0.2,
  medical: socialTaxBase * 0.095,
  unemployment: socialTaxBase * 0.005,
  employment: socialTaxBase * 0.001,
  birth: socialTaxBase * 0.01
})
const genTaxDetailList = () => ({
  endowment: {
    name: '养老保险',
    myTax: '',
    myTaxScale: 0.08,
    companyTax: '',
    companyTaxScale: 0.2
  },
  medical: {
    name: '医疗保险',
    myTax: '',
    myTaxScale: 0.02,
    companyTax: '',
    companyTaxScale: 0.095
  },
  unemployment: {
    name: '失业保险',
    myTax: '',
    myTaxScale: 0.005,
    companyTax: '',
    companyTaxScale: 0.005
  },
  reserve: {
    name: '住房公积金',
    myTax: '',
    companyTax: ''
  },
  extraReserve: {
    name: '补充住房公积金',
    myTax: '',
    companyTax: ''
  },
  employment: {
    name: '工伤保险',
    myTax: '',
    companyTax: '',
    companyTaxScale: 0.001,
    hiddenMyTax: true
  },
  birth: {
    name: '生育保险',
    myTax: '',
    companyTax: '',
    companyTaxScale: 0.01,
    hiddenMyTax: true
  },
  total: {
    name: '共计支出',
    myTax: '',
    companyTax: ''
  },
})
const taxTitle = {
  name: '',
  myTax: '个人应缴部分',
  companyTax: '公司应缴部分'
}
Page({
  data: {
    city: '', // 当前定位城市
    earnings: 0,
    incomeTax: 0,
    socialTax: 0,
    reserveTax: 0,
    grossWage: '',
    threshold: 3500,
    hasSocialTax: false,
    socialTaxBase: '', // 社保基数
    hasReserveTax: false,
    reserveTaxBase: '', // 公积金基数
    reserveTaxScale: 2,
    reserveTaxScaleList: [5, 6, 7, 8, 9, 10, 11, 12],
    hasAddReserveTax: false,
    extraReserveTaxBase: '', // 补充公积金基数
    extraReserveTaxScale: 0,
    extraReserveTaxScaleList: [1, 2, 3, 4, 5],
    taxDetailList: ''
  },
  onLoad() {
    this.init()
    this.load = true
  },
  onShow() {
    if (!this.load) {
      const city = getCurrentCity()
      if (city && city.name !== this.data.city) {
        this.initCity(city.value)
        this.setData({ city: city.name })
      }
    }
    this.load = false
  },
  onShareAppMessage() {
    return {
      title: '上海五险一金及税后工资计算器',
      path: '/pages/index/index'
    }
  },
  init() {
    getCurrentAddress()
      .then(location => {
        let { city = '上海' } = location.address_component || {}
        city = city.split(/市/)[0]
        // 对象转数组，再合为一维数组
        const cityInfo = Array.prototype.concat(...Object.values(cityList)).find(item => {
          return item.name === city
        })
        this.initCity(cityInfo.value)
        this.setData({ city })
      })
  },
  // 根据城市初始化五险一金
  initCity(city) {
    const { shebao, gongjijin } = cityBase[city]
    this.social = shebao[0]
    this.reserve = gongjijin[0]
    this.initTaxBase()
    this.socialScale = socialList[this.social.code]
  },
  // 初始化费用基数
  initTaxBase() {
    const reserveTaxBase = this.calculateReserveTaxBase()
    this.setData({
      socialTaxBase: this.calculateSocialTaxBase(),
      reserveTaxBase,
      extraReserveTaxBase: reserveTaxBase
    })
  },
  bindChange(e) {
    const name = e.currentTarget.dataset.name
    const value = e.detail.value
    const data = {
      [name]: value
    }
    if (name === 'grossWage') {
      this.grossWage = value
      data.socialTaxBase = this.calculateSocialTaxBase()
      data.extraReserveTaxBase
        = data.reserveTaxBase
        = this.calculateReserveTaxBase()
    }
    this.setData(data, () => {
      const { grossWage } = this.data
      if (!grossWage || grossWage < 1000) {
        return
      }
      this.calculateEarnings()
    })
  },
  calculateSocialTaxBase() {
    return this.calculateTaxBase(this.social)
  },
  calculateReserveTaxBase() {
    return this.calculateTaxBase(this.reserve)
  },
  /**
   * 计算社保和公积金基数
   * @param taxInfo // 费用信息
   * @returns {*}
   */
  calculateTaxBase(taxInfo) {
    const { grossWage } = this
    const { minBase, maxBase } = taxInfo
    return grossWage <= minBase
      ? minBase
      : grossWage <= maxBase
        ? grossWage
        : maxBase
  },
  calculateEarnings() { // 税后
    // let earnings, income, socialTax, reserveTax
    let { grossWage, socialTaxBase, reserveTaxBase, extraReserveTaxBase } = this.data
    const {
      threshold,
      hasAddReserveTax,
    } = this.data
    socialTaxBase = socialTaxBase || 0
    reserveTaxBase = reserveTaxBase || 0
    extraReserveTaxBase = extraReserveTaxBase || 0
    this.calculateSocialTax(socialTaxBase) // 社保
    grossWage = grossWage - this.mySocialTaxInsurance
    this.calculateReserveTax(reserveTaxBase) // 公积金
    grossWage = grossWage - this.reserveTax
    if (hasAddReserveTax) { // 补充公积金
      this.calculateAddReserveTax(extraReserveTaxBase)
      grossWage = grossWage - this.extraReserveTax
    }
    if (grossWage > threshold) {
      this.calculateIncomeTax(grossWage - threshold)
      grossWage = grossWage - this.incomeTaxTotal
    } else {
      this.incomeTaxTotal = 0
    }
    this.setData({
      earnings: mathRound(grossWage),
      incomeTax: mathRound(this.incomeTaxTotal),
      socialTax: mathRound(this.mySocialTaxInsurance),
      reserveTax: this.reserveTax
    })
    this.calculateTaxDetailList()
  },
  calculateTaxDetailList() { // 五险一金详情
    const taxDetailList = genTaxDetailList()
    const { socialTaxBase } = this.data
    // 个人社保
    Object.entries(mySocialTaxInsurance(socialTaxBase)).forEach(([key, value]) => {
      taxDetailList[key].myTax = mathRound(value)
    })
    // 公司社保
    Object.entries(companySocialTaxInsurance(socialTaxBase)).forEach(([key, value]) => {
      taxDetailList[key].companyTax = mathRound(value)
    })
    // 公积金
    taxDetailList.reserve.myTax = taxDetailList.reserve.companyTax = this.reserveTax
    // 补充公积金
    taxDetailList.extraReserve.myTax = taxDetailList.extraReserve.companyTax = this.extraReserveTax
    this.calculateTaxTotal(taxDetailList)
    taxDetailList[0] = taxTitle
    this.setData({ taxDetailList })
  },
  calculateTaxTotal(taxDetailList) {
    function calculateTaxTypeTotal(taxType) {
      return Object.values(taxDetailList).reduce((total, item) => {
        total = total instanceof Object ? Number(total[taxType]) || 0 : total
        item = item instanceof Object ? Number(item[taxType]) || 0 : item
        return total + item
      })
    }

    taxDetailList.total.myTax = mathRound(calculateTaxTypeTotal('myTax'))
    taxDetailList.total.companyTax = mathRound(calculateTaxTypeTotal('companyTax'))
  },
  calculateSocialTax(socialTaxBase) { // 社保
    const mySocialTaxInsuranceList = Object.values(mySocialTaxInsurance(socialTaxBase))
    this.mySocialTaxInsurance = mySocialTaxInsuranceList.reduce((total, item) => (total += item))
    const companySocialTaxInsuranceList = Object.values(companySocialTaxInsurance(socialTaxBase))
    this.companySocialTaxInsurance = companySocialTaxInsuranceList.reduce((total, item) => (total += item))
  },
  calculateReserveTax(reserveTaxBase) { // 公积金
    const {
      reserveTaxScale,
      reserveTaxScaleList
    } = this.data
    this.reserveTax = reserveTaxBase * reserveTaxScaleList[reserveTaxScale] * 0.01
    this.reserveTax = mathRound(Math.ceil(this.reserveTax))
  },
  calculateAddReserveTax(extraReserveTaxBase) { // 补充公积金
    const {
      extraReserveTaxScale,
      extraReserveTaxScaleList
    } = this.data
    this.extraReserveTax = extraReserveTaxBase * extraReserveTaxScaleList[extraReserveTaxScale] * 0.01
    this.extraReserveTax = mathRound(this.extraReserveTax)
  },
  calculateIncomeTax(grossWage) { // 个人所得税
    let taxIndex = incomeTaxList.findIndex((tax) => {
      return tax > grossWage
    })
    taxIndex = taxIndex === -1 ? incomeTaxList.length : taxIndex
    let incomeTaxTotal = (grossWage - incomeTaxList[taxIndex - 1]) * incomeTaxScaleList[taxIndex]
    while (taxIndex > 1) {
      taxIndex--
      incomeTaxTotal = incomeTaxTotal + (incomeTaxList[taxIndex] - incomeTaxList[taxIndex - 1]) * incomeTaxScaleList[taxIndex]
    }
    this.incomeTaxTotal = incomeTaxTotal
  },
  changeCity() {
    wx.safeNavigateTo(wx.routers.social_cityList)
  }
})
