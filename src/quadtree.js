var jaws = (function(jaws) {
  /*
   * @class A jaws.QuadTree for 2D spatial collsion.
   * @constructor
   *  
   * @property {int} depth     Current node depth
   * @property {int} bounds    Rect(x,y,width,height) defining bounds of tree
   * @property {int} maxlevels    The maximum depth of the tree
   *
   * @example
   * setup: 
   *      var quadtree = new jaws.QuadTree();
   * update:
   *      quadtree.collide(sprite or list, sprite or list, callback function);
   */

  jaws.QuadTree = function(depth, bounds, maxlevels) {
    this.depth = depth || 0;
    this.bounds = bounds || new jaws.Rect(0, 0, jaws.width, jaws.height);
    this.MAX_LEVELS = maxlevels || 7;
    this.nodes = [];
    this.objects = [];
  };
  // Clear the entire tree
  jaws.QuadTree.prototype.clear = function() {
    this.objects = [];

    for (var i = 0; i < this.nodes.length; i++) {
      if (typeof this.nodes[i] !== 'undefined') {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
    }
  };
  //Create four new branches of the tree
  jaws.QuadTree.prototype.split = function() {
    var subWidth = Math.round((this.bounds.width / 2));
    var subHeight = Math.round((this.bounds.height / 2));
    var x = this.bounds.x;
    var y = this.bounds.y;

    this.nodes[0] = new jaws.QuadTree(this.depth + 1, new jaws.Rect(x + subWidth, y, subWidth, subHeight));
    this.nodes[1] = new jaws.QuadTree(this.depth + 1, new jaws.Rect(x, y, subWidth, subHeight));
    this.nodes[2] = new jaws.QuadTree(this.depth + 1, new jaws.Rect(x, y + subHeight, subWidth, subHeight));
    this.nodes[3] = new jaws.QuadTree(this.depth + 1, new jaws.Rect(x + subWidth, y + subHeight, subWidth, subHeight));
  };
  //Find the index for the object within the set of nodes
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
  //Insert the object into the QuadTree, 
  // splitting into new branches if needed
  jaws.QuadTree.prototype.insert = function(pRect) {
    if (typeof this.nodes[0] !== 'undefined') {
      var index = this.getIndex(pRect);

      if (index !== -1) {
        this.nodes[index].insert(pRect);
        return;
      }
    }

    this.objects.push(pRect);

    if (this.depth < this.MAX_LEVELS) {
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
    }
  };
  //Return all objects within the object's branch
  // representing all possible collsions.
  jaws.QuadTree.prototype.retrieve = function(pRect) {
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
  /*
   *  Returns if two SpriteLists or other Rect() defined objects collide.
   *  Calls the callback function, if defined, per collsion detected.
   */
  jaws.QuadTree.prototype.collide = function(list1, list2, callback) {

    var overlap = false;

    if (!(list1 instanceof jaws.SpriteList)) {
      var temp = new jaws.SpriteList();
      temp.push(list1);
      list1 = temp;
    }
    if (!(list2 instanceof jaws.SpriteList)) {
      var temp = new jaws.SpriteList();
      temp.push(list2);
      list2 = temp;
    }
    var tree = new jaws.QuadTree();
    list2.forEach(function(el) {
      tree.insert(el);
    });
    list1.forEach(function(el) {
      var len = tree.retrieve(el);
      var collide = jaws.collideOneWithMany(el, len);
      collide.forEach(function(ele) {
        if (callback) {
          callback(el, ele);
        }
        else {
          overlap = true;
        }
      });
    });

    tree.clear();
    delete tree;
    return overlap;
  };
  return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
  module.exports = jaws.QuadTree;
}
