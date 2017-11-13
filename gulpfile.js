const gulp = require("gulp");
const mocha = require("gulp-mocha");

var paths = {
    main: "src/js/ripe.js",
    scripts: "src/js/**/*.js",
    css: "src/css/**/*.css",
    test: "test/js/**/*.js"
};

gulp.task("move-js", function() {
    return gulp.src(paths.main)
        .pipe(gulp.dest("src/python/ripe_demo/static/js"));
});

gulp.task("test", function() {
    return gulp.src(paths.test)
        .pipe(mocha({
            reporter: "spec"
        }));
});

gulp.task("default", ["move-js"]);
