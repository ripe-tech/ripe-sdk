const gulp = require("gulp");
const zip = require("gulp-zip");
const size = require("gulp-size");
const count = require("gulp-count");
const mocha = require("gulp-mocha");
const jsdoc = require("gulp-jsdoc3");
const uglifyes = require("gulp-uglifyes");
const replace = require("gulp-replace");
const _package = require("./package.json");

var paths = {
    mainjs: "src/js/ripe.js",
    maincss: "src/css/ripe.css",
    scripts: "src/js/**/*.js",
    css: "src/css/**/*.css",
    docs: "src/js/*/**/*.js",
    test: "test/js/**/*.js",
    dist: "dist/**/*"
};

gulp.task("build-js", () => {
    return gulp.src(paths.scripts)
        .pipe(uglifyes({
            mangle: false,
            ecma: 5
        }))
        .pipe(replace("__VERSION__", _package.version))
        .pipe(size())
        .pipe(size({
            gzip: true
        }))
        .pipe(gulp.dest("dist"))
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

gulp.task("compress", ["build-js"], () => {
    return gulp.src(paths.dist)
        .pipe(zip("dist.zip"))
        .pipe(gulp.dest("build"));
});

gulp.task("mark", () => {
    return gulp.src(paths.scripts)
        .pipe(replace("__VERSION__", _package.version))
        .pipe(gulp.dest("src/js"));
});

gulp.task("test", () => {
    return gulp.src(paths.test)
        .pipe(mocha({
            reporter: "spec"
        }));
});

gulp.task("docs", (cb) => {
    gulp.src(["README.md", paths.docs], {
        read: false
    }).pipe(jsdoc(cb));
});

gulp.task("watch-js", () => {
    gulp.watch(paths.scripts, ["build-js", "move-js", "compress"]);
});

gulp.task("watch-css", () => {
    gulp.watch(paths.css, ["move-css"]);
});

gulp.task("watch", ["build", "watch-js", "watch-css"]);

gulp.task("build", ["build-js", "move-js", "move-css", "compress"]);

gulp.task("default", ["build"]);
