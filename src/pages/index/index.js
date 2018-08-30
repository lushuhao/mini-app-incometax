//index.js
import {mathRound} from '../../utils/util'
const incomeTaxList = [0, 3000, 12000, 25000, 35000, 55000, 80000]
const incomeTaxScaleList = [0, 0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]
const socialTaxBaseList = [4279, 21396]
const accumulationTaxBaseList = [4600, 42800]
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
  accumulation: {
    name: '住房公积金',
    myTax: '',
    companyTax: ''
  },
  addAccumulation: {
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
    grossWageFocus: true,
    earnings: 0,
    incomeTax: 0,
    socialTax: 0,
    accumulationTax: 0,
    form: {
      grossWage: '',
      threshold: 3500,
      hasSocialTax: false,
      socialTaxBase: Math.min(...socialTaxBaseList),
      hasAccumulationTax: false,
      accumulationTaxBase: Math.min(...accumulationTaxBaseList),
      accumulationTaxScale: 2,
      accumulationTaxScaleList: [5, 6, 7, 8, 9, 10, 11, 12],
      hasAddAccumulationTax: false,
      addAccumulationTaxBase: Math.min(...accumulationTaxBaseList),
      addAccumulationTaxScale: 0,
      addAccumulationTaxScaleList: [1, 2, 3, 4, 5],
    },
    taxDetailList: ''
  },
  onLoad() {
  },
  onShareAppMessage() {
    return {
      title: '上海五险一金及税后工资计算器',
      path: '/pages/index/index'
    }
  },
  bindChange(e) {
    const name = e.currentTarget.dataset.name
    const value = e.detail.value
    const form = {
      ...this.data.form,
      [name]: value
    }
    switch (name) {
    case 'grossWage':
      form.socialTaxBase = this.calculateSocialTaxBase(value)
      form.addAccumulationTaxBase = form.accumulationTaxBase = this.calculateAccumulationTaxBase(value)
      break
    }
    this.setData({
      form
    }, () => {
      const {grossWage} = this.data.form
      if (!grossWage || grossWage < 1000) {
        return
      }
      this.calculateEarnings()
    })
  },
  calculateSocialTaxBase(grossWage) { // 社保基数
    return this.calculateTaxBase(grossWage, socialTaxBaseList)
  },
  calculateAccumulationTaxBase(grossWage) {
    return this.calculateTaxBase(grossWage, accumulationTaxBaseList)
  },
  calculateTaxBase(grossWage, baseList) {
    const minBase = Math.min(...baseList)
    const maxBase = Math.max(...baseList)
    return grossWage <= minBase
      ? minBase
      : grossWage <= maxBase
        ? grossWage
        : maxBase
  },
  calculateEarnings() { // 税后
    // let earnings, income, socialTax, accumulationTax
    let {grossWage, socialTaxBase, accumulationTaxBase, addAccumulationTaxBase} = this.data.form
    const {
      threshold,
      hasAddAccumulationTax,
    } = this.data.form
    socialTaxBase = socialTaxBase || 0
    accumulationTaxBase = accumulationTaxBase || 0
    addAccumulationTaxBase = addAccumulationTaxBase || 0
    this.calculateSocialTax(socialTaxBase) // 社保
    grossWage = grossWage - this.mySocialTaxInsurance
    this.calculateAccumulationTax(accumulationTaxBase) // 公积金
    grossWage = grossWage - this.accumulationTax
    if (hasAddAccumulationTax) { // 补充公积金
      this.calculateAddAccumulationTax(addAccumulationTaxBase)
      grossWage = grossWage - this.addAccumulationTax
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
      accumulationTax: this.accumulationTax
    })
    this.calculateTaxDetailList()
  },
  calculateTaxDetailList() { // 五险一金详情
    const taxDetailList = genTaxDetailList()
    const {socialTaxBase} = this.data.form
    // 个人社保
    Object.entries(mySocialTaxInsurance(socialTaxBase)).forEach(([key, value]) => {
      taxDetailList[key].myTax = mathRound(value)
    })
    // 公司社保
    Object.entries(companySocialTaxInsurance(socialTaxBase)).forEach(([key, value]) => {
      taxDetailList[key].companyTax = mathRound(value)
    })
    // 公积金
    taxDetailList.accumulation.myTax = taxDetailList.accumulation.companyTax = this.accumulationTax
    // 补充公积金
    taxDetailList.addAccumulation.myTax = taxDetailList.addAccumulation.companyTax = this.addAccumulationTax
    this.calculateTaxTotal(taxDetailList)
    taxDetailList[0] = taxTitle
    this.setData({taxDetailList})
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
  calculateAccumulationTax(accumulationTaxBase) { // 公积金
    const {
      accumulationTaxScale,
      accumulationTaxScaleList
    } = this.data.form
    this.accumulationTax = accumulationTaxBase * accumulationTaxScaleList[accumulationTaxScale] * 0.01
    this.accumulationTax = mathRound(this.accumulationTax)
  },
  calculateAddAccumulationTax(addAccumulationTaxBase) { // 补充公积金
    const {
      addAccumulationTaxScale,
      addAccumulationTaxScaleList
    } = this.data.form
    this.addAccumulationTax = addAccumulationTaxBase * addAccumulationTaxScaleList[addAccumulationTaxScale] * 0.01
    this.addAccumulationTax = mathRound(this.addAccumulationTax)
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
  }
})
