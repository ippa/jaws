var jaws = (function(jaws) {

/*
 * TileMap - fast access to tiles
 *
 * var tile_map = new TileMap({size: [10, 10], cell_size: [16,16]})
 * var sprite = new jaws.Sprite({x: 40, y: 40})
 * var sprite2 = new jaws.Sprite({x: 41, y: 41})
 * tile_map.push(sprite)
 *
 * tile_map.at(10,10)  // []
 * tile_map.at(40,40)  // [sprite]
 * tile_map.cell(0,0)  // []
 * tile_map.cell(1,1)  // [sprite]
 *
 */
jaws.TileMap = function(options) {
  this.cell_size = options.cell_size || [32,32]
  this.size = options.size
  this.cells = new Array(this.size[0])

  for(var col=0; col < this.size[0]; col++) {
    this.cells[col] = new Array(this.size[1])
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = [] // populate each cell with an empty array
    }
  }
}

/*
 * Push obj (or array of objs) into our cell-grid.
 *
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
jaws.TileMap.prototype.push = function(obj) {
  if(Array.isArray(obj)) { 
    for(var i=0; i < obj.length; i++) { this.push(obj[i]) }
    return obj
  }
  if(obj.rect) {
    return this.pushAsRect(obj, obj.rect())
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }

}
jaws.TileMap.prototype.pushAsPoint = function(obj) {
  if(Array.isArray(obj)) { 
    for(var i=0; i < obj.length; i++) { this.pushAsPoint(obj[i]) }
    return obj
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}

/* save 'obj' in cells touched by 'rect' */
jaws.TileMap.prototype.pushAsRect = function(obj, rect) {
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt((rect.right-1) / this.cell_size[0])
  //jaws.log("rect.right: " + rect.right + " from/to col: " + from_col + " " + to_col, true)

  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt((rect.bottom-1) / this.cell_size[1])
    
    //jaws.log("rect.bottom " + rect.bottom + " from/to row: " + from_row + " " + to_row, true)
    for(var row = from_row; row <= to_row; row++) {
      // console.log("pushAtRect() col/row: " + col + "/" + row + " - " + this.cells[col][row])
      this.pushToCell(col, row, obj)
    }
  }
  return obj
}

/* 
 * Push obj to a specific cell specified by col and row 
 * If cell is already occupied we create an array and push to that
 */
jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
  return this.cells[col][row].push(obj)

/*
  // console.log("pushToCell col/row: " + col + "/" + row)
  if(current = this.cells[col][row]) {
    if(Array.isArray(current)) { this.cells[col][row].push(obj) }
    else                      { this.cells[col][row] = [current, obj] }
  }
  else                                   { this.cells[col][row] = obj }
*/

/*
  if(current = this.cells[col][row])  { this.cells[col][row].push(obj) }
  else                                { this.cells[col][row] = [obj] }
*/
}



//
// READERS
// 

/* Get objects in cell that exists at coordinates x / y  */
jaws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  // console.log("at() col/row: " + col + "/" + row)
  return this.cells[col][row]
}

/* Returns occupants of all cells touched by 'rect' */
jaws.TileMap.prototype.atRect = function(rect) {
  var objects = []
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt(rect.right / this.cell_size[0])
  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt(rect.bottom / this.cell_size[1])
    
    for(var row = from_row; row <= to_row; row++) {
      var items = this.cells[col][row]
      if(items) {
        if(Array.isArray(items)) {
          items.forEach( function(item, total) { 
            if(objects.indexOf(item) == -1) { objects.push(item) }
          })
        }
        else {
          if(objects.indexOf(items) == -1) { objects.push(items) }
        }
      }
    }
  }
  return objects
}

/*
 * Get objects in cell at col / row
 */
jaws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

jaws.TileMap.prototype.toString = function() { return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]" }

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.TileMap }
