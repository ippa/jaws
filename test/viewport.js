module("Viewport")

test("Viewport", function() {
  jaws.init()
  jaws.assets.root = "assets/"
  jaws.assets.add("droid_11x15.png")
  jaws.assets.loadAll({onfinish:assetsLoaded})
  stop();

  function assetsLoaded() { 
    viewport = new jaws.Viewport({max_x: 1000, max_y: 1000, width: 50, height: 40})
    sprite = new jaws.Sprite({image: "rect.png", x:30, y:40})
  
    equal(viewport.x, 0, "viewport.x defaults to 0")
    equal(viewport.y, 0, "viewport.y defaults to 0")

    viewport.moveTo(1111,1111)
    equal(viewport.x, 950, "viewport.x setter will respect max_x and width")
    viewport.moveTo(-10,-10)
    equal(viewport.x, 0, "viewport.x setter won't go negative")
  
    viewport.moveTo(1111,1111)
    equal(viewport.y, 960, "viewport.x setter will respect max_y and height")
  
    viewport.centerAround(sprite)
    equal(viewport.x, 5, "centerAround will center viewport around given sprite or 'object with x/y'")
    equal(viewport.y, 20, "centerAround will center viewport around given sprite or 'object with x/y'")
  
    viewport.moveTo(0,0)
    sprite.x = 55
    equal(viewport.isInside(sprite), false, "isInside should return false")
    equal(viewport.isOutside(sprite), true, "isOutside should return true")
  
    sprite.x = 49
    equal(viewport.isInside(sprite), true, "isInside should return true") 
    
    start();
  }
})

