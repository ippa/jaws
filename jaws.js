/*
 *
 * Jaws - a HTML5 canvas/javascript 2D game development framework
 *
 * Homepage:    http://jawsjs.com/
 * Works with:  Chrome 6.0+, Firefox 3.6+, 4+, IE 9+
 * License: LGPL - http://www.gnu.org/licenses/lgpl.html
 *
 * Formating guide:
 *
 *   jaws.oneFunction()
 *   jaws.one_variable = 1
 *   new jaws.OneConstructor
 *
 * Jaws uses the "module pattern" and exposes itself through the global "jaws". 
 * It should play nice with all other JS libs.
 *
 * Have fun! 
 *
 * ippa. 
 *
 */

var jaws = (function(jaws) {

var title
var debug_tag  

jaws.title = function(value) {
  if(value) { return (title.innerHTML = value) }
  return title.innerHTML
}

/*
 * Unpacks Jaws core-constructors into the global namespace
 * After calling unpack you can use:
 * "Sprite()" instead of "jaws.Sprite()"
 * "Animation()" instead of "jaws.Animation()"
 * .. and so on.
 *
 */
jaws.unpack = function() {
  var make_global = ["Sprite", "SpriteList", "Animation", "Viewport", "SpriteSheet", "Parallax", "TileMap", "Rect", "pressed"]

  make_global.forEach( function(item, array, total) {
    if(window[item])  { jaws.debug(item + "already exists in global namespace") }
    else              { window[item] = jaws[item] }
  });
}


/*
 * Simple debug output, adds text to previously found or created <div id="jaws-debug">
 */
jaws.debug = function(msg, add) {
  if(debug_tag) {
    msg += "<br />"
    if(add) { debug_tag.innerHTML = debug_tag.innerHTML.toString() + msg } 
    else { debug_tag.innerHTML = msg }
  }
}

/*
 * init()
 *
 * Initializes / creates:
 * - jaws.canvas / jaws.context / jaws.dom (our drawable gamearea)
 * - jaws.width / jaws.height (width/height of drawable gamearea)
 * - jaws.url_parameters (hash of key/values of all parameters in current url)
 * - title / debug_tag (used internally by jaws)
 *
 * */
jaws.init = function(options) {
  /* Find <title> tag */
  title = document.getElementsByTagName('title')[0]
  jaws.url_parameters = getUrlParameters()

  /*
   * If debug=1 parameter is present in the URL, let's either find <div id="jaws-debug"> or create the tag.
   * jaws.debug(message) will use this div for debug/info output to the gamer or developer
   *
   */
  debug_tag = document.getElementById('jaws-debug')
  if(jaws.url_parameters["debug"]) {
    if(!debug_tag) {
      debug_tag = document.createElement("div")
      debug_tag.style.cssText = "overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;"
      document.body.appendChild(debug_tag)
    }
  }

  jaws.canvas = document.getElementsByTagName('canvas')[0]
  if(jaws.canvas) {
    jaws.context = jaws.canvas.getContext('2d');
  }
  else {
    jaws.dom = document.getElementById("canvas")
    jaws.dom.style.position = "relative"  // This is needed to have sprites with position = "absolute" stay within the canvas
  }
  
  jaws.width = jaws.canvas ? jaws.canvas.width : jaws.dom.offsetWidth
  jaws.height = jaws.canvas ? jaws.canvas.height  : jaws.dom.offsetHeigh
}

/* 
* Find the <canvas> so following draw-operations can use it.
* If the developer didn't provide a <canvas> in his HTML, let's create one.
*
*/
function findOrCreateCanvas() {
 jaws.canvas = document.getElementsByTagName('canvas')[0]
  if(!jaws.canvas) {
    jaws.canvas = document.createElement("canvas")
    jaws.canvas.width = 500
    jaws.canvas.height = 300
    document.body.appendChild(jaws.canvas)
    debug("creating canvas", true)
  }
  else {
    debug("found canvas", true)
  } 
  jaws.context = jaws.canvas.getContext('2d');
}

/* 
 * Quick and easy startup of a jaws gameloop. Can be called in different ways:
 *
 *  jaws.start(Game)            // Start game state Game() with default options
 *  jaws.start(Game, {fps: 30}) // Start game state Geme() with options, in this case jaws will un Game with FPS 30
 *  jaws.start(window)          //
 *
 */
jaws.start = function(game_state, options) {
  // Instance given game state contructor, or try to use setup, update, draw from global window
  // This makes both jaws.start() and jaws.start(MenuState) possible
  if( game_state && jaws.isFunction(game_state) ) { game_state = new game_state }
  if(!game_state)                                 { game_state = window }
  var wanted_fps = (options && options.fps) || 60

  jaws.init()
  jaws.debug("setupInput()", true)
  jaws.setupInput()

  function assetsLoading(src, percent_done) {
    jaws.debug( percent_done + "%: " + src, true)
  }

  function assetsLoaded() {
    jaws.debug("all assets loaded", true)
    jaws.gameloop = new jaws.GameLoop(game_state.setup, game_state.update, game_state.draw, wanted_fps)
    jaws.gameloop.start()
  }

  jaws.debug("assets.loadAll()", true)
  if(jaws.assets.length() > 0)  { jaws.assets.loadAll({loading: assetsLoading, loaded: assetsLoaded}) }
  else                          { assetsLoaded() } 
}

/*
 * Switch to a new active game state
 * Save previous game state in jaws.previous_game_state
 */
jaws.switchGameState = function(game_state) {
  jaws.gameloop.stop()
  
  jaws.clearKeyCallbacks() // clear out all keyboard callbacks
 
  if(jaws.isFunction(game_state)) { game_state = new game_state }
  
  jaws.previous_game_state = game_state
  jaws.game_state = game_state
  jaws.gameloop = new jaws.GameLoop(game_state.setup, game_state.update, game_state.draw, jaws.gameloop.fps)
  jaws.gameloop.start()
}

/*
 * Clears canvas through context.clearRect()
 */
jaws.clear = function() {
  jaws.context.clearRect(0,0,jaws.width,jaws.height)
}

/* returns true if obj is an Image */
jaws.isImage = function(obj) {
  return Object.prototype.toString.call(obj) === "[object HTMLImageElement]";
}
/* returns true of obj is a Canvas-element */
jaws.isCanvas = function(obj) {
  return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]";
}
/* returns true of obj is either an Image or a Canvas-element */
jaws.isDrawable = function(obj) {
  return jaws.isImage(obj) || jaws.isCanvas(obj)
}
/* returns true if obj is a String */
jaws.isString = function(obj) {
  return (typeof obj == 'string')
}
/* returns true if obj is an Array */
jaws.isArray = function(obj) {
  return !(obj.constructor.toString().indexOf("Array") == -1)
}
/* returns true of obj is a Function */
jaws.isFunction = function(obj) {
  return (Object.prototype.toString.call(obj) === "[object Function]")
}

jaws.combinations = function(s, n) {
  var f = function(i){return s[i];};
  var r = [];
  var m = new Array(n);
  for (var i = 0; i < n; i++) m[i] = i; 
  for (var i = n - 1, sn = s.length; 0 <= i; sn = s.length) {
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

/* 
 * private methods that returns a hash of url-parameters and their values 
 *
 * */
function getUrlParameters() {
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
 
/*
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
  var numbers = ["1","2","3","4","5","6","7","8","9"]
  var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
  for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
  for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
  for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }
  
  keycode_to_string = k

  window.onkeydown = function(e)  { handleKeyDown(e) }
  window.onkeyup = function(e)    { handleKeyUp(e) }
  window.onkeypress = function(e) {};
}

// handle event "onkeydown" by remembering what key was pressed
function handleKeyUp(e) {
  event = (e) ? e : window.event
  var human_name = keycode_to_string[event.keyCode]
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { 
    on_keyup_callbacks[human_name]() 
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }
}

// handle event "onkeydown" by remembering what key was un-pressed
function handleKeyDown(e) {
  event = (e) ? e : window.event  
  var human_name = keycode_to_string[event.keyCode]
  pressed_keys[human_name] = true
  if(on_keydown_callbacks[human_name]) { 
    on_keydown_callbacks[human_name]()
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }

  // jaws.debug(event.type + " - " + event.keyCode + " " + keycode_to_string[event.keyCode]);
  // e.preventDefault();
}


var prevent_default_keys = []
jaws.preventDefaultKeys = function(array_of_strings) {
  array_of_strings.forEach( function(item, index) {
    prevent_default_keys[item] = true
  });
}

/*
 * helper to check if a given key currently is pressed. returns true or false.
 */
jaws.pressed = function(string) {
  return pressed_keys[string]
}

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

/* Clean up all callbacks set by on_keydown / on_keyup */
jaws.clearKeyCallbacks = function() {
  on_keyup_callbacks = []
  on_keydown_callbacks = []
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/* 
 * Asset()
 *
 * Provides a one-stop access point to all assets (images, sound, video)
 *
 * exposed as jaws.assets
 * 
 */
function Asset() {
  this.list = []
  this.data = []
  this.image_to_canvas = true
  this.fuchia_to_transparent = true
  this.woff = "mooo!"

  this.file_type = {}
  this.file_type["wav"] = "audio"
  this.file_type["mp3"] = "audio"
  this.file_type["ogg"] = "audio"
  this.file_type["png"] = "image"
  this.file_type["jpg"] = "image"
  this.file_type["jpeg"] = "image"
  this.file_type["bmp"] = "image"
  var that = this

  this.length = function() {
    return this.list.length
  }

  this.add = function(src) {
    this.list.push({"src": src})
    return this
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
      return this.data[src]
    }
  }
  
  this.getPostfix = function(src) {
    postfix_regexp = /\.([a-zA-Z]+)/;
    return postfix_regexp.exec(src)[1]
  }

  this.getType = function(src) {
    var postfix = this.getPostfix(src)
    return (this.file_type[postfix] ? this.file_type[postfix] : postfix)
  }
  
  this.loadAll = function(options) {
    this.loadedCount = 0

    /* With these 2 callbacks you can display progress and act when all assets are loaded */
    if(options) {
      this.loaded_callback = options.loaded
      this.loading_callback = options.loading
    }

    for(i=0; this.list[i]; i++) {
      var asset = this.list[i]
        
      switch(this.getType(asset.src)) {
        case "image":
          var src = asset.src + "?" + parseInt(Math.random()*10000000)
          asset.image = new Image()
          asset.image.asset = asset
          asset.image.onload = this.imageLoaded
          asset.image.src = src
          break;
        case "audio":
          var src = asset.src + "?" + parseInt(Math.random()*10000000)
          asset.audio = new Audio(src)
          asset.audio.asset = asset
          this.data[asset.src] = asset.audio
          asset.audio.addEventListener("canplay", this.audioLoaded, false);
          asset.audio.load()
          break;
        default:
          var src = asset.src + "?" + parseInt(Math.random()*10000000)
          var req = new XMLHttpRequest()
          req.open('GET', src, false)
          req.send(null)
          if(req.status == 200) {
            this.data[asset.src] = this.parseAsset(asset.src, req.responseText)
            this.itemLoaded(asset.src)
          }
          break;
      }
    }
  }

  this.parseAsset = function(src, data) {
    switch(this.getType(src)) {
      case "json":
        return JSON.parse(data)
      default:
        return data
    }
  };

  this.itemLoaded = function(src) {
    this.loadedCount++
    var percent = parseInt(this.loadedCount / this.list.length * 100)
    if(this.loading_callback) { this.loading_callback(src, percent) }
    if(this.loaded_callback && percent==100) { this.loaded_callback() } 
  };

  this.imageLoaded = function(e) {
    var asset = this.asset

    var new_image = that.image_to_canvas ? imageToCanvas(asset.image) : asset.image
    if(that.fuchia_to_transparent && that.getPostfix(asset.src) == "bmp") { new_image = fuchiaToTransparent(new_image) }

    that.data[asset.src] = new_image
    that.itemLoaded(asset.src)
  };
  
  this.audioLoaded = function(e) {
    var asset = this.asset
    that.data[asset.src] = asset.audio
    
    asset.audio.removeEventListener("canplay", that.audioLoaded, false);
    that.itemLoaded(asset.src)
  };
}

/*
 * Takes an image, returns a canvas.
 * Benchmarks has proven canvas to be faster to work with then images.
 * Returns: a canvas
 */
function imageToCanvas(image) {
  var canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height

  var context = canvas.getContext("2d")
  context.drawImage(image, 0, 0, image.width, image.height)
  return canvas
}

/* 
 * Make Fuchia (0xFF00FF) transparent
 * This is the de-facto standard way to do transparency in BMPs
 * Returns: a canvas
 */
function fuchiaToTransparent(image) {
  canvas = jaws.isImage(image) ? imageToCanvas(image) : image
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

/* Scale image by factor and keep jaggy retro-borders */
function retroScale(image, factor) {
  canvas = jaws.isImage(image) ? imageToCanvas(image) : image
  var context = canvas.getContext("2d")
  var img_data = context.getImageData(0,0,canvas.width,canvas.height)
  var pixels = img_data.data

  var canvas2 = document.createElement("canvas")
  canvas2.width = image.width * factor
  canvas2.height = image.height * factor
  var context2 = canvas.getContext("2d")
  var img_data2 = context2.getImageData(0,0,canvas2.width,canvas2.height)
  var pixels2 = img_data2.data

  for (var x = 0; x < canvas.width * factor; x++) { 
    for (var y = 0; y < canvas.height * factor; y++) { 
      pixels2[x*y] = pixels[x*y / factor]
      pixels2[x*y+1] = pixels[x*y+1 / factor]
      pixels2[x*y+2] = pixels[x*y+2 / factor]
      pixels2[x*y+3] = pixels[x*y+3 / factor]
    } 
  }

  context2.putImageData(img_data2,0,0);
  return canvas2
}

jaws.assets = new Asset()

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
 *
 * GameLoop
 *
 * function draw() {
 *    ... your stuff executed every 30 FPS ...
 * }
 *
 * gameloop = jaws.GameLoop(setup, update, draw, 30)
 * gameloop.start()
 *
 * gameloop.start() starts a 2-step process, where first all assets are loaded. 
 * Then the real gameloop is started with the userspecified FPS.
 *
 * If using the shorter jaws.init() a GameLoop will automatically be created and started for you.
 *
 */
jaws.GameLoop = function(setup, update, draw, wanted_fps) {
  this.ticks = 0
  this.tick_duration = 0
  this.fps = 0
  
  var update_id
  var paused = false
  var that = this

  this.start = function() {
    jaws.debug("gameloop start", true)
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 
    if(setup) { setup() }
    update_id = setInterval(this.loop, 1000 / wanted_fps);
    jaws.debug("gameloop loop", true)
  }
  
  this.loop = function() {
    that.current_tick = (new Date()).getTime();
    that.tick_duration = that.current_tick - that.last_tick
    that.fps = parseInt(1000 / that.tick_duration)

    if(!paused) {
      if(update) { update() }
      if(draw)   { draw() }
      that.ticks++
    }

    that.last_tick = that.current_tick;
  }
  
  this.pause = function()   { paused = true }
  this.unpause = function() { paused = false }

  this.stop = function() {
    if(update_id) { clearInterval(update_id); }
  }
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
 * A bread and butter Rect() - useful for basic collision detection
 */
jaws.Rect = function(x,y,width,height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.right = x + width
  this.bottom = y + height
}

jaws.Rect.move = function(x,y) {
  this.x += x
  this.y += y
  this.right += x
  this.bottom += y
}

jaws.Rect.moveTo = function(x,y) {
  this.x = x
  this.y = y
  this.right = this.x + this.width
  this.bottom = this.y + this.height
}

// Draw a red rectangle, usefull for debug
jaws.Rect.prototype.draw = function() {
  jaws.context.strokeStyle = "red"
  jaws.context.strokeRect(this.x, this.y, this.width, this.height)
}

// Returns true if point at x, y lies within calling rect
jaws.Rect.prototype.collidePoint = function(x, y) {
  return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
}

// Returns true if calling rect overlaps with given rect in any way
jaws.Rect.prototype.collideRect = function(rect) {
  return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
         ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom))
}

/* TODO: add tests for bellow functions */
jaws.Rect.prototype.collideRightSide = function(rect)  { return(this.right >= rect.x && this.x < rect.x) }
jaws.Rect.prototype.collideLeftSide = function(rect)   { return(this.x > rect.x && this.x <= rect.right) }
jaws.Rect.prototype.collideTopSide = function(rect)    { return(this.y >= rect.y && this.y <= rect.bottom) }
jaws.Rect.prototype.collideBottomSide = function(rect) { return(this.bottom >= rect.y && this.y < rect.y) }
jaws.Rect.prototype.toString = function() { return "[Rect " + this.x + ", " + this.y + "," + this.width + "," + this.height + "]" }

return jaws;
})(jaws || {});

/*
 * 
 * This is usually the Constructor we use when we want characters on the screen.
 * Comes with various properties:
 *
 * Properties: x, y, alpha, angle, flipped
 * Setters: setImage(), anchor(), scale()
 */
var jaws = (function(jaws) {

jaws.Sprite = function(options) {
  this.options = options
  this.x = options.x || 0
  this.y = options.y || 0
  this.alpha = options.alpha || 1
  this.context = options.context || jaws.context
  this.anchor_x = options.anchor_x || 0
  this.anchor_y = options.anchor_y || 0
  this.angle = options.angle || 0
  this.flipped = options.flipped || false
  
  options.image           &&  this.setImage(options.image)
  options.anchor          &&  this.setAnchor(options.anchor)
  this.setScale(options.scale)
 
  // No canvas context? Switch to DOM-based spritemode
  if(!this.context) { this.createDiv() }
}

/* Flip the sprite horizontally */
jaws.Sprite.prototype.flip = function() {
  this.flipped = this.flipped ? false : true
}

/* Set sprites x/y position */
jaws.Sprite.prototype.move = function(x,y) {
  this.x += x
  this.y += y
}
/* Modify sprites x/y position */
jaws.Sprite.prototype.moveTo = function(x,y) {
  this.x = x
  this.y = y
}

/* When image, scale or anchor changes we re-cache these values for speed */
jaws.Sprite.prototype.calcBorderOffsets = function() {
  if(!this.image) { return }

  this.width = this.image.width * this.scale
  this.height = this.image.height * this.scale

  this.left_offset = this.width * this.anchor_x
  this.top_offset = this.height * this.anchor_y
  //this.right_offset =  this.width * (1.0 - this.anchor_x)
  //this.bottom_offset = this.height * (1.0 - this.anchor_y)
} 

/* Set sprites image from an image or asset-string. Recalculate height/width etc. */
jaws.Sprite.prototype.setImage = function(value)   { 
  this.image = (jaws.isDrawable(value) ? value : jaws.assets.data[value])
  this.calcBorderOffsets(); 
}

/* */
jaws.Sprite.prototype.setScale = function(value) { 
  this.scale = value || 1; 
  this.calcBorderOffsets(); 
}

jaws.Sprite.prototype.toRect = function() {
  if(!this.image) { return undefined } // No rect without an image
  return (new jaws.Rect(this.x - this.left_offset, this.y - this.top_offset, this.width, this.height))
}

/* Make this sprite a DOM-based <div> sprite */
jaws.Sprite.prototype.createDiv = function() {
  this.div = document.createElement("div")
  this.div.style.position = "absolute"
  if(this.image) {
    this.div.style.width = this.image.width + "px"
    this.div.style.height = this.image.height + "px"
    this.div.style.backgroundImage = "url(" + this.image.src + ")"
  }
  if(jaws.dom) { jaws.dom.appendChild(this.div) }
  this.updateDiv()
}

/* Update properties for DOM-based sprite */
jaws.Sprite.prototype.updateDiv = function() {
  this.div.style.left = this.x + "px"
  this.div.style.top = this.y + "px"

  var transform = ""
  transform += "rotate(" + this.angle + "deg) "
  if(this.flipped)          { transform += "scale(-" + this.scale + "," + this.scale + ")"; }
  else if(this.scale != 1)  { transform += "scale(" + this.scale + ")"; }

  this.div.style.MozTransform = transform
  this.div.style.WebkitTransform = transform
  this.div.style.transform = transform
}

// Draw the sprite on screen via its previously given context
jaws.Sprite.prototype.draw = function() {
  if(jaws.dom) { return this.updateDiv() }
  if(!this.image) { return }

  this.context.save()
  this.context.translate(this.x, this.y)
  this.angle && jaws.context.rotate(this.angle * Math.PI / 180)
  this.flipped && this.context.scale(-1, 1)
  this.context.globalAlpha = this.alpha
  this.context.translate(-this.left_offset, -this.top_offset)
  this.context.drawImage(this.image, 0, 0, this.width, this.height);
  this.context.restore()
  return this
}

// Create a new canvas context, draw sprite on it and return. Use to get a raw canvas copy of the current sprite state.
jaws.Sprite.prototype.asCanvasContext = function() {
  var canvas = document.createElement("canvas")
  canvas.width = this.width
  canvas.height = this.height

  var context = canvas.getContext("2d")
  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled

  context.drawImage(this.image, 0, 0, this.width, this.height)
  return context
}

// Rotate sprite 'value' degrees
jaws.Sprite.prototype.rotate = function(value) {
  this.angle += value
  return this
}

//
// The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
// or "when rotating, what point of the of the sprite will it rotate round"
//
// For example, a topdown shooter could use anchor("center") --> Place middle of the ship on x/y
// .. and a sidescroller would probably use anchor("center_bottom") --> Place "feet" at x/y
//
jaws.Sprite.prototype.setAnchor = function(align) {
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

  if(a = anchors[align]) {
    this.anchor_x = a[0]
    this.anchor_y = a[1]
    this.calcBorderOffsets()
  }
  return this
}
jaws.Sprite.prototype.toString = function() { return "[Sprite " + this.x + ", " + this.y + "," + this.width + "," + this.height + "]" }

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
 *
 * Constructor to manage your Sprites. 
 *
 * Sprites (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 *
 * This is where SpriteList() comes in.
 *
 *   var enemies = new SpriteList()
 *
 *   for(i=0; i < 100; i++) { // create 100 enemies 
 *     enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
 *   }
 *   enemies.draw() // calls draw() on all enemies 
 *   enemies.deleteIf(isOutsideCanvas)  // deletes each item in enemies that returns true when isOutsideCanvas(item) is called
 *   enemies.drawIf(isInsideViewport)   // only call draw() on items that returns true when isInsideViewport is called with item as argument 
 *
 */

jaws.SpriteList = function() {}
jaws.SpriteList.prototype = new Array

jaws.SpriteList.prototype.draw = function() {
  for(i=0; this[i]; i++) { 
    this[i].draw() 
  }
}

jaws.SpriteList.prototype.drawIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].draw() }
  }
}

jaws.SpriteList.prototype.update = function() {
  for(i=0; this[i]; i++) {
    this[i].update()
  }
}

jaws.SpriteList.prototype.updateIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].update() }
  }
}

jaws.SpriteList.prototype.deleteIf = function(condition) {
  for(var i=0; this[i]; i++) {
    if( condition(this[i]) ) { this.splice(i,1) }
  }
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/* Cut out a rectangular piece of a an image, returns as canvas-element */
function cutImage(image, x, y, width, height) {
  var cut = document.createElement("canvas")
  cut.width = width
  cut.height = height
  
  var ctx = cut.getContext("2d")
  ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height)
  
  return cut
};

/* Cut up into frame_size pieces and put them in frames[] */
jaws.SpriteSheet = function(options) {
  this.image = jaws.isDrawable(options.image) ? options.image : jaws.assets.data[options.image]
  this.orientation = options.orientation || "right"
  this.frame_size = options.frame_size || [32,32]
  this.frames = []

  var index = 0
  for(var x=0; x < this.image.width; x += this.frame_size[0]) {
    for(var y=0; y < this.image.height; y += this.frame_size[1]) {
      this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) )
    }
  }
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

jaws.Parallax = function(options) {
  this.scale = options.scale || 1
  this.repeat_x = options.repeat_x
  this.repeat_y = options.repeat_y
  this.camera_x = options.camera_x || 0
  this.camera_y = options.camera_y || 0
  this.layers = []
}

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
jaws.Parallax.prototype.addLayer = function(options) {
  var layer = new jaws.ParallaxLayer(options)
  layer.scale(this.scale)
  this.layers.push(layer)
}

jaws.ParallaxLayer = function(options) {
  this.damping = options.damping || 0
  jaws.Sprite.call(this, options)
}
jaws.ParallaxLayer.prototype = jaws.Sprite.prototype

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
 *
 * Animation() 
 *
 * Manages animation with a given list of frames and durations
 * Takes a object as argument:
 *
 * loop:    true|false  - restart animation when end is reached
 * bounce:  true|false  - rewind the animation frame by frame when end is reached
 * index:   int         - start on this frame
 * frames   array       - array of image/canvas items
 * frame_duration  int   - how long should each frame be displayed
 *
 */
jaws.Animation = function(options) {
  this.options = options
  this.frames = options.frames || []
  this.frame_duration = options.frame_duration || 100   // default: 100ms between each frameswitch
  this.index = options.index || 0                       // default: start with the very first frame
  this.loop = options.loop || 1
  this.bounce = options.bounce || 0
  this.frame_direction = 1

  if(options.sprite_sheet) {
    var image = (jaws.isImage(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    var sprite_sheet = new jaws.SpriteSheet({image: image, frame_size: options.frame_size})
    this.frames = sprite_sheet.frames
  }

  /* Initializing timer-stuff */ 
  this.current_tick = (new Date()).getTime();
  this.last_tick = (new Date()).getTime();
  this.sum_tick = 0
}

// Propells the animation forward by counting milliseconds and changing this.index accordingly
// Supports looping and bouncing animations.
jaws.Animation.prototype.update = function() {
  this.current_tick = (new Date()).getTime();
  this.sum_tick += (this.current_tick - this.last_tick);
  this.last_tick = this.current_tick;
 
  if(this.sum_tick > this.frame_duration) {
    this.index += this.frame_direction
    this.sum_tick = 0
  }
  if( (this.index >= this.frames.length) || (this.index <= 0) ) {
    if(this.bounce) {
      this.frame_direction = -this.frame_direction
      this.index += this.frame_direction*2
    }
    else if(this.loop) {
      this.index = 0
    }
  }
  return this
}

// Like array.slice but returns a new Animation-object with a subset of the frames
jaws.Animation.prototype.slice = function(start, stop) {
  var o = {} 
  o.frame_duration = this.frame_duration
  o.loop = this.loop
  o.bounce = this.bounce
  o.frame_direction = this.frame_direction
  o.frames = this.frames.slice().slice(start, stop)
  return new jaws.Animation(o)
};

// Moves animation forward by calling update() and then return the current frame
jaws.Animation.prototype.next = function() {
  this.update()
  return this.frames[this.index]
};

// returns the current frame
jaws.Animation.prototype.currentFrame = function() {
  return this.frames[this.index]
};

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
 *
 * Viewport() is a window (a Rect) into a bigger canvas/image
 *
 * It won't every go "outside" that image.
 * It comes with convenience methods as:
 *
 *   viewport.centerAround(player) which will do just what you think. (player needs to have properties x and y)
 *
 *
 */
jaws.Viewport = function(options) {
  this.options = options
  this.context = options.context || jaws.context
  this.width = options.width || jaws.width
  this.height = options.height || jaws.height
  this.max_x = options.max_x || jaws.width 
  this.max_y = options.max_y || jaws.height
  
  this.verifyPosition = function() {
    var max = this.max_x - this.width
    if(this.x < 0)      { this.x = 0 }
    if(this.x > max)    { this.x = max }

    var max = this.max_y - this.height
    if(this.y < 0)      { this.y = 0 }
    if(this.y > max)    { this.y = max }
  };
 
  this.move = function(x, y) {
    x && (this.x += x)
    y && (this.y += y)
    this.verifyPosition()
  };
  
  this.moveTo = function(x, y) {
    if(!(x==undefined)) { this.x = x }
    if(!(y==undefined)) { this.y = y }
    this.verifyPosition()
  };

  this.isOutside = function(item) {
    return(!this.isInside(item))
  };

  this.isInside = function(item) {
    return( item.x >= this.x && item.x <= (this.x + this.width) && item.y >= this.y && item.y <= (this.y + this.height) )
  };

  this.centerAround = function(item) {
    this.x = (item.x - this.width / 2)
    this.y = (item.y - this.height / 2)
    this.verifyPosition()
  };

  this.apply = function(func) {
    this.context.save()
    this.context.translate(-this.x, -this.y)
    func()
    this.context.restore()
  };
  
  this.moveTo(options.x||0, options.y||0)
}

return jaws;
})(jaws || {});

var jaws = (function(jaws) {

/*
 * TileMap - fast access to tiles
 *
 * var tile_map = new TileMap({size: [10, 10], cell_size: [16,16]})
 * var sprite = new jaws.Sprite({x: 40, y: 40})
 * var sprite2 = new jaws.Sprite({x: 41, y: 41})
 * tile_map.push(sprite)
 *
 * tile_map.at(10,10)  // nil
 * tile_map.at(40,40)  // sprite
 * tile_map.cell(0,0)  // nil
 * tile_map.cell(1,1)  // sprite
 *
 */
jaws.TileMap = function(options) {
  this.cell_size = options.cell_size || [32,32]
  this.size = options.size
  this.cells = new Array(this.size[0])

  for(var i=0; i < this.size[0]; i++) {
    this.cells[i] = new Array(this.size[1])
  }
}

/*
 * Push obj (or array of objs) into our cell-grid.
 *
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
jaws.TileMap.prototype.push = function(obj) {
  if(jaws.isArray(obj)) { 
    for(var i=0; i < obj.length; i++) { 
      this.push(obj[i]) 
    }
    return obj
  }
  if(obj.toRect) {
    return this.pushAsRect(obj, obj.toRect())
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }

}

/* save 'obj' in cells touched by 'rect' */
jaws.TileMap.prototype.pushAsRect = function(obj, rect) {
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt((rect.right-1) / this.cell_size[0])

  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt((rect.bottom-1) / this.cell_size[1])
    
    for(var row = from_row; row <= to_row; row++) {
      //console.log("atRect() col/row: " + col + "/" + row + " - " + this.cells[col][row])
      this.pushToCell(col, row, obj)
    }
  }
  return obj
}

/* Push obj to a specific cell specified by col and row */
jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
  // console.log("pushToCell col/row: " + col + "/" + row)
  if(current_obj = this.cells[col][row]) { this.cells[col][row] = [current_obj, obj] }
  else                                   { this.cells[col][row] = obj }
  return this.cells[col][row]
}



//
// READERS
// 

/* Get objects in cell that exists at coordinates x / y  */
jaws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  // console.log("at() col/row: " + col + "/" + row)
  return this.cells[col][row]
}

/* Returns occupants of all cells touched by 'rect' */
jaws.TileMap.prototype.atRect = function(rect) {
  var objects = []
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt(rect.right / this.cell_size[0])
  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt(rect.bottom / this.cell_size[1])
    
    for(var row = from_row; row <= to_row; row++) {
      var items = this.cells[col][row]
      if(items) {
        if(jaws.isArray(items)) {
          items.forEach( function(item, total) { 
            if(objects.indexOf(item) == -1) { objects.push(item) }
          })
        }
        else {
          if(objects.indexOf(items) == -1) { objects.push(items) }
        }
      }
    }
  }
  return objects
}

/*
 * Get objects in cell at col / row
 */
jaws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

return jaws;
})(jaws || {});
