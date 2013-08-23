module("PixeleMapExtra");

test("PixelMap basics", function () {
 jaws.assets.root = "assets/"
  jaws.assets.add("droid_11x15.png")
  jaws.assets.loadAll({onload: assetsLoaded});
  stop();

  function assetsLoaded() {
    var pixel_map = new jaws.PixelMap({image: "droid_11x15.png"})  ;
    deepEqual( pixel_map.at(0,0)[3], 0, "transparency at 0/0");
    deepEqual( pixel_map.at(5,5)[3], 255, "non-transparency at 5/5");
    deepEqual( pixel_map.at(5,5), [188,188,188,255], "grey without tranperency");
    
    var color = pixel_map.colorAt(5,5);
    deepEqual( color.red, 188, "red part of grey");
    deepEqual( color.green, 188, "green part of grey");
    deepEqual( color.blue, 188, "blue part of grey");
    deepEqual( color.alpha, 255, "alpha part of grey");

    pixel_map.nameColor("air", [0,0,0,0])
    pixel_map.nameColor("robot", [188,188,188,255])
    equal( pixel_map.namedColorAt(5,5), "robot", "Find named color");
    equal( pixel_map.namedColorAt(0,0), "air", "Find named color");

    start();
  }
})


