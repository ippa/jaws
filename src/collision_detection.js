/*
 * 
 *  Add collision detection helpers to "jaws"-object
 *
 */
var jaws = (function(jaws) {

/** 
 * Returns true if circles collide.
 * Takes two objects with properties "radius" as argument.
 */
jaws.collideCircles = function(object1, object2) {
  return ( jaws.distanceBetween(object1, object2) < object1.radius + object2.radius )
}

/** 
 * returns the distance between 2 objects
 */
jaws.distanceBetween = function(object1, object2) {
  return Math.sqrt( Math.pow(object1.x-object2.x, 2) +  Math.pow(object1.y.object2.y, 2) )
}

/*
 * Collides 2 objects or list with objects.
 * Returns empty array if no collision took place
 * Returns array of array with object-pairs that collided
 *
 * @examples
 *   jaws.collide(player, enemy)
 *   jaws.collide(player, enemies)   // --> [player, enemies[2]]
 *   jaws.collide(bullets, enemies) 
 *   jaws.collide(player, ememies)
 *
 */
jaws.collide = function(object1, object2) {
  if(object1.radius && object2.radius && jaws.collideCircles(object1, object2))  { return [object1, object2]; }
  if(object1.rect && object2.rect && object1.rect().collideRect(object2.rect())) { return [object1, object2]; }
  if(object1.forEach) return object1.map( function(item1) { jaws.collide(item1, object2) } );
  if(object2.forEach) return object2.map( function(item2) { jaws.collide(item2, object1) } );
  return false;
}

return jaws;
})(jaws || {});

