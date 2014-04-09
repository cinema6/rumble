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
                        require('grunt-connect-proxy/lib/utils').proxyRequest,
                        require('connect-livereload')({
                            rules   : [{
                                match: /<!--C6ENV-->/,
                                fn  : function(w, s){
                                        return w + s +
                                        '<script>window.c6={kEnv:\'' +
                                            grunt.config.get('settings.environment') +
                                        '\'};</script>'; 
                                }
                            }]
                        }),
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
