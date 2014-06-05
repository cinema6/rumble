(function(){
    'use strict';

    var __C6_BUILD_VERSION__ = window.__C6_BUILD_VERSION__ = undefined,
        c6 = window.c6 = (window.c6 || {});

    require.config({
        baseUrl: c6.kBaseUrl
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
    });
}());
