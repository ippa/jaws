module("Assets")

test("json assets, onload-callback", function() {
  var assets = new jaws.Assets()
  assets.root = "assets/"
  assets.add("gamedata.json")
  assets.loadAll({onload: loaded})
  stop()
  function loaded() {
    deepEqual(assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")
    deepEqual(assets.get("gamedata.json").mode, "angry", "jsondata got parsed into an object")
    start();
  }
});
  
test("audio assets", function() {
  jaws.log.use_console = true;
  var assets = new jaws.Assets()
  assets.root = "assets/";
  assets.add(["tones.ogg", "tones.mp3", "tones.wav", "tones.mka", "tones.flac"])
  assets.loadAll({onload: loaded});
  stop(); 

  function loaded() {
    if(is_ie) {
      ok( !assets.can_play["ogg"], "ie doesn't support ogg")
      ok( !assets.can_play["ogg"], "ie doesn't support ogg")
      ok( !assets.get("tones.ogg"), "ie has not loaded ogg")
    }
    if(is_chrome) {
      ok( assets.can_play["ogg"], "chrome supports ogg")
      ok( assets.can_play["mp3"], "chrome supports ogg")
      ok( assets.get("tones.ogg"), "chrome has loaded ogg")
    }
    ok(true, "noop");
    console.log(assets.loaded)
    start();
  };

  window.a_assets = assets

});

/*
test("assets.load()", function() {
  var assets = new jaws.Assets
  assets.root = "assets/"
  var load = function() { ok(jaws.assets.get("rect.png"), "load-callback loaded image"); start() }
  var error = function() { ok(false, "error callback doesn't get called"); start() } 
  
  stop()
  assets.load("rect.png", {onload: load, onerror: error});
     
  stop()
  assets.load("test_404.png", {onload: function() { start(); }, onerror: function() { ok(true, "error callback on 404"); start(); } });
});
*/

test("image asset with 404s", function() {
  var assets = new jaws.Assets()
  assets.root = "assets/"
  assets.add("droid_11x15.png")
  assets.add("test_404.png")
  assets.image_to_canvas = true
  assets.loadAll({onload: assetsLoaded})
  stop()
  function assetsLoaded() {
    ok(jaws.isCanvas(assets.get("droid_11x15.png")), "png loaded as Canvas")
    start()
   }
});

test("assets.loadAll()", function() {
  var assets = new jaws.Assets()
  assets.image_to_canvas = false
  assets.root = "assets/"
  assets.add("droid_11x15.png")
  assets.add("gamedata.json")
  assets.add("player.png")
  assets.add(["rect.png", "laser.wav"])
  assets.loadAll({onload: assetsLoaded})
  
  stop()
  function assetsLoaded() {
    ok(1, "onload()-callback was called")
    ok(assets.isLoaded("player.png"), "isLoaded('player.png') returns true")
    ok(! assets.isLoaded("test_404.png"), "isLoaded('test_404.png') returns false")
    ok(assets.get("player.png"), "image player.png loaded")
    ok(assets.get("droid_11x15.png"), "image loaded")
    ok(assets.get("rect.png"), "image loaded")
    ok(assets.get("laser.wav"), "audio loaded")
    ok(assets.get("gamedata.json"), "json loaded")
    ok(jaws.isImage(assets.get("rect.png")), "png loaded as Image")
    deepEqual(assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")
    start()
  }
});

