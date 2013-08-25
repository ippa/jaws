module("QuadTree");

test("QuadTree defaults", function() {
  var tree = new jaws.QuadTree();
  deepEqual(tree.depth, 0, "depth defaults to 0");
  deepEqual(tree.bounds, new jaws.Rect(0,0,jaws.width,jaws.height), "bounds defaults to rect(0,0,jaws.width,jaws.height)");
  deepEqual(tree.nodes, [], "nodes defaults to []");
  deepEqual(tree.objects, [], "objects defaults to []");
});

test("QuadTree operations: insert, retrieve, and clear", function() {
  var tree = new jaws.QuadTree();
  var a = new jaws.Sprite({color: "white", width: 10, height: 10, x: 0, y: 0, anchor: "top_left"});
  var b = new jaws.Sprite({color: "white", width: 10, height: 10, x: 0, y: 0, anchor: "top_left"});

  tree.insert(a);
  deepEqual(tree.retrieve(a.rect())[0], a, "Same object was insert()'d and then retrieve()'d");
  tree.clear();
  deepEqual(tree.retrieve(a.rect()), [], "After call to clear(), no objects are in tree");
  equal(tree.collide(a,b), true, "A and B are both at 0,0 and should collide.");
  b.move(20,20);
  equal(tree.collide(a,b), false, "A is at 0,0 and B is at 20,20; they should not collide.");
});

test("QuadTree collide spritelists", function() {
  var tree = new jaws.QuadTree();
  var s1 = new jaws.Sprite({color: "white", width: 10, height: 10, x: 0, y: 0});
  var s2 = new jaws.Sprite({color: "white", width: 10, height: 10, x: 0, y: 0});
  var s3 = new jaws.Sprite({color: "white", width: 10, height: 10, x: 40, y: 40});
  var sprites = new jaws.SpriteList();
  sprites.push(s1);
  sprites.push(s2);
  sprites.push(s3);

  var collided = false;
  tree.collide(s1, sprites, function(a, b) {
    collided = true;
    deepEqual(s1, a, "tree.collide(sprite, list)");
    deepEqual(s2, b, "tree.collide(sprite, list)");
  });
  deepEqual(collided, true, "tree.collide(sprite, list) callback got executed");

  var collided = false;
  tree.collide(sprites, sprites, function(a, b) {
    // console.log(a.toString() + " <-> " + b.toString())
    collided = true;
    deepEqual(s1, a, "tree.collide(list, list)");
    deepEqual(s2, b, "tree.collide(list, list)");
  });
  deepEqual(collided, true, "tree.collide(list, list) callback got executed");

});

