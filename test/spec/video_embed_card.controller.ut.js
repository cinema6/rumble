(function() {
    'use strict';

    define(['youtube'], function() {
        describe('VideoEmbedCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6EventEmitter,
                VideoEmbedCardCtrl;

            var ModuleService,
                ControlsService;

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.value('ModuleService', {
                        hasModule: jasmine.createSpy('ModuleService.hasModule()')
                    });

                    $provide.value('ControlsService', {
                        bindTo: jasmine.createSpy('ControlsService.bindTo()')
                    });
                });

                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    ModuleService = $injector.get('ModuleService');
                    ControlsService = $injector.get('ControlsService');

                    $rootScope.config = {
                        modules: ['ballot', 'comments'],
                        data: {
                            videoid: 'gy1B3agGNxw'
                        }
                    };
                    $scope = $rootScope.$new();
                    VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(VideoEmbedCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    var origData;

                    beforeEach(function() {
                        origData = $rootScope.config._data = {};

                        VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                    });

                    it('should not overwrite the data', function() {
                        expect($scope.config._data).toBe(origData);
                    });
                });

                describe('if the config has no _data', function() {
                    it('should create some data', function() {
                        expect($scope.config._data).toEqual({
                            playerEvents: {},
                            modules: {
                                ballot: {
                                    active: false,
                                    vote: null
                                },
                                displayAd: {
                                    active: false
                                }
                            }
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('active', function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({});

                        $scope.$emit('playerAdd', iface);
                    });

                    describe('when not active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should not bind to the controls', function() {
                            expect(ControlsService.bindTo).not.toHaveBeenCalled();
                        });
                    });

                    describe('when active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should bind to the controls', function() {
                            expect(ControlsService.bindTo).toHaveBeenCalledWith(iface);
                        });
                    });
                });
            });

            describe('events', function() {
                describe('playerAdd', function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({
                            webHref: 'https://www.youtube.com/watch?v=oMB5YFtWQTE'
                        });
                        spyOn(iface, 'once').andCallThrough();

                        $scope.$emit('playerAdd', iface);
                    });

                    it('should set the controller\'s videoUrl property to the webHref property of the player', function() {
                        iface.emit('ready', iface);

                        expect(VideoEmbedCardCtrl.videoUrl).toBe(iface.webHref);
                    });

                    it('should attach a listener to the "play" event', function() {
                        expect(iface.once).toHaveBeenCalledWith('play', jasmine.any(Function));
                    });

                    describe('when "play" is emitted', function() {
                        beforeEach(function() {
                            iface.emit('play', iface);
                        });

                        it('should set _data.modules.displayAd.active to true', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });

                    describe('config._data.modules.ballot.active', function() {
                        var ballot;

                        beforeEach(function() {
                            ballot = $scope.config._data.modules.ballot;
                        });

                        it('should be a computed property that is true when the video is paused or ended and false when there are votes or the video is playing', function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                                iface.paused = true;
                                iface.ended = false;
                            });
                            expect(ballot.active).toBe(false);

                            $scope.$apply(function() {
                                iface.emit('play', iface);
                                iface.paused = false;
                                iface.ended = false;
                            });
                            expect(ballot.active).toBe(false);

                            $scope.$apply(function() {
                                iface.ended = true;
                            });
                            expect(ballot.active).toBe(true);

                            $scope.$apply(function() {
                                iface.paused = true;
                                iface.ended = false;
                            });
                            expect(ballot.active).toBe(true);

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            expect(ballot.active).toBe(false);

                            $scope.$apply(function() {
                                $scope.active = true;
                                ballot.vote = 0;
                            });
                            expect(ballot.active).toBe(false);
                        });

                        it('should be temporarily overrideable by VideoEmbedCardCtrl.dismissBallot()', function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                                iface.emit('play', iface);
                                iface.emit('play', iface);
                                iface.paused = true;
                                iface.ended = false;
                            });
                            expect(ballot.active).toBe(true);

                            $scope.$apply(function() {
                                VideoEmbedCardCtrl.dismissBallot();
                            });
                            expect(ballot.active).toBe(false);

                            $scope.$apply(function() {
                                iface.paused = false;
                                iface.emit('play', iface);
                            });
                            expect(ballot.active).toBe(false);

                            $scope.$apply(function() {
                                iface.ended = true;
                            });
                            expect(ballot.active).toBe(true);
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('videoUrl', function() {
                        it('should be initialized as null', function() {
                            expect(VideoEmbedCardCtrl.videoUrl).toBeNull();
                        });
                    });

                    describe('flyAway', function() {
                        describe('if the ballot module is not enabled', function() {
                            beforeEach(function() {
                                spyOn(VideoEmbedCardCtrl, 'hasModule').andCallFake(function(module) {
                                    if (module === 'ballot') {
                                        return false;
                                    }
                                });
                            });

                            it('should be false', function() {
                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);

                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);

                                $scope.$apply(function() {
                                    $scope.active = true;
                                    $scope.config._data.modules.ballot.active = true;
                                });
                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                            });
                        });

                        describe('if the ballot module is enabled', function() {
                            beforeEach(function() {
                                spyOn(VideoEmbedCardCtrl, 'hasModule').andCallFake(function(module) {
                                    if (module === 'ballot') {
                                        return true;
                                    }
                                });
                            });

                            it('should be true if the ballot module is active', function() {
                                $scope.$apply(function() {
                                    $scope.config._data.modules.ballot.active = true;
                                    $scope.active = true;
                                });

                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });

                            it('should be true if the card is not active', function() {
                                $scope.$apply(function() {
                                    $scope.config._data.modules.ballot.active = false;
                                    $scope.active = false;
                                });
                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('hasModule(module)', function() {
                        it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                            VideoEmbedCardCtrl.hasModule('ballot');
                            expect(ModuleService.hasModule).toHaveBeenCalledWith($rootScope.config.modules, 'ballot');

                            VideoEmbedCardCtrl.hasModule('comments');
                            expect(ModuleService.hasModule).toHaveBeenCalledWith($rootScope.config.modules, 'comments');
                        });
                    });
                });
            });
        });
    });
}());
