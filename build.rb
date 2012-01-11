#!/usr/bin/env ruby

#
# Build a standalone, all-including jaws.js by combining all the files in src/-directory into one
#
File.open("jaws.js", "w") do |out|
  files = ["core.js","input.js","assets.js","game_loop.js","rect.js","sprite.js","sprite_list.js","sprite_sheet.js","parallax.js","animation.js","viewport.js","tile_map.js", "collision_detection.js", "gfx.js"]
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
File.open("jaws-min.js", "w") { |out| out.write compress(js_code, "SIMPLE_OPTIMIZATIONS") }  # option: ADVANCED_OPTIMIZATIONS

#
# Generate documentation into http://jawsjs.com/docs/
# -a documents All functions
# 
`jsdoc -D='noGlobal:true' -D='title:JawsJS HTML5 game engine documentation' -t=/www/ippa/jawsjs.com/public/codeview -d=/www/ippa/jawsjs.com/public/docs src`
