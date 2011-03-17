/*
 * 
 * This is usually the Constructor we use when we want characters on the screen.
 * Comes with various properties:
 *
 * Properties: x, y, alpha, angle, flipped
 * Setters: setImage(), anchor(), scale()
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
  
  options.image           &&  this.setImage(options.image)
  options.anchor          &&  this.setAnchor(options.anchor)
  this.setScale(options.scale)
 
  // No canvas context? Switch to DOM-based spritemode
  if(!this.context) { this.createDiv() }
}

/* Flip the sprite horizontally */
jaws.Sprite.prototype.flip = function() {
  this.flipped = this.flipped ? false : true
}

/* Set sprites x/y position */
jaws.Sprite.prototype.move = function(x,y) {
  this.x += x
  this.y += y
}
/* Modify sprites x/y position */
jaws.Sprite.prototype.moveTo = function(x,y) {
  this.x = x
  this.y = y
}

/* When image, scale or anchor changes we re-cache these values for speed */
jaws.Sprite.prototype.calcBorderOffsets = function() {
  if(!this.image) { return }

  this.width = this.image.width * this.scale
  this.height = this.image.height * this.scale

  this.left_offset = this.width * this.anchor_x
  this.top_offset = this.height * this.anchor_y
  //this.right_offset =  this.width * (1.0 - this.anchor_x)
  //this.bottom_offset = this.height * (1.0 - this.anchor_y)
} 

/* Set sprites image from an image or asset-string. Recalculate height/width etc. */
jaws.Sprite.prototype.setImage = function(value)   { 
  this.image = (jaws.isDrawable(value) ? value : jaws.assets.data[value])
  this.calcBorderOffsets(); 
}

/* */
jaws.Sprite.prototype.setScale = function(value) { 
  this.scale = value || 1; 
  this.calcBorderOffsets(); 
}

jaws.Sprite.prototype.toRect = function() {
  if(!this.image) { return undefined } // No rect without an image
  return (new jaws.Rect(this.x - this.left_offset, this.y - this.top_offset, this.width, this.height))
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
  if(this.flipped)          { transform += "scale(-" + this.scale + "," + this.scale + ")"; }
  else if(this.scale != 1)  { transform += "scale(" + this.scale + ")"; }

  this.div.style.MozTransform = transform
  this.div.style.WebkitTransform = transform
  this.div.style.transform = transform
}

// Draw the sprite on screen via its previously given context
jaws.Sprite.prototype.draw = function() {
  if(jaws.dom) { return this.updateDiv() }
  if(!this.image) { return }

  this.context.save()
  this.context.translate(this.x, this.y)
  this.angle && jaws.context.rotate(this.angle * Math.PI / 180)
  this.flipped && this.context.scale(-1, 1)
  this.context.globalAlpha = this.alpha
  this.context.translate(-this.left_offset, -this.top_offset)
  this.context.drawImage(this.image, 0, 0, this.width, this.height);
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
jaws.Sprite.prototype.setAnchor = function(align) {
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
    this.calcBorderOffsets()
  }
  return this
}
jaws.Sprite.prototype.toString = function() { return "[Sprite " + this.x + ", " + this.y + "," + this.width + "," + this.height + "]" }

return jaws;
})(jaws || {});

