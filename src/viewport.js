var jaws = (function(jaws) {

/*
 *
 * Viewport() is a window (a Rect) into a bigger canvas/image
 *
 * It won't every go "outside" that image.
 * It comes with convenience methods as:
 *
 *   viewport.centerAround(player) which will do just what you think. (player needs to have properties x and y)
 *
 *
 */
jaws.Viewport = function(options) {
  this.options = options
  this.context = options.context || jaws.context
  this.width = options.width || jaws.canvas.width
  this.height = options.height || jaws.canvas.height
  this.max_x = options.max_x || jaws.canvas.width 
  this.max_y = options.max_y || jaws.canvas.height
  this._x = options.x || 0
  this._y = options.y || 0
  
  this.__defineGetter__("x", function() {return this._x} );
  this.__defineGetter__("y", function() {return this._y} );

  this.__defineSetter__("x", function(value) {
    this._x = value
    var max = this.max_x - this.width
    if(this._x < 0)    { this._x = 0 }
    if(this._x > max)  { this._x = max }
  });
  
  this.__defineSetter__("y", function(value) {
    this._y = value
    var max = this.max_y - this.height
    if(this._y < 0)    { this._y = 0 }
    if(this._y > max)  { this._y = max }
  });

  this.isOutside = function(item) {
    return(!this.isInside(item))
  };

  this.isInside = function(item) {
    return( item.x >= this._x && item.x <= (this._x + this.width) && item.y >= this._y && item.y <= (this._y + this.height) )
  };

  this.centerAround = function(item) {
    this.x = (item.x - this.width / 2)
    this.y = (item.y - this.height / 2)
  };

  this.apply = function(func) {
    this.context.save()
    this.context.translate(-this._x, -this._y)
    func()
    this.context.restore()
  };
}

return jaws;
})(jaws || {});

