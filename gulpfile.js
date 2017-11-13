const gulp = require("gulp");
const zip = require("gulp-zip");
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
    test: "test/js/**/*.js",
    dist: "dist/**/*"
};

gulp.task("build-js", () => {
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

gulp.task("move-js", () => {
    return gulp.src(paths.mainjs)
        .pipe(gulp.dest("src/python/ripe_demo/static/js"));
});

gulp.task("move-css", () => {
    return gulp.src(paths.maincss)
        .pipe(gulp.dest("src/python/ripe_demo/static/css"));
});

gulp.task("compress", ["build-js"], () =>
    gulp.src(paths.dist)
    .pipe(zip("dist.zip"))
    .pipe(gulp.dest("./"))
);

gulp.task("test", () => {
    return gulp.src(paths.test)
        .pipe(mocha({
            reporter: "spec"
        }));
});

gulp.task("default", ["build-js", "move-js", "move-css", "compress"]);
