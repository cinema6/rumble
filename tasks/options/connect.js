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
                                    return [
                                        [w, s].join(''),
                                        '<script>',
                                        '(' + function(window) {
                                            window.c6 = {
                                                kLocal: true
                                            };
                                        }.toString() + '(window))',
                                        '</script>'
                                    ].join('\n');
                                }
                            }]
                        }),
                        c6Sandbox({
                            gaAccountId : 'UA-44457821-2',
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
