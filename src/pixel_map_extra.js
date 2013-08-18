var jaws = (function(jaws) {
/**
* @class PixelPerfect collision map. Created from an image.
* @constructor
*  
* @property {string} image     the map
*/

jaws.PixelMap = function PixelMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );
  jaws.parseOptions(this, options, this.default_options)
  
  this.sprite = new jaws.Sprite({x: 0, y: 0, image: this.image})
  this.update()
}

jaws.PixelMap.prototype.default_options = {
  image: null, 
  scale_image: null,
}

/**
* Updates internal datastructure from the canvas. If we modify the 'terrain' we'll need to call this again.
* Future idea: Only update parts of the array that's been modified.
*/
jaws.PixelMap.prototype.update = function(x, y) {
  this.data = this.sprite.asCanvas().getContext("2d").getImageData(0, 0, sprite.width, sprite.height).data
}

/**
* Read current color at given coordinates X/Y 
* returns array of 4 numbers [R, G, B, A]
*/
jaws.PixelMap.prototype.at = function(x, y) {
  x = parseInt(x)
  y = parseInt(y)

  try { 
    var start = ((y-1) * this.sprite.width * 4) + (x*4);
    var R = this.data[start];
    var G = this.data[start + 1];
    var B = this.data[start + 2];
    var A = this.data[start + 3];
    return [R, G, B, A];
  }
  catch(e) { }
}

return jaws;
})(jaws || {});
