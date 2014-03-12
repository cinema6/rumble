(function(){
    'use strict';

    var __C6_BUILD_VERSION__ = window.__C6_BUILD_VERSION__ = undefined,
        __C6_APP_BASE_URL__ = window.__C6_APP_BASE_URL__ = __C6_BUILD_VERSION__ || 'assets',
        c6 = window.c6;

    require.config({
        baseUrl:  __C6_APP_BASE_URL__
    });

    var libUrl = function(url) {
            var libBase = (function() {
                switch (c6.kEnv) {
                case 'dev':
                case 'staging':
                    return c6.kLibUrls.dev;
                case 'release':
                    return c6.kLibUrls.release;
                }
            }());

            libUrl = function(url) {
                return libBase + url;
            };

            return libUrl(url);
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
                    'scripts/dailymotion',
                    'scripts/iframe',
                    'scripts/rumble',
                    'scripts/table_of_contents',
                    'scripts/vimeo',
                    'scripts/youtube',
                    'scripts/mini_reel_card',
                    'scripts/video_card',
                    'scripts/vast_card',
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
                    libUrl('c6ui/v2.4.1-0-gfb81912/c6uilib.min.js'),
                    libUrl('c6ui/v2.4.1-0-gfb81912/c6log.min.js'),
                    'https://www.youtube.com/iframe_api'
                ];
            } else {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-sanitize.js'),
                    libUrl('c6ui/v2.4.1-0-gfb81912/c6uilib.js'),
                    libUrl('c6ui/v2.4.1-0-gfb81912/c6log.js'),
                    'https://www.youtube.com/iframe_api'
                ];
            }
        }());
/*
    window.onYouTubeIframeAPIReady = function(){
        window.console.log('onYouTubeIframeAPIReady');
    };
*/
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

    c6.kBaseUrl = __C6_APP_BASE_URL__;
    c6.kLocal = (c6.kBaseUrl === 'assets');
    c6.kDebug = (c6.kEnv === 'dev' || c6.kEnv === 'staging');
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = (c6.kDebug) ? ['error','warn','log','info'] : [];
    c6.kCollateralUrls = {
        dev: 'http://s3.amazonaws.com/c6.dev/media/src/site/collateral',
        cdn: 'http://cinema6.com/collateral'
    };
    c6.kApiUrls = {
        local: '/api',
        beta: 'http://staging.cinema6.com/api',
        prod: 'http://cinema6.com/api'
    };
    c6.kModDeps = ['c6.rumble.services', 'ngAnimate', 'ngSanitize', 'c6.ui', 'c6.log'];
    
    if (window.location.host.match(/\/\/(www\.)*cinema6.com/) !== null){
        ga('create', 'UA-44457821-2', 'cinema6.com');
    } else {
        ga('create', 'UA-44457821-1', { 'cookieDomain' : 'none' });
    }

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
