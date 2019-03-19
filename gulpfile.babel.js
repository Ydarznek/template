'use strict';

import browserSync from 'browser-sync';
const server = browserSync.create();

const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-html-minifier');
const imagemin = require('gulp-imagemin');
const include = require('posthtml-include');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const postcss = require('gulp-postcss');
const posthtml = require('gulp-posthtml');
const rename = require('gulp-rename');
const svgstore = require('gulp-svgstore');
const uglify = require('gulp-uglify');
const webp = require('gulp-webp');

const clean = () => {
  return del('build');
};

const copy = () => {
  return gulp.src([
   'source/fonts/**/*.{woff,woff2}',
    'source/img/*.{svg,jpg,jpeg,png,webp}',
    'source/js/**'
   ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
};

const images = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
   .pipe(gulp.dest('source/img'));
};

const styles = () => {
  return gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
};

const buildStyles = (done) => {
  styles();
  done();
}

const webpImages = () => {   
  return gulp.src('source/img/*.{png,jpeg,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('source/img'));
};

const sprite = () => { 
  return gulp.src('source/img/soc-*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('source/img'));
};

const html = () => {
  gulp.src('source/*.pug')
    .pipe(pug())
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true}))
    .pipe(gulp.dest('build'))
    .pipe(server.stream())
};

const buildHtml = (done) => {
  html();
  done()
}

const scripts = () => {  
   return gulp.src('source/js/*.js') 
   .pipe(concat('script.min.js'))
   .pipe(babel())
   .pipe(uglify())
   .pipe(gulp.dest('build/js'))
   .pipe(server.stream())
};

const buildScripts = (done) => {
  scripts();
  done();
}

const reload = (done) => {
  server.reload();
  done();
}

const serve = (done) => {
  server.init({
    server: 'build/',
    notify: false,
    open: true, 
    cors: true,
    ui: false
  });
  done();
}

const watchFiles = () => {
  gulp.watch('source/less/**/*.less', buildStyles);
  gulp.watch('source/less/*.less', buildStyles);
  gulp.watch('source/*.pug', buildHtml);
  gulp.watch('source/pug/*.pug', buildHtml);
  gulp.watch('source/js/*.js', buildScripts);
};

const build = gulp.series(clean, copy, gulp.parallel(buildHtml, buildStyles, buildScripts, images));
export const watch = gulp.parallel(serve, watchFiles);
export default build;