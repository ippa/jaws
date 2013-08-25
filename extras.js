/* Built at 2013-08-25 11:34:45 +0200 */
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
}/*
 * @class jaws.QuadTree
 * @property {jaws.Rect}  bounds    Rect(x,y,width,height) defining bounds of tree
 * @property {number}     depth     The depth of the root node
 * @property {array}      nodes     The nodes of the root node
 * @property {array}      objects   The objects of the root node
 * @example
 * setup: 
 *      var quadtree = new jaws.QuadTree();
 * update:
 *      quadtree.collide(sprite or list, sprite or list, callback function);
 */
var jaws = (function(jaws) {

  /**
   * Creates an empty quadtree with optional bounds and starting depth
   * @constructor
   * @param {jaws.Rect}   [bounds]    The defining bounds of the tree
   * @param {number}      [depth]     The current depth of the tree
   */
  jaws.QuadTree = function(bounds) {
    this.depth = arguments[1] || 0;
    this.bounds = bounds || new jaws.Rect(0, 0, jaws.width, jaws.height);
    this.nodes = [];
    this.objects = [];
  };

  /**
   * Moves through the nodes and deletes them.
   * @this {jaws.QuadTree}
   */
  jaws.QuadTree.prototype.clear = function() {
    this.objects = [];

    for (var i = 0; i < this.nodes.length; i++) {
      if (typeof this.nodes[i] !== 'undefined') {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
    }
  };

  /**
   * Creates four new branches sub-dividing the current node's width and height
   * @private
   * @this {jaws.QuadTree}
   */
  jaws.QuadTree.prototype.split = function() {
    var subWidth = Math.round((this.bounds.width / 2));
    var subHeight = Math.round((this.bounds.height / 2));
    var x = this.bounds.x;
    var y = this.bounds.y;

    this.nodes[0] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y, subWidth, subHeight), this.depth + 1);
    this.nodes[1] = new jaws.QuadTree(new jaws.Rect(x, y, subWidth, subHeight), this.depth + 1);
    this.nodes[2] = new jaws.QuadTree(new jaws.Rect(x, y + subHeight, subWidth, subHeight), this.depth + 1);
    this.nodes[3] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y + subHeight, subWidth, subHeight), this.depth + 1);
  };

  /**
   * Returns the index of a node's branches if passed-in object fits within it
   * @private 
   * @param {object} pRect  An object with the properties x, y, width, and height
   * @returns {index} The index of nodes[] that matches the dimensions of passed-in object
   */
  jaws.QuadTree.prototype.getIndex = function(pRect) {
    var index = -1;
    var verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    var horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    var topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint);
    var bottomQuadrant = (pRect.y > horizontalMidpoint);

    if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      }
      else if (bottomQuadrant) {
        index = 2;
      }
    }
    else if (pRect.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      }
      else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  };

  /**
   * Inserts an object into the quadtree, spliting it into new branches if needed
   * @param {object} pRect An object with the properties x, y, width, and height
   */
  jaws.QuadTree.prototype.insert = function(pRect) {

    if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") &&
            !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
      return;
    }

    if (typeof this.nodes[0] !== 'undefined') {
      var index = this.getIndex(pRect);

      if (index !== -1) {
        this.nodes[index].insert(pRect);
        return;
      }
    }

    this.objects.push(pRect);

    if (typeof this.nodes[0] === 'undefined') {
      this.split();
    }

    var i = 0;
    while (i < this.objects.length) {
      var index = this.getIndex(this.objects[i]);
      if (index !== -1) {
        this.nodes[index].insert(this.objects.splice(i, 1)[0]);
      }
      else {
        i++;
      }
    }

  };

  /**
   * Returns those objects on the branch matching the position of the passed-in object
   * @param {object} pRect An object with properties x, y, width, and height
   * @returns {array} The objects on the same branch as the passed-in object
   */
  jaws.QuadTree.prototype.retrieve = function(pRect) {

    if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") &&
            !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
      return;
    }

    var index = this.getIndex(pRect);
    var returnObjects = this.objects;
    if (typeof this.nodes[0] !== 'undefined') {
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));
      } else {
        for (var i = 0; i < this.nodes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
        }
      }
    }
    return returnObjects;
  };

  /**
   * Checks for collisions between objects by creating a quadtree, inserting one or more objects,
   *  and then comparing the results of a retrieval against another single or set of objects.
   *  
   *  With the callback argument, it will call a function and pass the items found colliding
   *   as the first and second argument.
   *   
   *  Without the callback argument, it will return a boolean value if any collisions were found.
   * 
   * @param {object|array} list1 A single or set of objects with properties x, y, width, and height
   * @param {object|array} list2 A single or set of objects with properties x, y, width, and height
   * @param {function} [callback]  The function to call per collision
   * @returns {boolean} If the items (or any within their sets) collide with one another
   */
  jaws.QuadTree.prototype.collide = function(list1, list2, callback) {

    var overlap = false;
    var tree = new jaws.QuadTree();
    var temp = [];

    if (!(list1.forEach)) {
      temp.push(list1);
      list1 = temp;
    }

    if (!(list2.forEach)) {
      temp = [];
      temp.push(list2);
      list2 = temp;
    }

    list2.forEach(function(el) {
      tree.insert(el);
    });

    list1.forEach(function(el) {
      overlap = jaws.collide(el, tree.retrieve(el), callback);
    });

    tree.clear();
    return overlap;
  };

  return jaws;

})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.QuadTree;
}var jaws = (function(jaws) {
  /** 
   * @class Manage a parallax scroller with different layers. "Field Summary" contains options for the Parallax()-constructor.
   * @constructor
   *
   * @property scale     number, scale factor for all layers (2 will double everything and so on)
   * @property repeat_x  true|false, repeat all parallax layers horizontally
   * @property repeat_y  true|false, repeat all parallax layers vertically
   * @property camera_x  number, x-position of "camera". add to camera_x and layers will scroll left. defaults to 0
   * @property camera_y  number, y-position of "camera". defaults to 0
   *
   * @example
   * parallax = new jaws.Parallax({repeat_x: true})
   * parallax.addLayer({image: "parallax_1.png", damping: 100})
   * parallax.addLayer({image: "parallax_2.png", damping: 6})
   * parallax.camera_x += 1    // scroll layers horizontally
   * parallax.draw()
   *
   */
  jaws.Parallax = function Parallax(options) {
    if( !(this instanceof arguments.callee) ) return new arguments.callee( options );
    jaws.parseOptions(this, options, this.default_options)

    this.width = options.width || jaws.width;
    this.height = options.height || jaws.height;  
  }

  jaws.Parallax.prototype.default_options = {
    scale: 1,
    repeat_x: null,
    repeat_y: null,
    camera_x: 0,
    camera_y: 0,
    width: null,
    height: null,
    layers: []
  }

  /** Draw all layers in parallax scroller */
  jaws.Parallax.prototype.draw = function(options) {
    var layer, numx, numy, initx;

    for(var i=0; i < this.layers.length; i++) {
      layer = this.layers[i]

      if(this.repeat_x) {
        initx = -((this.camera_x / layer.damping) % layer.width);
      } 
      else {
        initx = -(this.camera_x / layer.damping)
      }		

      if (this.repeat_y) {
        layer.y = -((this.camera_y / layer.damping) % layer.height);
      }
      else {
        layer.y = -(this.camera_y / layer.damping);
      }

      layer.x = initx;
      while (layer.y < this.height) {
        while (layer.x < this.width) {
          if (layer.x + layer.width >= 0 && layer.y + layer.height >= 0) { //Make sure it's on screen
            layer.draw(); //Draw only if actually on screen, for performance reasons
          }
          layer.x = layer.x + layer.width;      

          if (!this.repeat_x) {
            break;
          }
        }

        layer.y = layer.y + layer.height;
        layer.x = initx;
        if (!this.repeat_y) {
          break;
        }
      }
    }
  }
  /** Add a new layer to the parallax scroller */
  jaws.Parallax.prototype.addLayer = function(options) {
    var layer = new jaws.ParallaxLayer(options)
    layer.scaleAll(this.scale)
    this.layers.push(layer)
  }
  /** Debugstring for Parallax() */
  jaws.Parallax.prototype.toString = function() { return "[Parallax " + this.x + ", " + this.y + ". " + this.layers.length + " layers]" }

  /**
   * @class A single layer that's contained by Parallax()
   *
   * @property damping  number, higher the number, the slower it will scroll with regards to other layers, defaults to 0
   * @constructor
   * @extends jaws.Sprite
   */
  jaws.ParallaxLayer = function ParallaxLayer(options) {
    if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

    this.damping = options.damping || 0
    jaws.Sprite.call(this, options)
  }
  jaws.ParallaxLayer.prototype = jaws.Sprite.prototype

  /** Debugstring for ParallaxLayer() */
  // This overwrites Sprites toString, find another sollution.
  // jaws.ParallaxLayer.prototype.toString = function() { return "[ParallaxLayer " + this.x + ", " + this.y + "]" }

  return jaws;
})(jaws || {});

var jaws = (function(jaws) {
/**
* @class PixelPerfect collision map. Created from an image.
* @constructor
*  
* @property {string} image     the map
*/

jaws.PixelMap = function PixelMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  /* Internally we use a sprite, gives us image-argument, image_scaling and so on */
  this.sprite = new jaws.Sprite(options);
  this.named_colors = [];
  this.update();
}



/**
* Updates internal datastructure from the canvas. If we modify the 'terrain' we'll need to call this again.
* Future idea: Only update parts of the array that's been modified.
*/
jaws.PixelMap.prototype.update = function(x, y) {
  this.data = this.sprite.asCanvasContext().getImageData(0, 0, this.sprite.width, this.sprite.height).data
}

/**
* Draws pixelsmaps image like a sprite
*/ 
jaws.PixelMap.prototype.draw = function() {
  this.sprite.draw();
}


/**
* Trace the outline of a Rect until a named color found. Returns found color.
*
* @return truish if color is found
*/
jaws.PixelMap.prototype.namedColorAtRect = function(color, rect) {
  var x = rect.x
  var y = rect.y

  for(; x < rect.right; x++)  if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y < rect.bottom; y++) if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; x > rect.x; x--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y > rect.y; y--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);

  return false;
}

/**
* Read current color at given coordinates X/Y 
* returns array of 4 numbers [R, G, B, A]
*/
jaws.PixelMap.prototype.at = function(x, y) {
  x = parseInt(x)
  y = parseInt(y) - 1;
  if(y < 0) y = 0;

  var start = (y * this.sprite.width * 4) + (x*4);
  var R = this.data[start];
  var G = this.data[start + 1];
  var B = this.data[start + 2];
  var A = this.data[start + 3];
  return [R, G, B, A];
}

/**
* Returns a previously named color if it exists at given x/y-coordinates.
*
*/
jaws.PixelMap.prototype.namedColorAt = function(x, y) {
  var a = this.at(x, y);
  for(var i=0; i < this.named_colors.length; i++) {
    var name = this.named_colors[i].name;
    var c = this.named_colors[i].color;
    if(c[0] == a[0] && c[1] == a[1] && c[2] == a[2] && c[3] == a[3]) return name;
  }
}

jaws.PixelMap.prototype.nameColor = function(name, color) {
  this.named_colors.push({name: name, color: color});
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

var jaws = (function(jaws) {

/**
 * @class Create and access tilebased 2D maps with very fast access of invidual tiles. "Field Summary" contains options for the TileMap()-constructor.
 *
 * @property {array} cell_size        Size of each cell in tilemap, defaults to [32,32]
 * @property {array} size             Size of tilemap, defaults to [100,100]
 * @property {function} sortFunction  Function used by sortCells() to sort cells, defaults to no sorting
 *
 * @example
 * var tile_map = new TileMap({size: [10, 10], cell_size: [16,16]})
 * var sprite = new jaws.Sprite({x: 40, y: 40})
 * var sprite2 = new jaws.Sprite({x: 41, y: 41})
 * tile_map.push(sprite)
 *
 * tile_map.at(10,10)  // []
 * tile_map.at(40,40)  // [sprite]
 * tile_map.cell(0,0)  // []
 * tile_map.cell(1,1)  // [sprite]
 *
 */
jaws.TileMap = function TileMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options);
  this.cells = new Array(this.size[0])

  for(var col=0; col < this.size[0]; col++) {
    this.cells[col] = new Array(this.size[1])
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = [] // populate each cell with an empty array
    }
  }
}

jaws.TileMap.prototype.default_options = {
  cell_size: [32,32],
  size: [100,100],
  sortFunction: null
}

/** Clear all cells in tile map */
jaws.TileMap.prototype.clear = function() {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = []
    }
  }
}

/** Sort arrays in each cell in tile map according to sorter-function (see Array.sort) */
jaws.TileMap.prototype.sortCells = function(sortFunction) {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].sort( sortFunction )
    }
  }
}

/**
 * Push obj (or array of objs) into our cell-grid.
 *
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
jaws.TileMap.prototype.push = function(obj) {
  var that = this
  if(obj.forEach) { 
    obj.forEach( function(item) { that.push(item) } )
    return obj
  }
  if(obj.rect) {
    return this.pushAsRect(obj, obj.rect())
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}
/** 
 * Push objects into tilemap.
 * Disregard height and width and only use x/y when calculating cell-position
 */
jaws.TileMap.prototype.pushAsPoint = function(obj) {
  if(Array.isArray(obj)) { 
    for(var i=0; i < obj.length; i++) { this.pushAsPoint(obj[i]) }
    return obj
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}

/** push obj into cells touched by rect */
jaws.TileMap.prototype.pushAsRect = function(obj, rect) {
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt((rect.right-1) / this.cell_size[0])
  //jaws.log("rect.right: " + rect.right + " from/to col: " + from_col + " " + to_col, true)

  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt((rect.bottom-1) / this.cell_size[1])
    
    //jaws.log("rect.bottom " + rect.bottom + " from/to row: " + from_row + " " + to_row, true)
    for(var row = from_row; row <= to_row; row++) {
      // console.log("pushAtRect() col/row: " + col + "/" + row + " - " + this.cells[col][row])
      this.pushToCell(col, row, obj)
    }
  }
  return obj
}

/** 
 * Push obj to a specific cell specified by col and row 
 * If cell is already occupied we create an array and push to that
 */
jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
  this.cells[col][row].push(obj)
  if(this.sortFunction) this.cells[col][row].sort(this.sortFunction);
  return this
}

//
// READERS
// 

/** Get objects in cell that exists at coordinates x / y  */
jaws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  // console.log("at() col/row: " + col + "/" + row)
  return this.cells[col][row]
}

/** Returns occupants of all cells touched by 'rect' */
jaws.TileMap.prototype.atRect = function(rect) {
  var objects = []
  var items

  try {
    var from_col = parseInt(rect.x / this.cell_size[0])
	if (from_col < 0) {
		from_col = 0
	}
    var to_col = parseInt(rect.right / this.cell_size[0])
    if (to_col >= this.size[0]) {
		to_col = this.size[0] - 1
	}
	var from_row = parseInt(rect.y / this.cell_size[1])
	if (from_row < 0) {
		from_row = 0
	}
	var to_row = parseInt(rect.bottom / this.cell_size[1])
	if (to_row >= this.size[1]) {
		to_row = this.size[1] - 1
	}

    for(var col = from_col; col <= to_col; col++) {
      for(var row = from_row; row <= to_row; row++) {
        this.cells[col][row].forEach( function(item, total) { 
          if(objects.indexOf(item) == -1) { objects.push(item) }
        })
      }
    }
  }
  catch(e) {
    // ... problems
  }
  return objects
}

/** Returns all objects in tile map */
jaws.TileMap.prototype.all = function() {
  var all = []
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].forEach( function(element, total) {
        all.push(element)
      });
    }
  }
  return all
}

/** Get objects in cell at col / row */
jaws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

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

/** Debugstring for TileMap() */
jaws.TileMap.prototype.toString = function() { return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]" }

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.TileMap }
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

