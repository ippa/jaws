/**
 * @namespace Collisiondetection
 * 
 * Collision detection helpers.
 *
 * @example
 *   // collision helper exampels:
 *   collideOneWithOne(player, boss)        // -> false
 *   collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
 *   collideManyWithMany(bullets, enemies)  // -> [ [bullet1, enemy1], [bullet2, enemy2] ]
 *
 */
var jaws = (function(jaws) {

/**
 * collides 2 single objects by reading x, y and either method rect() or property radius.
 * returns true if the two objects are colliding.
 */
jaws.collideOneWithOne = function(object1, object2) {
  if(object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2))          return true;
  if(object1.rect && object2.rect && object1 !== object2 && jaws.collideRects( object1.rect(), object2.rect())) return true;
  return false;
}

/**
 * collide one single object 'object' with a list of objects 'list'. 
 *
 * if 'callback' is given it will be called for each collision with the two colliding objects as arguments.
 *
 * leaving out 'callback' argument it will return an array of items from 'list' that collided with 'object'.
 * returns empty array of no collisions are found.
 * will never collide objects with themselves.
 */
jaws.collideOneWithMany = function(object, list, callback) {
  if(callback) {
    for(var i=0; i < list.length; i++)  {
      if( jaws.collideOneWithOne(object, list[i]) ) { 
        callback(object, list[i]) 
      }
    }
  }
  else {
    return list.filter( function(item) { return jaws.collideOneWithOne(object, item) } ) 
  }
}

/**
 * Collides two list/arrays of objects -- 'list1' and 'list2'.
 * Returns an array of arrays with colliding pairs from 'list1' and 'list2'.
 * Will never collide objects with themselves, even if you collide the same list with itself.
 *
 * @example
 *
 *   jaws.collideManyWithMany(bullets, enemies) // --> [[bullet, enemy], [bullet, enemy]]
 *
 */
jaws.collideManyWithMany = function(list1, list2, callback) {
  var a = []

  if(list1 === list2) {
    combinations(list1, 2).forEach( function(pair) {
      if( jaws.collideOneWithOne(pair[0], pair[1]) ) {
        if(callback)  { callback(pair[0], pair[1]) }
        else          { a.push([pair[0], pair[1]]) }
      }
    });
  }
  else {
    list1.forEach( function(item1) { 
      list2.forEach( function(item2) { 
        if(jaws.collideOneWithOne(item1, item2)) {
          if(callback)  { callback(item1, item2) }
          else          { a.push([item1, item2]) }
        }
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
  return Math.sqrt( Math.pow(object1.x-object2.x, 2) +  Math.pow(object1.y-object2.y, 2) )
}

/** private */
function combinations(list, n) {
  var f = function(i) {
    if(list.isSpriteList !== undefined) {
      return list.at(i)
    } else {  // s is an Array
      return list[i];
    }
  };  
  var r = [];
  var m = new Array(n);
  for (var i = 0; i < n; i++) m[i] = i; 
  for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length) {
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
 * Collides 2 objects or list of objects with eachother. 
 * For each collision callback is executed with the 2 objects as arguments.
 *
 * The upside of using collide() instead of the more specialised collideOneWithMany() and collideManyWithMany()
 * is that you can call it withour knowing if you're sending in single objects or lists of objects. 
 * If there's collisions you'll always get your callback executed with the two colliding objects as arguments.
 *
 * @examples
 *   jaws.collide(player, enemy, function(player, enemy) { ... } )  
 *   jaws.collide(player, enemies, function(player, enemy) { ... } ) 
 *   jaws.collide(bullets, enemies, function(bullet, enemy) { ... } )
 *
 */
jaws.collide = function(x, x2, callback) {
  if(x.rect     && x2.forEach)  return (jaws.collideOneWithMany(x, x2, callback)===[]);
  if(x.forEach  && x2.forEach)  return (jaws.collideManyWithMany(x, x2, callback)===[]);
  if(x.forEach  && x2.rect)     return (jaws.collideOneWithMany(x2, x, callback)===[]);
  if(x.rect && x2.rect) {
    var result = jaws.collideOneWithOne(x,x2);
    if(callback && result) callback(x, x2);
    else return result;
  }
}

return jaws;
})(jaws || {});

