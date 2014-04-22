(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        options: {
            htmlmin: grunt.config.get('htmlmin.options'),
            module: '<%= settings.appModule %>',
            prefix: '<%= _version %>/'
        },
        dist: {
            cwd: '<%= settings.appDir %>/assets',
            src: 'views/<%= buildMode %>/**/*.html',
            dest: '.tmp/templates-<%= buildMode %>.js'
        },
        test: {
            options: {
                prefix: ''
            },
            cwd: '<%= settings.appDir %>',
            src: 'assets/views/**/*.html',
            dest: '.tmp/templates.js'
        }
    };
}());
