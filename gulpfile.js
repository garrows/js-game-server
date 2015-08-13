var gulp = require('gulp'),
  livereload = require('gulp-livereload'),
  nodemon = require('gulp-nodemon');

gulp.task('server', function() {
  livereload.listen();

  nodemon({
    script: 'index.js',
    ext: 'js'
  }).on('restart', function() {
    // when the app has restarted, run livereload.
    setTimeout(function() {
      gulp.src('index.js')
        .pipe(livereload())
        // .pipe(notify('Reloading page, please wait...'));
    }, 200);
  })
});


gulp.task('default', ['server']);

gulp.task('run', ['isDebug', 'express', 'default'], function() {
  livereload.listen();
  // gulp.watch('src/*.js*', ['server']);
});
