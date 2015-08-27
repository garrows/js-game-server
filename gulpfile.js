var gulp = require('gulp'),
  livereload = require('gulp-livereload'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  nodemon = require('gulp-nodemon');

gulp.task('js-game', function() {
  return gulp.src([
      'examples/garrows/game/input.js',
      'examples/garrows/game/entity.js',
      'examples/garrows/game/game.js',
      'examples/garrows/game/main.js',
    ])
    .pipe(concat('concatinated-game.js', {}))
    // .pipe(uglify({
    //     mangle: true,
    //     compress: true
    //   }))
    .pipe(gulp.dest('examples/garrows/game/dist'));
});

gulp.task('js-test', function() {
  return gulp.src([
      'examples/garrows/game/entity.js',
      'examples/garrows/game/game.js',
      'examples/garrows/game/test.js',
    ])
    .pipe(concat('concatinated-test.js', {}))
    .pipe(gulp.dest('examples/garrows/game/dist'));
});

gulp.task('server', ['js-game', 'js-test'], function() {
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
    }, 500);
  })
});


gulp.task('default', ['server']);

gulp.task('run', ['isDebug', 'express', 'default'], function() {
  livereload.listen();
  // gulp.watch('src/*.js*', ['server']);
});
