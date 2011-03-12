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

jaws.__defineSetter__("title", function(s) { title.innerHTML = s })
jaws.__defineGetter__("title", function()  { return title.innerHTML })
jaws.__defineGetter__("width", function()  { return (jaws.canvas ? jaws.canvas.width : jaws.dom.offsetWidth) })
jaws.__defineGetter__("height", function() { return (jaws.canvas ? jaws.canvas.height  : jaws.dom.offsetHeight)})

/*
 * Unpacks Jaws core-constructors into the global namespace
 * After calling unpack you can use:
 * "Sprite()" instead of "jaws.Sprite()"
 * "Animation()" instead of "jaws.Animation()"
 * .. and so on.
 *
 */
jaws.unpack = function() {
  var make_global = ["Sprite", "SpriteList", "Animation", "Viewport", "SpriteSheet", "Parallax", "Rect", "Array", "pressed"]

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
 * sets up various variables needed by jaws. Gets canvas and context.
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

