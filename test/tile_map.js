test("TileMap", function() {
  var tile_map = new jaws.TileMap({size: [10,10], cell_size: [32,32]})
  var sprite = new jaws.Sprite({image: "rect.png", x: 40, y: 40, anchor: "top_left"})
  tile_map.push(sprite)
  same(tile_map.cells[0][0], [], "empty")
  same(tile_map.at(10,10), [], "empty coordinates returns nil")
  same(tile_map.at(40,40)[0], sprite, "occupied coordinates returns correct object")
  same(tile_map.cell(0,0), [], "empty cell")
  same(tile_map.cell(1,1)[0], sprite, "occupied cell returns correct object")
  
  var sprite2 = new jaws.Sprite({image: "rect.png", x: 45, y: 45, anchor: "top_left"})
  var sprite3 = new jaws.Sprite({image: "rect.png", x: 45, y: 45, anchor: "top_left"})
  tile_map.push(sprite2)
  tile_map.push(sprite3)
  ok(jaws.isArray(tile_map.at(40,40)), "returns array of sprites")
  same(tile_map.cell(1,1), [sprite, sprite2, sprite3], "array of sprites occupying cell 1,1")
  // console.log(tile_map.cell(1,1))
})

test("TileMap advanced", function() {
  var tile_map = new jaws.TileMap({size: [10,10], cell_size: [32,32]})
  var sprite = new jaws.Sprite({image: "rect.png", x: 0, y: 0, anchor: "top_left"})
  var big_sprite = new jaws.Sprite({image: "rect.png", x: 0, y: 0, anchor: "top_left", scale: 2})
  tile_map.push(sprite)
  tile_map.push(big_sprite)
  same(tile_map.cell(0,0), [sprite, big_sprite], "sprites should occupy cell 0/0")
  same(tile_map.cell(1,1)[0], big_sprite, "big_sprite spills over to cell 1/1")
  same(tile_map.cell(2,2)[0], undefined, "cell 2/2 is empty")

  var small_rect = new jaws.Rect(40,40,50,50)
  var rect = new jaws.Rect(0,0,50,50) 
  same(tile_map.atRect(small_rect)[0], big_sprite, "Get cell-items from small rect")
  same(tile_map.atRect(rect).length, 2, "Get cell-items from rect")
  same(tile_map.atRect(rect), [sprite, big_sprite], "Get cell-items from rect")
})

test("TileMap simple usage", function () {
    var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [32, 32]})
    for (var i= 0; i < 10; ++i) {
	for (var j = 0; j < 10; ++j) {
	    tile_map.push(new jaws.Sprite({image: "rect.png", x: i * 32, y: j * 32, anchor: "top_left"}))
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

test("TileMap findPath usage", function () {
    var cell_size = 32
    var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [cell_size, cell_size]})
    
    var start_position = [0, 0]
    var end_position = [0, 64] //2 squares down.
    
    var path_one = tile_map.findPath(start_position, end_position)
    ok(path_one.length >= 3, "There should be at least 3 nodes in path")
    ok( ( path_one[0][0] === start_position[0]/cell_size &&
          path_one[0][1] === start_position[1]/cell_size   ), "The first node in path should be the start_position")
    var last = path_one.length - 1
    ok( ( path_one[last][0] === end_position[0]/cell_size &&
          path_one[last][1] === end_position[1]/cell_size   ), "The last node in path should be the end_position")
    
    tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:32}))
    
    var path_two = tile_map.findPath(start_position, end_position)
    ok(path_two.length > path_one.length, "Wall added should force new path to be longer than first path")
    
    var wall_in_path = false
    for(var i=0 ; i<path_two.length ; i++)
    {
        if (path_two[i][0] === 0 && path_two[i][1] === 1) { wall_in_path = true; }
    }
    ok(!wall_in_path, "The wall added to tile_map should not appear in the path")
    
    tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:0}))
    var path_four = tile_map.findPath(start_position, end_position)
    same(path_four, [], "Path should now be empty because there is no path to end_position from start_position")
})

test("TileMap findPath - inverted usage", function () {
    var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [32, 32]})
    
    var start_position = [0, 0]
    var end_position = [0, 64] //2 squares down.
    
    var path_one = tile_map.findPath(start_position, end_position, true)
    same(path_one, [], "No path should be found as the tile_map is empty")
    
    tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:0}))
    tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:0}))
    tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:32}))
    tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:64}))
    tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:64}))
    
    var path_two = tile_map.findPath(start_position, end_position, true)
    
    ok(path_two.length === 5, "Path length should be the 5 nodes added as 'floor' to tile_map")
})
