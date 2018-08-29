const gulp = require('gulp')
const del = require('del')
const fs = require('fs')
const rename = require('gulp-rename')

const through = require('through2')
const colors = require('ansi-colors')
const log = require('fancy-log')
const argv = require('minimist')(process.argv.slice(2))

const postcss = require('gulp-postcss')
const px2rpx = require('postcss-px2rpx')
const base64 = require('postcss-font-base64')

const sass = require('gulp-sass')
const combiner = require('stream-combiner2')
const sourcemaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')
const jdists = require('gulp-jdists')
const eslint = require('gulp-eslint')
const gulpIf = require('gulp-if')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const htmlmini = require('gulp-htmlmin')
const jsonminify = require('gulp-jsonminify')
const cssnano = require('gulp-cssnano')

// 判断gulp --type prod 命名 type 是否是生产打包
const isProd = argv.type === 'prod'
const src = './src'
const dist = './dist'

function isFixed(file) {
  return file.eslint != null && file.eslint.fixed;
}

const handleError = (err) => {
  console.log('\n')
  log(colors.red('Error!'))
  log('fileName: ' + colors.red(err.fileName))
  log('lineNumber: ' + colors.red(err.lineNumber))
  log('message: ' + err.message)
  log('plugin: ' + colors.yellow(err.plugin))
}

gulp.task('wxml', () => {
  return gulp
    .src(`${src}/**/*.wxml`)
    .pipe(
      isProd ? htmlmini({
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        keepClosingSlash: true, //保持斜杠作为结尾
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
      }) : through.obj()
    )
    .pipe(gulp.dest(dist))
})

gulp.task('wxss', () => {
  const combined = combiner.obj([
    gulp.src(`${src}/**/*.{wxss,scss}`),
    sass(),
    postcss([px2rpx(), base64()]),
    rename((path) => (path.extname = '.wxss')),
    isProd ? cssnano() : through.obj(),
    gulp.dest(dist)
  ])

  combined.on('error', handleError)
})

gulp.task('js', () => {
  const combined = combiner.obj([
    gulp.src(`${src}/**/*.js`),

    jdists({trigger: isProd ? 'prod' : 'dev'}),

    eslint({fix:true}),
    eslint.format(),
    gulpIf(isFixed, gulp.dest(src)), // 修复后的文件放回原处
    eslint.failAfterError(),

    // 生产环境不生成shoucemap，传入空的流处理方法
    isProd ? through.obj() : sourcemaps.init(),

    babel({
      presets: ['@babel/env']
    }),
    isProd ? uglify({
      compress: true
    }) : through.obj(),

    isProd ? through.obj() : sourcemaps.write('./'),
    gulp.dest(dist)
  ])

  combined.on('error', handleError)
})

gulp.task('json', () => {
  return gulp
    .src(`${src}/**/*.json`)
    .pipe(isProd ? jsonminify() : through.obj())
    .pipe(gulp.dest(dist))
})

gulp.task('images', () => {
  return gulp.src(`${src}/images/**`).pipe(gulp.dest(`${dist}/images`))
})

gulp.task('wxs', () => {
  return gulp.src(`${src}/**/*.wxs`).pipe(gulp.dest(dist))
})

gulp.task('watch', () => {
  ['wxml', 'wxss', 'js', 'json', 'wxs'].forEach(v => {
    gulp.watch(`${src}/**/*.${v}`, [v])
  })
  gulp.watch(`${src}/images/**`, ['images'])
  gulp.watch(`${src}/**/*.scss`, ['wxss'])
})

gulp.task('clean', () => {
  return del(['./dist/**'])
})

gulp.task('dev', ['clean'], () => {
  runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'watch')
})

gulp.task('build', ['clean'], () => {
  runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs')
})

gulp.task('create', () => {
  const [pathname, name] = process.argv[4].split('/')
  const dirname = `${src}/${pathname}/${name}`
  const fileList = createWxFileList(pathname, name)
  fs.mkdir(dirname, () => {
    console.log('创建文件夹：', name)
    fileList.forEach((item) => {
      fs.writeFile(`${dirname}/${name}${item.ext}`, item.content, (err) => {
        if (err) {
          console.error(err)
        }
        console.log('文件创建成功：', `${name}${item.ext}`)
      })
    })
  })
})

const createWxFileList = (pathname, name) => {
  let jsContent, jsonContent
  switch (pathname) {
  case 'components':
    jsContent = 'Component({})'
    jsonContent = '{\n  "component": true\n}'
    break
  case 'pages':
    jsContent = 'Page({})'
    jsonContent = `{\n  "navigationBarTitleText": "${name}"\n}`
    break
  }
  return [
    {
      ext: '.js',
      content: jsContent
    },
    {
      ext: '.json',
      content: jsonContent
    },
    {
      ext: '.wxml',
      content: `<view class="${name}"></view>`
    },
    {
      ext: '.scss',
      content: `.${name}{}`
    }
  ]
}


