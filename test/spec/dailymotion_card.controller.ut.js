(function() {
    'use strict';

    define(['youtube'], function() {
        describe('DailymotionCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6EventEmitter,
                DailymotionCardCtrl;

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
                            videoid: 'x1bx4ir'
                        }
                    };
                    $scope = $rootScope.$new();
                    DailymotionCardCtrl = $controller('DailymotionCardController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(DailymotionCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    var origData;

                    beforeEach(function() {
                        origData = $rootScope.config._data = {};

                        DailymotionCardCtrl = $controller('DailymotionCardController', { $scope: $scope });
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
                        iface = c6EventEmitter({});
                        spyOn(iface, 'once').andCallThrough();

                        $scope.$emit('playerAdd', iface);
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

                    it('should turn config._data.modules.ballot.active into a computed property that is true when the video is paused or ended and false when there are votes or the video is playing', function() {
                        var ballot = $scope.config._data.modules.ballot;

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
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('videoUrl', function() {
                        it('should be computed based on the video\'s id', function() {
                            expect(DailymotionCardCtrl.videoUrl).toBe('http://www.dailymotion.com/video/x1bx4ir');

                            $scope.$apply(function() {
                                $rootScope.config.data.videoid = 'x1btkdy';
                            });
                            expect(DailymotionCardCtrl.videoUrl).toBe('http://www.dailymotion.com/video/x1btkdy');
                        });
                    });
                });

                describe('methods', function() {
                    describe('hasModule(module)', function() {
                        it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                            DailymotionCardCtrl.hasModule('ballot');
                            expect(ModuleService.hasModule).toHaveBeenCalledWith($rootScope.config.modules, 'ballot');

                            DailymotionCardCtrl.hasModule('comments');
                            expect(ModuleService.hasModule).toHaveBeenCalledWith($rootScope.config.modules, 'comments');
                        });
                    });
                });
            });
        });
    });
}());
