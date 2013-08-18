module("TileMapExtra");

test("TileMap findPath usage", function () {
  var cell_size = 32
  var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [cell_size, cell_size]})

  var start_position = [0, 0]

  var path_zero = tile_map.findPath(start_position, start_position)
  ok(path_zero.length === 1, "Path should contain a single value when start and end are the deepEqual")
  ok(path_zero[0].x === start_position[0] && path_zero[0].y === start_position[1], "Path should be to start_position")

  var end_position = [0, 64] //2 squares down.

  var path_one = tile_map.findPath(start_position, end_position)
  ok(path_one.length >= 3, "There should be at least 3 nodes in path when end_position is 2 squares down")
  ok( ( path_one[0].x === start_position[0] &&
      path_one[0].y === start_position[1]   ), "The first node in path should be the start_position")
  var last = path_one.length - 1
  ok( ( path_one[last].x === end_position[0] &&
      path_one[last].y === end_position[1]   ), "The last node in path should be the end_position")

  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:32}))

  var path_two = tile_map.findPath(start_position, end_position)
  ok(path_two.length > path_one.length, "Wall added should force new path to be longer than first path")

  var wall_in_path = false
  for(var i=0 ; i<path_two.length ; i++)
  {
    if (path_two[i].x === 0 && path_two[i].y === 32) { wall_in_path = true; }
  }
ok(!wall_in_path, "The wall added to tile_map should not appear in the path")

  tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:0}))
  var path_four = tile_map.findPath(start_position, end_position)
  deepEqual(path_four, [], "Path should now be empty because there is no path to end_position from start_position")
})

test("TileMap findPath - inverted usage", function () {
  var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [32, 32]})

  var start_position = [0, 0]
  var end_position = [0, 64] //2 squares down.

  var path_one = tile_map.findPath(start_position, end_position, true)
  deepEqual(path_one, [], "No path should be found as the tile_map is empty")

  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:0}))
  tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:0}))
  tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:32}))
  tile_map.push(new jaws.Sprite({image: "rect.png", x:32, y:64}))
  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:64}))

  var path_two = tile_map.findPath(start_position, end_position, true)

  ok(path_two.length === 5, "Path length should be the 5 nodes added as 'floor' to tile_map")
})

test("TileMap lineOfSight", function () {
  var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [32, 32]})

  var start_position = [0, 0]
  var end_position = [0, 64] //2 squares down.

  ok(tile_map.lineOfSight(start_position, end_position), "No tiles, end_position is visible from start_position")

  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:32}))

  ok(!tile_map.lineOfSight(start_position, end_position), "tiles added, end_position is NOT visible from start_position")

})

test("TileMap lineOfSight - inverted", function () {
  var tile_map = new jaws.TileMap({size: [10, 10], cell_size: [32, 32]})

  var start_position = [0, 0]
  var end_position = [0, 64] //2 squares down.

  ok(!tile_map.lineOfSight(start_position, end_position, true), "No tiles, end_position is NOT visible from start_position")

  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:0}))
  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:32}))
  tile_map.push(new jaws.Sprite({image: "rect.png", x:0, y:64}))

  ok(tile_map.lineOfSight(start_position, end_position, true), "end_position visible 'along' tiles added from start to finish")
})


