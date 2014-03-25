var gulp = require('gulp'),
    browserify = require('gulp-browserify');

gulp.task('build', function() {
  gulp.src('src/angularFastMatcher.js')
    .pipe(browserify())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch('src/angularFastMatcher.js', ['build']);
});

gulp.task('default', ['build', 'watch']);
