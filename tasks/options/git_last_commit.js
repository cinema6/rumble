(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        options: {
            config: function(data) {
                var distDir = grunt.config.get('settings.distDir'),
                    mode = grunt.config.get('buildMode'),
                    distVersionDir = distDir + '/' + data.commit,
                    modeDir = distVersionDir + '/' + mode;

                grunt.config.set('_version', data.commit);
                grunt.config.set('_versionDir', distVersionDir);
                grunt.config.set('_modeDir', modeDir);
            }
        }
    };
}());