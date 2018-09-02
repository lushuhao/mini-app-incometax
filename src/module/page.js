const oldPage = Page

function MyPage(opts, path) {
  const initOnLoad = opts.onLoad

  opts.onLoad = function (options) {
    this.options = options
    initOnLoad.bind(this)(options)
  }

  oldPage(opts, path)
}

Page = MyPage