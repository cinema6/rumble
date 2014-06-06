var settings = require('../settings.json');


module.exports = function(config) {
    // Karma configuration
    'use strict';

    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '..',
    
        frameworks: ['requirejs', 'jasmine', 'commonjs'],

        // list of files / patterns to load in the browser
        files: [
            { pattern: 'settings.json', included: false },
            { pattern:  settings.appDir + '/assets/scripts/**/*.js', included: false },
            { pattern: '.tmp/templates.js', included: false },
            { pattern: 'test/spec/splash/**/*.js', included: true },
            { pattern: 'test/spec/**/*.{js,html}', included: false },
            { pattern: settings.collateralDir + '/splash/**/*.js', included: true },
            'test/test-main.js'
        ],

        preprocessors: {
            'c6Content/splash/*.js': ['commonjs'],
            'test/spec/splash/**/*.js': ['commonjs']
        },

        // list of files to exclude
        exclude: [
            settings.appDir + '/assets/scripts/main.js'
        ],

        // test results reporter to use
        // possible values: dots || progress || growl
        reporters: ['progress'],

        // web server port
        port: 8000,

        // cli runner port
        runnerPort: 9100,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 5000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};
