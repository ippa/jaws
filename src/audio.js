/**
 * @fileOverview A jaws.Audio object that detects and loads supported filetypes
 * 
 * The jaws.Audio object uses jaws.assets to determine if a particular
 *  reported MIME audio filetype can be played within the current enviroment.
 *  
 *  Note: If loading fails at any point or no supported types were found,
 *        the 'audio' property is set to null. 
 * 
 * @see jaws.assets.file_type
 * @see jaws.assets.can_play
 * 
 * @class jaws.Audio
 * @property {array|string|Audio|null}   audio   A string or array of file locations initally; 
 *                                               replaced with an Audio object if loading was successful
 *
 * @example
 * var audio = new jaws.Audio({audio: ["file.mp3", "file.ogg"], volume: 1.0});
 * 
 * audio.play() //Assuming either MP3 or OGG is supported
 *  
 * //Because play(), stop(), and other audio functions will log an error 
 * // if 'audio' is not an Audio object, its load status can be checked too. 
 * 
 * if(audio.isLoaded()) {
 *   audio.play(); 
 * }
 * 
 */
var jaws = (function(jaws) {

  /**
   * jaws.Audio object
   * @constructor
   * @param {object} options Object-literal of constructor properties
   * @param {bool}         [options.loop]        Whether to initially loop the playing or not
   * @param {bool}         [options.mute]        Whether to initially mute the audio or not
   * @param {bool}         [options.pause]       Whether to initially pause the audio or not
   * @param {bool}         [options.autoplay]    Whether to start playing after loading
   * @param {int}          [options.volume]      Initial audio volume, between 0.1 and 1.0
   * @param {function}     [options.onend]       Initial callback on "end" event for audio
   * @param {function}     [options.onplay]      Initial callback on "play" event for audio
   * @param {function}     [options.onpause]     Initial callback on "pause" event for audio
   * @see jaws.audio.set()
   */
  jaws.Audio = function Audio(options) {
    if (!(this instanceof arguments.callee))
      return new arguments.callee(options);

    if (typeof Audio !== "undefined") {
      this.set(options);
    } else {
      jaws.log.error("jaws.Audio (constructor): 'Audio' object does not exist.");
      this.audio = null;
    }
  };

  /**
   * The default properties and their values
   * @type {object}
   */
  jaws.Audio.prototype.default_options = {
    audio: null,
    autoplay: false,
    loop: false,
    volume: 0,
    onend: null,
    onplay: null,
    onpause: null,
    _constructor: null
  };

  /**
   * Compares default_options to the constructor options and loads an audio resource if able
   * @param {object} options Object-literal of constructor properties
   * @this {jaws.Audio}
   * @returns {object} The 'this' scope of the calling instance of an jaws.Audio object
   */
  jaws.Audio.prototype.set = function(options) {

    jaws.parseOptions(this, options, this.default_options);

    if (this.audio) {
      if (jaws.isString(this.audio)) {
        var type = jaws.assets.getPostfix(this.audio);
        if (jaws.assets.file_type[type] && jaws.assets.can_play[type]) {
          this.setAudio(this.audio);
        } else {
          jaws.log.warn("jaws.Audio.set: Unknown or unplayable MIME filetype.");
          this.audio = null;
        }
      } else if (jaws.isArray(this.audio)) {
        for (var i = 0; i < this.audio.length; i++) {
          if (jaws.isString(this.audio[i])) {
            var type = jaws.assets.getPostfix(this.audio[i]);
            if (jaws.assets.file_type[type] && jaws.assets.can_play[type]) {
              this.setAudio(this.audio[i]);
              break;
            }
          }
        }

        if (!(this.audio instanceof Audio)) {
          jaws.log.warn("jaws.Audio.set: No known or playable MIME filetypes were found.");
          this.audio = null;
        }
        
      } else {
        jaws.log.error("jaws.Audio.set: Passed in 'audio' property is neither a String nor Array");
        this.audio = null;
      }
    }
    return this;
  };

  /**
   * Loads a reference from the jaws.assets cache or requests that an Audio resource URL be loaded
   * @param {type} value
   * @this {jaws.Audio}
   * @returns {object} The 'this' scope of the calling instance of an jaws.Audio object
   */
  jaws.Audio.prototype.setAudio = function(value) {
    var self = this;
    if (jaws.assets.isLoaded(value)) {
      var audio = jaws.assets.get(value);
      if (audio instanceof Audio) {
        this.audio = audio;

        if (this.volume >= 0 && this.volume <= 1.0 && jaws.isNumber(this.volume))
          this.audio.volume = this.volume;

        if (this.loop)
          this.audio.loop = this.loop;

        if (this.onend && jaws.isFunction(this.onend)) {
          this.audio.addEventListener('end', this.onend);
        }

        if (this.onplay && jaws.isFunction(this.onplay)) {
          this.audio.addEventListener('play', this.onplay);
        }

        if (this.onpause && jaws.isFunction(this.onplay)) {
          this.audio.addEventListener('pause', this.onpause);
        }

        if (this.autoplay)
          this.audio.autoplay = this.autoplay;

      } else {
        this.audio = null;
      }
    } else {
      jaws.log.warn("jaws.Audio.setAudio: Audio '" + value + "' not preloaded with jaws.assets.add().");
      jaws.assets.load(value, function() {
        var audio = jaws.assets.get(value);
        if (audio instanceof Audio) {
          self.audio = audio;

          if (self.volume >= 0 && self.volume <= 1.0 && jaws.isNumber(self.volume))
            self.audio.volume = self.volume;

          if (self.loop)
            self.audio.loop = self.loop;

          if (self.hasOwnProperty("onend") && jaws.isFunction(self.onend)) {
            self.audio.addEventListener('end', self.onend);
          }

          if (self.hasOwnProperty("onplay") && jaws.isFunction(self.onplay)) {
            self.audio.addEventListener('play', self.onplay);
          }

          if (self.hasOwnProperty("onpause") && jaws.isFunction(self.onplay)) {
            self.audio.addEventListener('pause', self.onpause);
          }

          if (self.autoplay)
            self.audio.autoplay = self.autoplay;

        } else {
          self.audio = null;
        }
      }, function() {
        jaws.log.error("jaws.Audio.setAudio: Could not load Audio resource URL " + value);
        self.audio = null;
      });
    }
    return this;
  };

  /**
   * Plays audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.play = function() {
    if (this.audio instanceof Audio) {
      this.audio.play();
    } else {
      jaws.log.error("jaws.Audio.play: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Stops audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.stop = function() {
    if (this.audio instanceof Audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      jaws.log.error("jaws.Audio.stop: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Pauses audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.pause = function() {
    if (this.audio instanceof Audio) {
      this.audio.pause();
    } else {
      jaws.log.error("jaws.Audio.pause: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Mutes the audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.mute = function() {
    if (this.audio instanceof Audio) {
      this.audio.mute = true;
    } else {
      jaws.log.error("jaws.Audio.mute: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Unmute the audio
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.unmute = function() {
    if (this.audio instanceof Audio) {
      this.audio.mute = false;
    } else {
      jaws.log.error("jaws.Audio.unmute: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Seeks to a position in audio
   * @param {type} value
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.seekTo = function(value) {
    if (this.audio instanceof Audio) {
      if (jaws.isNumber(value)) {
        if (value <= this.audio.duration) {
          this.audio.currentTime = value;
        } else {
          this.audio.currentTime = this.audio.duration;
        }
      }
    } else {
      jaws.log.warn("jaws.Audio.seekTo: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Sets the volume of the audio
   * @param {type} value The new volume within the range 0.0 to 1.0
   * @this {jaws.Audio}
   */
  jaws.Audio.prototype.setVolume = function(value) {
    if (this.audio instanceof Audio) {
      if (jaws.isNumber(value) && value <= 1.0 && value >= 0) {
        this.audio.volume = value;
      }
    } else {
      jaws.log.warn("jaws.Audio: jaws.setVolume: Either 'audio' was loaded incorrectly or does not exist");
    }
  };

  /**
   * Returns if 'audio' is actually an Audio object
   */
  jaws.Audio.prototype.isLoaded = function() {
    return (this.audio instanceof Audio);
  };

  /**
   * Returns a String containing value properties
   * @this {jaws.Audio}
   * @returns {String}
   */
  jaws.Audio.prototype.toString = function() {
    var properties = "[Audio ";
    if (this.audio instanceof Audio) {
      properties += this.audio.src + ", ";
      properties += this.audio.currentTime + ", ";
      properties += this.audio.duration + ", ";
      properties += this.audio.volume + " ]";
    } else {
      properties += null + " ]";
    }
    return properties;
  };

  /**
   * Returns an object created with values from 'this' properties
   * @this {jaws.Audio}
   * @returns {object}
   */
  jaws.Audio.prototype.attributes = function() {
    var object = this.options;
    object["_constructor"] = this._constructor || "jaws.Audio";

    if (this.audio instanceof Audio) {
      object["audio"] = this.audio.src;
      object["loop"] = this.loop;
      object["muted"] = this.audio.muted;
      object["volume"] = this.audio.volume;
    } else {
      object["audio"] = null;
    }

    if (this.hasOwnProperty("autoplay"))
      object["autoplay"] = this.autoplay;

    return object;
  };

  /**
   * Return the properties of the current object as a JSON-encoded string
   * @this {jaws.Audio}
   * @returns {string} The properties of the jaws.Audio object as a JSON-encoded string
   */
  jaws.Audio.prototype.toJSON = function() {
    return JSON.stringify(this.attributes());
  };

  return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.Audio;
}