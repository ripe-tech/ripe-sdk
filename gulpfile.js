const log = require("fancy-log");
const gulp = require("gulp");
const zip = require("gulp-zip");
const size = require("gulp-size");
const babelify = require("babelify");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const count = require("gulp-count");
const mocha = require("gulp-mocha");
const shell = require("gulp-shell");
const jsdoc = require("gulp-jsdoc3");
const eslint = require("gulp-eslint7");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");

const paths = {
    mainjs: "dist/ripe.js",
    mainmap: "dist/ripe.js.map",
    maincss: "src/css/ripe.css",
    mainpython: "src/python/**/main.js",
    scripts: "src/js/**/*.js",
    bscripts: "src/js/*/**/*.js",
    css: "src/css/**/*.css",
    docs: "src/js/*/**/*.js",
    test: "test/js/**/*.js",
    testSetup: "test/js/setup.js",
    dist: "dist/**/*"
};

gulp.task("build-js", () => {
    return gulp
        .src(paths.scripts)
        .pipe(size())
        .pipe(
            size({
                gzip: true
            })
        )
        .pipe(gulp.dest("dist"))
        .pipe(
            count({
                message: "## js files copied",
                logger: msg => log(msg)
            })
        );
});

gulp.task("build-css", () => {
    return gulp
        .src(paths.css)
        .pipe(size())
        .pipe(
            size({
                gzip: true
            })
        )
        .pipe(gulp.dest("dist"))
        .pipe(
            count({
                message: "## css files copied",
                logger: msg => log(msg)
            })
        );
});

gulp.task("build-package-js", () => {
    return browserify({
        entries: ["src/js/index.mjs"],
        transform: [babelify.configure({ presets: ["@babel/preset-env"] })],
        plugin: [[require("esmify"), {}]],
        standalone: "default"
    })
        .bundle()
        .pipe(source("ripe.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
});

gulp.task("build-package-min", () => {
    return browserify({
        entries: ["src/js/index.mjs"],
        transform: [babelify.configure({ presets: ["@babel/preset-env"] })],
        plugin: [[require("esmify"), {}]],
        standalone: "default"
    })
        .bundle()
        .pipe(source("ripe.min.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(
            terser({
                mangle: false,
                ecma: 5
            })
        )
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
});

gulp.task("move-js", () => {
    return gulp
        .src([paths.mainjs, paths.mainmap])
        .pipe(gulp.dest("src/python/ripe_demo/static/js"));
});

gulp.task("move-css", () => {
    return gulp.src(paths.maincss).pipe(gulp.dest("src/python/ripe_demo/static/css"));
});

gulp.task(
    "compress",
    gulp.series("build-js", "build-css", () => {
        return gulp.src(paths.dist).pipe(zip("dist.zip")).pipe(gulp.dest("build"));
    })
);

gulp.task("lint", () => {
    return gulp
        .src([paths.bscripts, paths.test])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("lint-fix", () => {
    return gulp
        .src([paths.bscripts, paths.test])
        .pipe(eslint({ fix: true }))
        .pipe(eslint.format())
        .pipe(gulp.dest(file => file.base))
        .pipe(eslint.failAfterError());
});

gulp.task("test", () => {
    return gulp.src(paths.test).pipe(
        mocha({
            reporter: "spec",
            require: [paths.testSetup]
        })
    );
});

gulp.task(
    "test-coverage",
    shell.task(["nyc --reporter=lcov --reporter=text --include=src/js gulp test"])
);

gulp.task("docs", cb => {
    const config = require("./jsdoc.json");
    gulp.src(["README.md", paths.docs], {
        read: false
    }).pipe(jsdoc(config, cb));
});

gulp.task("watch-js", () => {
    gulp.watch(
        paths.scripts,
        gulp.series("build-js", "build-package-js", "build-package-min", "move-js", "compress")
    );
});

gulp.task("watch-css", () => {
    gulp.watch(paths.css, gulp.series("move-css"));
});

gulp.task(
    "build",
    gulp.series(
        "build-js",
        "build-css",
        "build-package-js",
        "build-package-min",
        "move-js",
        "move-css",
        "compress"
    )
);

gulp.task("watch", gulp.parallel("build", "watch-js", "watch-css"));

gulp.task("default", gulp.series("build"));
