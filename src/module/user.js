class User {
  constructor() {
    this.systemInfo = ''
  }

  getSystemInfo() {
    return new Promise(resolve => {
      if (this.systemInfo) {
        return resolve(this.systemInfo)
      }
      wx.getSystemInfo({
        success: (res) => {
          this.systemInfo = res
          resolve(res)
        }
      })
    })
  }
}


wx.user = new User()
