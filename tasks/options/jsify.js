(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        splash: {
            options: {
                transform: function(orig) {
                    return 'module.exports = ' + orig + ';';
                }
            },
            expand: true,
            cwd: '.tmp/collateral/',
            src: ['**/*.html'],
            dest: '.tmp/collateral/',
            ext: '.js',
            extDot: 'last'
        },
        dist: {
            options: {
                transform: function(orig, srcs) {
                    var src = srcs[0].replace(/^app\/assets/, grunt.config.process('<%= _version %>/<%= buildMode %>'));

                    return '(' + function(orig, src) {
                        angular.module('c6.rumble')
                            .runs   (['$cacheFactory',
                            function ( $cacheFactory ) {
                                var $httpCache = $cacheFactory.get('$httpCache');

                                $httpCache.put(src, [200, orig, {}]);
                            }]);
                    }.toString() + '(' + orig + ', \'' + src + '\'));';
                }
            },
            expand: true,
            cwd: '<%= settings.appDir %>/assets/config/',
            src: ['**/*.json'],
            dest: '.tmp/config/',
            ext: '.js'
        }
    };
}());
