(function() {
    'use strict';

    define(['vpaid_card'], function() {
        describe('VpaidCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                $interval,
                $log,
                VpaidCardController,
                c6EventEmitter;

            var ModuleService;

            function IFace() {
                var self = this;

                this.play = jasmine.createSpy('iface.play()')
                    .andCallFake(function() {
                        self.emit('play', self);
                    });
                this.pause = jasmine.createSpy('iface.pause()')
                    .andCallFake(function() {
                        self.emit('pause', self);
                    });
                this.loadAd = jasmine.createSpy('iface.loadAd()');
                this.isReady = jasmine.createSpy('iface.isReady()');
                this.paused = true;
                this.currentTime = 0;
                this.duration = NaN;

                c6EventEmitter(this);
            }

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.value('ModuleService', {
                        hasModule: jasmine.createSpy('ModuleService.hasModule()')
                    });
                });

                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $interval = $injector.get('$interval');
                    $log = $injector.get('$log');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    ModuleService = $injector.get('ModuleService');

                    $log.context = function() { return $log; };
                    $scope = $rootScope.$new();
                    $scope.config = {
                        data: {
                            autoplay: true,
                            skip: 6
                        },
                        modules: ['displayAd']
                    };
                    $scope.profile = {
                        touch: false
                    };
                    $scope.$apply(function() {
                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(VpaidCardController).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    it('should not overwrite the data', function() {
                        var origData = $scope.config._data = {};

                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });

                        expect($scope.config._data).toBe(origData);
                    });
                });

                describe('if the config has no _data', function() {
                    it('should create some data', function() {
                        expect($scope.config._data).toEqual({
                            playerEvents: {},
                            modules: {
                                displayAd: {
                                    active: false
                                }
                            }
                        });
                    });
                });
            });

            describe('@properties', function() {
                describe('showVideo', function() {
                    it('should be true if the card is active', function() {
                        $scope.active = true;
                        expect(VpaidCardController.showVideo).toBe(true);

                        $scope.active = false;
                        expect(VpaidCardController.showVideo).toBe(false);
                    });

                    it('should be false if the display ad is active', function() {
                        $scope.active = true;
                        expect(VpaidCardController.showVideo).toBe(true);

                        $scope.config._data.modules.displayAd.active = true;
                        expect(VpaidCardController.showVideo).toBe(false);
                    });
                });

                describe('showPlay', function() {
                    var iface;

                    beforeEach(function() {
                        iface = new IFace();
                    });

                    it('should be false by default and if player hasn\'t been added', function() {
                        expect(VpaidCardController.showPlay).toBe(false);
                    });

                    it('should be true if not played yet and player is ready', function() {
                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                            $scope.config._data.modules.displayAd.active = false;
                        });

                        expect(VpaidCardController.showPlay).toBe(true);
                    });

                    it('should be true if player has been added', function() {
                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                        });

                        expect(VpaidCardController.showPlay).toBe(true);
                    });

                    it('should be false if it is playing', function() {
                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                            $scope.config._data.playerEvents.play.emitCount = 1;
                            iface.paused = false;
                        });

                        expect(VpaidCardController.showPlay).toBe(false);
                    });
                });
            });

            describe('@methods', function() {
                describe('hasModule(module)', function() {
                    it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                        VpaidCardController.hasModule('displayAd');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'displayAd');
                    });
                });

                describe('reset()', function() {
                    var iface;

                    beforeEach(function() {
                        iface = new IFace();

                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                        });

                        $scope.config._data.modules.displayAd.active = true;
                        iface.paused = true;

                        VpaidCardController.reset();
                    });

                    it('should restart the video from the beginning', function() {
                        expect(iface.play).toHaveBeenCalled();
                    });
                });
            });

            describe('player events', function() {
                var iface;

                beforeEach(function() {
                    iface = new IFace();

                    $scope.$apply(function() {
                        $scope.$emit('playerAdd', iface);
                    });

                    spyOn($scope, '$emit').andCallThrough();
                });

                describe('ended', function() {
                    describe('if there is a displayAd', function() {
                        beforeEach(function() {
                            VpaidCardController.companion = {};

                            iface.emit('ended', iface);
                        });

                        it('should not $emit the contentEnd event', function() {
                            expect($scope.$emit).not.toHaveBeenCalledWith('<vpaid-card>:contentEnd', $scope.config);
                        });

                        it('should activate the display ad', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });

                    describe('if there is no displayAd', function() {
                        it('should emit the contentEnd event', function() {
                            iface.emit('ended', iface);

                            expect($scope.$emit).toHaveBeenCalledWith('<vpaid-card>:contentEnd', $scope.config);
                        });
                    });
                });

                describe('play', function() {
                    it('should deactivate the displayAd', function() {
                        iface.emit('play', iface);

                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });
                });

                describe('pause', function() {
                    it('should activate the displayAd', function() {
                        ModuleService.hasModule.andReturn(true);
                        iface.emit('pause', iface);

                        expect($scope.config._data.modules.displayAd.active).toBe(true);
                    });
                });

                describe('getCompanions', function() {
                    it('should get the companions from the player that is $emitted', function() {
                        var companionObject = {
                                    sourceCode: '<div></div>',
                                    width: 300,
                                    height: 250
                                },
                            player = {
                                getDisplayBanners: function() {
                                    return [companionObject];
                                }
                            };

                        iface.emit('getCompanions', player);

                        expect(VpaidCardController.companion).toBe(companionObject);
                    });
                });
            });

            describe('$watchers', function() {
                describe('active', function() {
                    var iface;

                    beforeEach(function() {
                        iface = new IFace();

                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                        });
                    });

                    describe('when initialized', function() {
                        it('should not call loadAd', function() {
                            expect(iface.play).not.toHaveBeenCalled();
                        });
                    });

                    describe('when true', function() {
                        beforeEach(function() {
                            spyOn($scope,'$emit').andCallThrough();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should play the ad', function() {
                            expect(iface.play).toHaveBeenCalled();
                        });

                        it('should $emit <vpaid-card>:init', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('<vpaid-card>:init', jasmine.any(Function))
                        });

                        it('should only $emit <vpaid-card>:init if it has not played yet', function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            iface.emit('play', iface);
                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            expect($scope.$emit.callCount).toBe(1);
                        });

                        describe('when controlling the navigation', function() {
                            var control, navController;

                            beforeEach(function() {
                                control = $scope.$emit.mostRecentCall.args[1];

                                navController = {
                                    enabled: jasmine.createSpy('navController.enabled()')
                                        .andCallFake(function() { return navController; }),
                                    tick: jasmine.createSpy('navController.tick()')
                                        .andCallFake(function() { return navController; })
                                };
                            });

                            describe('when ad is skippable', function() {
                                it('should do nothing', function() {
                                    $scope.config.data.skip = true;

                                    $scope.$apply(function() {
                                        control(navController);
                                    });
                                });
                            });

                            describe('when ad is not skippable', function() {
                                beforeEach(function() {
                                    $scope.config.data.skip = false;

                                    $scope.$apply(function() {
                                        control(navController);
                                    });
                                });

                                it('should disable the navigation', function() {
                                    expect(navController.enabled).toHaveBeenCalledWith(false);
                                });

                                it('should not tick the navigation with the duration', function() {
                                    expect(navController.tick).not.toHaveBeenCalled();
                                });

                                it('should tick the nav on an interval once the currentTime begins changing', function() {
                                    $interval.flush(500);
                                    expect(navController.tick).not.toHaveBeenCalled();

                                    $scope.$apply(function() {
                                        iface.currentTime = 0.5;
                                        iface.duration = 10;
                                    });

                                    $interval.flush(1000);
                                    expect(navController.tick).toHaveBeenCalledWith(iface.duration - iface.currentTime);

                                    $scope.$apply(function() {
                                        iface.currentTime = 1.857;
                                    });

                                    $interval.flush(1500);
                                    expect(navController.tick).toHaveBeenCalledWith(iface.duration - iface.currentTime);
                                });

                                it('should re-enable the nav when the ad ends', function() {
                                    iface.emit('ended', iface);
                                    expect(navController.enabled).toHaveBeenCalledWith(true);

                                    $scope.$apply(function() {
                                        iface.currentTime = 0.5;
                                        iface.duration = 10;
                                    });

                                    $interval.flush(1000);
                                    expect(navController.tick).not.toHaveBeenCalled();
                                });
                            });

                            describe('when ad is skippable after a period of time', function() {
                                describe('if ad does not autoplay', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.config.data.autoplay = false;
                                            $scope.config.data.skip = 6;

                                            control(navController);
                                        });
                                    });

                                    it('should disable the nav', function() {
                                        expect(navController.enabled).toHaveBeenCalledWith(false);
                                    });

                                    it('should tick the nav with the configured wait time', function() {
                                        expect(navController.tick).toHaveBeenCalledWith($scope.config.data.skip);
                                    });

                                    it('should tick the navigation once every second with remainging time', function() {
                                        var elapsed = 0;

                                        function tick() {
                                            elapsed++;
                                            $interval.flush(1000);
                                        }

                                        for (var count = 0; count < 4; count++) {
                                            tick();
                                            expect(navController.tick).toHaveBeenCalledWith($scope.config.data.skip - elapsed);
                                        }
                                    });

                                    it('should enable the navigation when the countdown completes', function() {
                                        $interval.flush(7000);
                                        expect(navController.enabled).toHaveBeenCalledWith(true);

                                        $interval.flush(1000);
                                        expect(navController.tick.callCount).toBe(7);
                                    });
                                });

                                describe('if ad does autoplay', function() {
                                    var wait;

                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.config.data.autoplay = true;
                                            $scope.config.data.skip = 6;

                                            control(navController);
                                        });

                                        wait = $scope.config.data.skip;
                                    });

                                    it('should disable the nev', function() {
                                        expect(navController.enabled).toHaveBeenCalledWith(false);
                                    });

                                    it('should tick the navigation with the skip wait length', function() {
                                        expect(navController.tick).toHaveBeenCalledWith(wait);
                                    });

                                    it('should tick the navigation with the remaining wait time, synced with the video', function() {
                                        iface.currentTime = 0.7;
                                        $interval.flush(500);
                                        expect(navController.tick).toHaveBeenCalledWith(wait - iface.currentTime);

                                        iface.currentTime = 1.256;
                                        $interval.flush(1000);
                                        expect(navController.tick).toHaveBeenCalledWith(wait - iface.currentTime);
                                    });

                                    it('should not tick the navigation below 0', function() {
                                        iface.currentTime = 7.25;
                                        $interval.flush(1000);

                                        expect(navController.tick.mostRecentCall.args[0]).not.toBeLessThan(0);
                                    });

                                    it('should enable the navigation when the wait time is finished', function() {
                                        iface.currentTime = 7.25;
                                        $interval.flush(1000);
                                        expect(navController.enabled).toHaveBeenCalledWith(true);

                                        iface.currentTime = 8.35;
                                        $interval.flush(1500);
                                        expect(navController.tick.callCount).toBe(2);
                                    });
                                });
                            });
                        });

                    });

                    describe('when false', function() {
                        it('should pause the ad if ad is playing', function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                                iface.paused = false;
                            });
                            expect(iface.pause).toHaveBeenCalled();
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });
                });

                describe('onDeck', function() {
                    describe('when true should set the displayAd src', function() {
                        var iface;

                        beforeEach(function() {
                            iface = new IFace();

                            $scope.$apply(function() {
                                $scope.$emit('playerAdd', iface);
                                $scope.onDeck = true;
                            });
                        });

                        it('to undefined if there is no display ad', function() {
                            expect($scope.config._data.modules.displayAd.src).toBe(undefined);
                        });

                        it('to the url from config', function() {
                            $scope.onDeck = false;
                            $scope.$digest();

                            $scope.$apply(function() {
                                $scope.config.displayAd = 'htpp://test.com/image.jpg';
                                $scope.onDeck = true;
                            });

                            expect($scope.config._data.modules.displayAd.src).toBe('htpp://test.com/image.jpg');
                        });

                        it('should load an ad', function() {
                            expect(iface.loadAd).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
