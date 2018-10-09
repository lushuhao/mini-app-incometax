//index.js
import { getCurrentAddress, getCurrentCity } from '../../module/location'
import { getCityListInStorage, getCityBaseInStorage, getSocialListInStorage } from '../../module/mock'
import { mathRound, splitString2Number } from '../../utils/util'

const incomeTaxList = [0, 3000, 12000, 25000, 35000, 55000, 80000]
const incomeTaxScaleList = [0, 0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]

const genTaxDetailList = () => ({
  endowment: {
    name: '养老保险',
    myTax: '',
    companyTax: '',
  },
  medical: {
    name: '医疗保险',
    myTax: '',
    companyTax: '',
  },
  seriousDiseases: {
    name: '大病医疗保险',
    myTax: '',
    companyTax: '',
  },
  unemployment: {
    name: '失业保险',
    myTax: '',
    companyTax: '',
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
  },
  birth: {
    name: '生育保险',
    myTax: '',
    companyTax: '',
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
    city: '上海市', // 当前定位城市
    earnings: 0,
    incomeTax: 0,
    socialTax: 0,
    reserveTax: 0,
    grossWage: '', // 税前工资
    threshold: 5000, // 个税起征点
    hasSocialTax: false,
    socialTaxBase: '', // 社保基数
    hasReserveTax: false,
    reserveTaxBase: '', // 公积金基数
    reserveTaxScaleIndex: 0,
    reserveTaxScaleList: '',
    hasAddReserveTax: false,
    extraReserveTaxBase: '', // 补充公积金基数
    extraReserveTaxScale: '',
    taxDetailList: ''
  },
  onLoad() {
    this.initAddress()
    this.load = true
  },
  /**
   * @todo 选择城市，上一次计算过，就重新计算
   */
  onShow() {
    if (!this.load) {
      const city = getCurrentCity()
      if (city && city.name !== this.data.city) {
        this.initCity(city.value)
          .then(() => {
            if (this.data.taxDetailList) {
              this.calculateEarnings()
            }
          })
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
  initAddress() {
    getCurrentAddress()
      .then(location => {
        this.init(location)
      })
      .catch(err => {
        console.error(err)
        this.init()
      })
  },
  init(location = '') {
    let { city = '上海市' } = location.address_component || {}
    getCityListInStorage()
      .then(cityList => {
        // 对象转数组，再合为一维数组
        const cityInfo = Array.prototype.concat(...Object.values(cityList)).find(item => {
          return city.includes(item.name)
        })
        this.initCity(cityInfo.value)
        this.setData({ city })
      })
  },
  /**
   * 根据城市初始化五险一金
   * @param city
   */
  initCity(city) {
    return new Promise(resolve => {
      Promise.all([getCityBaseInStorage(), getSocialListInStorage()])
        .then(([cityBase, socialList]) => {
          const { shebao, gongjijin } = cityBase[city]
          this.social = shebao[0]
          this.reserve = gongjijin[0]
          this.socialScale = socialList[city]
          const data = {
            ...this.initTaxBase(),
            reserveTaxScaleList: gongjijin.map(item => item.alias)
          }

          this.setData(data, () => {
            resolve(null)
          })
        })
    })

  },
  // 初始化费用基数
  initTaxBase() {
    const reserveTaxBase = this.calculateReserveTaxBase()
    return {
      socialTaxBase: this.calculateSocialTaxBase(),
      reserveTaxBase,
      extraReserveTaxBase: reserveTaxBase
    }
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
    const { grossWage = 0 } = this
    const { minBase, maxBase } = taxInfo
    return grossWage <= minBase
      ? minBase
      : grossWage <= maxBase
        ? grossWage
        : maxBase
  },
  /**
   * 计算税后工资
   * @desc 税前工资，先减去公积金和社保，再减去起征点，最后按比例纳税
   */
  calculateEarnings() {
    let earnings
    const {
      grossWage, socialTaxBase, reserveTaxBase, extraReserveTaxBase, threshold,
    } = this.data
    this.calculateSocialTax(socialTaxBase) // 社保
    earnings = grossWage - this.mySocialTaxInsurance
    this.calculateReserveTax(reserveTaxBase) // 公积金
    earnings -= this.reserveTax
    this.calculateAddReserveTax(extraReserveTaxBase) // 补充公积金
    earnings -= this.extraReserveTax
    if (earnings > threshold) {
      this.calculateIncomeTax(earnings - threshold)
      earnings -= this.incomeTaxTotal
    } else {
      this.incomeTaxTotal = 0
    }
    this.setData({
      earnings: mathRound(earnings),
      incomeTax: mathRound(this.incomeTaxTotal),
      socialTax: mathRound(this.mySocialTaxInsurance),
      reserveTax: this.reserveTax
    })
    this.calculateTaxDetailList()
  },
  /**
   * 计算社保详情
   * @param taxDetailList
   * @param socialTaxList
   * @param taxType
   */
  calculateSocialTaxDetailList(taxDetailList, socialTaxList, taxType) {
    Object.entries(socialTaxList).forEach(([key, value]) => {
      taxDetailList[key] &&
      (taxDetailList[key][taxType] = mathRound(value))
    })
  },
  /**
   * 计算五险一金详情，生成表格
   * @desc 个人和公司分别计算
   */
  calculateTaxDetailList() { // 五险一金详情
    const taxDetailList = genTaxDetailList()
    // 个人社保
    this.calculateSocialTaxDetailList(taxDetailList, this.mySocialTaxList, 'myTax')
    // 公司社保
    this.calculateSocialTaxDetailList(taxDetailList, this.companySocialTaxList, 'companyTax')
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
  /**
   * 社保基数*百分比
   * @param socialTaxBase
   * @param scale
   * @returns {{}}
   */
  calculateSocialTaxInsurance(socialTaxBase, scale) {
    const socialTaxInsurance = {}
    Object.entries(scale).map(([k, v]) => {
      // 没有%，就是固定金额
      if (typeof v === 'string' && v.includes('%')) {
        socialTaxInsurance[k] = splitString2Number(v) * socialTaxBase * 0.01
      } else {
        socialTaxInsurance[k] = v
      }
    })
    return socialTaxInsurance
  },
  /**
   * 生成个人和公司每一项社保费用
   * @param socialTaxBase
   * @returns {{mySocialTaxList: (*|{}), companySocialTaxList: (*|{})}}
   */
  genSocialTaxList(socialTaxBase) {
    const { myScale, companyScale } = this.socialScale
    this.mySocialTaxList = this.calculateSocialTaxInsurance(socialTaxBase, myScale)
    this.companySocialTaxList = this.calculateSocialTaxInsurance(socialTaxBase, companyScale)
  },
  /**
   *
   * @param socialTaxList
   * @returns {*}
   */
  genTotalSocialTax(socialTaxList) {
    return Object.values(socialTaxList).reduce((total, item) => (total += item))
  },
  /**
   * 计算社保
   * @param socialTaxBase
   * @desc 设置个人和公司社保费用
   */
  calculateSocialTax(socialTaxBase) { // 社保
    this.genSocialTaxList(socialTaxBase)
    this.mySocialTaxInsurance = this.genTotalSocialTax(this.mySocialTaxList)

    this.companySocialTaxInsurance = this.genTotalSocialTax(this.companySocialTaxList)
  }
  ,
  /**
   * 计算公积金
   * @desc 基数*比例
   * @param reserveTaxBase
   */
  calculateReserveTax(reserveTaxBase) {
    const {
      reserveTaxScaleIndex,
      reserveTaxScaleList
    } = this.data
    const reserveTaxScale = splitString2Number(reserveTaxScaleList[reserveTaxScaleIndex])
    this.reserveTax = reserveTaxBase * reserveTaxScale * 0.01
    this.reserveTax = mathRound(Math.ceil(this.reserveTax))
  },
  /**
   * 计算补充公积金
   * @desc 基数*比例
   * @param extraReserveTaxBase
   */
  calculateAddReserveTax(extraReserveTaxBase) {
    const {
      extraReserveTaxScale,
      hasAddReserveTax
    } = this.data
    if (!hasAddReserveTax) {
      return this.extraReserveTax = ''
    }
    this.extraReserveTax = extraReserveTaxBase * extraReserveTaxScale * 0.01
    this.extraReserveTax = mathRound(this.extraReserveTax)
  }
  ,
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
  }
  ,
  changeCity() {
    wx.safeNavigateTo(wx.routers.social_cityList)
  }
})
