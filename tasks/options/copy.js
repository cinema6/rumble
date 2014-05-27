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
                        '!mock/**',
                        '!views/**',
                        '!styles/**',
                        'styles/*.*',
                        'styles/<%= buildMode %>/**',
//                        'views/<%= buildMode %>/**',
                        '!**/*.{js,css,html}'
                    ],
                    dest: '<%= _modeDir %>'
                },
                {
                    src: '<%= settings.appDir %>/assets/scripts/main.js',
                    dest: '.tmp/main-<%= buildMode %>.js'
                }
            ]
        },
        collateral: {
            files: [
                {
                    expand: true,
                    cwd: '<%= settings.collateralDir %>',
                    src: '**',
                    dest: '.tmp/collateral/'
                }
            ]
        }
    };
}());
