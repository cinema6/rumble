(function() {
    'use strict';

    define(['youtube'], function() {
        describe('DailymotionCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6EventEmitter,
                DailymotionCardCtrl;

            var EventService,
                ModuleService,
                ControlsService;

            function Tracker(events) {
                events.forEach(function(event) {
                    this[event] = {
                        emitCount: 0
                    };
                }.bind(this));

                EventService._.trackers.push(this);
            }

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.value('EventService', {
                        trackEvents: jasmine.createSpy('EventService.trackEvents()')
                            .andCallFake(function(emitter, events) {
                                return new Tracker(events);
                            }),
                        _: {
                            trackers: []
                        }
                    });

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

                    EventService = $injector.get('EventService');
                    ModuleService = $injector.get('ModuleService');
                    ControlsService = $injector.get('ControlsService');

                    $rootScope.config = {
                        modules: ['ballot', 'comments']
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

                        it('should set _data.modules.ballot.active to true', function() {
                            expect($scope.config._data.modules.ballot.active).toBe(true);
                        });

                        it('should set _data.modules.displayAd.active to true', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });
                });
            });

            describe('@public', function() {
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
