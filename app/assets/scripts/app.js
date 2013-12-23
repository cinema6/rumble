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
        .controller('AppController', ['$scope','$state', '$window', '$log', 'site', 'c6ImagePreloader', 'gsap', '$timeout', 'googleAnalytics', 'c6AniCache',
        function                     ( $scope , $state, $window , $log ,  site ,  c6ImagePreloader ,  gsap ,  $timeout ,  googleAnalytics, c6AniCache ) {
            $log = $log.context('AppCtrl');
            var self = this,
                readyToLand = true;

            $log.info('loaded.');

            this.currentItem = 0;

            this.goBack = function(){
                $window.history.back();
            };

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

            this.goto = function(state,toParams) {
                $state.go(state,toParams);
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

            $scope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                $log.info('State Change Start: %1 (%2) ===> %3 (%4)',
                    fromState.name,fromParams.item,toState.name,toParams.item);
               
                // If the state transition does not involve the landing, or the
                // app is ready to land, return so the state change can be finished.
                if ( ((fromState.name !== 'landing') && (toState.name !== 'landing')) ||
                    (readyToLand) ){
                    return;
                }

                // If we reached this point it means that the app is transitioning
                // to or from the landing page and we need to show our transition animation
                event.preventDefault();

                site.requestTransitionState(true).then(function() {
                    readyToLand = true;

                    self.goto(toState.name,toParams);

                    site.requestTransitionState(false);
                });
            });

            $scope.$on('$stateChangeSuccess',
                function(event,toState,toParams,fromState,fromParams){
                $log.info('State Change Success: %1 (%2) ===> %3 (%4)',
                    fromState.name,fromParams.item,toState.name,toParams.item);

                if (toState.name === 'experience.video'){
                    self.currentItem = parseInt(toParams.item,10);
                    $scope.$broadcast('newVideo',self.currentItem);
                }
                googleAnalytics('send', 'event', '$state', 'changed', toState.name);
                
                readyToLand = false;
            });

            $scope.AppCtrl = this;

            c6AniCache.enabled(true);
            
        }]);
}(window));
