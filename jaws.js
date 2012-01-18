/**
 * @namespace JawsJS core functions. "Field Summary" contains readable properties on the main jaws-object.
 *
 * @property {int} mouse_x  Mouse X position with respect to the canvas-element
 * @property {int} mouse_y  Mouse Y position with respect to the canvas-element
 * @property {canvas} canvas  The detected/created canvas-element used for the game
 * @property {context} context  The detected/created canvas 2D-context, used for all draw-operations
 * @property {int} width  Width of the canvas-element
 * @property {int} height  Height of the canvas-element
 *
 *
 * @example
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
 * Have fun! 
 *
 * ippa. 
 *
 */
var jaws = (function(jaws) {

var title
var log_tag  

jaws.title = function(value) {
  if(value) { return (title.innerHTML = value) }
  return title.innerHTML
}

/**
 * Unpacks Jaws core-constructors into the global namespace. If a global property is allready taken, a warning will be written to jaws log.
 * After calling jaws.unpack() you can use <b>Sprite()</b> instead of <b>jaws.Sprite()</b>, <b>Animation()</b> instead of <b>jaws.Animation()</b> and so on.
 *
 */
jaws.unpack = function() {
  var make_global = ["Sprite", "SpriteList", "Animation", "Viewport", "SpriteSheet", "Parallax", "TileMap", "Rect", "pressed"]

  make_global.forEach( function(item, array, total) {
    if(window[item])  { jaws.log(item + "already exists in global namespace") }
    else              { window[item] = jaws[item] }
  });
}


/**
 * Logs <b>msg</b> to previously found or created <div id="jaws-log">
 * if <b>append</b> is true, append rather than overwrite the last log-msg.
 */
jaws.log = function(msg, append) {
  if(log_tag) {
    msg += "<br />"
    if(append) { log_tag.innerHTML = log_tag.innerHTML.toString() + msg } 
    else { log_tag.innerHTML = msg }
  }
}

/**
 * @example
 * Initializes / creates:
 * jaws.canvas, jaws.context & jaws.dom   // our drawable gamearea
 * jaws.width & jaws.height               // width/height of drawable gamearea
 * jaws.url_parameters                    // hash of key/values of all parameters in current url
 * title & log_tag                        // used internally by jaws
 *
 * @private
 */
jaws.init = function(options) {
  /* Find <title> tag */
  title = document.getElementsByTagName('title')[0]
  jaws.url_parameters = jaws.getUrlParameters()

  /*
   * If debug=1 parameter is present in the URL, let's either find <div id="jaws-log"> or create the tag.
   * jaws.log(message) will use this div for debug/info output to the gamer or developer
   *
   */
  log_tag = document.getElementById('jaws-log')
  if(jaws.url_parameters["debug"]) {
    if(!log_tag) {
      log_tag = document.createElement("div")
      log_tag.id = "jaws-log"
      log_tag.style.cssText = "overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;"
      document.body.appendChild(log_tag)
    }
  }

  jaws.canvas = document.getElementsByTagName('canvas')[0]
  if(!jaws.canvas) { jaws.dom = document.getElementById("canvas") }

  // Ordinary <canvas>, get context
  if(jaws.canvas) { jaws.context = jaws.canvas.getContext('2d'); }

  // div-canvas / hml5 sprites, set position relative to have sprites with position = "absolute" stay within the canvas
  else if(jaws.dom) { jaws.dom.style.position = "relative"; }  

  // Niether <canvas> or <div>, create a <canvas> with specified or default width/height
  else {
    jaws.canvas = document.createElement("canvas")
    jaws.canvas.width = options.width
    jaws.canvas.height = options.height
    jaws.context = jaws.canvas.getContext('2d')
    document.body.appendChild(jaws.canvas)
  }

  
  jaws.width = jaws.canvas ? jaws.canvas.width : jaws.dom.offsetWidth
  jaws.height = jaws.canvas ? jaws.canvas.height  : jaws.dom.offsetHeight

  jaws.mouse_x = 0
  jaws.mouse_y = 0
  window.addEventListener("mousemove", saveMousePosition)
}
/**
 * @private
 * Keeps updated mouse coordinates in jaws.mouse_x / jaws.mouse_y
 * This is called each time event "mousemove" triggers.
 */
function saveMousePosition(e) {
  jaws.mouse_x = (e.pageX || e.clientX)
  jaws.mouse_y = (e.pageY || e.clientX)
  
  var game_area = jaws.canvas ? jaws.canvas : jaws.dom
  jaws.mouse_x -= game_area.offsetLeft
  jaws.mouse_y -= game_area.offsetTop
}

/** 
 * Quick and easy startup of a jaws game loop. 
 *
 * @example
 *
 *  // jaws.start(YourGameState) It will do the following:
 *  //
 *  // 1) Call jaws.init() that will detect any canvas-tag (or create one for you) and set up the 2D context, then available in jaws.canvas and jaws.context.
 *  //
 *  // 2) Pre-load all defined assets with jaws.assets.loadAll() while showing progress, then available in jaws.assets.get("your_asset.png").
 *  //
 *  // 3) Create an instance of YourGameState() and call setup() on that instance. In setup() you usually create your gameobjects, sprites and so on.
 *  // 
 *  // 4) Loop calls to update() and draw() with given FPS (default 60) until game ends or another game state is activated.
 *
 *
 *  jaws.start(MyGame)            // Start game state Game() with default options
 *  jaws.start(MyGame, {fps: 30}) // Start game state Geme() with options, in this case jaws will run your game with 30 frames per second.
 *  jaws.start(window)            // Use global functions setup(), update() and draw() if available. Not the recommended way but useful for testing and mini-games.
 *
 *  // It's recommended not giving fps-option to jaws.start since then it will default to 60 FPS and using requestAnimationFrame when possible.
 *
 */
jaws.start = function(game_state, options) {
  if(!options) options = {};
  var fps = options.fps || 60
  if (options.loading_screen === undefined)
    options.loading_screen = true
  
  if(!options.width) options.width = 500; 
  if(!options.height) options.height = 300;
  jaws.init(options)

  displayProgress(0)
  jaws.log("setupInput()", true)
  jaws.setupInput()

  function displayProgress(percent_done) {
    if(jaws.context && options.loading_screen) {
      jaws.context.save()
      jaws.context.fillStyle  = "black"
      jaws.context.fillRect(0, 0, jaws.width, jaws.height);
      jaws.context.textAlign  = "center"
      jaws.context.fillStyle  = "white"
      jaws.context.font       = "15px terminal";
      jaws.context.fillText("Loading", jaws.width/2, jaws.height/2-30);
      jaws.context.font       = "bold 30px terminal";
      jaws.context.fillText(percent_done + "%", jaws.width/2, jaws.height/2);
      jaws.context.restore()
    }
  }
  /* Callback for when one single assets has been loaded */
  function assetLoaded(src, percent_done) {
    jaws.log( percent_done + "%: " + src, true)    
    displayProgress(percent_done)
  }

  /* Callback for when an asset can't be loaded*/
  function assetError(src) {
    jaws.log( "Error loading: " + src, true)
  }

  /* Callback for when all assets are loaded */
  function assetsLoaded() {
    jaws.log("all assets loaded", true)
    jaws.switchGameState(game_state||window, {fps: fps})
  }

  jaws.log("assets.loadAll()", true)
  if(jaws.assets.length() > 0)  { jaws.assets.loadAll({onload:assetLoaded, onerror:assetError, onfinish:assetsLoaded}) }
  else                          { assetsLoaded() } 
}

/**
* Switch to a new active game state
* Save previous game state in jaws.previous_game_state
*
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
jaws.switchGameState = function(game_state, options) {
  var fps = (options && options.fps) || (jaws.game_loop && jaws.game_loop.fps) || 60
  
  jaws.game_loop && jaws.game_loop.stop()
  jaws.clearKeyCallbacks() // clear out all keyboard callbacks
  if(jaws.isFunction(game_state)) { game_state = new game_state }
  
  jaws.previous_game_state = jaws.game_state
  jaws.game_state = game_state
  jaws.game_loop = new jaws.GameLoop(game_state, {fps: fps})
  jaws.game_loop.start()
}

/** 
 * Takes an image, returns a canvas-element containing that image.
 * Benchmarks has proven canvas to be faster to work with then images in certain browsers.
 * Returns: a canvas-element
 */
jaws.imageToCanvas = function(image) {
  var canvas = document.createElement("canvas")
  canvas.src = image.src        // Make canvas look more like an image
  canvas.width = image.width
  canvas.height = image.height

  var context = canvas.getContext("2d")
  context.drawImage(image, 0, 0, image.width, image.height)
  return canvas
}

/** 
 * Return obj as an array. An array is returned as is. This is useful when you want to iterate over an unknown variable.
 *
 * @example
 *
 *   jaws.forceArray(1)       // --> [1]
 *   jaws.forceArray([1,2])   // --> [1,2]
 *
 */
jaws.forceArray = function(obj) {
  return Array.isArray(obj) ? obj : [obj]
}

/** Clears screen (the canvas-element) through context.clearRect() */
jaws.clear = function() {
  jaws.context.clearRect(0,0,jaws.width,jaws.height)
}

/** Returns true if obj is an Image */
jaws.isImage = function(obj)  { 
  return Object.prototype.toString.call(obj) === "[object HTMLImageElement]" 
}

/** Returns true of obj is a Canvas-element */
jaws.isCanvas = function(obj) { 
  return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]" 
}

/** Returns true of obj is either an Image or a Canvas-element */
jaws.isDrawable = function(obj) { 
  return jaws.isImage(obj) || jaws.isCanvas(obj) 
}

/** Returns true if obj is a String */
jaws.isString = function(obj) { 
  return (typeof obj == 'string') 
}

/** Returns true if obj is an Array */
jaws.isArray = function(obj)  { 
  if(obj === undefined) return false;
  return !(obj.constructor.toString().indexOf("Array") == -1) 
}

/** Returns true of obj is a Function */
jaws.isFunction = function(obj) { 
  return (Object.prototype.toString.call(obj) === "[object Function]") 
}

/**
 * Returns true if <b>item</b> is outside the canvas.
 * <b>item</b> needs to have the properties x, y, width & height
 */
jaws.isOutsideCanvas = function(item) { 
  return (item.x < 0 || item.y < 0 || item.x > jaws.width || item.y > jaws.height)
}

/**
 * Force <b>item</b> inside canvas by setting items x/y parameters
 * <b>item</b> needs to have the properties x, y, width & height
 */
jaws.forceInsideCanvas = function(item) {
  if(item.x < 0)              { item.x = 0  }
  if(item.x > jaws.width)     { item.x = jaws.width }
  if(item.y < 0)              { item.y = 0 }
  if(item.y > jaws.height)    { item.y = jaws.height }
}

/**
 * Return a hash of url-parameters and their values
 *
 * @example
 *   // Given the current URL is <b>http://test.com/?debug=1&foo=bar</b>
 *   jaws.getUrlParameters() // --> {debug: 1, foo: bar}
 */
jaws.getUrlParameters = function() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

  var pressed_keys = {}
  var keycode_to_string = []
  var on_keydown_callbacks = []
  var on_keyup_callbacks = []
 
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
  
  k[91] = "leftwindowkey"
  k[92] = "rightwindowkey"
  k[93] = "selectkey"
  k[106] = "multiply"
  k[107] = "add"
  k[109] = "subtract"
  k[110] = "decimalpoint"
  k[111] = "divide"
  
  k[144] = "numlock"
  k[145] = "scrollock"
  k[186] = "semicolon"
  k[187] = "equalsign"
  k[188] = "comma"
  k[189] = "dash"
  k[190] = "period"
  k[191] = "forwardslash"
  k[192] = "graveaccent"
  k[219] = "openbracket"
  k[220] = "backslash"
  k[221] = "closebracket"
  k[222] = "singlequote"

  var numpadkeys = ["numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
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
}

/** @private
 * handle event "onkeydown" by remembering what key was pressed
 */
function handleKeyUp(e) {
  event = (e) ? e : window.event
  var human_name = keycode_to_string[event.keyCode]
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { 
    on_keyup_callbacks[human_name](human_name)
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }
}

/** @private
 * handle event "onkeydown" by remembering what key was un-pressed
 */
function handleKeyDown(e) {
  event = (e) ? e : window.event  
  var human_name = keycode_to_string[event.keyCode]
  pressed_keys[human_name] = true
  if(on_keydown_callbacks[human_name]) { 
    on_keydown_callbacks[human_name](human_name)
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }
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
 * Returns true if *key* is currently pressed down
 * @example
 * jaws.pressed("left");  // returns true if arrow key is pressed
 * jaws.pressed("a");     // returns true if key "a" is pressed
 */
jaws.pressed = function(key) {
  return pressed_keys[key]
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
 * @class Loads and processes assets as images, sound, video, json
 * Used internally by JawsJS to create <b>jaws.assets</b>
 */
jaws.Assets = function Assets() {
  if( !(this instanceof arguments.callee) ) return new arguments.callee();

  this.loaded = []    // Hash of all URLs that's been loaded
  this.loading = []   // Hash of all URLs currently loading
  this.src_list = []  // Hash of all unloaded URLs that loadAll() will try to load
  this.data = []      // Hash of loaded raw asset data, URLs are keys

  this.bust_cache = false
  this.image_to_canvas = true
  this.fuchia_to_transparent = true
  this.root = ""

  this.file_type = {}
  this.file_type["json"] = "json"
  this.file_type["wav"] = "audio"
  this.file_type["mp3"] = "audio"
  this.file_type["ogg"] = "audio"
  this.file_type["png"] = "image"
  this.file_type["jpg"] = "image"
  this.file_type["jpeg"] = "image"
  this.file_type["gif"] = "image"
  this.file_type["bmp"] = "image"
  this.file_type["tiff"] = "image"
  var that = this

  this.length = function() {
    return this.src_list.length
  }

  /*
   * Get one or many resources
   *
   * @param   String or Array of strings
   * @returns The raw resource or an array of resources
   *
   */
  this.get = function(src) {
    if(jaws.isArray(src)) {
      return src.map( function(i) { return that.data[i] } )
    }
    else {
      if(this.loaded[src])  { return this.data[src] }
      else                  { jaws.log("No such asset: " + src, true) }
    }
  }

  /** Return true if src is in the process of loading (but not yet finishing) */
  this.isLoading = function(src) {
    return this.loading[src]
  }

  /** Return true if src is loaded in full */
  this.isLoaded = function(src) {
    return this.loaded[src]
  }

  this.getPostfix = function(src) {
    postfix_regexp = /\.([a-zA-Z0-9]+)/;
    return postfix_regexp.exec(src)[1]
  }

  this.getType = function(src) {
    var postfix = this.getPostfix(src)
    return (this.file_type[postfix] ? this.file_type[postfix] : postfix)
  }

  /**
   * Add array of paths or single path to asset-list. Later load with loadAll()
   *
   * @example
   *
   * jaws.assets.add("player.png")
   * jaws.assets.add(["media/bullet1.png", "media/bullet2.png"])
   * jaws.loadAll({onfinish: start_game})
   *
   */
  this.add = function(src) {
    if(jaws.isArray(src)) { for(var i=0; src[i]; i++) { this.add(src[i]) } }
    else                  { this.src_list.push(src) }
    // else                  { var path = this.root + src; this.src_list.push(path) }
    return this
  }

  /** Load all pre-specified assets */
  this.loadAll = function(options) {
    this.load_count = 0
    this.error_count = 0

    /* With these 3 callbacks you can display progress and act when all assets are loaded */
    this.onload = options.onload
    this.onerror = options.onerror
    this.onfinish = options.onfinish

    for(i=0; this.src_list[i]; i++) {
      this.load(this.src_list[i])
    }
  }

  /** Calls onload right away if asset is available since before, otherwise try to load it */
  this.getOrLoad = function(src, onload, onerror) {
    if(this.data[src]) { onload() }
    else { this.load(src, onload, onerror) }
  }

  /** 
   * Load a single url <b>src</b>.
   * if <b>onload</b> is specified, it's called on loading-success
   * if <b>onerror</b> is specified, it will be called on any loading-error
   * 
   * @example
   *
   *   jaws.load("media/foo.png")
   *
   */
  this.load = function(src, onload, onerror) {
    var asset = {}
    asset.src = src
    asset.onload = onload
    asset.onerror = onerror
    this.loading[src] = true

    var resolved_src = this.root + asset.src;
    if (this.bust_cache) { resolved_src += "?" + parseInt(Math.random()*10000000) }

    switch(this.getType(asset.src)) {
      case "image":
        asset.image = new Image()
        asset.image.asset = asset // enables us to access asset in the callback
        //
        // TODO: Make http://dev.ippa.se/webgames/test2.html work
        //
        asset.image.onload = this.assetLoaded
        asset.image.onerror = this.assetError
        asset.image.src = resolved_src
        break;
      case "audio":
        asset.audio = new Audio(resolved_src)
        asset.audio.asset = asset         // enables us to access asset in the callback
        this.data[asset.src] = asset.audio
        asset.audio.addEventListener("canplay", this.assetLoaded, false);
        asset.audio.addEventListener("error", this.assetError, false);
        asset.audio.load()
        break;
      default:
        var req = new XMLHttpRequest()
        req.asset = asset         // enables us to access asset in the callback
        req.onreadystatechange = this.assetLoaded
        req.open('GET', resolved_src, true)
        req.send(null)
        break;
    }
  }

  /** @private
   * Callback for all asset-loading.
   * 1) Parse data depending on filetype. Images are (optionally) converted to canvas-objects. json are parsed into native objects and so on.
   * 2) Save processed data in internal list for easy fetching with assets.get(src) later on
   * 3) Call callbacks if defined
   */
  this.assetLoaded = function(e) {
    var asset = this.asset
    var src = asset.src
    var filetype = that.getType(asset.src)

    // Keep loading and loaded hash up to date
    that.loaded[src] = true
    that.loading[src] = false

    // Process data depending differently on postfix
    if(filetype == "json") {
      if (this.readyState != 4) { return }
      that.data[asset.src] = JSON.parse(this.responseText)
    }
    else if(filetype == "image") {
      var new_image = that.image_to_canvas ? jaws.imageToCanvas(asset.image) : asset.image
      if(that.fuchia_to_transparent && that.getPostfix(asset.src) == "bmp") { new_image = fuchiaToTransparent(new_image) }
      that.data[asset.src] = new_image
    }
    else if(filetype == "audio") {
      asset.audio.removeEventListener("canplay", that.assetLoaded, false);
      that.data[asset.src] = asset.audio
    }

    that.load_count++
    that.processCallbacks(asset, true)
  }

  /** @private */
  this.assetError = function(e) {
    var asset = this.asset
    that.error_count++
    that.processCallbacks(asset, false)
  }

  /** @private */
  this.processCallbacks = function(asset, ok) {
    var percent = parseInt( (that.load_count+that.error_count) / that.src_list.length * 100)

    if(ok) {
      if(that.onload)   that.onload(asset.src, percent);
      if(asset.onload)  asset.onload();
    }
    else {
      if(that.onerror)  that.onerror(asset.src, percent);
      if(asset.onerror) asset.onerror(asset);
    }

    // When loadAll() is 100%, call onfinish() and kill callbacks (reset with next loadAll()-call)
    if(percent==100) {
      if(that.onfinish) { that.onfinish() }
      that.onload = null
      that.onerror = null
      that.onfinish = null
    }
  }
}

/** @private
 * Make Fuchia (0xFF00FF) transparent
 * This is the de-facto standard way to do transparency in BMPs
 * Returns: a canvas-element
 */
function fuchiaToTransparent(image) {
  canvas = jaws.isImage(image) ? jaws.imageToCanvas(image) : image
  var context = canvas.getContext("2d")
  var img_data = context.getImageData(0,0,canvas.width,canvas.height)
  var pixels = img_data.data
  for(var i = 0; i < pixels.length; i += 4) {
    if(pixels[i]==255 && pixels[i+1]==0 && pixels[i+2]==255) { // Color: Fuchia
      pixels[i+3] = 0 // Set total see-through transparency
    }
  }
  context.putImageData(img_data,0,0);
  return canvas
}

jaws.assets = new jaws.Assets()
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
 * @property {int} FPS    targeted frame rate
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
jaws.GameLoop = function GameLoop(game_object, options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( game_object, options );

  this.ticks = 0
  this.tick_duration = 0
  this.fps = 0
  
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

    if(game_object.setup) { game_object.setup() }
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
jaws.Rect.prototype.move = function(x,y) {
  this.x += x
  this.y += y
  this.right += x
  this.bottom += y
  return this
}

/** Set rects x/y */
jaws.Rect.prototype.moveTo = function(x,y) {
  this.x = x
  this.y = y
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}
/** Modify width and height */
jaws.Rect.prototype.resize = function(width,height) {
  this.width += width
  this.height += height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}
/** Set width and height */
jaws.Rect.prototype.resizeTo = function(width,height) {
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

  this.options = options
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

/** 
 * @private
 * Call setters from JSON object. Used to parse options.
 */
jaws.Sprite.prototype.set = function(options) {
  this.scale_x = this.scale_y = (options.scale || 1)
  this.x = options.x || 0
  this.y = options.y || 0
  this.alpha = (options.alpha === undefined) ? 1 : options.alpha
  this.angle = options.angle || 0
  this.flipped = options.flipped || false
  this.anchor(options.anchor || "top_left");
  if(!options.anchor_x == undefined) this.anchor_x = options.anchor_x;
  if(!options.anchor_y == undefined) this.anchor_y = options.anchor_y; 
  options.image && this.setImage(options.image);
  this.image_path = options.image;
  if(options.scale_image) this.scaleImage(options.scale_image);
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
    else { jaws.assets.load(value, function() { that.image = jaws.assets.get(value); that.cacheOffsets(); }) }
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
jaws.Sprite.prototype.scale =         function(value) { this.scale_x *= value; this.scale_y *= value; return this.cacheOffsets() }
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
* For example, a topdown shooter could use anchor("center") --> Place middle of the ship on x/y
* .. and a sidescroller would probably use anchor("center_bottom") --> Place "feet" at x/y
*/
jaws.Sprite.prototype.anchor = function(value) {
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
  if(!this.cached_rect) this.cached_rect = new jaws.Rect(this.x, this.top, this.width, this.height)
  this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset)
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
  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled

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
  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled

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
 
@class Manages all your Sprites in lists. Makes easy mass-draw() / update() possible among others. Implements Array API. "Field Summary" contains options for the SpriteList()-constructor.

@example
// Sprites (your bullets, aliens, enemies, players etc) will need to be
// updated, draw, deleted. Often in various orders and based on different conditions.
// This is where SpriteList() comes in:

// create 100 enemies 
var enemies = new SpriteList()
for(i=0; i < 100; i++) { 
  enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
}
enemies.draw()                    // calls draw() on all enemies 
enemies.removeIf(isOutsideCanvas) // removes each item in enemies that returns true when isOutsideCanvas(item) is called
enemies.drawIf(isInsideViewport)  // only call draw() on items that returns true when isInsideViewport is called with item as argument 

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
 * @param {integer} index
 * @returns Element at index
 */
jaws.SpriteList.prototype.at = function(index) {
  return this.sprites[index]
}

// Implement the Array API functions

jaws.SpriteList.prototype.concat = function() {
  return this.sprites.concat.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.indexOf = function(searchElement, fromIndex) {
  return this.sprites.indexOf(searchElement, fromIndex)
}

/**
 * Joins the contents of the sprite list into a string.
 * 
 * Implemented mostly for an easy verbose way to display the sprites 
 * inside the sprite list.
 */
jaws.SpriteList.prototype.join = function(separator) {
  return this.sprites.join(separator)
}

jaws.SpriteList.prototype.lastIndexOf = function() {
  return this.sprites.lastIndexOf.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.pop = function() {
  var element = this.sprites.pop()
  this.updateLength()
  return element
}

jaws.SpriteList.prototype.push = function() {
  this.sprites.push.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

jaws.SpriteList.prototype.reverse = function() {
  this.sprites.reverse()
}

jaws.SpriteList.prototype.shift = function() {
  var element = this.sprites.shift()
  this.updateLength()
  return element
}

jaws.SpriteList.prototype.slice = function(start, end) {
  return this.sprites.slice(start, end)
}

jaws.SpriteList.prototype.sort = function() {
  this.sprites.sort.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.splice = function() {
  this.sprites.splice.apply(this.sprites, arguments)
  this.updateLength()
}

jaws.SpriteList.prototype.unshift = function() {
  this.sprites.unshift.apply(this.sprites, arguments)
  this.updateLength()
  return this.length
}

jaws.SpriteList.prototype.updateLength = function() {
  this.length = this.sprites.length
}

jaws.SpriteList.prototype.valueOf = function() {
  return this.toString()
}

// Implement "extras" / standardized Array functions
// See http://dev.opera.com/articles/view/javascript-array-extras-in-detail/ for discussion, browser compatibility

// Does not mutate
jaws.SpriteList.prototype.filter = function() {
  return this.sprites.filter.apply(this.sprites, arguments)
}

jaws.SpriteList.prototype.forEach = function() {
  this.sprites.forEach.apply(this.sprites, arguments)
  this.updateLength()  // in case the forEach operation changes the sprites array
}

// Does not mutate
jaws.SpriteList.prototype.every = function() {
  return this.sprites.every.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.map = function() {
  return this.sprites.map.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.reduce = function() {
  return this.sprites.reduce.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.reduceRight = function() {
  return this.sprites.reduceRight.apply(this.sprites, arguments)
}

// Does not mutate
jaws.SpriteList.prototype.some = function() {
  return this.sprites.some.apply(this.sprites, arguments)
}

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
    if(objects.every(function(item) { return jaws.isArray(item) })) {
      parseArray(objects)
    } else {
      // This is an array of Sprites, load it directly
      this.sprites = objects
    }
  }
  else if(jaws.isString(objects)) { parseArray( JSON.parse(objects) ) }
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

/** Removes the first occurrence of obj from list */
jaws.SpriteList.prototype.remove = function(obj) {
  var index = this.indexOf(obj)
  if(index > -1) { this.splice(index, 1) }
  this.updateLength()
}

/** Draw all sprites in spritelist */
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

  this.image = jaws.isDrawable(options.image) ? options.image : jaws.assets.data[options.image]
  this.orientation = options.orientation || "down"
  this.frame_size = options.frame_size || [32,32]
  this.frames = []
  this.offset = options.offset || 0
  
  if(options.scale_image) {
    var image = (jaws.isDrawable(options.image) ? options.image : jaws.assets.get(options.image))
    this.frame_size[0] *= options.scale_image
    this.frame_size[1] *= options.scale_image
    options.image = jaws.gfx.retroScaleImage(image, options.scale_image)
  }

  var index = 0

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

  this.scale = options.scale || 1
  this.repeat_x = options.repeat_x
  this.repeat_y = options.repeat_y
  this.camera_x = options.camera_x || 0
  this.camera_y = options.camera_y || 0
  this.layers = []
}

/** Draw all layers in parallax scroller */
jaws.Parallax.prototype.draw = function(options) {
  var layer, save_x, save_y;

  for(var i=0; i < this.layers.length; i++) {
    layer = this.layers[i]
    
    save_x = layer.x
    save_y = layer.y

    layer.x = -(this.camera_x / layer.damping)
    layer.y = -(this.camera_y / layer.damping)

    while(this.repeat_x && layer.x > 0) { layer.x -= layer.width }
    while(this.repeat_y && layer.y > 0) { layer.y -= layer.width }

    while(this.repeat_x && layer.x < jaws.width) {
      while(this.repeat_y && layer.y < jaws.height) {
        layer.draw()
        layer.y += layer.height
      }    
      layer.y = save_y
      layer.draw()
      layer.x += (layer.width-1)  // -1 to compensate for glitches in repeating tiles
    }
    while(layer.repeat_y && !layer.repeat_x && layer.y < jaws.height) {
      layer.draw()
      layer.y += layer.height
    }
    layer.x = save_x
  }
}
/** Add a new layer to the parallax scroller */
jaws.Parallax.prototype.addLayer = function(options) {
  var layer = new jaws.ParallaxLayer(options)
  layer.scale(this.scale)
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

  this.options = options
  this.frames = options.frames || []
  this.frame_duration = options.frame_duration || 100   // default: 100ms between each frameswitch
  this.index = options.index || 0                       // default: start with the very first frame
  this.loop = (options.loop==undefined) ? 1 : options.loop
  this.bounce = options.bounce || 0
  this.frame_direction = 1
  this.frame_size = options.frame_size
  this.orientation = options.orientation || "down"
  this.on_end = options.on_end || null
  this.offset = options.offset || 0

  if(options.scale_image) {
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    this.frame_size[0] *= options.scale_image
    this.frame_size[1] *= options.scale_image
    options.sprite_sheet = jaws.gfx.retroScaleImage(image, options.scale_image)
  }

  if(options.sprite_sheet) {
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    var sprite_sheet = new jaws.SpriteSheet({image: image, frame_size: this.frame_size, orientation: this.orientation, offset: this.offset})
    this.frames = sprite_sheet.frames
  }

  /* Initializing timer-stuff */
  this.current_tick = (new Date()).getTime();
  this.last_tick = (new Date()).getTime();
  this.sum_tick = 0
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
      this.index = 0
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

  this.options = options
  this.context = options.context || jaws.context
  this.width = options.width || jaws.width
  this.height = options.height || jaws.height
  this.max_x = options.max_x || jaws.width 
  this.max_y = options.max_y || jaws.height
  this.x = options.x || 0
  this.y = options.y || 0
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
   * bullets.deleteIf( viewport.isOutside )
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
    this.x = (item.x - this.width / 2)
    this.y = (item.y - this.height / 2)
    this.verifyPosition()
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

  this.cell_size = options.cell_size || [32,32]
  this.size = options.size || [100,100]
  this.sortFunction = options.sortFunction
  this.cells = new Array(this.size[0])

  for(var col=0; col < this.size[0]; col++) {
    this.cells[col] = new Array(this.size[1])
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = [] // populate each cell with an empty array
    }
  }
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
    var to_col = parseInt(rect.right / this.cell_size[0])
    for(var col = from_col; col <= to_col; col++) {
      var from_row = parseInt(rect.y / this.cell_size[1])
      var to_row = parseInt(rect.bottom / this.cell_size[1])
      
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
 * returns an array of items from 'list' that collided with 'object'.
 * returns empty array of no collisions are found.
 * will never collide objects with themselves.
 */
jaws.collideOneWithMany = function(object, list) {
  return list.filter( function(item) { return jaws.collideOneWithOne(object, item) } ) 
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
jaws.collideManyWithMany = function(list1, list2) {
  var a = []

  if(list1 === list2) {
    combinations(list1, 2).forEach( function(pair) {
      if( jaws.collideOneWithOne(pair[0], pair[1]) ) a.push([pair[0], pair[1]]);
    });
  }
  else {
    list1.forEach( function(item1) { 
      list2.forEach( function(item2) { 
        if(jaws.collideOneWithOne(item1, item2)) a.push([item1, item2])
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
 * @deprecated
 *
 * Collides 2 objects or list with objects.
 * Returns empty array if no collision took place
 * Returns array of array with object-pairs that collided
 *
 * @examples
 *   jaws.collide(player, enemy)     // --> [player, enemy]
 *   jaws.collide(player, enemies)   // --> [[player, enemies[2]]
 *   jaws.collide(bullets, enemies)  // [ [bullet1, enemy1], [bullet2, ememy3] ]
 *
 */
/*
jaws.collide = function(object1, object2) {
  var a = []
  if(object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))  { return [object1, object2]; }
  if(object1.rect && object2.rect && object1 !== object2 && jaws.collideRects( object1.rect(), object2.rect())) { return [object1, object2]; }
  if(object1.forEach) a = object1.map( function(item1) { return jaws.collide(item1, object2) } ).filter(hasItems);
  if(object2.forEach) a = object2.map( function(item2) { return jaws.collide(item2, object1) } ).filter(hasItems);

  // Convert [[[1,2],[2,2]]] -> [[1,1],[2,2]] (flatten one outer array wrapper)
  if(a[0] && a[0].length == 1)  return a[0];
  else                          return a;
}
*/

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