module("Sprite List")

test("Empty Sprite List", function() {
  var sprite_list = new jaws.SpriteList()
  deepEqual(sprite_list.length, 0, "should start with zero sprites")
  
  // This bit is relevant for collision_detection/combinations() to work
  ok(!jaws.isArray(sprite_list), "sprite_list is NOT an array")
  ok(sprite_list.isSpriteList(), "isSpriteList() == true")
})

test("Load Objects", function() {
  stop();
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add("rect.png").loadAll({onload: assetsLoaded})

  function assetsLoaded() {
    var image = assets.get("rect.png")
    var sprite_list = new jaws.SpriteList()
    var sprite_one = new jaws.Sprite({image: image})
    sprite_one.setImage(image)
    sprite_one.x = 10
    var sprite_two = new jaws.Sprite({image: image})
    sprite_two.setImage(image)
    sprite_two.x = 20
    
    ok(sprite_one.width, 'sprite_one should have a width, after calling setImage()')
    ok(sprite_two.width, 'sprite_two should have a width, after calling setImage()')
    
    sprite_list.load([sprite_one, sprite_two])
    deepEqual(sprite_list.length, 2, "should contain two sprites after loading")
    deepEqual(sprite_list.at(0).x, 10)
    deepEqual(sprite_list.at(1).x, 20)
  
    ok(sprite_list.at(0).width, 'sprite_one should have a width, after being loaded into a SpriteList')
    ok(sprite_list.at(1).width, 'sprite_two should have a width, after being loaded into a SpriteList')
    
    var new_sprite_list = new jaws.SpriteList([sprite_one, sprite_two])
    deepEqual(new_sprite_list.length, 2, "should contain two sprites after loading (via constructor)")
    deepEqual(sprite_list.at(0).x, 10)
    deepEqual(sprite_list.at(1).x, 20)
    start();
  }
})

test("add", function() {
  var sprite = new jaws.Sprite({color: "white"});
  var sprite2 = new jaws.Sprite({color: "white"});

  var sprite_list = new jaws.SpriteList().add([sprite, sprite2])
  equal(sprite_list.length, 2, "as array")

  var sprite_list = new jaws.SpriteList().add(sprite, sprite2)
  equal(sprite_list.length, 2, "as argument-lists")

  var sprite_list = new jaws.SpriteList().add(sprite)
  equal(sprite_list.length, 1, "as single object")
})

test("Push and toString", function() {
  var sprite_list = new jaws.SpriteList()
  deepEqual(sprite_list.toString(), '[SpriteList 0 sprites]')
  var sprite = new jaws.Sprite({image: "rect.png"})
  sprite_list.push(sprite)
  deepEqual(sprite_list.length, 1, "should update length like array")
  deepEqual(sprite_list.toString(), '[SpriteList 1 sprites]')
})

test("Remove", function() {
  var sprite_list = new jaws.SpriteList()
  var sprite_one = new jaws.Sprite({image: "rect.png"})
  var sprite_two = new jaws.Sprite({image: "rect.png"})
  
  sprite_list.push(sprite_one)
  sprite_list.push(sprite_two)
  deepEqual(sprite_list.length, 2, "should contain two sprites after push() operations")
  
  sprite_list.remove(sprite_one)
  deepEqual(sprite_list.length, 1, "should now only contain one sprite, after remove()")
})

test("Remove, and draw() invocation", function() {
  var sprite_list = new jaws.SpriteList()
  
  var sprite = new jaws.Sprite({image: "rect.png"})
  // Now create a draw() dummy function that raises an exception
  function DrawError() {};
  sprite.draw = function() { throw new DrawError; }
  
  sprite_list.push(sprite)
  // Invoking draw() on the sprite list should trigger our exception on the individual sprite
  throws(function(){
    sprite_list.draw()
  }, DrawError, "sprite_list.draw() must call draw() on each sprite, throwing a DrawError")
  
  sprite_list.remove(sprite)
  deepEqual(sprite_list.length, 0, "should have a length of 0, after remove()")
  // Now, invoking draw() on the sprite list should not trigger our DrawError exception (if it does, the test will fail)
  sprite_list.draw()
})

test("drawIf()", function() {
  var sprite_list = new jaws.SpriteList()
  
  var sprite = new jaws.Sprite({image: "rect.png"})
  // Now create a draw() dummy function that raises an exception
  function DrawError() {};
  sprite.draw = function() { throw new DrawError; }
  
  sprite_list.push(sprite)
  
  true_condition = function(obj) { return true }
  false_condition = function(obj) { return false }
  
  // Invoking drawIf() with a false condition should not trigger our DrawError exception (if it does, the test will fail)
  sprite_list.drawIf(false_condition)
  
  // Invoking drawIf() with a true condition should trigger the draw exception
  throws(function(){ 
    sprite_list.drawIf(true_condition)
  }, DrawError, "sprite_list.drawIf(true_condition) must call draw() on each sprite, throwing a DrawError")
})

test("Remove and update()", function() {
  var sprite_list = new jaws.SpriteList()
  
  var sprite = new jaws.Sprite({image: "rect.png"})
  // Now create an update() dummy function that raises an exception
  function UpdateError() {};
  sprite.update = function() { throw new UpdateError; }
  
  sprite_list.push(sprite)
  // Invoking update() on the sprite list should trigger our exception on the individual sprite
  throws(function(){
    sprite_list.update()
  }, UpdateError, "sprite_list.update() must call update() on each sprite, throwing an UpdateError")
  
  sprite_list.remove(sprite)
  deepEqual(sprite_list.length, 0, "should have a length of 0, after remove()")
  // Now, invoking update() on the sprite list should not trigger our UpdateError exception (if it does, the test will fail)
  sprite_list.update()
})

test("updateIf()", function() {
  var sprite_list = new jaws.SpriteList()
  
  var sprite = new jaws.Sprite({image: "rect.png"})
  // Now create a draw() dummy function that raises an exception
  function UpdateError() {};
  sprite.update = function() { throw new UpdateError; }
  
  sprite_list.push(sprite)
  
  true_condition = function(obj) { return true }
  false_condition = function(obj) { return false }
  
  // Invoking updateIf() with a false condition should not trigger our UpdateError exception (if it does, the test will fail)
  sprite_list.updateIf(false_condition)
  
  // Invoking drawIf() with a true condition should trigger the draw exception
  throws(function(){ 
    sprite_list.updateIf(true_condition)
  }, UpdateError, "sprite_list.updateIf(true_condition) must call update() on each sprite, throwing an UpdateError")
})

test("removeIf()", function() {
  var sprite_list = new jaws.SpriteList()
  var sprite = new jaws.Sprite({image: "rect.png"})
  var sprite_two = new jaws.Sprite({image: "rect.png"})
  sprite_list.push(sprite)
  sprite_list.push(sprite_two)
  true_condition = function(obj) { return true }
  false_condition = function(obj) { return false }
  
  deepEqual(sprite_list.length, 2, "should have a length of 2, before removeIf()")
  sprite_list.removeIf(false_condition)
  deepEqual(sprite_list.length, 2, "should have a length of 2, after removeIf(false_condition)")
  sprite_list.removeIf(true_condition)
  deepEqual(sprite_list.length, 0, "should have a length of 0, after removeIf(true_condition)")
})

// Deprecated function, testing just in case
test("deleteIf()", function() {
  var sprite_list = new jaws.SpriteList()
  var sprite = new jaws.Sprite({image: "rect.png"})
  var sprite_two = new jaws.Sprite({image: "rect.png"})
  sprite_list.push(sprite)
  sprite_list.push(sprite_two)
  true_condition = function(obj) { return true }
  false_condition = function(obj) { return false }
  
  deepEqual(sprite_list.length, 2, "should have a length of 2, before deleteIf()")
  sprite_list.deleteIf(false_condition)
  deepEqual(sprite_list.length, 2, "should have a length of 2, after deleteIf(false_condition)")
  sprite_list.deleteIf(true_condition)
  deepEqual(sprite_list.length, 0, "should have a length of 0, after deleteIf(true_condition)")
})

test("at()", function() {
  var sprite_list = new jaws.SpriteList()
  var sprite = new jaws.Sprite({image: "rect.png"})
  sprite.x = 10
  var sprite_two = new jaws.Sprite({image: "rect.png"})
  sprite_two.x = 20
  sprite_list.push(sprite)
  sprite_list.push(sprite_two)
  
  deepEqual(sprite_list.at(0), sprite, "sprite_list.at(0) should == sprite")
  deepEqual(sprite_list.at(0).x, 10, "sprite_list.at(0).x should == sprite.x")
  deepEqual(sprite_list.at(1), sprite_two, "sprite_list.at(1) should == sprite_two")
})


// Test some Array API / standardized functions
test("filter()", function() {
  var sprite_list = new jaws.SpriteList()
  var sprite = new jaws.Sprite({image: "rect.png"})
  sprite.x = 10
  var sprite_two = new jaws.Sprite({image: "rect.png"})
  sprite_two.x = 20
  sprite_list.push(sprite)
  sprite_list.push(sprite_two)
  true_condition = function(obj) { return true }
  false_condition = function(obj) { return false }
  x_test = function(obj) { return obj.x == 20 }
  
  deepEqual(sprite_list.filter(false_condition), [], 'sprite_list.filter(false_condition) should return []')
  deepEqual(sprite_list.filter(true_condition), [sprite, sprite_two], 'sprite_list.filter(true_condition) should return [sprite, sprite_two]')
  deepEqual(sprite_list.filter(x_test), [sprite_two], 'sprite_list.filter(x_test) should return [sprite_two]')
})
