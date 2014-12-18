define( ['angular','angularAnimate','angularSanitize','c6uilib','c6log','c6_defines','modernizr',
         'minireel','services','tracker','templates','cache',
         'ui/paginator','ui/table_of_contents','ui/thumb_paginator'],
function( angular , angularAnimate , angularSanitize , c6uilib , c6log , c6Defines  , modernizr ,
          minireel , services , tracker , templates , cache ,
          uiPaginator  , uiTableOfContents    , uiThumbPaginator   ) {
    'use strict';

    return angular.module('c6.rumble', [
        // Lib Dependencies
        angularAnimate.name,
        angularSanitize.name,
        c6uilib.name,
        c6log.name,
        'c6.http',
        // App Files
        templates.name,
        cache.name,
        minireel.name,
        services.name,
        tracker.name,
        uiPaginator.name,
        uiTableOfContents.name,
        uiThumbPaginator.name
    ])
        .config(['c6BrowserInfoProvider',
        function( c6BrowserInfoProvider ) {
            c6BrowserInfoProvider.setModernizr(modernizr);
        }])
        .config(['trackerServiceProvider', function(trackerServiceProvider){
            trackerServiceProvider.api('c6Tracker');
        }])
        .config(['$sceProvider',
        function( $sceProvider ) {
            $sceProvider.enabled(false);
        }])
        .config(['c6UrlMakerProvider',
        function( c6UrlMakerProvider ) {
            c6UrlMakerProvider.location(c6Defines.kCollateralUrl,'collateral');
            c6UrlMakerProvider.location(c6Defines.kApiUrl,'api');
            c6UrlMakerProvider.location(c6Defines.kProtocol + '/', 'protocol');
            c6UrlMakerProvider.location(c6Defines.kEnvUrlRoot,'envroot');
        }])
        .config(['VPAIDServiceProvider', function(VPAIDServiceProvider) {
            VPAIDServiceProvider.swfUrl(c6Defines.kProtocol + '//lib.cinema6.com/c6ui/v3.1.0-0-g58b71cd/videos/swf/player.swf');
        }])
        .config(['YouTubeDataServiceProvider',
        function( YouTubeDataServiceProvider ) {
            YouTubeDataServiceProvider.apiKey('AIzaSyBYOutFJ1yBx8MAYy5OgtTvslvBiFk8wok');
        }])
        .constant('adTags', {
            vast: {
                cinema6: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                publisher: 'http://u-ads.adap.tv/a/h/DCQzzI0K2runZ1YEc6FP2ey+WPdagwFmdz7a2uK_A_c=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'cinema6-publisher': 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvadnVgRzoU_Z7L5Y91qDAWYoGast41+eSw==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'publisher-cinema6': 'http://u-ads.adap.tv/a/h/DCQzzI0K2runZ1YEc6FP2fCQPSbU6FwIZz5J5C0Fsw29iCueyXx8iw==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
            },
            vpaid: {
                cinema6: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                publisher: 'http://u-ads.adap.tv/a/h/DCQzzI0K2runZ1YEc6FP2T65tHqs_Nwo9+XmsX4pnb4=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'cinema6-publisher': 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvadnVgRzoU_ZPrm0eqz83CjfbcCg1uJO3w==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'publisher-cinema6': 'http://u-ads.adap.tv/a/h/DCQzzI0K2runZ1YEc6FP2fCQPSbU6FwIdK4EW3jlLzbnPQftO7fDdA==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
            }
        })
        .filter('percent',function(){
            return function(input){
                return Math.round(isNaN(input) ? 0 : (input * 100)) + '%';
            };
        })
        .filter('envroot', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return function(url) {
                var isBlob = (/^blob:/).test(url || '');

                return url && (isBlob ? url : c6UrlMaker(url.replace(/^\//,''), 'envroot'));
            };
        }])
        .filter('collateral', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return function(url) {
                return url && c6UrlMaker(url, 'collateral');
            };
        }])
        .factory('_default',[function(){
            return function _default(a,s,v){ if (a[s] === undefined){ a[s] = v; } };
        }])
        .factory('numberify',function(){
            return function numberify(v,d) {
                var result = parseInt(v,10);
                if (isNaN(result)){
                    return d;
                }
                return result;
            };
        })
        .factory('playerInterface',['c6EventEmitter',function(c6EventEmitter){
            return function(){
                return c6EventEmitter({
                    play        : angular.noop,
                    pause       : angular.noop,
                    getType     : angular.noop,
                    getVideoId  : angular.noop,
                    twerk       : angular.noop,
                    isReady     : angular.noop,
                    currentTime : 0,
                    ended       : false,
                    twerked     : false,
                    duration    : NaN,
                    paused      : true
                });
            };
        }])
        .directive('c6Touch', ['$parse', 'c6AppData',
        function              ( $parse ,  c6AppData ) {
            return {
                restrict: 'AC',
                link: function(scope, element, attrs) {
                    var fn = $parse(attrs.c6Touch),
                        touching = false;

                    function cancel() {
                        touching = false;
                    }

                    function resume() {
                        touching = true;
                    }

                    function handle(event) {
                        event.preventDefault();

                        scope.$apply(function() {
                            fn(scope, {
                                $event: event
                            });
                        });
                    }

                    element.on('touchstart touchenter', resume);
                    element.on('touchleave touchcancel', cancel);

                    element.on('touchend', function(event) {
                        if (!touching || attrs.disabled) { return; }
                        handle(event);
                    });

                    if(!c6AppData.profile.touch) {
                        element.on('click', handle);
                    }
                }
            };
        }])
        .directive('c6BgImg', [function() {
            return {
                restrict: 'AC',
                link: function(scope, element, attrs) {
                    attrs.$observe('c6BgImg', function(src) {
                        element.css('background-image', (src || '') && ('url("' + src + '")'));
                    });
                }
            };
        }])
        .filter('asset', ['c6AppData',
        function         ( c6AppData ) {
            return function(url, base) {
                var mode = c6AppData.mode;

                return mode && (base + '/' + mode + '/' + url);
            };
        }])
        .filter('branding', ['c6AppData','c6UrlMaker',
        function            ( c6AppData , c6UrlMaker ) {
            return function(url, base) {
                var mode = c6AppData.mode,
                    experience = c6AppData.experience,
                    branding = (experience && experience.data.branding) || null;

                return mode && branding &&
                    c6UrlMaker(
                        'branding/' + branding + '/' + base + '/' + mode + '/' + url,
                        'collateral'
                    );
            };
        }])
        .factory('c6AppData', ['cinema6','$http','c6UrlMaker','$q','MiniReelService',
        function              ( cinema6 , $http , c6UrlMaker , $q , MiniReelService ) {
            var c6AppData = {
                mode: null
            };

            function getResponsiveStyles(version) {
                if (!version) {
                    version = 0;
                }

                return $http.get('config/responsive-' + version + '.json', {
                    cache: true
                });
            }

            function setMode(obj, data) {
                var device = data.profile.device,
                    mode = data.experience.data.mode;

                obj.mode = (device === 'phone') ? 'mobile' : (mode || 'full');
            }

            function setBehaviors(obj, mode) {
                function isMode() {
                    return Array.prototype.slice.call(arguments)
                        .some(function(value) {
                            return value === mode;
                        });
                }

                function isNotMode() {
                    return Array.prototype.slice.call(arguments)
                        .every(function(value) {
                            return value !== mode;
                        });
                }

                obj.behaviors = {
                    canAutoplay: isNotMode('mobile'),
                    inlineVoteResults: isMode('mobile'),
                    separateTextView: false,
                    fullscreen: isNotMode('light'),
                    showsCompanionWithVideoAd: isMode('lightbox', 'lightbox-playlist', 'solo-ads')
                };
            }

            cinema6.getAppData()
                .then(function(appData) {
                    angular.copy(appData, c6AppData);

                    if (!c6AppData.experience.data.adConfig) {
                        c6AppData.experience.data.adConfig = {
                            video: {
                                firstPlacement: 1,
                                frequency: 3,
                                waterfall: 'cinema6',
                                skip: 6
                            },
                            display: {
                                waterfall: 'cinema6'
                            }
                        };
                    }

                    c6AppData.experience.data.social = MiniReelService.createSocialLinks(
                        appData.experience.data.links
                    );

                    setMode(c6AppData, appData);
                    setBehaviors(c6AppData, c6AppData.mode);

                    c6AppData.version = appData.version || 0;

                    return $q.all([getResponsiveStyles(appData.version), cinema6.getSession()]);
                }).then(function(promises) {
                    var styles = promises[0].data,
                        session = promises[1];

                    session.ping('responsiveStyles', styles[c6AppData.mode] || null);
                    session.on('mrPreview:updateExperience', function(experience) {
                        experience.data.social = MiniReelService.createSocialLinks(
                            experience.data.links
                        );
                        c6AppData.experience = experience;
                    });
                });

            return c6AppData;
        }])
        .controller('AppController', ['$scope','$log','cinema6','c6UrlMaker','$timeout',
                                      '$document','$window','c6Debounce','$animate','c6AppData',
                                      'trackerService',
        function                     ( $scope , $log , cinema6 , c6UrlMaker , $timeout ,
                                       $document , $window , c6Debounce , $animate , c6AppData ,
                                       trackerService ) {
            $log = $log.context('AppCtrl');
            $log.info('Location:',$window.location);
            var _app = {
                    state: 'splash'
                },
                app = {
                    data: c6AppData
                },
                session,
                tracker = trackerService('c6mr');

            function gotoDeck() {
                $animate.enabled(true);
                _app.state = 'deck';
                session.ping('open');
            }

            function gotoSplash() {
                cinema6.fullscreen(false);
                _app.state = 'splash';
                session.ping('close');
            }

            $animate.enabled(false);

            Object.defineProperties(app, {
                state: {
                    get: function() {
                        return _app.state;
                    }
                }
            });

            $scope.$on('reelStart', gotoDeck);
            $scope.$on('reelReset', gotoSplash);

            $log.info('loaded.');

            $scope.app = app;

            session = cinema6.init();

            session.on('initAnalytics',function(cfg){
                $log.info('Init analytics with accountId: %1, clientId: %2',
                    cfg.accountId, cfg.clientId);
                var trackerProps = {
                    'checkProtocolTask' : angular.noop
                };
                tracker.create(cfg.accountId, {
                    'name'          : 'c6mr',
                    'clientId'      : cfg.clientId,
                    'storage'       : 'none',
                    'cookieDomain'  : 'none'
                });
                if (!$window.location.hostname){
                    try {
                        trackerProps.hostname = $window.parent.location.hostname;
                    }
                    catch (e){
                        $log.info('Failed to set hostname to parent:',e);
                    }
                }
                tracker.set(trackerProps);
                tracker.trackEvent({
                    eventCategory: 'Debug',
                    eventAction: 'Init',
                    eventLabel : app.data.experience.data.title,
                    page : '/' + app.data.experience.id,
                    nonInteraction: 1,
                    dimension11: c6Defines.kHref
                });
                $scope.$broadcast('analyticsReady');
            });

            session.on('mrPreview:updateMode', function() {
                $window.location.reload();
            });

            session.on('show', function() {
                $scope.$broadcast('shouldStart');
            });
        }]);
});
