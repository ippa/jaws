var jaws = (function(jaws) {

jaws.Parallax = function(options) {
  this.scale = options.scale || 1
  this.repeat_x = options.repeat_x
  this.repeat_y = options.repeat_y
  this.camera_x = options.camera_x || 0
  this.camera_y = options.camera_y || 0
  this.layers = []
}

jaws.Parallax.prototype.draw = function(options) {
  var layer, save_x, save_y;

  for(var i=0; i < this.layers.length; i++) {
    layer = this.layers[i]
    
    save_x = layer.x
    save_y = layer.y

    layer.x = -(this.camera_x / layer.damping)
    layer.y = -(this.camera_y / layer.damping)

    while(this.repeat_x && layer.x > 0) { layer.x -= layer.image.width }
    while(this.repeat_y && layer.y > 0) { layer.y -= layer.image.width }

    while(this.repeat_x && layer.x < jaws.width) {
      while(this.repeat_y && layer.y < jaws.height) {
        layer.draw()
        layer.y += layer.image.height
      }    
      layer.y = save_y
      layer.draw()
      layer.x += (layer.image.width-1)  // -1 to compensate for glitches in repeating tiles
    }
    while(layer.repeat_y && !layer.repeat_x && layer.y < jaws.height) {
      layer.draw()
      layer.y += layer.image.height
    }
    layer.x = save_x
  }
}
jaws.Parallax.prototype.addLayer = function(options) {
  var layer = new jaws.ParallaxLayer(options)
  layer.scale = this.scale
  this.layers.push(layer)
}

jaws.ParallaxLayer = function(options) {
  this.damping = options.damping || 0
  jaws.Sprite.call(this, options)
}
jaws.ParallaxLayer.prototype = jaws.Sprite.prototype


return jaws;
})(jaws || {});
