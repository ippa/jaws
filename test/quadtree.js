module("QuadTree")

test("QuadTree defaults", function() {
  var tree = new jaws.QuadTree();
  same(tree.depth, 0, "depth defaults to 0");
  same(tree.bounds, new jaws.Rect(0,0,jaws.width,jaws.height), "bounds defaults to rect(0,0,jaws.width,jaws.height)");
  same(tree.MAX_LEVELS, 7, "maxlevels defaults to 7");
  same(tree.nodes, [], "nodes defaults to []");
  same(tree.objects, [], "objects defaults to []");
});
test("QuadTree operations: insert, retrieve, and clear", function() {
  var tree = new jaws.QuadTree();
  var a = new jaws.Sprite({color: "white", width: 10, height: 10, x: 0, y: 0});
  var b = new jaws.Sprite({color: "white", width: 10, height: 10, x: 0, y: 0});
  tree.insert(a);
  same(tree.retrieve(a.rect())[0], a, "Same object was insert()'d and then retrieve()'d");
  tree.clear();
  same(tree.retrieve(a.rect()), [], "After call to clear(), no objects are in tree");
  equal(tree.collide(a,b), true, "A and B are both at 0,0 and should collide.");
  b.move(20,20);
  equal(tree.collide(a,b), false, "A is at 0,0 and B is at 20,20; they should not collide.");
  start();
});
