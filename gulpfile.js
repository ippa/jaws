var gulp = require('gulp');
var uglify = require('gulp-uglify'); 
var concat = require('gulp-concat');
var qunit = require('gulp-qunit');
var insert = require('gulp-insert');

var files = ["core.js", "input.js", "assets.js", "game_loop.js", "rect.js", "sprite.js", "sprite_sheet.js", "animation.js", "viewport.js", "collision_detection.js", "pixel_map.js", "parallax.js", "text.js", "quadtree.js"];
var paths = files.map( function(file) { return "src/" + file } )
 
gulp.task('build', function() {  
  gulp.src(paths)
  .pipe(concat("jaws.js"))
  .pipe(insert.prepend("/* Built at" + (new Date()).toString() + " */\n"))
  .pipe(insert.append(';window.addEventListener("load", function() { if(jaws.onload) jaws.onload(); }, false);'))
  .pipe(gulp.dest("."))
  .pipe(uglify())
  .pipe(concat("jaws-min.js"))
  .pipe(gulp.dest("."))
});

gulp.task('test', function() {
  return gulp.src("test/index.html")
  .pipe(qunit())
});
