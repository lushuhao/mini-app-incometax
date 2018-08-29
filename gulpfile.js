const gulp = require('gulp')
const fs = require('fs')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const px2rpx = require('postcss-px2rpx')
const base64 = require('postcss-font-base64')
const sass = require('gulp-sass')
const combiner = require('stream-combiner2')
const sourcemaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')
const del = require('del')
const jdists = require('gulp-jdists')
const through = require('through2')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const minifyCSS = require('gulp-minify-css')
const minifyHtml = require('gulp-html-minify')
const minifyJson = require('gulp-json-minify')
const argv = require('minimist')(process.argv.slice(2))

// 判断gulp --type prod 命名 type 是否是生产打包
const isProd = argv.type === 'prod'
const src = './src'
const dist = './dist'

gulp.task('wxml', () => {
  return gulp
    .src(`${src}/**/*.wxml`)
    .pipe(
      isProd ? minifyHtml() : through.obj()
    )
    .pipe(gulp.dest(dist))
})

gulp.task('wxss', () => {
  const combined = combiner.obj([
    gulp.src(`${src}/**/*.{wxss,scss}`),
    sass().on('error', sass.logError),
    postcss([px2rpx(), base64()]),
    rename((path) => (path.extname = '.wxss')),
    isProd ? minifyCSS() : through.obj(),
    gulp.dest(dist)
  ])

  combined.on('error', console.error.bind(console))
})

gulp.task('js', () => {
  const combined = combiner.obj([
    gulp.src(`${src}/**/*.js`),

    jdists({ trigger: isProd ? 'prod' : 'dev' }),

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

  combined.on('error', console.error.bind(console))
})

gulp.task('json', () => {
  return gulp
    .src(`${src}/**/*.json`)
    .pipe(isProd ? minifyJson() : through.obj())
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
   switch (pathname){
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


