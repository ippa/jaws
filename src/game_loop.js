var jaws = (function(jaws) {

/*
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
 * @class GameLoop
 *
 */
jaws.GameLoop = function(setup, update, draw, wanted_fps) {
  this.ticks = 0
  this.tick_duration = 0
  this.fps = 0
  
  var update_id
  var paused = false
  var that = this
  var mean_value = new MeanValue(20) // let's have a smooth, non-jittery FPS-value

  /** Start the gameloop by calling setup() once and then loop update()/draw() forever with given FPS */
  this.start = function() {
    jaws.log("gameloop start", true)
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 
    if(setup) { setup() }
    update_id = setInterval(this.loop, 1000 / wanted_fps);
    jaws.log("gameloop loop", true)
  }
  
  /** The core of the gameloop. Calculate a mean FPS and call update()/draw() if gameloop is not paused */
  this.loop = function() {
    that.current_tick = (new Date()).getTime();
    that.tick_duration = that.current_tick - that.last_tick
    //that.fps = parseInt(1000 / that.tick_duration)
    that.fps = mean_value.add(1000/that.tick_duration).get()

    if(!paused) {
      if(update) { update() }
      if(draw)   { draw() }
      that.ticks++
    }

    that.last_tick = that.current_tick;
  }
  
  /** Pause the gameloop. loop() will still get called but not update() / draw() */
  this.pause = function()   { paused = true }
  /** unpause the gameloop */
  this.unpause = function() { paused = false }

  /** Stop the gameloop */
  this.stop = function() {
    if(update_id) { clearInterval(update_id); }
  }
}

/** @private */
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

