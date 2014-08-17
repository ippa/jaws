var gulp = require('gulp');
var uglify = require('gulp-uglify'); 
var concat = require('gulp-concat');
var qunit = require('gulp-qunit');
var insert = require('gulp-insert');
var shell = require('gulp-shell');

var files = ["core.js", "input.js", "assets.js", "game_loop.js", "rect.js", "sprite.js", "sprite_sheet.js", "animation.js", "viewport.js", "collision_detection.js", "tile_map.js", "pixel_map.js", "parallax.js", "text.js", "quadtree.js"];
var paths = files.map( function(file) { return "src/" + file } )
 
gulp.task('build', function() {  
  gulp.src(paths)
  .pipe(concat("jaws.js"))
  .pipe(insert.prepend("/* Built at: " + (new Date()).toString() + " */\n"))
  .pipe(insert.append(';window.addEventListener("load", function() { if(jaws.onload) jaws.onload(); }, false);'))
  .pipe(gulp.dest("."))
  .pipe(uglify())
  .pipe(concat("jaws-min.js"))
  .pipe(gulp.dest("."))
});

gulp.task('docs', shell.task([
  '/usr/bin/jsdoc -D="noGlobal:true" -D="title:JawsJS HTML5 game engine documentation" -t=codeview -d=docs src',
  'zip docs/jaws-docs.zip -x jaws-docs.zip -r ./docs/'
]));

gulp.task('test', function() {
  return gulp.src("/www/ippa/jawsjs.com/public/jawsjs/test/index.html")
  .pipe(qunit()).on('error', function() { console.log("** Exit on failed tests"); process.exit(1) } );
});
