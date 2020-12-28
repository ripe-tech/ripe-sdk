const log = require("fancy-log");
const gulp = require("gulp");
const zip = require("gulp-zip");
const size = require("gulp-size");
const babel = require("gulp-babel");
const count = require("gulp-count");
const mocha = require("gulp-mocha");
const jsdoc = require("gulp-jsdoc3");
const concat = require("gulp-concat");
const eslint = require("gulp-eslint7");
const terser = require("gulp-terser");
const replace = require("gulp-replace");
const sourcemaps = require("gulp-sourcemaps");
const mergeStream = require("merge-stream");
const _package = require("./package.json");

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
    dist: "dist/**/*",
    demo: "src/python/ripe_demo/static/js/main.js",
    polyfill: "node_modules/@babel/polyfill/dist/polyfill.js",
    libs: [
        "node_modules/zlibjs/bin/inflate.min.js",
        "node_modules/dat.gui/build/dat.gui.js",
        "node_modules/three/build/three.js",
        "node_modules/three/examples/js/loaders/OBJLoader.js",
        "node_modules/three/examples/js/libs/inflate.min.js",
        "node_modules/three/examples/js/loaders/FBXLoader.js",
        "node_modules/three/examples/js/loaders/GLTFLoader.js",
        "node_modules/three/examples/js/loaders/RGBELoader.js",
        "node_modules/postprocessing/build/postprocessing.js"
    ],
    basefiles: [
        "src/js/locales/base.js",
        "src/js/base/base.js",
        "src/js/base/compat.js",
        "src/js/base/errors.js",
        "src/js/base/observable.js",
        "src/js/base/interactable.js",
        "src/js/base/mobile.js",
        "src/js/base/ripe.js",
        "src/js/base/logic.js",
        "src/js/base/config.js",
        "src/js/base/easing.js",
        "src/js/base/utils.js",
        "src/js/base/api.js",
        "src/js/base/auth.js",
        "src/js/api/account.js",
        "src/js/api/brand.js",
        "src/js/api/build.js",
        "src/js/api/config.js",
        "src/js/api/country-group.js",
        "src/js/api/justification.js",
        "src/js/api/locale.js",
        "src/js/api/oauth.js",
        "src/js/api/order.js",
        "src/js/api/price-rule.js",
        "src/js/api/size.js",
        "src/js/api/sku.js",
        "src/js/plugins/base.js",
        "src/js/plugins/diag.js",
        "src/js/plugins/restrictions.js",
        "src/js/plugins/sync.js",
        "src/js/visual/visual.js",
        "src/js/visual/configurator-prc.js",
        "src/js/visual/configurator-csr.js",
        "src/js/visual/orbital-controls.js",
        "src/js/visual/csr.js",
        "src/js/visual/csr-gui.js",
        "src/js/visual/csr-asset-manager.js",
        "src/js/visual/csr-initials.js",
        "src/js/visual/configurator.js",
        "src/js/visual/image.js"
    ]
};

gulp.task("build-js", () => {
    return gulp
        .src([paths.scripts].concat(paths.libs))
        .pipe(replace("__VERSION__", _package.version))
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
    const srcStream = gulp
        .src([paths.polyfill].concat(paths.basefiles))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(replace("__VERSION__", _package.version))
        .pipe(
            babel({
                presets: [["@babel/preset-env"]]
            })
        );
    const libStream = gulp
        .src(paths.libs)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.identityMap());
    return mergeStream(srcStream, libStream)
        .pipe(concat("ripe.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
});

gulp.task("build-package-min", () => {
    const srcStream = gulp
        .src([paths.polyfill].concat(paths.basefiles))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(replace("__VERSION__", _package.version))
        .pipe(
            babel({
                presets: [["@babel/preset-env"]]
            })
        );
    const libStream = gulp
        .src(paths.libs)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.identityMap());
    return mergeStream(srcStream, libStream)
        .pipe(concat("ripe.min.js"))
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

gulp.task("mark", () => {
    return gulp
        .src([paths.scripts].concat(paths.libs))
        .pipe(replace("__VERSION__", _package.version))
        .pipe(gulp.dest("src/js"));
});

gulp.task("lint", () => {
    return gulp
        .src([paths.bscripts, paths.test, paths.demo])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("lint-fix", () => {
    return gulp
        .src([paths.bscripts, paths.test, paths.demo, paths.mainpython])
        .pipe(eslint({ fix: true }))
        .pipe(eslint.format())
        .pipe(gulp.dest(file => file.base))
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
