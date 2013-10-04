var jaws = (function(jaws) {

/**
* @class A basic but powerfull sprite for all your onscreen-game objects. "Field Summary" contains options for the Sprite()-constructor.
* @constructor
*  
* @property {int} x     Horizontal position  (0 = furthest left)
* @property {int} y     Vertical position    (0 = top)
* @property {image} image   Image/canvas or string pointing to an asset ("player.png")
* @property {int} alpha     Transparency 0=fully transparent, 1=no transperency
* @property {int} angle     Angle in degrees (0-360)
* @property {bool} flipped    Flip sprite horizontally, usefull for sidescrollers
* @property {string} anchor   String stating how to anchor the sprite to canvas, @see Sprite#anchor ("top_left", "center" etc)
* @property {int} scale_image Scale the sprite by this factor
* @property {string,gradient} color If set, draws a rectangle of dimensions rect() with specified color or gradient (linear or radial)
*
* @example
* // create new sprite at top left of the screen, will use jaws.assets.get("foo.png")
* new Sprite({image: "foo.png", x: 0, y: 0}) 
* 
* // sets anchor to "center" on creation
* new Sprite({image: "topdownspaceship.png", anchor: "center"})
*
*/
jaws.Sprite = function Sprite(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );
  this.set(options)  
  this.context = options.context ? options.context : jaws.context;  // Prefer given canvas-context, fallback to jaws.context
}

jaws.Sprite.prototype.default_options = {
  x: 0, 
  y: 0, 
  alpha: 1,
  angle: 0,
  flipped: false,
  anchor_x: 0,
  anchor_y: 0,
  image: null,
  image_path: null,
  anchor: null,
  scale_image: null,
  damping: 1,
  scale_x: 1,
  scale_y: 1,
  scale: 1,
  color: "#ddd",
  width: 16,
  height: 16,
  _constructor: null,
  context: null,
  data: null
}

/** 
 * @private
 * Call setters from JSON object. Used to parse options.
 */
jaws.Sprite.prototype.set = function(options) {
  if(jaws.isString(this.image)) this.image_path = this.image;
  jaws.parseOptions(this, options, this.default_options);
  
  if(this.scale)        this.scale_x = this.scale_y = this.scale;
  if(this.image)        this.setImage(this.image);
  if(this.scale_image)  this.scaleImage(this.scale_image);
  if(this.anchor)       this.setAnchor(this.anchor);
  
  if(!this.image && this.color && this.width && this.height) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
	  canvas.width = this.width;
  	canvas.height = this.height;
    context.fillStyle = this.color;
    context.fillRect(0, 0, this.width, this.height);
    this.image = canvas;
  }

  this.cacheOffsets()

  return this
}

/** 
 * @private
 *
 * Creates a new sprite from current sprites attributes()
 * Checks JawsJS magic property '_constructor' when deciding with which constructor to create it
 *
 */
jaws.Sprite.prototype.clone = function(object) {
  var constructor = this._constructor ? eval(this._constructor) : this.constructor
  var new_sprite = new constructor( this.attributes() );
  new_sprite._constructor = this._constructor || this.constructor.name
  return new_sprite
}


/**
 * Sets image from image/canvas or asset-string ("foo.png")
 * If asset isn't previously loaded setImage() will try to load it.
 */
jaws.Sprite.prototype.setImage =      function(value) { 
  var that = this

  // An image, great, set this.image and return
  if(jaws.isDrawable(value)) {
    this.image = value
    return this.cacheOffsets() 
  }
  // Not an image, therefore an asset string, i.e. "ship.bmp"
  else {
    // Assets already loaded? Set this.image
    if(jaws.assets.isLoaded(value)) { this.image = jaws.assets.get(value); this.cacheOffsets(); }

    // Not loaded? Load it with callback to set image.
    else {
      jaws.log.warn("Image '" + value + "' not preloaded with jaws.assets.add(). Image and a working sprite.rect() will be delayed.")
      jaws.assets.load(value, {onload: function() { that.image = jaws.assets.get(value); that.cacheOffsets();} } ) 
    }
  }
  return this
}

/** 
* Steps 1 pixel towards the given X/Y. Horizontal and vertical steps are done separately between each callback.
* Exits when the continueStep-callback returns true for both vertical and horizontal steps or if target X/Y has been reached.
*
* @returns  {object}  Object with 2 x/y-properties indicating what plane we moved in when stepToWhile was stopped.
*/
jaws.Sprite.prototype.stepToWhile = function(target_x, target_y, continueStep) { 
  var step = 1;
  var step_x = (target_x < this.x) ? -step : step;
  var step_y = (target_y < this.y) ? -step : step;

  target_x = parseInt(target_x)
  target_y = parseInt(target_y)

  var collision_x = false;
  var collision_y = false;

  while( true ) {
    if(collision_x === false) {
      if(this.x != target_x)    { this.x += step_x }
      if( !continueStep(this) ) { this.x -= step_x; collision_x = true }
    }
 
    if(collision_y === false) {
      if(this.y != target_y)    { this.y += step_y }
      if( !continueStep(this) ) { this.y -= step_y; collision_y = true }
    }

    if( (collision_x || this.x == target_x) && (collision_y || this.y == target_y) )
        return {x: collision_x, y: collision_y};
  }
}
/** 
* Moves with given vx/vy velocoties by stepping 1 pixel at the time. Horizontal and vertical steps are done separately between each callback.
* Exits when the continueStep-callback returns true for both vertical and horizontal steps or if target X/Y has been reached.
*
* @returns  {object}  Object with 2 x/y-properties indicating what plane we moved in when stepWhile was stopped.
*/
jaws.Sprite.prototype.stepWhile = function(vx, vy, continueStep) { 
  return this.stepToWhile(this.x + vx, this.y + vy, continueStep)
}

/** Flips image vertically, usefull for sidescrollers when player is walking left/right */
jaws.Sprite.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
jaws.Sprite.prototype.flipTo =        function(value) { this.flipped = value; return this }
/** Rotate sprite by value degrees */
jaws.Sprite.prototype.rotate =        function(value) { this.angle += value; return this }
/** Force an rotation-angle on sprite */
jaws.Sprite.prototype.rotateTo =      function(value) { this.angle = value; return this }

/** Set x/y */
jaws.Sprite.prototype.moveTo =        function(x, y)  {
  if(jaws.isArray(x) && y === undefined) {
    y = x[1]
    x = x[0]
  }
  this.x = x; 
  this.y = y; 
  return this;
}
/** Modify x/y */
jaws.Sprite.prototype.move =          function(x, y)   { 
  if(jaws.isArray(x) && y === undefined) {
    y = x[1]
    x = x[0]
  }

  if(x) this.x += x;  
  if(y) this.y += y; 
  return this 
}
/** 
* scale sprite by given factor. 1=don't scale. <1 = scale down.  1>: scale up.
* Modifies width/height. 
**/
jaws.Sprite.prototype.scaleAll =      function(value) { this.scale_x *= value; this.scale_y *= value; return this.cacheOffsets() }
/** set scale factor. ie. 2 means a doubling if sprite in both directions. */
jaws.Sprite.prototype.scaleTo =       function(value) { this.scale_x = this.scale_y = value; return this.cacheOffsets() }
/** scale sprite horizontally by scale_factor. Modifies width. */
jaws.Sprite.prototype.scaleWidth =    function(value) { this.scale_x *= value; return this.cacheOffsets() }
/** scale sprite vertically by scale_factor. Modifies height. */
jaws.Sprite.prototype.scaleHeight =   function(value) { this.scale_y *= value; return this.cacheOffsets() }

/** Sets x */
jaws.Sprite.prototype.setX =          function(value) { this.x = value; return this }
/** Sets y */
jaws.Sprite.prototype.setY =          function(value) { this.y = value; return this }

/** Position sprites top on the y-axis */
jaws.Sprite.prototype.setTop =        function(value) { this.y = value + this.top_offset; return this }
/** Position sprites bottom on the y-axis */
jaws.Sprite.prototype.setBottom =     function(value) { this.y = value - this.bottom_offset; return this }
/** Position sprites left side on the x-axis */
jaws.Sprite.prototype.setLeft =       function(value) { this.x = value + this.left_offset; return this }
/** Position sprites right side on the x-axis */
jaws.Sprite.prototype.setRight =      function(value) { this.x = value - this.right_offset; return this }

/** Set new width. Scales sprite. */
jaws.Sprite.prototype.setWidth  =     function(value) { this.scale_x = value/this.image.width; return this.cacheOffsets() }
/** Set new height. Scales sprite. */
jaws.Sprite.prototype.setHeight =     function(value) { this.scale_y = value/this.image.height; return this.cacheOffsets() }
/** Resize sprite by adding width */
jaws.Sprite.prototype.resize =        function(width, height) { 
  if(jaws.isArray(width) && height === undefined) {
    height = width[1]
    width = width[0]
  }

  this.scale_x = (this.width + width) / this.image.width
  this.scale_y = (this.height + height) / this.image.height
  return this.cacheOffsets()
}
/** 
 * Resize sprite to exact width/height 
 */
jaws.Sprite.prototype.resizeTo =      function(width, height) {
  if(jaws.isArray(width) && height === undefined) {
    height = width[1]
    width = width[0]
  }

  this.scale_x = width / this.image.width
  this.scale_y = height / this.image.height
  return this.cacheOffsets()
}

/**
* The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
* or "when rotating, what point of the of the sprite will it rotate round"
*
* @example
* For example, a topdown shooter could use setAnchor("center") --> Place middle of the ship on x/y
* .. and a sidescroller would probably use setAnchor("center_bottom") --> Place "feet" at x/y
*/
jaws.Sprite.prototype.setAnchor = function(value) {
  var anchors = {
    top_left: [0,0],
    left_top: [0,0],
    center_left: [0,0.5],
    left_center: [0,0.5],
    bottom_left: [0,1],
    left_bottom: [0,1],
    top_center: [0.5,0],
    center_top: [0.5,0],
    center_center: [0.5,0.5],
    center: [0.5,0.5],
    bottom_center: [0.5,1],
    center_bottom: [0.5,1],
    top_right: [1,0],
    right_top: [1,0],
    center_right: [1,0.5],
    right_center: [1,0.5],
    bottom_right: [1,1],
    right_bottom: [1,1]
  }

  if(a = anchors[value]) {
    this.anchor_x = a[0]
    this.anchor_y = a[1]
    if(this.image) this.cacheOffsets();
  }
  return this
}

/** @private */
jaws.Sprite.prototype.cacheOffsets = function() {
  if(!this.image) { return }
  
  this.width = this.image.width * this.scale_x
  this.height = this.image.height * this.scale_y
  this.left_offset   = this.width * this.anchor_x
  this.top_offset    = this.height * this.anchor_y
  this.right_offset  = this.width * (1.0 - this.anchor_x)
  this.bottom_offset = this.height * (1.0 - this.anchor_y)

  if(this.cached_rect) this.cached_rect.resizeTo(this.width, this.height);
  return this
}

/** Returns a jaws.Rect() perfectly surrouning sprite. Also cache rect in this.cached_rect. */
jaws.Sprite.prototype.rect = function() {
  if(!this.cached_rect && this.width)   this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
  if(this.cached_rect)                  this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
  return this.cached_rect
} 

/** Draw sprite on active canvas */
jaws.Sprite.prototype.draw = function() {
  if(!this.image) { return this }

  this.context.save()
  this.context.translate(this.x, this.y)
  if(this.angle!=0) { jaws.context.rotate(this.angle * Math.PI / 180) }
  this.flipped && this.context.scale(-1, 1)
  this.context.globalAlpha = this.alpha
  this.context.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
  this.context.drawImage(this.image, 0, 0, this.width, this.height)
  this.context.restore()
  return this
}

/**
 * Scales image using hard block borders. Useful for that cute, blocky retro-feeling.
 * Depends on gfx.js beeing loaded.
 */
jaws.Sprite.prototype.scaleImage = function(factor) {
  if(!this.image) return;
  this.setImage( jaws.retroScaleImage(this.image, factor) )
  return this
}

/** 
 * Returns sprite as a canvas context.
 * For certain browsers, a canvas context is faster to work with then a pure image.
 */
jaws.Sprite.prototype.asCanvasContext = function() {
  var canvas = document.createElement("canvas")
  canvas.width = this.width
  canvas.height = this.height

  var context = canvas.getContext("2d")
  if(jaws.context)  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;

  context.drawImage(this.image, 0, 0, this.width, this.height)
  return context
}

/** 
 * Returns sprite as a canvas
 */
jaws.Sprite.prototype.asCanvas = function() {
  var canvas = document.createElement("canvas")
  canvas.width = this.width
  canvas.height = this.height

  var context = canvas.getContext("2d")
  if(jaws.context)  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;

  context.drawImage(this.image, 0, 0, this.width, this.height)
  return canvas
}

jaws.Sprite.prototype.toString = function() { return "[Sprite " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]" }

/** returns Sprites state/properties as a pure object */
jaws.Sprite.prototype.attributes = function() { 
  var object = {}                   // Starting with this.options could create circular references through "context"
  object["_constructor"] = this._constructor || "jaws.Sprite"
  object["x"] = parseFloat(this.x.toFixed(2))
  object["y"] = parseFloat(this.y.toFixed(2))
  object["image"] = this.image_path
  object["alpha"] = this.alpha
  object["flipped"] = this.flipped
  object["angle"] = parseFloat(this.angle.toFixed(2))
  object["scale_x"] = this.scale_x;
  object["scale_y"] = this.scale_y;
  object["anchor_x"] = this.anchor_x
  object["anchor_y"] = this.anchor_y

  if(this.data !== null) object["data"] = jaws.clone(this.data); // For external data (for example added by the editor) that you want serialized

  return object
}
/**
 * Load/creates sprites from given data
 *
 * Argument could either be
 * - an array of Sprite objects
 * - an array of JSON objects
 * - a JSON.stringified string representing an array of JSON objects
 *
 *  @return Array of created sprite
*
 */
jaws.Sprite.parse = function(objects) {
  var sprites = []
  
  if(jaws.isArray(objects)) {
    // If this is an array of JSON representations, parse it
    if(objects.every(function(item) { return item._constructor })) {
      parseArray(objects)
    } else {
      // This is already an array of Sprites, load it directly
      sprites = objects
    }
  }
  else if(jaws.isString(objects)) { parseArray( JSON.parse(objects) ); jaws.log.info(objects) }
  
  function parseArray(array) {
    array.forEach( function(data) {
      var constructor = data._constructor ? eval(data._constructor) : data.constructor
      if(jaws.isFunction(constructor)) {
        jaws.log.info("Creating " + data._constructor + "(" + data.toString() + ")", true)
        var object = new constructor(data)
        object._constructor = data._constructor || data.constructor.name
        sprites.push(object);
      }
    });
  }

  return sprites;
}

/**
 * returns a JSON-string representing the state of the Sprite.
 *
 * Use this to serialize your sprites / game objects, maybe to save in local storage or on a server
 *
 * jaws.game_states.Edit uses this to export all edited objects.
 *
 */
jaws.Sprite.prototype.toJSON = function() {
  return JSON.stringify(this.attributes())
}

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.Sprite }

/*
// Chainable setters under consideration:
jaws.Sprite.prototype.setFlipped =        function(value) { this.flipped = value; return this }
jaws.Sprite.prototype.setAlpha =          function(value) { this.alpha = value; return this }
jaws.Sprite.prototype.setAnchorX =        function(value) { this.anchor_x = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setAnchorY =        function(value) { this.anchor_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setAngle =          function(value) { this.angle = value; return this }
jaws.Sprite.prototype.setScale =    function(value) { this.scale_x = this.scale_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setScaleX =   function(value) { this.scale_x = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setScaleY =   function(value) { this.scale_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.moveX =         function(x)     { this.x += x; return this }
jaws.Sprite.prototype.moveXTo =       function(x)     { this.x = x; return this }
jaws.Sprite.prototype.moveY =         function(y)     { this.y += y; return this }
jaws.Sprite.prototype.moveYTo =       function(y)     { this.y = y; return this }
jaws.Sprite.prototype.scaleWidthTo =  function(value) { this.scale_x = value; return this.cacheOffsets() }
jaws.Sprite.prototype.scaleHeightTo = function(value) { this.scale_y = value; return this.cachOfffsets() }
*/

