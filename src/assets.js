var jaws = (function(jaws) {
  /**
   * @fileOverview jaws.assets properties and functions
   * 
   * Loads and processes image, sound, video, and json assets
   * (Used internally by JawsJS to create <b>jaws.assets</b>)
   * 
   * @class Jaws.Assets
   * @constructor
   * @property {boolean}    bust_cache              Add a random argument-string to assets-urls when loading to bypass any cache
   * @property {boolean}    fuchia_to_transparent   Convert the color fuchia to transparent when loading .bmp-files
   * @property {boolean}    image_to_canvas         Convert all image assets to canvas internally
   * @property {string}     root                    Rootdir from where all assets are loaded
   * @property {array}      file_type               Listing of file postfixes and their associated types
   * @property {array}      can_play                Listing of postfixes and (during runtime) populated booleans 
   */
  jaws.Assets = function Assets() {
    if (!(this instanceof arguments.callee))
      return new arguments.callee();

    var self = this;

    self.loaded = [];
    self.loading = [];
    self.src_list = [];
    self.data = [];

    self.bust_cache = false;
    self.image_to_canvas = true;
    self.fuchia_to_transparent = true;
    self.root = "";

    self.file_type = {};
    self.file_type["json"] = "json";
    self.file_type["wav"] = "audio";
    self.file_type["mp3"] = "audio";
    self.file_type["ogg"] = "audio";
    self.file_type['m4a'] = "audio";
    self.file_type['weba'] = "audio";
    self.file_type['aac'] = "audio";
    self.file_type['mka'] = "audio";
    self.file_type['flac'] = "audio";
    self.file_type["png"] = "image";
    self.file_type["jpg"] = "image";
    self.file_type["jpeg"] = "image";
    self.file_type["gif"] = "image";
    self.file_type["bmp"] = "image";
    self.file_type["tiff"] = "image";
    self.file_type['mp4'] = "video";
    self.file_type['webm'] = "video";
    self.file_type['ogv'] = "video";
    self.file_type['mkv'] = "video";

    var audioTest = new Audio();
    var videoTest = document.createElement('video');
    self.can_play = {};
    self.can_play["wav"] = !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
    self.can_play["ogg"] = !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
    self.can_play["mp3"] = !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');
    self.can_play["m4a"] = !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, '');
    self.can_play["weba"] = !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '');
    self.can_play["aac"] = !!audioTest.canPlayType('audio/aac;').replace(/^no$/, '');
    self.can_play["mka"] = !!audioTest.canPlayType('audio/x-matroska;').replace(/^no$/, '');
    self.can_play["flac"] = !!audioTest.canPlayType('audio/x-flac;').replace(/^no$/, '');
    self.can_play["mp4"] = !!videoTest.canPlayType('video/mp4;').replace(/^no$/, '');
    self.can_play["webm"] = !!videoTest.canPlayType('video/webm; codecs="vorbis"').replace(/^no$/, '');
    self.can_play["ogv"] = !!videoTest.canPlayType('video/ogg; codecs="vorbis"').replace(/^no$/, '');
    self.can_play["mkv"] = !!videoTest.canPlayType('video/x-matroska;').replace(/^no$/, '');

    /**
     * Returns the length of the resource list
     * @public
     * @returns {number}  The length of the resource list
     */
    self.length = function() {
      return self.src_list.length;
    };

    /**
     * Get one or more resources from their URLs
     * @public
     * @param   {string|array} src The resource(s) to retrieve 
     * @returns {array|object} Array or single resource if found in cache. Undefined otherwise.
     */
    self.get = function(src) {
      if (jaws.isArray(src)) {
        return src.map(function(i) {
          return self.data[i];
        });
      }
      else if (jaws.isString(src)) {
        if (self.loaded[src]) {
          return self.data[src];
        } else {
          jaws.log.warn("No such asset: " + src, true);
        }
      }
      else {
        jaws.log.error("jaws.get: Neither String nor Array. Incorrect URL resource " + src);
        return;
      }
    };

    /**
     * Returns if specified resource is currently loading or not
     * @public 
     * @param {string} src Resource URL
     * @return {boolean|undefined} If resource is currently loading. Otherwise, undefined. 
     */
    self.isLoading = function(src) {
      if (jaws.isString(src)) {
        return self.loading[src];
      } else {
        jaws.log.error("jaws.isLoading: Argument not a String with " + src);
      }
    };

    /** 
     * Returns if specified resource is loaded or not
     * @param src Source URL
     * @return {boolean|undefined} If specified resource is loaded or not. Otherwise, undefined.
     */
    self.isLoaded = function(src) {
      if (jaws.isString(src)) {
        return self.loaded[src];
      } else {
        jaws.log.error("jaws.isLoaded: Argument not a String with " + src);
      }
    };

    /**
     * Returns lowercase postfix of specified resource
     * @public
     * @param {string} src Resource URL
     * @returns {string} Lowercase postfix of resource
     */
    self.getPostfix = function(src) {
      if (jaws.isString(src)) {
        return src.toLowerCase().match(/.+\.([^?]+)(\?|$)/)[1];
      } else {
        jaws.log.error("jaws.assets.getPostfix: Argument not a String with " + src);
      }
    };

    /**
     * Determine type of file (Image, Audio, or Video) from its postfix
     * @private
     * @param {string} src Resource URL
     * @returns {string} Matching type {Image, Audio, Video} or the postfix itself
     */
    function getType(src) {
      if (jaws.isString(src)) {
        var postfix = self.getPostfix(src);
        return (self.file_type[postfix] ? self.file_type[postfix] : postfix);
      } else {
        jaws.log.error("jaws.assets.getType: Argument not a String with " + src);
      }
    }

    /**
     * Add URL(s) to asset listing for later loading
     * @public
     * @param {string|array} src The resource URL(s) to add to the asset listing
     * @example
     * jaws.assets.add("player.png")
     * jaws.assets.add(["media/bullet1.png", "media/bullet2.png"])
     * jaws.assets.loadAll({onfinish: start_game})
     */
    self.add = function(src) {
      if (jaws.isArray(src)) {
        src.forEach(function(item) {
          self.add(item);
        });
      } else if (jaws.isString(src)) {
        self.src_list.push(src);
      } else {
        jaws.log.error("jaws.assets.add: Neither String nor Array. Incorrect URL resource " + src);
      }
    };

    /**
     * Iterate through the list of resource URL(s) and load each in turn.
     * @public
     * @param {Object} options Object-literal of callback functions
     * @config {function} [options.onload] The function to be called when loading
     * @config {function} [options.onerror] The function to be called if an error occurs
     * @config {function} [options.onfinish] The function to be called when finished 
     */
    self.loadAll = function(options) {
      self.load_count = 0;
      self.error_count = 0;

      if (options.onload && jaws.isFunction(options.onload))
        self.onload = options.onload;

      if (options.onerror && jaws.isFunction(options.onerror))
        self.onerror = options.onerror;

      if (options.onfinish && jaws.isFunction(options.onfinish))
        self.onfinish = options.onfinish;

      self.src_list.forEach(function(item) {
        self.load(item);
      });
    };

    /** 
     * Loads a single resource from its given URL
     * Will attempt to match a resource to known MIME types.
     * If unknown, loads the file as a blob-object.
     * 
     * @public
     * @param {string} src Resource URL
     * @param {function} [onload] Function to be called when loading
     * @param {function} [onerror] Function to be called if an error occurs
     * @example
     * jaws.load("media/foo.png")
     * jaws.load("http://place.tld/foo.png")
     */
    self.load = function(src, onload, onerror) {

      if (!jaws.isString(src)) {
        jaws.log.error("jaws.assets.load: Argument not a String with " + src);
        return;
      }

      var asset = {};
      var resolved_src = "";
      asset.src = src;
      asset.onload = onload;
      asset.onerror = onerror;
      self.loading[src] = true;
      var parser = RegExp('^((f|ht)tp(s)?:)?//');
      if (parser.test(src)) {
        resolved_src = asset.src;
      } else {
        resolved_src = self.root + asset.src;
      }
      if (self.bust_cache) {
        resolved_src += "?" + parseInt(Math.random() * 10000000);
      }

      var type = getType(asset.src);
      if (type === "image") {
        try {
          asset.image = new Image();
          asset.image.asset = asset;
          asset.image.addEventListener('load', assetLoaded);
          asset.image.addEventListener('error', assetError);
          asset.image.src = resolved_src;
        } catch (e) {
          jaws.log.error("Cannot load Image resource " + resolved_src +
                  " (Message: " + e.message + ", Name: " + e.name + ")");
        }
      } else if (self.can_play[self.getPostfix(asset.src)]) {
        if (type === "audio") {
          try {
            asset.audio = new Audio();
            asset.audio.asset = asset;
            asset.audio.addEventListener('error', assetError);
            asset.audio.addEventListener('canplay', assetLoaded);
            self.data[asset.src] = asset.audio;
            asset.audio.src = resolved_src;
            asset.audio.load();
          } catch (e) {
            jaws.log.error("Cannot load Audio resource " + resolved_src +
                    " (Message: " + e.message + ", Name: " + e.name + ")");
          }
        } else if (type === "video") {
          try {
            asset.video = document.createElement('video');
            asset.video.asset = asset;
            self.data[asset.src] = asset.video;
            asset.video.setAttribute("style", "display:none;");
            asset.video.addEventListener('error', assetError);
            asset.video.addEventListener('canplay', assetLoaded);
            document.body.appendChild(asset.video);
            asset.video.src = resolved_src;
            asset.video.load();
          } catch (e) {
            jaws.log.error("Cannot load Video resource " + resolved_src +
                    " (Message: " + e.message + ", Name: " + e.name + ")");
          }
        }
      } else {
        try {
          var req = new XMLHttpRequest();
          req.asset = asset;
          req.onreadystatechange = assetLoaded;
          req.onerror = assetError;
          req.open('GET', resolved_src, true);
          if (type !== "json")
            req.responseType = "blob";
          req.send(null);
        } catch (e) {
          jaws.log.error("Cannot load " + resolved_src +
                  " (Message: " + e.message + ", Name: " + e.name + ")");
        }
      }
    };

    /** 
     * Initial loading callback for all assets for parsing specific filetypes or
     *  optionally converting images to canvas-objects.
     * @private
     * @param {EventObject} event The EventObject populated by the calling event
     * @see processCallbacks()
     */
    function assetLoaded(event) {
      var asset = this.asset;
      var src = asset.src;
      var filetype = getType(asset.src);
      self.loaded[src] = true;
      self.loading[src] = false;

      try {
        if (filetype === "json") {
          if (this.readyState !== 4) {
            return;
          }
          self.data[asset.src] = JSON.parse(this.responseText);
        }
        else if (filetype === "image") {
          var new_image = self.image_to_canvas ? jaws.imageToCanvas(asset.image) : asset.image;
          if (self.fuchia_to_transparent && self.getPostfix(asset.src) === "bmp")
          {
            new_image = fuchiaToTransparent(new_image);
          }
          self.data[asset.src] = new_image;
        }
        else if (filetype === "audio" && self.can_play[self.getPostfix(asset.src)]) {
          self.data[asset.src] = asset.audio;
        }
        else if (filetype === "video" && self.can_play[self.getPostfix(asset.src)]) {
          self.data[asset.src] = asset.video;
        } else {
          self.data[asset.src] = this.response;
        }
      } catch (e) {
        jaws.log.error("Cannot process " + src +
                  " (Message: " + e.message + ", Name: " + e.name + ")");
        self.data[asset.src] = null;
      }
      self.load_count++;
      processCallbacks(asset, true, event);
    }

    /**
     * Increases the error count and calls processCallbacks with false flag set
     * @see processCallbacks()
     * @private 
     * @param {EventObject} event The EventObject populated by the calling event
     */
    function assetError(event) {
      var asset = this.asset;
      self.error_count++;
      processCallbacks(asset, false, event);
    }

    /** 
     * Processes (if set) the callbacks per resource
     * @private
     * @param {object} asset The asset to be processed
     * @param {boolean} ok If an error has occured with the asset loading
     * @param {EventObject} event The EventObject populated by the calling event
     * @see jaws.start() in core.js
     */
    function processCallbacks(asset, ok, event) {
      var percent = parseInt((self.load_count + self.error_count) / self.src_list.length * 100);

      if (ok) {
        if (self.onload)
          self.onload(asset.src, percent);
        if (asset.onload)
          asset.onload(event);
      }
      else {
        if (self.onerror)
          self.onerror(asset.src, percent);
        if (asset.onerror)
          asset.onerror(event);
      }

      if (percent === 100) {
        if (self.onfinish) {
          self.onfinish();
        }
        self.onload = null;
        self.onerror = null;
        self.onfinish = null;
      }
    }

    /**
     * Displays the progress of asset handling as an overall percentage of all loading
     * (Can be overridden as jaws.assets.displayProgress = function(percent_done) {})
     * @public
     * @param {number} percent_done The overall percentage done across all resource handling
     */
    self.displayProgress = function(percent_done) {

      if (!jaws.isNumber(percent_done))
        return;

      if (!jaws.context)
        return;

      jaws.context.save();
      jaws.context.fillStyle = "black";
      jaws.context.fillRect(0, 0, jaws.width, jaws.height);

      jaws.context.fillStyle = "white";
      jaws.context.strokeStyle = "white";
      jaws.context.textAlign = "center";

      jaws.context.strokeRect(50 - 1, (jaws.height / 2) - 30 - 1, jaws.width - 100 + 2, 60 + 2);
      jaws.context.fillRect(50, (jaws.height / 2) - 30, ((jaws.width - 100) / 100) * percent_done, 60);

      jaws.context.font = "11px verdana";
      jaws.context.fillText("Loading... " + percent_done + "%", jaws.width / 2, jaws.height / 2 - 35);

      jaws.context.font = "11px verdana";
      jaws.context.fillStyle = "#ccc";
      jaws.context.textBaseline = "bottom";
      jaws.context.fillText("powered by www.jawsjs.com", jaws.width / 2, jaws.height - 1);

      jaws.context.restore();
    };
  };

  /** 
   * Make Fuchia (0xFF00FF) transparent (BMPs ONLY)
   * @private
   * @param {HTMLImageElement} image The Bitmap Image to convert
   * @returns {CanvasElement} canvas The translated CanvasElement 
   */
  function fuchiaToTransparent(image) {

    if (!jaws.isImage(image))
      return;

    var canvas = jaws.isImage(image) ? jaws.imageToCanvas(image) : image;
    var context = canvas.getContext("2d");
    var img_data = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = img_data.data;
    for (var i = 0; i < pixels.length; i += 4) {
      if (pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255) { // Color: Fuchia
        pixels[i + 3] = 0; // Set total see-through transparency
      }
    }

    context.putImageData(img_data, 0, 0);
    return canvas;
  }

  jaws.assets = new jaws.Assets();
  return jaws;
})(jaws || {});

