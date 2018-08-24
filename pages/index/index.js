//index.js

import { mathRound } from '../../utils/util'

const incomeTaxList = [0, 3000, 12000, 25000, 35000, 55000, 80000]
const incomeTaxScaleList = [0, 0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]

Page({
  data: {
    earnings: 0,
    incomeTax: 0,
    socialTax: 0,
    accumulationTax: 0,
    form: {
      grossWage: '',
      threshold: 5000,
      hasSocialTax: true,
      socialTaxBase: '',
      hasAccumulationTax: true,
      accumulationTaxBase: '',
      accumulationTaxScale: 0,
      accumulationTaxScaleList: [5, 6, 7, 8, 9, 10, 11, 12],
      hasAddAccumulationTax: false,
      addAccumulationTaxBase: '',
      addAccumulationTaxScale: 0,
      addAccumulationTaxScaleList: [0, 1, 2, 3, 4, 5, 6, 7],
    }
  },
  onLoad() {

  },
  bindChange(e) {
    const name = `form.${e.currentTarget.dataset.name}`
    this.setData({
      [name]: e.detail.value
    }, () => {
      this.calculateEarnings()
    })
  },
  bindInputChange(e) {
    this.bindChange(e)
  },
  bindSwitchChange(e) {
    this.bindChange(e)
  },
  bindPickerChange(e) {
    this.bindChange(e)
  },
  calculateEarnings() {
    let earnings, income, socialTax, accumulationTax;
    let { grossWage, socialTaxBase, accumulationTaxBase, addAccumulationTaxBase } = this.data.form
    const {
      threshold,
      hasSocialTax,
      hasAccumulationTax,
      hasAddAccumulationTax,
      addAccumulationTaxScale,
      addAccumulationTaxScaleList
    } = this.data.form

    socialTaxBase = socialTaxBase || grossWage
    accumulationTaxBase = accumulationTaxBase || grossWage
    addAccumulationTaxBase = addAccumulationTaxBase || grossWage

    if (hasSocialTax) { // 社保
      this.calculateSocialTax(socialTaxBase)

      grossWage = grossWage - this.mySocialTaxInsurance
    }

    if (hasAccumulationTax) { // 公积金
      this.calculateAccumulationTax(accumulationTaxBase)

      grossWage = grossWage - this.myAccumulationTax
    }

    if (hasAddAccumulationTax) { // 补充公积金
      this.calculateAddAccumulationTax(addAccumulationTaxBase)

      grossWage = grossWage - this.myAddAccumulationTax
    }

    if (grossWage > threshold) {
      grossWage = grossWage - threshold
      this.calculateIncomeTax(grossWage)
      grossWage = grossWage - this.incomeTaxTotal
    } else {
      this.incomeTaxTotal = 0
    }

    this.setData({
      earnings: mathRound(grossWage),
      incomeTax: mathRound(this.incomeTaxTotal),
      socialTax: mathRound(this.mySocialTaxInsurance),
      accumulationTax: mathRound(this.myAccumulationTax)
    })
  },

  calculateSocialTax(socialTaxBase) {
    const mySocialTaxInsurance = {
      endowment: socialTaxBase * 0.08,
      medical: socialTaxBase * 0.02,
      unemployment: socialTaxBase * 0.005,
    }

    this.mySocialTaxInsurance = Object.values(mySocialTaxInsurance).reduce((total, item) =>  (total += item))

    const companySocialTaxInsurance = {
      endowment: socialTaxBase * 0.2,
      medical: socialTaxBase * 0.095,
      unemployment: socialTaxBase * 0.005,
      employment: socialTaxBase * 0.002,
      birth: socialTaxBase * 0.01
    }

    this.companySocialTaxInsurance = Object.values(companySocialTaxInsurance).reduce((total, item) =>  (total += item))
  },
  calculateAccumulationTax(accumulationTaxBase) {
    const {
      accumulationTaxScale,
      accumulationTaxScaleList
    } = this.data.form
    this.myAccumulationTax = accumulationTaxBase * accumulationTaxScaleList[accumulationTaxScale] * 0.01
  },
  calculateAddAccumulationTax(addAccumulationTaxBase) {
    const {
      addAccumulationTaxScale,
      addAccumulationTaxScaleList
    } = this.data.form
    this.myAddAccumulationTax = addAccumulationTaxBase * addAccumulationTaxScaleList[addAccumulationTaxScale] * 0.01
  },
  calculateIncomeTax(grossWage) {
    let taxIndex = incomeTaxList.findIndex((tax) => {
      return tax > grossWage
    })
    let incomeTaxTotal = (grossWage - incomeTaxList[taxIndex - 1]) * incomeTaxScaleList[taxIndex]
    while (taxIndex > 1) {
      taxIndex--
      incomeTaxTotal = incomeTaxTotal + (incomeTaxList[taxIndex] - incomeTaxList[taxIndex - 1]) * incomeTaxScaleList[taxIndex]
    }
    this.incomeTaxTotal = incomeTaxTotal
  }
})
