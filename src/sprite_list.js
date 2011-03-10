var jaws = (function(jaws) {

/*
 *
 * Constructor to manage your Sprites. 
 *
 * Sprites (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 *
 * This is where SpriteList() comes in.
 *
 *   var enemies = new SpriteList()
 *
 *   for(i=0; i < 100; i++) { // create 100 enemies 
 *     enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
 *   }
 *   enemies.draw() // calls draw() on all enemies 
 *   enemies.deleteIf(isOutsideCanvas)  // deletes each item in enemies that returns true when isOutsideCanvas(item) is called
 *   enemies.drawIf(isInsideViewport)   // only call draw() on items that returns true when isInsideViewport is called with item as argument 
 *
 */

jaws.SpriteList = function() {}
jaws.SpriteList.prototype = new Array

jaws.SpriteList.prototype.draw = function() {
  for(i=0; this[i]; i++) { 
    this[i].draw() 
  }
}

jaws.SpriteList.prototype.drawIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].draw() }
  }
}

jaws.SpriteList.prototype.update = function() {
  for(i=0; this[i]; i++) {
    this[i].update()
  }
}

jaws.SpriteList.prototype.updateIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].update() }
  }
}

jaws.SpriteList.prototype.deleteIf = function(condition) {
  for(var i=0; this[i]; i++) {
    if( condition(this[i]) ) { this.splice(i,1) }
  }
}

return jaws;

})(jaws || {});

