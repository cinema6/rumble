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
            replacement: '<%= buildMode %>/<%= _version %>',
            path: [
                '.tmp/templates-<%= buildMode %>.js',
                '<%= settings.distDir %>/<%= buildMode %>/index.html'
            ]
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
