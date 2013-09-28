var jaws = (function(jaws) {
  /** 
   * @class Manage a parallax scroller with different layers. "Field Summary" contains options for the Parallax()-constructor.
   * @constructor
   *
   * @property scale     number, scale factor for all layers (2 will double everything and so on)
   * @property repeat_x  true|false, repeat all parallax layers horizontally
   * @property repeat_y  true|false, repeat all parallax layers vertically
   * @property camera_x  number, x-position of "camera". add to camera_x and layers will scroll left. defaults to 0
   * @property camera_y  number, y-position of "camera". defaults to 0
   *
   * @example
   * parallax = new jaws.Parallax({repeat_x: true})
   * parallax.addLayer({image: "parallax_1.png", damping: 100})
   * parallax.addLayer({image: "parallax_2.png", damping: 6})
   * parallax.camera_x += 1    // scroll layers horizontally
   * parallax.draw()
   *
   */
  jaws.Parallax = function Parallax(options) {
    if( !(this instanceof arguments.callee) ) return new arguments.callee( options );
    jaws.parseOptions(this, options, this.default_options)
  }

  jaws.Parallax.prototype.default_options = {
    width: function() { return jaws.width },
    height: function() { return jaws.height },
    scale: 1,
    repeat_x: null,
    repeat_y: null,
    camera_x: 0,
    camera_y: 0,
    layers: []
  }

  /** Draw all layers in parallax scroller */
  jaws.Parallax.prototype.draw = function(options) {
    var layer, numx, numy, initx;

    for(var i=0; i < this.layers.length; i++) {
      layer = this.layers[i]

      if(this.repeat_x) {
        initx = -((this.camera_x / layer.damping) % layer.width);
      } 
      else {
        initx = -(this.camera_x / layer.damping)
      }		

      if (this.repeat_y) {
        layer.y = -((this.camera_y / layer.damping) % layer.height);
      }
      else {
        layer.y = -(this.camera_y / layer.damping);
      }

      layer.x = initx;
      while (layer.y < this.height) {
        while (layer.x < this.width) {
          if (layer.x + layer.width >= 0 && layer.y + layer.height >= 0) { //Make sure it's on screen
            layer.draw(); //Draw only if actually on screen, for performance reasons
          }
          layer.x = layer.x + layer.width;      

          if (!this.repeat_x) {
            break;
          }
        }

        layer.y = layer.y + layer.height;
        layer.x = initx;
        if (!this.repeat_y) {
          break;
        }
      }
    }
  }
  /** Add a new layer to the parallax scroller */
  jaws.Parallax.prototype.addLayer = function(options) {
    var layer = new jaws.ParallaxLayer(options)
    layer.scaleAll(this.scale)
    this.layers.push(layer)
  }
  /** Debugstring for Parallax() */
  jaws.Parallax.prototype.toString = function() { return "[Parallax " + this.x + ", " + this.y + ". " + this.layers.length + " layers]" }

  /**
   * @class A single layer that's contained by Parallax()
   *
   * @property damping  number, higher the number, the slower it will scroll with regards to other layers, defaults to 0
   * @constructor
   * @extends jaws.Sprite
   */
  jaws.ParallaxLayer = function ParallaxLayer(options) {
    if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

    this.damping = options.damping || 0
    jaws.Sprite.call(this, options)
  }
  jaws.ParallaxLayer.prototype = jaws.Sprite.prototype

  /** Debugstring for ParallaxLayer() */
  // This overwrites Sprites toString, find another sollution.
  // jaws.ParallaxLayer.prototype.toString = function() { return "[ParallaxLayer " + this.x + ", " + this.y + "]" }

  return jaws;
})(jaws || {});

