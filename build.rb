#!/usr/bin/env ruby

#
# Build a standalone, all-including jaws.js by combining all the files in src/-directory into one
#
files = ["core.js","input.js","assets.js","game_loop.js","rect.js","sprite.js","sprite_sheet.js","animation.js","viewport.js","collision_detection.js", "gfx.js"]
extras = ["audio.js", "quadtree.js", "parallax.js", "pixel_map.js", "sprite_list.js", "tile_map.js", "tile_map_pathfinding.js"]

File.open("jaws.js", "w") do |out|
  out.write("/* Built at #{Time.now.to_s} */\n")
  files.each { |file| out.write( File.read("src/#{file}") ) }
  out.write(";window.addEventListener(\"load\", function() { if(jaws.onload) jaws.onload(); }, false);")
end

#
# Minify jaws.js into jaws-min.js using googles closure compiler
#
require 'net/http'
require 'uri'
def compress(js_code, compilation_level)
  response = Net::HTTP.post_form(URI.parse('http://closure-compiler.appspot.com/compile'), {
    'js_code' => js_code,
    'compilation_level' => "#{compilation_level}",
    'output_format' => 'text',
    'output_info' => 'compiled_code'
    # 'output_info' => 'errors'
  })
  response.body
end

js_code = File.read("jaws.js")
File.open("jaws-min.js", "w") { |out| 
  out.write("/* Built at #{Time.now.to_s} */\n")
  out.write compress(js_code, "SIMPLE_OPTIMIZATIONS") # option: ADVANCED_OPTIMIZATIONS
}  

if ARGV.first != "nodoc"
  #
  # Generate documentation into http://jawsjs.com/docs/
  # -a documents All functions
  # 
  `jsdoc -D='noGlobal:true' -D='title:JawsJS HTML5 game engine documentation' -t=/www/ippa/jawsjs.com/public/codeview -d=/www/ippa/jawsjs.com/public/docs src`
  `cd /www/ippa/jawsjs.com/public/docs; zip jaws-docs.zip -x jaws-docs.zip -r .`
end
