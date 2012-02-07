var jaws = (function(jaws) {
/**
 
@class Manages all your Sprites in lists. Makes easy mass-draw() / update() possible among others. Implements Array API. "Field Summary" contains options for the SpriteList()-constructor.

@example
// Sprites (your bullets, aliens, enemies, players etc) will need to be
// updated, draw, deleted. Often in various orders and based on different conditions.
// This is where SpriteList() comes in:

// create 100 enemies 
var enemies = new SpriteList()
for(i=0; i < 100; i++) { 
  enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
}
enemies.draw()                    // calls draw() on all enemies 
enemies.removeIf(isOutsideCanvas) // removes each item in enemies that returns true when isOutsideCanvas(item) is called
enemies.drawIf(isInsideViewport)  // only call draw() on items that returns true when isInsideViewport is called with item as argument 

*/
jaws.SpriteList = function SpriteList(options) {
  // Make both sprite_list = new SpriteList() and sprite_list = SpriteList() work
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.sprites = []
  this.length = 0
  
  if(options) this.load(options);
}

/**
 * Return the sprite at the specified index.
 * Replaces the array [] notation.
 * So:
 * my_sprite_list.at(1) is equivalent to my_array[1]
 * 
 * @param {integer} index
 * @returns Element at index
 */
jaws.SpriteList.prototype.at = function(index) {
  return this.sprites[index]
}

// Implement the Array API functions

jaws.SpriteList.prototype.concat = function() {
  return this.sprites.concat.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.indexOf = function(searchElement, fromIndex) {
  return this.sprites.indexOf(searchElement, fromIndex)
}

/**
 * Joins the contents of the sprite list into a string.
 * 
 * Implemented mostly for an easy verbose way to display the sprites 
 * inside the sprite list.
 */
jaws.SpriteList.prototype.join = function(separator) {
  return this.sprites.join(separator)
}

jaws.SpriteList.prototype.lastIndexOf = function() {
  return this.sprites.lastIndexOf.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.pop = function() {
  var element = this.sprites.pop()
  this.updateLength()
  return element
}

jaws.SpriteList.prototype.push = function() {
  this.sprites.push.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

jaws.SpriteList.prototype.reverse = function() {
  this.sprites.reverse()
}

jaws.SpriteList.prototype.shift = function() {
  var element = this.sprites.shift()
  this.updateLength()
  return element
}

jaws.SpriteList.prototype.slice = function(start, end) {
  return this.sprites.slice(start, end)
}

jaws.SpriteList.prototype.sort = function() {
  this.sprites.sort.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.splice = function() {
  this.sprites.splice.apply(this.sprites, arguments)
  this.updateLength()
}

jaws.SpriteList.prototype.unshift = function() {
  this.sprites.unshift.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

jaws.SpriteList.prototype.updateLength = function() {
  this.length = this.sprites.length
}

jaws.SpriteList.prototype.valueOf = function() {
  return this.toString()
}

// Implement "extras" / standardized Array functions
// See http://dev.opera.com/articles/view/javascript-array-extras-in-detail/ for discussion, browser compatibility

// Does not mutate
jaws.SpriteList.prototype.filter = function() {
  return this.sprites.filter.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.forEach = function() {
  this.sprites.forEach.apply(this.sprites, arguments)
  this.updateLength()  // in case the forEach operation changes the sprites array
}

// Does not mutate
jaws.SpriteList.prototype.every = function() {
  return this.sprites.every.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.map = function() {
  return this.sprites.map.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.reduce = function() {
  return this.sprites.reduce.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.reduceRight = function() {
  return this.sprites.reduceRight.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.some = function() {
  return this.sprites.some.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.isSpriteList = function() {
  return true;
}

/**
 * Load sprites into sprite list.
 *
 * Argument could either be
 * - an array of Sprite objects
 * - an array of JSON objects
 * - a JSON.stringified string representing an array of JSON objects
 *
 */
jaws.SpriteList.prototype.load = function(objects) {
  console.log(objects)
  var that = this;  // Since forEach changes this into DOMWindow.. hm, lame.
  if(jaws.isArray(objects)) {
    // If this is an array of JSON representations, parse it
    if(objects.every(function(item) { return item._constructor })) {
      parseArray(objects)
    } else {
      // This is an array of Sprites, load it directly
      this.sprites = objects
    }
  }
  else if(jaws.isString(objects)) { parseArray( JSON.parse(objects) ); console.log(objects) }
  this.updateLength()
  
  function parseArray(array) {
    array.forEach( function(data) {
      var constructor = data._constructor ? eval(data._constructor) : data.constructor
      if(jaws.isFunction(constructor)) {
        jaws.log("Creating " + data._constructor + "(" + data.toString() + ")", true)
        var object = new constructor(data)
        object._constructor = data._constructor || data.constructor.name
        that.push(object);
      }
    });
  }
}

/** Removes the first occurrence of obj from list */
jaws.SpriteList.prototype.remove = function(obj) {
  var index = this.indexOf(obj)
  if(index > -1) { this.splice(index, 1) }
  this.updateLength()
}

/** Draw all sprites in spritelist */
jaws.SpriteList.prototype.draw = function() {
  this.forEach(function(ea) {
    ea.draw()
  })
}

/** Draw sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.drawIf = function(condition) {
  this.forEach(function(ea) {
    if( condition(ea) ) {
      ea.draw()
    }
  })
}

/** Call update() on all sprites in spritelist */
jaws.SpriteList.prototype.update = function() {
  this.forEach(function(ea) {
    ea.update()
  })
}

/** Call update() on sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.updateIf = function(condition) {
  this.forEach(function(ea) {
    if( condition(ea) ) {
      ea.update()
    }
  })
}

/** 
 * Delete sprites in spritelist where condition(sprite) returns true.
 * Alias for removeIf()
 * @deprecated
 */
jaws.SpriteList.prototype.deleteIf = function(condition) {
  this.removeIf(condition)
}

/** Remove sprites in spritelist where condition(sprite) returns true  */
jaws.SpriteList.prototype.removeIf = function(condition) {
  this.sprites = this.filter(function(ea) {
    return !condition(ea)
  })
  this.updateLength()
}

jaws.SpriteList.prototype.toString = function() { return "[SpriteList " + this.length + " sprites]" }

return jaws;
})(jaws || {});

