/*
 *
 * Jaws - a HTML5 canvas/javascript 2D game development framework
 *
 * Homepage:    http://jawsjs.com/
 * Works with:  Chrome 6.0+, Firefox 3.6+, 4+, IE 9+
 *
 * Formating guide:
 *
 *   jaws.oneFunction()
 *   jaws.one_variable = 1
 *   new jaws.OneConstructor
 *
 * Jaws uses the "module pattern" and exposes itself through the global "jaws". It should play nice with all other JS libs.
 * Jaws is using HTML5s <canvas> for all it's graphical operations, so the newer browser the better.
 * Older browsers doesn't support <canvas>. Or if they do, they don't accelerate it with hardware.
 *
 * Have fun! 
 *
 * ippa. 
 *
 */
(function(global, undefined) {
  var pressed_keys = {}
  var keycode_to_string = []
  var on_keydown_callbacks = []
  var on_keyup_callbacks = []
  var assets = new _Asset()
  var gameloop = 0
  var title
  var canvas
  var context
  var game_state
  var previous_game_state
  var url_parameters
  var debug_tag

/* 
 * Expose these properties via the global "jaws".
 * As a gamedeveloper this is what you got to work with:
 */
var jaws = {
  GameLoop: GameLoop,
  Sprite: Sprite,
  Parallax: Parallax,
  SpriteSheet: SpriteSheet,
  Animation: Animation,
  assets: assets,
  Rect: Rect,
  Viewport: Viewport,
  debug: debug,
  pressed: pressed,
  on_keydown: on_keydown,
  on_keyup: on_keyup,
  preventDefaultKeys: preventDefaultKeys,
  gameloop: gameloop,
  canvas: canvas,
  context: context,
  game_state: game_state,
  previous_game_state: previous_game_state,
  switchGameState: switchGameState,
  isString: isString,
  isFunction: isFunction,
  isArray: isArray,
  isImage: isImage,
  isCanvas: isCanvas,
  isDrawable: isDrawable,
  combinations: combinations,
  url_parameters: url_parameters,
  init: init,
  start: start
}

jaws.__defineSetter__("title", function(s) { title.innerHTML = s })
jaws.__defineGetter__("title", function() { return title.innerHTML })
jaws.__defineGetter__("width", function() { return jaws.canvas.width })
jaws.__defineGetter__("height", function() { return jaws.canvas.height })


/*
 * Map all javascript keycodes to easy-to-remember letters/words
 */
function setupInput() {
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
  
  this.keycode_to_string = k

  window.onkeydown = function(e) { handleKeyDown(e) }
  window.onkeyup = function(e) { handleKeyUp(e) }
  window.onkeypress = function(e) {};
}

/*
 * handle event "onkeydown" by remembering what key was pressed
 */
function handleKeyUp(e) {
  event = (e) ? e : window.event
  var human_name = this.keycode_to_string[event.keyCode]
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { 
    on_keyup_callbacks[human_name]() 
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }
}

/*
 * handle event "onkeydown" by remembering what key was un-pressed
 */
function handleKeyDown(e) {
  event = (e) ? e : window.event  
  var human_name = this.keycode_to_string[event.keyCode]
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
function preventDefaultKeys(array_of_strings) {
  array_of_strings.forEach( function(item, index) {
    prevent_default_keys[item] = true
  });
}

/*
 * helper to check if a given key currently is pressed. returns true or false.
 */
function pressed(string) {
  return pressed_keys[string]
}

function on_keydown(key, callback) {
  if(isArray(key)) {
    for(var i=0; key[i]; i++) {
      on_keydown_callbacks[key[i]] = callback
    }
  }
  else {
    on_keydown_callbacks[key] = callback
  }
}

function on_keyup(key, callback) {
  if(isArray(key)) {
    for(var i=0; key[i]; i++) {
      on_keyup_callbacks[key[i]] = callback
    }
  }
  else {
    on_keyup_callbacks[key] = callback
  }
}


/*
 * Simple debug output, adds text to previously found or created <div id="jaws-debug">
 */
function debug(msg, add) {
  if(debug_tag) {
    msg += "<br />"
    if(add) { debug_tag.innerHTML = debug_tag.innerHTML.toString() + msg } 
    else { debug_tag.innerHTML = msg }
  }
}

/*
 * init()
 *
 * sets up various variables needed by jaws. Gets canvas and context.
 *
 * */
function init() {
  /* Find <title> tag */
  title = document.getElementsByTagName('title')[0]

  url_parameters = getUrlParameters()

  /*
   * If debug=1 parameter is present in the URL, let's either find <div id="jaws-debug"> or create the tag.
   * jaws.debug(message) will use this div for debug/info output to the gamer or developer
   *
   */
  if(url_parameters["debug"]) {
    debug_tag = document.getElementById('jaws-debug')
    if(!debug_tag) {
      debug_tag = document.createElement("div")
      debug_tag.style.cssText = "overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;"
      document.body.appendChild(debug_tag)
    }
  }

  /* 
   * Find the <canvas> so following draw-operations can use it.
   * If the developer didn't provide a <canvas> in his HTML, let's create one.
   *
   */
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

/* Quick and easy startup of a jaws gameloop. Can also be done manually with new jaws.GameLoop etc. */
function start() {
  // This makes both jaws.start() and jaws.start(MenuState) possible
  var options = arguments[0] ? arguments[0] : {}
  if( isFunction(options) ) { options = new options  }

  // If no arguments are given to start() we use the global functions setup/update/draw
  var setup =  options.setup || window.setup
  var update = options.update || window.update
  var draw = options.draw || window.draw
  var wanted_fps = options.fps || parseInt(arguments[1]) || 60

  init()

  debug("setupInput()", true)
  setupInput()

  function assetsLoading(src, percent_done) {
    debug( percent_done + "%: " + src, true)
  }

  function assetsLoaded() {
    debug("all assets loaded", true)
    jaws.gameloop = new jaws.GameLoop(setup, update, draw, wanted_fps)
    jaws.gameloop.start()
  }

  debug("assets.loadAll()", true)
  if(assets.length() > 0) { assets.loadAll({loading: assetsLoading, loaded: assetsLoaded}) }
  else                    { assetsLoaded() } 
}

/*
 * 
 * TODO: make this prettier! Also save previous game state.
 * 
 * */
function switchGameState(game_state) {
  jaws.gameloop.stop()
  
  /* clear out any keyboard-events for this game state */
  on_keydown_callbacks = []
  on_keyup_callbacks = []
 
  if(isFunction(game_state)) { game_state = new game_state }
  
  jaws.previous_game_state = game_state
  jaws.game_state = game_state
  jaws.gameloop = new jaws.GameLoop(game_state.setup, game_state.update, game_state.draw, jaws.gameloop.fps)
  jaws.gameloop.start()
}

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
function GameLoop(setup, update, draw, wanted_fps) {
  this.ticks = 0
  this.tick_duration = 0
  this.fps = 0
  
  var update_id
  var paused = false
  var that = this

  this.start = function() {
    debug("gameloop start", true)
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 
    if(setup) { setup() }
    update_id = setInterval(this.loop, 1000 / wanted_fps);
    debug("gameloop loop", true)
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



/* 
 * _Asset
 *
 * Provides a one-stop access point to all assets (images, sound, video)
 *
 * exposed as jaws.assets
 * 
 *
 * */
function _Asset() {
  this.list = []
  this.data = []
  that = this

  this.file_type = {}
  this.file_type["wav"] = "audio"
  this.file_type["mp3"] = "audio"
  this.file_type["ogg"] = "audio"
  this.file_type["png"] = "image"
  this.file_type["jpg"] = "image"
  this.file_type["jpeg"] = "image"
  this.file_type["bmp"] = "image"


  this.length = function() {
    return this.list.length
  }

  this.add = function(src) {
    this.list.push({"src": src})
    return this
  } 
  this.get = function(src) {
    return this.data[src]
  }
  
  this.getType = function(src) {
    postfix_regexp = /\.([a-zA-Z]+)/;
    postfix = postfix_regexp.exec(src)[1]
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
    that.data[asset.src] = asset.image
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
 * A bread and butter Rect() - useful for basic collision detection
 */
function Rect(x,y,width,height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  
  this.__defineGetter__("right", function() { return this.x + this.width } )
  this.__defineGetter__("bottom", function() { return this.y + this.height } )

  // Draw a red rectangle
  this.draw = function() {
    jaws.context.strokeStyle = "red"
    jaws.context.strokeRect(this.x, this.y, this.width, this.height)
  }

  // Returns true if point at x, y lies within calling rect
  this.collidePoint = function(x, y) {
    return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
  }

  // Returns true if calling rect overlaps with given rect in any way
  this.collideRect = function(rect) {
    return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
           ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom))
  }
}

/* TODO: add tests for bellow functions */
Rect.prototype.collideRightSide = function(rect)  { return(this.right >= rect.x && this.x < rect.x) }
Rect.prototype.collideLeftSide = function(rect)   { return(this.x > rect.x && this.x <= rect.right) }
Rect.prototype.collideTopSide = function(rect)    { return(this.y >= rect.y && this.y <= rect.bottom) }
Rect.prototype.collideBottomSide = function(rect) { return(this.bottom >= rect.y && this.y < rect.y) }


function Parallax(options) {
  this.scale = options.scale || 1
  this.camera_x = options.camera_x || 0
  this.camera_y = options.camera_y || 0
  this.layers = []
}

Parallax.prototype.draw = function(options) {
  var layer;
  for(var i=0; i < this.layers.length; i++) {
    layer = this.layers[i]
    layer.x = -(this.camera_x / layer.damping)
    layer.y = -(this.camera_y / layer.damping)
    layer.draw();
  }
}
Parallax.prototype.addLayer = function(options) {
  var layer = new ParallaxLayer(options)
  layer.scale = this.scale
  this.layers.push(layer)
}


function ParallaxLayer(options) {
  this.damping = options.damping || 0
  Sprite.call(this, options)
}
ParallaxLayer.prototype = Sprite.prototype

/*
 * 
 * This is usually the Constructor we use when we want characters on the screen.
 * Comes with various properties:
 *
 *  sprite.x        // horizontal position on canvas, 0 is farthest to the left
 *  sprite.y        // vertical position, 0 is top of the screen
 *  sprite.scale    // how much to scale the sprite when drawing it
 *  sprite.width    // width of the sprite, will take scale into consideration
 *  sprite.height   // height of the sprite, will take scale into consideration
 *  sprite.bottom 
 *  sprite.right 
 *
 */
function Sprite(options) {
  this.options = options
  this.x = options.x || 0
  this.y = options.y || 0
  this.context = options.context || jaws.context
  this.anchor_x = options.anchor_x || 0
  this.anchor_y = options.anchor_y || 0
  this.rotation = options.rotation || 0
  this.flipped = options.flipped || false
  this._scale = options.scale || 1
  this._rect = new Rect(0,0,0,0)

  var left_offset, top_offset, right_offset, bottom_offset

  this.__defineGetter__("width", function()   { return this._image.width * this._scale } )
  this.__defineGetter__("height", function()  { return this._image.height * this._scale } )
  this.__defineGetter__("left", function()    { return this.x - left_offset } )
  this.__defineGetter__("top", function()     { return this.y - top_offset } )
  this.__defineGetter__("right", function()   { return this.x + right_offset;  } )
  this.__defineGetter__("bottom", function()  { return this.y + bottom_offset } )

  this.calcBorderOffsets = function() {
    left_offset = this.width * this.anchor_x
    top_offset = this.height * this.anchor_y
    right_offset =  this.width * (1.0 - this.anchor_x)
    bottom_offset = this.height * (1.0 - this.anchor_y)
  } 

  this.__defineGetter__("image", function(value)   { return this._image })
  this.__defineSetter__("image", function(value)   { this._image = value; this.calcBorderOffsets(); })
  this.__defineGetter__("scale", function(value)   { return this._scale })
  this.__defineSetter__("scale", function(value)   { this._scale = value; this.calcBorderOffsets(); })


  options.image           && (this.image = isDrawable(options.image) ? options.image : assets.data[options.image])
  options.anchor          && this.anchor(options.anchor)
 
  this.__defineGetter__("rect", function() { 
    this._rect.x = this.left
    this._rect.y = this.top
    this._rect.width = this.width
    this._rect.height = this.height
    return this._rect
  })
}

// Create a new canvas context, draw sprite on it and return. Use to get a raw canvas copy of the current sprite state.
Sprite.prototype.asCanvasContext = function() {
  var canvas = document.createElement("canvas")
  canvas.width = this.width
  canvas.height = this.height

  var context = canvas.getContext("2d")
  context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled

  context.drawImage(this._image, 0, 0, this.width, this.height)
  return context
}

// Rotate sprite 'value' degrees
Sprite.prototype.rotate = function(value) {
  this.rotation += value
  return this
}

// Draw the sprite on screen via its previously given context
Sprite.prototype.draw = function() {
  this.context.save()
  
  this.context.translate(this.x, this.y)
  this.rotation && jaws.context.rotate(this.rotation * Math.PI / 180)
  this.flipped && this.context.scale(-1, 1)
  this.context.translate( -(this.anchor_x * this.width), -(this.anchor_y * this.height) )
  this.context.drawImage(this._image, 0, 0 , this.width, this.height);

  this.context.restore()
  return this
}

//
// The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
// or "when rotating, what point of the of the sprite will it rotate round"
//
// For example, a topdown shooter could use anchor("center") --> Place middle of the ship on x/y
// .. and a sidescroller would probably use anchor("center_bottom") --> Place "feet" at x/y
//
Sprite.prototype.anchor = function(align) {
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
    this._image && this.calcBorderOffsets()
  }
  return this
}


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
function Animation(options) {
  this.options = options
  this.frames = options.frames
  this.frame_duration = options.frame_duration || 100   // default: 100ms between each frameswitch
  this.index = options.index || 0                       // default: start with the very first frame
  this.loop = options.loop || 1
  this.bounce = options.bounce || 0
  this.frame_direction = 1

  if(options.sprite_sheet) {
    var image = (isImage(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    var sprite_sheet = new SpriteSheet({image: image, frame_size: options.frame_size})
    this.frames = sprite_sheet.frames
  }

  this.__defineGetter__("length", function() { return this.frames.length })

  /* Initializing timer-stuff */ 
  this.current_tick = (new Date()).getTime();
  this.last_tick = (new Date()).getTime();
  this.sum_tick = 0
}

// Propells the animation forward by counting milliseconds and changing this.index accordingly
// Supports looping and bouncing animations.
Animation.prototype.update = function() {
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
Animation.prototype.slice = function(start, stop) {
  var o = {} 
  o.frame_duration = this.frame_duration
  o.loop = this.loop
  o.bounce = this.bounce
  o.frame_direction = this.frame_direction
  o.frames = this.frames.slice().slice(start, stop)
  return new Animation(o)
}

// Moves animation forward by calling update() and then return the current frame
Animation.prototype.next = function() {
  this.update()
  return this.frames[this.index]
}
// returns the current frame
Animation.prototype.currentFrame = function() {
  return this.frames[this.index]
}

function cutImage(image, x, y, width, height) {
  var cut = document.createElement("canvas")
  cut.width = width
  cut.height = height
  
  var ctx = cut.getContext("2d")
  ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height)
  
  return cut
}

/* Cut up into frame_size pieces and put them in frames[] */
function SpriteSheet(options) {
  this.image = isImage(options.image) ? options.image : assets.data[options.image]
  this.orientation = options.orientation || "right"
  this.frame_size = options.frame_size || [32,32]
  this.frames = []

  var index = 0
  for(var x=0; x < this.image.width; x += this.frame_size[0]) {
    for(var y=0; y < this.image.height; y += this.frame_size[1]) {
      this.frames[index++] = cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1])
    }
  }
  this.__defineGetter__("length", function() { return this.frames.length})
}


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
function Viewport(options) {
  this.options = options
  this.context = options.context || jaws.context
  this.width = options.width || jaws.canvas.width
  this.height = options.height || jaws.canvas.height
  this.max_x = options.max_x || jaws.canvas.width 
  this.max_y = options.max_y || jaws.canvas.height
  this._x = options.x || 0
  this._y = options.y || 0
  
  this.__defineGetter__("x", function() {return this._x} );
  this.__defineGetter__("y", function() {return this._y} );

  this.__defineSetter__("x", function(value) {
    this._x = value
    var max = this.max_x - this.width
    if(this._x < 0)    { this._x = 0 }
    if(this._x > max)  { this._x = max }
  });
  
  this.__defineSetter__("y", function(value) {
    this._y = value
    var max = this.max_y - this.height
    if(this._y < 0)    { this._y = 0 }
    if(this._y > max)  { this._y = max }
  });

  this.isOutside = function(item) {
    return(!this.isInside(item))
  };

  this.isInside = function(item) {
    return( item.x >= this._x && item.x <= (this._x + this.width) && item.y >= this._y && item.y <= (this._y + this.height) )
  };

  this.centerAround = function(item) {
    this.x = (item.x - this.width / 2)
    this.y = (item.y - this.height / 2)
  };

  this.apply = function(func) {
    this.context.save()
    this.context.translate(-this._x, -this._y)
    func()
    this.context.restore()
  };
}

function isImage(obj) {
  return Object.prototype.toString.call(obj) === "[object HTMLImageElement]";
}
function isCanvas(obj) {
  return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]";
}
function isDrawable(obj) {
  return isImage(obj) || isCanvas(obj)
}
function isString(obj) {
  return (typeof obj == 'string')
}
function isArray(obj) {
  return !(obj.constructor.toString().indexOf("Array") == -1)
}
function isFunction(obj) {
  return (Object.prototype.toString.call(obj) === "[object Function]")
}

function combinations(s, n) {
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


global.jaws = jaws

})(this);


/*
 *
 * Convenience Array prototype methods to make keeping track of game objects fun again
 *
 * Having good game object manage functions helps a lot gamedev.
 * Game objects (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 *
 *   var enemies = []
 *
 *   for(i=0; i < 100; i++) { // create 100 enemies 
 *     enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
 *   }
 *   enemies.draw() // calls draw() on all enemies 
 *   enemies.deleteIf(isOutsideCanvas)  // deletes each item in enemies that returns true when isOutsideCanvas(item) is called
 *   enemies.drawIf(isInsideViewport)   // only call draw() on items that returns true when isInsideViewport is called with item as argument 
 *
 */
Array.prototype.draw = function() {
  for(i=0; this[i]; i++) { 
    this[i].draw() 
  }
}

Array.prototype.drawIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].draw() }
  }
}

Array.prototype.update = function() {
  for(i=0; this[i]; i++) {
    this[i].update()
  }
}

Array.prototype.updateIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].update() }
  }
}

Array.prototype.deleteIf = function(condition) {
  for(var i=0; this[i]; i++) {
    if( condition(this[i]) ) { this.splice(i,1) }
  }
}

