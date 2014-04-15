(function() {
    'use strict';

    module.exports = {
        raw: {
            files: [
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>/assets/scripts/',
                    src: '**.js',
                    dest: '<%= _versionDir %>/scripts/raw/'
                }
            ]
        },
        dist: {
            files: [
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>',
                    src: [
                        '*.*',
                        '!*.html'
                    ],
                    dest: '<%= settings.distDir %>'
                },
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>/assets',
                    src: [
                        '**',
                        '!**/*.{js,css,html}'
                    ],
                    dest: '<%= _versionDir %>'
                },
                {
                    src: '<%= settings.appDir %>/assets/scripts/main.js',
                    dest: '.tmp/main.js'
                }
            ]
        }
    };
}());
