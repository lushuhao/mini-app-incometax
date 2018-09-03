const fs = require('fs')

const gulp = require('gulp')
const del = require('del')
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
const mock = './mock'
const router = './router'

function isFixed(file) {
  return file.eslint && file.eslint.fixed;
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
    gulp.src([`${src}/**/*.js`, `!${src}/collect/**`]),
    eslint({fix: true}),
    eslint.format(),
    gulpIf(isFixed, gulp.dest(src)), // 修复后的文件放回原处
    eslint.failAfterError(),

    // 生产环境不生成sourcemap，传入空的流处理方法
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

gulp.task('projectConfig', () => {
  return gulp.src(`${dist}/project.config.json`)
    .pipe(gulp.dest(src))
})

gulp.task('images', () => {
  return gulp.src(`${src}/images/**`).pipe(gulp.dest(`${dist}/images`))
})

gulp.task('wxs', () => {
  return gulp.src(`${src}/**/*.wxs`).pipe(gulp.dest(dist))
})

gulp.task('collect', () => {
  return gulp.src([`${router}/*.json`, `${mock}/**/*.json`])
    .pipe(through.obj(function (file, enc, cb) {
      file.contents = Buffer.concat([Buffer.from('module.exports = '), file.contents])
      this.push(file)
      cb()
    }))
    .pipe(isProd ? jsonminify() : through.obj())
    .pipe(rename({
      extname: ".js"
    }))
    .pipe(eslint({fix: true}), eslint.format())
    .pipe(gulp.dest(`${src}/collect/`))
    .pipe(gulp.dest(`${dist}/collect/`))
})

gulp.task('route', () => {
  const {pages} = require(`${src}/app.json`)
  const routers = {}
  pages.forEach(path => {
    // pages/index/index -> index_index
    // pages/a/b/c -> b_c
    const routerKey = path.split(/pages\//)[1].split(/\//).slice(-2).join('_')
    routers[routerKey] = `/${path}`
  })
  const content = JSON.stringify(routers)
  fs.writeFileSync(`${router}/routers.json`, content)
})

gulp.task('watch', () => {
  ['wxml', 'wxss', 'js', 'json', 'wxs'].forEach(v => {
    gulp.watch(`${src}/**/*.${v}`, [v])
  })
  gulp.watch(`${src}/images/**`, ['images'])
  gulp.watch(`${src}/**/*.scss`, ['wxss'])
  gulp.watch(`${dist}/project.config.json`, ['projectConfig'])
  log(colors.green(`监听${src}目录下文件变动`))
})

gulp.task('clean', () => {
  return del(['./dist/**'])
})

gulp.task('dev', () => {
  runSequence(['route', 'projectConfig'], ['collect', 'json', 'images', 'wxml', 'wxss', 'js', 'wxs'], 'watch')
})

gulp.task('build', () => {
  runSequence('projectConfig', 'clean', 'route', ['collect', 'js', 'json', 'images', 'wxml', 'wxss', 'wxs'], () => {
    log(colors.cyan(`所有文件打包到${dist}`), colors.green('ok'))
  })
})
