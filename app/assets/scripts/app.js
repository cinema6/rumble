(function(window$){
    /* jshint -W106 */
    'use strict';

    var noop = angular.noop;

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
                googleAnalytics: 'ga',
                crypto: 'CryptoJS',
                youtube: 'YT'
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

        .config(['$sceDelegateProvider',
        function( $sceDelegateProvider ) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                '*://www.youtube.com/**',
                '*://player.vimeo.com/**',
                '*://www.dailymotion.com/**'
            ]);
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

                                return cinema6.db.findAll(
                                    'experience',
                                    { appUri: 'rumble', org: user.org }
                                );
                            });
                    }],
                    children: {
                        new: {
                            controller: 'GenericController',
                            controllerAs: 'NewCtrl',
                            templateUrl: assets('views/manager/new.html'),
                            model:  ['cinema6','MiniReelService','$q',
                            function( cinema6 , MiniReelService , $q ) {
                                function getModes() {
                                    return cinema6.getAppData()
                                        .then(function returnModes(appData) {
                                            return appData.experience.data.modes;
                                        });
                                }

                                return this.cModel ||
                                    $q.all({
                                        modes: getModes(),
                                        minireel: MiniReelService.create()
                                    });
                            }],
                            children: {
                                category: {
                                    controller: 'NewCategoryController',
                                    controllerAs: 'NewCategoryCtrl',
                                    templateUrl: assets('views/manager/new/category.html'),
                                    model:  [function() {
                                        return this.cParent.cModel.modes;
                                    }]
                                },
                                mode: {
                                    controller: 'NewModeController',
                                    controllerAs: 'NewModeCtrl',
                                    templateUrl: assets('views/manager/new/mode.html'),
                                    model:  ['c6StateParams',
                                    function( c6StateParams ) {
                                        var parentModel = this.cParent.cModel;

                                        return {
                                            minireel: parentModel.minireel,
                                            modes: parentModel.modes.filter(function(mode) {
                                                return mode.value === c6StateParams.newModeValue;
                                            })[0].modes
                                        };
                                    }],
                                    updateControllerModel: ['controller','model',
                                    function               ( controller , model ) {
                                        controller.model = model;
                                        controller.mode = model.modes[0].value;
                                    }]
                                }
                            }
                        }
                    }
                })
                .state('editor', {
                    controller: 'EditorController',
                    controllerAs: 'EditorCtrl',
                    templateUrl: assets('views/editor.html'),
                    model:  ['cinema6','c6StateParams','MiniReelService',
                    function( cinema6 , c6StateParams , MiniReelService ) {
                        return MiniReelService.open(c6StateParams.minireelId);
                    }],
                    children: {
                        editCard: {
                            controller: 'EditCardController',
                            controllerAs: 'EditCardCtrl',
                            templateUrl: assets('views/editor/edit_card.html'),
                            model:  ['c6StateParams','MiniReelService',
                            function( c6StateParams , MiniReelService ) {
                                var minireel = this.cParent.cModel;

                                return MiniReelService.findCard(
                                    minireel.data.deck,
                                    c6StateParams.cardId
                                );
                            }],
                            afterModel: ['model','$q','c6State',
                            function    ( model , $q , c6State ) {
                                var types = ['intro', 'video', 'videoBallot'];

                                if(types.indexOf(model.type) < 0) {
                                    c6State.goTo('editor');

                                    return $q.reject('Cannot edit this card');
                                }
                            }],
                            updateControllerModel: ['controller','model',
                            function               ( controller , model ) {
                                var copy = {
                                        name: 'Editorial Content',
                                        sref: 'editor.editCard.copy'
                                    },
                                    video = {
                                        name: 'Video Content',
                                        sref: 'editor.editCard.video'
                                    },
                                    ballot = {
                                        name: 'Questionnaire',
                                        sref: 'editor.editCard.ballot'
                                    };

                                controller.model = model;
                                controller.tabs = (function() {
                                    switch (model.type) {
                                    case 'video':
                                        return [copy, video];
                                    case 'videoBallot':
                                        return [copy, video, ballot];

                                    default:
                                        return [copy];
                                    }
                                }());
                            }],
                            children: {
                                copy: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardCopyCtrl',
                                    templateUrl: assets('views/editor/edit_card/copy.html'),
                                    model:  [function() {
                                        return this.cParent.cModel;
                                    }]
                                },
                                video: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardVideoCtrl',
                                    templateUrl: assets('views/editor/edit_card/video.html'),
                                    model:  [function() {
                                        return this.cParent.cModel;
                                    }]
                                },
                                ballot: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardBallotCtrl',
                                    templateUrl: assets('views/editor/edit_card/ballot.html'),
                                    model:  [function() {
                                        return this.cParent.cModel.data.ballot;
                                    }],
                                    afterModel: ['model','$q','c6State',
                                    function    ( model , $q , c6State ) {
                                        if (!model) {
                                            c6State.goTo('editor.editCard.video');

                                            return $q.reject('Card doesn\'t support ballots.');
                                        }
                                    }]
                                }
                            }
                        },
                        newCard: {
                            controller: 'NewCardController',
                            controllerAs: 'NewCardCtrl',
                            templateUrl: assets('views/editor/new_card.html'),
                            model: ['MiniReelService',
                            function               ( MiniReelService ) {
                                return this.cModel || MiniReelService.createCard();
                            }]
                        }
                    }
                })
                .index('manager');
        }])

        .controller('GenericController', noop)

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
