/*
 * 
 *  text = new Text({text: "woff", x: 0, y: 10 })
 *
 */
var jaws = (function(jaws) {

jaws.Text = function Text(options) {
  var text = new jaws.Sprite(options)

  text.text = options.text || "N/A";
  text.font = options.font || "bold 50pt terminal";

  var canvas = createElement("canvas")
  var context = canvas.getContext("2d")


  context.font = text.font
  context.fillStyle = "black"
  context.fillText(text.text,0,0)

  return text
}
jaws.Text.prototype = new jaws.Sprite

return jaws;
})(jaws || {});

