test("Rect", function() {
  rect1 = new jaws.Rect(0,0,10,10)
  rect2 = new jaws.Rect(5,5,10,10)
  rect3 = new jaws.Rect(2,2,10,10)
  rect4 = new jaws.Rect(11,11,10,10)  // This won't collide with anything

  ok(rect1.collideRect(rect2), "collideRect()")
  ok(rect3.collideRect(rect1), "collideRect()")
  ok(rect3.collideRect(rect2), "collideRect()")
  ok(!rect4.collideRect(rect1), "collideRect()")

  rect2.move(10,10)
  deepEqual(rect2.getPosition(), [15,15], "Rect.move modifies position")
      
  rect2.moveTo(100,100)
  deepEqual(rect2.getPosition(), [100,100], "Rect.move sets position")

  rect2.resizeTo(30,30)
  deepEqual(rect2.width, 30, "Rect.resizeTo sets width/height")
  deepEqual(rect2.height, 30, "Rect.resizeTo sets width/height")

  rect2.resize(-10,-10)
  deepEqual(rect2.width, 20, "Rect.resizeTo modifies width/height")
  deepEqual(rect2.height, 20, "Rect.resizeTo modifies width/height")
})

