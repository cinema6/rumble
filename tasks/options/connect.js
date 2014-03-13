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
                    host: '<%= personal.apiHost %>'
                }
            ],
            options: {
                port: '<%= settings.sandboxPort %>',
                middleware: function() {
                    return [
                        require('grunt-connect-proxy/lib/utils').proxyRequest,
                        require('connect-livereload')(),
                        c6Sandbox({
                            landingContentDir: grunt.template.process('<%= settings.collateralDir %>'),
                            experiences: grunt.config.process(
                                grunt.file.readJSON(
                                    grunt.template.process('<%= settings.experiencesJSON %>')
                                )
                            )
                        })
                    ];
                }
            }
        }
    };
})();
