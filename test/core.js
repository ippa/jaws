/*
    test("jaws.onload, jaws.start", function() {
      jaws.onload = function() {
        ok(1, "jaws.onload-callback was called")
      }
    });
*/

QUnit.testStart( function() {
  jaws.assets.root = "assets/";
});

test("Various", function() {
  same(jaws.forceArray(1), [1], "forceArray should always return an array")
  same(jaws.forceArray([1,2,3]), [1,2,3], "forceArray should always return an array")      
})

test("jaws.init()", function() {
  jaws.init()
  ok(jaws.context, "jaws.context created by jaws.init()")
  same(jaws.height, 100, "jaws.height set")
  same(jaws.width, 100, "jaws.width set")
});

test("Core helpers", function() {
 jaws.init()
 var sprite = new jaws.Sprite({x: 200, y:200})
      
 jaws.forceInsideCanvas(sprite)
 same(sprite.x, jaws.width, "sprite x forced to jaws.width")
 same(sprite.y, jaws.height, "sprite x forced to jaws.height")

 sprite.moveTo(-100, -100)
 ok(jaws.isOutsideCanvas(sprite), "isOutsideCanvas()")

 jaws.forceInsideCanvas(sprite)
 same(sprite.x, 0, "sprite x forced to 0")
 same(sprite.y, 0, "sprite y forced to 0")
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

  same(jaws.isString(a_string), true, "isString()")
  same(jaws.isFunction(a_function), true, "isFunction()")
  same(jaws.isArray(an_array), true, "isArray()")
  same(jaws.isImage(an_image), true, "isImage()")
  same(jaws.isDrawable(an_image), true, "isDrawable()")

  // Test some negatives too
  same(jaws.isFunction(an_array), false, "isFunction() should fail")
  same(jaws.isArray(a_string), false, "isArray() should fail")
  same(jaws.isString(an_array), false, "isString() should fail")
  same(jaws.isImage(an_array), false, "isImage() should fail")
})

