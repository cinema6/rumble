(function($window){
    /* jshint camelcase:false */
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return (/\.(ut|it)\.js$/).test(file);
    }),
        packageRequest = new XMLHttpRequest(),
        c6 = $window.c6 = {};

    packageRequest.open('GET', '/base/settings.json');
    packageRequest.send();

    $window.ga = function() {};

    c6.kBaseUrl = 'assets';
    c6.kLocal = true;
    c6.kDebug = true;
    c6.kHasKarma = true;
    c6.kLogFormats = true;
    c6.kLogLevels = ['error','warn','log','info'];
    c6.kEnvUrlRoot = (c6.kEnvUrlRoot || 'http://foo.cinema6.com');
    c6.kCollateralUrl = (c6.kCollateralUrl || (c6.envUrlRoot + '/collateral'));
    c6.kApiUrl = '/api';
    c6.kModDeps = ['c6.rumble.services', 'c6.ui', 'c6.log'];
    c6.kProtocol = 'http:';

    packageRequest.onload = function(event) {
        var settings = JSON.parse(event.target.response),
            appDir = settings.appDir;

        function libUrl(url) {
            return 'http://s3.amazonaws.com/c6.dev/ext/' + url;
        }

        if (appDir.indexOf('<%') > -1) {
            $window.console.warn('PhantomJS can\'t interpolate Grunt templates. Using default.');
            appDir = 'app';
        }

        $window.requirejs({
            baseUrl: '/base/' + appDir + '/assets/scripts',

            paths: {
                angular     : libUrl('angular/v1.2.12-0-g5cc5cc1/angular'),
                angularMocks: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-mocks'),
                jquery      : libUrl('jquery/2.0.3-0-gf576d00/jquery'),
                modernizr   : libUrl('modernizr/modernizr.custom.71747'),
                tweenmax    : libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min'),
                timelinemax : libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min'),
                c6ui        : libUrl('c6ui/v2.5.0-0-gc58e712/c6uilib'),
                c6log       : libUrl('c6ui/v2.5.0-0-gc58e712/c6log'),
                templates   : '/base/.tmp/templates'
            },

            shim: {
                angular: {
                    deps: ['jquery']
                },
                angularMocks: {
                    deps: ['angular']
                },
                angularRoute: {
                    deps: ['angular']
                },
                timelinemax: {
                    deps: ['tweenmax']
                },
                c6ui: {
                    deps: ['angular']
                },
                c6log: {
                    deps: ['c6ui']
                },
                templates: {
                    deps: ['app']
                },
                app: {
                    deps: ['angular', 'angularMocks', 'modernizr', 'timelinemax', 'c6ui', 'c6log']
                },
                rumble: {
                    deps: ['angular', 'angularMocks', 'c6ui', 'c6log', 'app']
                },
                iframe: {
                    deps: ['angular', 'angularMocks', 'c6ui', 'c6log', 'app']
                },
                dailymotion: {
                    deps: ['angular', 'angularMocks', 'c6ui', 'c6log', 'app']
                },
                youtube: {
                    deps: ['angular', 'angularMocks', 'c6ui', 'c6log', 'app']
                },
                vimeo: {
                    deps: ['angular', 'angularMocks', 'c6ui', 'c6log', 'app']
                },
                services: {
                    deps: ['app']
                },
                recap_card: {
                    deps: ['app']
                },
                video_card: {
                    deps: ['app']
                },
                ad_card: {
                    deps: ['app']
                },
                vast_card: {
                    deps: ['app']
                },
                vpaid_card: {
                    deps: ['app']
                },
                ballot_module: {
                    deps: ['app']
                },
                comments_module: {
                    deps: ['app']
                },
                display_ad_module: {
                    deps: ['app']
                },
                table_of_contents: {
                    deps: ['app']
                },
                paginator: {
                    deps: ['app']
                },
                thumb_paginator: {
                    deps: ['app']
                },
                tracker: {
                    deps: ['app']
                }
            },

            priority: [
                'angular'
            ],

            deps: tests,

            callback: $window.__karma__.start
        });

    };
}(window));
