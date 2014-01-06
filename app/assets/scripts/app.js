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
            c6UrlMakerProvider.location(c6Defines.kVideoUrls[(function() {
                return 'local';
            }())] ,'video');
        }])
        .config(['$routeProvider','$locationProvider','c6UrlMakerProvider',
        function($routeProvider,$locationProvider,c6UrlMakerProvider){
            $routeProvider.when('/experience',{
                templateUrl: c6UrlMakerProvider.makeUrl('views/experience.html'),
                controller: 'RumbleController'
            })
            .otherwise({
                templateUrl: c6UrlMakerProvider.makeUrl('views/landing.html')
            });
        }])
        /*
        .config(['$stateProvider', '$urlRouterProvider', 'c6UrlMakerProvider',
        function( $stateProvider ,  $urlRouterProvider ,  c6UrlMakerProvider ) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('landing', {
                    templateUrl: c6UrlMakerProvider.makeUrl('views/landing.html'),
                    url: '/'
                })
                .state('experience', {
                    templateUrl: c6UrlMakerProvider.makeUrl('views/experience.html'),
                    controller: 'RumbleController',
                    url: '/experience'
                })
                .state('experience.video', {
                    templateUrl: c6UrlMakerProvider.makeUrl('views/video.html'),
                    url: '/video/:item'
                })
                .state('experience.result', {
                    templateUrl: c6UrlMakerProvider.makeUrl('views/result.html'),
                    url: '/result/:item'
                });
        }])
        */
        .factory('_default',[function(){
            return function _default(a,s,v){ if (a[s] === undefined){ a[s] = v; } };
        }])
        .filter('percent',function(){
            return function(input){
                return Math.round((input * 100)) + '%';
            };
        })
        .value('$state',{})
        .controller('AppController', ['$scope','$state','$route','$location', '$window', '$log', 'site', 'c6ImagePreloader', 'gsap', '$timeout', 'googleAnalytics', 'c6AniCache',
        function                     ( $scope , $state, $route, $location, $window , $log ,  site ,  c6ImagePreloader ,  gsap ,  $timeout ,  googleAnalytics, c6AniCache ) {
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

            this.goto = function(state,toParams,options) {
                $log.info('GOTO STATE:',state);
                $location.url(state);
                //$state.go(state,toParams,options);
            };

            site.init({
                setup: function(appData) {
                    self.experience = appData.experience;
                    self.profile = appData.profile;

                    self.playList = self.experience.data.playList;

                    gsap.TweenLite.ticker.useRAF(self.profile.raf);

                    return c6ImagePreloader.load([self.src(self.experience.img.hero)]);
                }
            });

            site.getSession().then(function(session) {
                session.on('gotoState', function(state) {
                    if (state === 'start') {
                        self.goto('landing');
                    }
                });
            });

            $scope.$on('$routeChangeStart', function(event,next,current){
                $log.info('$routeChangeStart:',next,current);
            });

            $scope.$on('$routeChangeSuccess', function(event,next,current){
                $log.info('$routeChangeSuccess:',next,current);
//                googleAnalytics('send', 'event', '$state', 'changed', next.state.name);
            });

            $scope.AppCtrl = this;

            c6AniCache.enabled(true);
            
        }])
        .directive('c6Hidden', ['$animate', function($animate) {
            return {
                scope: true,
                restrict: 'A',
                link: function(scope, element, attrs) {

                    scope.hidden = function() {
                        return scope.$eval(attrs.c6Hidden);
                    };

                    scope.$watch('hidden()', function(hidden) {
                        if (hidden){
                            $animate.addClass(element,'hidden',function(){
                                element.css({'visibility': 'hidden', 'opacity' : 0});
                            });
                        } else {
                            $animate.removeClass(element,'hidden',function(){
                                element.css({'visibility': 'visible', 'opacity' : 1});
                            });
                        }
                        /*
                        var canAnimate = ( (attrs.ngAnimate) &&
                            (!(element.parent().inheritedData('$ngAnimateController') || angular.noop).running) );
                        if (hidden) {
                            if (canAnimate) {
                                animate.animate('hidden', element);
                            } else {
                                element.css({'visibility': 'hidden', 'opacity' : 0});
                            }
                        } else {
                            if (canAnimate) {
                                animate.animate('visible', element);
                            } else {
                                element.css({'visibility': 'visible', 'opacity' : 1});
                            }
                        }
                        */
                    });
                }
            };
        }]);
}(window));
