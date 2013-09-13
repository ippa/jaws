var jaws = (function(jaws) {


/** 
 * @class Cut out invidual frames (images) from a larger spritesheet-image. "Field Summary" contains options for the SpriteSheet()-constructor.
 *
 * @property {image|image} Image/canvas or asset-string to cut up smaller images from
 * @property {string} orientation How to cut out invidual images from spritesheet, either "right" or "down"
 * @property {array} frame_size  width and height of invidual frames in spritesheet
 * @property {array} frames all single frames cut out from image
 * @property {integer} offset vertical or horizontal offset to start cutting from
 * @property {int} scale_image Scale the sprite sheet by this factor before cutting out the frames. frame_size is automatically re-sized too
 *
*/
jaws.SpriteSheet = function SpriteSheet(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options);

  /* Detect framesize from filename, example: droid_10x16.png means each frame is 10px high and 16px wide */
  if(jaws.isString(this.image) && !options.frame_size) {
    var regexp = new RegExp("_(\\d+)x(\\d+)", "g");
    var sizes = regexp.exec(this.image)
    this.frame_size = []
    this.frame_size[0] = parseInt(sizes[1])
    this.frame_size[1] = parseInt(sizes[2])
  }

  this.image = jaws.isDrawable(this.image) ? this.image : jaws.assets.data[this.image]
  if(this.scale_image) {
    var image = (jaws.isDrawable(this.image) ? this.image : jaws.assets.get(this.image))
    this.frame_size[0] *= this.scale_image
    this.frame_size[1] *= this.scale_image
    this.image = jaws.retroScaleImage(image, this.scale_image)
  }

  var index = 0
  this.frames = []

  // Cut out tiles from Top -> Bottom
  if(this.orientation == "down") {  
    for(var x=this.offset; x < this.image.width; x += this.frame_size[0]) {
      for(var y=0; y < this.image.height; y += this.frame_size[1]) {
        this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
      }
    }
  }
  // Cut out tiles from Left -> Right
  else {
    for(var y=this.offset; y < this.image.height; y += this.frame_size[1]) {
      for(var x=0; x < this.image.width; x += this.frame_size[0]) {
        this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
      }
    }
  }
}

jaws.SpriteSheet.prototype.default_options = {
  image: null,
  orientation: "down",
  frame_size: [32,32],
  offset: 0,
  scale_image: null
}

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

jaws.SpriteSheet.prototype.toString = function() { return "[SpriteSheet " + this.frames.length + " frames]" }

return jaws;
})(jaws || {});

