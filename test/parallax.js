module("Parallax")

test ("Performance test: repeat_x=false, repeat_y=false", function() {
	stop();
  var assets = new jaws.Assets().setRoot("assets/").add("rect.png").loadAll({onload: loaded}) 

  function loaded() {	
		parallax = new jaws.Parallax({
			repeat_x: false,
			repeat_y: false
		});
		parallax.addLayer({
			image: assets.get("rect.png"),
			damping: 1
		});
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			number_of_calls = number_of_calls + 1;
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		equal(number_of_calls, 1, "A total of 1 Sprite.draw() calls are required for a parallax draw at 0,0");
		
		parallax.camera_x = 10000;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		equal(number_of_calls, 0, "A total of 0 Sprite.draw() calls are required for a parallax draw at 10000,0");
		
		parallax.camera_x = 0;
		parallax.camera_y = 10000;
		number_of_calls = 0;
		parallax.draw();
		equal(number_of_calls, 0, "A total of 0 Sprite.draw() calls are required for a parallax draw at 0,10000");
		
		start();
	}
});

test ("Performance test: repeat_x=true, repeat_y=false", function() {
  stop();
  var assets = new jaws.Assets().setRoot("assets/").add("rect.png").loadAll({onload: loaded}) 

  function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: false
		});
		parallax.addLayer({
			image: assets.get("rect.png"),
			damping: 1
		});
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			number_of_calls = number_of_calls + 1;
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 5, "A total of 5 Sprite.draw() calls are required for a parallax draw at 0,0 (5 horizontal rectangles with width=20px)");
		
		parallax.camera_x = 10000;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 5, "A total of 5 Sprite.draw() calls are required for a parallax draw at 10000,0 (5 horizontal rectangles with width=20px)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 10000;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 0, "A total of 0 Sprite.draw() calls are required for a parallax draw at 0,10000 (no rectangles)");
		
		jaws.clear(); start();	
	}
});

test ("Performance test: repeat_x=false, repeat_y=true", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded}) 

  function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: false,
			repeat_y: true
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 1
		});
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			number_of_calls = number_of_calls + 1;
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		number_of_calls = 0;	
		parallax.draw();
		deepEqual(number_of_calls, 5, "A total of 5 Sprite.draw() calls are required for a parallax draw at 0,0 (5 vertical rectangles with height=20px)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 10000;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 5, "A total of 5 Sprite.draw() calls are required for a parallax draw at 0,10000 (5 vertical rectangles with height=20px)");
		
		parallax.camera_x = 10000;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 0, "A total of 0 Sprite.draw() calls are required for a parallax draw at 10000,0 (no rectangles)");
		
		jaws.clear(); start();	
	}
});

test("Performance test: repeat_x=true, repeat_y=true", function() {
	stop();
  var assets = new jaws.Assets().setRoot("assets/").add("rect.png").loadAll({onload: loaded})

  function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: true
		});
		parallax.addLayer({
			image: assets.get("rect.png"),
			damping: 1
		});
		parallax.layers[0].setImage( assets.get("rect.png") );
		var number_of_calls = 0;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			number_of_calls = number_of_calls + 1;
		}

		parallax.camera_x = 0;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 25, "A total of 25 Sprite.draw() calls are required for a parallax draw at 0,0");
		
		parallax.camera_x = -1000;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 25, "A total of 25 Sprite.draw() calls are required for a parallax draw at -1000,0");

		parallax.camera_x = 5;
		parallax.camera_y = 5;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 36, "A total of 36 Sprite.draw() calls are required for a parallax draw at 5,5");

		number_of_calls = 0;
		parallax.camera_x = 3000;
		parallax.camera_y = 3000;
		parallax.draw();
		deepEqual(number_of_calls, 25, "A total of 25 Sprite.draw() calls are required for a parallax draw at 3000,3000");

		number_of_calls = 0;
		parallax.camera_x = 3005;
		parallax.camera_y = 3005;
		parallax.draw();
		deepEqual(number_of_calls, 36, "A total of 36 Sprite.draw() calls are required for a parallax draw at 3005,3005");
		
		jaws.clear(); start();
	}
});


test("Performance test: repeat_x=true, repeat_y=true, scale=2x)", function() {
	stop();
  var assets = new jaws.Assets().setRoot("assets/").add("rect.png").loadAll({onload: loaded})

  function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: true
		});
		parallax.addLayer({
			image: assets.get("rect.png"),
			damping: 1,
			scale: 2
		});
		parallax.layers[0].setImage( assets.get("rect.png") );
		var number_of_calls = 0;
		
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			number_of_calls = number_of_calls + 1;
		}

		parallax.camera_x = 0;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 9, "A total of 9 Sprite.draw() calls are required for a parallax draw at 0,0");

		parallax.camera_x = 30;
		parallax.camera_y = 30;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 16, "A total of 16 Sprite.draw() calls are required for a parallax draw at 30,30");

		jaws.clear(); start();
	}
	
});

test("Performance test: repeat_x=true, repeat_y=true, rectangle=19x19", function() {
	stop();
  var assets = new jaws.Assets().setRoot("assets/").add("rect19.png").loadAll({onload: loaded})

  function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: true
		});
		parallax.addLayer({
			image: assets.get("rect19.png"),
			damping: 1
		});
		parallax.layers[0].setImage( assets.get("rect19.png") );
		var number_of_calls = 0;
				
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			number_of_calls = number_of_calls + 1;
		}

		parallax.camera_x = 0;
		parallax.camera_y = 0;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 36, "A total of 36 Sprite.draw() calls are required for a parallax draw at 0,0");
		
		parallax.camera_x = 18;
		parallax.camera_y = 18;
		number_of_calls = 0;
		parallax.draw();
		deepEqual(number_of_calls, 49, "A total of 49 Sprite.draw() calls are required for a parallax draw at 18,18");

		number_of_calls = 0;
		parallax.camera_x = 3800;
		parallax.camera_y = 3800;
		parallax.draw();
		deepEqual(number_of_calls, 36, "A total of 36 Sprite.draw() calls are required for a parallax draw at 3800,3800");

		number_of_calls = 0;
		parallax.camera_x = 3818;
		parallax.camera_y = 3818;
		parallax.draw();
		deepEqual(number_of_calls, 49, "A total of 49 Sprite.draw() calls are required for a parallax draw at 3818,3818");
		
		jaws.clear(); start();
	}
});

test ("Accuracy test: repeat_x=true, repeat_y=false", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})
  function loaded()	{
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: false
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 1
		});
		
		var draw_calls = [];
		var subtest1, subtest2;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			draw_calls.push({"width": this.width, "height": this.height, "x": this.x, "y": this.y});
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];		
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].y != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].x != i*20) {
				subtest2 = false;
			}
		}
		ok(subtest2, "All sprites' X positions are a multiple of 20   (camera_x=0, camera_y=0)");
		ok(subtest1, "All sprites' Y positions are 0                  (camera_x=0, camera_y=0)");		
		
		parallax.camera_x = 10000;
		parallax.camera_y = 0;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].y != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].x != i*20) {
				subtest2 = false;
			}
		}
		ok(subtest2, "All sprites' X positions are a multiple of 20   (camera_x=10000, camera_y=0)");
		ok(subtest1, "All sprites' Y positions are 0                  (camera_x=10000, camera_y=0)");
		
		parallax.camera_x = 10;
		parallax.camera_y = 10;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].y != -10) {
				subtest1 = false;
			}
			if (draw_calls[i].x != i*20 - 10) {
				subtest2 = false;
			}
		}
		ok(subtest2, "All sprites' X positions are a multiple of 20 (- 10)   (camera_x=10, camera_y=10)");
		ok(subtest1, "All sprites' Y positions are 0                         (camera_x=10, camera_y=10)");
		
		jaws.clear(); start();	
	}
});


test ("Accuracy test: repeat_x=false, repeat_y=true", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})
	
  function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: false,
			repeat_y: true
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 1
		});
		
		var draw_calls = [];
		var subtest1, subtest2;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			draw_calls.push({"width": this.width, "height": this.height, "x": this.x, "y": this.y});
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];		
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != i * 20) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are 0                   (camera_x=0, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 10000;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != i * 20) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are 0                   (camera_x=0, camera_y=10000)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=0, camera_y=10000)");
		
		parallax.camera_x = 10;
		parallax.camera_y = 10;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].x != -10) {
				subtest1 = false;
			}
			if (draw_calls[i].y != i * 20 - 10) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are -10                       (camera_x=10, camera_y=10)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20 (-10)    (camera_x=10, camera_y=10)");
		
		jaws.clear(); start();	
	}
});

test ("Accuracy test: repeat_x=true, repeat_y=true", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})
  function loaded() {	
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: true
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 1
		});
		
		var draw_calls = [];
		var subtest1, subtest2;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			draw_calls.push({"width": this.width, "height": this.height, "x": this.x, "y": this.y});
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];		
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20    (camera_x=0, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 10000;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20    (camera_x=10000, camera_y=10000)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=10000, camera_y=10000)");
		
		parallax.camera_x = 10;
		parallax.camera_y = 10;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (Math.abs((draw_calls[i].x + 10)) % 20 != 0) {
				subtest1 = false;
			}
			if (Math.abs((draw_calls[i].y + 10)) % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20 (-10)   (camera_x=10, camera_y=10)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20 (-10)   (camera_x=10, camera_y=10)");
		
		parallax.camera_x = -1000;
		parallax.camera_y = -1000;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20   (camera_x=-1000, camera_y=-1000)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20   (camera_x=-1000, camera_y=-1000)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];
		parallax.draw();
		subtest1 = false;
		for (var i in draw_calls) {			
			if (draw_calls[i].x == 60 && draw_calls[i].x == 60) {
				subtest1 = true;
			}
		}
		ok(subtest1, "A sprite is drawn at 60,60   (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 1000;
		parallax.camera_y = 1000;
		draw_calls = [];
		parallax.draw();
		subtest1 = false;
		for (var i in draw_calls) {			
			if (draw_calls[i].x == 60 && draw_calls[i].x == 60) {
				subtest1 = true;
			}
		}
		ok(subtest1, "A sprite is drawn at 60,60   (camera_x=1000, camera_y=1000)");
		
		jaws.clear(); start();	
	}
});

test ("Accuracy test: repeat_x=true, repeat_y=true, damping=2", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})
  function loaded() {
	
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: true
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 2,
		});
		
		var draw_calls = [];
		var subtest1, subtest2;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			draw_calls.push({"width": this.width, "height": this.height, "x": this.x, "y": this.y});
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];		
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20    (camera_x=0, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 20000;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20    (camera_x=0, camera_y=20000)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=0, camera_y=20000)");
		
		parallax.camera_x = 10;
		parallax.camera_y = 10;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (Math.abs((draw_calls[i].x + 5)) % 20 != 0) {
				subtest1 = false;
			}
			if (Math.abs((draw_calls[i].y + 5)) % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20 (-5)   (camera_x=10, camera_y=10)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20 (-5)   (camera_x=10, camera_y=10)");
		
		parallax.camera_x = -1000;
		parallax.camera_y = -1000;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {			
			if (draw_calls[i].x % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y % 20 != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 20    (camera_x=-1000, camera_y=-1000)");
		ok(subtest2, "All sprites' Y positions on screen are a multiple of 20    (camera_x=-1000, camera_y=-1000)");
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];
		parallax.draw();
		subtest1 = false;
		for (var i in draw_calls) {			
			if (draw_calls[i].x == 60 && draw_calls[i].x == 60) {
				subtest1 = true;
			}
		}
		ok(subtest1, "A sprite is drawn at 60,60   (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 1000;
		parallax.camera_y = 1000;
		draw_calls = [];
		parallax.draw();
		subtest1 = false;
		for (var i in draw_calls) {			
			if (draw_calls[i].x == 60 && draw_calls[i].x == 60) {
				subtest1 = true;
			}
		}
		ok(subtest1, "A sprite is drawn at 60,60   (camera_x=1000, camera_y=1000)");
			
		jaws.clear(); start();	
	}
});

test ("Accuracy test: repeat_x=true, repeat_y=false, scale=2x (layer level)", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})
  function loaded() {	
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: false,
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 1,
			scale: 2
		});
		
		var draw_calls = [];
		var subtest1, subtest2;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			draw_calls.push({"width": this.width, "height": this.height, "x": this.x, "y": this.y});
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];		
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].x % 40 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 40    (camera_x=0, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are 0                   (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 10000;
		parallax.camera_y = 0;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].x % 40 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 40    (camera_x=10000, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are 0                   (camera_x=10000, camera_y=0)");
		
		parallax.camera_x = 10;
		parallax.camera_y = 10;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (Math.abs((draw_calls[i].x + 10)) % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != -10) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 40 (-10)    (camera_x=10, camera_y=10)");
		ok(subtest2, "All sprites' Y positions on screen are -10                       (camera_x=10, camera_y=10)");
		
		jaws.clear(); start();	
	}
});

test ("Accuracy test: repeat_x=true, repeat_y=false, scale=2x (parallax level)", function() {
	stop();
	jaws.init()
  jaws.assets.setRoot("assets/").add("rect.png").loadAll({onload: loaded})
	function loaded() {
		parallax = new jaws.Parallax({
			repeat_x: true,
			repeat_y: false,
			scale: 2
		});
		parallax.addLayer({
			image: "rect.png",
			damping: 1,
		});
		
		var draw_calls = [];
		var subtest1, subtest2;
		
		parallax.layers[0]
		parallax.layers[0]._old_draw = parallax.layers[0].draw;
		parallax.layers[0].draw = function() {
			this._old_draw();
			draw_calls.push({"width": this.width, "height": this.height, "x": this.x, "y": this.y});
		}
		
		parallax.camera_x = 0;
		parallax.camera_y = 0;
		draw_calls = [];		
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].x % 40 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 40    (camera_x=0, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are 0                   (camera_x=0, camera_y=0)");
		
		parallax.camera_x = 10000;
		parallax.camera_y = 0;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (draw_calls[i].x % 40 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != 0) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 40    (camera_x=10000, camera_y=0)");
		ok(subtest2, "All sprites' Y positions on screen are 0                   (camera_x=10000, camera_y=0)");
		
		parallax.camera_x = 10;
		parallax.camera_y = 10;
		draw_calls = [];
		parallax.draw();
		subtest1 = true;
		subtest2 = true;
		for (var i in draw_calls) {
			if (Math.abs((draw_calls[i].x + 10)) % 20 != 0) {
				subtest1 = false;
			}
			if (draw_calls[i].y != -10) {
				subtest2 = false;
			}
		}
		ok(subtest1, "All sprites' X positions on screen are a multiple of 40 (-10)    (camera_x=10, camera_y=10)");
		ok(subtest2, "All sprites' Y positions on screen are -10                       (camera_x=10, camera_y=10)");
		
		jaws.clear(); start();	
  }
});
