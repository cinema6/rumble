(function($window){
    /* jshint camelcase:false */
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return (/\.(ut|it)\.js$/).test(file);
    }),
        packageRequest = new XMLHttpRequest();

    packageRequest.open('GET', '/base/settings.json');
    packageRequest.send();

    $window.ga = function() {};

    packageRequest.onload = function(event) {
        var settings = JSON.parse(event.target.response),
            appDir = settings.appDir;

        function libUrl(url) {
            return 'http://lib.cinema6.com/' + url;
        }

        if (appDir.indexOf('<%') > -1) {
            $window.console.warn('PhantomJS can\'t interpolate Grunt templates. Using default.');
            appDir = 'app';
        }

        requirejs({
            baseUrl: '/base/' + appDir + '/assets/scripts',
            paths: {
                async: 'lib/async',
                speed: 'lib/speed',
                youtube: 'lib/youtube',
                modernizr: libUrl('modernizr/modernizr.custom.71747'),
                jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery'),
                angular: libUrl('angular/v1.2.12-0-g5cc5cc1/angular'),
                angularAnimate: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate'),
                angularSanitize: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-sanitize'),
                angularTouch: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch'),
                angularMocks: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-mocks'),
                c6uilib: libUrl('c6ui/v3.6.2-0-gb68b1d6/c6uilib'),
                c6log: libUrl('c6ui/v3.6.2-0-gb68b1d6/c6log'),
                adtech: 'http://aka-cdn.adtechus.com/dt/common/DAC',
                templates   : '/base/.tmp/templates'
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
                angularMocks: {
                    deps: ['angular']
                },
                adtech: {
                    exports: 'ADTECH'
                }
            }
        });

        require(['c6_defines', 'angularMocks'], function(c6Defines) {
            c6Defines.kHasKarma = true;

            require(tests, $window.__karma__.start);
        });
    };
}(window));
