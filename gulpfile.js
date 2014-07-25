var gulp = require('gulp');

var iconfont = require('gulp-iconfont');
gulp.task('iconfont', function(){
  gulp.src(['app/svg/*.svg'])
    .pipe(iconfont({
      fontName: 'beastie', // required
      appendCodepoints: true // recommended option
    }))
      .on('codepoints', function(codepoints, options) {
        // CSS templating, e.g.
        console.log(codepoints, options);
      })
    .pipe(gulp.dest('app/fonts/beastie'));
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
  gulp.watch(dest + '/svg', ['iconfont']);
});
