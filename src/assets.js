var jaws = (function(jaws) {

/** 
 * @class loads and processes assets as images, sound, video, json
 * Used internally by JawsJS to create *jaws.assets*
 */
jaws.Assets = function() {
  this.loaded = []    // Hash of all URLs that's been loaded
  this.loading = []   // Hash of all URLs currently loading
  this.src_list = []  // Hash of all unloaded URLs that loadAll() will try to load
  this.data = []      // Hash of loaded raw asset data, URLs are keys

  this.image_to_canvas = true
  this.fuchia_to_transparent = true
  this.root = ""

  this.file_type = {}
  this.file_type["json"] = "json"
  this.file_type["wav"] = "audio"
  this.file_type["mp3"] = "audio"
  this.file_type["ogg"] = "audio"
  this.file_type["png"] = "image"
  this.file_type["jpg"] = "image"
  this.file_type["jpeg"] = "image"
  this.file_type["gif"] = "image"
  this.file_type["bmp"] = "image"
  this.file_type["tiff"] = "image"
  var that = this

  this.length = function() {
    return this.src_list.length
  }

  /* 
   * Get one or many resources
   *
   * @param   String or Array of strings
   * @returns The raw resource or an array of resources
   *
   */
  this.get = function(src) {
    if(jaws.isArray(src)) {
      return src.map( function(i) { return that.data[i] } )
    }
    else {
      if(this.loaded[src])  { return this.data[src] }
      else                  { jaws.log("No such asset: " + src) }
    }
  }
  
  this.isLoading = function(src) {
    return this.loading[src]
  }
  
  this.isLoaded = function(src) {
    return this.loaded[src]
  }
  
  this.getPostfix = function(src) {
    postfix_regexp = /\.([a-zA-Z]+)/;
    return postfix_regexp.exec(src)[1]
  }

  this.getType = function(src) {
    var postfix = this.getPostfix(src)
    return (this.file_type[postfix] ? this.file_type[postfix] : postfix)
  }
  
  /** Add array of paths or single path to asset-list. Later load with loadAll() */
  this.add = function(src) {
    if(jaws.isArray(src)) { for(var i=0; src[i]; i++) { this.add(src[i]) } }
    else                  { src = this.root + src; this.src_list.push(src) }
    return this
  }
 
  /** Load all pre-specified assets */
  this.loadAll = function(options) {
    this.load_count = 0
    this.error_count = 0

    /* With these 3 callbacks you can display progress and act when all assets are loaded */
    this.onload = options.onload
    this.onerror = options.onerror
    this.onfinish = options.onfinish

    for(i=0; this.src_list[i]; i++) { 
      this.load(this.src_list[i])
    }
  }

  /** Calls onload right away if asset is available since before, otherwise try to load it */
  this.getOrLoad = function(src, onload, onerror) {
    if(this.data[src]) { onload() }
    else { this.load(src, onload, onerror) }
  }

  /** Load one asset-object, i.e: {src: "foo.png"} */
  this.load = function(src, onload, onerror) {
    var asset = {}
    asset.src = src
    asset.onload = onload
    asset.onerror = onerror
    this.loading[src] = true

    switch(this.getType(asset.src)) {
      case "image":
        var src = asset.src + "?" + parseInt(Math.random()*10000000)
        asset.image = new Image()
        asset.image.asset = asset // enables us to access asset in the callback
        asset.image.onload = this.assetLoaded
        asset.image.onerror = this.assetError
        asset.image.src = src
        break;
      case "audio":
        var src = asset.src + "?" + parseInt(Math.random()*10000000)
        asset.audio = new Audio(src)
        asset.audio.asset = asset         // enables us access asset in the callback
        this.data[asset.src] = asset.audio
        asset.audio.addEventListener("canplay", this.assetLoaded, false);
        asset.audio.addEventListener("error", this.assetError, false);
        asset.audio.load()
        break;
      default:
        var src = asset.src + "?" + parseInt(Math.random()*10000000)
        var req = new XMLHttpRequest()
        req.asset = asset         // enables us access asset in the callback
        req.onreadystatechange = this.assetLoaded
        req.open('GET', src, true)
        req.send(null)
        break;
    }
  }

  /**
   * Callback for all asset-loading.
   * 1) Parse data depending on filetype. Images are (optionally) converted to canvas-objects. json are parsed into native objects and so on.
   * 2) Save processed data in internal list for easy fetching with assets.get(src) later on
   * 3) Call callbacks if defined
   * @private
   */
  this.assetLoaded = function(e) {
    var asset = this.asset
    var src = asset.src
    var filetype = that.getType(asset.src)
    
    // Keep loading and loaded hash up to date
    that.loaded[src] = true
    that.loading[src] = false

    // Process data depending differently on postfix
    if(filetype == "json") {
      if (this.readyState != 4) { return }
      that.data[asset.src] = JSON.parse(this.responseText)
    }
    else if(filetype == "image") {
      var new_image = that.image_to_canvas ? imageToCanvas(asset.image) : asset.image
      if(that.fuchia_to_transparent && that.getPostfix(asset.src) == "bmp") { new_image = fuchiaToTransparent(new_image) }
      that.data[asset.src] = new_image
    }
    else if(filetype == "audio") {
      asset.audio.removeEventListener("canplay", that.assetLoaded, false);
      that.data[asset.src] = asset.audio
    }
    
    that.load_count++
    if(asset.onload)  { asset.onload() }  // single asset load()-callback
    that.processCallbacks(asset)
  }

  this.assetError = function(e) {
    var asset = this.asset
    that.error_count++
    if(asset.onerror)  { asset.onerror(asset) }
    that.processCallbacks(asset)
  }

  this.processCallbacks = function(asset) {
    var percent = parseInt( (that.load_count+that.error_count) / that.src_list.length * 100)
    if(that.onload)  { that.onload(asset.src, percent) } // loadAll() - single asset has loaded callback
    
    // When loadAll() is 100%, call onfinish() and kill callbacks (reset with next loadAll()-call)
    if(percent==100) { 
      if(that.onfinish) { that.onfinish() }
      that.onload = null
      that.onerror = null
      that.onfinish = null
    }         
  }
}

/**
 * Takes an image, returns a canvas.
 * Benchmarks has proven canvas to be faster to work with then images.
 * Returns: a canvas
 */
function imageToCanvas(image) {
  var canvas = document.createElement("canvas")
  canvas.src = image.src        // Make canvas look more like an image
  canvas.width = image.width
  canvas.height = image.height

  var context = canvas.getContext("2d")
  context.drawImage(image, 0, 0, image.width, image.height)
  return canvas
}

/** 
 * Make Fuchia (0xFF00FF) transparent
 * This is the de-facto standard way to do transparency in BMPs
 * Returns: a canvas
 */
function fuchiaToTransparent(image) {
  canvas = jaws.isImage(image) ? imageToCanvas(image) : image
  var context = canvas.getContext("2d")
  var img_data = context.getImageData(0,0,canvas.width,canvas.height)
  var pixels = img_data.data
  for(var i = 0; i < pixels.length; i += 4) {
    if(pixels[i]==255 && pixels[i+1]==0 && pixels[i+2]==255) { // Color: Fuchia
      pixels[i+3] = 0 // Set total see-through transparency
    }
  }
  context.putImageData(img_data,0,0);
  return canvas
}

/** Scale image by factor and keep jaggy retro-borders */
function retroScale(image, factor) {
  canvas = jaws.isImage(image) ? imageToCanvas(image) : image
  var context = canvas.getContext("2d")
  var img_data = context.getImageData(0,0,canvas.width,canvas.height)
  var pixels = img_data.data

  var canvas2 = document.createElement("canvas")
  canvas2.width = image.width * factor
  canvas2.height = image.height * factor
  var context2 = canvas.getContext("2d")
  var img_data2 = context2.getImageData(0,0,canvas2.width,canvas2.height)
  var pixels2 = img_data2.data

  for (var x = 0; x < canvas.width * factor; x++) { 
    for (var y = 0; y < canvas.height * factor; y++) { 
      pixels2[x*y] = pixels[x*y / factor]
      pixels2[x*y+1] = pixels[x*y+1 / factor]
      pixels2[x*y+2] = pixels[x*y+2 / factor]
      pixels2[x*y+3] = pixels[x*y+3 / factor]
    } 
  }

  context2.putImageData(img_data2,0,0);
  return canvas2
}

jaws.assets = new jaws.Assets()

return jaws;
})(jaws || {});

