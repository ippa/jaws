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
  var make_global = ["Sprite", "Animation", "Viewport", "SpriteSheet", "Parallax", "Rect", "Array"]

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

/* Quick and easy startup of a jaws gameloop. Can also be done manually with new jaws.GameLoop etc. */
jaws.start = function() {
  // This makes both jaws.start() and jaws.start(MenuState) possible
  var options = arguments[0] ? arguments[0] : {}
  if( jaws.isFunction(options) ) { options = new options  }

  // If no arguments are given to start() we use the global functions setup/update/draw
  var setup =  options.setup || window.setup
  var update = options.update || window.update
  var draw = options.draw || window.draw
  var wanted_fps = options.fps || parseInt(arguments[1]) || 60

  jaws.init(options)

  jaws.debug("setupInput()", true)
  jaws.setupInput()

  function assetsLoading(src, percent_done) {
    jaws.debug( percent_done + "%: " + src, true)
  }

  function assetsLoaded() {
    jaws.debug("all assets loaded", true)
    jaws.gameloop = new jaws.GameLoop(setup, update, draw, wanted_fps)
    jaws.gameloop.start()
  }

  jaws.debug("assets.loadAll()", true)
  if(jaws.assets.length() > 0) { jaws.assets.loadAll({loading: assetsLoading, loaded: assetsLoaded}) }
  else                        { assetsLoaded() } 
}

/*
 * Switch to a new active game state
 * Save previous game state in jaws.previous_game_state
 * 
 */
jaws.switchGameState = function(game_state) {
  jaws.gameloop.stop()
  
  /* clear out any keyboard-events for this game state */
  on_keydown_callbacks = []
  on_keyup_callbacks = []
 
  if(jaws.isFunction(game_state)) { game_state = new game_state }
  
  jaws.previous_game_state = game_state
  jaws.game_state = game_state
  jaws.gameloop = new jaws.GameLoop(game_state.setup, game_state.update, game_state.draw, jaws.gameloop.fps)
  jaws.gameloop.start()
}

jaws.isImage = function(obj) {
  return Object.prototype.toString.call(obj) === "[object HTMLImageElement]";
}
jaws.isCanvas = function(obj) {
  return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]";
}
jaws.isDrawable = function(obj) {
  return jaws.isImage(obj) || jaws.isCanvas(obj)
}
jaws.isString = function(obj) {
  return (typeof obj == 'string')
}
jaws.isArray = function(obj) {
  return !(obj.constructor.toString().indexOf("Array") == -1)
}
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

