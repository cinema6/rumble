(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        options: {
            config: function(data) {
                var distDir = grunt.config.get('settings.distDir'),
                    modeDir = grunt.config.get('buildMode'),
                    distVersionDir = distDir + '/' + modeDir + '/' + data.commit;

                grunt.config.set('_version', data.commit);
                grunt.config.set('_versionDir', distVersionDir);
            }
        }
    };
}());
