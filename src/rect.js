var jaws = (function(jaws) {

/*
 * A bread and butter Rect() - useful for basic collision detection
 */
jaws.Rect = function(x,y,width,height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  
  this.__defineGetter__("left", function() { return this.x } )
  this.__defineGetter__("top", function() { return this.y } )
  this.__defineGetter__("right", function() { return this.x + this.width } )
  this.__defineGetter__("bottom", function() { return this.y + this.height } )

  // Draw a red rectangle
  this.draw = function() {
    jaws.context.strokeStyle = "red"
    jaws.context.strokeRect(this.x, this.y, this.width, this.height)
  }

  // Returns true if point at x, y lies within calling rect
  this.collidePoint = function(x, y) {
    return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
  }

  // Returns true if calling rect overlaps with given rect in any way
  this.collideRect = function(rect) {
    return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
           ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom))
  }
}

/* TODO: add tests for bellow functions */
jaws.Rect.prototype.collideRightSide = function(rect)  { return(this.right >= rect.x && this.x < rect.x) }
jaws.Rect.prototype.collideLeftSide = function(rect)   { return(this.x > rect.x && this.x <= rect.right) }
jaws.Rect.prototype.collideTopSide = function(rect)    { return(this.y >= rect.y && this.y <= rect.bottom) }
jaws.Rect.prototype.collideBottomSide = function(rect) { return(this.bottom >= rect.y && this.y < rect.y) }
jaws.Rect.prototype.toString = function() { return "[Rect " + this.x + ", " + this.y + "," + this.width + "," + this.height + "]" }

return jaws;
})(jaws || {});

