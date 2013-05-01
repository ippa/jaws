var jaws = (function(jaws) {

    jaws.Recorder = function(options) {
        if (!(this instanceof arguments.callee))
            return new arguments.callee(options);
        this.set(options);
        this.context = jaws.context;
    };
    jaws.Recorder.prototype.default_options = {
        x: 0,
        y: 0,
        frames: [],
        width: 0,
        height: 0,
        _constructor: null,
        dom: null
    };
    /** 
     * @private
     * Call setters from JSON object. Used to parse options.
     */
    jaws.Recorder.prototype.set = function(options) {

        for (option in options) {
            this[option] = (options[option] !== undefined) ? options[option] : this.default_options[option];
        }

        if (!this.width) {
            this.width = jaws.canvas.width;
        }
        if (!this.height) {
            this.height = jaws.canvas.height;
        }

        this.frames = new Array();

        return this;
    };

    jaws.Recorder.prototype.rect = function() {
        this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
        return this.cached_rect;
    };

    jaws.Recorder.prototype.save = function()
    {
        this.frames.push({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            data: jaws.canvas.toDataURL()});
        return this;
    };
    jaws.Recorder.prototype.draw = function()
    {
        if (this.frames.length > 0)
        {
            var temp = new Image();
            temp.src = this.frames[0].data;

            this.context.save();
            this.context.drawImage(temp, 0, 0, this.frames[0].width, this.frames[0].height);
            this.context.restore();
            this.frames.shift();
        }
        return this;
    };

    return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
    module.exports = jaws.Recorder;
}