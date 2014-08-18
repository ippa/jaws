if(typeof require !== "undefined") { var jaws = require("./core.js"); }

/*
 * @class jaws.QuadTree
 * @property {jaws.Rect}  bounds    Rect(x,y,width,height) defining bounds of tree
 * @property {number}     depth     The depth of the root node
 * @property {array}      nodes     The nodes of the root node
 * @property {array}      objects   The objects of the root node
 * @example
 * setup: 
 *      var quadtree = new jaws.QuadTree();
 * update:
 *      quadtree.collide(sprite or list, sprite or list, callback function);
 */
var jaws = (function(jaws) {

  /**
   * Creates an empty quadtree with optional bounds and starting depth
   * @constructor
   * @param {jaws.Rect}   [bounds]    The defining bounds of the tree
   * @param {number}      [depth]     The current depth of the tree
   */
  jaws.QuadTree = function(bounds) {
    this.depth = arguments[1] || 0;
    this.bounds = bounds || new jaws.Rect(0, 0, jaws.width, jaws.height);
    this.nodes = [];
    this.objects = [];
  };

  /**
   * Moves through the nodes and deletes them.
   * @this {jaws.QuadTree}
   */
  jaws.QuadTree.prototype.clear = function() {
    this.objects = [];

    for (var i = 0; i < this.nodes.length; i++) {
      if (typeof this.nodes[i] !== 'undefined') {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
    }
  };

  /**
   * Creates four new branches sub-dividing the current node's width and height
   * @private
   * @this {jaws.QuadTree}
   */
  jaws.QuadTree.prototype.split = function() {
    var subWidth = Math.round((this.bounds.width / 2));
    var subHeight = Math.round((this.bounds.height / 2));
    var x = this.bounds.x;
    var y = this.bounds.y;

    this.nodes[0] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y, subWidth, subHeight), this.depth + 1);
    this.nodes[1] = new jaws.QuadTree(new jaws.Rect(x, y, subWidth, subHeight), this.depth + 1);
    this.nodes[2] = new jaws.QuadTree(new jaws.Rect(x, y + subHeight, subWidth, subHeight), this.depth + 1);
    this.nodes[3] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y + subHeight, subWidth, subHeight), this.depth + 1);
  };

  /**
   * Returns the index of a node's branches if passed-in object fits within it
   * @private 
   * @param {object} pRect  An object with the properties x, y, width, and height
   * @returns {index} The index of nodes[] that matches the dimensions of passed-in object
   */
  jaws.QuadTree.prototype.getIndex = function(pRect) {
    var index = -1;
    var verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    var horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    var topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint);
    var bottomQuadrant = (pRect.y > horizontalMidpoint);

    if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      }
      else if (bottomQuadrant) {
        index = 2;
      }
    }
    else if (pRect.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      }
      else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  };

  /**
   * Inserts an object into the quadtree, spliting it into new branches if needed
   * @param {object} pRect An object with the properties x, y, width, and height
   */
  jaws.QuadTree.prototype.insert = function(pRect) {

    if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") &&
            !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
      return;
    }

    if (typeof this.nodes[0] !== 'undefined') {
      var index = this.getIndex(pRect);

      if (index !== -1) {
        this.nodes[index].insert(pRect);
        return;
      }
    }

    this.objects.push(pRect);

    if (typeof this.nodes[0] === 'undefined') {
      this.split();
    }

    var i = 0;
    while (i < this.objects.length) {
      var index = this.getIndex(this.objects[i]);
      if (index !== -1) {
        this.nodes[index].insert(this.objects.splice(i, 1)[0]);
      }
      else {
        i++;
      }
    }

  };

  /**
   * Returns those objects on the branch matching the position of the passed-in object
   * @param {object} pRect An object with properties x, y, width, and height
   * @returns {array} The objects on the same branch as the passed-in object
   */
  jaws.QuadTree.prototype.retrieve = function(pRect) {

    if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") &&
            !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
      return;
    }

    var index = this.getIndex(pRect);
    var returnObjects = this.objects;
    if (typeof this.nodes[0] !== 'undefined') {
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));
      } else {
        for (var i = 0; i < this.nodes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
        }
      }
    }
    return returnObjects;
  };

  /**
   * Checks for collisions between objects by creating a quadtree, inserting one or more objects,
   *  and then comparing the results of a retrieval against another single or set of objects.
   *  
   *  With the callback argument, it will call a function and pass the items found colliding
   *   as the first and second argument.
   *   
   *  Without the callback argument, it will return a boolean value if any collisions were found.
   * 
   * @param {object|array} list1 A single or set of objects with properties x, y, width, and height
   * @param {object|array} list2 A single or set of objects with properties x, y, width, and height
   * @param {function} [callback]  The function to call per collision
   * @returns {boolean} If the items (or any within their sets) collide with one another
   */
  jaws.QuadTree.prototype.collide = function(list1, list2, callback) {

    var overlap = false;
    var tree = new jaws.QuadTree();
    var temp = [];

    if (!(list1.forEach)) {
      temp.push(list1);
      list1 = temp;
    }

    if (!(list2.forEach)) {
      temp = [];
      temp.push(list2);
      list2 = temp;
    }

    list2.forEach(function(el) {
      tree.insert(el);
    });

    list1.forEach(function(el) {
      if(jaws.collide(el, tree.retrieve(el), callback)) {
        overlap = true;
      }
    });

    tree.clear();
    return overlap;
  };

  return jaws;

})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.QuadTree;
}
