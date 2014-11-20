define(['app', 'tracker', 'services'], function(appModule, trackerModule, servicesModule) {
    'use strict';

    describe('AdCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            $interval,
            c6EventEmitter,
            compileAdTag,
            trackerService,
            VideoTrackerService,
            MiniReelService,
            AdCardCtrl;

        var c6AppData,
            adTag,
            adTags,
            tracker;


        function instantiate() {
            $scope.$apply(function() {
                AdCardCtrl = $controller('AdCardController', { $scope: $scope });
            });
        }

        function Player() {
            this.play = jasmine.createSpy('iface.play()');
            this.pause = jasmine.createSpy('iface.pause()');
            this.load = jasmine.createSpy('iface.load()');
            this.reload = jasmine.createSpy('iface.reload()');
            this.getCompanions = jasmine.createSpy('iface.getCompanions()')
                .and.returnValue(null);

            this.paused = true;
            this.currentTime = 0;
            this.duration = 0;
            this.ended = false;

            c6EventEmitter(this);
        }

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.decorator('compileAdTag', function($delegate) {
                    return jasmine.createSpy('compileAdTag()')
                        .and.callFake(function() {
                            return (adTag = $delegate.apply(null, arguments));
                        });
                });
            });

            module(trackerModule.name, function($provide) {
                $provide.decorator('trackerService', function($delegate) {
                    return jasmine.createSpy('trackerService()').and.callFake(function() {
                        return (tracker = $delegate.apply(null, arguments));
                    });
                });
            });

            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: null,
                    profile: {
                        autoplay: true,
                        touch: false
                    },
                    experience: {
                        id: 'e-f1d70de8336974',
                        data: {
                            title: 'Foo'
                        }
                    },
                    behaviors: {
                        canAutoplay: true,
                        separateTextView: false
                    }
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $interval = $injector.get('$interval');
                c6EventEmitter = $injector.get('c6EventEmitter');
                compileAdTag = $injector.get('compileAdTag');
                trackerService = $injector.get('trackerService');
                VideoTrackerService = $injector.get('VideoTrackerService');

                c6AppData = $injector.get('c6AppData');
                MiniReelService = $injector.get('MiniReelService');
                adTags = $injector.get('adTags');

                $scope = $rootScope.$new();
                $scope.config = {
                    id: 'rc-dec185bad0c8ee',
                    modules: ['displayAd'],
                    type: 'ad',
                    ad: true,
                    data: {
                        autoplay: true,
                        source: 'cinema6',
                        skip: 6
                    }
                };
                $scope.profile = {
                    autoplay: true,
                    touch: false
                };
                spyOn($scope, '$emit').and.callThrough();
                spyOn($rootScope, '$broadcast').and.callThrough();
                instantiate();
                spyOn(tracker, 'trackEvent');
            });
        });

        it('should exist', function() {
            expect(AdCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('initialization', function() {
            describe('if the config already has _data', function() {
                var origData;

                beforeEach(function() {
                    origData = $scope.config._data = {};

                    AdCardCtrl = $controller('AdCardController', { $scope: $scope });
                });

                it('should not overwrite the data', function() {
                    expect($scope.config._data).toBe(origData);
                });
            });

            describe('if the config has no _data', function() {
                it('should create some data', function() {
                    expect($scope.config._data).toEqual({
                        hasPlayed: false,
                        companion: null
                    });
                });
            });
        });

        describe('properties', function() {
            describe('player', function() {
                it('should be null', function() {
                    expect(AdCardCtrl.player).toBeNull();
                });
            });

            describe('adType', function() {
                describe('if the browser does not support flash', function() {
                    it('should be "vast"', function() {
                        $scope.profile.flash = false;
                        instantiate();
                        expect(AdCardCtrl.adType).toBe('vast');
                    });
                });

                describe('if the browser supports flash', function() {
                    it('should be "vpaid"', function() {
                        $scope.profile.flash = true;
                        instantiate();
                        expect(AdCardCtrl.adType).toBe('vpaid');
                    });
                });
            });

            describe('adTag', function() {
                describe('if the browser does not support flash', function() {
                    it('should be the vast tag', function() {
                        $scope.profile.flash = false;
                        instantiate();
                        expect(compileAdTag).toHaveBeenCalledWith(adTags.vast.cinema6);
                        expect(AdCardCtrl.adTag).toBe(adTag);
                    });
                });

                describe('if the browser supports flash', function() {
                    it('should be vpaid', function() {
                        $scope.profile.flash = true;
                        instantiate();
                        expect(compileAdTag).toHaveBeenCalledWith(adTags.vpaid.cinema6);
                        expect(AdCardCtrl.adTag).toBe(adTag);
                    });
                });
            });

            describe('showPlay', function() {
                describe('if there is no player', function() {
                    beforeEach(function() {
                        AdCardCtrl.player = null;
                    });

                    it('should be false', function() {
                        expect(AdCardCtrl.showPlay).toBe(false);
                    });
                });

                describe('if there is a player', function() {
                    var player;

                    beforeEach(function() {
                        player = new Player();

                        $scope.$apply(function() {
                            $scope.$emit('<vpaid-player>:init', player);
                        });
                        $scope.$apply(function() {
                            player.emit('ready');
                        });
                    });

                    [true, false].forEach(function(bool) {
                        describe('if the paused is ' + bool, function() {
                            beforeEach(function() {
                                player.paused = bool;
                            });

                            describe('if the player has not played yet', function() {
                                describe('if the card is configured to autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = true;
                                    });

                                    it('should be false', function() {
                                        expect(AdCardCtrl.showPlay).toBe(false);
                                    });
                                });

                                describe('if the card is not configured to autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = false;
                                    });

                                    it('should be ' + bool, function() {
                                        expect(AdCardCtrl.showPlay).toBe(bool);
                                    });
                                });
                            });

                            describe('if the player has played', function() {
                                beforeEach(function() {
                                    player.emit('play');
                                });

                                it('should be ' + bool, function() {
                                    expect(AdCardCtrl.showPlay).toBe(bool);
                                });
                            });
                        });
                    });
                });
            });
        });

        describe('$events', function() {
            [
                '<vast-player>:init',
                '<vpaid-player>:init',
            ].forEach(function($event) {
                describe($event, function() {
                    var iface;

                    beforeEach(function() {
                        iface = new Player();

                        $scope.$apply(function() {
                            $scope.$emit($event, iface);
                        });
                    });

                    it('should not immediately put the player on the controller', function() {
                        expect(AdCardCtrl.player).not.toBe(iface);
                    });

                    describe('when the iface is ready', function() {
                        beforeEach(function() {
                            spyOn(VideoTrackerService, 'trackQuartiles').and.callThrough();

                            $scope.$apply(function() {
                                iface.emit('ready');
                            });
                        });

                        it('should put the player on the controller', function() {
                            expect(AdCardCtrl.player).toBe(iface);
                        });

                        describe('video tracking', function() {
                            function trackingData(action) {
                                return MiniReelService.getTrackingData($scope.config, 'null', {
                                    category: 'Ad',
                                    action: action,
                                    label: 'ad',
                                    videoSource: 'ad',
                                    videoDuration: iface.duration,
                                    nonInteraction: 1
                                });
                            }

                            beforeEach(function() {
                                iface.duration = 100;
                                iface.currentTime = 0;
                            });

                            it('should use the correct tracker', function() {
                                expect(trackerService).toHaveBeenCalledWith('c6mr');
                            });

                            describe('quartiles', function() {
                                var callback;

                                beforeEach(function() {
                                    callback = VideoTrackerService.trackQuartiles.calls.mostRecent().args[2];
                                });

                                it('should track the quartiles', function() {
                                    expect(VideoTrackerService.trackQuartiles).toHaveBeenCalledWith($scope.config.id, iface, jasmine.any(Function));
                                });

                                it('should track an event for each quartile', function() {
                                    [1, 2, 3, 4].forEach(function(quartile) {
                                        callback(quartile);
                                        expect(tracker.trackEvent).toHaveBeenCalledWith(trackingData('Quartile ' + quartile));
                                    });
                                });
                            });

                            describe('when the video plays', function() {
                                beforeEach(function() {
                                    expect(tracker.trackEvent).not.toHaveBeenCalled();

                                    iface.emit('play');
                                });

                                it('should track an event', function() {
                                    expect(tracker.trackEvent).toHaveBeenCalledWith(trackingData('Play'));
                                });
                            });

                            describe('when the video pauses', function() {
                                beforeEach(function() {
                                    expect(tracker.trackEvent).not.toHaveBeenCalled();

                                    iface.emit('pause');
                                });

                                it('should track an event', function() {
                                    expect(tracker.trackEvent).toHaveBeenCalledWith(trackingData('Pause'));
                                });
                            });

                            describe('when the video ends', function() {
                                beforeEach(function() {
                                    expect(tracker.trackEvent).not.toHaveBeenCalled();

                                    iface.emit('ended');
                                });

                                it('should track an event', function() {
                                    expect(tracker.trackEvent).toHaveBeenCalledWith(trackingData('End'));
                                });
                            });
                        });

                        describe('when the video ends', function() {
                            beforeEach(function() {
                                expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));
                            });

                            it('should not go to next card if card is not active, but should go to next card when card does become active', function() {
                                iface.emit('ended');
                                expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));
                            });

                            it('should go to next card if card is active', function() {
                                $scope.active = true;
                                iface.emit('ended');
                                expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));
                            });
                        });

                        describe('when the video plays', function() {
                            it('should update the _data object', function() {
                                iface.emit('play');
                                expect($scope.config._data.hasPlayed).toBe(true);
                            });
                        });

                        describe('when the companions are ready', function() {
                            beforeEach(function() {
                                iface.emit('companionsReady');
                            });

                            it('should get a 300x250 companion', function() {
                                expect(iface.getCompanions).toHaveBeenCalledWith(300, 250);
                            });

                            describe('if there are no companions', function() {
                                beforeEach(function() {
                                    iface.getCompanions.and.returnValue(null);
                                    $scope.$emit($event, iface);
                                    iface.emit('ready');
                                    iface.emit('companionsReady');
                                });

                                it('should set the _data.companion to null', function() {
                                    expect($scope.config._data.companion).toBeNull();
                                });
                            });

                            describe('if there is a companion', function() {
                                var companions;

                                beforeEach(function() {
                                    companions = [
                                        {
                                            width: 300,
                                            height: 250
                                        }
                                    ];
                                    iface.getCompanions.and.returnValue(companions);
                                    $scope.$emit($event, iface);
                                    iface.emit('ready');
                                    iface.emit('companionsReady');
                                });

                                it('should set the _data.companion to the returned companion', function() {
                                    expect($scope.config._data.companion).toBe(companions[0]);
                                });
                            });
                        });

                        describe('$watchers', function() {
                            describe('onDeck', function() {
                                describe('when true', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.onDeck = true;
                                        });
                                    });

                                    it('should load the video', function() {
                                        expect(iface.load).toHaveBeenCalled();
                                    });
                                });

                                describe('when false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.onDeck = false;
                                        });
                                    });

                                    it('should not load the player', function() {
                                        expect(iface.load).not.toHaveBeenCalled();
                                    });
                                });
                            });

                            describe('active', function() {
                                describe('when true', function() {
                                    describe('if the card has meta data', function() {
                                        it('should put the _data on it', function() {
                                            $scope.config.meta = {};

                                            $scope.$apply(function() {
                                                $scope.active = true;
                                            });

                                            expect($scope.config.meta._data).toEqual($scope.config._data);
                                        });
                                    });

                                    describe('if the ad has already ended or has an error', function() {
                                        it('should go to the next card', function() {
                                            iface.emit('error');

                                            $scope.$apply(function() {
                                                $scope.active = true;
                                            });

                                            expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));
                                        });
                                    });

                                    describe('if the card should be autoplayed', function() {
                                        beforeEach(function() {
                                            $scope.config.data.autoplay = true;
                                        });

                                        describe('if the device can be autoplayed', function() {
                                            beforeEach(function() {
                                                c6AppData.profile.autoplay = true;

                                                $scope.$apply(function() {
                                                    $scope.active = true;
                                                });
                                            });

                                            it('should play the video', function() {
                                                expect(iface.play).toHaveBeenCalled();
                                            });
                                        });
                                    });

                                    describe('if the card should not be autoplayed', function() {
                                        beforeEach(function() {
                                            $scope.config.data.autoplay = false;

                                            $scope.$apply(function() {
                                                $scope.active = true;
                                            });
                                        });

                                        it('should not play the video', function() {
                                            expect(iface.play).not.toHaveBeenCalled();
                                        });
                                    });

                                    describe('controlling the navigation', function() {
                                        beforeEach(function() {
                                            $scope.$apply(function() {
                                                $scope.active = true;
                                            });
                                        });

                                        it('should $emit "<mr-card>:init"', function() {
                                            expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:init', jasmine.any(Function));
                                        });

                                        describe('when passed a nav controller', function() {
                                            var NavController,
                                                passNavController;

                                            function timeupdate(time) {
                                                iface.currentTime = time;
                                                iface.emit('timeupdate');
                                            }

                                            beforeEach(function() {
                                                NavController = {
                                                    tick: jasmine.createSpy('NavController.tick()')
                                                        .and.callFake(function() { return NavController; }),
                                                    enabled: jasmine.createSpy('NavController.enabled()')
                                                        .and.callFake(function() { return NavController; })
                                                };

                                                passNavController = $scope.$emit.calls.mostRecent().args[1];
                                            });

                                            describe('if the card can be skipped at any time', function() {
                                                beforeEach(function() {
                                                    $scope.config.data.skip = true;

                                                    $scope.$apply(function() {
                                                        passNavController(NavController);
                                                    });
                                                });

                                                it('should not disable the navigation', function() {
                                                    expect(NavController.enabled).not.toHaveBeenCalled();
                                                });
                                            });

                                            [true, false].forEach(function(bool) {
                                                describe('if autoplay is ' + bool, function() {
                                                    beforeEach(function() {
                                                        $scope.config.data.autoplay = bool;
                                                    });

                                                    describe('if the card must be watched in its entirety', function() {
                                                        beforeEach(function() {
                                                            $scope.config.data.skip = false;

                                                            $scope.$apply(function() {
                                                                passNavController(NavController);
                                                            });
                                                        });

                                                        it('should disable the nav', function() {
                                                            expect(NavController.enabled).toHaveBeenCalledWith(false);
                                                        });

                                                        it('should tick the nav with the duration of the video', function() {
                                                            expect(NavController.tick).toHaveBeenCalledWith(iface.duration);
                                                        });

                                                        describe('as timeupdates are fired', function() {
                                                            beforeEach(function() {
                                                                iface.duration = 60;
                                                            });

                                                            it('should tick the nav', function() {
                                                                timeupdate(1);
                                                                expect(NavController.tick).toHaveBeenCalledWith(59);

                                                                timeupdate(2);
                                                                expect(NavController.tick).toHaveBeenCalledWith(58);
                                                            });
                                                        });

                                                        describe('when the video ends', function() {
                                                            beforeEach(function() {
                                                                expect(NavController.enabled).not.toHaveBeenCalledWith(true);

                                                                iface.emit('ended');
                                                            });

                                                            it('should enable the nav', function() {
                                                                expect(NavController.enabled).toHaveBeenCalledWith(true);
                                                            });

                                                            it('should stop listening for timeupdates', function() {
                                                                NavController.tick.calls.reset();
                                                                timeupdate(6);

                                                                expect(NavController.tick).not.toHaveBeenCalled();
                                                            });
                                                        });
                                                    });
                                                });
                                            });

                                            describe('if the card can be skiped after some time', function() {
                                                beforeEach(function() {
                                                    $scope.config.data.skip = 6;

                                                    $scope.$apply(function() {
                                                        passNavController(NavController);
                                                    });
                                                });

                                                it('should disable the nav', function() {
                                                    expect(NavController.enabled).toHaveBeenCalledWith(false);
                                                });

                                                it('should tick the nav with the wait time', function() {
                                                    expect(NavController.tick).toHaveBeenCalledWith($scope.config.data.skip);
                                                });

                                                describe('as timeupdates are fired', function() {
                                                    it('should tick the nav', function() {
                                                        timeupdate(1);
                                                        expect(NavController.tick).toHaveBeenCalledWith(5);

                                                        timeupdate(2);
                                                        expect(NavController.tick).toHaveBeenCalledWith(4);
                                                    });
                                                });

                                                describe('when the video ends', function() {
                                                    beforeEach(function() {
                                                        expect(NavController.enabled).not.toHaveBeenCalledWith(true);

                                                        iface.emit('ended');
                                                    });

                                                    it('should enable the nav', function() {
                                                        expect(NavController.enabled).toHaveBeenCalledWith(true);
                                                    });

                                                    it('should stop listening for timeupdates', function() {
                                                        NavController.tick.calls.reset();
                                                        timeupdate(6);

                                                        expect(NavController.tick).not.toHaveBeenCalled();
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

                                    it('should pause the video', function() {
                                        expect(iface.pause).toHaveBeenCalled();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
