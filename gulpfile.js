// 
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
//


var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');


var clientBundler = watchify(browserify('./client/index.js', watchify.args));
var adminBundler = watchify(browserify('./admin/main.js', watchify.args));


function bundleClient() {
  console.log('bundling client...');
  return clientBundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./client'));
}

function bundleAdmin() {
  console.log('bundling admin...');
  return adminBundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./admin'));
}


clientBundler.on('update', bundleClient);
adminBundler.on('update', bundleAdmin);

gulp.task('browserifyClient', bundleClient);
gulp.task('browserifyAdmin', bundleAdmin);


gulp.task('lint', function () {
  return gulp.src([
    'gulpfile.js',
    'bin/**/*.js',
    'client/**/*.js',
    'server/**/*.js',
    'test/**/*.js'
  ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('test', function () {
  return gulp.src('test/**/*.spec.js', { read: false })
    .pipe(mocha({ /*reporter: 'nyan'*/ }));
});


gulp.task('default', [ 'browserifyClient', 'browserifyAdmin' ]);

