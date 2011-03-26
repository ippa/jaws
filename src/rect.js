var jaws = (function(jaws) {

/*
 * A bread and butter Rect() - useful for basic collision detection
 */
jaws.Rect = function(x,y,width,height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.right = x + width
  this.bottom = y + height
}

jaws.Rect.prototype.getPosition = function() {
  return [this.x, this.y]
}

jaws.Rect.prototype.move = function(x,y) {
  this.x += x
  this.y += y
  this.right += x
  this.bottom += y
}

jaws.Rect.prototype.moveTo = function(x,y) {
  this.x = x
  this.y = y
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}

jaws.Rect.prototype.resize = function(width,height) {
  this.width += width
  this.height += height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}

jaws.Rect.prototype.resizeTo = function(width,height) {
  this.width = width
  this.height = height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}

// Draw a red rectangle, useful for debug
jaws.Rect.prototype.draw = function() {
  jaws.context.strokeStyle = "red"
  jaws.context.strokeRect(this.x, this.y, this.width, this.height)
  return this
}

// Returns true if point at x, y lies within calling rect
jaws.Rect.prototype.collidePoint = function(x, y) {
  return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
}

// Returns true if calling rect overlaps with given rect in any way
jaws.Rect.prototype.collideRect = function(rect) {
  return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
         ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom))
}

/*
// Possible future functions
jaws.Rect.prototype.collideRightSide = function(rect)  { return(this.right >= rect.x && this.x < rect.x) }
jaws.Rect.prototype.collideLeftSide = function(rect)   { return(this.x > rect.x && this.x <= rect.right) }
jaws.Rect.prototype.collideTopSide = function(rect)    { return(this.y >= rect.y && this.y <= rect.bottom) }
jaws.Rect.prototype.collideBottomSide = function(rect) { return(this.bottom >= rect.y && this.y < rect.y) }
*/

jaws.Rect.prototype.toString = function() { return "[Rect " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "]" }

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.Rect }

