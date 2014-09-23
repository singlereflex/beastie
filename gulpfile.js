var gulp = require('gulp');


//Create the beastie font
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var rename = require("gulp-rename");
var fontName = 'beastie';
var template = 'template';
gulp.task('iconfont', function(){
  return gulp.src(['app/svg/*.svg'])
    .pipe(iconfont({
        fontName: fontName,
        fixedWidth: true
    }))
    .on('codepoints', function(codepoints) {
      var options = {
        glyphs: codepoints,
        fontName: fontName,
        fontPath: '../fonts/beastie/', // set path to font (from your CSS file if relative)
        className: 'icon' // set class name in your CSS
      };
      gulp.src('templates/' + template + '.scss')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:"_icons" }))
        .pipe(gulp.dest('app/styles/')); // set path to export your CSS

      // if you don't need sample.html, remove next 4 lines
      gulp.src('templates/' + template + '.html')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:fontName }))
        .pipe(gulp.dest('app/')); // set path to export your sample HTML
    })
    .pipe(gulp.dest('app/fonts/beastie')); // set path to export your fonts
});

//Sass our styles
var sass = require('gulp-sass')
gulp.task('sass', ['iconfont'], function () {
    return gulp.src('app/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/styles'));
});

//create a manifest
var manifest = require('gulp-manifest');
gulp.task('manifest', function(){
  gulp.src(['app/**', '!\.*'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'app.manifest',
      exclude: 'app.manifest'
     }))
    .pipe(gulp.dest('app'));
});

//live reload for fun and profit
var livereload = require('gulp-livereload'),
    dest = 'app';

gulp.task('connect', function () {
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-static');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729, host:"0.0.0.0" }))
        .use(serveStatic(dest))
        .use(serveIndex(dest));

    require('http').createServer(app)
        .listen(9000, "0.0.0.0")
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('server', ['connect'], function () {
    // require('opn')('http://localhost:9000');
});


gulp.task('watch', ['connect', 'server', 'sass'], function() {
  var server = livereload();

  gulp.watch([dest + '/**', "!"+dest+"/bower_components"]).on('change', function(file) {
      server.changed(file.path);
  });
  gulp.watch(dest + '/styles/*.scss', ['sass']);
  gulp.watch(dest + '/svg/**', ['sass']);
});

gulp.task('default', ['watch']);
