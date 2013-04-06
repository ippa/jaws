var jaws = (function(jaws) {

    /*
     * @class A jaws.Text object with word-wrapping functionality.
     * @constructor
     *  
     * @property {int} x     Horizontal position  (0 = furthest left)
     * @property {int} y     Vertical position    (0 = top)
     * @property {int} alpha     Transparency: 0 (fully transparent) to 1 (no transperency)
     * @property {int} angle     Angle in degrees (0-360)
     * @property {bool} flipped    Flip sprite horizontally, usefull for sidescrollers
     * @property {string} anchor   String stating how to anchor the sprite to canvas, @see Sprite#anchor ("top_left", "center" etc)
     * @property {string} text       The actual text to be displayed 
     * @property {string} fontFace   A valid font-family
     * @property {int} fontSize      The size of the text in pixels
     * @property {string} textAlign      "start", "end", "left", "right", or "center"
     * @property {string} textBaseline       "top", "bottom", "hanging", "middle", "alphabetic", or "ideographic"
     * @property {int} width     The width of the rect() containing the text
     * @property {int} height    The height of the rect() containing the text
     * @property {string} style     The style to draw the text. Either "bold" or italic"
     * @property {bool} wordWrap     If true, will attempt to word-wrap text
     *                               If false, will attempt to draw text within width
     *
     * @example
     * // create new Text at top left of the screen,
     * new Text({text: "Hello world!", x: 0, y: 0, width: 500, height: 500, fontFace: "Terminal", fontSize: 50}) 
     */


    jaws.Text = function(options) {
        if (!(this instanceof arguments.callee))
            return new arguments.callee(options);

        this.set(options);

        if (options.context) {
            this.context = options.context;
        }
        else if (options.dom) {  // No canvas context? Switch to DOM-based spritemode
            this.dom = options.dom;
            this.createDiv();
        }
        if (!options.context && !options.dom) { // Defaults to jaws.context or jaws.dom
            if (jaws.context)
                this.context = jaws.context;
            else {
                this.dom = jaws.dom;
                this.createDiv();
            }
        }
    };

    jaws.Text.prototype.default_options = {
        x: 0,
        y: 0,
        alpha: 1,
        angle: 0,
        anchor_x: 0,
        anchor_y: 0,
        anchor: null,
        damping: 1,
        scale_x: 1,
        scale_y: 1,
        scale: 1,
        style: "",
        fontFace: "",
        fontSize: 12,
        color: "",
        textAlign: "",
        textBaseline: "",
        text: "",
        wordWrap: false,
        width: 0,
        height: 0,
        _constructor: null,
        dom: null
    };

    /** 
     * @private
     * Call setters from JSON object. Used to parse options.
     */
    jaws.Text.prototype.set = function(options) {

        jaws.parseOptions(this, options, this.default_options);

        if (this.scale)
            this.scale_x = this.scale_y = this.scale;

        if (this.anchor)
            this.setAnchor(this.anchor);

        this.text = options.text || "";
        this.fontFace = options.fontFace || "serif";
        this.fontSize = options.fontSize || 25;
        this.color = options.color || "black";
        this.textAlign = options.textAlign || "left";
        this.textBaseline = options.textBaseline || "alphabetic";
        this.style = options.style || "";
        this.wordWrap = options.wordWrap || false;
        this.width = options.width || jaws.width;
        this.height = options.height || jaws.height;

        this.cacheOffsets();

        return this;
    };

    /** 
     * @private
     *
     * Creates a new sprite from current sprites attributes()
     * Checks JawsJS magic property '_constructor' when deciding with which constructor to create it
     *
     */
    jaws.Text.prototype.clone = function(object) {
        var constructor = this._constructor ? eval(this._constructor) : this.constructor;
        var new_sprite = new constructor(this.attributes());
        new_sprite._constructor = this._constructor || this.constructor.name;
        return new_sprite;
    };

    /** Rotate sprite by value degrees */
    jaws.Text.prototype.rotate = function(value) {
        this.angle += value;
        return this;
    };
    /** Force an rotation-angle on sprite */
    jaws.Text.prototype.rotateTo = function(value) {
        this.angle = value;
        return this;
    };
    /** Set x/y */
    jaws.Text.prototype.moveTo = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    /** Modify x/y */
    jaws.Text.prototype.move = function(x, y) {
        if (x)
            this.x += x;
        if (y)
            this.y += y;
        return this;
    };
    /** 
     * scale sprite by given factor. 1=don't scale. <1 = scale down.  1>: scale up.
     * Modifies width/height. 
     **/
    jaws.Text.prototype.scaleAll = function(value) {
        this.scale_x *= value;
        this.scale_y *= value;
        this.fontSize *= value;
        return this.cacheOffsets();
    };
    /** set scale factor. ie. 2 means a doubling if sprite in both directions. */
    jaws.Text.prototype.scaleTo = function(value) {
        this.scale_x = this.scale_y = value;
        this.fontSize *= value;
        return this.cacheOffsets();
    };
    /** scale sprite horizontally by scale_factor. Modifies width. */
    jaws.Text.prototype.scaleWidth = function(value) {
        this.scale_x *= value;
        this.fontSize *= value;
        return this.cacheOffsets();
    };
    /** scale sprite vertically by scale_factor. Modifies height. */
    jaws.Text.prototype.scaleHeight = function(value) {
        this.scale_y *= value;
        this.fontSize *= value;
        return this.cacheOffsets();
    };

    /** Sets x */
    jaws.Text.prototype.setX = function(value) {
        this.x = value;
        return this;
    };
    /** Sets y */
    jaws.Text.prototype.setY = function(value) {
        this.y = value;
        return this;
    };

    /** Position sprites top on the y-axis */
    jaws.Text.prototype.setTop = function(value) {
        this.y = value + this.top_offset;
        return this;
    };
    /** Position sprites bottom on the y-axis */
    jaws.Text.prototype.setBottom = function(value) {
        this.y = value - this.bottom_offset;
        return this;
    };
    /** Position sprites left side on the x-axis */
    jaws.Text.prototype.setLeft = function(value) {
        this.x = value + this.left_offset;
        return this;
    };
    /** Position sprites right side on the x-axis */
    jaws.Text.prototype.setRight = function(value) {
        this.x = value - this.right_offset;
        return this;
    };

    /** Set new width. Scales sprite. */
    jaws.Text.prototype.setWidth = function(value) {
        this.scale_x = value / this.width;
        return this.cacheOffsets();
    };
    /** Set new height. Scales sprite. */
    jaws.Text.prototype.setHeight = function(value) {
        this.scale_y = value / this.height;
        return this.cacheOffsets();
    };
    /** Resize sprite by adding width */
    jaws.Text.prototype.resize = function(width, height) {
        this.scale_x = (this.width + width) / this.width;
        this.scale_y = (this.height + height) / this.height;
        return this.cacheOffsets();
    };
    /** 
     * Resize sprite to exact width/height 
     */
    jaws.Text.prototype.resizeTo = function(width, height) {
        this.scale_x = width / this.width;
        this.scale_y = height / this.height;
        return this.cacheOffsets();
    };

    /**
     * The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
     * or "when rotating, what point of the of the sprite will it rotate round"
     *
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

        if (a = anchors[value]) {
            this.anchor_x = a[0];
            this.anchor_y = a[1];
        }
        return this;
    };

    /** @private */
    jaws.Text.prototype.cacheOffsets = function() {

        this.width = this.width * this.scale_x;
        this.height = this.height * this.scale_y;
        this.left_offset = this.width * this.anchor_x;
        this.top_offset = this.height * this.anchor_y;
        this.right_offset = this.width * (1.0 - this.anchor_x);
        this.bottom_offset = this.height * (1.0 - this.anchor_y);

        if (this.cached_rect)
            this.cached_rect.resizeTo(this.width, this.height);
        return this;
    };

    /** Returns a jaws.Rect() perfectly surrouning sprite. Also cache rect in this.cached_rect. */
    jaws.Text.prototype.rect = function() {
        if (!this.cached_rect && this.width)
            this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
        if (this.cached_rect)
            this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
        return this.cached_rect;
    }

    /**
     * Make this sprite a DOM-based <div> sprite 
     * @private
     */
    jaws.Text.prototype.createDiv = function() {
        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.width = this.width + "px";
        this.div.style.height = this.height + "px";
        this.div.style.fontSize = this.fontSize + "px";
        this.div.style.fontFamily = this.fontFace;
        
        if(this.textAlign === "start")
            this.div.style.textAlign = "left";
        else if(this.textAlign === "end")
            this.div.style.textAlign = "right";
        else
            this.div.style.textAlign = this.textAlign;
        
        if(this.textBaseline === "top")
            this.div.style.verticalAlign = "super";
        else if(this.textBaseline === "hanging")
            this.div.style.verticalAlign = "text-top";
        else if(this.textBaseline === "alphabetic")
            this.div.style.verticalAlign = "bottom";
        else if(this.div.style.verticalAlign === "ideographic")
            this.div.style.verticalAlign = "text-bottom";
        else
            this.div.style.verticalAlign = this.textBaseline;
        
        if (this.div.innerText) {
            this.div.innerText = this.text;
        }
        else {
            this.div.textContent = this.text;
        }

        if (this.dom) {
            this.dom.appendChild(this.div);
        }

        this.updateDiv();
    };

    /** 
     * @private
     * Update properties for DOM-based sprite 
     */
    jaws.Text.prototype.updateDiv = function() {
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";

        var transform = "";
        transform += "rotate(" + this.angle + "deg) ";
        if (this.flipped) {
            transform += "scale(-" + this.scale_x + "," + this.scale_y + ")";
        }
        else {
            transform += "scale(" + this.scale_x + "," + this.scale_y + ")";
        }

        this.div.style.MozTransform = transform;
        this.div.style.WebkitTransform = transform;
        this.div.style.OTransform = transform;
        this.div.style.msTransform = transform;
        this.div.style.transform = transform;

        return this;
    };

    /** Draw sprite on active canvas or update it's DOM-properties */
    jaws.Text.prototype.draw = function() {
        if (this.dom) {
            return this.updateDiv();
        }
        this.context.save();
        this.context.translate(this.x, this.y);
        if (this.angle !== 0) {
            this.context.rotate(this.angle * Math.PI / 180);
        }
        this.flipped && this.context.scale(-1, 1);
        this.context.globalAlpha = this.alpha;
        this.context.translate(-this.left_offset, -this.top_offset); // Needs to be separate from above translate call cause of flipped
        this.context.fillStyle = this.color;
        this.context.font = this.style + " " + this.fontSize + "px " + this.fontFace;
        this.context.textBaseline = this.textBaseline;
        this.context.textAlign = this.textAlign;
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
     * For certain browsers, a canvas context is faster to work with then a pure image.
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
     * Returns sprite as a canvas
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

    jaws.Text.prototype.toString = function() {
        return "[Text " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]";
    };

    /** returns Texts state/properties as a pure object */
    jaws.Text.prototype.attributes = function() {
        var object = this.options;                  // Start with all creation time properties
        object["_constructor"] = this._constructor || "jaws.Text";
        object["x"] = parseFloat(this.x.toFixed(2));
        object["y"] = parseFloat(this.y.toFixed(2));
        object["text"] = this.text;
        object["alpha"] = this.alpha;
        object["flipped"] = this.flipped;
        object["angle"] = parseFloat(this.angle.toFixed(2));
        object["scale_x"] = this.scale_x;
        object["scale_y"] = this.scale_y;
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
     * returns a JSON-string representing the state of the Text.
     *
     * Use this to serialize your sprites / game objects, maybe to save in local storage or on a server
     *
     * jaws.game_states.Edit uses this to export all edited objects.
     *
     */
    jaws.Text.prototype.toJSON = function() {
        return JSON.stringify(this.attributes())
    };

    return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
    module.exports = jaws.Text;
}