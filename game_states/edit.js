var jaws = (function(jaws) {

if(!jaws.game_states) jaws.game_states = {}

/**
 *
 * jaws game state to edit/move Sprite's around
 * This is NOT included in jaws.js, jaws-min.js or jaws-dynamic.js and must be loaded separately if needed.
 * See example10.html for a demo
 *
 * @property {string} title use this as key when saving game_object properties to localStorage, defaults to current url
 * @property {bool} snap_to_grid snap all game objects to predifned grid
 * @property {array} grid_size size of grid, mostly make sense with snap_to_grid set to true and TileMap() later on
 * @property {array} game_objects game_objects to paint and modify on screen
 * @property {function} on_exit callback to execute when editor exists. Can be used to persist the new state.
 * @property {string} url use url to POST game objects to when saving and GET to load. Sends and expects array of JSON as payload.
 *
 */
jaws.game_states.Edit = function(options) {
  if(! options ) options = {};
  
  this.game_objects = options.game_objects || []
  var constructors = jaws.forceArray(options.constructors || [])
  var grid_size = options.grid_size || [32,32]
  var snap_to_grid = (options.snap_to_grid !== undefined) ? options.snap_to_grid : true
  var track_modified = (options.track_modified !== undefined) ? options.track_modified : true
  var on_exit = options.on_exit
  var title = options.title || window.location.href
  var isometric = options.isometric
  var url = options.url
  
  if(isometric) {
    grid_size[0] = parseInt(grid_size[0] / 2 - 0.5)
    grid_size[1] = parseInt(grid_size[1] / 2 - 0.5)
  }
  
  var that = this
  var viewport
  var icons
  var click_at
  var edit_tag
  var cursor_object 
  var objects_dragged
  var toolbar_canvas = document.getElementById("jaws-toolbar")
  var toolbar_context;
  var recently_clicked_object;

  function cloneObject(object) {
    if(!object) return undefined;
    var constructor = object._constructor ? eval(object._constructor) : object.constructor
    var new_object = new constructor( object.attributes() );
    new_object._constructor = object._constructor || object.constructor.name

    if(new_object.update) new_object.update(); 
    new_object.context = jaws.context  // Always paint newly cloned object in default game window

    return new_object
  }

  function toolbar_mousedown(e) {
    // event = (e) ? e : window.event
    var x = (e.pageX || e.clientX);
    var y = (e.pageY || e.clientY);
    x -= toolbar_canvas.offsetLeft;
    y -= toolbar_canvas.offsetTop;

    var clicked_icon = iconAt(x, y)
    if(clicked_icon) {
      cursor_object = cloneObject(clicked_icon)
      return false;
    }
  }
  function iconAt(x, y) {
    console.log("iconAt()", x, "/", y)
    return icons.filter( function(obj) { return obj.rect().collidePoint(x, y) })[0]
  }

  function mousedown(e) {
    var code = ( e.keyCode ? e.keyCode : e.which )
    
    if(code === 3)  right_mousedown();
    else            left_mousedown();

    e.preventDefault();
    return false;
  }

  function right_mousedown() {
    cursor_object = cloneObject( gameObjectAt( mouseX(), mouseY() ) )
  }

  function left_mousedown() {
    click_at = [mouseX(), mouseY()]
         
    var clicked_object = gameObjectAt(mouseX(), mouseY())
    if(clicked_object) {
      if(!jaws.pressed("ctrl") && !jaws.pressed("shift")) {
        deselect(that.game_objects);
        select(clicked_object);
      }
      cursor_object = undefined
      objects_dragged = false

      // Detect double clicks on objects and call enter_data() to enter custom data
      if(recently_clicked_object) { 
        click_at = false
        enter_data(clicked_object) 
      }
      recently_clicked_object = clicked_object
      setTimeout( function() { recently_clicked_object = undefined; }, 300)
    }
    else { 
      deselect(that.game_objects);
      paintWithCursor(); 
    }
  }
  
  function mouseup(e) {
    click_at = undefined
    
    if(grid_size && snap_to_grid) that.game_objects.filter(isSelected).forEach(snapToGrid);
    var clicked_object = gameObjectAt(mouseX(), mouseY())

    if(!objects_dragged) {
      if(jaws.pressed("shift")) { 
        that.game_objects.forEach( function(item) { 
          if(clicked_object.attributes().image === item.attributes().image) toggle(item);
        });
      }
      else {
        jaws.pressed("ctrl") ? toggle(clicked_object) : select(clicked_object)
      }
    }
    objects_dragged = false
  }

  function mousemove(e) {
    if(cursor_object) {
      cursor_object.x = mouseX()
      cursor_object.y = mouseY()
    }

    if(click_at) {
      
      if(that.game_objects.filter(isSelected).length > 0) {  // Do we have selected game objects?
        objects_dragged = true
        that.game_objects.filter(isSelected).forEach( function(element, index) {
          element.move(mouseX() - click_at[0], mouseY() - click_at[1])
          if(track_modified) element.modified = true;
        });
        click_at = [mouseX(), mouseY()]
      }
      
      else if(viewport) {  // No selected game objects, scroll viewport if any
        viewport.x = click_at[0] - jaws.mouse_x
        viewport.y = click_at[1] - jaws.mouse_y
        viewport.verifyPosition();
      }
    }
  }

  function mousewheel(e) {
    var delta
    if(e.wheelDelta ) delta = e.wheelDelta/120;
    if(e.detail     ) delta = -e.detail/3;

    that.game_objects.filter(isSelected).forEach( function(element, index) { 
      element.z += delta*4 
      if(track_modified) element.modified = true;
    })
    //jaws.log("scroll by: " + delta)
  }

  function enter_data(game_object) {
    /* Let's do the simplest possible thing that could work for now, prompt() :) */
    var name = prompt("Add data to object, name of property?")
    if(name) {
      var value = prompt("Value of \"" + name + "\"?")
      if(value) {
        if(!game_object.data)  game_object.data = {};
        game_object.data[name] = value
      }
    }
  }

  function snapToGrid(object) {
    object.x -= object.x % grid_size[0]
    object.y -= object.y % grid_size[1]
  }
  function paintWithCursor() {
    if(!cursor_object) return;

    new_object = cloneObject(cursor_object)
    if(snap_to_grid) {
      new_object.x -= new_object.x % grid_size[0]
      new_object.y -= new_object.y % grid_size[1]
    }
    that.game_objects.push(new_object)
  }

  function forceArray(obj)                { if(!obj) return []; return obj.forEach ? obj : [obj] }
  function isSelected(element, index)     { return element.selected == true }
  function isNotSelected(element, index)  { return !isSelected(element) }
  function drawRect(element, index)       { element.rect().draw() }
  function drawIsometricRect(element, index) { 
    var r = element.rect()
    var c1 = [r.x + r.width/2, r.y]
    var c2 = [r.right, r.y + r.height/2]
    var c3 = [r.x + r.width/2, r.bottom]
    var c4 = [r.x, r.y + r.height/2]

    jaws.context.beginPath();
    jaws.context.strokeStyle = "red";
    jaws.context.moveTo(c1[0], c1[1])
    jaws.context.lineTo(c2[0], c2[1])
    jaws.context.lineTo(c3[0], c3[1])
    jaws.context.lineTo(c4[0], c4[1])
    jaws.context.closePath();
    jaws.context.stroke();
  }

  function select(obj) {
    forceArray(obj).forEach( function(element, index) { element.selected = true } )
  }
  function deselect(obj) {
    forceArray(obj).forEach( function(element, index) { element.selected = false } )
  }
  function toggle(obj) {
    forceArray(obj).forEach( function(element, index) { element.selected = element.selected ? false : true } )
  }

  function gameObjectAt(x, y) {
    return that.game_objects.filter( function(obj) { 
      try {
        return obj.rect().collidePoint(x, y) 
      }
      catch(err) {
        return false
      }
    })[0]
  }

  function removeSelected() {
    that.game_objects.filter(isSelected).forEach( function(element, index) {
      var i = that.game_objects.indexOf(element)
      if(i > -1) { that.game_objects.splice(i, 1) }
    });
  }

  /* Remove all event-listeners, hide edit_tag and switch back to previous game state */
  this.exit = function() {
    if(on_exit) on_exit();

    toolbar_canvas.parentNode.removeChild(toolbar_canvas)
    edit_tag.style.display = "none"
    jaws.canvas.removeEventListener("mousedown", mousedown, false)
    jaws.canvas.removeEventListener("mouseup", mouseup, false)
    jaws.canvas.removeEventListener("mousemove", mousemove, false)
    jaws.canvas.removeEventListener("mousewheel", mousewheel, false)
    jaws.canvas.removeEventListener("DOMMouseSCroll", mousewheel, false)
    jaws.switchGameState(jaws.previous_game_state, {setup: false})
  }

  this.save = function() {
    var data = "[" + that.game_objects.map( function(game_object) { return game_object.toJSON() }) + "]";

    if(url) {
      data = "game_objects=" + data
      var req = new XMLHttpRequest()
      req.open("POST", url, true)      
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      data ? req.send(data) : req.send(null)
      log("Posted game objects to url: " + url)
    }
    else {
      localStorage[title] = data
      log("Saved game objects to localStorage")
    }
  }
  
  function add() {
    var constructor = prompt("Enter constructor to create new object from")
    constructor = eval(constructor)
    
    var data = prompt("Enter JSON initialize data, example: { \"image\" : \"block.bmp\" } ")
    data = JSON.parse(data||"{}")
    var object = new constructor(data)
    that.game_objects.push(object)
  }

  function up()     { scrollUp() }
  function right()  { scrollRight() }
  function down()   { scrollDown() }
  function left()   { scrollLeft() }
  function pageup()     { if(viewport) viewport.move(0, -viewport.height/2) }
  function pagedown()   { if(viewport) viewport.move(0, viewport.height/2) }
  function home()       { if(viewport) viewport.moveTo(undefined, 0) }
  function end()        { if(viewport) viewport.moveTo(undefined, viewport.max_y) }

  function bigRight()  { if(viewport) viewport.move(grid_size[0]*10, 0); }
  function bigLeft()   { if(viewport) viewport.move(-grid_size[0]*10, 0); }
  function bigUp()     { if(viewport) viewport.move(0, -grid_size[1]*10); }
  function bigDown()   { if(viewport) viewport.move(0, grid_size[1]*10); }
 
  function scrollRight()  { if(viewport)  viewport.move(grid_size[0], 0); }
  function scrollLeft()   { if(viewport)  viewport.move(-grid_size[0], 0); }
  function scrollUp()     { if(viewport)  viewport.move(0, -grid_size[1]); }
  function scrollDown()   { if(viewport)  viewport.move(0, grid_size[1]); }
  
  function fillToolbar(toolbar_context) {
    icons = []

    var x = 0
    var y = 32
    constructors.forEach( function(constructor) {
      var icon = new constructor({x: x, y: y, context: toolbar_context})
      icon.setBottom(y)
      icon._constructor = constructor.name
      if(icon.update) icon.update();
      icons.push( icon )
      x += icon.width + 10
    });
  }

  this.setup = function() {
    viewport = options.viewport || jaws.previous_game_state.viewport

    if(!toolbar_canvas) {
      toolbar_canvas = document.createElement("canvas");
      toolbar_canvas.width = jaws.width;
      toolbar_canvas.height = 100;
      toolbar_canvas.id = "jaws-toolbar";
      
      toolbar_context = toolbar_canvas.getContext("2d");
      toolbar_context.fillStyle = "black";
      toolbar_context.fillRect(0, 0, toolbar_canvas.width, toolbar_canvas.height);
      document.body.appendChild(toolbar_canvas);
    }
    fillToolbar(toolbar_context)

    edit_tag = document.getElementById("jaws-edit")
    if(!edit_tag) {
      edit_tag = document.createElement("div")
      edit_tag.id = "jaws-edit"
      document.body.appendChild(edit_tag)
    }
    edit_tag.style.display = "block"

    // Disable right click
    window.oncontextmenu = function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    jaws.log("Editor activated!")
    jaws.preventDefaultKeys("left", "right", "up", "down", "ctrl", "f1", "f2", "home", "end", "pageup", "pagedown", "w", "a", "s", "d", "p")
    jaws.on_keydown(["f2","esc"], this.exit )
    jaws.on_keydown("delete",     removeSelected )
    jaws.on_keydown("add", add )
    jaws.on_keydown("pageup", pageup )
    jaws.on_keydown("pagedown", pagedown )
    jaws.on_keydown("home", home )
    jaws.on_keydown("end", end )

    toolbar_canvas.addEventListener("mousedown", toolbar_mousedown, false)
    jaws.canvas.addEventListener("mousedown", mousedown, false)
    jaws.canvas.addEventListener("mouseup", mouseup, false)
    jaws.canvas.addEventListener("mousemove", mousemove, false)
    jaws.canvas.addEventListener("mousewheel", mousewheel, false)
    jaws.canvas.addEventListener("DOMMouseSCroll", mousewheel, false)
  }

  this.update = function() {
    log(mouseX() + " / " + mouseY())
    if(viewport) log(viewport.toString(), true);

    var selected_objects = that.game_objects.filter(isSelected)
    if(selected_objects.length == 1) {
      log(selected_objects[0].toString(), true)
    }
    else {
      log(selected_objects.length + " selected objects", true)
    }

    if(jaws.pressed("left"))   left();
    if(jaws.pressed("right"))  right();
    if(jaws.pressed("up"))     up();
    if(jaws.pressed("down"))   down();
    if(jaws.pressed("a"))      bigLeft();
    if(jaws.pressed("d"))      bigRight();
    if(jaws.pressed("w"))      bigUp();
    if(jaws.pressed("s"))      bigDown();

    if(jaws.pressedWithoutRepeat("p", true)) this.save();

    if(cursor_object) log(cursor_object.toString());
  }
  
 
  this.draw = function() {
    jaws.previous_game_state.draw()
    if(grid_size) { drawGrid() }
    
    function draw() { 
      if(cursor_object) { cursor_object.draw(); }
      if(isometric) that.game_objects.filter(isSelected).forEach(drawIsometricRect);
      else          that.game_objects.filter(isSelected).forEach(drawRect);
    }
    if(viewport)  viewport.apply(draw);
    else          draw();

    jaws.draw(icons)
  }

  function mouseX() {
    var mouse_x = jaws.mouse_x
    if(viewport) { mouse_x += viewport.x }
    return mouse_x
  }
  function mouseY() {
    var mouse_y = jaws.mouse_y
    if(viewport) { mouse_y += viewport.y }
    return mouse_y
  }

  function log(string, append) {
    if(append)  edit_tag.innerHTML += string + "<br />";
    else        edit_tag.innerHTML = string + "<br />";
  }


  function drawGrid() {
    jaws.context.save();
    jaws.context.strokeStyle = "rgba(0,0,255,0.3)";
    jaws.context.beginPath()

    if(isometric) drawIsometricGrid();
    else          drawOrthogonalGrid();

    jaws.context.closePath()
    jaws.context.stroke()
    jaws.context.restore()
  }

  function drawIsometricGrid() {
    for(var x = -grid_size[0] * 50; x < jaws.width; x += grid_size[0]*2) {
      jaws.context.moveTo(x, 0)
      jaws.context.lineTo(x + jaws.height*2, jaws.height)
    }
    for(var x = 0; x < jaws.width * 10; x += grid_size[0]*2) {
      jaws.context.moveTo(x, 0)
      jaws.context.lineTo(x - jaws.height*2, jaws.height)
    }
  }

  function drawOrthogonalGrid() {
    for(var x =- 0.5; x < jaws.width; x+=grid_size[0]) {
      jaws.context.moveTo(x, 0)
      jaws.context.lineTo(x, jaws.height)
    }
    for(var y =- 0.5; y < jaws.height; y+=grid_size[1]) {
      jaws.context.moveTo(0, y)
      jaws.context.lineTo(jaws.width, y)
    }
  }

}

return jaws;
})(jaws || {});
