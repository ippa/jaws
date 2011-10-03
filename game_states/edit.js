var jaws = (function(jaws) {

if(!jaws.game_states) jaws.game_states = {}

/**
 *
 * jaws game state to edit/move Sprite's around
 * This is NOT included in jaws.js, jaws-min.js or jaws-dynamic.js and must be loaded separately if needed.
 * See example10.html for a demo
 *
 * @property {string} title use this as key when saving game_object properties to localStorage, defaults to current url
 * @property snap_to_grid snap all game objects to predifned grid
 * @property {array} grid_size size of grid, mostly make sense with snap_to_grid set to true and TileMap() later on
 * @property {array} game_objects game_objects to paint and modify on screen
 * @property {string} url use url to POST game objects to when saving and GET to load. Sends and expects array of JSON as payload.
 *
 */
jaws.game_states.Edit = function(options) {
  if(! options ) options = {};
  var game_objects = options.game_objects || []
  var constructors = jaws.forceArray(options.constructors || [])
  var grid_size = options.grid_size || [32,32]
  var snap_to_grid = options.snap_to_grid || true
  var track_modified = options.track_modified || true
  var title = options.title || window.location.href
  var url = options.url

  var viewport
  var icons

  var that = this
  var click_at
  var edit_tag
  var cursor_object 
  var objects_dragged
  
  function cloneObject(object) {
    if(!object) return undefined;
    var constructor = object._constructor ? eval(object._constructor) : object.constructor
    var new_object = new constructor( object.attributes() );
    new_object._constructor = object._constructor || object.constructor.name
    if(new_object.update) new_object.update(); 
    return new_object
  }

  function mousedown(e) {
    var code = ( e.keyCode ? e.keyCode : e.which )
    if(code === 3) {  // Right mouse button
      cursor_object = cloneObject( gameObjectAt( mouseX(), mouseY() ) )
    }
    else {
      click_at = [mouseX(), mouseY()]
     
      var clicked_icon = iconAt(jaws.mouse_x, jaws.mouse_y)
      if(clicked_icon) {
        cursor_object = cloneObject(clicked_icon)
        return false;
      }
      
      var clicked_object = gameObjectAt(mouseX(), mouseY())
      if(clicked_object) {
        if(!jaws.pressed("ctrl") && !jaws.pressed("shift")) {
          deselect(game_objects);
          select(clicked_object);
        }
        cursor_object = undefined
        objects_dragged = false
      }
      else { 
        deselect(game_objects);
        paintWithCursor(); 
      }
    }
    e.preventDefault();
    return false;
  }
  
  function mouseup(e) {
    click_at = undefined
    
    if(grid_size && snap_to_grid) game_objects.filter(isSelected).forEach(snapToGrid);
    var clicked_object = gameObjectAt(mouseX(), mouseY())

    if(!objects_dragged) {
      if(jaws.pressed("shift")) { 
        game_objects.forEach( function(item) { 
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
      
      if(game_objects.filter(isSelected).length > 0) {  // Do we have selected game objects?
        objects_dragged = true
        game_objects.filter(isSelected).forEach( function(element, index) {
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

    game_objects.filter(isSelected).forEach( function(element, index) { 
      element.z += delta*4 
      if(track_modified) element.modified = true;
    })
    //jaws.log("scroll by: " + delta)
  }

  function snapToGrid(object) {
    object.x -= object.x % grid_size[0]
    object.y -= object.y % grid_size[1]
  }
  function paintWithCursor() {
    if(!cursor_object) return;

    new_object = cloneObject(cursor_object)
    new_object.x -= new_object.x % grid_size[0]
    new_object.y -= new_object.y % grid_size[1]
    game_objects.push(new_object) 
  }

  function forceArray(obj)                { if(!obj) return []; return obj.forEach ? obj : [obj] }
  function isSelected(element, index)     { return element.selected == true }
  function isNotSelected(element, index)  { return !isSelected(element) }
  function drawRect(element, index)       { element.rect().draw() }
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
    return game_objects.filter( function(obj) { return obj.rect().collidePoint(x, y) } )[0]
  }
  function iconAt(x, y) {
    return icons.filter( function(obj) { return obj.rect().collidePoint(x, y) } )[0]
  }

  function removeSelected() {
    game_objects.filter(isSelected).forEach( function(element, index) {
      game_objects.remove( element )
    });
  }

  /* Remove all event-listeners, hide edit_tag and switch back to previous game state */
  function exit() {
    edit_tag.style.display = "none"
    jaws.canvas.removeEventListener("mousedown", mousedown, false)
    jaws.canvas.removeEventListener("mouseup", mouseup, false)
    jaws.canvas.removeEventListener("mousemove", mousemove, false)
    jaws.canvas.removeEventListener("mousewheel", mousewheel, false)
    jaws.canvas.removeEventListener("DOMMouseSCroll", mousewheel, false)
    jaws.switchGameState(jaws.previous_game_state)
  }

  function save() {
    var data = "[" + game_objects.map( function(game_object) { return game_object.toJSON() }) + "]";

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
    game_objects.push(object)
  }

  function up()     { scrollUp() }
  function right()  { scrollRight() }
  function down()   { scrollDown() }
  function left()   { scrollLeft() }

  function scrollRight() {
    if(viewport)  viewport.move(10, 0);
  }
  function scrollLeft() {
    if(viewport)  viewport.move(-10, 0);
  }
  function scrollUp() {
    if(viewport)  viewport.move(0, -10);
  }
  function scrollDown() {
    if(viewport)  viewport.move(0, 10);
  }
  
  function createToolbar() {
    icons = new jaws.SpriteList()

    var x = 32
    var y = 32
    constructors.forEach( function(constructor) {
      var icon = new constructor({x: x, y: y})
      icon.setBottom(y)
      icon._constructor = constructor.name
      if(icon.update) icon.update();
      icons.push( icon )
      x += 32
    });
  }

  this.setup = function() {
    createToolbar()

    edit_tag = document.getElementById("jaws-edit")
    edit_tag.style.display = "block"
    viewport = options.viewport || jaws.previous_game_state.viewport

    // game_objects.push( new Enemy1({x: 300, y: 30}) )

    // Disable right click
    window.oncontextmenu = function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    jaws.log("Editor activated!")
    jaws.preventDefaultKeys(["left", "right", "up", "down", "ctrl", "f1", "f2"])
    jaws.on_keydown(["f2","esc"], exit )
    jaws.on_keydown("s", save )
    jaws.on_keydown("delete",     removeSelected )
    jaws.on_keydown("add", add )
    jaws.on_keydown("left", left )
    jaws.on_keydown("right", right )
    jaws.on_keydown("up", up )
    jaws.on_keydown("down", down )

    jaws.canvas.addEventListener("mousedown", mousedown, false)
    jaws.canvas.addEventListener("mouseup", mouseup, false)
    jaws.canvas.addEventListener("mousemove", mousemove, false)
    jaws.canvas.addEventListener("mousewheel", mousewheel, false)
    jaws.canvas.addEventListener("DOMMouseSCroll", mousewheel, false)
  }

  this.update = function() {
    log(mouseX() + " / " + mouseY())
    if(viewport) log(viewport.toString(), true);

    var selected_objects = game_objects.filter(isSelected)
    if(selected_objects.length == 1) {
      log(selected_objects[0].toString(), true)
    }
    else {
      log(selected_objects.length + " selected objects", true)
    }

    if(cursor_object) log(cursor_object.toString());
  }
  
 
  this.draw = function() {
    jaws.previous_game_state.draw()
    if(grid_size) { draw_grid() }
    
    if(viewport) {
      viewport.apply( function() { 
        if(cursor_object) cursor_object.draw();
        game_objects.filter(isSelected).forEach(drawRect) 
      });
    }
    else { 
      if(cursor_object) cursor_object.draw();
      game_objects.filter(isSelected).forEach(drawRect) 
    }

    icons.forEach( function(icon) { icon.draw(); icon.rect().draw(); });
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

  function draw_grid() {
    jaws.context.save();
    jaws.context.strokeStyle = "rgba(0,0,255,0.3)";
    jaws.context.beginPath()

    for(var x=-0.5; x < jaws.width; x+=grid_size[0]) {
      jaws.context.moveTo(x, 0)
      jaws.context.lineTo(x, jaws.height)
    }
    for(var y=-0.5; y < jaws.height; y+=grid_size[1]) {
      jaws.context.moveTo(0, y)
      jaws.context.lineTo(jaws.width, y)
    }
    jaws.context.closePath()
    jaws.context.stroke()
    jaws.context.restore()
  }

}

return jaws;
})(jaws || {});
