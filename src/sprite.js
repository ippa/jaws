/*
 * 
 * This is usually the Constructor we use when we want characters on the screen.
 * Comes with various properties:
 *
 *  sprite.x        // horizontal position on canvas, 0 is farthest to the left
 *  sprite.y        // vertical position, 0 is top of the screen
 *  sprite.scale    // how much to scale the sprite when drawing it
 *  sprite.width    // width of the sprite, will take scale into consideration
 *  sprite.height   // height of the sprite, will take scale into consideration
 *  sprite.bottom 
 *  sprite.right 
 *
 */
var jaws = (function(jaws) {

jaws.Sprite = function(options) {
  this.options = options
  this.x = options.x || 0
  this.y = options.y || 0
  this.alpha = options.alpha || 1
  this.context = options.context || jaws.context
  this.anchor_x = options.anchor_x || 0
  this.anchor_y = options.anchor_y || 0
  this.angle = options.angle || 0
  this.flipped = options.flipped || false
  this._scale = options.scale || 1
  this._rect = new jaws.Rect(0,0,0,0)

  this.__defineGetter__("width", function()   { return this._width } )
  this.__defineGetter__("height", function()  { return this._height } )
  this.__defineGetter__("left", function()    { return this.x - this.left_offset } )
  this.__defineGetter__("top", function()     { return this.y - this.top_offset } )
  this.__defineGetter__("right", function()   { return this.x + this.right_offset  } )
  this.__defineGetter__("bottom", function()  { return this.y + this.bottom_offset } )
  
  this.__defineGetter__("scale", function(value)   { return this._scale })
  this.__defineSetter__("scale", function(value)   { this._scale = value; this.calcBorderOffsets(); }) 
  
  this.__defineGetter__("image", function(value)   { return this._image })
  this.__defineSetter__("image", function(value)   { 
    this._image = (jaws.isDrawable(value) ? value : jaws.assets.data[value])
    this.calcBorderOffsets(); 
  })
  this.__defineGetter__("rect", function() { 
    this._rect.x = this.x - this.left_offset
    this._rect.y = this.y - this.top_offset
    this._rect.width = this._width
    this._rect.height = this._height
    return this._rect
  })

  /* When image, scale or anchor changes we re-cache these values for speed */
  this.calcBorderOffsets = function() {
    this._width = this._image.width * this._scale
    this._height = this._image.height * this._scale

    this.left_offset = this.width * this.anchor_x
    this.top_offset = this.height * this.anchor_y
    this.right_offset =  this.width * (1.0 - this.anchor_x)
    this.bottom_offset = this.height * (1.0 - this.anchor_y)
  } 

  options.image           && (this.image = options.image)
  options.anchor          && this.anchor(options.anchor)
 
  // No canvas context? Switch to DOM-based spritemode
  if(!this.context) { this.createDiv() }
}

/* Make this sprite a DOM-based <div> sprite */
jaws.Sprite.prototype.createDiv = function() {
  this.div = document.createElement("div")
  this.div.style.position = "absolute"
  this.div.style.width = this.image.width + "px"
  this.div.style.height = this.image.height + "px"
  this.div.style.backgroundImage = "url(" + this.image.src + ")"
  if(jaws.dom) { jaws.dom.appendChild(this.div) }
  this.updateDiv()
}

/* Update properties for DOM-based sprite */
jaws.Sprite.prototype.updateDiv = function() {
  this.div.style.left = this.x + "px"
  this.div.style.top = this.y + "px"

  var transform = ""
  transform += "rotate(" + this.angle + "deg) "
  if(this.flipped)          { transform += "scale(-" + this.scale + "," + this.scale + ")"; }
  else if(this.scale != 1)  { transform += "scale(" + this.scale + ")"; }

  this.div.style.MozTransform = transform
  this.div.style.WebkitTransform = transform
  this.div.style.transform = transform
}

// Draw the sprite on screen via its previously given context
jaws.Sprite.prototype.draw = function() {
  if(jaws.dom) { return this.updateDiv() }

  this.context.save()
  this.context.translate(this.x, this.y)
  this.angle && jaws.context.rotate(this.angle * Math.PI / 180)
  this.flipped && this.context.scale(-1, 1)
  this.context.globalAlpha = this.alpha
  this.context.translate(-this.left_offset, -this.top_offset)
  this.context.drawImage(this._image, 0, 0, this._width, this._height);
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

  context.drawImage(this._image, 0, 0, this.width, this.height)
  return context
}

// Rotate sprite 'value' degrees
jaws.Sprite.prototype.rotate = function(value) {
  this.angle += value
  return this
}

//
// The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
// or "when rotating, what point of the of the sprite will it rotate round"
//
// For example, a topdown shooter could use anchor("center") --> Place middle of the ship on x/y
// .. and a sidescroller would probably use anchor("center_bottom") --> Place "feet" at x/y
//
jaws.Sprite.prototype.anchor = function(align) {
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

  if(a = anchors[align]) {
    this.anchor_x = a[0]
    this.anchor_y = a[1]
    this._image && this.calcBorderOffsets()
  }
  return this
}

return jaws;
})(jaws || {});

