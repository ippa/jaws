test("Various", function() {
  deepEqual(jaws.forceArray(1), [1], "forceArray should always return an array")
  deepEqual(jaws.forceArray([1,2,3]), [1,2,3], "forceArray should always return an array")      
})

test("jaws.init()", function() {
  jaws.init()
  ok(jaws.context, "jaws.context created by jaws.init()")
  deepEqual(jaws.height, 100, "jaws.height set")
  deepEqual(jaws.width, 100, "jaws.width set")
});

test("Core helpers", function() {
 jaws.init()
 var sprite = new jaws.Sprite({x: 200, y:200})
      
 jaws.forceInsideCanvas(sprite)
 deepEqual(sprite.x, jaws.width, "sprite x forced to jaws.width")
 deepEqual(sprite.y, jaws.height, "sprite x forced to jaws.height")

 sprite.moveTo(-100, -100)
 ok(jaws.isOutsideCanvas(sprite), "isOutsideCanvas()")

 jaws.forceInsideCanvas(sprite)
 deepEqual(sprite.x, 0, "sprite x forced to 0")
 deepEqual(sprite.y, 0, "sprite y forced to 0")
});

test("Properties should exist", function() {
  ok(jaws, "window.jaws")
  ok(jaws.Animation, "jaws.Animation")
  ok(jaws.Sprite, "jaws.Sprite")
  ok(jaws.SpriteSheet, "jaws.SpriteSheet")
  ok(jaws.Rect, "jaws.Rect")
})

test("isSomething() helpers", function() {
  a_function = function() {}
  a_string = "a string"
  an_image = new Image()
  an_array = [1,2,3]
  a_canvas = document.createElement("canvas")
  a_regexp = /test/i
  an_object = {foo: "bar"}

  ok(jaws.isString(a_string), "isString()")
  ok(jaws.isFunction(a_function), "isFunction()")
  ok(jaws.isArray(an_array), "isArray()")
  ok(jaws.isImage(an_image), "isImage()")
  ok(jaws.isDrawable(an_image), "isDrawable()")
  ok(jaws.isRegExp(a_regexp), "isRegExp()")
  ok(jaws.isObject(an_object), "isRegExp()")

  // Test some negatives too
  equal(jaws.isFunction(an_array), false, "isFunction() should fail")
  equal(jaws.isArray(a_string), false, "isArray() should fail")
  equal(jaws.isString(an_array), false, "isString() should fail")
  equal(jaws.isImage(an_array), false, "isImage() should fail")
})

