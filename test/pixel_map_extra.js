module("PixeleMapExtra");

test("PixelMap basics", function () {
 jaws.assets.root = "assets/"
  jaws.assets.add("droid_11x15.png")
  jaws.assets.loadAll({onfinish:assetsLoaded});
  stop();

  function assetsLoaded() {
    var pixel_map = new jaws.PixelMap({image: "droid_11x15.png"})  ;
    deepEqual( pixel_map.at(0,0)[3], 0, "transparency at 0/0");
    start();
  }
})


