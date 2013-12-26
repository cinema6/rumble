(function() {
    'use strict';

    module.exports = {
        options: {
            livereload: true
        },
        html: {
            files: [ 
                '<%= settings.appDir %>/*.html',
                '<%= settings.appDir %>/assets/views/**/*.html' 
            ],
            tasks: []
        },
        style: {
            files: [ 
                '<%= settings.appDir %>/assets/styles/**/*.css',
                '<%= settings.appDir %>/assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
            ],
            tasks: []
        },
        js:  {
            options: {
                atBegin: true
            },
            files: [
                '<%= settings.appDir %>/assets/scripts/**/*.js',
                'test/spec/**/*.js'
            ],
            tasks: ['jshint:all', 'karma:debug:run']
        }
//,
//        e2e: {
//            files: [
//                '<%= settings.appDir %>/*.html',
//                '<%= settings.appDir %>/assets/views/**/*.html',
//                '<%= settings.appDir %>/assets/styles/**/*.css',
//                '<%= settings.appDir %>/assets/scripts/**/*.js',
//                '<%= settings.appDir %>/assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}',
//                'test/e2e/**/*.e2e.js'
//            ],
//            tasks: [
//                'protractor:<%= grunt.task.current.args[1] %>:local'
//            ]
//        }
    };
})();
