if(typeof require !== "undefined") { var jaws = require("./core.js"); }

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
    this.cells = new Array(this.size[0]);

    for(var col=0; col < this.size[0]; col++) {
      this.cells[col] = new Array(this.size[1]);
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
        this.cells[col][row] = [];
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
    var that = this;
    if(obj.forEach) { 
      obj.forEach( function(item) { that.push(item) } );
      return obj;
    }
    if(obj.rect) {
      return this.pushAsRect(obj, obj.rect());
    }
    else {
      var col = parseInt(obj.x / this.cell_size[0]);
      var row = parseInt(obj.y / this.cell_size[1]);
      return this.pushToCell(col, row, obj);
    }
  }
  /** 
   * Push objects into tilemap.
   * Disregard height and width and only use x/y when calculating cell-position
   */
  jaws.TileMap.prototype.pushAsPoint = function(obj) {
    if(Array.isArray(obj)) { 
      for(var i=0; i < obj.length; i++) { this.pushAsPoint(obj[i]) }
      return obj;
    }
    else {
      var col = parseInt(obj.x / this.cell_size[0]);
      var row = parseInt(obj.y / this.cell_size[1]);
      return this.pushToCell(col, row, obj);
    }
  }

  /** push obj into cells touched by rect */
  jaws.TileMap.prototype.pushAsRect = function(obj, rect) {
    var from_col = parseInt(rect.x / this.cell_size[0]);
    var to_col = parseInt((rect.right-1) / this.cell_size[0]); // -1
    //jaws.log("rect.right: " + rect.right + " from/to col: " + from_col + " " + to_col, true)

    for(var col = from_col; col <= to_col; col++) {
      var from_row = parseInt(rect.y / this.cell_size[1]);
      var to_row = parseInt((rect.bottom-1) / this.cell_size[1]); // -1

      //jaws.log("rect.bottom " + rect.bottom + " from/to row: " + from_row + " " + to_row, true)
      for(var row = from_row; row <= to_row; row++) {
        // console.log("pushAtRect() col/row: " + col + "/" + row + " - " + this.cells[col][row])
        this.pushToCell(col, row, obj);
      }
    }
    return obj
  }

  /** 
   * Push obj to a specific cell specified by col and row 
   * If cell is already occupied we create an array and push to that
   */
  jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
    this.cells[col][row].push(obj);
    if(this.sortFunction) this.cells[col][row].sort(this.sortFunction);
    return this
  }

  //
  // READERS
  // 

  /** Get objects in cell that exists at coordinates x / y  */
  jaws.TileMap.prototype.at = function(x, y) {
    var col = parseInt(x / this.cell_size[0]);
    var row = parseInt(y / this.cell_size[1]);
    // console.log("at() col/row: " + col + "/" + row)
    return this.cells[col][row];
  }

  /** Returns occupants of all cells touched by 'rect' */
  jaws.TileMap.prototype.atRect = function(rect) {
    var objects = [];
    var items;

    try {
      var from_col = parseInt(rect.x / this.cell_size[0]);
      if (from_col < 0) {
        from_col = 0;
      }
      var to_col = parseInt(rect.right / this.cell_size[0]);
      if (to_col >= this.size[0]) {
        to_col = this.size[0] - 1;
      }
      var from_row = parseInt(rect.y / this.cell_size[1]);
      if (from_row < 0) {
        from_row = 0;
      }
      var to_row = parseInt(rect.bottom / this.cell_size[1]);
      if (to_row >= this.size[1]) {
        to_row = this.size[1] - 1;
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
    var all = [];
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

  /** Debugstring for TileMap() */
  jaws.TileMap.prototype.toString = function() { return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]" }

  return jaws;
})(jaws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports = jaws.TileMap }
