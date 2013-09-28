var jaws = (function(jaws) {
/**
* @class jaws.PixelMap
* @constructor
*
* Worms-style terrain collision detection. Created from a normal image. 
* Read out specific pixels. Modify as you would do with a canvas.
*  
* @property {string} image        the image of the terrain
* @property {int} scale_image     Scale the image by this factor
*
* @example
* tile_map = new jaws.Parallax({image: "map.png", scale_image: 4})  // scale_image: 4 for retro blocky feeling!
* tile_map.draw()                                     // draw on canvas
* tile_map.nameColor([0,0,0,255], "ground")           // give the color black the name "ground"
* tile_map.namedColorAtRect("ground", player.rect())  // True if players boundingbox is touching any black pixels on tile_map 
*
*/
jaws.PixelMap = function PixelMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.options = options
  this.scale = options.scale || 1
  this.x = options.x || 0
  this.y = options.y || 0

  if(options.image) {
    this.setContext(options.image);

    if(options.scale_image) {
      this.setContext(  jaws.retroScaleImage(this.context.canvas, options.scale_image) )
    }

    this.width = this.context.canvas.width * this.scale;
    this.height = this.context.canvas.height * this.scale;
  }
  else { jaws.log.warn("PixelMap needs an image to work with") }
  
  this.named_colors = [];
  this.update();
}

/*
* Initiates a drawable context from given image.
* @private
*/
jaws.PixelMap.prototype.setContext = function(image) {
  var image = jaws.isDrawable(image) ? image : jaws.assets.get(image)
  this.context = jaws.imageToCanvasContext(image)
} 

/**
* Updates internal pixel-array from the canvas. If we modify the 'terrain' (paint on pixel_map.context) we'll need to call this method.
*/
jaws.PixelMap.prototype.update = function(x, y, width, height) {
  if(x === undefined || x < 0) x = 0;
  if(y === undefined || y < 0) y = 0;
  if(width === undefined || width > this.width)     width = this.width;
  if(height === undefined || height > this.height)  height = this.height;
 
  // No arguments? Read whole canvas, replace this.data
  if(arguments.length == 0) {
    this.data = this.context.getImageData(x, y, width, height).data
  }
  // Read a rectangle from the canvas, replacing relevant pixels in this.data
  else {
    var tmp = this.context.getImageData(x, y, width, height).data
    var tmp_count = 0;

    // Some precalculation-optimizations
    var one_line_down = this.width * 4;
    var offset = (y * this.width * 4)  + (x*4);
    var horizontal_line = width*4;

    for(var y2 = 0; y2 < height; y2++) {
      for(var x2 = 0; x2 < horizontal_line; x2++) {
        this.data[offset + x2] = tmp[tmp_count++];
      }  
      offset += one_line_down;
    }
  }
}

/**
* Draws the pixel map on the maincanvas
*/ 
jaws.PixelMap.prototype.draw = function() {
  jaws.context.drawImage(this.context.canvas, this.x, this.y, this.width, this.height)
}

/**
* Trace the outline of a Rect until a named color found.
*
* @param {object} Rect          Instance of jaws.Rect()
* @param {string} Color_Filter  Only look for this named color
*
* @return {string}  name of found color
*/
jaws.PixelMap.prototype.namedColorAtRect = function(rect, color) {
  var x = rect.x
  var y = rect.y

  for(; x < rect.right-1; x++)  if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);
  for(; y < rect.bottom-1; y++) if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);
  for(; x > rect.x; x--)      if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);
  for(; y > rect.y; y--)      if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);

  return false;
}

/**
* Read current color at given coordinates X/Y 
*
* @return {array}   4 integers [R, G, B, A] representing the pixel at x/y
*/
jaws.PixelMap.prototype.at = function(x, y) {
  x = parseInt(x)
  y = parseInt(y)
  if(y < 0) y = 0;

  var start = (y * this.width * 4) + (x*4);
  var R = this.data[start];
  var G = this.data[start + 1];
  var B = this.data[start + 2];
  var A = this.data[start + 3];
  return [R, G, B, A];
}

/**
* Get previously named color if it exists at given x/y-coordinates.
*
* @return {string} name or color
*/
jaws.PixelMap.prototype.namedColorAt = function(x, y) {
  var a = this.at(x, y);
  for(var i=0; i < this.named_colors.length; i++) {
    var name = this.named_colors[i].name;
    var c = this.named_colors[i].color;
    if(c[0] == a[0] && c[1] == a[1] && c[2] == a[2] && c[3] == a[3]) return name;
  }
}

/**
* Give a RGBA-array a name. Later on we can work with names instead of raw colorvalues.
*
* @example
* pixel_map.nameColor([0,0,0,255], "ground")    // Give the color black (with no transparency) the name "ground"
*/
jaws.PixelMap.prototype.nameColor = function(color, name) {
  this.named_colors.push({name: name, color: color});
}

return jaws;
})(jaws || {});
