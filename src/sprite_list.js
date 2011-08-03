var jaws = (function(jaws) {
/**
 
@class Manages all your Sprites in lists. Makes easy mass-draw() / update() possible among others.

<pre>
Sprites (your bullets, aliens, enemies, players etc) will need to be
updated, draw, deleted. Often in various orders and based on different conditions.

This is where SpriteList() comes in.

var enemies = new SpriteList()
for(i=0; i < 100; i++) { // create 100 enemies 
  enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
}
enemies.draw() // calls draw() on all enemies 
enemies.deleteIf(isOutsideCanvas)  // deletes each item in enemies that returns true when isOutsideCanvas(item) is called
enemies.drawIf(isInsideViewport)   // only call draw() on items that returns true when isInsideViewport is called with item as argument 
</pre>

*/
jaws.SpriteList = function() {}
jaws.SpriteList.prototype = new Array

/** Remove a certain sprite from list */
jaws.SpriteList.prototype.remove = function(obj) {
  var index = this.indexOf(obj)
  if(index > -1) { this.splice(index, 1) }
}

/** Draw all sprites in spritelist */
jaws.SpriteList.prototype.draw = function() {
  for(i=0; this[i]; i++) { 
    this[i].draw() 
  }
}

/** Draw sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.drawIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].draw() }
  }
}

/** Call update() on all sprites in spritelist */
jaws.SpriteList.prototype.update = function() {
  for(i=0; this[i]; i++) {
    this[i].update()
  }
}

/** Call update() on sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.updateIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].update() }
  }
}

/** Delete sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.deleteIf = function(condition) {
  for(var i=0; this[i]; i++) {
    if( condition(this[i]) ) { this.splice(i,1) }
  }
}
jaws.SpriteList.prototype.toString = function() { return "[SpriteList " + this.length + " sprites]" }

return jaws;
})(jaws || {});

