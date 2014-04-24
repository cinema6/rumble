(function(window$){
    /* jshint -W106 */
    'use strict';

    var noop = angular.noop,
        copy = angular.copy;

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

            var newSubstates = {
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
            };

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
                        embed: {
                            controller: 'GenericController',
                            controllerAs: 'ManagerEmbedCtrl',
                            templateUrl: assets('views/manager/embed.html'),
                            model:  ['c6StateParams',
                            function( c6StateParams ) {
                                return c6StateParams.minireelId;
                            }]
                        },
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
                            updateControllerModel: ['controller','model',
                            function               ( controller , model ) {
                                controller.model = model;

                                controller.returnState = 'manager';
                                controller.baseState = 'manager.new';
                            }],
                            children: copy(newSubstates)
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
                        splash: {
                            controller: 'GenericController',
                            controllerAs: 'EditorSplashCtrl',
                            templateUrl: assets('views/editor/splash.html')
                        },
                        setMode: {
                            controller: 'GenericController',
                            controllerAs: 'NewCtrl',
                            templateUrl: assets('views/manager/new.html'),
                            model:  ['cinema6','$q',
                            function( cinema6 , $q ) {
                                function getModes() {
                                    return cinema6.getAppData()
                                        .then(function returnModes(appData) {
                                            return appData.experience.data.modes;
                                        });
                                }

                                return this.cModel ||
                                    $q.all({
                                        modes: getModes(),
                                        minireel: this.cParent.cModel
                                    });
                            }],
                            updateControllerModel: ['controller','model',
                            function               ( controller , model ) {
                                controller.model = model;

                                controller.returnState = 'editor';
                                controller.baseState = 'editor.setMode';
                            }],
                            children: copy(newSubstates)
                        },
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

            this.config = null;
            cinema6.getAppData()
                .then(function setControllerProps(appData) {
                    self.config = appData.experience;
                });

            cinema6.init({
                setup: function(appData) {
                    gsap.TweenLite.ticker.useRAF(appData.profile.raf);
                }
            });

            $scope.AppCtrl = this;
        }])

        .directive('embedCode', ['c6UrlMaker',
        function                ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/embed_code.html'),
                controller: 'EmbedCodeController',
                controllerAs: 'Ctrl',
                scope: {
                    minireelId: '@'
                }
            };
        }])

        .controller('EmbedCodeController', ['$scope','cinema6',
        function                           ( $scope , cinema6 ) {
            var self = this;

            this.modes = [
                {
                    name: 'Responsive Auto-fit *',
                    value: 'responsive'
                },
                {
                    name: 'Custom Size',
                    value: 'custom'
                }
            ];
            this.mode = this.modes[0].value;

            this.size = {
                width: 650,
                height: 522
            };

            this.c6EmbedSrc = null;
            cinema6.getAppData()
                .then(function setC6EmbedSrc(data) {
                    self.c6EmbedSrc = data.experience.data.c6EmbedSrc;
                });

            Object.defineProperties(this, {
                code: {
                    get: function() {
                        return '<script src="' +
                            this.c6EmbedSrc +
                            '" data-exp="' +
                            $scope.minireelId +
                            '"' + (this.mode === 'custom' ?
                                (' data-width="' +
                                    this.size.width +
                                    '" data-height="' +
                                    this.size.height + '"') :
                                '') +
                            '></script>';
                    }
                }
            });
        }]);
}(window));
