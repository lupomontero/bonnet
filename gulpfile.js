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


var appPath = './lib/client';
var bundler = watchify(browserify(appPath + '/index.js', watchify.args));


function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(appPath));
}


bundler.on('update', bundle);  // on any dep update, runs the bundler
gulp.task('browserify', bundle);


gulp.task('lint', function () {
  return gulp.src([
    'gulpfile.js', 'bin/**/*.js', 'lib/**/*.js', 'test/**/*.js'
  ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('test', function () {
  return gulp.src('test/**/*.spec.js', { read: false })
    .pipe(mocha({ /*reporter: 'nyan'*/ }));
});


gulp.task('default', [ 'browserify' ]);

