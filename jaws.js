/* Loader from from https://github.com/chriso/load.js */
var head = document.getElementsByTagName('head')[0] || document.documentElement;
function loadScript(src, onload, onerror) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  script.onload = onload;
  script.onerror = onerror;
  script.onreadystatechange = function () {
    var state = this.readyState;
    if (state === 'loaded' || state === 'complete') {
      script.onreadystatechange = null;
      if(onload) { onload(); }
    }
  };
  head.insertBefore(script, head.firstChild);
}

/*
* 
* This loads _all_ jawsjs-related files. Quick way of getting up and running.
* You might not need/use all parts of jaws. You can include invidual files if you want:
*   
*   <script src="/jawsjs/src/core.js"></script>
*   <script src="/jawsjs/src/sprite.js"></script>
*
* Note, core.js is always needed!
*
*/
loadScript("/jawsjs/src/core.js")
loadScript("/jawsjs/src/input.js")
loadScript("/jawsjs/src/assets.js")
loadScript("/jawsjs/src/game_loop.js")
loadScript("/jawsjs/src/rect.js")
loadScript("/jawsjs/src/sprite.js")
loadScript("/jawsjs/src/sprite_sheet.js")
loadScript("/jawsjs/src/parallax.js")
loadScript("/jawsjs/src/animation.js")
loadScript("/jawsjs/src/viewport.js")

