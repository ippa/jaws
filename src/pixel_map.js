var jaws = (function(jaws) {
/**
* @class PixelPerfect collision map. Created from an image.
* @constructor
*  
* @property {string} image     the map
*/

jaws.PixelMap = function PixelMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  /* Internally we use a sprite, gives us image-argument, image_scaling and so on */
  this.sprite = new jaws.Sprite(options);
  this.named_colors = [];
  this.context = this.sprite.asCanvasContext();
  this.update();
}



/**
* Updates internal datastructure from the canvas. If we modify the 'terrain' we'll need to call this again.
* Future idea: Only update parts of the array that's been modified.
*/
jaws.PixelMap.prototype.update = function(x, y, width, height) {
  if(x === undefined) x = 0;
  if(y === undefined) y = 0;
  if(width === undefined)   width = this.sprite.width;
  if(height === undefined)  height = this.sprite.height;
  
  // No arguments? Read whole canvas, replace this.data
  if(arguments.length == 0) {
    this.data = this.context.getImageData(x, y, width, height).data
  }
  // Read a rectangle from the canvas, replacing relevant pixels in this.data
  else {
    var tmp = this.context.getImageData(x, y, width, height).data
    var offset = (y * this.sprite.width * 4) + (x*4)
    for(var i=0; i < tmp.length; i++) {
      this.data[offset + i] = tmp[i];
    }
  }
}

/**
* Draws pixelsmaps image like a sprite
*/ 
jaws.PixelMap.prototype.draw = function() {
  this.sprite.draw();
}


/**
* Trace the outline of a Rect until a named color found. Returns found color.
*
* @return truish if color is found
*/
jaws.PixelMap.prototype.namedColorAtRect = function(color, rect) {
  var x = rect.x
  var y = rect.y

  for(; x < rect.right; x++)  if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y < rect.bottom; y++) if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; x > rect.x; x--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y > rect.y; y--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);

  return false;
}

/**
* Read current color at given coordinates X/Y 
* returns array of 4 numbers [R, G, B, A]
*/
jaws.PixelMap.prototype.at = function(x, y) {
  x = parseInt(x)
  y = parseInt(y) - 1;
  if(y < 0) y = 0;

  var start = (y * this.sprite.width * 4) + (x*4);
  var R = this.data[start];
  var G = this.data[start + 1];
  var B = this.data[start + 2];
  var A = this.data[start + 3];
  return [R, G, B, A];
}

/**
* Returns a previously named color if it exists at given x/y-coordinates.
*
*/
jaws.PixelMap.prototype.namedColorAt = function(x, y) {
  var a = this.at(x, y);
  for(var i=0; i < this.named_colors.length; i++) {
    var name = this.named_colors[i].name;
    var c = this.named_colors[i].color;
    if(c[0] == a[0] && c[1] == a[1] && c[2] == a[2] && c[3] == a[3]) return name;
  }
}

jaws.PixelMap.prototype.nameColor = function(name, color) {
  this.named_colors.push({name: name, color: color});
}

return jaws;
})(jaws || {});
