(function(){
    'use strict';

    /*var __C6_BUILD_VERSION__ = window.__C6_BUILD_VERSION__ = undefined,
        c6 = window.c6 = (window.c6 || {});

    require.config({
        baseUrl: 'scripts'
    });

    var protocol = (function() {
            var currentProtocol = window.location.protocol,
                isValid = currentProtocol.search(/^https?/) > -1,
                parentProtocol;

            if (isValid) { return currentProtocol; }

            try {
                parentProtocol = window.parent.location.protocol;
            } catch(e) {
                parentProtocol = 'http:';
            }

            return parentProtocol;
        }()),
        href = (function(){
            try {
                return  (window.location.protocol.search(/^https?/) > -1) ?
                    window.location.href : window.parent.location.href;
            }
            catch(e){
                return '';
            }
        }()),
        libUrl = function(url) {
            return protocol + '//lib.cinema6.com/' + url;
        },
        appScripts = (function() {
            if (__C6_BUILD_VERSION__) {
                return [
                    'scripts/c6app.min'
                ];
            } else {
                return [
                    'scripts/app',
                    'scripts/services',
                    'scripts/tracker',
                    'scripts/dailymotion',
                    'scripts/iframe',
                    'scripts/rumble',
                    'scripts/table_of_contents',
                    'scripts/vimeo',
                    'scripts/youtube',
                    'scripts/recap_card',
                    'scripts/video_card',
                    'scripts/vast_card',
                    'scripts/ad_card',
                    'scripts/vpaid_card',
                    'scripts/ballot_module',
                    'scripts/comments_module',
                    'scripts/display_ad_module',
                    'scripts/paginator',
                    'scripts/thumb_paginator'
                ];
            }
        }()),
        libScripts = (function() {
            if (__C6_BUILD_VERSION__) {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-sanitize.min.js'),
                    libUrl('c6ui/v2.5.0-0-gc58e712/c6uilib.min.js'),
                    libUrl('c6ui/v2.5.0-0-gc58e712/c6log.min.js'),
                    protocol + '//www.youtube.com/iframe_api',
                    protocol + '//aka-cdn.adtechus.com/dt/common/DAC.js'
                ];
            } else {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-sanitize.js'),
                    libUrl('c6ui/v2.5.0-0-gc58e712/c6uilib.js'),
                    libUrl('c6ui/v2.5.0-0-gc58e712/c6log.js'),
                    protocol + '//www.youtube.com/iframe_api',
                    protocol + '//aka-cdn.adtechus.com/dt/common/DAC.js'
                ];
            }
        }());
    
    function loadScriptsInOrder(scriptsList, done) {
        var script;

        if (scriptsList) {
            script = scriptsList.shift();

            if (script) {
                require([script], function() {
                    loadScriptsInOrder(scriptsList, done);
                });
                return;
            }
        }
        done();
    }

    c6.kAppName     = 'MiniReel';
    c6.kAppId       = 'com.cinema6.minireel';
    c6.kAppVersion  = __C6_BUILD_VERSION__ || 'debug';
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = (c6.kDebug) ? ['error','warn','log','info'] : [];
    c6.kEnvUrlRoot = (( c6.kEnvUrlRoot || c6.kEnvUrlRoot === '') ? c6.kEnvUrlRoot : (protocol + '//portal.cinema6.com'));
    c6.kCollateralUrl = (c6.kCollateralUrl || (c6.kEnvUrlRoot + '/collateral'));
    c6.kApiUrl = (c6.kApiUrl || (c6.kEnvUrlRoot + '/api'));
    c6.kProtocol = protocol;
    c6.kHref = href;
    c6.kModDeps = [
        'c6.rumble.services', 'ngAnimate', 'ngSanitize', 'c6.ui', 'c6.log', 'c6.http'
    ];
    
    loadScriptsInOrder(libScripts, function() {
        var Modernizr = window.Modernizr;

        Modernizr.load({
            test: Modernizr.touch,
            yep: [
                __C6_BUILD_VERSION__ ?
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.min.js') :
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.js')
            ],
            complete: function() {
                if (Modernizr.touch) { c6.kModDeps.push('ngTouch'); }

                loadScriptsInOrder(appScripts, function() {
                    angular.bootstrap(document.documentElement, ['c6.rumble']);
                });
            }
        });
    });*/
    var protocol = window.c6.kProtocol = (function() {
        var currentProtocol = window.location.protocol,
            isValid = currentProtocol.search(/^https?/) > -1,
            parentProtocol;

        if (isValid) { return currentProtocol; }

        try {
            parentProtocol = window.parent.location.protocol;
        } catch(e) {
            parentProtocol = 'http:';
        }

        return parentProtocol;
    }());

    function libUrl(url) {
        return protocol + '//lib.cinema6.com/' + url;
    }

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            async: 'lib/async',
            youtube: 'lib/youtube',
            modernizr: libUrl('modernizr/modernizr.custom.71747'),
            jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery.min'),
            angular: libUrl('angular/v1.2.12-0-g5cc5cc1/angular.min'),
            angularAnimate: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.min'),
            angularSanitize: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-sanitize.min'),
            angularTouch: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.min'),
            c6ui: libUrl('c6ui/v2.5.0-0-gc58e712/c6uilib.min'),
            c6log: libUrl('c6ui/v2.5.0-0-gc58e712/c6log.min'),
            adtech: protocol + '//aka-cdn.adtechus.com/dt/common/DAC'
        },
        shim: {
            modernizr: {
                exports: 'Modernizr'
            },
            angular: {
                deps: ['jquery'],
                exports: 'angular'
            },
            angularAnimate: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('ngAnimate');
                }
            },
            angularSanitize: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('ngSanitize');
                }
            },
            angularTouch: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('ngTouch');
                }
            },
            c6ui: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('c6.ui');
                }
            },
            c6log: {
                deps: ['angular','c6_defines'],
                init: function(angular) {
                    return angular.module('c6.log');
                }
            }
        }
    });

    define( ['angular','app','modernizr'],
    function( angular , app , modernizr ) {
        var extraModules =  modernizr.touch ? ['angularTouch'] : [];

        require(extraModules, function() {
            var args = Array.prototype.slice.call(arguments);

            var moduleNames = args.map(function(module) {
                return module.name;
            });

            return angular.bootstrap(document.documentElement, [app.name].concat(moduleNames));
        });

        return true;
    });
}());
