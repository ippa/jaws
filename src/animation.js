var jaws = (function(jaws) {

/**
 * @class Manages an animation with a given list of frames. "Field Summary" contains options for the Animation()-constructor.
 *
 * @property {bool} loop        Restart animation when end is reached
 * @property {bool} bounce      Rewind the animation frame by frame when end is reached
 * @property {int} index          Start on this frame
 * @property {array} frames       Images/canvaselements
 * @property {milliseconds} frame_duration  How long should each frame be displayed
 * @property {int} frame_direction  -1 for backwards animation. 1 is default
 * @property {array} frame_size     Containing width/height, eg. [32, 32]
 * @property {int} offset           When cutting out frames from a sprite sheet, start at this frame
 * @property {string} orientation   How to cut out frames frmo sprite sheet, possible values are "down" or "right"
 * @property {function} on_end      Function to call when animation ends. triggers only on non-looping, non-bouncing animations
 * @property {object} subsets       Name specific frames-intervals for easy access later, i.e. {move: [2,4], fire: [4,6]}. Access with animation.subset[name]
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

  jaws.parseOptions(this, options, this.default_options);

  if(options.sprite_sheet) {
    var sprite_sheet = new jaws.SpriteSheet({image: options.sprite_sheet, scale_image: this.scale_image, frame_size: this.frame_size, orientation: this.orientation, offset: this.offset})
    this.frames = sprite_sheet.frames
    this.frame_size = sprite_sheet.frame_size
  }

  if(options.scale_image) {
    var image = (jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet))
    this.frame_size[0] *= options.scale_image
    this.frame_size[1] *= options.scale_image
    options.sprite_sheet = jaws.retroScaleImage(image, options.scale_image)
  }

  /* Initializing timer-stuff */
  this.current_tick = (new Date()).getTime();
  this.last_tick = (new Date()).getTime();
  this.sum_tick = 0

  if(options.subsets) {
    this.subsets = {}
    for(subset in options.subsets) {
      start_stop = options.subsets[subset]
      this.subsets[subset] = this.slice(start_stop[0], start_stop[1])
    }
  }
}

jaws.Animation.prototype.default_options = {
  frames: [],
  subsets: [],
  frame_duration: 100,  // default: 100ms between each frameswitch
  index: 0,             // default: start with the very first frame
  loop: 1,
  bounce: 0,
  frame_direction: 1,
  frame_size: null,
  orientation: "down",
  on_end: null,
  offset: 0,
  scale_image: null,
  sprite_sheet: null
}

/**
 * Return a special animationsubset created with "subset"-parameter when initializing
 *
 */
jaws.Animation.prototype.subset = function(subset) {
  return this.subsets[subset]
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
      if(this.frame_direction < 0) { 
        this.index = this.frames.length -1; 
      } else { 
        this.index = 0; 
      }
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

