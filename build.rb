#!/usr/bin/env ruby

#
# Built an all-containing jaws.js with all src files
#
out = File.new("jaws-all.js", "w")
Dir["src/*"].each do |file|
  out.write(File.read(file))
end

