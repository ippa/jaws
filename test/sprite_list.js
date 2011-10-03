test("SpriteList", function() {
  sprite_list = new jaws.SpriteList()
  sprite = new jaws.Sprite({image: "rect.png"})
  same(sprite_list.length, 0, "should start with zero sprites")

  sprite_list.push(sprite)
  same(sprite_list.length, 1, "should update length like array")
})

