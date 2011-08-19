var jaws = (function(jaws) {

/**
* @class A basic but powerfull sprite for all your onscreen-game objects
* @constructor
*  
* @property x horizontal position  (0 = furthest left)
* @property y vertical position    (0 = top)
* @property image image/canvas or string pointing to an asset ("player.png")
* @property alpha transparency 0=fully transparent, 1=no transperency
* @property angle Angle in degrees (0-360)
* @property flipped true|false Flip sprite horizontally, usefull for sidescrollers
* @property anchor string stating how to anchor the sprite to canvas, @see Sprite#anchor ("top_left", "center" etc)
*
* @example
* // create new sprite at top left of the screen, will use jaws.assets.get("foo.png")
* new Sprite({image: "foo.png", x: 0, y: 0}) 
* 
* // sets anchor to "center" on creation
* new Sprite({image: "topdownspaceship.png", anchor: "center"})
*
*/
jaws.Sprite = function(options) {
  this.options = options
  this.set(options)  
  this.context = options.context || jaws.context
  if(!this.context) { this.createDiv() }  // No canvas context? Switch to DOM-based spritemode
}

/** @private
 * Call setters from JSON object. Used to parse options.
 */
jaws.Sprite.prototype.set = function(options) {
  this.scale_factor_x = this.scale_factor_y = (options.scale || 1)
  this.x = options.x || 0
  this.y = options.y || 0
  this.alpha = options.alpha || 1
  this.angle = options.angle || 0
  this.flipped = options.flipped || false
  this.anchor(options.anchor || "top_left");
  if(!options.anchor_x == undefined) this.anchor_x = options.anchor_x;
  if(!options.anchor_y == undefined) this.anchor_y = options.anchor_y; 
  options.image && this.setImage(options.image)
  if(options.scale_image) this.scaleImage(options.scale_image);
  this.cacheOffsets()

  return this
}

/*
// Chainable setters under consideration:
jaws.Sprite.prototype.setFlipped =        function(value) { this.flipped = value; return this }
jaws.Sprite.prototype.setAlpha =          function(value) { this.alpha = value; return this }
jaws.Sprite.prototype.setAnchorX =        function(value) { this.anchor_x = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setAnchorY =        function(value) { this.anchor_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setAngle =          function(value) { this.angle = value; return this }
jaws.Sprite.prototype.setScaleFactor =    function(value) { this.scale_factor_x = this.scale_factor_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setScaleFactorX =   function(value) { this.scale_factor_x = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setScaleFactorY =   function(value) { this.scale_factor_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.moveX =         function(x)     { this.x += x; return this }
jaws.Sprite.prototype.moveXTo =       function(x)     { this.x = x; return this }
jaws.Sprite.prototype.moveY =         function(y)     { this.y += y; return this }
jaws.Sprite.prototype.moveYTo =       function(y)     { this.y = y; return this }
jaws.Sprite.prototype.scaleWidthTo =  function(value) { this.scale_factor_x = value; return this.cacheOffsets() }
jaws.Sprite.prototype.scaleHeightTo = function(value) { this.scale_factor_y = value; return this.cachOfffsets() }
*/

/* Sprite modifiers. Modifies 1 or more properties and returns this for chainability.  */

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
    else { jaws.assets.load(value, function() { that.image = jaws.assets.get(value); that.cacheOffsets(); }) }
  }
  return this
}

/** Flips image vertically, usefull for sidescrollers when player is walking left/right */
jaws.Sprite.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
jaws.Sprite.prototype.flipTo =        function(value) { this.flipped = value; return this }
/** Rotate sprite by value degrees */
jaws.Sprite.prototype.rotate =        function(value) { this.angle += value; return this }
/** Force an rotation-angle on sprite */
jaws.Sprite.prototype.rotateTo =      function(value) { this.angle = value; return this }
/** Set x/y */
jaws.Sprite.prototype.moveTo =        function(x,y)   { this.x = x; this.y = y; return this }
/** Modify x/y */
jaws.Sprite.prototype.move =          function(x,y)   { if(x) this.x += x;  if(y) this.y += y; return this }
/** 
* scale sprite by given factor. 1=don't scale. <1 = scale down.  1>: scale up.
* Modifies width/height. 
**/
jaws.Sprite.prototype.scale =         function(value) { this.scale_factor_x *= value; this.scale_factor_y *= value; return this.cacheOffsets() }
/** set scale factor. ie. 2 means a doubling if sprite in both directions. */
jaws.Sprite.prototype.scaleTo =       function(value) { this.scale_factor_x = this.scale_factor_y = value; return this.cacheOffsets() }
/** scale sprite horizontally by scale_factor. Modifies width. */
jaws.Sprite.prototype.scaleWidth =    function(value) { this.scale_factor_x *= value; return this.cacheOffsets() }
/** scale sprite vertically by scale_factor. Modifies height. */
jaws.Sprite.prototype.scaleHeight =   function(value) { this.scale_factor_y *= value; return this.cacheOffsets() }
/** Sets x */
jaws.Sprite.prototype.setX =          function(value) { this.x = value; return this }
/** Sets y */
jaws.Sprite.prototype.setY =          function(value) { this.y = value; return this }
/** Set new width. Scales sprite. */
jaws.Sprite.prototype.setWidth  =     function(value) { this.scale_factor_x = value/this.image.width; return this.cacheOffsets() }
/** Set new height. Scales sprite. */
jaws.Sprite.prototype.setHeight =     function(value) { this.scale_factor_y = value/this.image.height; return this.cacheOffsets() }
/** Resize sprite by adding width */
jaws.Sprite.prototype.resize =        function(width, height) { 
  this.scale_factor_x = (this.width + width) / this.image.width
  this.scale_factor_y = (this.height + height) / this.image.height
  return this.cacheOffsets()
}
/** 
 * Resize sprite to exact width/height 
 */
jaws.Sprite.prototype.resizeTo =      function(width, height) {
  this.scale_factor_x = width / this.image.width
  this.scale_factor_y = height / this.image.height
  return this.cacheOffsets()
}

/**
* The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
* or "when rotating, what point of the of the sprite will it rotate round"
*
* @example
* For example, a topdown shooter could use anchor("center") --> Place middle of the ship on x/y
* .. and a sidescroller would probably use anchor("center_bottom") --> Place "feet" at x/y
*/
jaws.Sprite.prototype.anchor = function(value) {
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
  
  this.width = this.image.width * this.scale_factor_x
  this.height = this.image.height * this.scale_factor_y
  this.left_offset   = this.width * this.anchor_x
  this.top_offset    = this.height * this.anchor_y
  this.right_offset  = this.width * (1.0 - this.anchor_x)
  this.bottom_offset = this.height * (1.0 - this.anchor_y)

  if(this.cached_rect) this.cached_rect.resizeTo(this.width, this.height);
  return this
}

/** Returns a jaws.Rect() perfectly surrouning sprite. Also cache rect in this.cached_rect. */
jaws.Sprite.prototype.rect = function() {
  if(!this.cached_rect) this.cached_rect = new jaws.Rect(this.x, this.top, this.width, this.height)
  this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset)
  return this.cached_rect
} 

/**
 * Make this sprite a DOM-based <div> sprite 
 * @private
 */
jaws.Sprite.prototype.createDiv = function() {
  this.div = document.createElement("div")
  this.div.style.position = "absolute"
  if(this.image) {
    this.div.style.width = this.image.width + "px"
    this.div.style.height = this.image.height + "px"
    //this.div.style.backgroundImage = "url(" + this.image.src + ")"
    this.div.style.backgroundImage = "url(" + this.image.toDataURL() + ")"
  }
  if(jaws.dom) { jaws.dom.appendChild(this.div) }
  this.updateDiv()
}

/** @private
 * Update properties for DOM-based sprite 
 */
jaws.Sprite.prototype.updateDiv = function() {
  this.div.style.left = this.x + "px"
  this.div.style.top = this.y + "px"

  var transform = ""
  transform += "rotate(" + this.angle + "deg) "
  if(this.flipped)  { transform += "scale(-" + this.scale_factor_x + "," + this.scale_factor_y + ")"; }
  else              { transform += "scale(" + this.scale_factor_x + "," + this.scale_factor_y + ")"; }

  this.div.style.MozTransform = transform
  this.div.style.WebkitTransform = transform
  this.div.style.OTransform = transform
  this.div.style.msTransform = transform
  this.div.style.transform = transform

  return this
}

/** Draw sprite on active canvas or update it's DOM-properties */
jaws.Sprite.prototype.draw = function() {
  if(!this.image) { return this }
  if(jaws.dom)    { return this.updateDiv() }

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
  this.setImage( jaws.gfx.retroScaleImage(this.image, factor) )
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
  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled

  context.drawImage(this.image, 0, 0, this.width, this.height)
  return context
}

jaws.Sprite.prototype.toString = function() { return "[Sprite " + this.x + ", " + this.y + "," + this.width + "," + this.height + "]" }

return jaws;
})(jaws || {});

