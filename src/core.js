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
var log_tag  

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
    if(window[item])  { jaws.log(item + "already exists in global namespace") }
    else              { window[item] = jaws[item] }
  });
}


/*
 * Logger, adds text to previously found or created <div id="jaws-log">
 */
jaws.log = function(msg, add) {
  if(log_tag) {
    msg += "<br />"
    if(add) { log_tag.innerHTML = log_tag.innerHTML.toString() + msg } 
    else { log_tag.innerHTML = msg }
  }
}

/*
 * init()
 *
 * Initializes / creates:
 * - jaws.canvas / jaws.context / jaws.dom (our drawable gamearea)
 * - jaws.width / jaws.height (width/height of drawable gamearea)
 * - jaws.url_parameters (hash of key/values of all parameters in current url)
 * - title / log_tag (used internally by jaws)
 *
 * */
jaws.init = function(options) {
  /* Find <title> tag */
  title = document.getElementsByTagName('title')[0]
  jaws.url_parameters = getUrlParameters()

  /*
   * If debug=1 parameter is present in the URL, let's either find <div id="jaws-log"> or create the tag.
   * jaws.log(message) will use this div for debug/info output to the gamer or developer
   *
   */
  log_tag = document.getElementById('jaws-log')
  if(jaws.url_parameters["debug"]) {
    if(!log_tag) {
      log_tag = document.createElement("div")
      log_tag.style.cssText = "overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;"
      document.body.appendChild(log_tag)
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
*
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
    jaws.log("creating canvas", true)
  }
  else {
    jaws.log("found canvas", true)
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
  var wanted_fps = (options && options.fps) || 60

  jaws.init()
  jaws.log("setupInput()", true)
  jaws.setupInput()

  /* Callback for when one single assets has been loaded */
  function assetLoaded(src, percent_done) {
    jaws.log( percent_done + "%: " + src, true)
  }

  /* Callback for when an asset can't be loaded*/
  function assetError(src) {
    jaws.log( "Error loading: " + src)
  }

  /* Callback for when all assets are loaded */
  function assetsLoaded() {
    jaws.log("all assets loaded", true)
    
    // This makes both jaws.start() and jaws.start(MenuState) possible
    // Run game state constructor (new) after all assets are loaded
    if( game_state && jaws.isFunction(game_state) ) { game_state = new game_state }
    if(!game_state)                                 { game_state = window }

    jaws.gameloop = new jaws.GameLoop(game_state.setup, game_state.update, game_state.draw, wanted_fps)
    jaws.game_state = game_state
    jaws.gameloop.start()
  }

  jaws.log("assets.loadAll()", true)
  if(jaws.assets.length() > 0)  { jaws.assets.loadAll({onload:assetLoaded, onerror:assetError, onfinish:assetsLoaded}) }
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
  
  jaws.previous_game_state = jaws.game_state
  jaws.game_state = game_state
  jaws.gameloop = new jaws.GameLoop(game_state.setup, game_state.update, game_state.draw, jaws.gameloop.fps)
  jaws.gameloop.start()
}

/* Always return obj as an array. forceArray(1) -> [1], forceArray([1,2]) -> [1,2] */
jaws.forceArray = function(obj) {
  return Array.isArray(obj) ? obj : [obj]
}

/* Clears canvas through context.clearRect() */
jaws.clear = function() {
  jaws.context.clearRect(0,0,jaws.width,jaws.height)
}

/* returns true if obj is an Image */
jaws.isImage = function(obj)  { 
  return Object.prototype.toString.call(obj) === "[object HTMLImageElement]" 
}

/* returns true of obj is a Canvas-element */
jaws.isCanvas = function(obj) { 
  return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]" 
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
jaws.isArray = function(obj)  { 
  return !(obj.constructor.toString().indexOf("Array") == -1) 
}

/* returns true of obj is a Function */
jaws.isFunction = function(obj) { 
  return (Object.prototype.toString.call(obj) === "[object Function]") 
}

/* 
 * Return a hash of url-parameters and their values
 *
 * http://test.com/?debug=1&foo=bar  ->  [debug: 1, foo: bar]
 */
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

