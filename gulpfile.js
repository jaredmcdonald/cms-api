var gulp = require('gulp')
,   source = require('vinyl-source-stream')
,   browserify = require('browserify')
,   mold = require('mold-source-map')
,   es6ify = require('es6ify')
,   sass = require('gulp-sass')
,   sourcemaps = require('gulp-sourcemaps')

const JS_SRC = './public/js/src'
,     JS_DIST = './public/js/dist'
,     CSS_SRC = './public/sass'
,     CSS_DIST = './public/css'


gulp.task('css', function () {
  gulp.src(CSS_SRC + '/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write({ sourceRoot: '/sass'}))
    .pipe(gulp.dest(CSS_DIST))
})

gulp.task('js', function () {

  return browserify({ debug : true })
           .add(es6ify.runtime)
           .transform(es6ify)
           .require(require.resolve(JS_SRC + '/main.js'), { entry : true })
           .bundle()
           .pipe(mold.transformSourcesRelativeTo(JS_DIST))
           .pipe(source('main.js'))
           .pipe(gulp.dest(JS_DIST))
})

gulp.task('watch-css', function () {
  gulp.watch(CSS_SRC + '/*.scss', [ 'css' ])
})

gulp.task('watch-js', function () {
  gulp.watch(JS_SRC + '/*.js', [ 'js' ])
})

gulp.task('default', [ 'js', 'css' ])

gulp.task('watch', [ 'default', 'watch-js', 'watch-css' ])
