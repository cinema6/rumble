module.exports = {
    dist: {
        options: {
            appDir: '<%= settings.appDir %>/assets/',
            baseUrl: 'scripts',
            dir: '<%= _modeDir %>',
            optimize: 'uglify2',
            optimizeCss: 'standard',
            removeCombined: true,
            paths: {
                templates: '../../../.tmp/templates-<%= buildMode %>',
                cache: '../../../.tmp/cache',
                version: '../../../.tmp/version',
                async: 'lib/async',
                youtube: 'lib/youtube',
                modernizr: 'empty:',
                jquery: 'empty:',
                angular: 'empty:',
                angularAnimate: 'empty:',
                angularSanitize: 'empty:',
                angularTouch: 'empty:',
                c6ui: 'empty:',
                c6log: 'empty:',
                adtech: 'empty:'
            },
            modules: [{
                name: 'main'
            }]
        }
    }
};
