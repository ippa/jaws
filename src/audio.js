var jaws = (function(jaws) {

    jaws.Audio = function Audio(options) {
        if (!(this instanceof arguments.callee))
            return new arguments.callee(options);

        if (typeof Audio !== "undefined") {
            this.set(options);
        }
        else {
            throw "Browser does not support Audio type!";
        }
    };

    jaws.Audio.prototype.default_options = {
        audio: null,
        audio_path: null,
        autoplay: false,
        loop: false,
        muted: false,
        paused: false,
        volume: 0,
        onend: null,
        onload: null,
        onplay: null,
        onpause: null,
        _constructor: null
    };

    jaws.Audio.prototype.set = function(options) {

        for (option in options) {
            this[option] = options[option];
        }

        if (this.audio) {
            this.setAudio(this.audio);
        }

        if (this.onload)
            this.audio.addEventListener("load", this.onload);
        if (this.onplay)
            this.audio.addEventListener("play", this.onplay);
        if (this.onpause)
            this.audio.addEventListener("pause", this.onpause);
        if (this.onend)
            this.audio.addEventListener("ended", this.onend);

        return this;
    };

    jaws.Audio.prototype.setAudio = function(value) {
        var that = this;
        if (jaws.assets.isLoaded(value)) {
            this.audio = new Audio();
            this.audio.setAttribute("src", value);
            this.audio_path = value;
            this.audio.load();

            if (this.autoplay)
                this.audio.autoplay = this.autoplay;
            
            this.currentTime = this.audio.currentTime;
            this.duration = this.audio.duration;
            this.audio.volume = this.volume;
            this.audio.loop = this.loop;
        }
        else {
            console.log("WARNING: Audio '" + value + "' not preloaded with jaws.assets.add().");
            jaws.assets.load(value, function() {
                that.audio = new Audio();
                that.audio.src = value;
                that.audio_path = this.audio.src;
                that.audio.load();
                this.currentTime = that.audio.currentTime;
                this.duration = that.audio.duration;
                that.audio.volume = this.volume;
                that.audio.loop = this.loop;
            });
        }

        return this;
    };
    jaws.Audio.prototype.play = function() {
        this.audio.play();
    };
    jaws.Audio.prototype.stop = function() {
        this.audio.pause();
        this.audio.currentTime = 0;
    };
    jaws.Audio.prototype.pause = function() {
        this.audio.pause();
    };

    jaws.Audio.prototype.toString = function() {
        return "[Audio " + this.audio.src + "," + this.audio.volume + "," + "]";
    }

    /** returns Audios state/properties as a pure object */
    jaws.Audio.prototype.attributes = function() {
        var object = this.options;                   // Start with all creation time properties
        object["_constructor"] = this._constructor || "jaws.Audio";
        object["audio"] = this.audio.src;
        object["autoplay"] = this.autoplay;
        object["loop"] = this.loop;
        object["muted"] = this.muted;
        object["paused"] = this.paused;
        object["volume"] = this.volume;
        
        return object;
    };

    jaws.Audio.prototype.toJSON = function() {
        return JSON.stringify(this.attributes());
    };

    return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
    module.exports = jaws.Audio;
}