(function(window$){
    'use strict';

    angular.module('c6.rumble', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide',
        function( $provide ) {
            var config = {
                googleAnalytics: 'ga'
            };

            angular.forEach(config, function(value, key) {
                if (angular.isString(value)) {
                    $provide.value(key, window[value]);
                } else if (angular.isArray(value)) {
                    $provide.factory(key, function() {
                        var service = {};

                        angular.forEach(value, function(global) {
                            service[global] = window[global];
                        });

                        return service;
                    });
                }
            });
        }])
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
        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
        }])
        .config(['VASTServiceProvider',
        function( VASTServiceProvider ) {
            VASTServiceProvider.adServerUrl('http://u-ads.adap.tv/a/h/CbyYsMcIh10+XoGWvwRuGArwmci9atPoLiGQaGjtyrT4ht6z4qOJpQ==?cb=%5BCACHE_BREAKER%5D&pageUrl=http%3A%2F%2Ftest.com&eov=eov');
        }])
        .run(   ['cinema6',
        function( cinema6 ) {
            cinema6.db
                .mock({ id: ['1', '2', '3'] }, [
                    {
                        id: '1',
                        title: 'Here\'s Another MiniReel',
                        summary: [
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ornare ',
                            'libero ut fermentum pharetra. Praesent convallis pulvinar neque id ',
                            'sollicitudin. Quisque luctus egestas nisi posuere pharetra. In vel pretium',
                            ' nulla, nec laoreet eros. Nullam posuere tortor sit amet neque dictum, vel',
                            ' sollicitudin dui lobortis.'
                        ].join(''),
                        data: {}
                    },
                    {
                        id: '2',
                        title: '5 Videos of Moo\'s Face',
                        summary: [
                            'Lorem ipsum dolor sit smirk, consectetur smirk elit. Phasellus ornare ',
                            'libero smirk fermentum pharetra. Smirk convallis pulvinar neque id ',
                            'sollicitudin. Quisque luctus egestas smirk posuere pharetra. In smirk pretium',
                            ' nulla, nec laoreet eros. Nullam smirk tortor sit amet neque dictum, vel',
                            ' sollicitudin smirk lobortis.'
                        ].join(''),
                        data: {}
                    },
                    {
                        id: '3',
                        title: '10 Videos of CaesarTheBun',
                        summary: [
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ornare ',
                            'libero ut fermentum pharetra. Praesent convallis pulvinar neque id ',
                            'sollicitudin. Quisque luctus egestas nisi posuere pharetra. In vel pretium',
                            ' nulla, nec laoreet eros. Nullam posuere tortor sit amet neque dictum, vel',
                            ' sollicitudin dui lobortis.'
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
        .factory('myFrame$', ['$window',
        function             ( $window ) {
            return angular.element($window.frameElement);
        }])
        .value('c6Profile', {})
        .controller('AppController', ['$scope','$log','cinema6','c6Computed','c6UrlMaker','c6Profile','$timeout','$document','myFrame$','$window','c6Debounce',
        function                     ( $scope , $log , cinema6 , c6Computed , c6UrlMaker , c6Profile , $timeout , $document , myFrame$ , $window , c6Debounce ) {
            $log = $log.context('AppCtrl');
            var c = c6Computed($scope),
                parentWindow$ = angular.element($window.parent),
                _app = {
                    state: 'splash'
                };

            var app = {
                data: null
            };

            c(app, 'views', function() {
                var data = this.data,
                    profile = data && data.profile,
                    isMobile = profile && (profile.device === 'phone');

                if (!profile) {
                    return {
                        experience: null,
                        deck: null
                    };
                }

                return {
                    experience: c6UrlMaker('views/experience' + (isMobile ? '--mobile' : '') + '.html'),
                    deck: c6UrlMaker('views/deck' + (isMobile ? '--mobile' : '') + '.html')
                };
            }, ['app.data.profile.device']);

            Object.defineProperties(app, {
                state: {
                    get: function() {
                        return _app.state;
                    }
                }
            });

            this.resize = function() {
                $timeout(function() {
                    var height = $document.height();

                    $log.info('iFrame Resizing to ' + height +'px.');
                    myFrame$.height(height);
                }, 50);
            };

            function gotoDeck() {
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

            cinema6.init({
                setup: function(data) {
                    app.data = data;

                    angular.copy(data.profile, c6Profile);

                    if (data.profile.device !== 'phone') {
                        parentWindow$.on('resize', c6Debounce(function() { this.resize(); }.bind(this), 250));
                        $scope.$on('<ballot-vote-module>:vote', this.resize.bind(this));
                    }
                }.bind(this)
            });
        }]);
}(window));
