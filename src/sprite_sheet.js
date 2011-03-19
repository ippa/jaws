var jaws = (function(jaws) {

/* Cut out a rectangular piece of a an image, returns as canvas-element */
function cutImage(image, x, y, width, height) {
  var cut = document.createElement("canvas")
  cut.width = width
  cut.height = height
  
  var ctx = cut.getContext("2d")
  ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height)
  
  return cut
};

/* Cut up into frame_size pieces and put them in frames[] */
jaws.SpriteSheet = function(options) {
  this.image = jaws.isDrawable(options.image) ? options.image : jaws.assets.data[options.image]
  this.orientation = options.orientation || "right"
  this.frame_size = options.frame_size || [32,32]
  this.frames = []

  var index = 0
  for(var x=0; x < this.image.width; x += this.frame_size[0]) {
    for(var y=0; y < this.image.height; y += this.frame_size[1]) {
      this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
    }
  }
}

jaws.SpriteSheet.prototype.toString = function() { return "[SpriteSheet " + this.frames.length + " frames]" }

return jaws;
})(jaws || {});

