const {src, dest, parallel, series} = require('gulp');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');

const DESTINATION = 'Trading-Buddy-dist/Trading-Buddy';

function minifyJS() {
  return src('Trading-Buddy/js/*.js', '!Trading-Buddy/js/**/*.min.js')
    .pipe(uglify())
    .pipe(dest(`${DESTINATION}/js`));
}

function minifyCSS() {
  return src('Trading-Buddy/css/*.css')
    .pipe(cleanCSS())
    .pipe(dest(`${DESTINATION}/css`));
}


function minifyHTML() {
  return src('Trading-Buddy/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(DESTINATION));
}

function copyFiles() {
  return src('Trading-Buddy/*.json')
    .pipe(dest(DESTINATION));
}

exports.default = parallel(minifyJS, minifyCSS, series(minifyHTML, copyFiles));