/**
 * @fileOverview A jaws.Text object with word-wrapping functionality.
 * @class jaws.Text
 * @property {integer}    x             Horizontal position  (0 = furthest left)
 * @property {integer}    y             Vertical position    (0 = top)
 * @property {number}     alpha         Transparency: 0 (fully transparent) to 1 (no transparency)
 * @property {number}     angle         Angle in degrees (0-360)
 * @property {string}     anchor        String stating how to anchor the sprite to canvas; @see Sprite#anchor
 * @property {string}     text          The actual text to be displayed 
 * @property {string}     fontFace      A valid font-family
 * @property {number}     fontSize      The size of the text in pixels
 * @property {string}     textAlign     "start", "end", "left", "right", or "center"
 * @property {string}     textBaseline  "top", "bottom", "hanging", "middle", "alphabetic", or "ideographic"
 * @property {number}     width         The width of the rect() containing the text
 * @property {number}     height        The height of the rect() containing the text
 * @property {string}     style         The style to draw the text: "normal", "bold" or italic"
 * @property {boolean}    wordWrap      If word-wrapping should be attempted
 * @property {string}     shadowColor   The color of the shadow for the text
 * @property {number}     shadowBlur    The amount of shadow blur (length away from text)
 * @property {number}     shadowOffsetX The start of the shadow from initial x
 * @property {number}     shadowOffsetY The start of the shadow from initial y
 * @example
 *  var text = new Text({text: "Hello world!", x: 10, y: 10}) 
 */

var jaws = (function(jaws) {

  /**
   * jaws.Text constructor
   * @constructor
   * @param {object} options An object-literal collection of constructor values
   */
  jaws.Text = function(options) {
    if (!(this instanceof arguments.callee))
      return new arguments.callee(options);

    this.set(options);

    if (options.context) {
      this.context = options.context;
    }
   
    if (!options.context) { // Defaults to jaws.context
      if (jaws.context)
        this.context = jaws.context;
    }
  };

  /**
   * The default values of jaws.Text properties
   */
  jaws.Text.prototype.default_options = {
    x: 0,
    y: 0,
    alpha: 1,
    angle: 0,
    anchor_x: 0,
    anchor_y: 0,
    anchor: "top_left",
    damping: 1,
    style: "normal",
    fontFace: "serif",
    fontSize: 12,
    color: "black",
    textAlign: "start",
    textBaseline: "alphabetic",
    text: "",
    wordWrap: false,
    width: function(){ return jaws.width; },
    height: function() { return jaws.height; },
    shadowColor: null,
    shadowBlur: null,
    shadowOffsetX: null,
    shadowOffsetY: null,
    _constructor: null,
  };

  /**
   * Overrides constructor values with defaults
   * @this {jaws.Text}
   * @param {object} options An object-literal collection of constructor values
   * @returns {this}
   * @see jaws.parseOptions
   */
  jaws.Text.prototype.set = function(options) {

    jaws.parseOptions(this, options, this.default_options);

    if (this.anchor)
      this.setAnchor(this.anchor);

    this.cacheOffsets();

    return this;
  };

  /**
   * Returns a new instance based on the current jaws.Text object
   * @private
   * @this {jaws.Text}
   * @returns {object} The newly cloned object
   */
  jaws.Text.prototype.clone = function() {
    var constructor = this._constructor ? eval(this._constructor) : this.constructor;
    var new_sprite = new constructor(this.attributes());
    new_sprite._constructor = this._constructor || this.constructor.name;
    return new_sprite;
  };

  /**
   * Rotate sprite by value degrees
   * @this {jaws.Text}
   * @param {number} value The amount of the rotation
   * @returns {this} Current function scope
   */
  jaws.Text.prototype.rotate = function(value) {
    this.angle += value;
    return this;
  };

  /**
   * Forces a rotation-angle on sprite
   * @this {jaws.Text}
   * @param {number} value The amount of the rotation
   * @returns {this} Current function instance
   */
  jaws.Text.prototype.rotateTo = function(value) {
    this.angle = value;
    return this;
  };

  /**
   * Move object to position x, y
   * @this {jaws.Text}
   * @param {number} x The x position to move to
   * @param {number} y The y position to move to
   * @returns {this} Current function instance
   */
  jaws.Text.prototype.moveTo = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };

  /**
   * Modify x and/or y by a fixed amount
   * @this {jaws.Text}
   * @param {type} x The additional amount to move x
   * @param {type} y The additional amount to move y
   * @returns {this} Current function instance
   */
  jaws.Text.prototype.move = function(x, y) {
    if (x)
      this.x += x;
    if (y)
      this.y += y;
    return this;
  };

  /**
   * Sets x
   * @param {number} value The new x value
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.setX = function(value) {
    this.x = value;
    return this;
  };

  /**
   * Sets y
   * @param {number} value The new y value
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.setY = function(value) {
    this.y = value;
    return this;
  };

  /**
   * Position sprites top on the y-axis
   * @param {number} value
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.setTop = function(value) {
    this.y = value + this.top_offset;
    return this;
  };

  /**
   * Position sprites bottom on the y-axis
   * @param {number} value
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.setBottom = function(value) {
    this.y = value - this.bottom_offset;
    return this;
  };

  /**
   * Position sprites left side on the x-axis
   * @param {number} value
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.setLeft = function(value) {
    this.x = value + this.left_offset;
    return this;
  };

  /**
   * Position sprites right side on the x-axis
   * @param {number} value
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.setRight = function(value) {
    this.x = value - this.right_offset;
    return this;
  };

  /**
   * Set new width.
   * @param {number} value The new width
   * @returns {this}
   */
  jaws.Text.prototype.setWidth = function(value) {
    this.width = value;
    this.cacheOffsets();
    return this;
  };

  /**
   * Set new height. 
   * @param {number} value The new height
   * @returns {this}
   */
  jaws.Text.prototype.setHeight = function(value) {
    this.height = value;
    this.cacheOffsets();
    return this;
  };

  /**
   * Resize sprite by adding width or height
   * @param {number} width
   * @param {number} height
   * @returns {this}
   */
  jaws.Text.prototype.resize = function(width, height) {
    this.width += width;
    this.height += height;
    this.cacheOffsets();
    return this;
  };

  /**
   * Resize sprite to exact width/height
   * @this {jaws.Text}
   * @param {number} width
   * @param {number} height
   * @returns {this}
   */
  jaws.Text.prototype.resizeTo = function(width, height) {
    this.width = width;
    this.height = height;
    this.cacheOffsets();
    return this;
  };

  /**
   * The anchor could be describe as "the part of the text will be placed at x/y"
   * or "when rotating, what point of the of the text will it rotate round"
   * @param {string} value
   * @returns {this} The current function instance
   * @example
   * For example, a topdown shooter could use setAnchor("center") --> Place middle of the ship on x/y
   * .. and a sidescroller would probably use setAnchor("center_bottom") --> Place "feet" at x/y
   */
  jaws.Text.prototype.setAnchor = function(value) {
    var anchors = {
      top_left: [0, 0],
      left_top: [0, 0],
      center_left: [0, 0.5],
      left_center: [0, 0.5],
      bottom_left: [0, 1],
      left_bottom: [0, 1],
      top_center: [0.5, 0],
      center_top: [0.5, 0],
      center_center: [0.5, 0.5],
      center: [0.5, 0.5],
      bottom_center: [0.5, 1],
      center_bottom: [0.5, 1],
      top_right: [1, 0],
      right_top: [1, 0],
      center_right: [1, 0.5],
      right_center: [1, 0.5],
      bottom_right: [1, 1],
      right_bottom: [1, 1]
    };

    if (anchors.hasOwnProperty(value)) {
      this.anchor_x = anchors[value][0];
      this.anchor_y = anchors[value][1];
      this.cacheOffsets();
    }
    return this;
  };

  /**
   * Save the object's dimensions
   * @private
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.cacheOffsets = function() {

    this.left_offset = this.width * this.anchor_x;
    this.top_offset = this.height * this.anchor_y;
    this.right_offset = this.width * (1.0 - this.anchor_x);
    this.bottom_offset = this.height * (1.0 - this.anchor_y);

    if (this.cached_rect)
      this.cached_rect.resizeTo(this.width, this.height);
    return this;
  };

  /**
   * Returns a jaws.Rect() perfectly surrouning text.
   * @returns {jaws.Rect}
   */
  jaws.Text.prototype.rect = function() {
    if (!this.cached_rect && this.width)
      this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
    if (this.cached_rect)
      this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
    return this.cached_rect;
  };

  /**
   * Draw sprite on active canvas or update its DOM-properties
   * @this {jaws.Text}
   * @returns {this} The current function instance
   */
  jaws.Text.prototype.draw = function() {
    this.context.save();
    if (this.angle !== 0) {
      this.context.rotate(this.angle * Math.PI / 180);
    }
    this.context.globalAlpha = this.alpha;
    this.context.translate(-this.left_offset, -this.top_offset); // Needs to be separate from above translate call cause of flipped
    this.context.fillStyle = this.color;
    this.context.font = this.style + " " + this.fontSize + "px " + this.fontFace;
    this.context.textBaseline = this.textBaseline;
    this.context.textAlign = this.textAlign;
    if (this.shadowColor)
      this.context.shadowColor = this.shadowColor;
    if (this.shadowBlur)
      this.context.shadowBlur = this.shadowBlur;
    if (this.shadowOffsetX)
      this.context.shadowOffsetX = this.shadowOffsetX;
    if (this.shadowOffsetY)
      this.context.shadowOffsetY = this.shadowOffsetY;
    var oldY = this.y;
    var oldX = this.x;
    if (this.wordWrap)
    {
      var words = this.text.split(' ');
      var nextLine = '';

      for (var n = 0; n < words.length; n++)
      {
        var testLine = nextLine + words[n] + ' ';
        var measurement = this.context.measureText(testLine);
        if (this.y < oldY + this.height)
        {
          if (measurement.width > this.width)
          {
            this.context.fillText(nextLine, this.x, this.y);
            nextLine = words[n] + ' ';
            this.y += this.fontSize;
          }
          else {
            nextLine = testLine;
          }
          this.context.fillText(nextLine, this.x, this.y);
        }
      }
    }
    else
    {
      if (this.context.measureText(this.text).width < this.width)
      {
        this.context.fillText(this.text, this.x, this.y);
      }
      else
      {
        var words = this.text.split(' ');
        var nextLine = ' ';
        for (var n = 0; n < words.length; n++)
        {
          var testLine = nextLine + words[n] + ' ';
          if (this.context.measureText(testLine).width < Math.abs(this.width - this.x))
          {
            this.context.fillText(testLine, this.x, this.y);
            nextLine = words[n] + ' ';
            nextLine = testLine;
          }
        }
      }
    }
    this.y = oldY;
    this.x = oldX;
    this.context.restore();
    return this;
  };

  /** 
   * Returns sprite as a canvas context.
   * (For certain browsers, a canvas context is faster to work with then a pure image.)
   * @public
   * @this {jaws.Text}
   */
  jaws.Text.prototype.asCanvasContext = function() {
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    var context = canvas.getContext("2d");
    context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;

    this.context.fillStyle = this.color;
    this.context.font = this.style + this.fontSize + "px " + this.fontFace;
    this.context.textBaseline = this.textBaseline;
    this.context.textAlign = this.textAlign;
    if (this.shadowColor)
      this.context.shadowColor = this.shadowColor;
    if (this.shadowBlur)
      this.context.shadowBlur = this.shadowBlur;
    if (this.shadowOffsetX)
      this.context.shadowOffsetX = this.shadowOffsetX;
    if (this.shadowOffsetY)
      this.context.shadowOffsetY = this.shadowOffsetY;
    var oldY = this.y;
    var oldX = this.x;
    if (this.wordWrap)
    {
      var words = this.text.split(' ');
      var nextLine = '';

      for (var n = 0; n < words.length; n++)
      {
        var testLine = nextLine + words[n] + ' ';
        var measurement = this.context.measureText(testLine);
        if (this.y < oldY + this.height)
        {
          if (measurement.width > this.width)
          {
            this.context.fillText(nextLine, this.x, this.y);
            nextLine = words[n] + ' ';
            this.y += this.fontSize;
          }
          else {
            nextLine = testLine;
          }
          this.context.fillText(nextLine, this.x, this.y);
        }
      }
    }
    else
    {
      if (this.context.measureText(this.text).width < this.width)
      {
        this.context.fillText(this.text, this.x, this.y);
      }
      else
      {
        var words = this.text.split(' ');
        var nextLine = ' ';
        for (var n = 0; n < words.length; n++)
        {
          var testLine = nextLine + words[n] + ' ';
          if (this.context.measureText(testLine).width < Math.abs(this.width - this.x))
          {
            this.context.fillText(testLine, this.x, this.y);
            nextLine = words[n] + ' ';
            nextLine = testLine;
          }
        }
      }
    }
    this.y = oldY;
    this.x = oldX;
    return context;
  };

  /** 
   * Returns text as a canvas
   * @this {jaws.Text}
   */
  jaws.Text.prototype.asCanvas = function() {
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    var context = canvas.getContext("2d");
    context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;

    this.context.fillStyle = this.color;
    this.context.font = this.style + this.fontSize + "px " + this.fontFace;
    this.context.textBaseline = this.textBaseline;
    this.context.textAlign = this.textAlign;
    if (this.shadowColor)
      this.context.shadowColor = this.shadowColor;
    if (this.shadowBlur)
      this.context.shadowBlur = this.shadowBlur;
    if (this.shadowOffsetX)
      this.context.shadowOffsetX = this.shadowOffsetX;
    if (this.shadowOffsetY)
      this.context.shadowOffsetY = this.shadowOffsetY;
    var oldY = this.y;
    var oldX = this.x;
    if (this.wordWrap)
    {
      var words = this.text.split(' ');
      var nextLine = '';

      for (var n = 0; n < words.length; n++)
      {
        var testLine = nextLine + words[n] + ' ';
        var measurement = context.measureText(testLine);
        if (this.y < oldY + this.height)
        {
          if (measurement.width > this.width)
          {
            context.fillText(nextLine, this.x, this.y);
            nextLine = words[n] + ' ';
            this.y += this.fontSize;
          }
          else {
            nextLine = testLine;
          }
          context.fillText(nextLine, this.x, this.y);
        }
      }
    }
    else
    {
      if (context.measureText(this.text).width < this.width)
      {
        this.context.fillText(this.text, this.x, this.y);
      }
      else
      {
        var words = this.text.split(' ');
        var nextLine = ' ';
        for (var n = 0; n < words.length; n++)
        {
          var testLine = nextLine + words[n] + ' ';
          if (context.measureText(testLine).width < Math.abs(this.width - this.x))
          {
            context.fillText(testLine, this.x, this.y);
            nextLine = words[n] + ' ';
            nextLine = testLine;
          }
        }
      }
    }
    this.y = oldY;
    this.x = oldX;
    return canvas;
  };

  /**
   * Returns Text's properties as a String 
   * @returns {string}
   */
  jaws.Text.prototype.toString = function() {
    return "[Text " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]";
  };

  /**
   * Returns Text's properties as a pure object
   * @returns {object}
   */
  jaws.Text.prototype.attributes = function() {
    var object = this.options;                  // Start with all creation time properties
    object["_constructor"] = this._constructor || "jaws.Text";
    object["x"] = parseFloat(this.x.toFixed(2));
    object["y"] = parseFloat(this.y.toFixed(2));
    object["text"] = this.text;
    object["alpha"] = this.alpha;
    object["angle"] = parseFloat(this.angle.toFixed(2));
    object["anchor_x"] = this.anchor_x;
    object["anchor_y"] = this.anchor_y;
    object["style"] = this.style;
    object["fontSize"] = this.fontSize;
    object["fontFace"] = this.fontFace;
    object["color"] = this.color;
    object["textAlign"] = this.textAlign;
    object["textBaseline"] = this.textBaseline;
    object["wordWrap"] = this.wordWrap;
    object["width"] = this.width;
    object["height"] = this.height;
    return object;
  };

  /**
   * Returns a JSON-string representing the properties of the Text.
   * @returns {string}
   */
  jaws.Text.prototype.toJSON = function() {
    return JSON.stringify(this.attributes());
  };

  return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.Text;
}
