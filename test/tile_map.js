module("TileMap");

test("TileMap", function() {
  stop();
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add("rect.png").loadAll({onload: assetsLoaded})

  function assetsLoaded() { 
    var image = assets.get("rect.png");

    var tile_map = new jaws.TileMap({size: [10,10], cell_size: [32,32]})
    var sprite = new jaws.Sprite({image: image, x: 40, y: 40, anchor: "top_left"})
    tile_map.push(sprite)
    deepEqual(tile_map.cells[0][0], [], "empty")
    deepEqual(tile_map.at(10,10), [], "empty coordinates returns nil")
    deepEqual(tile_map.at(40,40)[0], sprite, "occupied coordinates returns correct object")
    deepEqual(tile_map.cell(0,0), [], "empty cell")
    deepEqual(tile_map.cell(1,1)[0], sprite, "occupied cell returns correct object")
    
    var sprite2 = new jaws.Sprite({image: image, x: 45, y: 45, anchor: "top_left"})
    var sprite3 = new jaws.Sprite({image: image, x: 45, y: 45, anchor: "top_left"})
    tile_map.push(sprite2)
    tile_map.push(sprite3)
    ok(jaws.isArray(tile_map.at(40,40)), "returns array of sprites")
    deepEqual(tile_map.cell(1,1), [sprite, sprite2, sprite3], "array of sprites occupying cell 1,1")
    start();
  }
})

test("TileMap advanced", function() {
  stop();
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})

  function loaded() {
    var tile_map = new jaws.TileMap({size: [10,10], cell_size: [32,32]})
    var sprite = new jaws.Sprite({image: assets.get("rect.png"), x: 0, y: 0, anchor: "top_left"})
    var big_sprite = new jaws.Sprite({image: assets.get("rect.png"), x: 0, y: 0, anchor: "top_left", scale: 2})
    tile_map.push(sprite)
    tile_map.push(big_sprite)
    deepEqual(tile_map.cell(0,0), [sprite, big_sprite], "sprites should occupy cell 0/0")
    deepEqual(tile_map.cell(1,1)[0], big_sprite, "big_sprite spills over to cell 1/1")
    deepEqual(tile_map.cell(2,2)[0], undefined, "cell 2/2 is empty")
  
    var small_rect = new jaws.Rect(40,40,50,50)
    var rect = new jaws.Rect(0,0,50,50) 
    deepEqual(tile_map.atRect(small_rect)[0], big_sprite, "Get cell-items from small rect")
    deepEqual(tile_map.atRect(rect).length, 2, "Get cell-items from rect")
    deepEqual(tile_map.atRect(rect), [sprite, big_sprite], "Get cell-items from rect")
    start();
  }
})

test("TileMap simple usage", function () {
  var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [32, 32]});
  for (var i= 0; i < 10; ++i) {
  	for (var j = 0; j < 10; ++j) {
     tile_map.push(new jaws.Sprite({width: 20, height: 20, color: "white", x: i * 32, y: j * 32, anchor: "top_left"}));
	  }
  }
  var top_left = new jaws.Rect(0, 0, 5 * 32, 5 * 32);
  ok(tile_map.atRect(top_left).length >= 25, "There should be at least 25 tiles showing")
  
  var top_right = new jaws.Rect(5 * 32, 0, 5 * 32, 5 * 32);
  ok(tile_map.atRect(top_right).length >= 25, "There should be at least 25 tiles showing")
  
  var bottom_left = new jaws.Rect(0, 5 * 32, 5 * 32, 5 * 32);
  ok(tile_map.atRect(bottom_left).length >= 25, "There should be at least 25 tiles showing")
  
  var bottom_right = new jaws.Rect(5 * 32, 5 * 32, 5 * 32, 5 * 32);
  ok(tile_map.atRect(bottom_right).length >= 25, "There should be at least 25 tiles showing")
})

