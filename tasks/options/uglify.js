(function() {
    'use strict';

    module.exports = {
        options: {
            sourceMap : '<%= withMaps %>'
                 },
        dist: {
            files: [
                {
                    src: [
                        '<%= settings.appDir %>/assets/scripts/app.js',
                        '<%= settings.appDir %>/assets/scripts/**/*.js',
                        '.tmp/templates-<%= buildMode %>.js',
                        '!<%= settings.appDir %>/assets/scripts/main.js'
                    ],
                    dest: '<%= _versionDir %>/scripts/c6app.min.js'
                },
                {
                    src: '.tmp/main-<%= buildMode %>.js',
                    dest: '<%= _versionDir %>/scripts/main.js'
                }
            ]
        }
    };
}());
