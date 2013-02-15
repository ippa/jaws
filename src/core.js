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
  jaws.mouse_y = (e.pageY || e.clientY)
  
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
jaws.start = function(game_state, options,game_state_setup_options) {
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
    jaws.switchGameState(game_state||window, {fps: fps},game_state_setup_options)
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
jaws.switchGameState = function(game_state, options,game_state_setup_options) {
  var fps = (options && options.fps) || (jaws.game_loop && jaws.game_loop.fps) || 60
  
  jaws.game_loop && jaws.game_loop.stop()
  jaws.clearKeyCallbacks() // clear out all keyboard callbacks
  if(jaws.isFunction(game_state)) { game_state = new game_state }
  
  jaws.previous_game_state = jaws.game_state
  jaws.game_state = game_state
  jaws.game_loop = new jaws.GameLoop(game_state, {fps: fps},game_state_setup_options)
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

