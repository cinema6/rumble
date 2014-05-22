(function() {
    'use strict';

    define(['vast_card'], function() {
        describe('VastCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                $window,
                $interval,
                c6EventEmitter,
                VastCardCtrl;

            var VASTService,
                ControlsService,
                ModuleService,
                vast;

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

                this.duration = NaN;
                this.currentTime = 0;

                c6EventEmitter(this);
            }

            beforeEach(function() {
                vast = {
                    video : {
                        mediaFiles:[]
                    },
                    clickThrough : ['http://www.advertiser.com'],
                    companions : [],
                    firePixels : jasmine.createSpy('firePixels()').andReturn(undefined),
                    getVideoSrc : jasmine.createSpy('getVideoSrc()').andReturn('http://www.videos.com/video.mp4'),
                    getCompanion : jasmine.createSpy('getCompanion()').andReturn({adType:'iframe', fileURI: '//ads.adap.tv/c/companion?cck=cck&creativeId=110497&melaveId=42657&key=tribal360llc&adSourceId=208567&bidId=&afppId=159224&exSId=639284&cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov'}),
                };

                module('c6.rumble.services', function($provide) {
                    $provide.provider('VASTService', function() {
                        this.$get = function($q) {
                            return {
                                getVAST : jasmine.createSpy('getVAST()').andReturn($q.when(vast))
                            };
                        };

                        this.adTags = angular.noop;
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
                    $interval = $injector.get('$interval');
                    $window = $injector.get('$window');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    VASTService = $injector.get('VASTService');
                    ControlsService = $injector.get('ControlsService');
                    ModuleService = $injector.get('ModuleService');

                    $scope = $rootScope.$new();
                    $scope.onDeck = false;
                    $scope.active = false;
                    $scope.config = {
                        data: {
                            autoplay: false,
                            skip: 11,
                            source: 'publisher-cinema6'
                        },
                        displayAd: 'http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg'
                    };

                    $scope.$apply(function() {
                        VastCardCtrl = $controller('VastCardController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(VastCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    var origData;

                    beforeEach(function() {
                        origData = $scope.config._data = {};

                        VastCardCtrl = $controller('VastCardController', { $scope: $scope });
                    });

                    it('should not overwrite the data', function() {
                        expect($scope.config._data).toBe(origData);
                    });
                });

                describe('if the config has no _data', function() {
                    it('should create some data', function() {
                        expect($scope.config._data).toEqual({
                            playerEvents: {},
                            vastEvents: {},
                            vastData: {},
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

            describe('@properties', function() {
                describe('videoSrc', function() {
                    it('should be null', function() {
                        expect(VastCardCtrl.videoSrc).toBeNull();
                    });
                });

                describe('companion', function() {
                    it('should be null', function() {
                        expect(VastCardCtrl.companion).toBeNull();
                    });
                });

                describe('showVideo', function() {
                    it('should be true if the card is active', function() {
                        $scope.active = true;
                        expect(VastCardCtrl.showVideo).toBe(true);

                        $scope.active = false;
                        expect(VastCardCtrl.showVideo).toBe(false);
                    });

                    it('should also be false if the displayAd module is active', function() {
                        $scope.active = true;
                        expect(VastCardCtrl.showVideo).toBe(true);

                        $scope.config._data.modules.displayAd.active = true;
                        expect(VastCardCtrl.showVideo).toBe(false);
                    });
                });
            });

            describe('@methods', function() {
                var iface;

                beforeEach(function() {
                    iface = new IFace();

                    $scope.$apply(function() {
                        $scope.$emit('playerAdd', iface);
                    });
                });

                describe('reset()', function() {
                    beforeEach(function() {
                        $scope.config._data.modules.displayAd.active = true;
                        iface.currentTime = 20;

                        VastCardCtrl.reset();
                    });

                    it('should hide the displayAd', function() {
                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });

                    it('should restart the video from the beginning', function() {
                        expect(iface.currentTime).toBe(0);
                        expect(iface.play).toHaveBeenCalled();
                    });
                });

                describe('showDisplayAd', function() {
                    beforeEach(function() {
                        VastCardCtrl.showDisplayAd();
                    });

                    it('should pause the video and activate the displayAd', function() {
                        expect(iface.pause).toHaveBeenCalled();
                        expect($scope.config._data.modules.displayAd.active).toBe(true);
                    });
                });

                describe('hasModule(module)', function() {
                    it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                        VastCardCtrl.hasModule('ballot');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'ballot');

                        VastCardCtrl.hasModule('comments');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'comments');
                    });
                });

                describe('clickThrough()', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.onDeck = true;
                        });

                        spyOn($window, 'open').andReturn(true);

                        VastCardCtrl.clickThrough();
                    });

                    it('should pause the video if playing', function() {
                        expect(iface.pause).toHaveBeenCalled();
                    });

                    it('should play the video if paused', function() {
                        iface.paused = true;
                        VastCardCtrl.clickThrough();
                        expect(iface.play).toHaveBeenCalled();
                    });

                    it('should open a new window', function() {
                        expect($window.open).toHaveBeenCalledWith('http://www.advertiser.com');
                    });

                    it('should fire the click event pixel', function() {
                        expect(vast.firePixels).toHaveBeenCalledWith('videoClickTracking');
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
                });

                describe('ended', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').andCallThrough();
                    });

                    describe('if there is a companion', function() {
                        beforeEach(function() {
                            VastCardCtrl.companion = {
                                adType: 'iframe',
                                fileURI: '//adap.tv/foo'
                            };

                            iface.emit('ended', iface);
                        });

                        it('should not $emit the contentEnd event', function() {
                            expect($scope.$emit).not.toHaveBeenCalledWith('<vast-card>:contentEnd', $scope.config);
                        });
                    });

                    describe('if there is no companion', function() {
                        beforeEach(function() {
                            iface.emit('ended', iface);
                        });

                        it('should emit the contentEnd event', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('<vast-card>:contentEnd', $scope.config);
                        });
                    });
                    describe('pixel firing', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });

                            iface.emit('ended', iface);
                        });

                        it('should fire the "complete" pixel', function() {
                            expect(vast.firePixels).toHaveBeenCalledWith('complete');
                        });
                    });
                });

                describe('pause', function() {
                    describe('if the displayAd module is present', function() {
                        beforeEach(function() {
                            spyOn(VastCardCtrl, 'hasModule')
                                .andCallFake(function(module) {
                                    if (module === 'displayAd') { return true; }

                                    return false;
                                });

                            iface.emit('pause', iface);
                        });

                        it('should activate the displayAd', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });

                    describe('if the displayAd module is not present', function() {
                        beforeEach(function() {
                            spyOn(VastCardCtrl, 'hasModule')
                                .andCallFake(function(module) {
                                    if (module === 'displayAd') { return false; }

                                    return true;
                                });

                            iface.emit('pause', iface);
                        });

                        it('should not activate the displayAd', function() {
                            expect($scope.config._data.modules.displayAd.active).not.toBe(true);
                        });
                    });

                    describe('pixel firing', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });

                            iface.emit('pause', iface);
                        });

                        it('should fire the "pause" pixel', function() {
                            expect(vast.firePixels).toHaveBeenCalledWith('pause');
                        });
                    });
                });

                describe('play', function() {
                    it('should deactivate the displayAd', function() {
                        iface.emit('play', iface);
                        iface.emit('pause', iface);
                        iface.emit('play', iface);

                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });

                    describe('pixel firing', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });

                            iface.emit('play', iface);
                        });

                        it('should fire the "play" pixel', function() {
                            expect(vast.firePixels).toHaveBeenCalledWith('impression');
                            iface.emit('pause', iface);
                            iface.emit('play', iface);
                            expect(vast.firePixels.mostRecentCall.args[0]).toEqual('pause');
                        });
                    });
                });

                describe('timeupdate', function() {
                    describe('pixel firing', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });
                        });

                        it('should fire the "firstQuartile" pixel', function() {
                            iface.currentTime = 5;
                            iface.duration = 20;
                            iface.emit('timeupdate', iface);
                            expect(vast.firePixels).toHaveBeenCalledWith('firstQuartile');

                            iface.currentTime = 5;
                            iface.duration = 20;
                            iface.emit('timeupdate', iface);
                            expect(vast.firePixels.calls.length).toEqual(1);
                        });

                        it('should fire the "midpoint" pixel', function() {
                            iface.currentTime = 10;
                            iface.duration = 20;
                            iface.emit('timeupdate', iface);
                            expect(vast.firePixels).toHaveBeenCalledWith('midpoint');

                            iface.currentTime = 10;
                            iface.duration = 20;
                            iface.emit('timeupdate', iface);
                            expect(vast.firePixels.calls.length).toEqual(1);
                        });

                        it('should fire the "thirdQuartile" pixel', function() {
                            iface.currentTime = 15;
                            iface.duration = 20;
                            iface.emit('timeupdate', iface);
                            expect(vast.firePixels).toHaveBeenCalledWith('thirdQuartile');

                            iface.currentTime = 15;
                            iface.duration = 20;
                            iface.emit('timeupdate', iface);
                            expect(vast.firePixels.calls.length).toEqual(1);
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('active', function() {
                    describe('if there is no iface', function() {
                        it('should not to do anything destructive', function() {
                            expect(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                            }).not.toThrow();
                        });
                    });

                    describe('if there is an iface', function() {
                        var iface;

                        beforeEach(function() {
                            iface = new IFace();

                            $scope.$apply(function() {
                                $scope.$emit('playerAdd', iface);
                            });
                            $scope.$apply(function() {
                                iface.emit('ready', iface);
                            });
                        });

                        describe('when initialized', function() {
                            it('should not pause the player', function() {
                                expect(iface.pause).not.toHaveBeenCalled();
                            });
                        });

                        describe('when true', function() {
                            describe('if autoplay is false', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });
                                });

                                it('should not play the video', function() {
                                    expect(iface.play).not.toHaveBeenCalled();
                                });
                            });

                            describe('if autoplay is true', function() {
                                beforeEach(function() {
                                    $scope.config.data.autoplay = true;

                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });
                                });

                                it('should play the video', function() {
                                    expect(iface.play).toHaveBeenCalled();
                                });

                                it('should only autoplay the video once', function() {
                                    $scope.$apply(function() {
                                        $scope.active = false;
                                    });

                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });

                                    expect(iface.play.callCount).toBe(1);
                                });
                            });

                            describe('in either case', function() {
                                beforeEach(function() {
                                    spyOn($scope, '$emit').andCallThrough();

                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });
                                });

                                it('should bind the interface to the controls', function() {
                                    expect(ControlsService.bindTo).toHaveBeenCalledWith(iface);
                                });

                                it('should $emit <vast-card>:init', function() {
                                    expect($scope.$emit).toHaveBeenCalledWith('<vast-card>:init', jasmine.any(Function));
                                });

                                it('should only $emit <vast-card>:init if the ad has not been played', function() {
                                    $scope.$apply(function() {
                                        $scope.active = false;
                                    });
                                    iface.emit('play', iface);
                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });

                                    expect($scope.$emit.callCount).toBe(1);
                                });

                                describe('when the rumble controller yields control of the navigation', function() {
                                    var control,
                                        navController;

                                    function timeupdate(time) {
                                        iface.currentTime = time;
                                        iface.emit('timeupdate', iface);
                                    }

                                    beforeEach(function() {
                                        control = $scope.$emit.mostRecentCall.args[1];

                                        navController = {
                                            enabled: jasmine.createSpy('navController.enabled()')
                                                .andCallFake(function() { return navController; }),
                                            tick: jasmine.createSpy('navController.tick()')
                                                .andCallFake(function() { return navController; })
                                        };
                                    });

                                    describe('if the ad is skippable', function() {
                                        beforeEach(function() {
                                            $scope.config.data.skip = true;

                                            $scope.$apply(function() {
                                                control(navController);
                                            });
                                        });

                                        it('should do nothing', function() {
                                            expect(navController.enabled).not.toHaveBeenCalledWith(false);
                                        });
                                    });

                                    describe('if the ad is not skippable', function() {
                                        beforeEach(function() {
                                            $scope.config.data.skip = false;

                                            $scope.$apply(function() {
                                                control(navController);
                                            });
                                        });

                                        it('should disable the navigation', function() {
                                            expect(navController.enabled).toHaveBeenCalledWith(false);
                                        });

                                        it('should not tick the navigation with the duration of the video', function() {
                                            expect(navController.tick).not.toHaveBeenCalled();
                                        });

                                        it('should tick the navigation on every timeupdate with the remaining time in the video', function() {
                                            [1, 2.5].forEach(function(time) {
                                                timeupdate(time);
                                                expect(navController.tick).not.toHaveBeenCalled();
                                            });

                                            iface.duration = 31;

                                            [5.278, 9, 10, 12.3].forEach(function(time) {
                                                timeupdate(time);
                                                expect(navController.tick).toHaveBeenCalledWith(iface.duration - time);
                                            });
                                        });

                                        it('should re-enable the navigation when the ad ends', function() {
                                            iface.emit('ended', iface);
                                            expect(navController.enabled).toHaveBeenCalledWith(true);

                                            iface.emit('timeupdate');
                                            expect(navController.tick).not.toHaveBeenCalled();
                                        });
                                    });

                                    describe('if the ad is skippable after a pre-configured time', function() {
                                        var wait;

                                        beforeEach(function() {
                                            wait = $scope.config.data.skip;
                                        });

                                        describe('if the ad does not autoplay', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    control(navController);
                                                });
                                            });

                                            it('should disable the navigation', function() {
                                                expect(navController.enabled).toHaveBeenCalledWith(false);
                                            });

                                            it('should tick the navigation with the skip wait length', function() {
                                                expect(navController.tick).toHaveBeenCalledWith($scope.config.data.skip);
                                            });

                                            it('should tick the navigation once every second with the remaining wait time', function() {
                                                var elapsed = 0;

                                                function tick() {
                                                    elapsed++;
                                                    $interval.flush(1000);
                                                }

                                                for (var count = 0; count < 7; count++) {
                                                    tick();
                                                    expect(navController.tick).toHaveBeenCalledWith(wait - elapsed);
                                                }
                                            });

                                            it('should enabled the navigation when the countdown completes', function() {
                                                $interval.flush(11000);
                                                expect(navController.enabled).toHaveBeenCalledWith(true);

                                                $interval.flush(1000);
                                                expect(navController.tick.callCount).toBe(12);
                                            });
                                        });

                                        describe('if the ad autoplays', function() {
                                            beforeEach(function() {
                                                $scope.config.data.autoplay = true;

                                                $scope.$apply(function() {
                                                    control(navController);
                                                });
                                            });

                                            it('should disable the navigation', function() {
                                                expect(navController.enabled).toHaveBeenCalledWith(false);
                                            });

                                            it('should tick the navigation with the skip wait length', function() {
                                                expect(navController.tick).toHaveBeenCalledWith($scope.config.data.skip);
                                            });

                                            it('should tick the navigation with the remaining wait time, synced with the video', function() {
                                                [0.1, 3, 4.45, 7, 10].forEach(function(time) {
                                                    timeupdate(time);
                                                    expect(navController.tick).toHaveBeenCalledWith(wait - time);
                                                });
                                            });

                                            it('should not tick the navigation below 0', function() {
                                                timeupdate(11.25);

                                                expect(navController.tick.mostRecentCall.args[0]).not.toBeLessThan(0);
                                            });

                                            it('should enable the navigation when the wait time is finished', function() {
                                                timeupdate(12.2);
                                                expect(navController.enabled).toHaveBeenCalledWith(true);

                                                timeupdate(13);
                                                expect(navController.tick.callCount).toBe(2);
                                            });
                                        });
                                    });
                                });
                            });
                        });

                        describe('when false', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                            });

                            it('should pause the player', function() {
                                expect(iface.pause).toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('onDeck', function() {
                    describe('when true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });
                        });

                        it('should call getVAST on the vast service', function() {
                            expect(VASTService.getVAST).toHaveBeenCalledWith($scope.config.data.source);
                        });

                        // TODO: Fetch displayAd from the ad server
                        it('should copy the displayAd src to the private data', function() {
                            expect($scope.config._data.modules.displayAd.src).toBe('http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg');
                        });

                        describe('after the promise is resolved', function() {
                            it('should set videoSrc to vast video ad url', function() {
                                expect(vast.getVideoSrc).toHaveBeenCalledWith('video/mp4');
                                expect(VastCardCtrl.videoSrc).toBe('http://www.videos.com/video.mp4');
                                expect(VastCardCtrl.companion).toEqual({adType:'iframe', fileURI: '//ads.adap.tv/c/companion?cck=cck&creativeId=110497&melaveId=42657&key=tribal360llc&adSourceId=208567&bidId=&afppId=159224&exSId=639284&cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov'});
                            });
                        });
                    });

                    describe('when false', function() {
                        it('should not getVAST on the vast service', function() {
                            expect(VASTService.getVAST).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
