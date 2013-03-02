module("Animation")

test("Animation", function() {
  jaws.assets.root = "assets/"
  jaws.assets.add("droid_11x15.png")
  jaws.assets.loadAll({onfinish:assetsLoaded})
  stop()

  function assetsLoaded() {
    sprite_sheet = new jaws.SpriteSheet( {image: "droid_11x15.png", frame_size: [11,15]} )
    animation = new jaws.Animation({frames: sprite_sheet.frames})
    animation2 = animation.slice(0,5) 
    animation3 = animation.slice(0,2) 
  
    ok(animation, "new Animation")
    equal(animation.frames.length, 14, "frames in animation")
    equal(animation.index, 0, "start at frame 0")
    equal(animation.frame_duration, 100, "frameduration defaults to 100ms")
    equal(animation2.frames.length, 5, "animation.slice creates a new sub-animation")
    equal(animation3.frames.length, 2, "animation.slice creates a new sub-animation")
    same(animation3.frames[0].toString(), "[object HTMLCanvasElement]", "sub-animation contains canvas-elements")
    same(animation3.frame_duration, 100, "sub-animation gets frame_duration from parent")
    equal(animation.frames.length, 14, "after slice, frames in animation")
    equal(animation.frames[0], animation3.frames[0], "sub-animation contains same canvas-elements as parent")
    start()
  }
  // equal(animation.frames.length, animation.length, "animation.frames.length == animation.length")
})

