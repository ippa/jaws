(function() {

  // The following line is taken from: https://github.com/chriso/load.js - Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed.
  function loadScript(a,b,c){var d=document.createElement("script");d.type="text/javascript",d.src=a,d.onload=b,d.onerror=c,d.onreadystatechange=function(){var a=this.readyState;if(a==="loaded"||a==="complete")d.onreadystatechange=null,b()},head.insertBefore(d,head.firstChild)}(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this),addMethod("load",function(a,b){for(var c=[],d=0;d<b;d++)(function(b){c.push(function(c,d){loadScript(a[b],c,d)})})(d);this.call("run",c)});var head=document.getElementsByTagName("head")[0]||document.documentElement

  /*
  * Find directory of this file (jaws-dynamic.js).
  * Then use it as root-dir and load all source-files from subdirectory "src".
  */
  var scripts = document.getElementsByTagName('script')
  var path = scripts[scripts.length-1].src.split('?')[0]
  var root = path.split('/').slice(0, -1).join('/') + '/src/'

  jaws = {}
   load(root+"core.js")
  .then(root+"sprite.js")
  .then(root+"input.js", 
        root+"assets.js", 
        root+"game_loop.js", 
        root+"rect.js", 
        root+"sprite_sheet.js",
        root+"animation.js",
        root+"viewport.js",
        root+"collision_detection.js",
        root+"text.js",
        root+"parallax.js",
        root+"tile_map.js",
        root+"quadtree.js",
        root+"pixel_map.js",
        root+"extras/tile_map_pathfinding.js",
        root+"extras/sprite_list.js",
        root+"extras/audio.js"
        )
  .thenRun(function () {
    /*
     * We can't rely on window.onload-callback in our game when using javascript loaders.
     * window.onload callback won't wait for dynamically inserted <script>-tags to finish before executing.
     *
     * Instead we have to use the jaws.onload-callback when loading Jaws through jaws-dynamic.js.
     * Here we call it as the very last thing we do after all the jaws-components are loaded.
     */
    if(jaws.onload) { jaws.onload() }
  });

})();

