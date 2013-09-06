var jaws = (function(jaws) {

  var pressed_keys = {}
  var previously_pressed_keys = {}
  var keycode_to_string = []
  var on_keydown_callbacks = []
  var on_keyup_callbacks = []
  var mousebuttoncode_to_string = []
  var ie_mousebuttoncode_to_string = []
 
/** @private
 * Map all javascript keycodes to easy-to-remember letters/words
 */
jaws.setupInput = function() {
  var k = []
  
  k[8] = "backspace"
  k[9] = "tab"
  k[13] = "enter"
  k[16] = "shift"
  k[17] = "ctrl"
  k[18] = "alt"
  k[19] = "pause"
  k[20] = "capslock"
  k[27] = "esc"
  k[32] = "space"
  k[33] = "pageup"
  k[34] = "pagedown"
  k[35] = "end"
  k[36] = "home"
  k[37] = "left"
  k[38] = "up"
  k[39] = "right"
  k[40] = "down" 
  k[45] = "insert"
  k[46] = "delete"
  
  k[91] = "left_window_key leftwindowkey"
  k[92] = "right_window_key rightwindowkey"
  k[93] = "select_key selectkey"
  k[106] = "multiply *"
  k[107] = "add plus +"
  k[109] = "subtract minus -"
  k[110] = "decimalpoint"
  k[111] = "divide /"
  
  k[144] = "numlock"
  k[145] = "scrollock"
  k[186] = "semicolon ;"
  k[187] = "equalsign ="
  k[188] = "comma ,"
  k[189] = "dash -"
  k[190] = "period ."
  k[191] = "forwardslash /"
  k[192] = "graveaccent `"
  k[219] = "openbracket ["
  k[220] = "backslash \\"
  k[221] = "closebracket ]"
  k[222] = "singlequote '"
  
  var m = []
  
  m[0] = "left_mouse_button"
  m[1] = "center_mouse_button"
  m[2] = "right_mouse_button"

  var ie_m = [];
  ie_m[1] = "left_mouse_button";
  ie_m[2] = "right_mouse_button";
  ie_m[4] = "center_mouse_button"; 
  
  mousebuttoncode_to_string = m
  ie_mousebuttoncode_to_string = ie_m;


  var numpadkeys = ["numpad0","numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
  var fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
  var numbers = ["0","1","2","3","4","5","6","7","8","9"]
  var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
  for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
  for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
  for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }
  
  keycode_to_string = k

  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)

  var jawswindow = jaws.canvas || jaws.dom
  jawswindow.addEventListener("mousedown", handleMouseDown, false);
  jawswindow.addEventListener("mouseup", handleMouseUp, false);
  jawswindow.addEventListener("touchstart", handleTouchStart, false);
  jawswindow.addEventListener("touchend", handleTouchEnd, false);

  window.addEventListener("blur", resetPressedKeys, false);

  // this turns off the right click context menu which screws up the mouseup event for button 2
  document.oncontextmenu = function() {return false};
}

/** @private
 * Reset input-hash. Called when game is blurred so a key-controlled player doesn't keep on moving when the game isn't focused.
 */
function resetPressedKeys(e) {
  pressed_keys = {};
}

/** @private
 * handle event "onkeydown" by remembering what key was pressed
 */
function handleKeyUp(e) {
  event = (e) ? e : window.event
  var human_names = keycode_to_string[event.keyCode].split(" ")
  human_names.forEach( function(human_name) {
   pressed_keys[human_name] = false
    if(on_keyup_callbacks[human_name]) { 
      on_keyup_callbacks[human_name](human_name)
      e.preventDefault()
    }
    if(prevent_default_keys[human_name]) { e.preventDefault() }
  });
}

/** @private
 * handle event "onkeydown" by remembering what key was un-pressed
 */
function handleKeyDown(e) {
  event = (e) ? e : window.event  
  var human_names = keycode_to_string[event.keyCode].split(" ")
  human_names.forEach( function(human_name) {
    pressed_keys[human_name] = true
    if(on_keydown_callbacks[human_name]) { 
      on_keydown_callbacks[human_name](human_name)
      e.preventDefault()
    }
    if(prevent_default_keys[human_name]) { e.preventDefault() }
  });
}
/** @private
 * handle event "onmousedown" by remembering what button was pressed
 */
function handleMouseDown(e) {
  event = (e) ? e : window.event  
  var human_name = mousebuttoncode_to_string[event.button] // 0 1 2
  if (navigator.appName == "Microsoft Internet Explorer"){
	  human_name = ie_mousebuttoncode_to_string[event.button];
  }
  pressed_keys[human_name] = true
  if(on_keydown_callbacks[human_name]) { 
    on_keydown_callbacks[human_name](human_name)
    e.preventDefault()
  }
}


/** @private
 * handle event "onmouseup" by remembering what button was un-pressed
 */
function handleMouseUp(e) {
  event = (e) ? e : window.event
  var human_name = mousebuttoncode_to_string[event.button]  

  if (navigator.appName == "Microsoft Internet Explorer"){
	  human_name = ie_mousebuttoncode_to_string[event.button];
  }
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { 
    on_keyup_callbacks[human_name](human_name)
    e.preventDefault()
  }
}

/** @private
 * handle event "touchstart" by remembering what button was pressed
 */
function handleTouchStart(e) {
	event = (e) ? e : window.event  
	pressed_keys["left_mouse_button"] = true
	jaws.mouse_x = e.touches[0].pageX - jaws.canvas.offsetLeft;
	jaws.mouse_y = e.touches[0].pageY - jaws.canvas.offsetTop;
	//e.preventDefault()
}

/** @private
 * handle event "touchend" by remembering what button was pressed
 */
function handleTouchEnd(e) {
  event = (e) ? e : window.event  
  pressed_keys["left_mouse_button"] = false
	jaws.mouse_x = undefined;
	jaws.mouse_y = undefined;

}

var prevent_default_keys = []
/** 
 * Prevents default browseraction for given keys.
 * @example
 * jaws.preventDefaultKeys( ["down"] )  // Stop down-arrow-key from scrolling page down
 */
jaws.preventDefaultKeys = function(array_of_strings) {
  var list = arguments;
  if(list.length == 1 && jaws.isArray(list[0])) list = list[0];

  for(var i=0; i < list.length; i++) {
    prevent_default_keys[list[i]] = true;
  }
}

/**
 * Check if *keys* are pressed. Second argument specifies use of logical AND when checking multiple keys.
 * @example
 * jaws.pressed("left a");          // returns true if left arrow key OR a is pressed
 * jaws.pressed("ctrl c", true);    // returns true if ctrl AND a is pressed
 */
jaws.pressed = function(keys, logical_and) {
  if(jaws.isString(keys)) { keys = keys.split(" ") }
  if(logical_and) { return  keys.every( function(key) { return pressed_keys[key] } ) }
  else            { return  keys.some( function(key) { return pressed_keys[key] } ) }
}

/**
 * Check if *keys* are pressed, but only return true Once for any given keys. Once keys have been released, pressedWithoutRepeat can return true again when keys are pressed.
 * Second argument specifies use of logical AND when checking multiple keys.
 * @example
 * if(jaws.pressedWithoutRepeat("space")) { player.jump() }  // with this in the gameloop player will only jump once even if space is held down
 */
jaws.pressedWithoutRepeat = function(keys, logical_and) {
  if( jaws.pressed(keys, logical_and) ) {
    if(!previously_pressed_keys[keys]) { 
      previously_pressed_keys[keys] = true
      return true 
    }
  }
  else {
    previously_pressed_keys[keys] = false
    return false
  }
}

/** 
 * sets up a callback for a key (or array of keys) to call when it's pressed down
 * 
 * @example
 * // call goLeft() when left arrow key is  pressed
 * jaws.on_keypress("left", goLeft) 
 *
 * // call fireWeapon() when SPACE or CTRL is pressed
 * jaws.on_keypress(["space","ctrl"], fireWeapon)
 */
jaws.on_keydown = function(key, callback) {
  if(jaws.isArray(key)) {
    for(var i=0; key[i]; i++) {
      on_keydown_callbacks[key[i]] = callback
    }
  }
  else {
    on_keydown_callbacks[key] = callback
  }
}

/** 
 * sets up a callback when a key (or array of keys) to call when it's released 
 */
jaws.on_keyup = function(key, callback) {
  if(jaws.isArray(key)) {
    for(var i=0; key[i]; i++) {
      on_keyup_callbacks[key[i]] = callback
    }
  }
  else {
    on_keyup_callbacks[key] = callback
  }
}

/** @private
 * Clean up all callbacks set by on_keydown / on_keyup 
 */
jaws.clearKeyCallbacks = function() {
  on_keyup_callbacks = []
  on_keydown_callbacks = []
}

return jaws;
})(jaws || {});
