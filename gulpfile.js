var gulp = require('gulp')
,   source = require('vinyl-source-stream')
,   browserify = require('browserify')
,   sass = require('gulp-sass')

gulp.task('css', function () {
  gulp.src('./client/sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public/css'))
})

gulp.task('js', function () {
  return browserify('./client/js/main.js')
           .bundle()
           .pipe(source('main.js'))
           .pipe(gulp.dest('./public/js'))
})

gulp.task('watch-css', function () {
  gulp.watch('./client/sass/*.scss', [ 'css' ])
})

gulp.task('watch-js', function () {
  gulp.watch('./client/js/*.js', [ 'js' ])
})

gulp.task('watch', [ 'watch-js', 'watch-css' ])

gulp.task('default', [ 'js', 'css' ])
