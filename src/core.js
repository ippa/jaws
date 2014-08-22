/**
 * @namespace JawsJS core functions.
 *
 * Jaws, a HTML5 canvas/javascript 2D game development framework
 *
 * Homepage:      http://jawsjs.com/
 * Source:        http://github.com/ippa/jaws/
 * Documentation: http://jawsjs.com/docs/
 *
 * Works with:  Chrome 6.0+, Firefox 3.6+, 4+, IE 9+
 * License: LGPL - http://www.gnu.org/licenses/lgpl.html
 *
 * Jaws uses the "module pattern". 
 * Adds 1 global, <b>jaws</b>, so plays nice with all other JS libs.
 *  
 * Formating guide:
 *   jaws.oneFunction()
 *   jaws.one_variable = 1
 *   new jaws.OneConstructor
 *
 * @property {int}      mouse_x     Mouse X position with respect to the canvas-element
 * @property {int}      mouse_y     Mouse Y position with respect to the canvas-element
 * @property {canvas}   canvas      The detected/created canvas-element used for the game
 * @property {context}  context     The detected/created canvas 2D-context, used for all draw-operations
 * @property {int}      width       Width of the canvas-element
 * @property {int}      height      Height of the canvas-element
 */
var jaws = (function(jaws) {

  var title;
  var log_tag;

  /*
  * Placeholders for constructors in extras-dir. We define the constructors here to be able to give ppl better error-msgs.
  * When the correct from extras-dir is included, these will be overwritten.
  *
  */
  //jaws.Parallax = function() { throw("To use jaws.Parallax() you need to include src/extras/parallax.js") }
  //jaws.QuadTree = function() { throw("To use QuadTree() you need to include src/extras/quadtree.js") }
  //jaws.PixelMap = function() { throw("To use PixelMap() you need to include src/extras/pixel_map.js") }
  //jaws.TileMap = function() { throw("To use TileMap() you need to include src/extras/tile_map.js") }
  jaws.SpriteList = function() { throw("To use SpriteList() you need to include src/extras/sprite_list.js") }
  jaws.Audio = function() { throw("To use jaws.Audio() you need to include src/extras/audio.js") }

  /**
   * Returns or sets contents of title's innerHTML
   * @private
   * @param   {type}   value  The new value to set the innerHTML of title
   * @returns {string}        The innerHTML of title
   */
  jaws.title = function(value) {

    if (!jaws.isString(value)) {
      jaws.log.error("jaws.title: Passed in value is not a String.");
      return;
    }

    if (value) {
      return (title.innerHTML = value);
    }
    return title.innerHTML;
  };

  /**
   * Unpacks Jaws core-constructors into the global namespace.
   * If a global property is already taken, a warning will be written to jaws log.
   */
  jaws.unpack = function() {
    var make_global = ["Sprite", "SpriteList", "Animation", "Viewport", "SpriteSheet", "Parallax", "TileMap", "pressed", "QuadTree"];

    make_global.forEach(function(item) {
      if (window[item]) {
        jaws.log.warn("jaws.unpack: " + item + " already exists in global namespace.");
      }
      else {
        window[item] = jaws[item];
      }
    });
  };

  /**
   * Writes messages to either log_tag (if set) or console.log (if available)
   * @param   {string}  msg     The string to write
   * @param   {boolean} append  If messages should be appended or not
   */
  jaws.log = function(msg, append) {
    if (!jaws.isString(msg)) {
      msg = JSON.stringify(msg);
    }

    if (jaws.log.on) {
      if (log_tag && jaws.log.use_log_element) {
        if (append) {
          log_tag.innerHTML += msg + "<br />";
        }
        else {
          log_tag.innerHTML = msg;
        }
      }
      if (console.log && jaws.log.use_console) {
        console.log("JawsJS: ", msg);
      }
    }
  };

  /**
   * If logging should take place or not
   * @type {boolean}
   */
  jaws.log.on = true;

  /**
   * If console.log should be used during log writing 
   * @type {boolean}
   */
  jaws.log.use_console = false;

  /**
   * If log_tag should be used during log writing
   * @type {boolean}
   */
  jaws.log.use_log_element = true;

  /**
   * Write messages to console.warn (if it exists) or append current log
   * @param {string|object} msg String or object to record
   * @see jaws.log
   */
  jaws.log.warn = function(msg) {
    if (console.warn && jaws.log.use_console && jaws.log.on) {
      console.warn(msg);
    } else {
      jaws.log("[WARNING]: " + JSON.stringify(msg), true);
    }
  };

  /**
   * Write messages to console.error (if it exists) or append current log
   * @param {string|object} msg String or object to record
   * @see jaws.log
   */
  jaws.log.error = function(msg) {
    if (console.error && jaws.log.use_console && jaws.log.on) {
      console.error(msg);
    } else {
      jaws.log("[ERROR]: " + JSON.stringify(msg), true);
    }
  };

  /**
   * Write messages to console.info (if it exists) or append current log
   * @param {string|object} msg String or object to record
   * @see jaws.log
   */
  jaws.log.info = function(msg) {
    if (console.info && jaws.log.use_console && jaws.log.on) {
      console.info(msg);
    } else {
      jaws.log("[INFO]: " + JSON.stringify(msg), true);
    }
  };

  /**
   * Write messages to console.debug (if it exists) or append current log
   * @param {string|object} msg String or object to record
   * @see jaws.log
   */
  jaws.log.debug = function(msg) {
    if (console.debug && jaws.log.use_console && jaws.log.on) {
      console.debug(msg);
    } else {
      jaws.log("[DEBUG]: " + JSON.stringify(msg), true);
    }
  };

  /**
   * Clears the contents of log_tag element (if set) and console.log (if set)
   */
  jaws.log.clear = function() {
    if (log_tag) {
      log_tag.innerHTML = "";
    } 
    if (console.clear) {
      console.clear();
    }
  };

  /**
   * Initalizes jaws{canvas, context, dom, width, height}
   * @private
   * @param    {object}    options     Object-literal of constructor properties
   * @see jaws.url_parameters()
   */
  jaws.init = function(options) {

    /* Find <title> tag */
    title = document.getElementsByTagName('title')[0];
    jaws.url_parameters = jaws.getUrlParameters();

    jaws.canvas = document.getElementsByTagName('canvas')[0];
   
    /* No canvas? Create and append to DOM */ 
    if(!jaws.canvas) {
      jaws.canvas = document.createElement("canvas");
      document.body.insertBefore(jaws.canvas, document.body.firstChild);
    } 

    jaws.context = jaws.canvas.getContext('2d');
    jaws.canvas.width = options.width;
    jaws.canvas.height = options.height;
 
    /*
     * If debug=1 parameter is present in the URL, let's either find <div id="jaws-log"> or create the tag.
     * jaws.log(message) will use this div for debug/info output to the gamer or developer
     *
     */
    log_tag = document.getElementById('jaws-log');
    if (jaws.url_parameters["debug"]) {
      if (!log_tag) {
        log_tag = document.createElement("div");
        log_tag.id = "jaws-log";
        log_tag.style.cssText = "overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;";
        document.body.appendChild(log_tag);
      }
    }


    if(jaws.url_parameters["bust_cache"]) {
      jaws.log.info("Busting cache when loading assets")
      jaws.assets.bust_cache = true;
    }

    /* Let's scale sprites retro-style by default */
    if (jaws.context)
      jaws.useCrispScaling();

    jaws.width = jaws.canvas ? jaws.canvas.width : jaws.dom.offsetWidth;
    jaws.height = jaws.canvas ? jaws.canvas.height : jaws.dom.offsetHeight;

    jaws.mouse_x = 0;
    jaws.mouse_y = 0;
    window.addEventListener("mousemove", saveMousePosition);
  };

  /**
   * Use 'retro' crisp scaling when drawing sprites through the canvas API, this is the default
   */
  jaws.useCrispScaling = function() {
    jaws.context.imageSmoothingEnabled = false;
    jaws.context.webkitImageSmoothingEnabled = false;
    jaws.context.mozImageSmoothingEnabled = false;
  };

  /**
   * Use smooth antialiased scaling when drawing sprites through the canvas API
   */
  jaws.useSmoothScaling = function() {
    jaws.context.imageSmoothingEnabled = true;
    jaws.context.webkitImageSmoothingEnabled = true;
    jaws.context.mozImageSmoothingEnabled = true;
  };

  /**
   * Keeps updated mouse coordinates in jaws.mouse_x and jaws.mouse_y
   * This is called each time event "mousemove" triggers.
   * @private
   * @param {EventObject} e The EventObject populated by the calling event
   */
  function saveMousePosition(e) {
    jaws.mouse_x = (e.pageX || e.clientX);
    jaws.mouse_y = (e.pageY || e.clientY);

    var game_area = jaws.canvas ? jaws.canvas : jaws.dom;
    jaws.mouse_x -= game_area.offsetLeft;
    jaws.mouse_y -= game_area.offsetTop;
  }

  /**
   * 1) Calls jaws.init(), detects or creats a canvas, and sets up the 2D context (jaws.canvas and jaws.context).
   * 2) Pre-loads all defined assets with jaws.assets.loadAll().
   * 3) Creates an instance of game_state and calls setup() on that instance.
   * 4) Loops calls to update() and draw() with given FPS until game ends or another game state is activated.
   * @param   {function}   game_state                The game state function to be started
   * @param   {object}     options                   Object-literal of game loop properties
   * @param   {object}     game_state_setup_options  Object-literal of game state properties and values
   * @see jaws.init()
   * @see jaws.setupInput()
   * @see jaws.assets.loadAll()
   * @see jaws.switchGameState()
   * @example
   *
   *  jaws.start(MyGame)            // Start game state Game() with default options
   *  jaws.start(MyGame, {fps: 30}) // Start game state Game() with options, in this case jaws will run your game with 30 frames per second.
   *  jaws.start(window)            // Use global functions setup(), update() and draw() if available. Not the recommended way but useful for testing and mini-games.
   *
   */
  jaws.start = function(game_state, options, game_state_setup_options) {
    if (!options) options = {};

    var fps = options.fps || 60;
    if (options.loading_screen === undefined) options.loading_screen = true;
    if (!options.width)                       options.width = 500;
    if (!options.height)                      options.height = 300;
    
    /* Takes care of finding/creating canvas-element and debug-div */
    jaws.init(options);

    if (!jaws.isFunction(game_state) && !jaws.isObject(game_state)) {
      jaws.log.error("jaws.start: Passed in GameState is niether function or object");
      return;
    }
    if (!jaws.isObject(game_state_setup_options) && game_state_setup_options !== undefined) {
      jaws.log.error("jaws.start: The setup options for the game state is not an object.");
      return;
    }

    if (options.loading_screen) {
      jaws.assets.displayProgress(0);
    }

    jaws.log.info("setupInput()", true);
    jaws.setupInput();

    /* Callback for when one single asset has been loaded */
    function assetProgress(src, percent_done) {
      jaws.log.info(percent_done + "%: " + src, true);
      if (options.loading_screen) {
        jaws.assets.displayProgress(percent_done);
      }
    }

    /* Callback for when an asset can't be loaded*/
    function assetError(src, percent_done) {
      jaws.log.info(percent_done + "%: Error loading asset " + src, true);
    }

    /* Callback for when all assets are loaded */
    function assetsLoaded() {
      jaws.log.info("all assets loaded", true);
      jaws.switchGameState(game_state || window, {fps: fps}, game_state_setup_options);
    }

    jaws.log.info("assets.loadAll()", true);
    if (jaws.assets.length() > 0) {
      jaws.assets.loadAll({onprogress: assetProgress, onerror: assetError, onload: assetsLoaded});
    }
    else {
      assetsLoaded();
    }
  };

  /**
   * Switchs to a new active game state and saves previous game state in jaws.previous_game_state
   * @param   {function}  game_state                The game state function to start
   * @param   {object}    options                   The object-literal properties to pass to the new game loop
   * @param   {object}    game_state_setup_options  The object-literal properties to pass to starting game state
   * @example
   * 
   * function MenuState() {
   *   this.setup = function() { ... }
   *   this.draw = function() { ... }
   *   this.update = function() {
   *     if(pressed("enter")) jaws.switchGameState(GameState); // Start game when Enter is pressed
   *   }
   * }
   *
   * function GameState() {
   *   this.setup = function() { ... }
   *   this.update = function() { ... }
   *   this.draw = function() { ... }
   * }
   *
   * jaws.start(MenuState)
   *
   */
  jaws.switchGameState = function(game_state, options, game_state_setup_options) {
    if(options === undefined) options = {};

    if(jaws.isFunction(game_state)) {
      game_state = new game_state;
    }
    if(!jaws.isObject(game_state)) {
      jaws.log.error("jaws.switchGameState: Passed in GameState should be a Function or an Object.");
      return;
    }

    var fps = (options && options.fps) || (jaws.game_loop && jaws.game_loop.fps) || 60;
    var setup = options.setup

    jaws.game_loop && jaws.game_loop.stop();
    jaws.clearKeyCallbacks();

    jaws.previous_game_state = jaws.game_state;
    jaws.game_state = game_state;
    jaws.game_loop = new jaws.GameLoop(game_state, {fps: fps, setup: setup}, game_state_setup_options);
    jaws.game_loop.start();
  };

  /**
   * Creates a new HTMLCanvasElement from a HTMLImageElement
   * @param   {HTMLImageElement}  image   The HTMLImageElement to convert to a HTMLCanvasElement
   * @returns {HTMLCanvasElement}         A HTMLCanvasElement with drawn HTMLImageElement content
   */
  jaws.imageToCanvas = function(image) {
    if (jaws.isCanvas(image)) return image;

    if (!jaws.isImage(image)) {
      jaws.log.error("jaws.imageToCanvas: Passed in object is not an Image.");
      return;
    }

    var canvas = document.createElement("canvas");
    canvas.src = image.src;
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, image.width, image.height);
    return canvas;
  };

  /**
   * Returns object as an array
   * @param   {object}  obj   An array or object
   * @returns {array}         Either an array or the object as an array 
   * @example
   *
   *   jaws.forceArray(1)       // --> [1]
   *   jaws.forceArray([1,2])   // --> [1,2]
   */
  jaws.forceArray = function(obj) {
    return Array.isArray(obj) ? obj : [obj];
  };

  /**
   * Clears screen (the canvas-element) through context.clearRect()
   */
  jaws.clear = function() {
    jaws.context.clearRect(0, 0, jaws.width, jaws.height);
  };

  /** Fills the screen with given fill_style */
  jaws.fill = function(fill_style) {
    jaws.context.fillStyle = fill_style;
    jaws.context.fillRect(0, 0, jaws.width, jaws.height);
  };


  /**
   * calls draw() on everything you throw on it. Give it arrays, argumentlists, arrays of arrays.
   *
   */
  jaws.draw = function() {
    var list = arguments;
    if(list.length == 1 && jaws.isArray(list[0])) list = list[0];
    for(var i=0; i < list.length; i++) {
      if(jaws.isArray(list[i])) jaws.draw(list[i]);  
      else                      if(list[i].draw) list[i].draw();
    }
  }

  /**
   * calls update() on everything you throw on it. Give it arrays, argumentlists, arrays of arrays.
   *
   */
  jaws.update = function() {
    var list = arguments;
    if(list.length == 1 && jaws.isArray(list[0])) list = list[0];
    for(var i=0; i < list.length; i++) {
      if(jaws.isArray(list[i])) jaws.update(list[i]);  
      else                      if(list[i].update) list[i].update();
    }
  }

  /**
   * Tests if object is an image or not
   * @param   {object}  obj   An Image or image-like object
   * @returns {boolean}       If object's prototype is "HTMLImageElement"
   */
  jaws.isImage = function(obj) {
    return Object.prototype.toString.call(obj) === "[object HTMLImageElement]";
  };

  /**
   * Tests if object is a Canvas object
   * @param   {type}  obj   A canvas or canvas-like object
   * @returns {boolean}     If object's prototype is "HTMLCanvasElement"
   */
  jaws.isCanvas = function(obj) {
    return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]";
  };

  /**
   * Tests if an object is either a canvas or an image object
   * @param   {object}  obj   A canvas or canva-like object
   * @returns {boolean}       If object isImage or isCanvas
   */
  jaws.isDrawable = function(obj) {
    return jaws.isImage(obj) || jaws.isCanvas(obj);
  };

  /**
   * Tests if an object is a string or not
   * @param   {object}  obj   A string or string-like object
   * @returns {boolean}       The result of typeof and constructor testing
   */
  jaws.isString = function(obj) {
    return typeof obj === "string" || (typeof obj === "object" && obj.constructor === String);
  };

  /**
   * Tests if an object is a number or not
   * @param   {number}  n   A number or number-like value
   * @returns {boolean}     If n passed isNaN() and isFinite()
   */
  jaws.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  /**
   * Tests if an object is an Array or not
   * @param   {object}  obj   An array or array-like object
   * @returns {boolean}       If object's constructor is "Array"
   */
  jaws.isArray = function(obj) {
    if (!obj)
      return false;
    return !(obj.constructor.toString().indexOf("Array") === -1);
  };

  /**
   * Tests if an object is an Object or not
   * @param   {object}  value   An object or object-like enitity
   * @returns {boolean}         If object is not null and typeof 'object'
   */
  jaws.isObject = function(value) {
    return value !== null && typeof value === 'object';
  };

  /**
   * Tests if an object is a function or not
   * @param   {object}  obj   A function or function-like object
   * @returns {boolean}       If the prototype of the object is "Function"
   */
  jaws.isFunction = function(obj) {
    return (Object.prototype.toString.call(obj) === "[object Function]");
  };

  /**
   * Tests if an object is a regular expression or not
   * @param   {object}  obj   A /regexp/-object
   * @returns {boolean}       If the object is an instance of RegExp
   */
  jaws.isRegExp = function(obj) {
    return (obj instanceof RegExp);
  };


  /**
   * Tests if an object is within drawing canvas (jaws.width and jaws.height) 
   * @param   {object}  item  An object with both x and y properties
   * @returns {boolean}       If the item's x and y are less than 0 or more than jaws.width or jaws.height
   */
  jaws.isOutsideCanvas = function(item) {
    if (item.x && item.y) {
      return (item.x < 0 || item.y < 0 || item.x > jaws.width || item.y > jaws.height);
    }
  };

  /**
   * Sets x and y properties to 0 (if less than), or jaws.width or jaws.height (if greater than)
   * @param   {object}  item  An object with x and y properties
   */
  jaws.forceInsideCanvas = function(item) {
    if (item.x && item.y) {
      if (item.x < 0) {
        item.x = 0;
      }
      if (item.x > jaws.width) {
        item.x = jaws.width;
      }
      if (item.y < 0) {
        item.y = 0;
      }
      if (item.y > jaws.height) {
        item.y = jaws.height;
      }
    }
  };

  /**
   * Parses current window.location for URL parameters and values
   * @returns   {array}   Hash of url-parameters and their values
   * @example
   *   // Given the current URL is <b>http://test.com/?debug=1&foo=bar</b>
   *   jaws.getUrlParameters() // --> {debug: 1, foo: bar}
   */
  jaws.getUrlParameters = function() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  };

  /**
   * Compares an object's default properties against those sent to its constructor
   * @param   {object}  object    The object to compare and assign new values
   * @param   {object}  options   Object-literal of constructor properties and new values
   * @param   {object}  defaults  Object-literal of properties and their default values
   */
  jaws.parseOptions = function(object, options, defaults) {
    object["options"] = options;

    for (var option in options) {
      if (defaults[option] === undefined) {
        jaws.log.warn("jaws.parseOptions: Unsupported property " + option + "for " + object.constructor);
      }
    }
    for (var option in defaults) {
      if( jaws.isFunction(defaults[option]) ) defaults[option] = defaults[option](); 
      object[option] = (options[option] !== undefined) ? options[option] : jaws.clone(defaults[option]);
    }
  };

  /**
   * Returns a shallow copy of an array or object
   * @param   {array|object}  value   The array or object to clone
   * @returns {array|object}          A copy of an array of object
   */
  jaws.clone = function(value) {
    if (jaws.isArray(value))
      return value.slice(0);
    if (jaws.isObject(value))
      return JSON.parse(JSON.stringify(value));
    return value;
  };

  /*
  * Converts image to canvas 2D context. Then you can draw on it :).
  */
  jaws.imageToCanvasContext = function(image) {
    var canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
  
    var context = canvas.getContext("2d")
    if(jaws.context) {
      context.imageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
      context.webkitImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
      context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
    } 

    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return context
  }

  /**
   * scale 'image' by factor 'factor'.
   * Scaling is done using nearest-neighbor ( retro-blocky-style ).
   * Returns a canvas.
   */
  jaws.retroScaleImage = function(image, factor) {
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

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws }
