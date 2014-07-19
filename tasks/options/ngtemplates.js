(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        options: {
            htmlmin: grunt.config.get('htmlmin.options'),
            module: '<%= settings.appModule %>.templates',
        },
        dist: {
            files: [
                {
                    cwd: '<%= settings.appDir %>/assets',
                    src: ['views/<%= buildMode %>/**/*.html',
                          'views/vpaid_object_embed.html'],
                    dest: '.tmp/templates-<%= buildMode %>.js'
                }
            ]
        },
        test: {
            options: {
                bootstrap: function(module, script) {
                    return '(' + function(module) {
                        define( ['angular'],
                        function( angular ) {
                            return angular.module(module, [])
                                .run(   ['$templateCache',
                                function( $templateCache ) {
                                    /* SCRIPT */
                                }]);
                        });
                    }.toString().replace('/* SCRIPT */', script) + '("' + module + '"));';
                }
            },
            cwd: '<%= settings.appDir %>/assets',
            src: 'views/**/*.html',
            dest: '.tmp/templates.js'
        }
    };
}());
