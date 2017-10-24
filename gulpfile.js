const gulp = require('gulp');
const tsc = require('gulp-typescript');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const tsProject = tsc.createProject('tsconfig.json');
const connect = require('gulp-connect');

//--------------- Configurations Constants ------------
var server_port = 8080;
var paths = {
    sourceRoot: "./app/",
    webroot: "./deploy/",
    node_modules: "./node_modules/",
};

paths.modulesDestination = paths.webroot + "vendors/";
paths.style_in = paths.sourceRoot + "styles/";
paths.typescript_in = paths.sourceRoot + "scripts/";
paths.style_out = paths.webroot + "styles/";
paths.typescript_out = paths.webroot + "output"
paths.files_out = paths.webroot + "files";
paths.allTypeScript = paths.typescript_in + "**/*.ts";


//------------------------ Tasks ------------------------

gulp.task("clean", (callback) => {
    var typeScriptGenFiles = [
        paths.typescript_out + "/**/*.js",
        paths.typescript_out + "/**/*.js.map"
    ];

    del(typeScriptGenFiles, callback);
});

gulp.task("purge", (callback) => {
    del(paths.webroot + "**", callback);
});

gulp.task("copy", () => {
    var modulesToMove = {
        "jquery": "jquery/dist/jquery*.{js,map}",
        "lodash": "lodash/lodash*.{js,map}",
        "requirejs": "requirejs/*.{js,map}",
        "reflect-metadata": "reflect-metadata/*.{js,map}",
    }

    for (var destinationDir in modulesToMove) {
        gulp.src(paths.node_modules + modulesToMove[destinationDir])
            .pipe(gulp.dest(paths.modulesDestination + destinationDir));
    }

    gulp.src("./app/index.html").pipe(gulp.dest(paths.webroot));
    gulp.src("./app/styles/index.css").pipe(gulp.dest(paths.style_out));
    gulp.src("./app/files/**/*").pipe(gulp.dest(paths.files_out));
});

gulp.task("build", () => {
    var compilationResults = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
    compilationResults.dts.pipe(gulp.dest(paths.typescript_out));
    return compilationResults.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.typescript_out));
});

gulp.task("buildall", ["clean", "copy", "build"], function () {
});

gulp.task('go', ["buildall", "server", "watch"], () => {

});

gulp.task('server', () => {
    connect.server({
        root: paths.webroot,
        port: server_port,
        livereload:true
    });
});

gulp.task('watch', (callback) => {
    gulp.watch(paths.typescript_in + '**/*.ts', ['build', 'tsreload']);
    gulp.watch(paths.style_in + '**/*.css', ['copy', 'cssreload']); // Fast watch, no need to compile TS, just move the css into deploy
    gulp.watch(paths.sourceRoot + '**/*.html', ['copy', 'htmlreload']); // Fast watch, no need to compile TS, just move the html into deploy
    callback();
});

gulp.task('htmlreload', () => {
    gulp.src(paths.sourceRoot + '*.html')
        .pipe(connect.reload());
});

gulp.task('cssreload', () => {
    gulp.src(paths.style_in + '*.css')
        .pipe(connect.reload());
});

gulp.task('tsreload', () => {
    gulp.src(paths.typescript_in + '*.ts')
        .pipe(connect.reload());
});
