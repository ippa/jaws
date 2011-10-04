/**
 * @namespace Collisiondetection
 * 
 * Collision detection helpers.
 *
 * @example
 *   collideOneWithOne(player, boss)        // -> false
 *   collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
 *   collideManyWithMany(bullets, enemies)  // -> [ [bullet1, enemy1], [bullet2, enemy2] ]
 *
 */
var jaws = (function(jaws) {

/**
 * collides 2 single objects by reading x, y and either method rect() or property radius.
 * returns true if collision
 */
jaws.collideOneWithOne = function(object1, object2) {
  if(object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))          return true;
  if(object1.rect && object2.rect && object1 !== object2 && jaws.collideRects( object1.rect(), object2.rect())) return true;
  return false;
}

/**
 * collide one single object 'object' with a list of objects 'list'.
 * returns an array of items from 'list' that collided with 'object'.
 * returns empty array of no collisions are found.
 * will never collide objects with themselves.
 */
jaws.collideOneWithMany = function(object, list) {
  return list.filter( function(item) { return jaws.collideOneWithOne(object, item) } ) 
}

/**
 * Collides two list of objects -- 'list1' and 'list2'.
 * Returns an array of arrays with colliding pairs from 'list1' and 'list2'.
 * Will never collide objects with themselves, even if you collide the same list with itself.
 *
 * @example
 *
 *   jaws.collideManyWithMany(bullets, enemies) // --> [[bullet, ememy], [bullet, enemy]]
 *
 */
jaws.collideManyWithMany = function(list1, list2) {
  var a = []

  if(list1 === list2) {
    combinations(list1, 2).forEach( function(pair) {
      if( jaws.collideOneWithOne(pair[0], pair[1]) ) a.push([pair[0], pair[1]]);
    });
  }
  else {
    list1.forEach( function(item1) { 
      list2.forEach( function(item2) { 
        if(jaws.collideOneWithOne(item1, item2)) a.push([item1, item2]) 
      });
    });
  }

  return a;
}
  

/** 
 * Returns true if circles collide.
 * Takes two objects with properties "radius" as argument.
 */
jaws.collideCircles = function(object1, object2) {
  return ( jaws.distanceBetween(object1, object2) < object1.radius + object2.radius )
}

/** 
 * Returns true if 'rect1' collides with 'rect2'
 */
jaws.collideRects = function(rect1, rect2) {
  return ((rect1.x >= rect2.x && rect1.x <= rect2.right) || (rect2.x >= rect1.x && rect2.x <= rect1.right)) &&
         ((rect1.y >= rect2.y && rect1.y <= rect2.bottom) || (rect2.y >= rect1.y && rect2.y <= rect1.bottom))
}

/** 
 * returns the distance between 2 objects
 */
jaws.distanceBetween = function(object1, object2) {
  return Math.sqrt( Math.pow(object1.x-object2.x, 2) +  Math.pow(object1.y, object2.y, 2) )
}

/** private */
function combinations(s, n) {
  var f = function(i){return s[i];};
  var r = [];
  var m = new Array(n);
  for (var i = 0; i < n; i++) m[i] = i; 
  for (var i = n - 1, sn = s.length; 0 <= i; sn = s.length) {
    r.push( m.map(f) );
    while (0 <= i && m[i] == sn - 1) { i--; sn--; }
    if (0 <= i) { 
      m[i] += 1;
      for (var j = i + 1; j < n; j++) m[j] = m[j-1] + 1;
      i = n - 1;
    }
  }
  return r;
}

/** @private */
function hasItems(array) { return (array && array.length > 0) }


/*
 * @deprecated
 *
 * Collides 2 objects or list with objects.
 * Returns empty array if no collision took place
 * Returns array of array with object-pairs that collided
 *
 * @examples
 *   jaws.collide(player, enemy)     // --> [player, enemy]
 *   jaws.collide(player, enemies)   // --> [[player, enemies[2]]
 *   jaws.collide(bullets, enemies)  // [ [bullet1, enemy1], [bullet2, ememy3] ]
 *
 */
/*
jaws.collide = function(object1, object2) {
  var a = []
  if(object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))  { return [object1, object2]; }
  if(object1.rect && object2.rect && object1 !== object2 && jaws.collideRects( object1.rect(), object2.rect())) { return [object1, object2]; }
  if(object1.forEach) a = object1.map( function(item1) { return jaws.collide(item1, object2) } ).filter(hasItems);
  if(object2.forEach) a = object2.map( function(item2) { return jaws.collide(item2, object1) } ).filter(hasItems);

  // Convert [[[1,2],[2,2]]] -> [[1,1],[2,2]] (flatten one outer array wrapper)
  if(a[0] && a[0].length == 1)  return a[0];
  else                          return a;
}
*/

return jaws;
})(jaws || {});

