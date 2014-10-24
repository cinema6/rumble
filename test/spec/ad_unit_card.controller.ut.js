define(['minireel', 'services'], function(minireelModule, servicesModule) {
    'use strict';

    ddescribe('AdUnitCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            $interval,
            c6EventEmitter,
            compileAdTag,
            AdUnitCardCtrl;

        var ModuleService,
            c6ImagePreloader,
            c6AppData,
            adTag;


        function instantiate() {
            $scope.$apply(function() {
                AdUnitCardCtrl = $controller('AdUnitCardController', { $scope: $scope });
            });
        }

        function Player() {
            this.play = jasmine.createSpy('iface.play()');
            this.pause = jasmine.createSpy('iface.pause()');
            this.load = jasmine.createSpy('iface.load()');

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

            module(minireelModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: null,
                    profile: {
                        autoplay: true,
                        touch: false
                    },
                    experience: {
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

                ModuleService = $injector.get('ModuleService');
                spyOn(ModuleService, 'hasModule').and.callThrough();
                c6ImagePreloader = $injector.get('c6ImagePreloader');
                spyOn(c6ImagePreloader, 'load');
                c6AppData = $injector.get('c6AppData');

                $scope = $rootScope.$new();
                $scope.hasModule = function(module) {
                    return $scope.config.modules.indexOf(module) > -1;
                };
                $scope.config = {
                    modules: ['displayAd'],
                    data: {
                        autoplay: false,
                        vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl=mutantplayground.com&eov=eov',
                        vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl=mutantplayground.com&eov=eov'
                    },
                    thumbs: {
                        small: 'small.jpg',
                        large: 'large.jpg'
                    }
                };
                $scope.profile = {
                    autoplay: true,
                    touch: false
                };
                spyOn($scope, '$emit').and.callThrough();
                instantiate();
            });
        });

        it('should exist', function() {
            expect(AdUnitCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('initialization', function() {
            describe('if the config already has _data', function() {
                var origData;

                beforeEach(function() {
                    origData = $scope.config._data = {};

                    AdUnitCardCtrl = $controller('AdUnitCardController', { $scope: $scope });
                });

                it('should not overwrite the data', function() {
                    expect($scope.config._data).toBe(origData);
                });
            });

            describe('if the config has no _data', function() {
                it('should create some data', function() {
                    expect($scope.config._data).toEqual({
                        hasPlayed: false,
                        modules: {
                            displayAd: {
                                active: false
                            }
                        }
                    });
                });
            });
        });

        describe('properties', function() {
            describe('player', function() {
                it('should be null', function() {
                    expect(AdUnitCardCtrl.player).toBeNull();
                });
            });

            describe('postModuleActive', function() {
                it('should be false', function() {
                    expect(AdUnitCardCtrl.postModuleActive).toBe(false);
                });
            });

            describe('adType', function() {
                describe('if the browser does not support flash', function() {
                    beforeEach(function() {
                        $scope.profile.flash = false;
                        instantiate();
                    });

                    it('should be "vast"', function() {
                        expect(AdUnitCardCtrl.adType).toBe('vast');
                    });
                });

                describe('if the browser supports flash', function() {
                    beforeEach(function() {
                        $scope.profile.flash = true;
                        instantiate();
                    });

                    describe('if there is a vpaid tag', function() {
                        beforeEach(function() {
                            $scope.config.data.vpaid = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl=mutantplayground.com&eov=eov';
                            instantiate();
                        });

                        it('should be "vpaid"', function() {
                            expect(AdUnitCardCtrl.adType).toBe('vpaid');
                        });
                    });

                    describe('if there is no vpaid tag', function() {
                        beforeEach(function() {
                            delete $scope.config.data.vpaid;
                            instantiate();
                        });

                        it('should be "vast"', function() {
                            expect(AdUnitCardCtrl.adType).toBe('vast');
                        });
                    });
                });
            });

            describe('adTag', function() {
                describe('if the browser does not support flash', function() {
                    beforeEach(function() {
                        $scope.profile.flash = false;
                        instantiate();
                    });

                    it('should be the vast tag', function() {
                        expect(compileAdTag).toHaveBeenCalledWith($scope.config.data.vast);
                        expect(AdUnitCardCtrl.adTag).toBe(adTag);
                    });
                });

                describe('if the browser supports flash', function() {
                    beforeEach(function() {
                        $scope.profile.flash = true;
                        instantiate();
                    });

                    describe('if there is a vpaid tag', function() {
                        beforeEach(function() {
                            $scope.config.data.vpaid = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl=mutantplayground.com&eov=eov';
                            instantiate();
                        });

                        it('should be vpaid', function() {
                            expect(compileAdTag).toHaveBeenCalledWith($scope.config.data.vpaid);
                            expect(AdUnitCardCtrl.adTag).toBe(adTag);
                        });
                    });

                    describe('if there is no vpaid tag', function() {
                        beforeEach(function() {
                            delete $scope.config.data.vpaid;
                            instantiate();
                        });

                        it('should be "vast"', function() {
                            expect(compileAdTag).toHaveBeenCalledWith($scope.config.data.vast);
                            expect(AdUnitCardCtrl.adTag).toBe(adTag);
                        });
                    });
                });
            });

            describe('showPlay', function() {
                describe('if there is no player', function() {
                    beforeEach(function() {
                        AdUnitCardCtrl.player = null;
                    });

                    it('should be false', function() {
                        expect(AdUnitCardCtrl.showPlay).toBe(false);
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
                                        expect(AdUnitCardCtrl.showPlay).toBe(false);
                                    });
                                });

                                describe('if the card is not configured to autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = false;
                                    });

                                    it('should be ' + bool, function() {
                                        expect(AdUnitCardCtrl.showPlay).toBe(bool);
                                    });
                                });
                            });

                            describe('if the player has played', function() {
                                beforeEach(function() {
                                    player.emit('play');
                                });

                                it('should be ' + bool, function() {
                                    expect(AdUnitCardCtrl.showPlay).toBe(bool);
                                });
                            });
                        });
                    });
                });
            });

            describe('flyAway', function() {
                describe('if the card is not active', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = false;
                        });
                    });

                    it('should be true', function() {
                        expect(AdUnitCardCtrl.flyAway).toBe(true);
                    });
                });

                describe('if the card is active', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    describe('if the post module is not present', function() {
                        beforeEach(function() {
                            $scope.config.modules = ['displayAd'];
                        });

                        [true, false].forEach(function(bool) {
                            describe('if postModuleActive is ' + bool, function() {
                                beforeEach(function() {
                                    AdUnitCardCtrl.postModuleActive = bool;
                                });

                                it('should be false', function() {
                                    expect(AdUnitCardCtrl.flyAway).toBe(false);
                                });
                            });
                        });
                    });

                    describe('if the post module is present', function() {
                        beforeEach(function() {
                            $scope.config.modules = ['displayAd', 'post'];
                        });

                        [true, false].forEach(function(bool) {
                            describe('if postModuleActive is ' + bool, function() {
                                beforeEach(function() {
                                    AdUnitCardCtrl.postModuleActive = bool;
                                });

                                it('should be ' + bool, function() {
                                    expect(AdUnitCardCtrl.flyAway).toBe(bool);
                                });
                            });
                        });
                    });
                });
            });

            describe('enablePlay', function() {
                [true, false].forEach(function(bool) {
                    describe('if touch is ' + bool, function() {
                        beforeEach(function() {
                            $scope.profile.touch = bool;
                            instantiate();
                        });

                        it('should be ' + !bool, function() {
                            expect(AdUnitCardCtrl.enablePlay).toBe(!bool);
                        });
                    });
                });
            });
        });

        describe('$events', function() {
            ['<vast-player>:init', '<vpaid-player>:init'].forEach(function($event) {
                describe($event, function() {
                    var iface;

                    beforeEach(function() {
                        iface = new Player();

                        $scope.$apply(function() {
                            $scope.$emit($event, iface);
                        });
                    });

                    it('should not immediately put the player on the controller', function() {
                        expect(AdUnitCardCtrl.player).not.toBe(iface);
                    });

                    describe('when the video ends', function() {
                        beforeEach(function() {
                            expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));

                            iface.emit('ended');
                        });

                        describe('if the post module is present', function() {
                            beforeEach(function() {
                                $scope.config.modules = ['post'];
                                $scope.$emit.calls.reset();

                                iface.emit('ended');
                            });

                            it('should not emit <mr-card>:contentEnd', function() {
                                expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                            });
                        });

                        describe('if the post module is not present', function() {
                            beforeEach(function() {
                                $scope.config.modules = ['displayAd'];
                                $scope.$emit.calls.reset();

                                iface.emit('ended');
                            });

                            it('should $emit the <mr-card>:contentEnd event', function() {
                                expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                            });
                        });

                        it('should set postModuleActive to true', function() {
                            expect(AdUnitCardCtrl.postModuleActive).toBe(true);
                        });
                    });

                    describe('when the video plays', function() {
                        beforeEach(function() {
                            AdUnitCardCtrl.postModuleActive = true;

                            iface.emit('play');
                        });

                        it('should disable the postModule', function() {
                            expect(AdUnitCardCtrl.postModuleActive).toBe(false);
                        });
                    });

                    describe('when the iface is ready', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                iface.emit('ready');
                            });
                        });

                        it('should out the player on the controller', function() {
                            expect(AdUnitCardCtrl.player).toBe(iface);
                        });

                        describe('$watchers', function() {
                            describe('onDeck', function() {
                                describe('when true', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.onDeck = true;
                                        });
                                    });

                                    it('should preload the large thumbnail', function() {
                                        expect(c6ImagePreloader.load).toHaveBeenCalledWith(['large.jpg']);
                                    });

                                    it('should load the video', function() {
                                        expect(iface.load).toHaveBeenCalled();
                                    });

                                    describe('if there are no thumbs', function() {
                                        beforeEach(function() {
                                            $scope.config.thumbs = null;
                                            $scope.$apply(function() {
                                                $scope.onDeck = false;
                                            });
                                            c6ImagePreloader.load.calls.reset();

                                            $scope.$apply(function() {
                                                $scope.onDeck = true;
                                            });
                                        });

                                        it('should not preload anything if there are no thumbs', function() {
                                            expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                                        });
                                    });
                                });

                                describe('when false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.onDeck = false;
                                        });
                                    });

                                    it('should not preload the large image', function() {
                                        expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                                    });

                                    it('should not load the player', function() {
                                        expect(iface.load).not.toHaveBeenCalled();
                                    });
                                });
                            });

                            describe('active', function() {
                                describe('when true', function() {
                                    describe('if the card should be autoplayed', function() {
                                        beforeEach(function() {
                                            $scope.config.data.autoplay = true;

                                            $scope.$apply(function() {
                                                $scope.active = true;
                                            });
                                        });

                                        it('should play the video', function() {
                                            expect(iface.play).toHaveBeenCalled();
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

                                        describe('if the video has already been played', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    $scope.active = false;
                                                });
                                                $scope.$emit.calls.reset();

                                                iface.emit('play');
                                                $scope.$apply(function() {
                                                    $scope.active = true;
                                                });
                                            });

                                            it('should not $emit an event', function() {
                                                expect($scope.$emit).not.toHaveBeenCalled();
                                            });
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
                                                });

                                                describe('if the card autoplays', function() {
                                                    beforeEach(function() {
                                                        $scope.config.data.autoplay = true;

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

                                                    describe('as timeupdates occur', function() {
                                                        it('should tick the nav', function() {
                                                            timeupdate(1);
                                                            expect(NavController.tick).toHaveBeenCalledWith(5);

                                                            timeupdate(2);
                                                            expect(NavController.tick).toHaveBeenCalledWith(4);

                                                            timeupdate(7);
                                                            expect(NavController.tick).toHaveBeenCalledWith(0);
                                                        });

                                                        describe('when the current time exceeds the skip time', function() {
                                                            beforeEach(function() {
                                                                timeupdate(3);
                                                                expect(NavController.enabled).not.toHaveBeenCalledWith(true);

                                                                timeupdate(6.1);
                                                                NavController.tick.calls.reset();
                                                            });

                                                            it('should enable the nav', function() {
                                                                expect(NavController.enabled).toHaveBeenCalledWith(true);
                                                            });

                                                            it('should not tick the nav anymore', function() {
                                                                timeupdate(7);
                                                                expect(NavController.tick).not.toHaveBeenCalled();
                                                            });
                                                        });
                                                    });
                                                });

                                                describe('if the card does not autoplay', function() {
                                                    beforeEach(function() {
                                                        $scope.config.data.autoplay = false;
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

                                                    it('should ignore timeupdates', function() {
                                                        NavController.tick.calls.reset();

                                                        timeupdate(1);
                                                        expect(NavController.tick).not.toHaveBeenCalled();
                                                    });

                                                    it('should count down using a $interval', function() {
                                                        $interval.flush(1000);
                                                        expect(NavController.tick).toHaveBeenCalledWith(6);

                                                        $interval.flush(1000);
                                                        expect(NavController.tick).toHaveBeenCalledWith(5);

                                                        $interval.flush(1000);
                                                        expect(NavController.tick).toHaveBeenCalledWith(4);
                                                    });

                                                    describe('after the interval counts down', function() {
                                                        beforeEach(function() {
                                                            $interval.flush(6000);
                                                        });

                                                        it('should enable the nav', function() {
                                                            expect(NavController.enabled).toHaveBeenCalledWith(true);
                                                        });

                                                        it('should not tick the nav anymore', function() {
                                                            NavController.tick.calls.reset();
                                                            $interval.flush(1000);

                                                            expect(NavController.tick).not.toHaveBeenCalled();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });

                                describe('when false', function() {
                                    [true, false].forEach(function(bool) {
                                        describe('if the card\'s autoplay property is ' + bool, function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    $scope.active = true;
                                                });

                                                $scope.config.data.autoplay = bool;

                                                expect(iface.pause).not.toHaveBeenCalled();
                                                $scope.$apply(function() {
                                                    $scope.active = false;
                                                });
                                            });

                                            it('should not play the video', function() {
                                                expect(iface.play).not.toHaveBeenCalled();
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
    });
});
