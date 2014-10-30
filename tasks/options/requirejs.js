var grunt = require('grunt');

module.exports = {
    dist: {
        options: {
            appDir: '<%= settings.appDir %>/assets/',
            baseUrl: 'scripts',
            dir: '<%= _modeDir %>',
            optimize: 'uglify2',
            optimizeCss: 'standard',
            removeCombined: true,
            paths: {
                templates: '../../../.tmp/templates-<%= buildMode %>',
                cache: '../../../.tmp/cache',
                version: '../../../.tmp/version',
                async: 'lib/async',
                youtube: 'lib/youtube',
                modernizr: 'empty:',
                jquery: 'empty:',
                angular: 'empty:',
                angularAnimate: 'empty:',
                angularSanitize: 'empty:',
                angularTouch: 'empty:',
                c6uilib: 'empty:',
                c6log: 'empty:',
                adtech: 'empty:'
            },
            modules: [{
                name: 'main'
            }],
            onBuildRead: function(moduleName, path, contents) {
                'use strict';

                var mode = grunt.config('buildMode'),
                    settings = grunt.config('settings').build,
                    config = settings[moduleName] || {},
                    whitelist = config.whitelist || [mode],
                    blacklist = config.blacklist || [];

                function isAllowed(whitelist, blacklist, mode) {
                    return whitelist.indexOf(mode) > -1 && blacklist.indexOf(mode) < 0;
                }

                return isAllowed(whitelist, blacklist, mode) ?
                    contents : grunt.file.read(path.replace(/\.js$/, '.stub'));
            }
        }
    }
};
