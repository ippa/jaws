var jaws = (function(jaws) {

  var pressed_keys = {}
  var keycode_to_string = []
  var on_keydown_callbacks = []
  var on_keyup_callbacks = []
 
/*
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
  
  k[91] = "leftwindowkey"
  k[92] = "rightwindowkey"
  k[93] = "selectkey"
  k[106] = "multiply"
  k[107] = "add"
  k[109] = "subtract"
  k[110] = "decimalpoint"
  k[111] = "divide"
  
  k[144] = "numlock"
  k[145] = "scrollock"
  k[186] = "semicolon"
  k[187] = "equalsign"
  k[188] = "comma"
  k[189] = "dash"
  k[190] = "period"
  k[191] = "forwardslash"
  k[192] = "graveaccent"
  k[219] = "openbracket"
  k[220] = "backslash"
  k[221] = "closebracket"
  k[222] = "singlequote"

  var numpadkeys = ["numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
  var fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
  var numbers = ["1","2","3","4","5","6","7","8","9"]
  var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
  for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
  for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
  for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }
  
  this.keycode_to_string = k

  window.onkeydown = function(e)  { jaws.handleKeyDown(e) }
  window.onkeyup = function(e)    { jaws.handleKeyUp(e) }
  window.onkeypress = function(e) {};
}

/*
 * handle event "onkeydown" by remembering what key was pressed
 */
jaws.handleKeyUp = function(e) {
  event = (e) ? e : window.event
  var human_name = this.keycode_to_string[event.keyCode]
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { 
    on_keyup_callbacks[human_name]() 
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }
}

/*
 * handle event "onkeydown" by remembering what key was un-pressed
 */
jaws.handleKeyDown = function(e) {
  event = (e) ? e : window.event  
  var human_name = this.keycode_to_string[event.keyCode]
  pressed_keys[human_name] = true
  if(on_keydown_callbacks[human_name]) { 
    on_keydown_callbacks[human_name]()
    e.preventDefault()
  }
  if(prevent_default_keys[human_name]) { e.preventDefault() }

  // jaws.debug(event.type + " - " + event.keyCode + " " + keycode_to_string[event.keyCode]);
  // e.preventDefault();
}

var prevent_default_keys = []
jaws.preventDefaultKeys = function(array_of_strings) {
  array_of_strings.forEach( function(item, index) {
    prevent_default_keys[item] = true
  });
}

/*
 * helper to check if a given key currently is pressed. returns true or false.
 */
jaws.pressed = function(string) {
  return pressed_keys[string]
}

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

return jaws;
})(jaws || {});
