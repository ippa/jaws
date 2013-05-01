var jaws = (function(jaws) {

    /**
     * @class An Audio class that will try to detect filetype support and load the correct file.
     * @constructor
     *  
     * @property {array,object} audio   An array of file locations initally; replaced with an Audio() object
     * @property {string}	audio_path     The path to file matching the first supported filetype
     * @property {bool}	autoplay     Whether to start playing immediately after loading or not
     * @property {bool}	loop	Whether to loop the playing or not
     * @property {bool}	muted	Whether to mute the audio or not
     * @property {bool}	paused	Whether the audio is muted or not
     * @property {int}	volume	Current audio volume, between 0.1 and 1.0
     * @property {function}	onend	Callback on "end" event for audio
     * @property {function}	onload	Callback on "load" event for audio
     * @property {function}	onplay	Callback on "play" event for audio
     * @property {function}	onpause	Callback on "pause" event for audio
     *
     * @example
     * new jaws.Audio({audio: ["file.mp3", "file.ogg"], volume: 1.0}); 
     * 
     *
     */
    
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

        jaws.parseOptions(this, options, this.default_options);

        if (this.audio) {
            var canPlayType = false;
            var audioTest = new Audio();

            for (var i = 0; i < this.audio.length; i++) {
                var ext = this.audio[i].toLowerCase().match(/.+\.([^?]+)(\?|$)/);
                switch (ext[1]) {
                    case 'mp3':
                        canPlayType = !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');
                        break;
                    case 'ogg':
                        canPlayType = !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
                        break;
                    case 'wav':
                        canPlayType = !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
                        break;
                    case 'm4a':
                        canPlayType = !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, '');
                        break;
                    case 'weba':
                        canPlayType = !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '');
                        break;
                }

                if (canPlayType)
                {
                    this.setAudio(this.audio[i]);

                    if (this.onload)
                        this.audio.addEventListener("load", this.onload);
                    if (this.onplay)
                        this.audio.addEventListener("play", this.onplay);
                    if (this.onpause)
                        this.audio.addEventListener("pause", this.onpause);
                    if (this.onend)
                        this.audio.addEventListener("ended", this.onend);
                    break;
                }
            }
        }
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
    jaws.Audio.prototype.mute = function() {
        this.audio.mute = true;
    };
    jaws.Audio.prototype.unmute = function() {
        this.audio.mute = false;
    };
    jaws.Audio.prototype.seekTo = function(value) {
        if (value <= this.audio.duration)
            this.audio.currentTime = value;
        else
            this.audio.currentTime = this.audio.duration;
    };
    jaws.Audio.prototype.setVolume = function(value) {
        if(value <= 1.0 && value >= 0)
            this.audio.volume = value;
    };

    jaws.Audio.prototype.toString = function() {
        return "[Audio " + this.audio.src + "," + this.audio.currentTime + "," + this.audio.duration + "," + this.audio.volume + "]";
    };

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