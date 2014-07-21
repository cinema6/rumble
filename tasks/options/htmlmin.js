(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        options: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        },
        dist: {
            files: [
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>',
                    src: [
                        '*.html',
                        '!index.html'
                    ],
                    dest: '<%= settings.distDir %>'
                },
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>',
                    src: [
                        'index.html'
                    ],
                    dest: '<%= settings.distDir %>',
                    rename: function(dest) {
                        var mode = grunt.config('buildMode');

                        return dest + '/' + mode + '.html';
                    }
                },
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>/assets',
                    src: [
                        '**/*.html',
                        '!views/**/*.html'
                    ],
                    dest: '<%= _modeDir %>'
                }
            ]
        },
        collateral: {
            files: [
                {
                    expand: true,
                    cwd: '.tmp/collateral',
                    src: '**/*.html',
                    dest: '.tmp/collateral'
                }
            ]
        }
    };
}());
