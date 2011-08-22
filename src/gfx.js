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

    var w2 = to_data.width
    var h2 = to_data.height
    for (var y=0; y < h2; y += 1) {
      var y2 = Math.floor(y / factor)
      var y_as_x = y * to_data.width
      var y2_as_x = y2 * image.width

      for (var x=0; x < w2; x += 1) {
        var x2 = Math.floor(x / factor)
        var y_dst = (y_as_x + x) * 4
        var y_src = (y2_as_x + x2) * 4
        
        to_data.data[y_dst] = data[y_src];
        to_data.data[y_dst+1] = data[y_src+1];
        to_data.data[y_dst+2] = data[y_src+2];
        to_data.data[y_dst+3] = data[y_src+3];
      }
    }

    context2.putImageData(to_data, 0, 0)

    return canvas2
  }

  return jaws;
})(jaws || {});
