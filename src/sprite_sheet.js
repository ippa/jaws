var jaws = (function(jaws) {

/** @private
 * Cut out a rectangular piece of a an image, returns as canvas-element 
 */
function cutImage(image, x, y, width, height) {
  var cut = document.createElement("canvas")
  cut.width = width
  cut.height = height
  
  var ctx = cut.getContext("2d")
  ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height)
  
  return cut
};

/** 
 * @class Cut out invidual frames (images) from a larger spritesheet-image
 *
 * @property {image|image} Image/canvas or asset-string to cut up smaller images from
 * @property {string} orientation How to cut out invidual images from spritesheet, either "right" or "down"
 * @property {array} frame_size  width and height of invidual frames in spritesheet
 * @property {array} frames all single frames cut out from image
*/
jaws.SpriteSheet = function SpriteSheet(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.image = jaws.isDrawable(options.image) ? options.image : jaws.assets.data[options.image]
  this.orientation = options.orientation || "down"
  this.frame_size = options.frame_size || [32,32]
  this.frames = []
  
  if(options.scale_image) {
    var image = (jaws.isDrawable(options.image) ? options.image : jaws.assets.get(options.image))
    this.frame_size[0] *= options.scale_image
    this.frame_size[1] *= options.scale_image
    options.image = jaws.gfx.retroScaleImage(image, options.scale_image)
  }

  var index = 0

  // Cut out tiles from Top -> Bottom
  if(this.orientation == "down") {  
    for(var x=0; x < this.image.width; x += this.frame_size[0]) {
      for(var y=0; y < this.image.height; y += this.frame_size[1]) {
        this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
      }
    }
  }
  // Cut out tiles from Left -> Right
  else {
    for(var y=0; y < this.image.height; y += this.frame_size[1]) {
      for(var x=0; x < this.image.width; x += this.frame_size[0]) {
        this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
      }
    }
  }
}

jaws.SpriteSheet.prototype.toString = function() { return "[SpriteSheet " + this.frames.length + " frames]" }

return jaws;
})(jaws || {});

