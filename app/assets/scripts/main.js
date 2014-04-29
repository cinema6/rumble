(function(){
    /*jshint -W080 */
    'use strict';

    var c6 = window.c6,
        appScripts, libScripts;

    function libUrl(url) {
        return 'http://lib.cinema6.com/' + url;
    }

    c6.kLocal = (c6.kBaseUrl === 'assets');
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = (c6.kDebug) ? ['error','warn','log','info'] : [];
    c6.kModDeps = ['c6.ui', 'c6.state', 'c6.log', 'c6.drag', 'ngAnimate'];
    c6.kExpUrl = '/apps';
    c6.kCollateralUrl = '/collateral';

    appScripts = c6.kLocal ? [
        'scripts/app',
        'scripts/services',
        'scripts/manager',
        'scripts/players',
        'scripts/editor',
        'scripts/c6_state',
        'scripts/c6_drag',
        'scripts/card_table'
    ] :
    [
        'scripts/c6app.min'
    ];

    libScripts = c6.kLocal ? [
        '//www.youtube.com/iframe_api',
        libUrl('modernizr/modernizr.custom.71747.js'),
        libUrl('jquery/2.0.3-0-gf576d00/jquery.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min.js'),
        libUrl('cryptojs/v3.1.2/sha1.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular-animate.js'),
        libUrl('c6ui/v2.6.1-0-g0d1a105/c6uilib.js'),
        libUrl('c6ui/v2.6.1-0-g0d1a105/c6log.js')
    ] :
    [
        '//www.youtube.com/iframe_api',
        libUrl('modernizr/modernizr.custom.71747.js'),
        libUrl('jquery/2.0.3-0-gf576d00/jquery.min.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min.js'),
        libUrl('cryptojs/v3.1.2/sha1.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular.min.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular-animate.min.js'),
        libUrl('c6ui/v2.6.1-0-g0d1a105/c6uilib.min.js'),
        libUrl('c6ui/v2.6.1-0-g0d1a105/c6log.min.js')
    ];

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

    require.config({
        baseUrl:  c6.kBaseUrl,
        paths: {
            hammer: c6.kLocal ?
                libUrl('hammer.js/1.0.9-0-g308cb9a/hammer') :
                libUrl('hammer.js/1.0.9-0-g308cb9a/hammer.min')
        }
    });


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
                c6.kLocal ?
                    libUrl('angular/v1.2.14-0-g729fb13/angular-touch.js') :
                    libUrl('angular/v1.2.14-0-g729fb13/angular-touch.min.js')
            ],
            nope: [
                libUrl('c6ui/v2.6.1-0-g0d1a105/css/c6uilib--hover.min.css'),
                c6.kBaseUrl + '/styles/main--hover.css'
            ],
            complete: function() {
                if (Modernizr.touch) { c6.kModDeps.push('ngTouch'); }

                loadScriptsInOrder(appScripts, function() {
                    angular.bootstrap(document.documentElement, ['c6.mrmaker']);
                });
            }
        });
    });
}());
