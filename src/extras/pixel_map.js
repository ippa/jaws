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
  this.update();
}



/**
* Updates internal datastructure from the canvas. If we modify the 'terrain' we'll need to call this again.
* Future idea: Only update parts of the array that's been modified.
*/
jaws.PixelMap.prototype.update = function(x, y) {
  this.data = this.sprite.asCanvasContext().getImageData(0, 0, this.sprite.width, this.sprite.height).data
}

/**
* Draws pixelsmaps image like a sprite
*/ 
jaws.PixelMap.prototype.draw = function() {
  this.sprite.draw();
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
* Trace the outline of a Rect until a named color found. Returns found color.
*
*/
jaws.PixelMap.prototype.namedColorAtRect = function(rect, color) {
  var x = rect.x
  var y = rect.y

  for(; x < rect.right; x++)  if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y < rect.bottom; y++) if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; x > rect.x; x--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y > rect.y; y--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
}

jaws.PixelMap.prototype.untilNamedColorAtRect = function(callback) {
  var rect;
  var color;
  while(color === undefined) {
    color = this.namedColorAtRect( callback() );
  }
  return color;
}


jaws.PixelMap.prototype.colorAt = function(x, y) {
  var a = this.at(x,y);
  return {red: a[0], green: a[1], blue: a[2], alpha: a[3]};
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
