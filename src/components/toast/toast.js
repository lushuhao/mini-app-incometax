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
    toastHandle() {
      this.setData({
        showToast: true
      })
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setData({
          showToast: false
        })
      }, 500)
    }
  }
})
