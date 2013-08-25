var jaws = (function(jaws) {
/**
 * @class Manages all your Sprites in lists. Makes easy mass-draw() / update() possible among others. 
 * Implements a subset of the Array API. "Field Summary" contains options for the SpriteList()-constructor.
 * 
 * Sprites (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 * This is where SpriteList() comes in:
 * 
 * @example
 * // create 100 enemies 
 * var enemies = new SpriteList()
 * for(i=0; i < 100; i++) { 
 *   enemies.add(new Sprite({image: "enemy.png", x: i, y: 200}))
 * }
 * enemies.draw()                    // calls draw() on all enemies
 * enemies.update()                  // calls update() on all enemies 
 * enemies.removeIf(isOutsideCanvas) // removes each item in enemies that returns true when isOutsideCanvas(item) is called
 * enemies.drawIf(isInsideViewport)  // only call draw() on items that returns true when isInsideViewport is called with item as argument 
 * 
 * @param {Object} [options] Currently used to pass in a literal list of sprites. See {@link SpriteList#load} for details
 */
jaws.SpriteList = function SpriteList(options) {
  // Make both sprite_list = new SpriteList() and sprite_list = SpriteList() work
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.sprites = []
  this.length = 0
  
  if(options) this.load(options);
}
/**
* Adds one or more sprites to sprite_list
*/
jaws.SpriteList.prototype.add = function() {
  var list = arguments;
  if(list.length == 1 && jaws.isArray(list[0])) list = list[0];

  if(list.length > 1) { 
    for(var i=0; i < list.length; i++) { 
      this.sprites.push(list[i])
    }
  }
  else {
    this.sprites.push(arguments)
  }

  this.updateLength()
  return this;
}

/**
 * Return the sprite at the specified index.
 * Replaces the array [] notation.
 * So:
 * my_sprite_list.at(1) is equivalent to my_array[1]
 * 
 * @param {Number} index
 * @returns {Object} Sprite at index
 */
jaws.SpriteList.prototype.at = function(index) {
  return this.sprites[index]
}


/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
 * @param {Object} searchElement
 * @param {Number} fromIndex
 * @returns {Number}
 */
jaws.SpriteList.prototype.indexOf = function(searchElement, fromIndex) {
  return this.sprites.indexOf(searchElement, fromIndex)
}

/**
 * Alias for SpriteList add
 */
jaws.SpriteList.prototype.push = function() {
  this.add(arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/slice
 * @param {Number} start
 * @param {Number} end
 * @returns {Object} A new array containing sprites (a section of the sprites array defined by start and end)
 * 
 * @todo Fix it to return SpriteList instead of array 
 */
jaws.SpriteList.prototype.slice = function(start, end) {
  return this.sprites.slice(start, end)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort
 */
jaws.SpriteList.prototype.sort = function() {
  this.sprites.sort.apply(this.sprites, arguments)
}

/**
 * Update the length of the sprite list.
 * Since we're delegating array operations to sprites array, this is not done automatically
 */
jaws.SpriteList.prototype.updateLength = function() {
  this.length = this.sprites.length
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/ValueOf
 * @return {String} Literal string representation (currently, just the value of toString() )
 */
jaws.SpriteList.prototype.valueOf = function() {
  return this.toString()
}

// Implement "extras" / standardized Array functions
// See http://dev.opera.com/articles/view/javascript-array-extras-in-detail/ for discussion, browser compatibility


/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
 */
jaws.SpriteList.prototype.forEach = function() {
  this.sprites.forEach.apply(this.sprites, arguments)
  this.updateLength()  // in case the forEach operation changes the sprites array
}

/**
 * Returns true if this object is a sprite lsit.
 * Used to tell SpriteLists and Arrays apart
 * @returns {Boolean}
 */
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
  else if(jaws.isString(objects)) { parseArray( JSON.parse(objects) ); jaws.log.info(objects) }
  this.updateLength()
  
  function parseArray(array) {
    array.forEach( function(data) {
      var constructor = data._constructor ? eval(data._constructor) : data.constructor
      if(jaws.isFunction(constructor)) {
        jaws.log.info("Creating " + data._constructor + "(" + data.toString() + ")", true)
        var object = new constructor(data)
        object._constructor = data._constructor || data.constructor.name
        that.push(object);
      }
    });
  }
}

/** 
 * Removes the first occurrence of obj from list 
 */
jaws.SpriteList.prototype.remove = function(obj) {
  var index = this.indexOf(obj)
  if(index > -1) { this.splice(index, 1) }
  this.updateLength()
}

/** 
 * Invoke draw() on each element of the sprite list
 */
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

