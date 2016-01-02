var gulp = require("gulp");


//Create the beastie font
var iconfont = require("gulp-iconfont");
var consolidate = require("gulp-consolidate");
var rename = require("gulp-rename");
var fontName = "beastie";
var template = "template";
gulp.task("iconfont", function () {
    return gulp.src(["design_files/svg/*.svg"])
        .pipe(iconfont({
            fontName: fontName,
            fixedWidth: true
        }))
        .on("codepoints", function (codepoints) {
            var options = {
                glyphs: codepoints,
                fontName: fontName,
                fontPath: "../fonts/beastie/", // set path to font (from your CSS file if relative)
                className: "icon" // set class name in your CSS
            };
            gulp.src("templates/" + template + ".scss")
                .pipe(consolidate("lodash", options))
                .pipe(rename({basename: "_icons"}))
                .pipe(gulp.dest("styles/")); // set path to export your CSS

            // if you don"t need sample.html, remove next 4 lines
            gulp.src("templates/" + template + ".html")
                .pipe(consolidate("lodash", options))
                .pipe(rename({basename: fontName}))
                .pipe(gulp.dest("")); // set path to export your sample HTML
        })
        .pipe(gulp.dest("fonts/beastie")); // set path to export your fonts
});

//Sass our styles
var sass = require("gulp-sass")
gulp.task("sass", ["iconfont"], function () {
    return gulp.src("styles/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("styles"));
});

//live reload for fun and profit
var livereload = require("gulp-livereload"),
    dest = ".";

gulp.task("connect", function () {
    var connect = require("connect");
    var serveStatic = require("serve-static");
    var serveIndex = require("serve-static");
    var app = connect()
        .use(require("connect-livereload")({port: 35729, host: "0.0.0.0"}))
        .use(serveStatic(dest))
        .use(serveIndex(dest));

    require("http").createServer(app)
        .listen(9000, "0.0.0.0")
        .on("listening", function () {
            console.log("Started connect web server on http://localhost:9000");
        });
});

var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var rename = require("gulp-rename");
gulp.task("build", function() {

    gulp.src('./_index.html')
      .pipe(inject(gulp.src(bowerFiles({
            paths: {
                bowerDirectory: './bower_components',
                bowerrc: './.bowerrc',
                bowerJson: './bower.json'
            }
        }), {read: false}), {name: 'components'}))
      .pipe(inject(gulp.src('./scripts/being/**/*.js', {read: false}), {name: 'being'}))
      .pipe(inject(gulp.src('./scripts/beast/config.js', {read: false}), {name: 'config'}))
      .pipe(inject(gulp.src(['./scripts/beast/**/*.js', '!./scripts/beast/config.js', '!./scripts/beast/worker/**/*'], {read: false}), {name: 'beast'}))
      .pipe(inject(gulp.src('./scripts/directives/**/*.js', {read: false}), {name: 'directives'}))
      .pipe(inject(gulp.src('./scripts/controllers/**/*.js', {read: false}), {name: 'controllers'}))
      .pipe(rename('index.html'))
      .pipe(gulp.dest('.'));

})

gulp.task("server", ["connect"], function () {
    // require("opn")("http://localhost:9000");
});


gulp.task("watch", ["connect", "server"], function () {
    var server = livereload();

    gulp.watch([dest, "!" + dest + "/bower_components/**", "!" + dest + "/node_modules/**"]).on("change", function (file) {
        server.changed(file.path);
    });
    // gulp.watch(dest + "/styles/*.scss", ["sass"]);
    // gulp.watch(dest + "/svg/**", ["sass"]);
});

gulp.task("default", ["build", "watch"]);
