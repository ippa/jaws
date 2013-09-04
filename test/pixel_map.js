module("PixeleMap");

test("PixelMap basics", function () {
  stop();
  var assets = new jaws.Assets().setRoot("assets/").add("droid_11x15.png").loadAll({onload: loaded});

  function loaded() {
    var pixel_map = new jaws.PixelMap({image: assets.get("droid_11x15.png") });
    equal( pixel_map.at(0,0)[3], 0, "transparency at 0/0");
    equal( pixel_map.at(5,5)[3], 255, "non-transparency at 5/5");
    deepEqual( pixel_map.at(5,5), [188,188,188,255], "grey without tranperency");
    
    pixel_map.nameColor("air", [0,0,0,0])
    pixel_map.nameColor("robot", [188,188,188,255])
    equal( pixel_map.namedColorAt(5,5), "robot", "Find named color");
    equal( pixel_map.namedColorAt(0,0), "air", "Find named color");

    start();
  }
});

test("PixelMap vs Rect", function () {
  stop();
  var assets = new jaws.Assets().setRoot("assets/").add("block_10x10.bmp").loadAll({onload: loaded});

  function loaded() {
    var pixel_map = new jaws.PixelMap({image: assets.get("block_10x10.bmp")}) ;

    deepEqual( pixel_map.at(0,0), [0,0,0,0], "'black' transparency @ 0/0");
    deepEqual( pixel_map.at(9,9), [0,0,0,255], "black @ 10/10");

    pixel_map.nameColor("air", [0,0,0,0]);
    pixel_map.nameColor("ground", [0,0,0,255]);

    var small_rect = jaws.Rect(0,0,2,2)
    var big_rect = jaws.Rect(0,0,8,8)

    ok( pixel_map.namedColorAtRect("air", small_rect), "small rect is touching air")
    ok( !pixel_map.namedColorAtRect("ground", small_rect), "small rect is not touching ground")
    ok( pixel_map.namedColorAtRect("air", big_rect), "big rect is touching air")
    ok( pixel_map.namedColorAtRect("ground", big_rect), "big rect is touching ground")

    start();
  }
})

test("PixelMap pixel perfect", function () {
  stop();
  var assets = new jaws.Assets().setRoot("assets/").add("chess_2x2.bmp").loadAll({onload: loaded});

  function loaded() {
    var pixel_map = new jaws.PixelMap({image: assets.get("chess_2x2.bmp")}) ;
    pixel_map.nameColor("black", [0,0,0,255]);
    pixel_map.nameColor("white", [255,255,255,255]);
 
    equal( pixel_map.namedColorAt(0, 0), "black", "black @ 0/0")
    equal( pixel_map.namedColorAt(1, 1), "black", "black @ 1/1")
    equal( pixel_map.namedColorAt(1, 0), "white", "white @ 1/0")
    equal( pixel_map.namedColorAt(0, 1), "white", "white @ 0/1")

    start();
  }
})

/*
test("PixelMap trace methods", function () {
  jaws.assets.setRoot("assets/").add("block_10x10.bmp").loadAll({onload: loaded});
  stop();
  var pixel_map;

  function loaded() {
    pixel_map = new jaws.PixelMap({image: "block_10x10.bmp"});
    pixel_map.nameColor("ground", [0,0,0,255]);
    var sprite = jaws.Sprite({x: 0, y: 0, width: 1, height: 1, color: "white"})

    pixel_map.untilNamedColorAtRect("ground", function() {
      sprite.y += 1
      return sprite.rect();
    });

    equal(sprite.y, 5, "sprite hit ground at y=5")
    
    start();
  }
})
*/
