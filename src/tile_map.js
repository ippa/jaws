var jaws = (function(jaws) {

/*
 * TileMap - fast access to tiles
 *
 * var tile_map = new TileMap({size: [10, 10], cell_size: [16,16]})
 * var sprite = new jaws.Sprite({x: 40, y: 40})
 * var sprite2 = new jaws.Sprite({x: 41, y: 41})
 * tile_map.push(sprite)
 *
 * tile_map.at(10,10)  // nil
 * tile_map.at(40,40)  // sprite
 * tile_map.cell(0,0)  // nil
 * tile_map.cell(1,1)  // sprite
 *
 */
jaws.TileMap = function(options) {
  this.cell_size = options.cell_size || [32,32]
  this.size = options.size
  this.cells = new Array(this.size[0])

  for(var i=0; i < this.size[0]; i++) {
    this.cells[i] = new Array(this.size[1])
  }
}

/*
 * Push obj into our cell-grid.
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
jaws.TileMap.prototype.push = function(obj) {
  var col = parseInt(obj.x / this.cell_size[0])
  var row = parseInt(obj.y / this.cell_size[1])

  if(current_obj = this.cells[col][row]) {
    this.cells[col][row] = [current_obj, obj]
  }
  else {
    this.cells[col][row] = obj
  }
  return this.cells[col][row]
}

/*
 * Get objects in cell that exists at coordinates x / y
 */
jaws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  return this.cells[col][row]
}

/*
 * Get objects in cell at col / row
 */
jaws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

return jaws;
})(jaws || {});
