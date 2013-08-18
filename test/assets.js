test("json assets, onload-callback", function() {
  var assets = new jaws.Assets()
  assets.root = "assets/"
  assets.add("gamedata.json")
  assets.loadAll({onload:loaded})
  stop()
  function loaded() {
    deepEqual(assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")
    deepEqual(assets.get("gamedata.json").mode, "angry", "jsondata got parsed into an object")
    start();
  }
});
  
test("assets advanced", function() {
  stop()

  jaws.assets.root = "assets/"
  jaws.assets.load(
    "rect.png", 
    function() { ok(jaws.assets.get("rect.png"), "load-callback loaded image"); start() },
    function() { ok(false, "error callback doesn't get called"); start() } 
  );
     
  stop()
  jaws.assets.load("test_404.png", null, function() { 
    ok(true, "error callback on 404")
    start()
  });
});

test("image asset with 404s", function() {
  var assets = new jaws.Assets
  assets.root = "assets/"
  assets.add("droid_11x15.png")
  assets.add("test_404.png")
  assets.image_to_canvas = true
  assets.loadAll({onfinish: assetsLoaded})
  stop()
  function assetsLoaded() {
    ok(jaws.isCanvas(assets.get("droid_11x15.png")), "png loaded as Canvas")
    start()
   }
});

test("assets loadAll", function() {
  jaws.assets.image_to_canvas = false
  jaws.assets.root = "assets/"
  jaws.assets.add("droid_11x15.png")
  jaws.assets.add("gamedata.json")
  jaws.assets.add("player.png")
  jaws.assets.add(["rect.png", "laser.wav"])
  jaws.assets.loadAll({onfinish:assetsLoaded})
  
  stop()
  function assetsLoaded() {
    ok(1, "onfinish()-callback was called")
    ok(jaws.assets.isLoaded("player.png"), "isLoaded('player.png') returns true")
    ok(! jaws.assets.isLoaded("test_404.png"), "isLoaded('test_404.png') returns false")
    ok(jaws.assets.get("player.png"), "image player.png loaded")
    ok(jaws.assets.get("droid_11x15.png"), "image loaded")
    ok(jaws.assets.get("rect.png"), "image loaded")
    ok(jaws.assets.get("laser.wav"), "audio loaded")
    ok(jaws.assets.get("gamedata.json"), "json loaded")
    ok(jaws.isImage(jaws.assets.get("rect.png")), "png loaded as Image")
    deepEqual(jaws.assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")
    start()
  }
});

