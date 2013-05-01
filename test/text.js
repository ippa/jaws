module("Text")

test("text special options", function() {
  text = new jaws.Text({dom: null, _constructor: "Troll"})
  same(text.options["_constructor"], "Troll")
});

test("Text defaults", function() {
  text = new jaws.Text({});
  same(text.x, 0, "x defaults to 0");
  same(text.y, 0, "y defaults to 0");
  same(text.angle, 0, "angle defaults to 0");
  same(text.scale_x, 1, "scale_x defaults to 1 (no scaling)");
  same(text.scale_y, 1, "scale_y defaults to 1 (no scaling)");
  same(text.anchor_x, 0, "anchor_x defaults to 0 (top)");
  same(text.anchor_y, 0, "anchor_y defaults to 0 (left)");
  same(text.text, "", "text defaults to empty string");
  same(text.alpha, 1, "alpha defalts to 1 (zero fading)");
  same(text.fontFace, "serif", "text.fontFace defaults to 'serif'");
  same(text.fontSize, 25, "text.fontSize defaults to 25");
  same(text.color, "black", "text.color defaults to 'black'");
  same(text.textAlign, "left", "text.textAlign defaults to 'left'");
  same(text.textBaseline, "alphabetic", "text.textBaseline defaults to 'alphabetic'");
  same(text.wordWrap, false, "text.wordWrap defaults to false");
  same(text.style, "", "text.style defaults to empty string");
});

test("text", function() {
  stop();

  function assetsLoaded() {
    text = new jaws.Text({text: "rect.png", width:20, height:20});
    equal(text.width, 20, "text.width");
    equal(text.height, 20, "text.height");
  
    text.scaleAll(2);
    equal(text.rect().width, 40, "text.rect().width after scaling x2");
    equal(text.rect().height, 40, "text.rect().height after scaling x2") ;
  
    same(text.rect(), new jaws.Rect(0,0,40,40), "text.rect()");
	
	text.style = "italic";
	equal(text.style, "italic", "text.style changed to 'italic'");
	
	text.style = "bold";
	equal(text.style, "bold", "text.style changed to 'bold'");
  
    text.setAnchor("bottom_right");
    equal(text.x, text.rect().right, "text.x == text.rect().right when anchor is bottom_right");
    equal(text.y, text.rect().bottom, "text.y == text.rect().bottom when anchor is bottom_right");
    
    text.setAnchor("top_left");
    equal(text.x+text.width, text.rect().right, "text.x+text.width == text.rect().right when anchor is top_left");
    equal(text.y+text.height, text.rect().bottom, "text.y+text.height == text.rect().bottom when anchor is top_left");
  
    text.rotateTo(45);
    equal(text.angle, 45, "text.rotateTo() modifies angle");
    text.rotate(45);
    equal(text.angle, 90, "text.rotate() adds to angle #2");
  
    text.moveTo(100,100);
    equal(text.x, 100, "text.moveTo() sets text x/y");
    equal(text.y, 100, "text.moveTo() sets text x/y");
  
    text.move(10,12);
    equal(text.x, 110, "text.move() adds to text x/y");
    equal(text.y, 112, "text.move() adds to text x/y");
  
    text.scaleTo(1);
    equal(text.width, 20, "text.scaleTo forces a scale_factor");
  
    text.setWidth(80);
    equal(text.width, 80, "text.setWidth forces a new width via scale_x");
    equal(text.scale_x, 4, "text.setWidth forces a new width via scale_x");
  
    text.setHeight(40);
    equal(text.height, 40, "text.setHeight forces a new width via scale_y");
    equal(text.scale_y, 2, "text.setHeight forces a new width via scale_y");
  
    text.resizeTo(20,20);
    equal(text.width, 20, "resize() sets width via scale_x");
    equal(text.height, 20, "resize() sets width via scale_x");
    
    text.resize(-10,-10);
    equal(text.width, 10, "resize() mods width via scale_x");
    equal(text.height, 10, "resize() mods width via scale_x");
  
    start();
  }
})

