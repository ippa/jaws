/* Built at 2013-08-29 21:06:03 +0200 */
var jaws = (function(jaws) {

/**
 * A-Star pathfinding
 *
 *  Takes starting and ending x,y co-ordinates (from a mouse-click for example),
 *  which are then translated onto the TileMap grid. 
 *  
 *  Does not allow for Diagonal movements
 *
 *  Uses a very simple Heuristic [see crowFlies()] for calculating node scores.
 *
 *  Very lightly optimised for speed over memory usage.
 *
 *  Returns a list of [col, row] pairs that define a valid path. Due to the simple Heuristic
 *  the path is not guaranteed to be the best path.
 */
jaws.TileMap.prototype.findPath = function(start_position, end_position, inverted) {
  
  if (typeof inverted == 'undefined') { inverted = false }
  
  var start_col = parseInt(start_position[0] / this.cell_size[0])
  var start_row = parseInt(start_position[1] / this.cell_size[1])
  
  var end_col = parseInt(end_position[0] / this.cell_size[0])
  var end_row = parseInt(end_position[1] / this.cell_size[1])
  
  if (start_col === end_col && start_row === end_row) {
    return [{x: start_position[0], y:start_position[1]}]
  }
  
  var col = start_col
  var row = start_row
  var step = 0
  var score = 0
  //travel corner-to-corner, through every square, plus one, just to make sure
  var max_distance = (this.size[0]*this.size[1] * 2)+1
  
  var open_nodes = new Array(this.size[0])
  for(var i=0; i < this.size[0]; i++) {
    open_nodes[i] = new Array(this.size[1])
    for(var j=0; j < this.size[1]; j++) {
      open_nodes[i][j] = false
    }
  }
  open_nodes[col][row] = {parent: [], G: 0, score: max_distance}
  
  var closed_nodes = new Array(this.size[0])
  for(var i=0; i < this.size[0]; i++) {
    closed_nodes[i] = new Array(this.size[1])
    for(var j=0; j < this.size[1]; j++) {
      closed_nodes[i][j] = false
    }
  }

  var crowFlies = function(from_node, to_node) {
    return Math.abs(to_node[0]-from_node[0]) + Math.abs(to_node[1]-from_node[1]);
  }
  
  var findInClosed = function(col, row) {
    if (closed_nodes[col][row])
    {
      return true
    }
    else {return false}
  }
  
  while ( !(col === end_col && row === end_row) ) {
    /**
     *  add the nodes above, below, to the left and right of the current node
     *  if it doesn't have a sprite in it, and it hasn't already been added
     *  to the closed list, recalculate its score from the current node and
     *  update it if it's already in the open list.
     */
    var left_right_up_down = []
    if (col > 0) { left_right_up_down.push([col-1, row]) }
    if (col < this.size[0]-1) { left_right_up_down.push([col+1, row]) }
    if (row > 0) {left_right_up_down.push([col, row-1])}
    if (row < this.size[1]-1) { left_right_up_down.push([col, row+1]) }
    
    for (var i=0 ; i<left_right_up_down.length ; i++) {
        var c = left_right_up_down[i][0]
        var r = left_right_up_down[i][1]
        if ( ( (this.cell(c, r).length === 0 && !inverted) || 
               (this.cell(c, r).length  >  0 &&  inverted)    ) && 
               !findInClosed(c, r) ) 
        {
            score = step+1+crowFlies([c, r] , [end_col, end_row])
            if (!open_nodes[c][r] || (open_nodes[c][r] && open_nodes[c][r].score > score)) {
                open_nodes[c][r] = {parent: [col, row], G: step+1, score: score}
            }
        }
    }
    
    /**
     *  find the lowest scoring open node
     */
    var best_node = {node: [], parent: [], score: max_distance, G: 0}
    for (var i=0 ; i<this.size[0] ; i++) {
      for(var j=0 ; j<this.size[1] ; j++) {
        if (open_nodes[i][j] && open_nodes[i][j].score < best_node.score) {
          best_node.node = [i, j]
          best_node.parent = open_nodes[i][j].parent
          best_node.score = open_nodes[i][j].score
          best_node.G = open_nodes[i][j].G
        }
      }
    }
    if (best_node.node.length === 0) { //open_nodes is empty, no route found to end node
      return []
    }
    
    //This doesn't stop the node being added again, but it doesn't seem to matter
    open_nodes[best_node.node[0]][best_node.node[1]] = false
    
    col = best_node.node[0]
    row = best_node.node[1]
    step = best_node.G
    
    closed_nodes[col][row] = {parent: best_node.parent}
  }
  
  /**
   *  a path has been found, construct it by working backwards from the
   *  end node, using the closed list
   */
  var path = []
  var current_node = closed_nodes[col][row]
  path.unshift({x: col*this.cell_size[0], y: row*this.cell_size[1]})
  while(! (col === start_col && row === start_row) ) {
    col = current_node.parent[0]
    row = current_node.parent[1]
    path.unshift({x: col*this.cell_size[0], y: row*this.cell_size[1]})
    current_node = closed_nodes[col][row]
  }
  return path
  
}

jaws.TileMap.prototype.lineOfSight = function(start_position, end_position, inverted) {
  if (typeof inverted == 'undefined') { inverted = false }
  
  var x0 = start_position[0]
  var x1 = end_position[0]
  var y0 = start_position[1]
  var y1 = end_position[1]
  
  var dx = Math.abs(x1-x0)
  var dy = Math.abs(y1-y0)

  var sx, sy
  if (x0 < x1) {sx = 1} else {sx = -1}
  if (y0 < y1) {sy = 1} else {sy = -1}
  
  var err = dx-dy
  var e2
  
  while(! (x0 === x1 && y0 === y1) )
  {
    if (inverted) { if (this.at(x0,y0).length === 0) {return false} }
    else { if (this.at(x0,y0).length > 0) {return false} }
    e2 = 2 * err
    if (e2 > -dy)
    {
      err = err - dy
      x0 = x0 + sx
    }
    if (e2 < dx)
    {
      err = err + dx
      y0 = y0 + sy
    }
  }
  
  return true
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {
/**
 * @class Manages all your Sprites in lists. Makes easy mass-draw() / update() possible among others. Implements Array API. "Field Summary" contains options for the SpriteList()-constructor.
 * 
 * Sprites (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 * This is where SpriteList() comes in:
 * 
 * @example
 * // create 100 enemies 
 * var enemies = new SpriteList()
 * for(i=0; i < 100; i++) { 
 *   enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
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

// Implement the Array API functions

/**
 * Concatenate this sprite list and another array. Does not modify original.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/concat 
 * @return {Object} A new SpriteList comprised of this one joined with other lists. 
 */
jaws.SpriteList.prototype.concat = function() {
  return this.sprites.concat.apply(this.sprites, arguments)
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
 * Joins the contents of the sprite list into a string.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/join
 * 
 * Implemented mostly for an easy verbose way to display the sprites 
 * inside the sprite list.
 * @param {String} [separator] String to separate each array element. If ommitted, defaults to comma.
 */
jaws.SpriteList.prototype.join = function(separator) {
  return this.sprites.join(separator)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
 */
jaws.SpriteList.prototype.lastIndexOf = function() {
  return this.sprites.lastIndexOf.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop
 * @returns {Object} Last sprite in the list
 */
jaws.SpriteList.prototype.pop = function() {
  var element = this.sprites.pop()
  this.updateLength()
  return element
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push
 * @returns {Number} New length of the sprite list
 */
jaws.SpriteList.prototype.push = function() {
  this.sprites.push.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reverse
 */
jaws.SpriteList.prototype.reverse = function() {
  this.sprites.reverse()
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/shift
 * @returns {Object} First sprite in the list
 */
jaws.SpriteList.prototype.shift = function() {
  var element = this.sprites.shift()
  this.updateLength()
  return element
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
 * Add or remove sprites from the list.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice
 * @return {Array} Array containing removed sprites
 */
jaws.SpriteList.prototype.splice = function() {
  var removedElements = this.sprites.splice.apply(this.sprites, arguments)
  this.updateLength()
  return removedElements
}

/**
 * Add one or more sprites to the front of the list
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift
 * @returns {Number} New length of the sprite list
 */
jaws.SpriteList.prototype.unshift = function() {
  this.sprites.unshift.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
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
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
 * @return {Array}
 */
jaws.SpriteList.prototype.filter = function() {
  return this.sprites.filter.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
 */
jaws.SpriteList.prototype.forEach = function() {
  this.sprites.forEach.apply(this.sprites, arguments)
  this.updateLength()  // in case the forEach operation changes the sprites array
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
 * @returns {Boolean}
 */
jaws.SpriteList.prototype.every = function() {
  return this.sprites.every.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
 * @returns {Array}
 */
jaws.SpriteList.prototype.map = function() {
  return this.sprites.map.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
 * @returns {Object|Number|String}
 */
jaws.SpriteList.prototype.reduce = function() {
  return this.sprites.reduce.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight
 * @returns {Object|Number|String}
 */
jaws.SpriteList.prototype.reduceRight = function() {
  return this.sprites.reduceRight.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
 * @returns {Boolean}
 */
jaws.SpriteList.prototype.some = function() {
  return this.sprites.some.apply(this.sprites, arguments)
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

/**
 * @fileOverview A jaws.Audio object that detects and loads supported filetypes
 * 
 * The jaws.Audio object uses jaws.assets to determine if a particular
 *  reported MIME audio filetype can be played within the current enviroment.
 *  
 *  Note: If loading fails at any point or no supported types were found,
 *        the 'audio' property is set to null. 
 * 
 * @see jaws.assets.file_type
 * @see jaws.assets.can_play
 * 
 * @class jaws.Audio
 * @property {array|string|Audio|null}   audio   A string or array of file locations initally; 
 *                                               replaced with an Audio object if loading was successful
 *
 * @example
 * var audio = new jaws.Audio({audio: ["file.mp3", "file.ogg"], volume: 1.0});
 * 
 * audio.play() //Assuming either MP3 or OGG is supported
 *  
 * //Because play(), stop(), and other audio functions will log an error 
 * // if 'audio' is not an Audio object, its load status can be checked too. 
 * 
 * if(audio.isLoaded()) {
 *   audio.play(); 
 * }
 * 
 */
var jaws = (function(jaws) {

  /**
   * jaws.Audio object
   * @constructor
   * @param {object} options Object-literal of constructor properties
   * @param {bool}         [options.loop]        Whether to initially loop the playing or not
   * @param {bool}         [options.mute]        Whether to initially mute the audio or not
   * @param {bool}         [options.pause]       Whether to initially pause the audio or not
   * @param {bool}         [options.autoplay]    Whether to start playing after loading
   * @param {int}          [options.volume]      Initial audio volume, between 0.1 and 1.0
   * @param {function}     [options.onend]       Initial callback on "end" event for audio
   * @param {function}     [options.onplay]      Initial callback on "play" event for audio
   * @param {function}     [options.onpause]     Initial callback on "pause" event for audio
   * @see jaws.audio.set()
   */
  jaws.Audio = function Audio(options) {
    if (!(this instanceof arguments.callee))
      return new arguments.callee(options);

    if (typeof Audio !== "undefined") {
      this.set(options);
    } else {
      jaws.log.error("jaws.Audio (constructor): 'Audio' object does not exist.");
      this.audio = null;
    }
  };

  /**
   * The default properties and their values
   * @type {object}
   */
  jaws.Audio.prototype.default_options = {
    audio: null,
    autoplay: false,
    loop: false,
    volume: 0,
    onend: null,
    onplay: null,
    onpause: null,
    _constructor: null
  };

  /**
   * Compares default_options to the constructor options and loads an audio resource if able
   * @param {object} options Object-literal of constructor properties
   * @this {jaws.Audio}
   * @returns {object} The 'this' scope of the calling instance of an jaws.Audio object
   */
  jaws.Audio.prototype.set = function(options) {

    jaws.parseOptions(this, options, this.default_options);

    if (this.audio) {
      if (jaws.isString(this.audio)) {
        var type = jaws.assets.getPostfix(this.audio);
        if (jaws.assets.file_type[type] && jaws.assets.can_play[type]) {
          this.setAudio(this.audio);
        } else {
          jaws.log.warn("jaws.Audio.set: Unknown or unplayable MIME filetype.");
          this.audio = null;
        }
      } else if (jaws.isArray(this.audio)) {
        for (var i = 0; i < this.audio.length; i++) {
          if (jaws.isString(this.audio[i])) {
            var type = jaws.assets.getPostfix(this.audio[i]);
            if (jaws.assets.file_type[type] && jaws.assets.can_play[type]) {
              this.setAudio(this.audio[i]);
              break;
            }
          }
        }

        if (!(this.audio instanceof Audio)) {
          jaws.log.warn("jaws.Audio.set: No known or playable MIME filetypes were found.");
          this.audio = null;
        }
        
      } else {
        jaws.log.error("jaws.Audio.set: Passed in 'audio' property is neither a String nor Array");
        this.audio = null;
      }
    }
    return this;
  };

  /**
   * Loads a reference from the jaws.assets cache or requests that an Audio resource URL be loaded
   * @param {type} value
   * @this {jaws.Audio}
   * @returns {object} The 'this' scope of the calling instance of an jaws.Audio object
   */
  jaws.Audio.prototype.setAudio = function(value) {
    var self = this;
    if (jaws.assets.isLoaded(value)) {
      var audio = jaws.assets.get(value);
      if (audio instanceof Audio) {
        this.audio = audio;

        if (this.volume >= 0 && this.volume <= 1.0 && jaws.isNumber(this.volume))
          this.audio.volume = this.volume;

        if (this.loop)
          this.audio.loop = this.loop;

        if (this.onend && jaws.isFunction(this.onend)) {
          this.audio.addEventListener('end', this.onend);
        }

        if (this.onplay && jaws.isFunction(this.onplay)) {
          this.audio.addEventListener('play', this.onplay);
        }

        if (this.onpause && jaws.isFunction(this.onplay)) {
          this.audio.addEventListener('pause', this.onpause);
        }

        if (this.autoplay)
          this.audio.autoplay = this.autoplay;

      } else {
        this.audio = null;
      }
    } else {
      jaws.log.warn("jaws.Audio.setAudio: Audio '" + value + "' not preloaded with jaws.assets.add().");
      jaws.assets.load(value, function() {
        var audio = jaws.assets.get(value);
        if (audio instanceof Audio) {
          self.audio = audio;

          if (self.volume >= 0 && self.volume <= 1.0 && jaws.isNumber(self.volume))
            self.audio.volume = self.volume;

          if (self.loop)
            self.audio.loop = self.loop;

          if (self.hasOwnProperty("onend") && jaws.isFunction(self.onend)) {
            self.audio.addEventListener('end', self.onend);
          }

          if (self.hasOwnProperty("onplay") && jaws.isFunction(self.onplay)) {
            self.audio.addEventListener('play', self.onplay);
          }

          if (self.hasOwnProperty("onpause") && jaws.isFunction(self.onplay)) {
            self.audio.addEventListener('pause', self.onpause);
          }

          if (self.autoplay)
            self.audio.autoplay = self.autoplay;

        } else {
          self.audio = null;
        }
      }, function() {
        jaws.log.error("jaws.Audio.setAudio: Could not load Audio resource URL " + value);
        self.audio = null;
      });
    }
    return this;
  };

  /**
   * Plays audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.play = function() {
    if (this.audio instanceof Audio) {
      this.audio.play();
    } else {
      jaws.log.error("jaws.Audio.play: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Stops audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.stop = function() {
    if (this.audio instanceof Audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      jaws.log.error("jaws.Audio.stop: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Pauses audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.pause = function() {
    if (this.audio instanceof Audio) {
      this.audio.pause();
    } else {
      jaws.log.error("jaws.Audio.pause: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Mutes the audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.mute = function() {
    if (this.audio instanceof Audio) {
      this.audio.mute = true;
    } else {
      jaws.log.error("jaws.Audio.mute: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Unmute the audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.unmute = function() {
    if (this.audio instanceof Audio) {
      this.audio.mute = false;
    } else {
      jaws.log.error("jaws.Audio.unmute: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Seeks to a position in audio
   * @param {type} value
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.seekTo = function(value) {
    if (this.audio instanceof Audio) {
      if (jaws.isNumber(value)) {
        if (value <= this.audio.duration) {
          this.audio.currentTime = value;
        } else {
          this.audio.currentTime = this.audio.duration;
        }
      }
    } else {
      jaws.log.warn("jaws.Audio.seekTo: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Sets the volume of the audio
   * @param {type} value The new volume within the range 0.0 to 1.0
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.setVolume = function(value) {
    if (this.audio instanceof Audio) {
      if (jaws.isNumber(value) && value <= 1.0 && value >= 0) {
        this.audio.volume = value;
      }
    } else {
      jaws.log.warn("jaws.Audio: jaws.setVolume: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Returns if 'audio' is actually an Audio object
   */
  jaws.Audio.prototype.isLoaded = function() {
    return (this.audio instanceof Audio);
  };

  /**
   * Returns a String containing value properties
   * @this {jaws.Audio}
   * @returns {String}
   */
  jaws.Audio.prototype.toString = function() {
    var properties = "[Audio ";
    if (this.audio instanceof Audio) {
      properties += this.audio.src + ", ";
      properties += this.audio.currentTime + ", ";
      properties += this.audio.duration + ", ";
      properties += this.audio.volume + " ]";
    } else {
      properties += null + " ]";
    }
    return properties;
  };

  /**
   * Returns an object created with values from 'this' properties
   * @this {jaws.Audio}
   * @returns {object}
   */
  jaws.Audio.prototype.attributes = function() {
    var object = this.options;
    object["_constructor"] = this._constructor || "jaws.Audio";

    if (this.audio instanceof Audio) {
      object["audio"] = this.audio.src;
      object["loop"] = this.loop;
      object["muted"] = this.audio.muted;
      object["volume"] = this.audio.volume;
    } else {
      object["audio"] = null;
    }

    if (this.hasOwnProperty("autoplay"))
      object["autoplay"] = this.autoplay;

    return object;
  };

  /**
   * Return the properties of the current object as a JSON-encoded string
   * @this {jaws.Audio}
   * @returns {string} The properties of the jaws.Audio object as a JSON-encoded string
   */
  jaws.Audio.prototype.toJSON = function() {
    return JSON.stringify(this.attributes());
  };

  return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.Audio;
}