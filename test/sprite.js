module("Sprite")

test("Sprite without pre-loaded image", function() {
  /* We might get a race-condition in these tests */
  jaws.assets.root = ""
  var sprite = new jaws.Sprite({image: 'assets/rect_copy.png'})
  deepEqual(sprite.rect(), undefined, "undefined sprite.rect() since image isn't preloaded")
});

test("Sprite special options", function() {
  sprite = new jaws.Sprite({dom: null, _constructor: "Troll"})
  deepEqual(sprite.options["_constructor"], "Troll")
});

test("Sprite defaults", function() {
  sprite = new jaws.Sprite({})
  deepEqual(sprite.x, 0, "x defaults to 0")
  deepEqual(sprite.y, 0, "y defaults to 0")
  deepEqual(sprite.angle, 0, "angle defaults to 0")
  deepEqual(sprite.scale_x, 1, "scale_x defaults to 1 (no scaling)")
  deepEqual(sprite.scale_y, 1, "scale_y defaults to 1 (no scaling)")
  deepEqual(sprite.anchor_x, 0, "anchor_x defaults to 0 (top)")
  deepEqual(sprite.anchor_y, 0, "anchor_y defaults to 0 (left)")
  deepEqual(sprite.image, null, "image defaults to undefined")
  deepEqual(sprite.flipped, false, "flipped defaults to false")
  deepEqual(sprite.alpha, 1, "alpha defalts to 1 (zero fading)")
});

test("Sprite without image", function() {
  sprite = new jaws.Sprite({x:0, y:0})
  equal(sprite.image, null, "has no image")
  equal(sprite.width, undefined, "has no width")
  equal(sprite.height, undefined, "has no width")
 
  jaws.assets.root = "assets/"
  jaws.assets.add("rect.png")
  jaws.assets.loadAll({onload: assetsLoaded})
  stop();

  function assetsLoaded() {
    sprite.setImage("rect.png")
    equal(sprite.width, 20, "gets width after setImage()");
    equal(sprite.height, 20, "gets height after setImage()");
    start();
  }
});

test("Sprite", function() {
  jaws.assets.root = "assets/"
  jaws.assets.add("rect.png")
  jaws.assets.loadAll({onload: assetsLoaded})
  stop();

  function assetsLoaded() {
    sprite = new jaws.Sprite({image: "rect.png", x:0, y:0})
    equal(sprite.width, 20, "sprite.width")  
    equal(sprite.height, 20, "sprite.height")
  
    sprite.scaleAll(2)
    equal(sprite.rect().width, 40, "sprite.rect().width after scaling x2")
    equal(sprite.rect().height, 40, "sprite.rect().height after scaling x2") 
  
    // console.log(sprite.x + " - " + sprite.scale_x + " - " + sprite.anchor_x)
    deepEqual(sprite.rect(), new jaws.Rect(0,0,40,40), "sprite.rect()")
  
    sprite.setAnchor("bottom_right")
    equal(sprite.x, sprite.rect().right, "sprite.x == sprite.rect().right when anchor is bottom_right")
    equal(sprite.y, sprite.rect().bottom, "sprite.y == sprite.rect().bottom when anchor is bottom_right")
    
    sprite.setAnchor("top_left")
    equal(sprite.x+sprite.width, sprite.rect().right, "sprite.x+sprite.width == sprite.rect().right when anchor is top_left")
    equal(sprite.y+sprite.height, sprite.rect().bottom, "sprite.y+sprite.height == sprite.rect().bottom when anchor is top_left") 
  
    sprite.rotateTo(45)
    equal(sprite.angle, 45, "sprite.rotateTo() modifies angle")
    sprite.rotate(45)
    equal(sprite.angle, 90, "sprite.rotate() adds to angle #2")
  
    sprite.moveTo(100,100)
    equal(sprite.x, 100, "sprite.moveTo() sets sprite x/y")
    equal(sprite.y, 100, "sprite.moveTo() sets sprite x/y")
  
    sprite.move(10,12)
    equal(sprite.x, 110, "sprite.move() adds to sprite x/y")
    equal(sprite.y, 112, "sprite.move() adds to sprite x/y")
  
    sprite.scaleTo(1)
    equal(sprite.width, 20, "sprite.scaleTo forces a scale_factor")
  
    sprite.setWidth(80)
    equal(sprite.width, 80, "sprite.setWidth forces a new width via scale_x")
    equal(sprite.scale_x, 4, "sprite.setWidth forces a new width via scale_x")
  
    sprite.setHeight(40)
    equal(sprite.height, 40, "sprite.setHeight forces a new width via scale_y")
    equal(sprite.scale_y, 2, "sprite.setHeight forces a new width via scale_y")
  
    sprite.resizeTo(20,20)
    equal(sprite.width, 20, "resize() sets width via scale_x")
    equal(sprite.height, 20, "resize() sets width via scale_x")
    
    sprite.resize(-10,-10)
    equal(sprite.width, 10, "resize() mods width via scale_x")
    equal(sprite.height, 10, "resize() mods width via scale_x")
  
    var flipped = sprite.flipped
    sprite.flip()
    equal(sprite.flipped, !flipped, "sprite.flip inverts flipped")
    sprite.flip()
    equal(sprite.flipped, flipped, "sprite.flip inverts flipped")
  
    sprite2 = new jaws.Sprite({image: "rect.png", scale_image: 2})
    equal(sprite2.width, 40, "Sprite({scale_image: 2}) and sprite.width")  
    equal(sprite2.height, 40, "Sprite({scale_image: 2}) and sprite.height")
    start();
  }
})

test ("Add layer to parallax", function() {
    var parallax1 = new jaws.Parallax({
        repeat_x: true,
        repeat_y: false
    });
    parallax1.addLayer({
        image: "rect.png",
        damping: 1,
    });
    parallax1.addLayer({
        image: "rect.png",
        damping: 2,
    });

    var parallax2 = new jaws.Parallax({
        repeat_x: true,
        repeat_y: false
    });
    parallax2.addLayer({
        image: "rect.png",
        damping: 2,
    });

    deepEqual(parallax1.layers.length, 2, "Two layers has been added");
    deepEqual(parallax2.layers.length, 1, "Only One layer has been added");
    deepEqual(jaws.Parallax.prototype.default_options.layers, [], "Parallax default options should remain intact");
});
