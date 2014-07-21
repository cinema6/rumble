define( ['angular','angularAnimate','angularSanitize','c6ui','c6log','c6_defines','modernizr',
         'minireel','services','tracker','templates','cache',
         'ui/paginator','ui/table_of_contents','ui/thumb_paginator'],
function( angular , angularAnimate , angularSanitize , c6ui , c6log , c6Defines  , modernizr ,
          minireel , services , tracker , templates , cache ,
          uiPaginator  , uiTableOfContents    , uiThumbPaginator   ) {
    'use strict';

    return angular.module('c6.mrplayer', [
        // Lib Dependencies
        angularAnimate.name,
        angularSanitize.name,
        c6ui.name,
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
        .config(['VASTServiceProvider', 'VPAIDServiceProvider',
        function( VASTServiceProvider, VPAIDServiceProvider ) {
            VASTServiceProvider.adTags({
                cinema6: 'http://u-ads.adap.tv/a/h/jSmRYUB6OAj1k0TZythPvTfWmlP8j6NQ7PLXxjjb3_8=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                publisher: 'http://u-ads.adap.tv/a/h/jSmRYUB6OAinZ1YEc6FP2ey+WPdagwFmCGZaBkvRjnc=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'cinema6-publisher': 'http://u-ads.adap.tv/a/h/jSmRYUB6OAj1k0TZythPvadnVgRzoU_Z7L5Y91qDAWYqO9LOfrpuqQ==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'publisher-cinema6': 'http://u-ads.adap.tv/a/h/jSmRYUB6OAinZ1YEc6FP2fCQPSbU6FwIZz5J5C0Fsw2tnkCzhk2yTw==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
            });
            VPAIDServiceProvider.adTags({
                cinema6: 'http://u-ads.adap.tv/a/h/jSmRYUB6OAj1k0TZythPvYyD60pQS_90Geh1rmQXJf8=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                publisher: 'http://u-ads.adap.tv/a/h/jSmRYUB6OAinZ1YEc6FP2eOeZCYQ_JsM?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'cinema6-publisher': 'http://u-ads.adap.tv/a/h/jSmRYUB6OAj1k0TZythPvadnVgRzoU_ZPrm0eqz83CjPXEF4pAnE3w==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                'publisher-cinema6': 'http://u-ads.adap.tv/a/h/jSmRYUB6OAinZ1YEc6FP2fCQPSbU6FwIdK4EW3jlLza+WaaKRuPC_g==?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
            });
        }])
        .filter('percent',function(){
            return function(input){
                return Math.round(isNaN(input) ? 0 : (input * 100)) + '%';
            };
        })
        .filter('envroot', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return function(url) {
                return url && c6UrlMaker(url.replace(/^\//,''), 'envroot');
            };
        }])
        .filter('collateral', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return function(url) {
                return url && c6UrlMaker(url, 'collateral');
            };
        }])
        .filter('timestamp', ['dateFilter','$window',
        function             ( dateFilter , $window ) {
            return function(epoch) {
                var jsEpoch = (epoch * 1000),
                    date = new $window.Date(jsEpoch),
                    daysAgo = Math.round(Math.abs(($window.Date.now() - date.getTime()) / 86400000));

                if (!daysAgo) {
                    return dateFilter(date, 'h:mm a').toLowerCase();
                }

                return daysAgo + ' day' + ((daysAgo > 1) ? 's' : '') + ' ago';
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
        .directive('c6DockAnchor', ['$window',
        function                   ( $window ) {
            return {
                restrict: 'EA',
                link: function(scope, element, attrs) {
                    var window$ = angular.element($window),
                        positionEvent = ('c6-dock-anchor(' + attrs.id + '):position'),
                        dockEvent = ('c6-dock(' + attrs.id + '):linked');

                    function notifyPosition() {
                        var top = element.prop('offsetTop'),
                            left = element.prop('offsetLeft'),
                            height = element.prop('offsetHeight'),
                            width = element.prop('offsetWidth'),
                            position = {
                                top: top,
                                right: left + width,
                                bottom: top + height,
                                left: left
                            };

                        scope.$broadcast(positionEvent, position, element.prop('offsetParent'));
                    }

                    if (!attrs.id) {
                        throw new Error('c6-dock-anchor requires an id.');
                    }

                    scope.$on(dockEvent, notifyPosition);
                    window$.on('resize', notifyPosition);

                    scope.$on('$destroy', function() {
                        window$.off('resize', notifyPosition);
                    });

                    notifyPosition();
                }
            };
        }])
        .directive('c6Dock', [function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var configs = (function() {
                            return attrs.c6Dock.split(/,\s*/).map(function(param) {
                                var parts = param.split(' to '),
                                    anchorParts = parts[1].split(':');

                                return {
                                    prop: parts[0],
                                    anchorId: anchorParts[0],
                                    anchorPosition: anchorParts[1]
                                };
                            });
                        }());

                    angular.forEach(configs, function(config) {
                        var positionEvent = ('c6-dock-anchor(' + config.anchorId + '):position'),
                            dockEvent = ('c6-dock(' + config.anchorId + '):linked');

                        scope.$on(positionEvent, function(event, position, offsetParent) {
                            if (offsetParent !== element.prop('offsetParent')) {
                                throw new Error('Cannot dock ' + attrs.c6Dock + ' because the element to dock has a different offsetParent than its anchor.');
                            }

                            element.css(config.prop, (position[config.anchorPosition] + 'px'));
                        });

                        scope.$broadcast(dockEvent);
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
        .factory('c6AppData', ['cinema6','$http','c6UrlMaker','$q',
        function              ( cinema6 , $http , c6UrlMaker , $q ) {
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
                    var result = false;

                    angular.forEach(Array.prototype.slice.call(arguments), function(val) {
                        if(mode === val) { result = true; }
                    });

                    return result;
                }

                obj.behaviors = {
                    canAutoplay: isMode('light', 'lightbox', 'lightbox-ads'),
                    inlineVoteResults: isMode('full', 'mobile'),
                    separateTextView: isMode('full'),
                    fullscreen: isMode('mobile', 'lightbox', 'lightbox-ads'),
                    showsCompanionWithVideoAd: isMode('lightbox', 'lightbox-ads')
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

                    setMode(c6AppData, appData);
                    setBehaviors(c6AppData, c6AppData.mode);

                    c6AppData.version = appData.version || 0;

                    return $q.all([getResponsiveStyles(appData.version), cinema6.getSession()]);
                }).then(function(promises) {
                    var styles = promises[0].data,
                        session = promises[1];

                    session.ping('responsiveStyles', styles[c6AppData.mode] || null);
                    session.on('mrPreview:updateExperience', function(experience) {
                        c6AppData.experience = experience;
                    });
                });

            return c6AppData;
        }])
        .controller('AppController', ['$scope','$log','cinema6','c6UrlMaker','$timeout',
                                      '$document','$window','c6Debounce','$animate','c6AppData',
                                      'trackerService','$q',
        function                     ( $scope , $log , cinema6 , c6UrlMaker , $timeout ,
                                       $document , $window , c6Debounce , $animate , c6AppData ,
                                       trackerService , $q ) {
            $log = $log.context('AppCtrl');
            $log.info('Location:',$window.location);
            var _app = {
                    state: 'splash'
                },
                app = {
                    data: c6AppData
                },
                readyDeferred = $q.defer(),
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

            function waitForReady() {
                return readyDeferred.promise;
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

            $scope.$on('ready', function() {
                readyDeferred.resolve(true);
            });

            $log.info('loaded.');

            $scope.app = app;

            session = cinema6.init({
                setup: function() {
                    return waitForReady();
                }
            });

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
