module("Collision Detection")

test("collision detection", function() {
  stop();
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add("rect.png").loadAll({onload: assetsloaded})

  function assetsloaded() {
    var image = assets.get("rect.png")
    var sprite1 = new jaws.Sprite({image: image, x: 0, y: 0})
    var sprite2 = new jaws.Sprite({image: image, x: 10, y: 10})
    var sprite3 = new jaws.Sprite({image: image, x: 60, y: 60})
    var sprites = [sprite1, sprite2, sprite3]
   
    var circle1 = { x: 0, y: 0, radius: 5 }
    var circle2 = { x: 2, y: 2, radius: 5 }
    var circle3 = { x: 10, y: 10, radius: 5 }
    var circles = [circle1, circle2, circle3]
  
    equal( jaws.collideCircles(circle1, circle2), true, "circles should collide" )
    equal( jaws.collideCircles(circle1, circle3), false, "circles shouldn't collide" )
  
    deepEqual( jaws.collideOneWithOne(circle1, circle2), true, "collideOneWithOne circle")
    deepEqual( jaws.collideOneWithOne(circle1, circle3), false, "collideOneWithOne circle")
    deepEqual( jaws.collideOneWithMany(circle1, circles), [circle2], "collideOneWithMany circle")
    deepEqual( jaws.collideManyWithMany(circles, circles), [[circle1, circle2]], "collideManyWithMany circle")
  
    // Test collideOneWithOne 
    deepEqual( jaws.collideOneWithOne(sprite1, sprite2), true, "collideOneWithOne rect")
    deepEqual( jaws.collideOneWithOne(sprite1, sprite3), false, "collideOneWithOne rect")
    
    // Test collideOneWithMany and collideManyWithMany on arrays
    deepEqual( jaws.collideOneWithMany(sprite1, sprites), [sprite2], "collideOneWithMany rect")
    deepEqual( jaws.collideManyWithMany(sprites, sprites), [[sprite1, sprite2]], "collideManyWithMany rect")
    
    // Test collideOneWithMany and collideManyWithMany on SpriteLists
    var sprite_list = new jaws.SpriteList([sprite1, sprite2, sprite3])
  
    deepEqual( jaws.collideOneWithMany(sprite1, sprite_list), [sprite2], "collideOneWithMany sprite_list rect")
    deepEqual( jaws.collideManyWithMany(sprite_list, sprite_list), [[sprite1, sprite2]], "collideManyWithMany sprite_list rect")
    
    ok( !jaws.collide(circle1, circle3), "false when no collisions" )
    ok( jaws.collide(circles, circles), "true if any collisions" )
    ok( jaws.collide(sprite1, sprite2), "true if any collisions" )
    ok( jaws.collide(sprites, sprites), "true if any collisions" )

    ok( jaws.collide(circle1, circle2), "true if any collisions" )
    ok( jaws.collide(circle1, circles), "true if any collisions" )

    start();
  }
})

test("Collision detection with callbacks", function() {
  stop();
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add("rect.png").loadAll({onload: assetsloaded})

  function assetsloaded() { 
    var image = assets.get("rect.png")
    var sprite1 = new jaws.Sprite({image: image, x: 0, y: 0})
    var sprite2 = new jaws.Sprite({image: image, x: 10, y: 10})
    var sprite3 = new jaws.Sprite({image: image, x: 60, y: 60})
    var sprites = [sprite1, sprite2, sprite3]
    var sprite_list = new jaws.SpriteList()
    sprite_list.push([sprite1, sprite2, sprite3]);

    var circle1 = { x: 0, y: 0, radius: 5 }
    var circle2 = { x: 2, y: 2, radius: 5 }
    var circle3 = { x: 10, y: 10, radius: 5 }
    var circles = [circle1, circle2, circle3] 

    var callback_status = false
    jaws.collideOneWithMany(sprite1, sprites, function(a, b) {
      callback_status = true
      deepEqual(a, sprite1, "collideOneWithMany")
      deepEqual(b, sprite2, "collideOneWithMany")
    });
    ok(callback_status, "collideOneWithMany callback got executed at least once")

    callback_status = false
    jaws.collideManyWithMany(sprites, sprites, function(a, b) {
      callback_status = true
      deepEqual(a, sprite1, "collideManyWithMany, don't collide sprites with themselves")
      deepEqual(b, sprite2, "collideManyWithMany, don't collide sprites with themselves")
    }); 
    ok(callback_status, "collideManyWithMany callback got executed at least once")

    /* Tests of jaws.collide() below */
    var callback_status = false
    jaws.collide(sprite1, sprites, function(a, b) {
      callback_status = true
      deepEqual(a, sprite1, "collide()")
      deepEqual(b, sprite2, "collide()")
    });
    ok(callback_status, "collide() callback got executed at least once")

    callback_status = false
    jaws.collide(sprites, sprites, function(a, b) {
      callback_status = true
      deepEqual(a, sprite1, "collide()")
      deepEqual(b, sprite2, "collide()")
    }); 
    ok(callback_status, "collide() callback got executed at least once")
    
    callback_status = false
    jaws.collide(circles, circles, function(a, b) {
      callback_status = true
      deepEqual(a, circle1, "collide() with circles")
      deepEqual(b, circle2, "collide() with circles")
    }); 
    ok(callback_status, "collide() with circles callback got executed at least once")

    callback_status = false
    jaws.collide(circle1, circle3, function(a, b) { callback_status = true }); 
    deepEqual(callback_status, false, "collide(circle1, circle3) shouldn't execute callback")

    callback_status = false
    jaws.collide(circle1, circle2, function(a, b) { callback_status = true }); 
    ok(callback_status, "collide(circle1, circle2) shouldn't executed callback")

    start();
  }

})

test("Collision detection with SpriteLists", function() {
  stop();
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})

  function loaded() { 
    var image = assets.get("rect.png")
    var sprite1 = new jaws.Sprite({image: image, x: 0, y: 0})
    var sprite2 = new jaws.Sprite({image: image, x: 10, y: 10})
    var sprite3 = new jaws.Sprite({image: image, x: 60, y: 60})
    var sprite_list = new jaws.SpriteList().add(sprite1, sprite2, sprite3);
 
    callback_status = true
    jaws.collide(sprite_list, sprite_list, function(a, b) {
      callback_status = true
      deepEqual(a, sprite1, "collide()")
      deepEqual(b, sprite2, "collide()")
    }); 
    ok(callback_status, "collide() with spritelists callback got executed at least once")

    start();
  }
});

