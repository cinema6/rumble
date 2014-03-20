(function(window$){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.mrmaker', window$.c6.kModDeps)
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

        .config(['cinema6Provider','c6UrlMakerProvider',
        function( cinema6Provider , c6UrlMakerProvider ) {
            var FixtureAdapter = cinema6Provider.adapters.fixture;

            FixtureAdapter.config = {
                jsonSrc: c6UrlMakerProvider.makeUrl('mock/fixtures.json')
            };

            cinema6Provider.useAdapter(FixtureAdapter);
        }])

        .config(['c6StateProvider','c6UrlMakerProvider',
        function( c6StateProvider , c6UrlMakerProvider ) {
            var assets = c6UrlMakerProvider.makeUrl.bind(c6UrlMakerProvider);

            c6StateProvider
                .state('manager', {
                    controller: 'ManagerController',
                    controllerAs: 'ManagerCtrl',
                    templateUrl: assets('views/manager.html'),
                    model:  ['cinema6',
                    function( cinema6 ) {
                        return cinema6.db.findAll('currentUser')
                            .then(function(currentUsers) {
                                var user = currentUsers[0];

                                return cinema6.db.findAll('experience', { appUri: 'rumble', org: user.org });
                            });
                    }]
                })
                .state('editor', {
                    controller: 'EditorController',
                    controllerAs: 'EditorCtrl',
                    templateUrl: assets('views/editor.html'),
                    model:  ['cinema6','c6StateParams','MiniReelService',
                    function( cinema6 , c6StateParams , MiniReelService ) {
                        return cinema6.db.find('experience', c6StateParams.id)
                            .then(function(minireel) {
                                return MiniReelService.open(minireel);
                            });
                    }]
                })
                .index('manager');
        }])

        .controller('AppController', ['$scope', '$log', 'cinema6', 'gsap',
        function                     ( $scope ,  $log ,  cinema6 ,  gsap ) {
            var self = this;

            $log.info('AppCtlr loaded.');

            cinema6.init({
                setup: function(appData) {
                    self.experience = appData.experience;
                    self.profile = appData.profile;

                    gsap.TweenLite.ticker.useRAF(self.profile.raf);
                }
            });

            $scope.AppCtrl = this;
        }]);
}(window));
