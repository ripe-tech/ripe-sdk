const gulp = require("gulp");
const zip = require("gulp-zip");
const size = require("gulp-size");
const babel = require("gulp-babel");
const count = require("gulp-count");
const mocha = require("gulp-mocha");
const jsdoc = require("gulp-jsdoc3");
const concat = require("gulp-concat");
const eslint = require("gulp-eslint");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const replace = require("gulp-replace");
const _package = require("./package.json");

var paths = {
    mainjs: "dist/ripe.js",
    maincss: "src/css/ripe.css",
    scripts: "src/js/**/*.js",
    bscripts: "src/js/*/**/*.js",
    css: "src/css/**/*.css",
    docs: "src/js/*/**/*.js",
    test: "test/js/**/*.js",
    dist: "dist/**/*",
    polyfill: "node_modules/@babel/polyfill/dist/polyfill.js",
    basefiles: [
        "src/js/base/base.js",
        "src/js/base/compat.js",
        "src/js/base/interactable.js",
        "src/js/base/mobile.js",
        "src/js/base/observable.js",
        "src/js/base/ripe.js",
        "src/js/base/utils.js",
        "src/js/base/api.js",
        "src/js/base/auth.js",
        "src/js/api/locale.js",
        "src/js/api/oauth.js",
        "src/js/api/order.js",
        "src/js/api/size.js",
        "src/js/plugins/base.js",
        "src/js/plugins/diag.js",
        "src/js/plugins/restrictions.js",
        "src/js/plugins/sync.js",
        "src/js/visual/visual.js",
        "src/js/visual/configurator.js",
        "src/js/visual/image.js"
    ]
};

gulp.task("build-js", () => {
    return gulp
        .src(paths.scripts)
        .pipe(replace("__VERSION__", _package.version))
        .pipe(size())
        .pipe(
            size({
                gzip: true
            })
        )
        .pipe(gulp.dest("dist"))
        .pipe(count("## js files copied"));
});

gulp.task("build-package-js", () => {
    return gulp
        .src([paths.polyfill].concat(paths.basefiles))
        .pipe(replace("__VERSION__", _package.version))
        .pipe(
            babel({
                presets: [["@babel/preset-env"]]
            })
        )
        .pipe(concat("ripe.js"))
        .pipe(gulp.dest("dist"))
        .pipe(rename("ripe.min.js"))
        .pipe(
            terser({
                mangle: false,
                ecma: 5
            })
        )
        .pipe(gulp.dest("dist"));
});

gulp.task("move-js", () => {
    return gulp.src(paths.mainjs).pipe(gulp.dest("src/python/ripe_demo/static/js"));
});

gulp.task("move-css", () => {
    return gulp.src(paths.maincss).pipe(gulp.dest("src/python/ripe_demo/static/css"));
});

gulp.task(
    "compress",
    gulp.series("build-js", () => {
        return gulp
            .src(paths.dist)
            .pipe(zip("dist.zip"))
            .pipe(gulp.dest("build"));
    })
);

gulp.task("mark", () => {
    return gulp
        .src(paths.scripts)
        .pipe(replace("__VERSION__", _package.version))
        .pipe(gulp.dest("src/js"));
});

gulp.task("lint", () => {
    return gulp
        .src([paths.bscripts, paths.test])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("test", () => {
    return gulp.src(paths.test).pipe(
        mocha({
            reporter: "spec"
        })
    );
});

gulp.task("docs", cb => {
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

gulp.task("build", gulp.series("build-js", "build-package-js", "move-js", "move-css", "compress"));

gulp.task("watch", gulp.series("build", "watch-js", "watch-css"));

gulp.task("default", gulp.series("build"));
