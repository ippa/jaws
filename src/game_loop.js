if(typeof require !== "undefined") { var jaws = require("./core.js"); }

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

