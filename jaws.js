/* Built at 2014-01-03 11:51:42 +0100 */
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
  */
  jaws.Parallax = function() { jaws.log.error("To use jaws.Parallax() you need to include src/extras/parallax.js") }
  jaws.SpriteList = function() { jaws.log.error("To use SpriteList() you need to include src/extras/sprite_list.js") }
  jaws.TileMap = function() { jaws.log.error("To use TileMap() you need to include src/extras/tile_map.js") }
  jaws.PixelMap = function() { jaws.log.error("To use PixelMap() you need to include src/extras/pixel_map.js") }
  jaws.QuadTree = function() { jaws.log.error("To use QuadTree() you need to include src/extras/quadtree.js") }
  jaws.Audio = function() { jaws.log.error("To use jaws.Audio() you need to include src/extras/audio.js") }

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
    if (!jaws.canvas) {
      jaws.dom = document.getElementById("canvas");
    }

    // Ordinary <canvas>, get context
    if (jaws.canvas) {
      jaws.context = jaws.canvas.getContext('2d');
    } 
    else if (jaws.dom) {
      jaws.dom.style.position = "relative";
    } 
    else {
      jaws.canvas = document.createElement("canvas");
      jaws.canvas.width = options.width;
      jaws.canvas.height = options.height;
      jaws.context = jaws.canvas.getContext('2d');
      document.body.appendChild(jaws.canvas);
    }

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

var jaws = (function(jaws) {

  var pressed_keys = {}
  var previously_pressed_keys = {}
  var keycode_to_string = []
  var on_keydown_callbacks = []
  var on_keyup_callbacks = []
  var mousebuttoncode_to_string = []
  var ie_mousebuttoncode_to_string = []
 
/** @private
 * Map all javascript keycodes to easy-to-remember letters/words
 */
jaws.setupInput = function() {
  var k = []
  
  k[8] = "backspace"
  k[9] = "tab"
  k[13] = "enter"
  k[16] = "shift"
  k[17] = "ctrl"
  k[18] = "alt"
  k[19] = "pause"
  k[20] = "capslock"
  k[27] = "esc"
  k[32] = "space"
  k[33] = "pageup"
  k[34] = "pagedown"
  k[35] = "end"
  k[36] = "home"
  k[37] = "left"
  k[38] = "up"
  k[39] = "right"
  k[40] = "down" 
  k[45] = "insert"
  k[46] = "delete"
  
  k[91] = "left_window_key leftwindowkey"
  k[92] = "right_window_key rightwindowkey"
  k[93] = "select_key selectkey"
  k[106] = "multiply *"
  k[107] = "add plus +"
  k[109] = "subtract minus -"
  k[110] = "decimalpoint"
  k[111] = "divide /"
  
  k[144] = "numlock"
  k[145] = "scrollock"
  k[186] = "semicolon ;"
  k[187] = "equalsign ="
  k[188] = "comma ,"
  k[189] = "dash -"
  k[190] = "period ."
  k[191] = "forwardslash /"
  k[192] = "graveaccent `"
  k[219] = "openbracket ["
  k[220] = "backslash \\"
  k[221] = "closebracket ]"
  k[222] = "singlequote '"
  
  var m = []
  
  m[0] = "left_mouse_button"
  m[1] = "center_mouse_button"
  m[2] = "right_mouse_button"

  var ie_m = [];
  ie_m[1] = "left_mouse_button";
  ie_m[2] = "right_mouse_button";
  ie_m[4] = "center_mouse_button"; 
  
  mousebuttoncode_to_string = m
  ie_mousebuttoncode_to_string = ie_m;


  var numpadkeys = ["numpad0","numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
  var fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
  var numbers = ["0","1","2","3","4","5","6","7","8","9"]
  var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
  for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
  for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
  for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }
  
  keycode_to_string = k

  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)

  var jawswindow = jaws.canvas || jaws.dom
  jawswindow.addEventListener("mousedown", handleMouseDown, false);
  jawswindow.addEventListener("mouseup", handleMouseUp, false);
  jawswindow.addEventListener("touchstart", handleTouchStart, false);
  jawswindow.addEventListener("touchend", handleTouchEnd, false);

  window.addEventListener("blur", resetPressedKeys, false);

  // this turns off the right click context menu which screws up the mouseup event for button 2
  document.oncontextmenu = function() {return false};
}

/** @private
 * Reset input-hash. Called when game is blurred so a key-controlled player doesn't keep on moving when the game isn't focused.
 */
function resetPressedKeys(e) {
  pressed_keys = {};
}

/** @private
 * handle event "onkeydown" by remembering what key was pressed
 */
function handleKeyUp(e) {
  event = (e) ? e : window.event
  var human_names = keycode_to_string[event.keyCode].split(" ")
  human_names.forEach( function(human_name) {
   pressed_keys[human_name] = false
    if(on_keyup_callbacks[human_name]) { 
      on_keyup_callbacks[human_name](human_name)
      e.preventDefault()
    }
    if(prevent_default_keys[human_name]) { e.preventDefault() }
  });
}

/** @private
 * handle event "onkeydown" by remembering what key was un-pressed
 */
function handleKeyDown(e) {
  event = (e) ? e : window.event  
  var human_names = keycode_to_string[event.keyCode].split(" ")
  human_names.forEach( function(human_name) {
    pressed_keys[human_name] = true
    if(on_keydown_callbacks[human_name]) { 
      on_keydown_callbacks[human_name](human_name)
      e.preventDefault()
    }
    if(prevent_default_keys[human_name]) { e.preventDefault() }
  });
}
/** @private
 * handle event "onmousedown" by remembering what button was pressed
 */
function handleMouseDown(e) {
  event = (e) ? e : window.event  
  var human_name = mousebuttoncode_to_string[event.button] // 0 1 2
  if (navigator.appName == "Microsoft Internet Explorer"){
	  human_name = ie_mousebuttoncode_to_string[event.button];
  }
  pressed_keys[human_name] = true
  if(on_keydown_callbacks[human_name]) { 
    on_keydown_callbacks[human_name](human_name)
    e.preventDefault()
  }
}


/** @private
 * handle event "onmouseup" by remembering what button was un-pressed
 */
function handleMouseUp(e) {
  event = (e) ? e : window.event
  var human_name = mousebuttoncode_to_string[event.button]  

  if (navigator.appName == "Microsoft Internet Explorer"){
	  human_name = ie_mousebuttoncode_to_string[event.button];
  }
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { 
    on_keyup_callbacks[human_name](human_name)
    e.preventDefault()
  }
}

/** @private
 * handle event "touchstart" by remembering what button was pressed
 */
function handleTouchStart(e) {
	event = (e) ? e : window.event  
	pressed_keys["left_mouse_button"] = true
	jaws.mouse_x = e.touches[0].pageX - jaws.canvas.offsetLeft;
	jaws.mouse_y = e.touches[0].pageY - jaws.canvas.offsetTop;
	//e.preventDefault()
}

/** @private
 * handle event "touchend" by remembering what button was pressed
 */
function handleTouchEnd(e) {
  event = (e) ? e : window.event  
  pressed_keys["left_mouse_button"] = false
	jaws.mouse_x = undefined;
	jaws.mouse_y = undefined;

}

var prevent_default_keys = []
/** 
 * Prevents default browseraction for given keys.
 * @example
 * jaws.preventDefaultKeys( ["down"] )  // Stop down-arrow-key from scrolling page down
 */
jaws.preventDefaultKeys = function(array_of_strings) {
  var list = arguments;
  if(list.length == 1 && jaws.isArray(list[0])) list = list[0];

  for(var i=0; i < list.length; i++) {
    prevent_default_keys[list[i]] = true;
  }
}

/**
 * Check if *keys* are pressed. Second argument specifies use of logical AND when checking multiple keys.
 * @example
 * jaws.pressed("left a");          // returns true if left arrow key OR a is pressed
 * jaws.pressed("ctrl c", true);    // returns true if ctrl AND a is pressed
 */
jaws.pressed = function(keys, logical_and) {
  if(jaws.isString(keys)) { keys = keys.split(" ") }
  if(logical_and) { return  keys.every( function(key) { return pressed_keys[key] } ) }
  else            { return  keys.some( function(key) { return pressed_keys[key] } ) }
}

/**
 * Check if *keys* are pressed, but only return true Once for any given keys. Once keys have been released, pressedWithoutRepeat can return true again when keys are pressed.
 * Second argument specifies use of logical AND when checking multiple keys.
 * @example
 * if(jaws.pressedWithoutRepeat("space")) { player.jump() }  // with this in the gameloop player will only jump once even if space is held down
 */
jaws.pressedWithoutRepeat = function(keys, logical_and) {
  if( jaws.pressed(keys, logical_and) ) {
    if(!previously_pressed_keys[keys]) { 
      previously_pressed_keys[keys] = true
      return true 
    }
  }
  else {
    previously_pressed_keys[keys] = false
    return false
  }
}

/** 
 * sets up a callback for a key (or array of keys) to call when it's pressed down
 * 
 * @example
 * // call goLeft() when left arrow key is  pressed
 * jaws.on_keypress("left", goLeft) 
 *
 * // call fireWeapon() when SPACE or CTRL is pressed
 * jaws.on_keypress(["space","ctrl"], fireWeapon)
 */
jaws.on_keydown = function(key, callback) {
  if(jaws.isArray(key)) {
    for(var i=0; key[i]; i++) {
      on_keydown_callbacks[key[i]] = callback
    }
  }
  else {
    on_keydown_callbacks[key] = callback
  }
}

/** 
 * sets up a callback when a key (or array of keys) to call when it's released 
 */
jaws.on_keyup = function(key, callback) {
  if(jaws.isArray(key)) {
    for(var i=0; key[i]; i++) {
      on_keyup_callbacks[key[i]] = callback
    }
  }
  else {
    on_keyup_callbacks[key] = callback
  }
}

/** @private
 * Clean up all callbacks set by on_keydown / on_keyup 
 */
jaws.clearKeyCallbacks = function() {
  on_keyup_callbacks = []
  on_keydown_callbacks = []
}

return jaws;
})(jaws || {});
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
     * Set root prefix-path to all assets
     *
     * @example
     *   jaws.assets.setRoot("music/").add(["music.mp3", "music.ogg"]).loadAll()
     *
     * @public
     * @param   {string} path-prefix for all following assets
     * @returns {object} self
     */
    self.setRoot = function(path) {
      self.root = path
      return self
    }
 
    /**
     * Get one or more resources from their URLs. Supports simple wildcard (you can end a string with "*").
     *
     * @example
     *   jaws.assets.add(["song.mp3", "song.ogg"])
     *   jaws.assets.get("song.*")  // -> Will return song.ogg in firefox and song.mp3 in IE
     *
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
        // Wildcard? song.*, match against asset-srcs, make sure it's loaded and return content of first match.
        if(src[src.length-1] === "*") {
          var needle = src.replace("*", "")
          for(var i=0; i < self.src_list.length; i++) {
            if(self.src_list[i].indexOf(needle) == 0 && self.data[self.src_list[i]]) 
              return self.data[self.src_list[i]];
          }
        }
        
        // TODO: self.loaded[src] is false for supported files for some odd reason.
        if (self.data[src]) { return self.data[src]; } 
        else                { jaws.log.warn("No such asset: " + src, true); }
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
     * @param {string|array|arguments} src The resource URL(s) to add to the asset listing
     * @example
     * jaws.assets.add("player.png")
     * jaws.assets.add(["media/bullet1.png", "media/bullet2.png"])
     * jaws.assets.add("foo.png", "bar.png")
     * jaws.assets.loadAll({onload: start_game})
     */
    self.add = function(src) {
      var list = arguments;
      if(list.length == 1 && jaws.isArray(list[0])) list = list[0];
      
      for(var i=0; i < list.length; i++) {
        if(jaws.isArray(list[i])) {
          self.add(list[i]);
        }
        else {
          if(jaws.isString(list[i]))  { self.src_list.push(list[i]) }
          else                        { jaws.log.error("jaws.assets.add: Neither String nor Array. Incorrect URL resource " + src) }
        }
      }

      return self;
    };

    /**
     * Iterate through the list of resource URL(s) and load each in turn.
     * @public
     * @param {Object} options Object-literal of callback functions
     * @config {function} [options.onprogress] The function to be called on progress (when one assets of many is loaded)
     * @config {function} [options.onerror] The function to be called if an error occurs
     * @config {function} [options.onload] The function to be called when finished 
     */
    self.loadAll = function(options) {
      self.load_count = 0;
      self.error_count = 0;

      if (options.onprogress && jaws.isFunction(options.onprogress))
        self.onprogress = options.onprogress;

      if (options.onerror && jaws.isFunction(options.onerror))
        self.onerror = options.onerror;

      if (options.onload && jaws.isFunction(options.onload))
        self.onload = options.onload;

      self.src_list.forEach(function(item) {
        self.load(item);
      });

      return self;
    };

    /** 
     * Loads a single resource from its given URL
     * Will attempt to match a resource to known MIME types.
     * If unknown, loads the file as a blob-object.
     * 
     * @public
     * @param {string} src Resource URL
     * @param {Object} options Object-literal of callback functions
     * @config {function} [options.onload] Function to be called when assets has loaded
     * @config {function} [options.onerror] Function to be called if an error occurs
     * @example
     * jaws.load("media/foo.png")
     * jaws.load("http://place.tld/foo.png")
     */
    self.load = function(src, options) {
      if(!options) options = {};

      if (!jaws.isString(src)) {
        jaws.log.error("jaws.assets.load: Argument not a String with " + src);
        return;
      }

      var asset = {};
      var resolved_src = "";
      asset.src = src;
      asset.onload = options.onload;
      asset.onerror = options.onerror;
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
      } 
      else if (self.can_play[self.getPostfix(asset.src)]) {
        if (type === "audio") {
          try {
            asset.audio = new Audio();
            asset.audio.asset = asset;
            asset.audio.addEventListener('error', assetError);
            asset.audio.addEventListener('canplay', assetLoaded); // NOTE: assetLoaded can be called several times during loading.
            self.data[asset.src] = asset.audio;
            asset.audio.src = resolved_src;
            asset.audio.load();
          } catch (e) {
            jaws.log.error("Cannot load Audio resource " + resolved_src +
                    " (Message: " + e.message + ", Name: " + e.name + ")");
          }
        } 
      else if (type === "video") {
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
      }
      
      //Load everything else as raw blobs...
      else {
        // ... But don't load un-supported audio-files.
        if(type === "audio" && !self.can_play[self.getPostfix(asset.src)]) {
          assetSkipped(asset);
          return self;
        }

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
      
      return self;
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
      
      try {
        if (filetype === "json") {
          if (this.readyState !== 4) {
            return;
          }
          self.data[asset.src] = JSON.parse(this.responseText);
        }
        else if (filetype === "image") {
          var new_image = self.image_to_canvas ? jaws.imageToCanvas(asset.image) : asset.image;
          if (self.fuchia_to_transparent && self.getPostfix(asset.src) === "bmp") {
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

      /*
      * Only increment load_count ONCE per unique asset.
      * This is needed cause assetLoaded-callback can in certain cases be called several for a single asset...
      * ..and not only Once when it's loaded.
      */
      if( !self.loaded[src]) self.load_count++;

      self.loaded[src] = true;
      self.loading[src] = false;

      processCallbacks(asset, true, event);
    }
    
    /** 
     * Called when jaws asset-handler decides that an asset shouldn't be loaded
     * For example, an unsupported audio-format won't be loaded.
     *
     * @private
    */
    function assetSkipped(asset) {
      self.loaded[asset.src] = true;
      self.loading[asset.src] = false;
      self.load_count++;
      processCallbacks(asset, true);
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
        if(self.onprogress)
          self.onprogress(asset.src, percent);
        if(asset.onprogress && event !== undefined)
          asset.onprogress(event);
      }
      else {
        if(self.onerror)
          self.onerror(asset.src, percent);
        if(asset.onerror && event !== undefined)
          asset.onerror(event);
      }

      if (percent === 100) {
        if(self.onload) self.onload();

        self.onprogress = null;
        self.onerror = null;
        self.onload = null;
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
    if (!jaws.isDrawable(image))  
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

var jaws = (function(jaws) {

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 16.666);
          };
})();

/**
 * @class A classic game loop forever looping calls to update() / draw() with given framerate. "Field Summary" contains options for the GameLoop()-constructor.
 *
 * @property {int} tick_duration  duration in ms between the last 2 ticks (often called dt)
 * @property {int} fps  the real fps (as opposed to the target fps), smoothed out with a moving average
 * @property {int} ticks  total amount of ticks since game loops start
 *
 * @example
 *
 * game = {}
 *  draw: function() { ... your stuff executed every 30 FPS ... }
 * }
 *
 * game_loop = new jaws.GameLoop(game, {fps: 30})
 * game_loop.start()
 *
 * // You can also use the shortcut jaws.start(), it will:
 * // 1) Load all assets with jaws.assets.loadAll()
 * // 2) Create a GameLoop() and start it
 * jaws.start(MyGameState, {fps: 30})
 *
 */
jaws.GameLoop = function GameLoop(game_object, options, game_state_setup_options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( game_object, options );

  this.tick_duration = 0
  this.fps = 0
  this.ticks = 0
  
  var update_id
  var paused = false
  var stopped = false
  var that = this
  var mean_value = new MeanValue(20) // let's have a smooth, non-jittery FPS-value

  /** 
   * returns how game_loop has been active in milliseconds 
   * does currently not factor in pause-time
   */
  this.runtime = function() {
    return (this.last_tick - this.first_tick)
  }

  /** Start the game loop by calling setup() once and then loop update()/draw() forever with given FPS */
  this.start = function() {
    jaws.log.info("Game loop start", true)
  
    this.first_tick = (new Date()).getTime();
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 

    if(options.setup !== false && game_object.setup) { game_object.setup(game_state_setup_options) }
    step_delay = 1000 / options.fps;
   
    if(options.fps == 60) {
      requestAnimFrame(this.loop)
    }
    else {
      update_id = setInterval(this.loop, step_delay);
    }
  }
  
  /** The core of the game loop. Calculate a mean FPS and call update()/draw() if game loop is not paused */
  this.loop = function() {
    that.current_tick = (new Date()).getTime();
    that.tick_duration = that.current_tick - that.last_tick
    that.fps = mean_value.add(1000/that.tick_duration).get()

    if(!stopped && !paused) {
      if(game_object.update) { game_object.update() }
      if(game_object.draw)   { game_object.draw() }
      that.ticks++
    }
    if(options.fps == 60 && !stopped) requestAnimFrame(that.loop);
    that.last_tick = that.current_tick;
  }
  
  /** Pause the game loop. loop() will still get called but not update() / draw() */
  this.pause = function()   { paused = true }
  
  /** unpause the game loop */
  this.unpause = function() { paused = false }

  /** Stop the game loop */
  this.stop = function() { 
    if(update_id) clearInterval(update_id); 
    stopped = true;
  }
}

/** @ignore */
function MeanValue(size) {
  this.size = size
  this.values = new Array(this.size)
  this.value
  
  this.add = function(value) {
    if(this.values.length > this.size) {  // is values filled?
      this.values.splice(0,1)
      this.value = 0
      for(var i=0; this.values[i]; i++) {
        this.value += this.values[i]
      }
      this.value = this.value / this.size
    }
    this.values.push(value)
    
    return this
  }

  this.get = function() {
    return parseInt(this.value)
  }

}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
* 2013-09-28:
*
* For a 10x10 sprite in the topleft corner, should sprite.rect().bottom be 9 or 10?
* There's no right or wrong answer. In some cases 9 makes sense (if checking directly for pixel-values for example).
* In other cases 10 makes sense (bottom = x + height).
*
* The important part is beeing consistent across the lib/game.
* Jaws started out with bottom = x + height so we'll continue with that way until good reasons to change come up.
* Therefore correction = 0 for now.
*/
var correction = 0;

/**
  @class A Basic rectangle.
  @example
  rect = new jaws.Rect(5,5,20,20)
  rect.right  // -> 25
  rect.bottom // -> 25
  rect.move(10,20)
  rect.right  // -> 35
  rect.bottom // -> 45
  rect.width  // -> 20
  rect.height // -> 20
*/
jaws.Rect = function Rect(x, y, width, height) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee(x, y, width, height);
  
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.right = x + width - correction
  this.bottom = y + height - correction
}

/** Return position as [x,y] */
jaws.Rect.prototype.getPosition = function() {
  return [this.x, this.y]
}

/** Move rect x pixels horizontally and y pixels vertically */
jaws.Rect.prototype.move = function(x, y) {
  this.x += x
  this.y += y
  this.right += x
  this.bottom += y
  return this
}

/** Set rects x/y */
jaws.Rect.prototype.moveTo = function(x, y) {
  this.x = x
  this.y = y
  this.right = this.x + this.width - correction
  this.bottom = this.y + this.height - correction
  return this
}
/** Modify width and height */
jaws.Rect.prototype.resize = function(width, height) {
  this.width += width
  this.height += height
  this.right = this.x + this.width - correction
  this.bottom = this.y + this.height - correction
  return this
}

/** Returns a new rect witht he same dimensions */
jaws.Rect.prototype.clone = function() {
  return new jaws.Rect(this.x, this.y, this.width, this.height)
}

/** Shrink rectangle on both axis with given x/y values  */
jaws.Rect.prototype.shrink = function(x, y) {
  this.x += x
  this.y += y
  this.width -= (x+x)
  this.height -= (y+y)
  this.right = this.x + this.width - correction
  this.bottom = this.y + this.height - correction
  return this
}

/** Set width and height */
jaws.Rect.prototype.resizeTo = function(width, height) {
  this.width = width
  this.height = height
  this.right = this.x + this.width - correction
  this.bottom = this.y + this.height - correction
  return this
}

/** Draw rect in color red, useful for debugging */
jaws.Rect.prototype.draw = function() {
  jaws.context.strokeStyle = "red"
  jaws.context.strokeRect(this.x-0.5, this.y-0.5, this.width, this.height)
  return this
}

/** Returns true if point at x, y lies within calling rect */
jaws.Rect.prototype.collidePoint = function(x, y) {
  return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
}

/** Returns true if calling rect overlaps with given rect in any way */
jaws.Rect.prototype.collideRect = function(rect) {
  return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
         ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom))
}

/*
// Possible future functions
jaws.Rect.prototype.collideRightSide = function(rect)  { return(this.right >= rect.x && this.x < rect.x) }
jaws.Rect.prototype.collideLeftSide = function(rect)   { return(this.x > rect.x && this.x <= rect.right) }
jaws.Rect.prototype.collideTopSide = function(rect)    { return(this.y >= rect.y && this.y <= rect.bottom) }
jaws.Rect.prototype.collideBottomSide = function(rect) { return(this.bottom >= rect.y && this.y < rect.y) }
*/

jaws.Rect.prototype.toString = function() { return "[Rect " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "]" }

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.Rect }

var jaws = (function(jaws) {

/**
* @class A basic but powerfull sprite for all your onscreen-game objects. "Field Summary" contains options for the Sprite()-constructor.
* @constructor
*  
* @property {int} x     Horizontal position  (0 = furthest left)
* @property {int} y     Vertical position    (0 = top)
* @property {image} image   Image/canvas or string pointing to an asset ("player.png")
* @property {int} alpha     Transparency 0=fully transparent, 1=no transperency
* @property {int} angle     Angle in degrees (0-360)
* @property {bool} flipped    Flip sprite horizontally, usefull for sidescrollers
* @property {string} anchor   String stating how to anchor the sprite to canvas, @see Sprite#anchor ("top_left", "center" etc)
* @property {int} scale_image Scale the sprite by this factor
* @property {string,gradient} color If set, draws a rectangle of dimensions rect() with specified color or gradient (linear or radial)
*
* @example
* // create new sprite at top left of the screen, will use jaws.assets.get("foo.png")
* new Sprite({image: "foo.png", x: 0, y: 0}) 
* 
* // sets anchor to "center" on creation
* new Sprite({image: "topdownspaceship.png", anchor: "center"})
*
*/
jaws.Sprite = function Sprite(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );
  this.set(options)  
  this.context = options.context ? options.context : jaws.context;  // Prefer given canvas-context, fallback to jaws.context
}

jaws.Sprite.prototype.default_options = {
  x: 0, 
  y: 0, 
  alpha: 1,
  angle: 0,
  flipped: false,
  anchor_x: 0,
  anchor_y: 0,
  image: null,
  image_path: null,
  anchor: null,
  scale_image: null,
  damping: 1,
  scale_x: 1,
  scale_y: 1,
  scale: 1,
  color: "#ddd",
  width: 16,
  height: 16,
  _constructor: null,
  context: null,
  data: null
}

/** 
 * @private
 * Call setters from JSON object. Used to parse options.
 */
jaws.Sprite.prototype.set = function(options) {
  if(jaws.isString(this.image)) this.image_path = this.image;
  jaws.parseOptions(this, options, this.default_options);
  
  if(this.scale)        this.scale_x = this.scale_y = this.scale;
  if(this.image)        this.setImage(this.image);
  if(this.scale_image)  this.scaleImage(this.scale_image);
  if(this.anchor)       this.setAnchor(this.anchor);
  
  if(!this.image && this.color && this.width && this.height) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
	  canvas.width = this.width;
  	canvas.height = this.height;
    context.fillStyle = this.color;
    context.fillRect(0, 0, this.width, this.height);
    this.image = canvas;
  }

  this.cacheOffsets()

  return this
}

/** 
 * @private
 *
 * Creates a new sprite from current sprites attributes()
 * Checks JawsJS magic property '_constructor' when deciding with which constructor to create it
 *
 */
jaws.Sprite.prototype.clone = function(object) {
  var constructor = this._constructor ? eval(this._constructor) : this.constructor
  var new_sprite = new constructor( this.attributes() );
  new_sprite._constructor = this._constructor || this.constructor.name
  return new_sprite
}


/**
 * Sets image from image/canvas or asset-string ("foo.png")
 * If asset isn't previously loaded setImage() will try to load it.
 */
jaws.Sprite.prototype.setImage =      function(value) { 
  var that = this

  // An image, great, set this.image and return
  if(jaws.isDrawable(value)) {
    this.image = value
    return this.cacheOffsets() 
  }
  // Not an image, therefore an asset string, i.e. "ship.bmp"
  else {
    // Assets already loaded? Set this.image
    if(jaws.assets.isLoaded(value)) { this.image = jaws.assets.get(value); this.cacheOffsets(); }

    // Not loaded? Load it with callback to set image.
    else {
      jaws.log.warn("Image '" + value + "' not preloaded with jaws.assets.add(). Image and a working sprite.rect() will be delayed.")
      jaws.assets.load(value, {onload: function() { that.image = jaws.assets.get(value); that.cacheOffsets();} } ) 
    }
  }
  return this
}

/** 
* Steps 1 pixel towards the given X/Y. Horizontal and vertical steps are done separately between each callback.
* Exits when the continueStep-callback returns true for both vertical and horizontal steps or if target X/Y has been reached.
*
* @returns  {object}  Object with 2 x/y-properties indicating what plane we moved in when stepToWhile was stopped.
*/
jaws.Sprite.prototype.stepToWhile = function(target_x, target_y, continueStep) { 
  var step = 1;
  var step_x = (target_x < this.x) ? -step : step;
  var step_y = (target_y < this.y) ? -step : step;

  target_x = parseInt(target_x)
  target_y = parseInt(target_y)

  var collision_x = false;
  var collision_y = false;

  while( true ) {
    if(collision_x === false) {
      if(this.x != target_x)    { this.x += step_x }
      if( !continueStep(this) ) { this.x -= step_x; collision_x = true }
    }
 
    if(collision_y === false) {
      if(this.y != target_y)    { this.y += step_y }
      if( !continueStep(this) ) { this.y -= step_y; collision_y = true }
    }

    if( (collision_x || this.x == target_x) && (collision_y || this.y == target_y) )
        return {x: collision_x, y: collision_y};
  }
}
/** 
* Moves with given vx/vy velocoties by stepping 1 pixel at the time. Horizontal and vertical steps are done separately between each callback.
* Exits when the continueStep-callback returns true for both vertical and horizontal steps or if target X/Y has been reached.
*
* @returns  {object}  Object with 2 x/y-properties indicating what plane we moved in when stepWhile was stopped.
*/
jaws.Sprite.prototype.stepWhile = function(vx, vy, continueStep) { 
  return this.stepToWhile(this.x + vx, this.y + vy, continueStep)
}

/** Flips image vertically, usefull for sidescrollers when player is walking left/right */
jaws.Sprite.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
jaws.Sprite.prototype.flipTo =        function(value) { this.flipped = value; return this }
/** Rotate sprite by value degrees */
jaws.Sprite.prototype.rotate =        function(value) { this.angle += value; return this }
/** Force an rotation-angle on sprite */
jaws.Sprite.prototype.rotateTo =      function(value) { this.angle = value; return this }

/** Set x/y */
jaws.Sprite.prototype.moveTo =        function(x, y)  {
  if(jaws.isArray(x) && y === undefined) {
    y = x[1]
    x = x[0]
  }
  this.x = x; 
  this.y = y; 
  return this;
}
/** Modify x/y */
jaws.Sprite.prototype.move =          function(x, y)   { 
  if(jaws.isArray(x) && y === undefined) {
    y = x[1]
    x = x[0]
  }

  if(x) this.x += x;  
  if(y) this.y += y; 
  return this 
}
/** 
* scale sprite by given factor. 1=don't scale. <1 = scale down.  1>: scale up.
* Modifies width/height. 
**/
jaws.Sprite.prototype.scaleAll =      function(value) { this.scale_x *= value; this.scale_y *= value; return this.cacheOffsets() }
/** set scale factor. ie. 2 means a doubling if sprite in both directions. */
jaws.Sprite.prototype.scaleTo =       function(value) { this.scale_x = this.scale_y = value; return this.cacheOffsets() }
/** scale sprite horizontally by scale_factor. Modifies width. */
jaws.Sprite.prototype.scaleWidth =    function(value) { this.scale_x *= value; return this.cacheOffsets() }
/** scale sprite vertically by scale_factor. Modifies height. */
jaws.Sprite.prototype.scaleHeight =   function(value) { this.scale_y *= value; return this.cacheOffsets() }

/** Sets x */
jaws.Sprite.prototype.setX =          function(value) { this.x = value; return this }
/** Sets y */
jaws.Sprite.prototype.setY =          function(value) { this.y = value; return this }

/** Position sprites top on the y-axis */
jaws.Sprite.prototype.setTop =        function(value) { this.y = value + this.top_offset; return this }
/** Position sprites bottom on the y-axis */
jaws.Sprite.prototype.setBottom =     function(value) { this.y = value - this.bottom_offset; return this }
/** Position sprites left side on the x-axis */
jaws.Sprite.prototype.setLeft =       function(value) { this.x = value + this.left_offset; return this }
/** Position sprites right side on the x-axis */
jaws.Sprite.prototype.setRight =      function(value) { this.x = value - this.right_offset; return this }

/** Set new width. Scales sprite. */
jaws.Sprite.prototype.setWidth  =     function(value) { this.scale_x = value/this.image.width; return this.cacheOffsets() }
/** Set new height. Scales sprite. */
jaws.Sprite.prototype.setHeight =     function(value) { this.scale_y = value/this.image.height; return this.cacheOffsets() }
/** Resize sprite by adding width */
jaws.Sprite.prototype.resize =        function(width, height) { 
  if(jaws.isArray(width) && height === undefined) {
    height = width[1]
    width = width[0]
  }

  this.scale_x = (this.width + width) / this.image.width
  this.scale_y = (this.height + height) / this.image.height
  return this.cacheOffsets()
}
/** 
 * Resize sprite to exact width/height 
 */
jaws.Sprite.prototype.resizeTo =      function(width, height) {
  if(jaws.isArray(width) && height === undefined) {
    height = width[1]
    width = width[0]
  }

  this.scale_x = width / this.image.width
  this.scale_y = height / this.image.height
  return this.cacheOffsets()
}

/**
* The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
* or "when rotating, what point of the of the sprite will it rotate round"
*
* @example
* For example, a topdown shooter could use setAnchor("center") --> Place middle of the ship on x/y
* .. and a sidescroller would probably use setAnchor("center_bottom") --> Place "feet" at x/y
*/
jaws.Sprite.prototype.setAnchor = function(value) {
  var anchors = {
    top_left: [0,0],
    left_top: [0,0],
    center_left: [0,0.5],
    left_center: [0,0.5],
    bottom_left: [0,1],
    left_bottom: [0,1],
    top_center: [0.5,0],
    center_top: [0.5,0],
    center_center: [0.5,0.5],
    center: [0.5,0.5],
    bottom_center: [0.5,1],
    center_bottom: [0.5,1],
    top_right: [1,0],
    right_top: [1,0],
    center_right: [1,0.5],
    right_center: [1,0.5],
    bottom_right: [1,1],
    right_bottom: [1,1]
  }

  if(a = anchors[value]) {
    this.anchor_x = a[0]
    this.anchor_y = a[1]
    if(this.image) this.cacheOffsets();
  }
  return this
}

/** @private */
jaws.Sprite.prototype.cacheOffsets = function() {
  if(!this.image) { return }
  
  this.width = this.image.width * this.scale_x
  this.height = this.image.height * this.scale_y
  this.left_offset   = this.width * this.anchor_x
  this.top_offset    = this.height * this.anchor_y
  this.right_offset  = this.width * (1.0 - this.anchor_x)
  this.bottom_offset = this.height * (1.0 - this.anchor_y)

  if(this.cached_rect) this.cached_rect.resizeTo(this.width, this.height);
  return this
}

/** Returns a jaws.Rect() perfectly surrouning sprite. Also cache rect in this.cached_rect. */
jaws.Sprite.prototype.rect = function() {
  if(!this.cached_rect && this.width)   this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
  if(this.cached_rect)                  this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
  return this.cached_rect
} 

/** Draw sprite on active canvas */
jaws.Sprite.prototype.draw = function() {
  if(!this.image) { return this }

  this.context.save()
  this.context.translate(this.x, this.y)
  if(this.angle!=0) { jaws.context.rotate(this.angle * Math.PI / 180) }
  this.flipped && this.context.scale(-1, 1)
  this.context.globalAlpha = this.alpha
  this.context.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
  this.context.drawImage(this.image, 0, 0, this.width, this.height)
  this.context.restore()
  return this
}

/**
 * Scales image using hard block borders. Useful for that cute, blocky retro-feeling.
 * Depends on gfx.js beeing loaded.
 */
jaws.Sprite.prototype.scaleImage = function(factor) {
  if(!this.image) return;
  this.setImage( jaws.retroScaleImage(this.image, factor) )
  return this
}

/** 
 * Returns sprite as a canvas context.
 * For certain browsers, a canvas context is faster to work with then a pure image.
 */
jaws.Sprite.prototype.asCanvasContext = function() {
  var canvas = document.createElement("canvas")
  canvas.width = this.width
  canvas.height = this.height

  var context = canvas.getContext("2d")
  if(jaws.context)  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;

  context.drawImage(this.image, 0, 0, this.width, this.height)
  return context
}

/** 
 * Returns sprite as a canvas
 */
jaws.Sprite.prototype.asCanvas = function() {
  var canvas = document.createElement("canvas")
  canvas.width = this.width
  canvas.height = this.height

  var context = canvas.getContext("2d")
  if(jaws.context)  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;

  context.drawImage(this.image, 0, 0, this.width, this.height)
  return canvas
}

jaws.Sprite.prototype.toString = function() { return "[Sprite " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]" }

/** returns Sprites state/properties as a pure object */
jaws.Sprite.prototype.attributes = function() { 
  var object = {}                   // Starting with this.options could create circular references through "context"
  object["_constructor"] = this._constructor || "jaws.Sprite"
  object["x"] = parseFloat(this.x.toFixed(2))
  object["y"] = parseFloat(this.y.toFixed(2))
  object["image"] = this.image_path
  object["alpha"] = this.alpha
  object["flipped"] = this.flipped
  object["angle"] = parseFloat(this.angle.toFixed(2))
  object["scale_x"] = this.scale_x;
  object["scale_y"] = this.scale_y;
  object["anchor_x"] = this.anchor_x
  object["anchor_y"] = this.anchor_y

  if(this.data !== null) object["data"] = jaws.clone(this.data); // For external data (for example added by the editor) that you want serialized

  return object
}
/**
 * Load/creates sprites from given data
 *
 * Argument could either be
 * - an array of Sprite objects
 * - an array of JSON objects
 * - a JSON.stringified string representing an array of JSON objects
 *
 *  @return Array of created sprite
*
 */
jaws.Sprite.parse = function(objects) {
  var sprites = []
  
  if(jaws.isArray(objects)) {
    // If this is an array of JSON representations, parse it
    if(objects.every(function(item) { return item._constructor })) {
      parseArray(objects)
    } else {
      // This is already an array of Sprites, load it directly
      sprites = objects
    }
  }
  else if(jaws.isString(objects)) { parseArray( JSON.parse(objects) ); jaws.log.info(objects) }
  
  function parseArray(array) {
    array.forEach( function(data) {
      var constructor = data._constructor ? eval(data._constructor) : data.constructor
      if(jaws.isFunction(constructor)) {
        jaws.log.info("Creating " + data._constructor + "(" + data.toString() + ")", true)
        var object = new constructor(data)
        object._constructor = data._constructor || data.constructor.name
        sprites.push(object);
      }
    });
  }

  return sprites;
}

/**
 * returns a JSON-string representing the state of the Sprite.
 *
 * Use this to serialize your sprites / game objects, maybe to save in local storage or on a server
 *
 * jaws.game_states.Edit uses this to export all edited objects.
 *
 */
jaws.Sprite.prototype.toJSON = function() {
  return JSON.stringify(this.attributes())
}

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.Sprite }

/*
// Chainable setters under consideration:
jaws.Sprite.prototype.setFlipped =        function(value) { this.flipped = value; return this }
jaws.Sprite.prototype.setAlpha =          function(value) { this.alpha = value; return this }
jaws.Sprite.prototype.setAnchorX =        function(value) { this.anchor_x = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setAnchorY =        function(value) { this.anchor_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setAngle =          function(value) { this.angle = value; return this }
jaws.Sprite.prototype.setScale =    function(value) { this.scale_x = this.scale_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setScaleX =   function(value) { this.scale_x = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.setScaleY =   function(value) { this.scale_y = value; this.cacheOffsets(); return this }
jaws.Sprite.prototype.moveX =         function(x)     { this.x += x; return this }
jaws.Sprite.prototype.moveXTo =       function(x)     { this.x = x; return this }
jaws.Sprite.prototype.moveY =         function(y)     { this.y += y; return this }
jaws.Sprite.prototype.moveYTo =       function(y)     { this.y = y; return this }
jaws.Sprite.prototype.scaleWidthTo =  function(value) { this.scale_x = value; return this.cacheOffsets() }
jaws.Sprite.prototype.scaleHeightTo = function(value) { this.scale_y = value; return this.cachOfffsets() }
*/

var jaws = (function(jaws) {


/** 
 * @class Cut out invidual frames (images) from a larger spritesheet-image. "Field Summary" contains options for the SpriteSheet()-constructor.
 *
 * @property {image|image} Image/canvas or asset-string to cut up smaller images from
 * @property {string} orientation How to cut out invidual images from spritesheet, either "right" or "down"
 * @property {array} frame_size  width and height of invidual frames in spritesheet
 * @property {array} frames all single frames cut out from image
 * @property {integer} offset vertical or horizontal offset to start cutting from
 * @property {int} scale_image Scale the sprite sheet by this factor before cutting out the frames. frame_size is automatically re-sized too
 *
*/
jaws.SpriteSheet = function SpriteSheet(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options);

  /* Detect framesize from filename, example: droid_10x16.png means each frame is 10px high and 16px wide */
  if(jaws.isString(this.image) && !options.frame_size) {
    var regexp = new RegExp("_(\\d+)x(\\d+)", "g");
    var sizes = regexp.exec(this.image)
    this.frame_size = []
    this.frame_size[0] = parseInt(sizes[1])
    this.frame_size[1] = parseInt(sizes[2])
  }

  this.image = jaws.isDrawable(this.image) ? this.image : jaws.assets.data[this.image]
  if(this.scale_image) {
    var image = (jaws.isDrawable(this.image) ? this.image : jaws.assets.get(this.image))
    this.frame_size[0] *= this.scale_image
    this.frame_size[1] *= this.scale_image
    this.image = jaws.retroScaleImage(image, this.scale_image)
  }

  var index = 0
  this.frames = []

  // Cut out tiles from Top -> Bottom
  if(this.orientation == "down") {  
    for(var x=this.offset; x < this.image.width; x += this.frame_size[0]) {
      for(var y=0; y < this.image.height; y += this.frame_size[1]) {
        this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
      }
    }
  }
  // Cut out tiles from Left -> Right
  else {
    for(var y=this.offset; y < this.image.height; y += this.frame_size[1]) {
      for(var x=0; x < this.image.width; x += this.frame_size[0]) {
        this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
      }
    }
  }
}

jaws.SpriteSheet.prototype.default_options = {
  image: null,
  orientation: "down",
  frame_size: [32,32],
  offset: 0,
  scale_image: null
}

/** @private
 * Cut out a rectangular piece of a an image, returns as canvas-element 
 */
function cutImage(image, x, y, width, height) {
  var cut = document.createElement("canvas")
  cut.width = width
  cut.height = height
  
  var ctx = cut.getContext("2d")
  ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height)
  
  return cut
};

jaws.SpriteSheet.prototype.toString = function() { return "[SpriteSheet " + this.frames.length + " frames]" }

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/**
 * @class Manages an animation with a given list of frames. "Field Summary" contains options for the Animation()-constructor.
 *
 * @property {bool} loop        Restart animation when end is reached
 * @property {bool} bounce      Rewind the animation frame by frame when end is reached
 * @property {int} index          Start on this frame
 * @property {array} frames       Images/canvaselements
 * @property {milliseconds} frame_duration  How long should each frame be displayed
 * @property {int} frame_direction  -1 for backwards animation. 1 is default
 * @property {array} frame_size     Containing width/height, eg. [32, 32]
 * @property {int} offset           When cutting out frames from a sprite sheet, start at this frame
 * @property {string} orientation   How to cut out frames frmo sprite sheet, possible values are "down" or "right"
 * @property {function} on_end      Function to call when animation ends. triggers only on non-looping, non-bouncing animations
 * @property {object} subsets       Name specific frames-intervals for easy access later, i.e. {move: [2,4], fire: [4,6]}. Access with animation.subset[name]
 *
 * @example
 * // in setup()
 * anim = new jaws.Animation({sprite_sheet: "droid_11x15.png", frame_size: [11,15], frame_duration: 100})
 * player = new jaws.Sprite({y:300, anchor: "center_bottom"})
 *
 * // in update()
 * player.setImage( anim.next() )
 *
 * // in draw()
 * player.draw()
 *
 */
jaws.Animation = function Animation(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options);

  if(options.sprite_sheet) {
    var sprite_sheet = new jaws.SpriteSheet({image: options.sprite_sheet, scale_image: this.scale_image, frame_size: this.frame_size, orientation: this.orientation, offset: this.offset})
    this.frames = sprite_sheet.frames
    this.frame_size = sprite_sheet.frame_size
  }

  if(options.scale_image) {
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    this.frame_size[0] *= options.scale_image
    this.frame_size[1] *= options.scale_image
    options.sprite_sheet = jaws.retroScaleImage(image, options.scale_image)
  }

  /* Initializing timer-stuff */
  this.current_tick = (new Date()).getTime();
  this.last_tick = (new Date()).getTime();
  this.sum_tick = 0

  if(options.subsets) {
    this.subsets = {}
    for(subset in options.subsets) {
      start_stop = options.subsets[subset]
      this.subsets[subset] = this.slice(start_stop[0], start_stop[1])
    }
  }
}

jaws.Animation.prototype.default_options = {
  frames: [],
  subsets: [],
  frame_duration: 100,  // default: 100ms between each frameswitch
  index: 0,             // default: start with the very first frame
  loop: 1,
  bounce: 0,
  frame_direction: 1,
  frame_size: null,
  orientation: "down",
  on_end: null,
  offset: 0,
  scale_image: null,
  sprite_sheet: null
}

/**
 * Return a special animationsubset created with "subset"-parameter when initializing
 *
 */
jaws.Animation.prototype.subset = function(subset) {
  return this.subsets[subset]
}

/**
 Propells the animation forward by counting milliseconds and changing this.index accordingly
 Supports looping and bouncing animations
*/
jaws.Animation.prototype.update = function() {
  this.current_tick = (new Date()).getTime();
  this.sum_tick += (this.current_tick - this.last_tick);
  this.last_tick = this.current_tick;

  if(this.sum_tick > this.frame_duration) {
    this.index += this.frame_direction
    this.sum_tick = 0
  }
  if( (this.index >= this.frames.length) || (this.index < 0) ) {
    if(this.bounce) {
      this.frame_direction = -this.frame_direction
      this.index += this.frame_direction * 2
    }
    else if(this.loop) {
      if(this.frame_direction < 0) { 
        this.index = this.frames.length -1; 
      } else { 
        this.index = 0; 
      }
    }
    else {
      this.index -= this.frame_direction
      if (this.on_end) {
        this.on_end()
        this.on_end = null
      }
    }
  }
  return this
}

/**
  works like Array.slice but returns a new Animation-object with a subset of the frames
*/
jaws.Animation.prototype.slice = function(start, stop) {
  var o = {}
  o.frame_duration = this.frame_duration
  o.loop = this.loop
  o.bounce = this.bounce
  o.on_end = this.on_end
  o.frame_direction = this.frame_direction
  o.frames = this.frames.slice().slice(start, stop)
  return new jaws.Animation(o)
};

/**
  Moves animation forward by calling update() and then return the current frame
*/
jaws.Animation.prototype.next = function() {
  this.update()
  return this.frames[this.index]
};

/** returns true if animation is at the very last frame */
jaws.Animation.prototype.atLastFrame = function() { return (this.index == this.frames.length-1) }

/** returns true if animation is at the very first frame */
jaws.Animation.prototype.atFirstFrame = function() { return (this.index == 0) }


/**
  returns the current frame
*/
jaws.Animation.prototype.currentFrame = function() {
  return this.frames[this.index]
};

/**
 * Debugstring for Animation()-constructor
 * @example
 * var anim = new Animation(...)
 * console.log(anim.toString())
 */
jaws.Animation.prototype.toString = function() { return "[Animation, " + this.frames.length + " frames]" }

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/**
 *
 * @class A window (Rect) into a bigger canvas/image. Viewport is always contained within that given image (called the game world). "Field Summary" contains options for the Viewport()-constructor.
 *
 * @property {int} width  Width of viewport, defaults to canvas width
 * @property {int} height Height of viewport, defaults to canvas height
 * @property {int} max_x  Maximum x-position for viewport, defaults to canvas width
 * @property {int} max_y  Maximum y-position for viewport, defaults to canvas height 
 * @property {int} x      X-position for the upper left corner of the viewport
 * @property {int} y      Y-position for the upper left corner of the viewport
 *
 * @example
 * // Center viewport around players position (player needs to have x/y attributes)
 * // Usefull for sidescrollers
 * viewport.centerAround(player)
 *
 * // Common viewport usage. max_x/max_y could be said to set the "game world size"
 * viewport = viewport = new jaws.Viewport({max_x: 400, max_y: 3000})
 * player = new jaws.Sprite({x:100, y:400})
 * viewport.centerAround(player)
 *
 * // Draw player relative to the viewport. If viewport is way off, player won't even show up.
 * viewport.apply( function() {
 *  player.draw()
 * });
 *
 */


jaws.Viewport = function ViewPort(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options)
 
  /* This is needed cause default_options is set loadtime, we need to get width etc runtime */
  if(!this.context) this.context = jaws.context;
  if(!this.width)   this.width = jaws.width;
  if(!this.height)  this.height = jaws.height;
  if(!this.max_x)   this.max_x = jaws.width;
  if(!this.max_y)   this.max_y = jaws.height;

  var that = this

  /** Move viewport x pixels horizontally and y pixels vertically */
  this.move = function(x, y) {
    x && (this.x += x)
    y && (this.y += y)
    this.verifyPosition()
  };
  
  /** Move viewport to given x/y */
  this.moveTo = function(x, y) {
    if(!(x==undefined)) { this.x = x }
    if(!(y==undefined)) { this.y = y }
    this.verifyPosition()
  };

  /** 
   * Returns true if item is outside viewport 
   * @example
   *
   * if( viewport.isOutside(player)) player.die();
   *
   * // ... or the more advanced:
   * bullets = new SpriteList()
   * bullets.push( bullet )
   * bullets.removeIf( viewport.isOutside )
   *
   */
  this.isOutside = function(item) {
    return(!that.isInside(item))
  };

  /** Returns true if item is inside viewport  */
  this.isInside = function(item) {
    return( item.x >= that.x && item.x <= (that.x + that.width) && item.y >= that.y && item.y <= (that.y + that.height) )
  };

  /** Returns true if item is partly (down to 1 pixel) inside viewport */
  this.isPartlyInside = function(item) {
    var rect = item.rect()
    return( rect.right >= that.x && rect.x <= (that.x + that.width) && rect.bottom >= that.y && item.y <= (that.y + that.height) )
  };
  
  /** Returns true of item is left of viewport */
  this.isLeftOf = function(item) { return(item.x < that.x)  }
 
  /** Returns true of item is right of viewport */
  this.isRightOf = function(item) { return(item.x > (that.x + that.width) )  }

  /** Returns true of item is above viewport */
  this.isAbove = function(item) { return(item.y < that.y)  }

  /** Returns true of item is above viewport */
  this.isBelow = function(item) { return(item.y > (that.y + that.height) )  }


  /** 
   * center the viewport around item. item must respond to x and y for this to work. 
   * Usefull for sidescrollers when you wan't to keep the player in the center of the screen no matter how he moves.
   */
  this.centerAround = function(item) {
    this.x = Math.floor(item.x - this.width / 2);
    this.y = Math.floor(item.y - this.height / 2);
    this.verifyPosition();
  };

  /**
   * force 'item' inside current viewports visible area
   * using 'buffer' as indicator how close to the 'item' is allowed to go
   *
   * @example
   *
   * viewport.move(10,0)                          // scroll forward
   * viewport.forceInsideVisibleArea(player, 20)  // make sure player doesn't get left behind
   */
  this.forceInsideVisibleArea = function(item, buffer) {
    if(item.x < this.x+buffer)               { item.x = this.x+buffer }
    if(item.x > this.x+jaws.width-buffer)    { item.x = this.x+jaws.width-buffer }
    if(item.y < this.y+buffer)               { item.y = this.y+buffer }
    if(item.y > this.y+jaws.height-buffer)   { item.y = this.y+jaws.height-buffer }
  }
  
  /**
   * force 'item' inside the limits of the viewport
   * using 'buffer' as indicator how close to the 'item' is allowed to go
   *
   * @example
   * viewport.forceInside(player, 10) 
   */
  this.forceInside = function(item, buffer) {
    if(item.x < buffer)               { item.x = buffer }
    if(item.x > this.max_x-buffer)    { item.x = this.max_x-buffer }
    if(item.y < buffer)               { item.y = buffer }
    if(item.y > this.max_y-buffer)    { item.y = this.max_y-buffer }
  }


  /** 
  * executes given draw-callback with a translated canvas which will draw items relative to the viewport
  * 
  * @example
  *
  * viewport.apply( function() {
  *   player.draw();
  *   foo.draw();
  * });
  * 
  */
  this.apply = function(func) {
    this.context.save()
    this.context.translate(-this.x, -this.y)
    func()
    this.context.restore()
  };

  /** 
   * if obj is an array-like object, iterate through it and call draw() on each item if it's partly inside the viewport 
   */
  this.draw = function( obj ) {
    this.apply( function() {
      if(obj.forEach) obj.forEach( that.drawIfPartlyInside );
      else if(obj.draw) that.drawIfPartlyInside(obj);
      // else if(jaws.isFunction(obj) {};  // add apply()-functionally here?
    });
  }

  /** 
   * draws all items of 'tile_map' that's lies inside the viewport 
   * this is simular to viewport.draw( tile_map.all() ) but optmized for Huge game worlds (tile maps)
   */
  this.drawTileMap = function( tile_map ) {
    var sprites = tile_map.atRect({ x: this.x, y: this.y, right: this.x + this.width, bottom: this.y + this.height })
    this.apply( function() {
      for(var i=0; i < sprites.length; i++) sprites[i].draw();
    });
  }

  /** draws 'item' if it's partly inside the viewport */
  this.drawIfPartlyInside = function(item) { 
    if(that.isPartlyInside(item)) item.draw(); 
  }

  /** @private */
  this.verifyPosition = function() {
    var max = this.max_x - this.width
    if(this.x < 0)      { this.x = 0 }
    if(this.x > max)    { this.x = max }

    var max = this.max_y - this.height
    if(this.y < 0)      { this.y = 0 }
    if(this.y > max)    { this.y = max }
  };
 
  this.moveTo(options.x||0, options.y||0)
}

jaws.Viewport.prototype.default_options = {
  context: null,
  width: null,
  height: null,
  max_x: null,
  max_y: null,
  x: 0,
  y: 0
};

jaws.Viewport.prototype.toString = function() { return "[Viewport " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]" }

return jaws;
})(jaws || {});

/**
 * @fileOverview Collision Detection
 * 
 * Collision detection helpers.
 *
 * @example
 *   // collision helper exampels:
 *   collideOneWithOne(player, boss)        // -> false
 *   collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
 *   collideManyWithMany(bullets, enemies)  // -> [ [bullet1, enemy1], [bullet2, enemy2] ]
 *   collide(player, boss)                  // -> false
 *   collide(player, 
 *           bullets,
 *           function(player, bullet) {})   // Callback: arguments[0] -> player 
 *                                          //           arguments[1] -> bullets[i]
 *
 */
var jaws = (function(jaws) {

  /**
   * Collides two objects by reading x, y and either method rect() or property radius.
   * @public
   * @param {object} object1 An object with a 'radius' or 'rect' property
   * @param {object} object2 An object with a 'radius' or 'rect' property
   * @returns {boolean} If the two objects are colliding or not
   */
  jaws.collideOneWithOne = function(object1, object2) {
    if (object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))
      return true;

    if (object1.rect && object2.rect && object1 !== object2 && jaws.collideRects(object1.rect(), object2.rect()))
      return true;

    return false;
  };

  /**
   * Compares an object against a list, returning those from list that collide with object, and
   *  calling 'callback' per collision (if set) with object and item from list.
   *  (Note: Will never collide objects with themselves.)
   * @public
   * @param {object} object An object with a 'radius' or 'rect' property
   * @param {array|object} list A collection of objects with a 'length' property
   * @param {function} callback The function to be called per collison detected
   * @returns {array} A collection of items colliding with object from list
   * @example
   * collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
   * collideOneWithMany(player, bullets, function(player, bullet) {
   *  //player and bullet (bullets[i])
   * });
   */
  jaws.collideOneWithMany = function(object, list, callback) {
    var a = [];
    if (callback) {
      for (var i = 0; i < list.length; i++) {
        if (jaws.collideOneWithOne(object, list[i])) {
          callback(object, list[i]);
          a.push(list[i])
        }
      }
      return a;
    }
    else {
      return list.filter(function(item) {
        return jaws.collideOneWithOne(object, item);
      });
    }
  };

  /**
   * Compares two lists, returning those items from each that collide with each other, and
   *  calling 'callback' per collision (if set) with item from list1 and item from list2.
   *  (Note: Will never collide objects with themselves.)
   * @public
   * @param {array|object} list1 A collection of objects with a 'forEach' property
   * @param {array|object} list2 A collection of objects with a 'forEach' property
   * @param {function} callback The function to be called per collison detected
   * @returns {array} A collection of items colliding with list1 from list2
   * @example
   *  jaws.collideManyWithMany(bullets, enemies) // --> [[bullet, enemy], [bullet, enemy]]
   */
  jaws.collideManyWithMany = function(list1, list2, callback) {
    var a = [];

    if (list1 === list2) {
      combinations(list1, 2).forEach(function(pair) {
        if (jaws.collideOneWithOne(pair[0], pair[1])) {
          if (callback) {
            callback(pair[0], pair[1]);
          }
          else {
            a.push([pair[0], pair[1]]);
          }
        }
      });
    }
    else {
      list1.forEach(function(item1) {
        list2.forEach(function(item2) {
          if (jaws.collideOneWithOne(item1, item2)) {
            if (callback) {
              callback(item1, item2);
            }
            else {
              a.push([item1, item2]);
            }
          }
        });
      });
    }

    return a;
  };

  /**
   * Returns if two circle-objects collide with each other
   * @public
   * @param {object} object1 An object with a 'radius' property
   * @param {object} object2 An object with a 'radius' property
   * @returns {boolean} If two circle-objects collide or not
   */
  jaws.collideCircles = function(object1, object2) {
    return (jaws.distanceBetween(object1, object2) < object1.radius + object2.radius);
  };

  /**
   * Returns if two Rects collide with each other or not
   * @public
   * @param {object} rect1 An object with 'x', 'y', 'right' and 'bottom' properties
   * @param {object} rect2 An object with 'x', 'y', 'right' and 'bottom' properties
   * @returns {boolean} If two Rects collide with each other or not
   */
  jaws.collideRects = function(rect1, rect2) {
    return ((rect1.x >= rect2.x && rect1.x <= rect2.right) || (rect2.x >= rect1.x && rect2.x <= rect1.right)) &&
            ((rect1.y >= rect2.y && rect1.y <= rect2.bottom) || (rect2.y >= rect1.y && rect2.y <= rect1.bottom));
  };

  /**
   * Returns the distance between two objects
   * @public
   * @param {object} object1 An object with 'x' and 'y' properties
   * @param {object} object2 An object with 'x' and 'y' properties
   * @returns {number} The distance between two objects
   */
  jaws.distanceBetween = function(object1, object2) {
    return Math.sqrt(Math.pow(object1.x - object2.x, 2) + Math.pow(object1.y - object2.y, 2));
  };

  /**
   * Creates combinations of items from a list of a specific size
   * @private
   * @param {array|object} list An object with a 'length' property
   * @param {number} n The size of the array to return
   * @returns {Array} An array of items having a specific size number of its own entries
   */
  function combinations(list, n) {
    var f = function(i) {
      if (list.isSpriteList !== undefined) {
        return list.at(i);
      } else {  // s is an Array
        return list[i];
      }
    };
    var r = [];
    var m = new Array(n);
    for (var i = 0; i < n; i++)
      m[i] = i;
    for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length) {
      r.push(m.map(f));
      while (0 <= i && m[i] === sn - 1) {
        i--;
        sn--;
      }
      if (0 <= i) {
        m[i] += 1;
        for (var j = i + 1; j < n; j++)
          m[j] = m[j - 1] + 1;
        i = n - 1;
      }
    }
    return r;
  }

  /**
   * If an object has items or not
   * @private
   * @param {array|object} array An object with a 'length' property
   * @returns {boolean} If the object has items (length > 0)
   */
  function hasItems(array) {
    return (array && array.length > 0);
  }

  /**
   * Compares two objects or lists, returning if they collide, and 
   *  calling 'callback' per collision (if set) between objects or lists.
   * @param {array|object} x An object with either 'rect' or 'forEach' property
   * @param {array|object} x2 An object with either 'rect' or 'forEach' property
   * @param {function} callback
   * @returns {boolean}
   * @examples
   *   jaws.collide(player, enemy, function(player, enemy) { ... } )  
   *   jaws.collide(player, enemies, function(player, enemy) { ... } ) 
   *   jaws.collide(bullets, enemies, function(bullet, enemy) { ... } )
   */
  jaws.collide = function(x, x2, callback) {
    if ((x.rect || x.radius) && x2.forEach)
      return (jaws.collideOneWithMany(x, x2, callback).length > 0);
    if (x.forEach && x2.forEach)
      return (jaws.collideManyWithMany(x, x2, callback).length > 0);
    if (x.forEach && (x2.rect || x2.radius))
      return (jaws.collideOneWithMany(x2, x, callback).length > 0);
    if ((x.rect && x2.rect) || (x.radius && x2.radius)) {
      var result = jaws.collideOneWithOne(x, x2);
      if (callback && result)
        callback(x, x2);
      else
        return result;
    }
  };

  return jaws;
})(jaws || {});

var jaws = (function(jaws) {
/**
* @class jaws.PixelMap
* @constructor
*
* Worms-style terrain collision detection. Created from a normal image. 
* Read out specific pixels. Modify as you would do with a canvas.
*  
* @property {string} image        the image of the terrain
* @property {int} scale_image     Scale the image by this factor
*
* @example
* tile_map = new jaws.Parallax({image: "map.png", scale_image: 4})  // scale_image: 4 for retro blocky feeling!
* tile_map.draw()                                     // draw on canvas
* tile_map.nameColor([0,0,0,255], "ground")           // give the color black the name "ground"
* tile_map.namedColorAtRect("ground", player.rect())  // True if players boundingbox is touching any black pixels on tile_map 
*
*/
jaws.PixelMap = function PixelMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.options = options
  this.scale = options.scale || 1
  this.x = options.x || 0
  this.y = options.y || 0

  if(options.image) {
    this.setContext(options.image);

    if(options.scale_image) {
      this.setContext(  jaws.retroScaleImage(this.context.canvas, options.scale_image) )
    }

    this.width = this.context.canvas.width * this.scale;
    this.height = this.context.canvas.height * this.scale;
  }
  else { jaws.log.warn("PixelMap needs an image to work with") }
  
  this.named_colors = [];
  this.update();
}

/*
* Initiates a drawable context from given image.
* @private
*/
jaws.PixelMap.prototype.setContext = function(image) {
  var image = jaws.isDrawable(image) ? image : jaws.assets.get(image)
  this.context = jaws.imageToCanvasContext(image)
} 

/**
* Updates internal pixel-array from the canvas. If we modify the 'terrain' (paint on pixel_map.context) we'll need to call this method.
*/
jaws.PixelMap.prototype.update = function(x, y, width, height) {
  if(x === undefined || x < 0) x = 0;
  if(y === undefined || y < 0) y = 0;
  if(width === undefined || width > this.width)     width = this.width;
  if(height === undefined || height > this.height)  height = this.height;
 
  // No arguments? Read whole canvas, replace this.data
  if(arguments.length == 0) {
    this.data = this.context.getImageData(x, y, width, height).data
  }
  // Read a rectangle from the canvas, replacing relevant pixels in this.data
  else {
    var tmp = this.context.getImageData(x, y, width, height).data
    var tmp_count = 0;

    // Some precalculation-optimizations
    var one_line_down = this.width * 4;
    var offset = (y * this.width * 4)  + (x*4);
    var horizontal_line = width*4;

    for(var y2 = 0; y2 < height; y2++) {
      for(var x2 = 0; x2 < horizontal_line; x2++) {
        this.data[offset + x2] = tmp[tmp_count++];
      }  
      offset += one_line_down;
    }
  }
}

/**
* Draws the pixel map on the maincanvas
*/ 
jaws.PixelMap.prototype.draw = function() {
  jaws.context.drawImage(this.context.canvas, this.x, this.y, this.width, this.height)
}

/**
* Trace the outline of a Rect until a named color found.
*
* @param {object} Rect          Instance of jaws.Rect()
* @param {string} Color_Filter  Only look for this named color
*
* @return {string}  name of found color
*/
jaws.PixelMap.prototype.namedColorAtRect = function(rect, color) {
  var x = rect.x
  var y = rect.y

  for(; x < rect.right-1; x++)  if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);
  for(; y < rect.bottom-1; y++) if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);
  for(; x > rect.x; x--)      if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);
  for(; y > rect.y; y--)      if(this.namedColorAt(x, y) == color || color===undefined) return this.namedColorAt(x,y);

  return false;
}

/**
* Read current color at given coordinates X/Y 
*
* @return {array}   4 integers [R, G, B, A] representing the pixel at x/y
*/
jaws.PixelMap.prototype.at = function(x, y) {
  x = parseInt(x)
  y = parseInt(y)
  if(y < 0) y = 0;

  var start = (y * this.width * 4) + (x*4);
  var R = this.data[start];
  var G = this.data[start + 1];
  var B = this.data[start + 2];
  var A = this.data[start + 3];
  return [R, G, B, A];
}

/**
* Get previously named color if it exists at given x/y-coordinates.
*
* @return {string} name or color
*/
jaws.PixelMap.prototype.namedColorAt = function(x, y) {
  var a = this.at(x, y);
  for(var i=0; i < this.named_colors.length; i++) {
    var name = this.named_colors[i].name;
    var c = this.named_colors[i].color;
    if(c[0] == a[0] && c[1] == a[1] && c[2] == a[2] && c[3] == a[3]) return name;
  }
}

/**
* Give a RGBA-array a name. Later on we can work with names instead of raw colorvalues.
*
* @example
* pixel_map.nameColor([0,0,0,255], "ground")    // Give the color black (with no transparency) the name "ground"
*/
jaws.PixelMap.prototype.nameColor = function(color, name) {
  this.named_colors.push({name: name, color: color});
}

return jaws;
})(jaws || {});
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
/*
 * @class jaws.QuadTree
 * @property {jaws.Rect}  bounds    Rect(x,y,width,height) defining bounds of tree
 * @property {number}     depth     The depth of the root node
 * @property {array}      nodes     The nodes of the root node
 * @property {array}      objects   The objects of the root node
 * @example
 * setup: 
 *      var quadtree = new jaws.QuadTree();
 * update:
 *      quadtree.collide(sprite or list, sprite or list, callback function);
 */
var jaws = (function(jaws) {

  /**
   * Creates an empty quadtree with optional bounds and starting depth
   * @constructor
   * @param {jaws.Rect}   [bounds]    The defining bounds of the tree
   * @param {number}      [depth]     The current depth of the tree
   */
  jaws.QuadTree = function(bounds) {
    this.depth = arguments[1] || 0;
    this.bounds = bounds || new jaws.Rect(0, 0, jaws.width, jaws.height);
    this.nodes = [];
    this.objects = [];
  };

  /**
   * Moves through the nodes and deletes them.
   * @this {jaws.QuadTree}
   */
  jaws.QuadTree.prototype.clear = function() {
    this.objects = [];

    for (var i = 0; i < this.nodes.length; i++) {
      if (typeof this.nodes[i] !== 'undefined') {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
    }
  };

  /**
   * Creates four new branches sub-dividing the current node's width and height
   * @private
   * @this {jaws.QuadTree}
   */
  jaws.QuadTree.prototype.split = function() {
    var subWidth = Math.round((this.bounds.width / 2));
    var subHeight = Math.round((this.bounds.height / 2));
    var x = this.bounds.x;
    var y = this.bounds.y;

    this.nodes[0] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y, subWidth, subHeight), this.depth + 1);
    this.nodes[1] = new jaws.QuadTree(new jaws.Rect(x, y, subWidth, subHeight), this.depth + 1);
    this.nodes[2] = new jaws.QuadTree(new jaws.Rect(x, y + subHeight, subWidth, subHeight), this.depth + 1);
    this.nodes[3] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y + subHeight, subWidth, subHeight), this.depth + 1);
  };

  /**
   * Returns the index of a node's branches if passed-in object fits within it
   * @private 
   * @param {object} pRect  An object with the properties x, y, width, and height
   * @returns {index} The index of nodes[] that matches the dimensions of passed-in object
   */
  jaws.QuadTree.prototype.getIndex = function(pRect) {
    var index = -1;
    var verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    var horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    var topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint);
    var bottomQuadrant = (pRect.y > horizontalMidpoint);

    if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      }
      else if (bottomQuadrant) {
        index = 2;
      }
    }
    else if (pRect.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      }
      else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  };

  /**
   * Inserts an object into the quadtree, spliting it into new branches if needed
   * @param {object} pRect An object with the properties x, y, width, and height
   */
  jaws.QuadTree.prototype.insert = function(pRect) {

    if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") &&
            !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
      return;
    }

    if (typeof this.nodes[0] !== 'undefined') {
      var index = this.getIndex(pRect);

      if (index !== -1) {
        this.nodes[index].insert(pRect);
        return;
      }
    }

    this.objects.push(pRect);

    if (typeof this.nodes[0] === 'undefined') {
      this.split();
    }

    var i = 0;
    while (i < this.objects.length) {
      var index = this.getIndex(this.objects[i]);
      if (index !== -1) {
        this.nodes[index].insert(this.objects.splice(i, 1)[0]);
      }
      else {
        i++;
      }
    }

  };

  /**
   * Returns those objects on the branch matching the position of the passed-in object
   * @param {object} pRect An object with properties x, y, width, and height
   * @returns {array} The objects on the same branch as the passed-in object
   */
  jaws.QuadTree.prototype.retrieve = function(pRect) {

    if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") &&
            !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
      return;
    }

    var index = this.getIndex(pRect);
    var returnObjects = this.objects;
    if (typeof this.nodes[0] !== 'undefined') {
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));
      } else {
        for (var i = 0; i < this.nodes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
        }
      }
    }
    return returnObjects;
  };

  /**
   * Checks for collisions between objects by creating a quadtree, inserting one or more objects,
   *  and then comparing the results of a retrieval against another single or set of objects.
   *  
   *  With the callback argument, it will call a function and pass the items found colliding
   *   as the first and second argument.
   *   
   *  Without the callback argument, it will return a boolean value if any collisions were found.
   * 
   * @param {object|array} list1 A single or set of objects with properties x, y, width, and height
   * @param {object|array} list2 A single or set of objects with properties x, y, width, and height
   * @param {function} [callback]  The function to call per collision
   * @returns {boolean} If the items (or any within their sets) collide with one another
   */
  jaws.QuadTree.prototype.collide = function(list1, list2, callback) {

    var overlap = false;
    var tree = new jaws.QuadTree();
    var temp = [];

    if (!(list1.forEach)) {
      temp.push(list1);
      list1 = temp;
    }

    if (!(list2.forEach)) {
      temp = [];
      temp.push(list2);
      list2 = temp;
    }

    list2.forEach(function(el) {
      tree.insert(el);
    });

    list1.forEach(function(el) {
      if(jaws.collide(el, tree.retrieve(el), callback)) {
        overlap = true;
      }
    });

    tree.clear();
    return overlap;
  };

  return jaws;

})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.QuadTree;
}
;window.addEventListener("load", function() { if(jaws.onload) jaws.onload(); }, false);