module("Assets")

test("json assets, onload-callback", function() {
  var assets = new jaws.Assets()
  assets.setRoot("assets/").add("gamedata.json").loadAll({onload: loaded})
  stop()
  function loaded() {
    deepEqual(assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")
    deepEqual(assets.get("gamedata.json").mode, "angry", "jsondata got parsed into an object")
    start();
  }
});
test("Image assets", function() {
  var assets = new jaws.Assets();
  assets.setRoot("assets/").add(["block_10x10.bmp", "player.png"]).loadAll({onload: loaded})
  stop();

  function loaded() {
    ok( assets.get("block_10x10.bmp"), "BMP loaded")
    ok( assets.get("player.png"), "PNG loaded")
    start();
  }
});

test("audio assets", function() {
  if(!window["Audio"])  expect(0);  // For headless tests, don't expect any tests to be run if there's no audio-support
  
  stop(); 
  jaws.log.use_console = true;
  var assets = new jaws.Assets()
  assets.setRoot("assets/").add(["tones.ogg", "tones.mp3", "tones.wav", "tones.mka", "tones.flac"])
  assets.loadAll({onload: loaded});

  function loaded() {
    if(is_ie) {
      ok( !assets.can_play["ogg"], "ie doesn't support ogg")
      ok( !assets.get("tones.ogg"), "ie didn't fetch tones.ogg")
    }
    if(is_chrome) {
      ok( assets.can_play["ogg"], "chrome supports ogg")
      ok( assets.can_play["mp3"], "chrome supports ogg")
      ok( assets.get("tones.ogg"), "chrome fetched tones.ogg");
      ok( assets.get("tones.mp3"), "chrome fetched tones.mp3");
      ok( !assets.get("tones.flac"), "chrome didn't fetch tones.flac");
    }
    if(is_ff) {
      ok( assets.get("tones.ogg"), "ff fetched tones.ogg");
      ok( assets.get("tones.wav"), "ff fetched tones.wav");
    }
    start();
  };
});

test("audio wildcard assets", function() {
  if(!window["Audio"])  expect(0);  // For headless tests, don't expect any tests to be run if there's no audio-support
  
  stop(); 
  jaws.log.use_console = true;
  var assets = new jaws.Assets()
  assets.root = "assets/";
  assets.add(["tones.flac", "tones.mp3", "tones.ogg"])
  assets.loadAll({onload: loaded});

  function loaded() {
    var asset = assets.get("tones.*")
    if(is_chrome) {
      equal( jaws.assets.getPostfix(asset.src), "mp3", "chrome fetched tones.mp3");
    }
    if(is_ff) {
      equal( jaws.assets.getPostfix(asset.src), "mp3", "ff fetched tones.mp3");
    }
    if(is_ie) {
      equal( jaws.assets.getPostfix(asset.src), "mp3", "ie fetched tones.mp3");
    }

    start();
  };

});

/*
test("assets.load()", function() {
  stop()
  var assets = new jaws.Assets()
  assets.root = "assets/"
  var load = function() { ok(jaws.assets.get("rect.png"), "load-callback loaded image"); start() }
  var error = function() { ok(false, "error callback doesn't get called"); start() } 
  assets.load("rect.png", {onload: load, onerror: error});     
});
*/

test("image asset with 404s", function() {
  stop()
  var assets = new jaws.Assets()
  assets.root = "assets/"
  assets.add("droid_11x15.png")
  assets.add("test_404.png")
  assets.image_to_canvas = true
  assets.loadAll({onload: assetsLoaded})
  
  function assetsLoaded() {
    ok(jaws.isCanvas(assets.get("droid_11x15.png")), "png loaded as Canvas")
    start()
   }
});

test("assets json", function() {
  stop()
  var assets = new jaws.Assets()
  assets.setRoot("assets/").add("gamedata.json").loadAll({onload: loaded})
  function loaded() {
    ok(assets.get("gamedata.json"), "json got loaded")
    equal(assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")
    start()
  }
});

test("assets.loadAll()", function() {
  stop()
  var assets = new jaws.Assets()
  assets.fuchia_to_transparent = true
  assets.image_to_canvas = false
  assets.root = "assets/"
  assets.add("droid_11x15.png","block_10x10.bmp");
  assets.add("gamedata.json")
  assets.add("player.png")
  assets.add(["rect.png", "laser.wav"])
  assets.loadAll({onload: assetsLoaded})
  
  function assetsLoaded() {
    ok(1, "onload()-callback was called")
    ok(assets.isLoaded("player.png"), "isLoaded('player.png') returns true")
    ok(! assets.isLoaded("test_404.png"), "isLoaded('test_404.png') returns false")
    ok(assets.get("player.png"), "image player.png loaded")
    ok(assets.get("droid_11x15.png"), "image loaded")
    ok(assets.get("rect.png"), "image loaded")

    /* IE doesn't support WAV, crazy. */
    if(is_ie) ok( !assets.get("laser.wav"), "laser.wav isn't loaded in IE");
    else      ok( assets.get("laser.wav"), "laser.wav is supported in non-IE browsers");

    ok(assets.get("gamedata.json"), "json loaded")
    equal(assets.get("gamedata.json").type, "Troll", "jsondata got parsed into an object")

    ok(jaws.isImage(assets.get("rect.png")), "PNG loaded as Image")
    ok(!jaws.isImage(assets.get("block_10x10.bmp")), "BMPs are converted to canva to do fuchia -> transparent")
    ok(jaws.isDrawable(assets.get("block_10x10.bmp")), "BMPs returned as Canvas (drawable)")
    ok(jaws.isCanvas(assets.get("block_10x10.bmp")), "BMPs returned as Canvas (drawable)")
    
    start()
  }
});

