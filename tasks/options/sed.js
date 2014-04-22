(function() {
    'use strict';

    module.exports = {
        main: {
            pattern: 'undefined',
            replacement: '\'<%= buildMode %>/<%= _version %>\'',
            path: '.tmp/main-<%= buildMode %>.js'
        },
        html: {
            pattern: 'assets',
            replacement: '<%= _version %>/<%= buildMode %>',
            path: [
                '.tmp/templates-<%= buildMode %>.js'
            ]
        },
        index: {
            pattern: 'assets',
            replacement: '<%= _version %>',
            path: '<%= settings.distDir %>/index.html'
        },
        app_map: {
            pattern: 'app\/assets\/scripts',
            replacement: 'rumble/<%= _version %>/scripts/raw',
            path: [
                '<%= settings.distDir %>/<%= _version %>/scripts/c6app.min.map'
            ]
        }
    };
}());
