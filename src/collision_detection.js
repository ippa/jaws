if(typeof require !== "undefined") { var jaws = require("./core.js"); }

/**
 * @fileOverview Collision Detection
 * 
 * Collision detection helpers.
 *
 * @example
 *   // collision helper exampels:
 *   collideOneWithOne(player, boss)        // -> false
 *   collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
 *   collideManyWithMany(bullets, enemies)  // -> [ [bullet1, enemy1], [bullet2, enemy2] ]
 *   collide(player, boss)                  // -> false
 *   collide(player, 
 *           bullets,
 *           function(player, bullet) {})   // Callback: arguments[0] -> player 
 *                                          //           arguments[1] -> bullets[i]
 *
 */
var jaws = (function(jaws) {

  /**
   * Collides two objects by reading x, y and either method rect() or property radius.
   * @public
   * @param {object} object1 An object with a 'radius' or 'rect' property
   * @param {object} object2 An object with a 'radius' or 'rect' property
   * @returns {boolean} If the two objects are colliding or not
   */
  jaws.collideOneWithOne = function(object1, object2) {
    if (object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))
      return true;

    if (object1.rect && object2.rect && object1 !== object2 && jaws.collideRects(object1.rect(), object2.rect()))
      return true;

    return false;
  };

  /**
   * Compares an object against a list, returning those from list that collide with object, and
   *  calling 'callback' per collision (if set) with object and item from list.
   *  (Note: Will never collide objects with themselves.)
   * @public
   * @param {object} object An object with a 'radius' or 'rect' property
   * @param {array|object} list A collection of objects with a 'length' property
   * @param {function} callback The function to be called per collison detected
   * @returns {array} A collection of items colliding with object from list
   * @example
   * collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
   * collideOneWithMany(player, bullets, function(player, bullet) {
   *  //player and bullet (bullets[i])
   * });
   */
  jaws.collideOneWithMany = function(object, list, callback) {
    var a = [];
    if (callback) {
      for (var i = 0; i < list.length; i++) {
        if (jaws.collideOneWithOne(object, list[i])) {
          callback(object, list[i]);
          a.push(list[i])
        }
      }
      return a;
    }
    else {
      return list.filter(function(item) {
        return jaws.collideOneWithOne(object, item);
      });
    }
  };

  /**
   * Compares two lists, returning those items from each that collide with each other, and
   *  calling 'callback' per collision (if set) with item from list1 and item from list2.
   *  (Note: Will never collide objects with themselves.)
   * @public
   * @param {array|object} list1 A collection of objects with a 'forEach' property
   * @param {array|object} list2 A collection of objects with a 'forEach' property
   * @param {function} callback The function to be called per collison detected
   * @returns {array} A collection of items colliding with list1 from list2
   * @example
   *  jaws.collideManyWithMany(bullets, enemies) // --> [[bullet, enemy], [bullet, enemy]]
   */
  jaws.collideManyWithMany = function(list1, list2, callback) {
    var a = [];

    if (list1 === list2) {
      combinations(list1, 2).forEach(function(pair) {
        if (jaws.collideOneWithOne(pair[0], pair[1])) {
          if (callback) {
            callback(pair[0], pair[1]);
          }
          else {
            a.push([pair[0], pair[1]]);
          }
        }
      });
    }
    else {
      list1.forEach(function(item1) {
        list2.forEach(function(item2) {
          if (jaws.collideOneWithOne(item1, item2)) {
            if (callback) {
              callback(item1, item2);
            }
            else {
              a.push([item1, item2]);
            }
          }
        });
      });
    }

    return a;
  };

  /**
   * Returns if two circle-objects collide with each other
   * @public
   * @param {object} object1 An object with a 'radius' property
   * @param {object} object2 An object with a 'radius' property
   * @returns {boolean} If two circle-objects collide or not
   */
  jaws.collideCircles = function(object1, object2) {
    return (jaws.distanceBetween(object1, object2) < object1.radius + object2.radius);
  };

  /**
   * Returns if two Rects collide with each other or not
   * @public
   * @param {object} rect1 An object with 'x', 'y', 'right' and 'bottom' properties
   * @param {object} rect2 An object with 'x', 'y', 'right' and 'bottom' properties
   * @returns {boolean} If two Rects collide with each other or not
   */
  jaws.collideRects = function(rect1, rect2) {
    return ((rect1.x >= rect2.x && rect1.x <= rect2.right) || (rect2.x >= rect1.x && rect2.x <= rect1.right)) &&
            ((rect1.y >= rect2.y && rect1.y <= rect2.bottom) || (rect2.y >= rect1.y && rect2.y <= rect1.bottom));
  };

  /**
   * Returns the distance between two objects
   * @public
   * @param {object} object1 An object with 'x' and 'y' properties
   * @param {object} object2 An object with 'x' and 'y' properties
   * @returns {number} The distance between two objects
   */
  jaws.distanceBetween = function(object1, object2) {
    return Math.sqrt(Math.pow(object1.x - object2.x, 2) + Math.pow(object1.y - object2.y, 2));
  };

  /**
   * Creates combinations of items from a list of a specific size
   * @private
   * @param {array|object} list An object with a 'length' property
   * @param {number} n The size of the array to return
   * @returns {Array} An array of items having a specific size number of its own entries
   */
  function combinations(list, n) {
    var f = function(i) {
      if (list.isSpriteList !== undefined) {
        return list.at(i);
      } else {  // s is an Array
        return list[i];
      }
    };
    var r = [];
    var m = new Array(n);
    for (var i = 0; i < n; i++)
      m[i] = i;
    for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length) {
      r.push(m.map(f));
      while (0 <= i && m[i] === sn - 1) {
        i--;
        sn--;
      }
      if (0 <= i) {
        m[i] += 1;
        for (var j = i + 1; j < n; j++)
          m[j] = m[j - 1] + 1;
        i = n - 1;
      }
    }
    return r;
  }

  /**
   * If an object has items or not
   * @private
   * @param {array|object} array An object with a 'length' property
   * @returns {boolean} If the object has items (length > 0)
   */
  function hasItems(array) {
    return (array && array.length > 0);
  }

  /**
   * Compares two objects or lists, returning if they collide, and 
   *  calling 'callback' per collision (if set) between objects or lists.
   * @param {array|object} x An object with either 'rect' or 'forEach' property
   * @param {array|object} x2 An object with either 'rect' or 'forEach' property
   * @param {function} callback
   * @returns {boolean}
   * @examples
   *   jaws.collide(player, enemy, function(player, enemy) { ... } )  
   *   jaws.collide(player, enemies, function(player, enemy) { ... } ) 
   *   jaws.collide(bullets, enemies, function(bullet, enemy) { ... } )
   */
  jaws.collide = function(x, x2, callback) {
    if ((x.rect || x.radius) && x2.forEach)
      return (jaws.collideOneWithMany(x, x2, callback).length > 0);
    if (x.forEach && x2.forEach)
      return (jaws.collideManyWithMany(x, x2, callback).length > 0);
    if (x.forEach && (x2.rect || x2.radius))
      return (jaws.collideOneWithMany(x2, x, callback).length > 0);
    if ((x.rect && x2.rect) || (x.radius && x2.radius)) {
      var result = jaws.collideOneWithOne(x, x2);
      if (callback && result)
        callback(x, x2);
      else
        return result;
    }
  };

  return jaws;
})(jaws || {});

