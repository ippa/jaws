/* Built at 2013-08-21 22:30:31 +0200 */
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

    jaws.canvas = document.getElementsByTagName('canvas')[0];
    if (!jaws.canvas) {
      jaws.dom = document.getElementById("canvas");
    }

    // Ordinary <canvas>, get context
    if (jaws.canvas) {
      jaws.context = jaws.canvas.getContext('2d');
    } else if (jaws.dom) {
      jaws.dom.style.position = "relative";
    } else {
      jaws.canvas = document.createElement("canvas");
      jaws.canvas.width = options.width;
      jaws.canvas.height = options.height;
      jaws.context = jaws.canvas.getContext('2d');
      document.body.appendChild(jaws.canvas);
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

    if (!jaws.isFunction(game_state)) {
      jaws.log.error("jaws.start: Passed in GameState is not a function.");
      return;
    }
    if (!jaws.isObject(game_state_setup_options) && game_state_setup_options !== undefined) {
      jaws.log.error("jaws.start: The setup options for the game state is not an object.");
      return;
    }

    if (!options)
      options = {};
    var fps = options.fps || 60;
    if (options.loading_screen === undefined)
      options.loading_screen = true;
    if (!options.width)
      options.width = 500;
    if (!options.height)
      options.height = 300;
    jaws.init(options);

    if (options.loading_screen) {
      jaws.assets.displayProgress(0);
    }

    jaws.log("setupInput()", true);
    jaws.setupInput();

    /* Callback for when one single asset has been loaded */
    function assetLoaded(src, percent_done) {
      jaws.log(percent_done + "%: " + src, true);
      if (options.loading_screen) {
        jaws.assets.displayProgress(percent_done);
      }
    }

    /* Callback for when an asset can't be loaded*/
    function assetError(src, percent_done) {
      jaws.log(percent_done + "%: Error loading asset " + src, true);
    }

    /* Callback for when all assets are loaded */
    function assetsLoaded() {
      jaws.log("all assets loaded", true);
      jaws.switchGameState(game_state || window, {fps: fps}, game_state_setup_options);
    }

    jaws.log("assets.loadAll()", true);
    if (jaws.assets.length() > 0) {
      jaws.assets.loadAll({onload: assetLoaded, onerror: assetError, onfinish: assetsLoaded});
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

    if (!jaws.isFunction(game_state)) {
      jaws.log.error("jaws.switchGameState: Passed in GameState is not a function.");
      return;
    }

    game_state = new game_state;

    var fps = (options && options.fps) || (jaws.game_loop && jaws.game_loop.fps) || 60;

    jaws.game_loop && jaws.game_loop.stop();
    jaws.clearKeyCallbacks();

    jaws.previous_game_state = jaws.game_state;
    jaws.game_state = game_state;
    jaws.game_loop = new jaws.GameLoop(game_state, {fps: fps}, game_state_setup_options);
    jaws.game_loop.start();
  };

  /**
   * Creates a new HTMLCanvasElement from a HTMLImageElement
   * @param   {HTMLImageElement}  image   The HTMLImageElement to convert to a HTMLCanvasElement
   * @returns {HTMLCanvasElement}         A HTMLCanvasElement with drawn HTMLImageElement content
   */
  jaws.imageToCanvas = function(image) {

    if (!jaws.isImage(image)) {
      jaws.log.error("jaws.imageToCanvas: Passed in object is not an image.");
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
  array_of_strings.forEach( function(item, index) {
    prevent_default_keys[item] = true
  });
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
    jaws.log("game loop start", true)
  
    this.first_tick = (new Date()).getTime();
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 

    if(game_object.setup) { game_object.setup(game_state_setup_options) }
    step_delay = 1000 / options.fps;
   
    if(options.fps == 60) {
      requestAnimFrame(this.loop)
    }
    else {
      update_id = setInterval(this.loop, step_delay);
    }

    jaws.log("game loop loop", true)
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
  this.right = x + width
  this.bottom = y + height
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
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}
/** Modify width and height */
jaws.Rect.prototype.resize = function(width, height) {
  this.width += width
  this.height += height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}
/** Set width and height */
jaws.Rect.prototype.resizeTo = function(width, height) {
  this.width = width
  this.height = height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}

/** Draw rect in color red, useful for debugging */
jaws.Rect.prototype.draw = function() {
  jaws.context.strokeStyle = "red"
  jaws.context.strokeRect(this.x, this.y, this.width, this.height)
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
  
  if(options.context) { 
    this.context = options.context
  }
  else if(options.dom) {  // No canvas context? Switch to DOM-based spritemode
    this.dom = options.dom
    this.createDiv() 
  }
  if(!options.context && !options.dom) {                  // Defaults to jaws.context or jaws.dom
    if(jaws.context)  this.context = jaws.context;
    else {
      this.dom = jaws.dom;
      this.createDiv() 
    }
  }
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
  color: null,
  width: null,
  height: null,
  _constructor: null,
  dom: null,
  context: null
}

/** 
 * @private
 * Call setters from JSON object. Used to parse options.
 */
jaws.Sprite.prototype.set = function(options) {
  jaws.parseOptions(this, options, this.default_options);

  if(this.scale)        this.scale_x = this.scale_y = this.scale;
  if(this.image)        this.setImage(this.image);
  if(this.scale_image)  this.scaleImage(this.scale_image);
  if(this.anchor)       this.setAnchor(this.anchor);
  
  if(!this.image && this.color && this.width && this.height) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.fillStyle = this.color;
    context.fillRect(0, 0, this.width, this.height);
    this.image = context.getImageData(0, 0, this.width, this.height);
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
      console.log("WARNING: Image '" + value + "' not preloaded with jaws.assets.add(). Image and a working sprite.rect() will be delayed.")
      jaws.assets.load(value, function() { that.image = jaws.assets.get(value); that.cacheOffsets(); }) 
    }
  }
  return this
}

/** Flips image vertically, usefull for sidescrollers when player is walking left/right */
jaws.Sprite.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
jaws.Sprite.prototype.flipTo =        function(value) { this.flipped = value; return this }
/** Rotate sprite by value degrees */
jaws.Sprite.prototype.rotate =        function(value) { this.angle += value; return this }
/** Force an rotation-angle on sprite */
jaws.Sprite.prototype.rotateTo =      function(value) { this.angle = value; return this }
/** Set x/y */
jaws.Sprite.prototype.moveTo =        function(x,y)   { this.x = x; this.y = y; return this }
/** Modify x/y */
jaws.Sprite.prototype.move =          function(x,y)   { if(x) this.x += x;  if(y) this.y += y; return this }
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
  this.scale_x = (this.width + width) / this.image.width
  this.scale_y = (this.height + height) / this.image.height
  return this.cacheOffsets()
}
/** 
 * Resize sprite to exact width/height 
 */
jaws.Sprite.prototype.resizeTo =      function(width, height) {
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

/**
 * Make this sprite a DOM-based <div> sprite 
 * @private
 */
jaws.Sprite.prototype.createDiv = function() {
  this.div = document.createElement("div")
  this.div.style.position = "absolute"
  if(this.image) {
    this.div.style.width = this.image.width + "px"
    this.div.style.height = this.image.height + "px"
    if(this.image.toDataURL)  { this.div.style.backgroundImage = "url(" + this.image.toDataURL() + ")" }
    else                      { this.div.style.backgroundImage = "url(" + this.image.src + ")" }
  }
  if(this.dom) { this.dom.appendChild(this.div) }
  this.updateDiv()
}

/** 
 * @private
 * Update properties for DOM-based sprite 
 */
jaws.Sprite.prototype.updateDiv = function() {
  this.div.style.left = this.x + "px"
  this.div.style.top = this.y + "px"

  var transform = ""
  transform += "rotate(" + this.angle + "deg) "
  if(this.flipped)  { transform += "scale(-" + this.scale_x + "," + this.scale_y + ")"; }
  else              { transform += "scale(" + this.scale_x + "," + this.scale_y + ")"; }

  this.div.style.MozTransform = transform
  this.div.style.WebkitTransform = transform
  this.div.style.OTransform = transform
  this.div.style.msTransform = transform
  this.div.style.transform = transform

  return this
}

/** Draw sprite on active canvas or update it's DOM-properties */
jaws.Sprite.prototype.draw = function() {
  if(!this.image) { return this }
  if(this.dom)    { return this.updateDiv() }

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
  this.setImage( jaws.gfx.retroScaleImage(this.image, factor) )
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
  var object = this.options                   // Start with all creation time properties
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

  return object
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
 * @class Manages all your Sprites in lists. Makes easy mass-draw() / update() possible among others. Implements Array API. "Field Summary" contains options for the SpriteList()-constructor.
 * 
 * Sprites (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 * This is where SpriteList() comes in:
 * 
 * @example
 * // create 100 enemies 
 * var enemies = new SpriteList()
 * for(i=0; i < 100; i++) { 
 *   enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
 * }
 * enemies.draw()                    // calls draw() on all enemies
 * enemies.update()                  // calls update() on all enemies 
 * enemies.removeIf(isOutsideCanvas) // removes each item in enemies that returns true when isOutsideCanvas(item) is called
 * enemies.drawIf(isInsideViewport)  // only call draw() on items that returns true when isInsideViewport is called with item as argument 
 * 
 * @param {Object} [options] Currently used to pass in a literal list of sprites. See {@link SpriteList#load} for details
 */
jaws.SpriteList = function SpriteList(options) {
  // Make both sprite_list = new SpriteList() and sprite_list = SpriteList() work
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.sprites = []
  this.length = 0
  
  if(options) this.load(options);
}

/**
 * Return the sprite at the specified index.
 * Replaces the array [] notation.
 * So:
 * my_sprite_list.at(1) is equivalent to my_array[1]
 * 
 * @param {Number} index
 * @returns {Object} Sprite at index
 */
jaws.SpriteList.prototype.at = function(index) {
  return this.sprites[index]
}

// Implement the Array API functions

/**
 * Concatenate this sprite list and another array. Does not modify original.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/concat 
 * @return {Object} A new SpriteList comprised of this one joined with other lists. 
 */
jaws.SpriteList.prototype.concat = function() {
  return this.sprites.concat.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
 * @param {Object} searchElement
 * @param {Number} fromIndex
 * @returns {Number}
 */
jaws.SpriteList.prototype.indexOf = function(searchElement, fromIndex) {
  return this.sprites.indexOf(searchElement, fromIndex)
}

/**
 * Joins the contents of the sprite list into a string.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/join
 * 
 * Implemented mostly for an easy verbose way to display the sprites 
 * inside the sprite list.
 * @param {String} [separator] String to separate each array element. If ommitted, defaults to comma.
 */
jaws.SpriteList.prototype.join = function(separator) {
  return this.sprites.join(separator)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
 */
jaws.SpriteList.prototype.lastIndexOf = function() {
  return this.sprites.lastIndexOf.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop
 * @returns {Object} Last sprite in the list
 */
jaws.SpriteList.prototype.pop = function() {
  var element = this.sprites.pop()
  this.updateLength()
  return element
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push
 * @returns {Number} New length of the sprite list
 */
jaws.SpriteList.prototype.push = function() {
  this.sprites.push.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reverse
 */
jaws.SpriteList.prototype.reverse = function() {
  this.sprites.reverse()
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/shift
 * @returns {Object} First sprite in the list
 */
jaws.SpriteList.prototype.shift = function() {
  var element = this.sprites.shift()
  this.updateLength()
  return element
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/slice
 * @param {Number} start
 * @param {Number} end
 * @returns {Object} A new array containing sprites (a section of the sprites array defined by start and end)
 * 
 * @todo Fix it to return SpriteList instead of array 
 */
jaws.SpriteList.prototype.slice = function(start, end) {
  return this.sprites.slice(start, end)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort
 */
jaws.SpriteList.prototype.sort = function() {
  this.sprites.sort.apply(this.sprites, arguments)
}

/**
 * Add or remove sprites from the list.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice
 * @return {Array} Array containing removed sprites
 */
jaws.SpriteList.prototype.splice = function() {
  var removedElements = this.sprites.splice.apply(this.sprites, arguments)
  this.updateLength()
  return removedElements
}

/**
 * Add one or more sprites to the front of the list
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift
 * @returns {Number} New length of the sprite list
 */
jaws.SpriteList.prototype.unshift = function() {
  this.sprites.unshift.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

/**
 * Update the length of the sprite list.
 * Since we're delegating array operations to sprites array, this is not done automatically
 */
jaws.SpriteList.prototype.updateLength = function() {
  this.length = this.sprites.length
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/ValueOf
 * @return {String} Literal string representation (currently, just the value of toString() )
 */
jaws.SpriteList.prototype.valueOf = function() {
  return this.toString()
}

// Implement "extras" / standardized Array functions
// See http://dev.opera.com/articles/view/javascript-array-extras-in-detail/ for discussion, browser compatibility

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
 * @return {Array}
 */
jaws.SpriteList.prototype.filter = function() {
  return this.sprites.filter.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
 */
jaws.SpriteList.prototype.forEach = function() {
  this.sprites.forEach.apply(this.sprites, arguments)
  this.updateLength()  // in case the forEach operation changes the sprites array
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
 * @returns {Boolean}
 */
jaws.SpriteList.prototype.every = function() {
  return this.sprites.every.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
 * @returns {Array}
 */
jaws.SpriteList.prototype.map = function() {
  return this.sprites.map.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
 * @returns {Object|Number|String}
 */
jaws.SpriteList.prototype.reduce = function() {
  return this.sprites.reduce.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight
 * @returns {Object|Number|String}
 */
jaws.SpriteList.prototype.reduceRight = function() {
  return this.sprites.reduceRight.apply(this.sprites, arguments)
}

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
 * @returns {Boolean}
 */
jaws.SpriteList.prototype.some = function() {
  return this.sprites.some.apply(this.sprites, arguments)
}

/**
 * Returns true if this object is a sprite lsit.
 * Used to tell SpriteLists and Arrays apart
 * @returns {Boolean}
 */
jaws.SpriteList.prototype.isSpriteList = function() {
  return true;
}

/**
 * Load sprites into sprite list.
 *
 * Argument could either be
 * - an array of Sprite objects
 * - an array of JSON objects
 * - a JSON.stringified string representing an array of JSON objects
 *
 */
jaws.SpriteList.prototype.load = function(objects) {
  var that = this;  // Since forEach changes this into DOMWindow.. hm, lame.
  if(jaws.isArray(objects)) {
    // If this is an array of JSON representations, parse it
    if(objects.every(function(item) { return item._constructor })) {
      parseArray(objects)
    } else {
      // This is an array of Sprites, load it directly
      this.sprites = objects
    }
  }
  else if(jaws.isString(objects)) { parseArray( JSON.parse(objects) ); console.log(objects) }
  this.updateLength()
  
  function parseArray(array) {
    array.forEach( function(data) {
      var constructor = data._constructor ? eval(data._constructor) : data.constructor
      if(jaws.isFunction(constructor)) {
        jaws.log("Creating " + data._constructor + "(" + data.toString() + ")", true)
        var object = new constructor(data)
        object._constructor = data._constructor || data.constructor.name
        that.push(object);
      }
    });
  }
}

/** 
 * Removes the first occurrence of obj from list 
 */
jaws.SpriteList.prototype.remove = function(obj) {
  var index = this.indexOf(obj)
  if(index > -1) { this.splice(index, 1) }
  this.updateLength()
}

/** 
 * Invoke draw() on each element of the sprite list
 */
jaws.SpriteList.prototype.draw = function() {
  this.forEach(function(ea) {
    ea.draw()
  })
}

/** Draw sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.drawIf = function(condition) {
  this.forEach(function(ea) {
    if( condition(ea) ) {
      ea.draw()
    }
  })
}

/** Call update() on all sprites in spritelist */
jaws.SpriteList.prototype.update = function() {
  this.forEach(function(ea) {
    ea.update()
  })
}

/** Call update() on sprites in spritelist where condition(sprite) returns true */
jaws.SpriteList.prototype.updateIf = function(condition) {
  this.forEach(function(ea) {
    if( condition(ea) ) {
      ea.update()
    }
  })
}

/** 
 * Delete sprites in spritelist where condition(sprite) returns true.
 * Alias for removeIf()
 * @deprecated
 */
jaws.SpriteList.prototype.deleteIf = function(condition) {
  this.removeIf(condition)
}

/** Remove sprites in spritelist where condition(sprite) returns true  */
jaws.SpriteList.prototype.removeIf = function(condition) {
  this.sprites = this.filter(function(ea) {
    return !condition(ea)
  })
  this.updateLength()
}

jaws.SpriteList.prototype.toString = function() { return "[SpriteList " + this.length + " sprites]" }

return jaws;
})(jaws || {});

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
    this.image = jaws.gfx.retroScaleImage(image, this.scale_image)
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
  
  this.width = options.width || jaws.width;
  this.height = options.height || jaws.height;  
}

jaws.Parallax.prototype.default_options = {
  scale: 1,
  repeat_x: null,
  repeat_y: null,
  camera_x: 0,
  camera_y: 0,
  width: null,
  height: null,
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
    options.sprite_sheet = jaws.gfx.retroScaleImage(image, options.scale_image)
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

var jaws = (function(jaws) {

/**
 * @class Create and access tilebased 2D maps with very fast access of invidual tiles. "Field Summary" contains options for the TileMap()-constructor.
 *
 * @property {array} cell_size        Size of each cell in tilemap, defaults to [32,32]
 * @property {array} size             Size of tilemap, defaults to [100,100]
 * @property {function} sortFunction  Function used by sortCells() to sort cells, defaults to no sorting
 *
 * @example
 * var tile_map = new TileMap({size: [10, 10], cell_size: [16,16]})
 * var sprite = new jaws.Sprite({x: 40, y: 40})
 * var sprite2 = new jaws.Sprite({x: 41, y: 41})
 * tile_map.push(sprite)
 *
 * tile_map.at(10,10)  // []
 * tile_map.at(40,40)  // [sprite]
 * tile_map.cell(0,0)  // []
 * tile_map.cell(1,1)  // [sprite]
 *
 */
jaws.TileMap = function TileMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options);
  this.cells = new Array(this.size[0])

  for(var col=0; col < this.size[0]; col++) {
    this.cells[col] = new Array(this.size[1])
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = [] // populate each cell with an empty array
    }
  }
}

jaws.TileMap.prototype.default_options = {
  cell_size: [32,32],
  size: [100,100],
  sortFunction: null
}

/** Clear all cells in tile map */
jaws.TileMap.prototype.clear = function() {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = []
    }
  }
}

/** Sort arrays in each cell in tile map according to sorter-function (see Array.sort) */
jaws.TileMap.prototype.sortCells = function(sortFunction) {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].sort( sortFunction )
    }
  }
}

/**
 * Push obj (or array of objs) into our cell-grid.
 *
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
jaws.TileMap.prototype.push = function(obj) {
  var that = this
  if(obj.forEach) { 
    obj.forEach( function(item) { that.push(item) } )
    return obj
  }
  if(obj.rect) {
    return this.pushAsRect(obj, obj.rect())
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}
/** 
 * Push objects into tilemap.
 * Disregard height and width and only use x/y when calculating cell-position
 */
jaws.TileMap.prototype.pushAsPoint = function(obj) {
  if(Array.isArray(obj)) { 
    for(var i=0; i < obj.length; i++) { this.pushAsPoint(obj[i]) }
    return obj
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}

/** push obj into cells touched by rect */
jaws.TileMap.prototype.pushAsRect = function(obj, rect) {
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt((rect.right-1) / this.cell_size[0])
  //jaws.log("rect.right: " + rect.right + " from/to col: " + from_col + " " + to_col, true)

  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt((rect.bottom-1) / this.cell_size[1])
    
    //jaws.log("rect.bottom " + rect.bottom + " from/to row: " + from_row + " " + to_row, true)
    for(var row = from_row; row <= to_row; row++) {
      // console.log("pushAtRect() col/row: " + col + "/" + row + " - " + this.cells[col][row])
      this.pushToCell(col, row, obj)
    }
  }
  return obj
}

/** 
 * Push obj to a specific cell specified by col and row 
 * If cell is already occupied we create an array and push to that
 */
jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
  this.cells[col][row].push(obj)
  if(this.sortFunction) this.cells[col][row].sort(this.sortFunction);
  return this
}

//
// READERS
// 

/** Get objects in cell that exists at coordinates x / y  */
jaws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  // console.log("at() col/row: " + col + "/" + row)
  return this.cells[col][row]
}

/** Returns occupants of all cells touched by 'rect' */
jaws.TileMap.prototype.atRect = function(rect) {
  var objects = []
  var items

  try {
    var from_col = parseInt(rect.x / this.cell_size[0])
	if (from_col < 0) {
		from_col = 0
	}
    var to_col = parseInt(rect.right / this.cell_size[0])
    if (to_col >= this.size[0]) {
		to_col = this.size[0] - 1
	}
	var from_row = parseInt(rect.y / this.cell_size[1])
	if (from_row < 0) {
		from_row = 0
	}
	var to_row = parseInt(rect.bottom / this.cell_size[1])
	if (to_row >= this.size[1]) {
		to_row = this.size[1] - 1
	}

    for(var col = from_col; col <= to_col; col++) {
      for(var row = from_row; row <= to_row; row++) {
        this.cells[col][row].forEach( function(item, total) { 
          if(objects.indexOf(item) == -1) { objects.push(item) }
        })
      }
    }
  }
  catch(e) {
    // ... problems
  }
  return objects
}

/** Returns all objects in tile map */
jaws.TileMap.prototype.all = function() {
  var all = []
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].forEach( function(element, total) {
        all.push(element)
      });
    }
  }
  return all
}

/** Get objects in cell at col / row */
jaws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

/**
 * A-Star pathfinding
 *
 *  Takes starting and ending x,y co-ordinates (from a mouse-click for example),
 *  which are then translated onto the TileMap grid. 
 *  
 *  Does not allow for Diagonal movements
 *
 *  Uses a very simple Heuristic [see crowFlies()] for calculating node scores.
 *
 *  Very lightly optimised for speed over memory usage.
 *
 *  Returns a list of [col, row] pairs that define a valid path. Due to the simple Heuristic
 *  the path is not guaranteed to be the best path.
 */
jaws.TileMap.prototype.findPath = function(start_position, end_position, inverted) {
  
  if (typeof inverted == 'undefined') { inverted = false }
  
  var start_col = parseInt(start_position[0] / this.cell_size[0])
  var start_row = parseInt(start_position[1] / this.cell_size[1])
  
  var end_col = parseInt(end_position[0] / this.cell_size[0])
  var end_row = parseInt(end_position[1] / this.cell_size[1])
  
  if (start_col === end_col && start_row === end_row) {
    return [{x: start_position[0], y:start_position[1]}]
  }
  
  var col = start_col
  var row = start_row
  var step = 0
  var score = 0
  //travel corner-to-corner, through every square, plus one, just to make sure
  var max_distance = (this.size[0]*this.size[1] * 2)+1
  
  var open_nodes = new Array(this.size[0])
  for(var i=0; i < this.size[0]; i++) {
    open_nodes[i] = new Array(this.size[1])
    for(var j=0; j < this.size[1]; j++) {
      open_nodes[i][j] = false
    }
  }
  open_nodes[col][row] = {parent: [], G: 0, score: max_distance}
  
  var closed_nodes = new Array(this.size[0])
  for(var i=0; i < this.size[0]; i++) {
    closed_nodes[i] = new Array(this.size[1])
    for(var j=0; j < this.size[1]; j++) {
      closed_nodes[i][j] = false
    }
  }

  var crowFlies = function(from_node, to_node) {
    return Math.abs(to_node[0]-from_node[0]) + Math.abs(to_node[1]-from_node[1]);
  }
  
  var findInClosed = function(col, row) {
    if (closed_nodes[col][row])
    {
      return true
    }
    else {return false}
  }
  
  while ( !(col === end_col && row === end_row) ) {
    /**
     *  add the nodes above, below, to the left and right of the current node
     *  if it doesn't have a sprite in it, and it hasn't already been added
     *  to the closed list, recalculate its score from the current node and
     *  update it if it's already in the open list.
     */
    var left_right_up_down = []
    if (col > 0) { left_right_up_down.push([col-1, row]) }
    if (col < this.size[0]-1) { left_right_up_down.push([col+1, row]) }
    if (row > 0) {left_right_up_down.push([col, row-1])}
    if (row < this.size[1]-1) { left_right_up_down.push([col, row+1]) }
    
    for (var i=0 ; i<left_right_up_down.length ; i++) {
        var c = left_right_up_down[i][0]
        var r = left_right_up_down[i][1]
        if ( ( (this.cell(c, r).length === 0 && !inverted) || 
               (this.cell(c, r).length  >  0 &&  inverted)    ) && 
               !findInClosed(c, r) ) 
        {
            score = step+1+crowFlies([c, r] , [end_col, end_row])
            if (!open_nodes[c][r] || (open_nodes[c][r] && open_nodes[c][r].score > score)) {
                open_nodes[c][r] = {parent: [col, row], G: step+1, score: score}
            }
        }
    }
    
    /**
     *  find the lowest scoring open node
     */
    var best_node = {node: [], parent: [], score: max_distance, G: 0}
    for (var i=0 ; i<this.size[0] ; i++) {
      for(var j=0 ; j<this.size[1] ; j++) {
        if (open_nodes[i][j] && open_nodes[i][j].score < best_node.score) {
          best_node.node = [i, j]
          best_node.parent = open_nodes[i][j].parent
          best_node.score = open_nodes[i][j].score
          best_node.G = open_nodes[i][j].G
        }
      }
    }
    if (best_node.node.length === 0) { //open_nodes is empty, no route found to end node
      return []
    }
    
    //This doesn't stop the node being added again, but it doesn't seem to matter
    open_nodes[best_node.node[0]][best_node.node[1]] = false
    
    col = best_node.node[0]
    row = best_node.node[1]
    step = best_node.G
    
    closed_nodes[col][row] = {parent: best_node.parent}
  }
  
  /**
   *  a path has been found, construct it by working backwards from the
   *  end node, using the closed list
   */
  var path = []
  var current_node = closed_nodes[col][row]
  path.unshift({x: col*this.cell_size[0], y: row*this.cell_size[1]})
  while(! (col === start_col && row === start_row) ) {
    col = current_node.parent[0]
    row = current_node.parent[1]
    path.unshift({x: col*this.cell_size[0], y: row*this.cell_size[1]})
    current_node = closed_nodes[col][row]
  }
  return path
  
}

jaws.TileMap.prototype.lineOfSight = function(start_position, end_position, inverted) {
  if (typeof inverted == 'undefined') { inverted = false }
  
  var x0 = start_position[0]
  var x1 = end_position[0]
  var y0 = start_position[1]
  var y1 = end_position[1]
  
  var dx = Math.abs(x1-x0)
  var dy = Math.abs(y1-y0)

  var sx, sy
  if (x0 < x1) {sx = 1} else {sx = -1}
  if (y0 < y1) {sy = 1} else {sy = -1}
  
  var err = dx-dy
  var e2
  
  while(! (x0 === x1 && y0 === y1) )
  {
    if (inverted) { if (this.at(x0,y0).length === 0) {return false} }
    else { if (this.at(x0,y0).length > 0) {return false} }
    e2 = 2 * err
    if (e2 > -dy)
    {
      err = err - dy
      x0 = x0 + sx
    }
    if (e2 < dx)
    {
      err = err + dx
      y0 = y0 + sy
    }
  }
  
  return true
}

/** Debugstring for TileMap() */
jaws.TileMap.prototype.toString = function() { return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]" }

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.TileMap }
/**
 * @namespace Collisiondetection
 * 
 * Collision detection helpers.
 *
 * @example
 *   // collision helper exampels:
 *   collideOneWithOne(player, boss)        // -> false
 *   collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
 *   collideManyWithMany(bullets, enemies)  // -> [ [bullet1, enemy1], [bullet2, enemy2] ]
 *
 */
var jaws = (function(jaws) {

/**
 * collides 2 single objects by reading x, y and either method rect() or property radius.
 * returns true if the two objects are colliding.
 */
jaws.collideOneWithOne = function(object1, object2) {
  if(object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))          return true;
  if(object1.rect && object2.rect && object1 !== object2 && jaws.collideRects( object1.rect(), object2.rect())) return true;
  return false;
}

/**
 * collide one single object 'object' with a list of objects 'list'. 
 *
 * if 'callback' is given it will be called for each collision with the two colliding objects as arguments.
 *
 * leaving out 'callback' argument it will return an array of items from 'list' that collided with 'object'.
 * returns empty array of no collisions are found.
 * will never collide objects with themselves.
 */
jaws.collideOneWithMany = function(object, list, callback) {
  if(callback) {
    for(var i=0; i < list.length; i++)  {
      if( jaws.collideOneWithOne(object, list[i]) ) { 
        callback(object, list[i]) 
      }
    }
  }
  else {
    return list.filter( function(item) { return jaws.collideOneWithOne(object, item) } ) 
  }
}

/**
 * Collides two list/arrays of objects -- 'list1' and 'list2'.
 * Returns an array of arrays with colliding pairs from 'list1' and 'list2'.
 * Will never collide objects with themselves, even if you collide the same list with itself.
 *
 * @example
 *
 *   jaws.collideManyWithMany(bullets, enemies) // --> [[bullet, enemy], [bullet, enemy]]
 *
 */
jaws.collideManyWithMany = function(list1, list2, callback) {
  var a = []

  if(list1 === list2) {
    combinations(list1, 2).forEach( function(pair) {
      if( jaws.collideOneWithOne(pair[0], pair[1]) ) {
        if(callback)  { callback(pair[0], pair[1]) }
        else          { a.push([pair[0], pair[1]]) }
      }
    });
  }
  else {
    list1.forEach( function(item1) { 
      list2.forEach( function(item2) { 
        if(jaws.collideOneWithOne(item1, item2)) {
          if(callback)  { callback(item1, item2) }
          else          { a.push([item1, item2]) }
        }
      });
    });
  }

  return a;
}
  

/** 
 * Returns true if circles collide.
 * Takes two objects with properties "radius" as argument.
 */
jaws.collideCircles = function(object1, object2) {
  return ( jaws.distanceBetween(object1, object2) < object1.radius + object2.radius )
}

/** 
 * Returns true if 'rect1' collides with 'rect2'
 */
jaws.collideRects = function(rect1, rect2) {
  return ((rect1.x >= rect2.x && rect1.x <= rect2.right) || (rect2.x >= rect1.x && rect2.x <= rect1.right)) &&
         ((rect1.y >= rect2.y && rect1.y <= rect2.bottom) || (rect2.y >= rect1.y && rect2.y <= rect1.bottom))
}

/** 
 * returns the distance between 2 objects
 */
jaws.distanceBetween = function(object1, object2) {
  return Math.sqrt( Math.pow(object1.x-object2.x, 2) +  Math.pow(object1.y-object2.y, 2) )
}

/** private */
function combinations(list, n) {
  var f = function(i) {
    if(list.isSpriteList !== undefined) {
      return list.at(i)
    } else {  // s is an Array
      return list[i];
    }
  };
  var r = [];
  var m = new Array(n);
  for (var i = 0; i < n; i++) m[i] = i; 
  for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length) {
    r.push( m.map(f) );
    while (0 <= i && m[i] == sn - 1) { i--; sn--; }
    if (0 <= i) { 
      m[i] += 1;
      for (var j = i + 1; j < n; j++) m[j] = m[j-1] + 1;
      i = n - 1;
    }
  }
  return r;
}

/** @private */
function hasItems(array) { return (array && array.length > 0) }

/*
 * Collides 2 objects or list of objects with eachother. 
 * For each collision callback is executed with the 2 objects as arguments.
 *
 * The upside of using collide() instead of the more specialised collideOneWithMany() and collideManyWithMany()
 * is that you can call it withour knowing if you're sending in single objects or lists of objects. 
 * If there's collisions you'll always get your callback executed with the two colliding objects as arguments.
 *
 * @examples
 *   jaws.collide(player, enemy, function(player, enemy) { ... } )  
 *   jaws.collide(player, enemies, function(player, enemy) { ... } ) 
 *   jaws.collide(bullets, enemies, function(bullet, enemy) { ... } )
 *
 */
jaws.collide = function(x, x2, callback) {
  if(x.rect     && x2.forEach)  return (jaws.collideOneWithMany(x, x2, callback)===[]);
  if(x.forEach  && x2.forEach)  return (jaws.collideManyWithMany(x, x2, callback)===[]);
  if(x.forEach  && x2.rect)     return (jaws.collideOneWithMany(x2, x, callback)===[]);
  if(x.rect && x2.rect) {
    var result = jaws.collideOneWithOne(x,x2);
    if(callback && result) callback(x, x2);
    else return result;
  }
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {
  /**
  * @namespace GFX related helpers
  *
  */
  jaws.gfx = {}

  /**
   * scale 'image' by factor 'factor'.
   * Scaling is done using nearest-neighbor ( retro-blocky-style ).
   * Returns a canvas.
   */
  jaws.gfx.retroScaleImage = function(image, factor) {
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
;window.addEventListener("load", function() { if(jaws.onload) jaws.onload(); }, false);