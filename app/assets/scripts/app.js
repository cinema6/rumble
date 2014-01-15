(function(window$){
    'use strict';

    angular.module('c6.rumble', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide',
        function( $provide ) {
            var config = {
                modernizr: 'Modernizr',
                gsap: [
                    'TimelineLite',
                    'TimelineMax',
                    'TweenLite',
                    'TweenMax',
                    'Back',
                    'Bounce',
                    'Circ',
                    'Cubic',
                    'Ease',
                    'EaseLookup',
                    'Elastic',
                    'Expo',
                    'Linear',
                    'Power0',
                    'Power1',
                    'Power2',
                    'Power3',
                    'Power4',
                    'Quad',
                    'Quart',
                    'Quint',
                    'RoughEase',
                    'Sine',
                    'SlowMo',
                    'SteppedEase',
                    'Strong'
                ],
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
        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
        }])
        .config(['$routeProvider','c6UrlMakerProvider',
        function($routeProvider,c6UrlMakerProvider){
            $routeProvider.otherwise(/*'/experience',*/{
                templateUrl     : c6UrlMakerProvider.makeUrl('views/experience.html'),
                controller      : 'RumbleController',
                controllerAs    : 'RumbleCtrl',
                resolve : {
                    'appData' : 'appData'
                }
            });
            /*
            .otherwise({
                templateUrl: c6UrlMakerProvider.makeUrl('views/landing.html')
            });
            */
        }])
        .filter('percent',function(){
            return function(input){
                return Math.round((input * 100)) + '%';
            };
        })
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
                    reset       : angular.noop,
                    getType     : angular.noop,
                    getVideoId  : angular.noop,
                    isReady     : angular.noop
                });
            };
        }])
        .factory('appData',['$q','$rootScope',function($q,$rootScope){
            var deferred = $q.defer();
            $rootScope.$on('appInit',function(event,appData){
                deferred.resolve(appData);
            });
            return deferred.promise;
        }])
        .controller('AppController', ['$scope','$route','$log',
        'cinema6', 'c6ImagePreloader', 'gsap'/*, 'googleAnalytics'*/,'appData',
        function($scope, $route, $log, cinema6, c6ImagePreloader, gsap/*, googleAnalytics*/) {
            $log = $log.context('AppCtrl');
            var self = this;

            $log.info('loaded.');

            this.src = function(src) {
                var profile = self.profile,
                    modifiers = {
                        slow: '--low',
                        average: '--med',
                        fast: '--high'
                    },
                    speed, webp, extArray, ext;

                if (!src || !profile) {
                    return null;
                }

                speed = profile.speed;
                webp = profile.webp;
                extArray = src.split('.');
                ext = extArray[extArray.length - 1];

                if (webp && speed !== 'slow') {
                    return src.replace(('.' + ext), (modifiers[speed] + '.webp'));
                } else {
                    return src.replace(('.' + ext), (modifiers[speed] + '.' + ext));
                }
            };

            cinema6.init({
                setup: function(data) {
                    self.experience = data.experience;
                    self.profile    = data.profile;
                    $scope.$emit('appInit',data);
                    gsap.TweenLite.ticker.useRAF(self.profile.raf);
                    return c6ImagePreloader.load([self.src(self.experience.img.hero)]);
                }
            });

            $scope.$on('$routeChangeStart', function(event,next,current){
                $log.info('$routeChangeStart:',next,current);
            });

            $scope.$on('$routeChangeSuccess', function(event,next,current){
                $log.info('$routeChangeSuccess:',next,current);
                //googleAnalytics('send', 'event', '$state', 'changed', next.state.name);
            });
        }]);
}(window));
