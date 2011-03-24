/*
 * 
 * When we wan't to move something visible around on the screen :).
 *
 *
 */
var jaws = (function(jaws) {

jaws.Sprite = function(options) {
  this.options = options
  this.set(options)  
  this.context = options.context || jaws.context
  if(!this.context) { this.createDiv() }  // No canvas context? Switch to DOM-based spritemode
}

/* Call setters from JSON object. Used to parse options. */
jaws.Sprite.prototype.set = function(options) {
  this.scale_factor_x = this.scale_factor_y = (options.scale || 1)
  if(!options.anchor_x == undefined) {this.anchor_x = options.anchor_x}
  if(!options.anchor_y == undefined) {this.anchor_y = options.anchor_y}
  this.x = options.x || 0
  this.y = options.y || 0
  this.alpha = options.alpha || 1
  this.angle = options.angle || 0
  this.flipped = options.flipped || false
  this.anchor(options.anchor || "top_left")
  options.image && this.setImage(options.image)
  this.cacheOffsets()
  return this
}

/*
//
// Chainable setters under consideration:
//
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

/* Sprite modifiers. Modifies 1 or more properties and returns this for chainability. */
jaws.Sprite.prototype.setImage =      function(value) { this.image = (jaws.isDrawable(value) ? value : jaws.assets.data[value]); return this.cacheOffsets() }
jaws.Sprite.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
jaws.Sprite.prototype.flipTo =        function(value) { this.flipped = value; return this }
jaws.Sprite.prototype.rotate =        function(value) { this.angle += value; return this }
jaws.Sprite.prototype.rotateTo =      function(value) { this.angle = value; return this }
jaws.Sprite.prototype.moveTo =        function(x,y)   { this.x = x; this.y = y; return this }
jaws.Sprite.prototype.move =          function(x,y)   { if(x) this.x += x;  if(y) this.y += y; return this }
jaws.Sprite.prototype.scale =         function(value) { this.scale_factor_x *= value; this.scale_factor_y *= value; return this.cacheOffsets() }
jaws.Sprite.prototype.scaleTo =       function(value) { this.scale_factor_x = this.scale_factor_y = value; return this.cacheOffsets() }
jaws.Sprite.prototype.scaleWidth =    function(value) { this.scale_factor_x *= value; return this.cacheOffsets() }
jaws.Sprite.prototype.scaleHeight =   function(value) { this.scale_factor_y *= value; return this.cacheOffsets() }
jaws.Sprite.prototype.setX =          function(value) { this.x = value; return this }
jaws.Sprite.prototype.setY =          function(value) { this.y = value; return this }
jaws.Sprite.prototype.setWidth  =     function(value) { this.scale_factor_x = value/this.image.width; return this.cacheOffsets() }
jaws.Sprite.prototype.setHeight =     function(value) { this.scale_factor_y = value/this.image.height; return this.cacheOffsets() }
jaws.Sprite.prototype.resize =        function(width, height) { 
  this.scale_factor_x = (this.width + width) / this.image.width
  this.scale_factor_y = (this.height + height) / this.image.height
  return this.cacheOffsets()
}
jaws.Sprite.prototype.resizeTo =      function(width, height) {
  this.scale_factor_x = width / this.image.width
  this.scale_factor_y = height / this.image.height
  return this.cacheOffsets()
}

/*
* The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
* or "when rotating, what point of the of the sprite will it rotate round"
*
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

/* Saves a Rect() perfectly surrouning our sprite in this.cached_rect and returns it */
jaws.Sprite.prototype.rect = function() {
  if(!this.cached_rect) this.cached_rect = new jaws.Rect(this.x, this.top, this.width, this.height)
  this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset)
  return this.cached_rect
} 

/* Make this sprite a DOM-based <div> sprite */
jaws.Sprite.prototype.createDiv = function() {
  this.div = document.createElement("div")
  this.div.style.position = "absolute"
  if(this.image) {
    this.div.style.width = this.image.width + "px"
    this.div.style.height = this.image.height + "px"
    this.div.style.backgroundImage = "url(" + this.image.src + ")"
  }
  if(jaws.dom) { jaws.dom.appendChild(this.div) }
  this.updateDiv()
}

/* Update properties for DOM-based sprite */
jaws.Sprite.prototype.updateDiv = function() {
  this.div.style.left = this.x + "px"
  this.div.style.top = this.y + "px"

  var transform = ""
  transform += "rotate(" + this.angle + "deg) "
  if(this.flipped)  { transform += "scale(-" + this.scale_factor_x + "," + this.scale_factor_y + ")"; }
  else              { transform += "scale(" + this.scale_factor_x + "," + this.scale_factor_y + ")"; }

  this.div.style.MozTransform = transform
  this.div.style.WebkitTransform = transform
  this.div.style.transform = transform
  return this
}

// Draw the sprite on screen via its previously given context
jaws.Sprite.prototype.draw = function() {
  if(jaws.dom)    { return this.updateDiv() }
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

// Create a new canvas context, draw sprite on it and return. Use to get a raw canvas copy of the current sprite state.
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

