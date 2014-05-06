(function() {
    'use strict';

    var grunt = require('grunt'),
        c6Sandbox = require('c6-sandbox');

    module.exports = {
        options: {
            hostname: '0.0.0.0'
        },
        sandbox: {
            proxies: [
                {
                    context: '/api',
                    host: '<%= personal.apiHost %>',
                    changeOrigin: true
                }
            ],
            options: {
                port: '<%= settings.sandboxPort %>',
                middleware: function() {
                    return [
                        require('connect-livereload')(),
                        c6Sandbox({
                            landingContentDir: grunt.template.process('<%= settings.collateralDir %>'),
                            experiences: grunt.config.process(
                                grunt.file.readJSON(
                                    grunt.template.process('<%= settings.experiencesJSON %>')
                                )
                            ),
                            users: grunt.config.process(
                                grunt.file.readJSON(
                                    grunt.template.process('<%= settings.usersJSON %>')
                                )
                            )
                        })
                    ];
                }
            }
        }
    };
})();
