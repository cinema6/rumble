(function(window$){
    'use strict';

    angular.module('c6.rumble', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide',
        function( $provide ) {
            $provide.decorator('cinema6', ['$delegate', '$q',
            function                      ( $delegate ,  $q ) {
                var mocks = {};

                $delegate.db = {
                    mock: function(query, value) {
                        mocks[angular.toJson(query)] = value;

                        return $delegate.db;
                    },

                    find: function(query) {
                        var deferred = $q.defer(),
                            mock = mocks[angular.toJson(query)];

                        if (!mock) {
                            deferred.reject({ code: 404, message: 'Could not find experience with query: "' + angular.toJson(query) + '"' });
                        } else {
                            deferred.resolve(angular.copy(mock));
                        }

                        return deferred.promise;
                    }
                };

                return $delegate;
            }]);
        }])
        .config(['$sceProvider',
        function( $sceProvider ) {
            $sceProvider.enabled(false);
        }])
        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
            c6UrlMakerProvider.location(c6Defines.kCollateralUrl,'collateral');
            c6UrlMakerProvider.location(c6Defines.kApiUrl,'api');
        }])
        .config(['VASTServiceProvider', 'VPAIDServiceProvider',
        function( VASTServiceProvider, VPAIDServiceProvider ) {
            VASTServiceProvider.adServerUrl('http://u-ads.adap.tv/a/h/CbyYsMcIh10+XoGWvwRuGArwmci9atPoLiGQaGjtyrT4ht6z4qOJpQ==?cb=%5BCACHE_BREAKER%5D&pageUrl=http%3A%2F%2Ftest.com&eov=eov');
            // VASTServiceProvider.adServerUrl('http://u-ads.adap.tv/a/h/5+_0LDFk+KwoWa_HApVt0qDrdJaixbMD?cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov');
            VPAIDServiceProvider.adServerUrl('http://u-ads.adap.tv/a/h/AiVnje_CA3BJsRMP0_gPXAtRyCRFRZSd?cb=[CACHE_BREAKER]&pageUrl=http%3A%2F%2Ftribal360.com&description=[params.videoDesc]&duration=[params.videoDuration]&id=[params.videoId]&keywords=[params.keywords]&title=[params.videoTitle]&url=VIDEO_URL&eov=eov');
        }])
        .run(   ['cinema6',
        function( cinema6 ) {
            cinema6.db
                .mock({ id: ['1', '2', '3'] }, [
                    {
                        id: '1',
                        title: 'The 15 Most Legendary Pro Wrestling  Intros Of All Time',
                        summary: [
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ornare ',
                            'libero ut fermentum pharetra. Praesent convallis pulvinar neque id ',
                            'sollicitudin.'
                        ].join(''),
                        data: {}
                    }
                ]);
        }])
        .filter('percent',function(){
            return function(input){
                return Math.round((input * 100)) + '%';
            };
        })
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
        .directive('c6Touch', ['$parse',
        function              ( $parse ) {
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

                    element.on('touchstart touchenter', resume);
                    element.on('touchleave touchcancel', cancel);

                    element.on('touchend', function(event) {
                        if (!touching) { return; }

                        scope.$apply(function() {
                            fn(scope, {
                                $event: event
                            });
                        });
                    });
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
        .filter('asset', ['c6AppData','c6UrlMaker',
        function         ( c6AppData , c6UrlMaker ) {
            return function(url, base) {
                var mode = c6AppData.mode;

                return mode && c6UrlMaker(base + '/' + mode + '/' + url);
            };
        }])
        .factory('c6AppData', ['cinema6','$http','c6UrlMaker','$q',
        function              ( cinema6 , $http , c6UrlMaker , $q ) {
            var c6AppData = {
                    mode: null
                },
                getResponsiveStyles = $http.get(c6UrlMaker('config/responsive.json'));

            function setMode(obj, data) {
                var device = data.profile.device,
                    mode = data.experience.mode;

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
                    autoplay: isMode('light', 'lightbox', 'lightbox-ads'),
                    inlineVoteResults: isMode('full', 'mobile'),
                    separateTextView: isMode('full'),
                    fullscreen: isMode('mobile', 'lightbox', 'lightbox-ads')
                };
            }

            cinema6.getAppData()
                .then(function(appData) {
                    angular.copy(appData, c6AppData);

                    setMode(c6AppData, appData);
                    setBehaviors(c6AppData, c6AppData.mode);

                    return $q.all([getResponsiveStyles, cinema6.getSession()]);
                }).then(function(promises) {
                    var styles = promises[0].data,
                        session = promises[1];

                    session.ping('responsiveStyles', styles[c6AppData.mode] || {});
                });

            return c6AppData;
        }])
        .controller('AppController', ['$scope','$log','cinema6','c6UrlMaker','$timeout','$document','$window','c6Debounce','$animate','c6AppData',
        function                     ( $scope , $log , cinema6 , c6UrlMaker , $timeout , $document , $window , c6Debounce , $animate , c6AppData ) {
            $log = $log.context('AppCtrl');
            var _app = {
                    state: 'splash'
                },
                app = {
                    data: c6AppData
                },
                session;

            $animate.enabled(false);

            Object.defineProperties(app, {
                state: {
                    get: function() {
                        return _app.state;
                    }
                }
            });

            function gotoDeck() {
                $animate.enabled(true);
                _app.state = 'deck';
            }

            function gotoSplash() {
                cinema6.fullscreen(false);
                _app.state = 'splash';
            }

            $scope.$on('reelStart', gotoDeck);
            $scope.$on('reelReset', gotoSplash);


            $log.info('loaded.');

            $scope.app = app;

            session = cinema6.init();

            session.on('initAnalytics',function(cfg){
                $log.info('Init analytics with accountId: %1, clientId: %2',
                    cfg.accountId, cfg.clientId);
                $window.c6MrGa('create', cfg.accountId, {
                    'name'      : 'c6mr',
                    'clientId'  : cfg.clientId
                });
                $window.c6MrGa('c6mr.send', 'pageview', {
                    'page'  : '/mr/load?experienceId=' + c6AppData.experience.id,
                    'title' : 'Minireel App Load'
                });
                $window.console.log($window.c6MrGa);
            });
        }]);
}(window));
