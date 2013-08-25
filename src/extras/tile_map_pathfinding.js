var jaws = (function(jaws) {

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

return jaws;
})(jaws || {});

