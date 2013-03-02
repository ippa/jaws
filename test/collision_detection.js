module("Collision Detection")

test("Collision detection", function() {
  jaws.assets.root = "assets/"
  jaws.assets.add("rect.png")
  jaws.assets.loadAll({onfinish:assetsLoaded})
  stop();

  function assetsLoaded() { 
    var sprite1 = new jaws.Sprite({image: "rect.png", x: 0, y: 0})
    var sprite2 = new jaws.Sprite({image: "rect.png", x: 10, y: 10})
    var sprite3 = new jaws.Sprite({image: "rect.png", x: 60, y: 60})
    var sprites = [sprite1, sprite2, sprite3]
  
    // TODO: why are these needed?
    sprite1.setImage("rect.png")
    sprite2.setImage("rect.png")
    sprite3.setImage("rect.png")
    // alert(sprite1.rect())
  
    var circle1 = { x: 0, y: 0, radius: 5 }
    var circle2 = { x: 2, y: 2, radius: 5 }
    var circle3 = { x: 10, y: 10, radius: 5 }
    var circles = [circle1, circle2, circle3]
  
    equal( jaws.collideCircles(circle1, circle2), true, "circles should collide" )
    equal( jaws.collideCircles(circle1, circle3), false, "circles shouldn't collide" )
  
    same( jaws.collideOneWithOne(circle1, circle2), true, "collideOneWithOne circle")
    same( jaws.collideOneWithOne(circle1, circle3), false, "collideOneWithOne circle")
    same( jaws.collideOneWithMany(circle1, circles), [circle2], "collideOneWithMany circle")
    same( jaws.collideManyWithMany(circles, circles), [[circle1, circle2]], "collideManyWithMany circle")
  
    // Test collideOneWithOne 
    same( jaws.collideOneWithOne(sprite1, sprite2), true, "collideOneWithOne rect")
    same( jaws.collideOneWithOne(sprite1, sprite3), false, "collideOneWithOne rect")
    
    // Test collideOneWithMany and collideManyWithMany on arrays
    same( jaws.collideOneWithMany(sprite1, sprites), [sprite2], "collideOneWithMany rect")
    same( jaws.collideManyWithMany(sprites, sprites), [[sprite1, sprite2]], "collideManyWithMany rect")
    
    // Test collideOneWithMany and collideManyWithMany on SpriteLists
    var sprite_list = new jaws.SpriteList([sprite1, sprite2, sprite3])
  
    same( jaws.collideOneWithMany(sprite1, sprite_list), [sprite2], "collideOneWithMany sprite_list rect")
    same( jaws.collideManyWithMany(sprite_list, sprite_list), [[sprite1, sprite2]], "collideManyWithMany sprite_list rect")
    
    /* Deprecated API */
    /*
    same( jaws.collide(circle1, circle3), [], "[] when no collides" )
    same( jaws.collide(circle1, circle2), [circle1, circle2], "array with colliding pair when colliding" )
    same( jaws.collide(circle1, circles), [[circle2, circle1]], "array of array with colliding pairs when colliding" )
    same( jaws.collide(circles, circles), [[circle2, circle1]], "array of array when colliding lists with eachother" )
    same( jaws.collide(sprite1, sprite2), [sprite1, sprite2], "collide(sprite1, sprite2)" )
    same( jaws.collide(sprites, sprites), [[sprite2, sprite1]], "array of array when colliding lists with eachother" )
    console.log( jaws.collide(circle1, circles) ) 
    */
    start();
  }
})

