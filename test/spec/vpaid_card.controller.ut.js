define(['services', 'cards/vpaid', 'app'], function(servicesModule, vpaidModule, appModule) {
    'use strict';

    describe('VpaidCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            $interval,
            $log,
            $q,
            VpaidCardController,
            c6EventEmitter;

        var ModuleService,
            c6AppData,
            loadAdDeferred,
            startAdDeferred;

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
            this.ended = false;

            c6EventEmitter(this);
        }

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.value('ModuleService', {
                    hasModule: jasmine.createSpy('ModuleService.hasModule()')
                });
            });

            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    experience: {
                        data: {
                            mode: 'light'
                        }
                    }
                });
            });

            module(vpaidModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $interval = $injector.get('$interval');
                $log = $injector.get('$log');
                $q = $injector.get('$q');
                c6EventEmitter = $injector.get('c6EventEmitter');
                ModuleService = $injector.get('ModuleService');
                c6AppData = $injector.get('c6AppData');

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
                    touch: false,
                    inlineVideo: true
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

        describe('when the scope is $destroyed', function() {
            beforeEach(function() {
                spyOn($rootScope, '$broadcast').andCallThrough();
            });

            describe('if the mode is "lightbox"', function() {
                beforeEach(function() {
                    c6AppData.experience.data.mode = 'lightbox';
                    $scope.$apply(function() {
                        $scope.$destroy();
                    });
                });

                it('should $broadcast the resize event', function() {
                    expect($rootScope.$broadcast).toHaveBeenCalledWith('resize');
                });
            });

            ['lightbox-ads', 'full', 'light'].forEach(function(mode) {
                describe('if the mode is "' + mode + '"', function() {
                    beforeEach(function() {
                        c6AppData.experience.data.mode = mode;
                        $scope.$apply(function() {
                            $scope.$destroy();
                        });
                    });

                    it('should not $broadcast the resize event', function() {
                        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('resize');
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

                it('should be true if not played yet and player is ready and player is click-to-play', function() {
                    $scope.$apply(function() {
                        $scope.config.data.autoplay = false;
                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });
                        $scope.$emit('playerAdd', iface);
                        $scope.config._data.modules.displayAd.active = false;
                    });

                    expect(VpaidCardController.showPlay).toBe(true);
                });

                it('should be true if player has been added and is click-to-play', function() {
                    $scope.$apply(function() {
                        $scope.config.data.autoplay = false;
                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });
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

                it('should be false if player is autoplay', function() {
                    $scope.$apply(function() {
                        $scope.config.data.autoplay = true;
                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });
                        $scope.$emit('playerAdd', iface);
                    });

                    expect(VpaidCardController.showPlay).toBe(false);
                });
            });

            describe('enableDisplayAd', function() {
                var iface;

                beforeEach(function() {
                    iface = new IFace();
                });

                describe('when inlineVideo is not available', function() {
                    it('should always be true', function() {
                        $scope.$apply(function() {
                            $scope.profile.inlineVideo = false;
                        });
                        expect(VpaidCardController.enableDisplayAd).toBe(true);
                    });
                });

                describe('when inlineVideo is available', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.profile.inlineVideo = true;
                        });
                    })

                    it('should be false be default', function() {
                        expect(VpaidCardController.enableDisplayAd).toBe(false);
                    });

                    describe('and player has not ended', function() {
                        it('should be false', function() {
                            $scope.$apply(function() {
                                $scope.$emit('playerAdd', iface);
                                iface.ended = false;
                            });

                            expect(VpaidCardController.enableDisplayAd).toBe(false);
                        });
                    });

                    describe('when player has ended', function() {
                        it('should be true', function() {
                            $scope.$apply(function() {
                                $scope.$emit('playerAdd', iface);
                                iface.ended = true;
                            });
                            expect(VpaidCardController.enableDisplayAd).toBe(true);
                        });
                    });
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
                xdescribe('if there is a displayAd', function() {
                    beforeEach(function() {
                        VpaidCardController.companion = {};

                        iface.emit('ended', iface);
                    });

                    it('should activate the display ad', function() {
                        expect($scope.config._data.modules.displayAd.active).toBe(true);
                    });

                    it('should not $emit the contentEnd event', function() {
                        expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                    });
                });

                describe('if there is no displayAd', function() {
                    it('should emit the contentEnd event if $scope.active is true', function() {
                        $scope.active = true;
                        iface.emit('ended', iface);

                        expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                    });

                    it('should not emit the contentEnd if $scope is not active', function() {
                        iface.emit('ended', iface);

                        expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                    });

                    it('should emit contentEnd with the meta object if present', function() {
                        $scope.active = true;
                        $scope.config.meta = {};
                        iface.emit('ended', iface);

                        expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config.meta);
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
                describe('if the ad has finished and the displayAd module is present', function() {
                    it('should activate the displayAd', function() {
                        ModuleService.hasModule.andReturn(true);

                        $scope.$apply(function() {
                            iface.ended = true;
                        });

                        iface.emit('pause', iface);

                        expect($scope.config._data.modules.displayAd.active).toBe(true);
                    });
                });

                describe('if the ad has finished but the displayAd module is not present', function() {
                    it('should not activate the displayAd', function() {
                        ModuleService.hasModule.andReturn(false);

                        $scope.$apply(function() {
                            iface.ended = true;
                        });

                        iface.emit('pause', iface);

                        expect($scope.config._data.modules.displayAd.active).not.toBe(true);
                    });
                });

                describe('if the ad has not finished and the displayAd module is present', function() {
                    it('should not activate the displayAd', function() {
                        ModuleService.hasModule.andReturn(true);

                        $scope.$apply(function() {
                            iface.ended = false;
                        });

                        iface.emit('pause', iface);

                        expect($scope.config._data.modules.displayAd.active).not.toBe(true);
                    });
                });

                describe('if the ad has not finished and the displayAd module is not present', function() {
                    it('should not activate the displayAd', function() {
                        ModuleService.hasModule.andReturn(false);

                        $scope.$apply(function() {
                            iface.ended = false;
                        });

                        iface.emit('pause', iface);

                        expect($scope.config._data.modules.displayAd.active).not.toBe(true);
                    });
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
                var iface,
                    deferred;

                beforeEach(function() {
                    iface = new IFace();

                    deferred = $q.defer();

                    iface.play.andReturn(deferred.promise);

                    $scope.$apply(function() {
                        $scope.$emit('playerAdd', iface);
                    });
                });

                describe('when initialized', function() {
                    it('should not call loadAd', function() {
                        expect(iface.play).not.toHaveBeenCalled();
                    });
                });

                describe('when the mode is "lightbox"', function() {
                    beforeEach(function() {
                        c6AppData.experience.data.mode = 'lightbox';

                        spyOn($rootScope, '$broadcast').andCallThrough();
                    });

                    [true, false].forEach(function(bool) {
                        describe('when ' + bool, function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = !bool;
                                });
                                $scope.$apply(function() {
                                    $scope.active = bool;
                                });
                            });

                            it('should $broadcast resize on the $rootScope', function() {
                                expect($rootScope.$broadcast).toHaveBeenCalledWith('resize');
                            });
                        });
                    });
                });

                ['lightbox-ads', 'full', 'light'].forEach(function(mode) {
                    describe('when the mode is "' + mode + '"', function() {
                        beforeEach(function() {
                            c6AppData.experience.data.mode = mode;
                            spyOn($rootScope, '$broadcast').andCallThrough();
                        });

                        [true, false].forEach(function(bool) {
                            describe('when ' + bool, function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        $scope.active = bool;
                                    });
                                });

                                it('should not $broadcast resize on the $rootScope', function() {
                                    expect($rootScope.$broadcast).not.toHaveBeenCalledWith('resize');
                                });
                            });
                        });
                    });
                });

                describe('when true', function() {
                    beforeEach(function() {
                        spyOn($scope,'$emit').andCallThrough();

                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    describe('when there was a problem with the ad and "ended" was emitted before the card was active', function() {
                        it('should $emit <mr-card>:contentEnd', function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            iface.emit('ended');

                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            expect($scope.$emit.mostRecentCall.args[0]).toBe('<mr-card>:contentEnd');
                        });
                    });

                    it('should play the ad', function() {
                        expect(iface.play).toHaveBeenCalled();
                    });

                    it('should $emit <vpaid-card>:init', function() {
                        expect($scope.$emit).toHaveBeenCalledWith('<vpaid-card>:init', jasmine.any(Function));
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

                    it('should skip the card if the play promise is rejected', function() {
                        $scope.$apply(function() {
                            deferred.reject();
                        });
                        expect($scope.$emit.mostRecentCall.args[0]).toBe('<mr-card>:contentEnd');
                    });

                    it('should tell the player to pause when skipping in case an ad is loaded after we skip', function() {
                        $scope.$apply(function() {
                            deferred.reject();
                        });
                        expect(iface.pause).toHaveBeenCalled();
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
                            $scope.active = true;
                        });
                        $scope.$apply(function() {
                            $scope.active = false;
                            iface.paused = false;
                        });
                        expect(iface.pause).toHaveBeenCalled();
                        // expect($scope.config._data.modules.displayAd.active).toBe(true);
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

                    it('should not load an ad if card becomes onDeck again', function() {
                        $scope.$apply(function() {
                            $scope.onDeck = false;
                        });

                        $scope.$apply(function() {
                            $scope.onDeck = true;
                        });

                        $scope.$apply(function() {
                            $scope.onDeck = false;
                        });

                        $scope.$apply(function() {
                            $scope.onDeck = true;
                        });

                        expect(iface.loadAd.callCount).toBe(1);
                    });
                });
            });
        });
    });
});
