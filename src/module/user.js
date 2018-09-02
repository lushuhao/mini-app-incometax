class User {
  constructor() {
    this.systemInfo = ''
  }

  getSystemInfo() {
    return new Promise(resolve => {
      if (this.systemInfo) {
        return resolve(this.systemInfo)
      }
      const self = this
      wx.getSystemInfo({
        success(res) {
          self.systemInfo = res
          resolve(res)
        }
      })
    })
  }
}


wx.user = new User()
