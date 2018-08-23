<template>
  <div class="container">
    <div class="earningsWrapper">
      <span class="title">税后所得</span>
      <div class="earnings">{{earnings}}
        <span class="unit">元</span>
      </div>
      <div class="taxWrapper">
        <div class="tax">个税：{{incomeTax}}</div>
        <div class="tax">社保：{{socialTax}}</div>
        <div class="tax">公积金：{{accumulationTax}}</div>
      </div>
    </div>
    <div class="formWrapper">
      <div class="formItem">
        <span>税前工资</span>
        <input type="digit" class="formChange" placeholder="请输入" v-model="form.grossWage"/>
      </div>
      <div class="formItem">
        <span>起征点</span>
        <input type="digit" class="formChange" placeholder="请输入" v-model="form.threshold"/>
      </div>
    </div>

    <div class="formWrapper">
      <div class="formItem">
        <span>是否缴纳社保</span>
        <switch @change="bindChange" data-name="hasSocialTax" :checked="form.hasSocialTax"/>
      </div>
      <div class="formItem" :hidden="!form.hasSocialTax">
        <span>社保基数</span>
        <input type="digit" class="formChange" placeholder="按照工资"
               v-model="form.socialTaxBase"/>
      </div>
    </div>

    <div class="formWrapper">
      <div class="formItem">
        <span>是否缴纳公积金</span>
        <switch @change="bindChange" data-name="hasAccumulationTax" :checked="form.hasAccumulationTax"/>
      </div>
      <div :hidden="!form.hasAccumulationTax">
        <div class="formItem">
          <span>公积金基数</span>
          <input type="digit" class="formChange"
                 placeholder="按照工资"
                 v-model="form.accumulationTaxBase"/>
        </div>
        <div class="formItem">
          <span>公积金比例</span>
          <picker class="formChange" @change="bindChange" :value="form.accumulationTaxScale"
                  :range="form.accumulationTaxScaleList">
            <span>{{form.accumulationTaxScaleList[form.accumulationTaxScale]}}%</span>
          </picker>
        </div>
      </div>
    </div>

    <div class="formWrapper" :hidden="!form.hasAccumulationTax">
      <div class="formItem">
        <span>是否缴纳补充公积金</span>
        <switch @change="bindChange" data-name="hasAddAccumulationTax" :checked="form.hasAddAccumulationTax"/>
      </div>
      <div hidden="!form.hasAddAccumulationTax">
        <div class="formItem">
          <span>公积金基数</span>
          <input @change="bindChange" type="digit" class="formChange"
                 placeholder="请输入"
                 v-model="form.addAccumulationTaxBase"/>
        </div>
        <div class="formItem">
          <span>公积金比例</span>
          <picker class="formChange" @change="bindChange" v-model="form.addAccumulationTaxScale"
                  range="form.addAccumulationTaxScaleList">
            <span>{{form.addAccumulationTaxScaleList[form.addAccumulationTaxScale]}}%</span>
          </picker>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import card from '@/components/card'

  import {mathRound} from '../../utils/index'

  const incomeTaxList = [0, 3000, 12000, 25000, 35000, 55000, 80000]
  const incomeTaxScaleList = [0, 0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]

  export default {
    data() {
      return {
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
          addAccumulationTaxScaleList: [0, 1, 2, 3, 4, 5, 6, 7]
        }
      }
    },
    components: {
      card
    },
    created() {
      // 调用应用实例的方法获取全局数据
    },
    methods: {
      bindChange(e) {
        const {dataset: {name}, value} = e.target
        this.form[name] = value
        this.calculateEarnings()
      },
      calculateEarnings() {
        // let earnings, income, socialTax, accumulationTax;
        let {grossWage, socialTaxBase, accumulationTaxBase, addAccumulationTaxBase} = this.data.form
        const {
          threshold,
          hasSocialTax,
          hasAccumulationTax,
          hasAddAccumulationTax
          // addAccumulationTaxScale,
          // addAccumulationTaxScaleList
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
        /* const mySocialTaxInsurance = {
          endowment: socialTaxBase * 0.08,
          medical: socialTaxBase * 0.02,
          unemployment: socialTaxBase * 0.01
        } */

        this.mySocialTaxInsurance = socialTaxBase * (0.08 + 0.02 + 0.01)

        /* const companySocialTaxInsurance = {
          endowment: socialTaxBase * 0.2,
          medical: socialTaxBase * 0.08,
          unemployment: socialTaxBase * 0.02,
          employment: socialTaxBase * 0.01,
          birth: socialTaxBase * 0.01
        } */

        this.companySocialTaxInsurance = socialTaxBase * (0.2 + 0.08 + 0.02 + 0.01 + 0.01)
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
    }
  }
</script>

<style scoped lang="scss">
  page {
    background: #f5f5f5;
  }

  .earningsWrapper {
    position: relative;
    background: #fcb816;
    color: #fff;
    padding: 15px;
  }

  .title {
    font-size: 12px;
  }

  .earnings {
    padding: 15px 0 30px;
    font-size: 30px;
    line-height: 1;
  }

  .unit {
    padding-left: 5px;
    font-size: 12px;
  }

  .taxWrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, .05);
    line-height: 10px;
    font-size: 10px;
  }

  .tax {
    flex: 1;
    padding: 10px 15px;
  }

  .tax:nth-child(-n+2) {
    border-right: 1px solid #fcb816;
  }

  .formWrapper {
    margin-top: 10px;
    padding-left: 15px;
    background: #fff;
    font-size: 14px;
    color: #999;
  }

  .formItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px 10px 0;

    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }
  }

  .formChange {
    flex: 0 70%;
  }

  input {
    caret-color: #fcb816;
    color: #333;
  }

  .input-placeholder {
    color: #999;
  }

</style>
