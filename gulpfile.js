const gulp = require("gulp");
const size = require("gulp-size");
const count = require("gulp-count");
const mocha = require("gulp-mocha");
const uglifyes = require("gulp-uglifyes");
const replace = require("gulp-replace");
const _package = require("./package.json");

var paths = {
    mainjs: "src/js/ripe.js",
    maincss: "src/css/ripe.css",
    scripts: "src/js/**/*.js",
    css: "src/css/**/*.css",
    test: "test/js/**/*.js"
};

gulp.task("build-js", function() {
    return gulp.src(paths.scripts)
        .pipe(uglifyes({
            mangle: false,
            ecma: 6
        }))
        .pipe(replace("__VERSION__", _package.version))
        .pipe(size())
        .pipe(size({
            gzip: true
        }))
        .pipe(gulp.dest("./dist"))
        .pipe(count("## js files copied"));
});

gulp.task("move-js", function() {
    return gulp.src(paths.mainjs)
        .pipe(gulp.dest("src/python/ripe_demo/static/js"));
});

gulp.task("move-css", function() {
    return gulp.src(paths.maincss)
        .pipe(gulp.dest("src/python/ripe_demo/static/css"));
});

gulp.task("test", function() {
    return gulp.src(paths.test)
        .pipe(mocha({
            reporter: "spec"
        }));
});

gulp.task("default", ["build-js", "move-js", "move-css"]);
