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
            youtube: 'lib/youtube',
            modernizr: libUrl('modernizr/modernizr.custom.71747'),
            jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery.min'),
            angular: libUrl('angular/v1.3.6-0-g6ad109e/angular.min'),
            angularAnimate: libUrl('angular/v1.3.6-0-g6ad109e/angular-animate.min'),
            angularSanitize: libUrl('angular/v1.3.6-0-g6ad109e/angular-sanitize.min'),
            angularTouch: libUrl('angular/v1.3.6-0-g6ad109e/angular-touch.min'),
            c6uilib: libUrl('c6ui/v3.5.1-0-gc8468d2/c6uilib.min'),
            c6log: libUrl('c6ui/v3.5.1-0-gc8468d2/c6log.min'),
            adtech: [
                protocol + '//aka-cdn.adtechus.com/dt/common/DAC',
                'backup/shmadshteck'
            ]
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
            adtech: {
                exports: 'ADTECH'
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
