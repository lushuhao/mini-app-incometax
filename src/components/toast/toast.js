import {debounce} from '../../utils/util'

Component({
  behaviors: [],
  properties: {
    text: {
      type: String,
      observer() {
        this.toastHandle()
      }
    }
  },
  data: {
    showToast: false
  },
  methods: {
    hiddenToast() {
      this.setData({
        showToast: false
      })
    },
    toastHandle() {
      !this.data.showToast &&
      this.setData({
        showToast: true
      })
      debounce(this.hiddenToast, 500, this)
    }
  }
})
