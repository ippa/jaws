var jaws = (function(jaws) {

/**
 *
 * @class A window (Rect) into a bigger canvas/image. Viewport is always contained within that given image (called the game world).
 *
 * @property width  width of viewport, defaults to canvas width
 * @property height height of viewport, defaults to canvas height
 * @property max_x  maximum x-position for viewport, defaults to canvas width
 * @property max_y  maximum y-position for viewport, defaults to canvas height 
 *
 * @example
 * // Center viewport around players position (player needs to have x/y attributes)
 * // Usefull for sidescrollers
 * viewport.centerAround(player)
 *
 * // Common viewport usage. max_x/max_y could be said to set the "game world size"
 * viewport = viewport = new jaws.Viewport({max_x: 400, max_y: 3000})
 * player = new jaws.Sprite({x:100, y:400})
 * viewport.centerAround(player)
 *
 * // Draw player relative to the viewport. If viewport is way off, player won't even show up.
 * viewport.apply( function() {
 *  player.draw()
 * });
 *
 */
jaws.Viewport = function ViewPort(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.options = options
  this.context = options.context || jaws.context
  this.width = options.width || jaws.width
  this.height = options.height || jaws.height
  this.max_x = options.max_x || jaws.width 
  this.max_y = options.max_y || jaws.height
  this.x = options.x || 0
  this.y = options.y || 0
  var that = this

  /** Move viewport x pixels horizontally and y pixels vertically */
  this.move = function(x, y) {
    x && (this.x += x)
    y && (this.y += y)
    this.verifyPosition()
  };
  
  /** Move viewport to given x/y */
  this.moveTo = function(x, y) {
    if(!(x==undefined)) { this.x = x }
    if(!(y==undefined)) { this.y = y }
    this.verifyPosition()
  };

  /** 
   * Returns true if item is outside viewport 
   * @example
   *
   * if( viewport.isOutside(player)) player.die();
   *
   * // ... or the more advanced:
   * bullets = new SpriteList()
   * bullets.push( bullet )
   * bullets.deleteIf( viewport.isOutside )
   *
   */
  this.isOutside = function(item) {
    return(!that.isInside(item))
  };

  /** Returns true if item is inside viewport  */
  this.isInside = function(item) {
    return( item.x >= that.x && item.x <= (that.x + that.width) && item.y >= that.y && item.y <= (that.y + that.height) )
  };

  /** Returns true if item is partly (down to 1 pixel) inside viewport */
  this.isPartlyInside = function(item) {
    var rect = item.rect()
    return( rect.right >= that.x && rect.x <= (that.x + that.width) && rect.bottom >= that.y && item.y <= (that.y + that.height) )
  };
  
  /** Returns true of item is left of viewport */
  this.isLeftOf = function(item) { return(item.x < that.x)  }
 
  /** Returns true of item is right of viewport */
  this.isRightOf = function(item) { return(item.x > (that.x + that.width) )  }

  /** Returns true of item is above viewport */
  this.isAbove = function(item) { return(item.y < that.y)  }

  /** Returns true of item is above viewport */
  this.isBelow = function(item) { return(item.y > (that.y + that.height) )  }


  /** 
   * center the viewport around item. item must respond to x and y for this to work. 
   * Usefull for sidescrollers when you wan't to keep the player in the center of the screen no matter how he moves.
   */
  this.centerAround = function(item) {
    this.x = (item.x - this.width / 2)
    this.y = (item.y - this.height / 2)
    this.verifyPosition()
  };

  /**
   * force 'item' inside current viewports visible area
   * using 'buffer' as indicator how close to the 'item' is allowed to go
   *
   * @example
   *
   * viewport.move(10,0)                          // scroll forward
   * viewport.forceInsideVisibleArea(player, 20)  // make sure player doesn't get left behind
   */
  this.forceInsideVisibleArea = function(item, buffer) {
    if(item.x < this.x+buffer)               { item.x = this.x+buffer }
    if(item.x > this.x+jaws.width-buffer)    { item.x = this.x+jaws.width-buffer }
    if(item.y < this.y+buffer)               { item.y = this.y+buffer }
    if(item.y > this.y+jaws.height-buffer)   { item.y = this.y+jaws.height-buffer }
  }
  
  /**
   * force 'item' inside the limits of the viewport
   * using 'buffer' as indicator how close to the 'item' is allowed to go
   *
   * @example
   * viewport.forceInside(player, 10) 
   */
  this.forceInside = function(item, buffer) {
    if(item.x < buffer)               { item.x = buffer }
    if(item.x > this.max_x-buffer)    { item.x = this.max_x-buffer }
    if(item.y < buffer)               { item.y = buffer }
    if(item.y > this.max_y-buffer)    { item.y = this.max_y-buffer }
  }


  /** 
  * executes given draw-callback with a translated canvas which will draw items relative to the viewport
  * 
  * @example
  *
  * viewport.apply( function() {
  *   player.draw();
  *   foo.draw();
  * });
  * 
  */
  this.apply = function(func) {
    this.context.save()
    this.context.translate(-this.x, -this.y)
    func()
    this.context.restore()
  };

  /** 
   * if obj is an array-like object, iterate through it and call draw() on each item if it's partly inside the viewport 
   */
  this.draw = function( obj ) {
    this.apply( function() {
      if(obj.forEach) obj.forEach( that.drawIfPartlyInside );
      else if(obj.draw) that.drawIfPartlyInside(obj);
      // else if(jaws.isFunction(obj) {};  // add apply()-functionally here?
    });
  }

  /** 
   * draws all items of 'tile_map' that's lies inside the viewport 
   * this is simular to viewport.draw( tile_map.all() ) but optmized for Huge game worlds (tile maps)
   */
  this.drawTileMap = function( tile_map ) {
    var sprites = tile_map.atRect({ x: this.x, y: this.y, right: this.x + this.width, bottom: this.y + this.height })
    this.apply( function() {
      for(var i=0; i < sprites.length; i++) sprites[i].draw();
    });
  }

  /** draws 'item' if it's partly inside the viewport */
  this.drawIfPartlyInside = function(item) { 
    if(that.isPartlyInside(item)) item.draw(); 
  }

  /** @private */
  this.verifyPosition = function() {
    var max = this.max_x - this.width
    if(this.x < 0)      { this.x = 0 }
    if(this.x > max)    { this.x = max }

    var max = this.max_y - this.height
    if(this.y < 0)      { this.y = 0 }
    if(this.y > max)    { this.y = max }
  };
 
  this.moveTo(options.x||0, options.y||0)
}

jaws.Viewport.prototype.toString = function() { return "[Viewport " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]" }

return jaws;
})(jaws || {});

