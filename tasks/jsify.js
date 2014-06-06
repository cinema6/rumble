module.exports = function(grunt) {
    'use strict';

    grunt.registerMultiTask('jsify', 'Convert the contents of a file into a JS string', function() {
        var options = this.options({
            transform: function(orig) {
                return orig;
            }
        });

        this.files.forEach(function(map) {
            grunt.log.writeln(map.src + ' > ' + map.dest);
            grunt.file.write(
                map.dest,
                options.transform(
                    '\'' +
                    map.src.map(function(path) {
                        return grunt.file.read(path);
                    })
                    .join('\n')
                    /* jshint quotmark:false */
                    .replace(/'/g, "\\'")
                    .replace(/\r\n|\r|\n/g, "\\n") +
                    /* jshint quotmark:single */
                    '\''
                )
            );
        });

        grunt.log.ok();
    });
};
