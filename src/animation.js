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
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
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

jaws.Animation.prototype.toString = function() { return "[Animation, " + this.frames.length + " frames]" }

return jaws;
})(jaws || {});

