var jaws = (function(jaws) {

/**
 * @class Manages an animation with a given list of frames
 *
 * @property loop   true|false, restart animation when end is reached
 * @property bounce true|false, rewind the animation frame by frame when end is reached
 * @property index  int, start on this frame
 * @property frames array of images/canvaselements
 * @property frame_duration milliseconds  how long should each frame be displayed
 * @property frame_size array containing width/height
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

  if(options.scale_image) {
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    this.frame_size[0] *= options.scale_image
    this.frame_size[1] *= options.scale_image
    options.sprite_sheet = jaws.gfx.retroScaleImage(image, options.scale_image)
  }

  if(options.sprite_sheet) {
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    var sprite_sheet = new jaws.SpriteSheet({image: image, frame_size: this.frame_size, orientation: this.orientation})
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

