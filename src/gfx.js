var jaws = (function(jaws) {
  /**
  * @namespace GFX related helpers
  *
  */
  jaws.gfx = {}

  /**
   * scale 'image' by factor 'factor'.
   * Scaling is done using nearest-neighbor ( retro-blocky-style ).
   * Returns a canvas.
   */
  jaws.gfx.retroScaleImage = function(image, factor) {
    var canvas = jaws.isImage(image) ? jaws.imageToCanvas(image) : image
    var context = canvas.getContext("2d")
    var data = context.getImageData(0,0,canvas.width,canvas.height).data

    // Create new canvas to return
    var canvas2 = document.createElement("canvas")
    canvas2.width = image.width * factor
    canvas2.height = image.height * factor
    var context2 = canvas2.getContext("2d")
    var to_data = context2.createImageData(canvas2.width, canvas2.height)

    for (var x=0; x < to_data.width; x++) {
      for (var y=0; y < to_data.height; y++) {
        px = Math.floor(x / factor)
        py = Math.floor(y / factor)
        for(var o=0; o<4; o++)  to_data.data[((y*to_data.width+x)*4)+o] = data[((py*image.width+px)*4)+o];
      }
    }
    context2.putImageData(to_data, 0, 0)

    return canvas2
  }

  return jaws;
})(jaws || {});
