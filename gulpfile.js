var gulp = require('gulp');

var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var rename = require("gulp-rename");

var fontName = 'beastie';
var template = 'template';
gulp.task('iconfont', function(){
  gulp.src(['app/svg/*.svg'])
    .pipe(iconfont({ fontName: fontName }))
    .on('codepoints', function(codepoints) {
      var options = {
        glyphs: codepoints,
        fontName: fontName,
        fontPath: '../fonts/beastie/', // set path to font (from your CSS file if relative)
        className: 'icon' // set class name in your CSS
      };
      gulp.src('templates/' + template + '.css')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:fontName }))
        .pipe(gulp.dest('app/styles/')); // set path to export your CSS

      // if you don't need sample.html, remove next 4 lines
      gulp.src('templates/' + template + '.html')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:fontName }))
        .pipe(gulp.dest('app/')); // set path to export your sample HTML
    })
    .pipe(gulp.dest('app/fonts/beastie')); // set path to export your fonts
});

var sass = require('gulp-sass')
gulp.task('sass', function () {
    gulp.src('app/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/styles'));
});

var livereload = require('gulp-livereload'),
    dest = 'app';

gulp.task('server', function(next) {
  var connect = require('connect'),
      server = connect();
  var serveStatic = require('serve-static');
  server.use(serveStatic(dest)).listen(process.env.PORT || 8080, next);
});

gulp.task('watch', ['server'], function() {
  var server = livereload();
  gulp.watch(dest + '/**').on('change', function(file) {
      server.changed(file.path);
  });
  gulp.watch(dest + '/styles/*.scss', ['sass']);
  gulp.watch(dest + '/svg/**', ['iconfont']);
});
