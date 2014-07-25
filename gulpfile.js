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
