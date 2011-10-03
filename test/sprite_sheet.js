test("SpriteSheet", function() {
  sprite_sheet = new jaws.SpriteSheet( {image: "droid_11x15.png", frame_size: [11,15]} )

  ok(jaws.assets.get("droid_11x15.png"), "asset available")
  ok(jaws.isDrawable(jaws.assets.get("droid_11x15.png")), "isDrawable")
  same(sprite_sheet.frame_size, [11,15], "frame_size")
  equal(sprite_sheet.frames[0].toString(), "[object HTMLCanvasElement]", "one frame is canvas")
  equal(sprite_sheet.frames.length, 14,"correct number of frames")
  // equal(sprite_sheet.frames.length, sprite_sheet.length, "frames.length == length")
})


