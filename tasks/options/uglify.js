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
                    dest: '<%= _modeDir %>/scripts/c6app.min.js'
                },
                {
                    src: '.tmp/main-<%= buildMode %>.js',
                    dest: '<%= _modeDir %>/scripts/main.js'
                }
            ]
        },
        collateral: {
            cwd: '.tmp/collateral',
            src: ['**/*.js'],
            expand: true,
            dest: '.tmp/collateral/'
        }
    };
}());
