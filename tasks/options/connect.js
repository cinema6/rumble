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
                                      '<script>window.c6={' +
                                      'kDebug:' + grunt.config.get('settings.debug') + ',' +
                                      'kCollateralUrl:\'' + grunt.config.get('settings.locations.collateral') + '\',' +
                                      'kApiUrl:\'' + grunt.config.get('settings.locations.api') + '\',' +
                                      'kEnvUrlRoot: \'http://staging.cinema6.com\',' +
                                      'kDevMode: true' +
                                      '};</script>'; 
                                }
                            }]
                        }),
                        c6Sandbox({
                            landingContentDir: grunt.template.process('<%= settings.collateralDir %>'),
                            experiences: grunt.config.process(
                                grunt.file.readJSON(
                                    grunt.template.process('<%= settings.experiencesJSON %>')
                                )
                            ),
                            users: [{}]
                        })
                    ];
                }
            }
        }
    };
})();
