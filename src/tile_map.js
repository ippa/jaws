var jaws = (function(jaws) {

/**
 * @class Create and access tilebased 2D maps with very fast access of invidual tiles. "Field Summary" contains options for the TileMap()-constructor.
 *
 * @property {array} cell_size        Size of each cell in tilemap, defaults to [32,32]
 * @property {array} size             Size of tilemap, defaults to [100,100]
 * @property {function} sortFunction  Function used by sortCells() to sort cells, defaults to no sorting
 *
 * @example
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
jaws.TileMap = function TileMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  jaws.parseOptions(this, options, this.default_options);
  this.cells = new Array(this.size[0])

  for(var col=0; col < this.size[0]; col++) {
    this.cells[col] = new Array(this.size[1])
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = [] // populate each cell with an empty array
    }
  }
}

jaws.TileMap.prototype.default_options = {
  cell_size: [32,32],
  size: [100,100],
  sortFunction: null
}

/** Clear all cells in tile map */
jaws.TileMap.prototype.clear = function() {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = []
    }
  }
}

/** Sort arrays in each cell in tile map according to sorter-function (see Array.sort) */
jaws.TileMap.prototype.sortCells = function(sortFunction) {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].sort( sortFunction )
    }
  }
}

/**
 * Push obj (or array of objs) into our cell-grid.
 *
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
jaws.TileMap.prototype.push = function(obj) {
  var that = this
  if(obj.forEach) { 
    obj.forEach( function(item) { that.push(item) } )
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
/** 
 * Push objects into tilemap.
 * Disregard height and width and only use x/y when calculating cell-position
 */
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

/** push obj into cells touched by rect */
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

/** 
 * Push obj to a specific cell specified by col and row 
 * If cell is already occupied we create an array and push to that
 */
jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
  this.cells[col][row].push(obj)
  if(this.sortFunction) this.cells[col][row].sort(this.sortFunction);
  return this
}

//
// READERS
// 

/** Get objects in cell that exists at coordinates x / y  */
jaws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  // console.log("at() col/row: " + col + "/" + row)
  return this.cells[col][row]
}

/** Returns occupants of all cells touched by 'rect' */
jaws.TileMap.prototype.atRect = function(rect) {
  var objects = []
  var items

  try {
    var from_col = parseInt(rect.x / this.cell_size[0])
	if (from_col < 0) {
		from_col = 0
	}
    var to_col = parseInt(rect.right / this.cell_size[0])
    if (to_col >= this.size[0]) {
		to_col = this.size[0] - 1
	}
	var from_row = parseInt(rect.y / this.cell_size[1])
	if (from_row < 0) {
		from_row = 0
	}
	var to_row = parseInt(rect.bottom / this.cell_size[1])
	if (to_row >= this.size[1]) {
		to_row = this.size[1] - 1
	}

    for(var col = from_col; col <= to_col; col++) {
      for(var row = from_row; row <= to_row; row++) {
        this.cells[col][row].forEach( function(item, total) { 
          if(objects.indexOf(item) == -1) { objects.push(item) }
        })
      }
    }
  }
  catch(e) {
    // ... problems
  }
  return objects
}

/** Returns all objects in tile map */
jaws.TileMap.prototype.all = function() {
  var all = []
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].forEach( function(element, total) {
        all.push(element)
      });
    }
  }
  return all
}

/** Get objects in cell at col / row */
jaws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

/**
 * A-Star pathfinding
 *
 *  Takes starting and ending x,y co-ordinates (from a mouse-click for example),
 *  which are then translated onto the TileMap grid. 
 *  
 *  Does not allow for Diagonal movements
 *
 *  Uses a very simple Heuristic [see crowFlies()] for calculating node scores.
 *
 *  Very lightly optimised for speed over memory usage.
 *
 *  Returns a list of [col, row] pairs that define a valid path. Due to the simple Heuristic
 *  the path is not guaranteed to be the best path.
 */
jaws.TileMap.prototype.findPath = function(start_position, end_position, inverted) {
  
  if (typeof inverted == 'undefined') { inverted = false }
  
  var start_col = parseInt(start_position[0] / this.cell_size[0])
  var start_row = parseInt(start_position[1] / this.cell_size[1])
  
  var end_col = parseInt(end_position[0] / this.cell_size[0])
  var end_row = parseInt(end_position[1] / this.cell_size[1])
  
  if (start_col === end_col && start_row === end_row) {
    return [{x: start_position[0], y:start_position[1]}]
  }
  
  var col = start_col
  var row = start_row
  var step = 0
  var score = 0
  //travel corner-to-corner, through every square, plus one, just to make sure
  var max_distance = (this.size[0]*this.size[1] * 2)+1
  
  var open_nodes = new Array(this.size[0])
  for(var i=0; i < this.size[0]; i++) {
    open_nodes[i] = new Array(this.size[1])
    for(var j=0; j < this.size[1]; j++) {
      open_nodes[i][j] = false
    }
  }
  open_nodes[col][row] = {parent: [], G: 0, score: max_distance}
  
  var closed_nodes = new Array(this.size[0])
  for(var i=0; i < this.size[0]; i++) {
    closed_nodes[i] = new Array(this.size[1])
    for(var j=0; j < this.size[1]; j++) {
      closed_nodes[i][j] = false
    }
  }

  var crowFlies = function(from_node, to_node) {
    return Math.abs(to_node[0]-from_node[0]) + Math.abs(to_node[1]-from_node[1]);
  }
  
  var findInClosed = function(col, row) {
    if (closed_nodes[col][row])
    {
      return true
    }
    else {return false}
  }
  
  while ( !(col === end_col && row === end_row) ) {
    /**
     *  add the nodes above, below, to the left and right of the current node
     *  if it doesn't have a sprite in it, and it hasn't already been added
     *  to the closed list, recalculate its score from the current node and
     *  update it if it's already in the open list.
     */
    var left_right_up_down = []
    if (col > 0) { left_right_up_down.push([col-1, row]) }
    if (col < this.size[0]-1) { left_right_up_down.push([col+1, row]) }
    if (row > 0) {left_right_up_down.push([col, row-1])}
    if (row < this.size[1]-1) { left_right_up_down.push([col, row+1]) }
    
    for (var i=0 ; i<left_right_up_down.length ; i++) {
        var c = left_right_up_down[i][0]
        var r = left_right_up_down[i][1]
        if ( ( (this.cell(c, r).length === 0 && !inverted) || 
               (this.cell(c, r).length  >  0 &&  inverted)    ) && 
               !findInClosed(c, r) ) 
        {
            score = step+1+crowFlies([c, r] , [end_col, end_row])
            if (!open_nodes[c][r] || (open_nodes[c][r] && open_nodes[c][r].score > score)) {
                open_nodes[c][r] = {parent: [col, row], G: step+1, score: score}
            }
        }
    }
    
    /**
     *  find the lowest scoring open node
     */
    var best_node = {node: [], parent: [], score: max_distance, G: 0}
    for (var i=0 ; i<this.size[0] ; i++) {
      for(var j=0 ; j<this.size[1] ; j++) {
        if (open_nodes[i][j] && open_nodes[i][j].score < best_node.score) {
          best_node.node = [i, j]
          best_node.parent = open_nodes[i][j].parent
          best_node.score = open_nodes[i][j].score
          best_node.G = open_nodes[i][j].G
        }
      }
    }
    if (best_node.node.length === 0) { //open_nodes is empty, no route found to end node
      return []
    }
    
    //This doesn't stop the node being added again, but it doesn't seem to matter
    open_nodes[best_node.node[0]][best_node.node[1]] = false
    
    col = best_node.node[0]
    row = best_node.node[1]
    step = best_node.G
    
    closed_nodes[col][row] = {parent: best_node.parent}
  }
  
  /**
   *  a path has been found, construct it by working backwards from the
   *  end node, using the closed list
   */
  var path = []
  var current_node = closed_nodes[col][row]
  path.unshift({x: col*this.cell_size[0], y: row*this.cell_size[1]})
  while(! (col === start_col && row === start_row) ) {
    col = current_node.parent[0]
    row = current_node.parent[1]
    path.unshift({x: col*this.cell_size[0], y: row*this.cell_size[1]})
    current_node = closed_nodes[col][row]
  }
  return path
  
}

jaws.TileMap.prototype.lineOfSight = function(start_position, end_position, inverted) {
  if (typeof inverted == 'undefined') { inverted = false }
  
  var x0 = start_position[0]
  var x1 = end_position[0]
  var y0 = start_position[1]
  var y1 = end_position[1]
  
  var dx = Math.abs(x1-x0)
  var dy = Math.abs(y1-y0)

  var sx, sy
  if (x0 < x1) {sx = 1} else {sx = -1}
  if (y0 < y1) {sy = 1} else {sy = -1}
  
  var err = dx-dy
  var e2
  
  while(! (x0 === x1 && y0 === y1) )
  {
    if (inverted) { if (this.at(x0,y0).length === 0) {return false} }
    else { if (this.at(x0,y0).length > 0) {return false} }
    e2 = 2 * err
    if (e2 > -dy)
    {
      err = err - dy
      x0 = x0 + sx
    }
    if (e2 < dx)
    {
      err = err + dx
      y0 = y0 + sy
    }
  }
  
  return true
}

/** Debugstring for TileMap() */
jaws.TileMap.prototype.toString = function() { return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]" }

return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.TileMap }
