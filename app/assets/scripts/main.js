(function(){
    'use strict';

    var protocol = (window.c6 || (window.c6 = {})).kProtocol = (function() {
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
        paths: {
            async: 'lib/async',
            speed: 'lib/speed',
            youtube: 'lib/youtube',
            modernizr: libUrl('modernizr/modernizr.custom.71747'),
            jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery.min'),
            angular: libUrl('angular/v1.2.22-0-g93b0c2d/angular.min'),
            angularAnimate: libUrl('angular/v1.2.22-0-g93b0c2d/angular-animate.min'),
            angularSanitize: libUrl('angular/v1.2.22-0-g93b0c2d/angular-sanitize.min'),
            angularTouch: libUrl('angular/v1.2.22-0-g93b0c2d/angular-touch.min'),
            c6uilib: libUrl('c6ui/v3.7.0-0-gfe2d995/c6uilib.min.js?cb=' + Date.now()),
            c6log: libUrl('c6ui/v3.7.0-0-gfe2d995/c6log.min'),
            adtech: [
                protocol + '//aka-cdn.adtechus.com/dt/common/DAC',
                'backup/shmadshteck'
            ]
        },

        waitSeconds: 0,

        shim: {
            c6uilib: {
                deps: ['angular']
            },
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
            adtech: {
                exports: 'ADTECH'
            }
        },

        deps: ['speed!c6uilib'],

        config: {
            speed: {
                c6uilib: 51.2
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
