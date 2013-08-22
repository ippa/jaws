module("Audio");

test("Audio defaults", function() {
  var audio = new jaws.Audio({});
  deepEqual(audio.audio, null, "audio defaults to null");
  deepEqual(audio.autoplay, false, "autoplay defaults to false");
  deepEqual(audio.loop, false, "loop defaults to false");
  deepEqual(audio.volume, 0, "volume defaults to 0");
  deepEqual(audio.onend, null, "onend defaults to null");
  deepEqual(audio.onplay, null, "onplay defaults to null");
  deepEqual(audio.onpause, null, "onpause defaults to null");
});

test("Audio", function() {
  jaws.assets.root = "assets/";
  jaws.assets.add("tones.aac");
  jaws.assets.add("tones.flac");
  jaws.assets.add("tones.mka");
  jaws.assets.add("tones.mp3");
  jaws.assets.add("tones.ogg");
  jaws.assets.add("tones.wav");
  jaws.assets.loadAll({onfinish: assetsLoaded});
  stop();

  function assetsLoaded() {

    var audio = new jaws.Audio({audio: 5});
    equal(audio.audio, null, "Invalid (non-string) constructor value defaults 'audio' to null");

    audio = new jaws.Audio({audio: []});
    equal(audio.audio, null, "Invalid (empty array) constructor value defaults 'audio' to null");

    audio = new jaws.Audio({volume: 1.0});
    equal(audio.volume, 1.0, "Constructor volume value is set to 1.0");

    var audio3 = new jaws.Audio({
      audio: ["tones.aac", "tones.flac", "tones.mka",
        "tones.mp3", "tones.ogg", "tones.wav"]
    });
    
    if (audio3.isLoaded()) {
      equal(audio3.isLoaded(), true, "The 'audio' property is an Audio object");
      
      audio3.setVolume(1.0);
      equal(audio3.audio.volume, 1, "The volume was set to 1");

      audio3.mute();
      equal(audio3.audio.mute, true, "The audio was muted");

      audio3.unmute();
      equal(audio3.audio.mute, false, "The audio was unmuted");

      audio3.seekTo(0.1);
      equal(audio3.audio.currentTime, 0.1, "The currentTime was moved to 0.1");
    } else {
      equal(audio.audio, null, "No audio was loaded");
    }

    start();

  }
});