define(['minireel', 'c6uilib', 'services'], function(minireelModule, c6uilibModule) {
    'use strict';

    describe('VideoEmbedCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            $interval,
            c6EventEmitter,
            VideoEmbedCardCtrl;

        var ModuleService,
            c6ImagePreloader,
            c6AppData;

        beforeEach(function() {
            module(c6uilibModule.name, function($provide) {
                $provide.value('c6ImagePreloader', {
                    load: jasmine.createSpy('c6ImagePreloader.load()')
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

                ModuleService = $injector.get('ModuleService');
                spyOn(ModuleService, 'hasModule').and.callThrough();
                c6ImagePreloader = $injector.get('c6ImagePreloader');
                c6AppData = $injector.get('c6AppData');

                $rootScope.config = {
                    modules: ['ballot', 'comments'],
                    data: {
                        autoplay: true,
                        videoid: 'gy1B3agGNxw'
                    },
                    thumbs: {
                        small: 'small.jpg',
                        large: 'large.jpg'
                    }
                };
                $rootScope.profile = {
                    autoplay: true,
                    touch: false
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
                        textMode: true,
                        modules: {
                            ballot: {
                                ballotActive: false,
                                resultsActive: false,
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
            describe('config._data.textMode', function() {
                beforeEach(function() {
                    spyOn(VideoEmbedCardCtrl, 'dismissBallot');
                    $rootScope.$digest();
                });

                describe('initialization', function() {
                    it('should not dismiss the ballot', function() {
                        expect(VideoEmbedCardCtrl.dismissBallot).not.toHaveBeenCalled();
                    });
                });

                describe('whenever the property changes', function() {
                    function set(value) {
                        $scope.$apply(function() {
                            $scope.config._data.textMode = value;
                        });
                    }

                    it('should dismiss the ballot', function() {
                        set(false);
                        expect(VideoEmbedCardCtrl.dismissBallot).toHaveBeenCalled();

                        set(true);
                        expect(VideoEmbedCardCtrl.dismissBallot.calls.count()).toBe(2);

                        set(false);
                        expect(VideoEmbedCardCtrl.dismissBallot.calls.count()).toBe(3);
                    });
                });
            });

            describe('config._data.modules.ballot.vote', function() {
                beforeEach(function() {
                    spyOn(VideoEmbedCardCtrl, 'showText');

                    $scope.$apply(function() {
                        $scope.config._data.modules.ballot.vote = null;
                    });
                });

                it('should not switch to text mode on initialization', function() {
                    expect(VideoEmbedCardCtrl.showText).not.toHaveBeenCalled();
                });

                it('should switch to text mode after a vote is recorded', function() {
                    $scope.$apply(function() {
                        $scope.config._data.modules.ballot.vote = 0;
                    });

                    expect(VideoEmbedCardCtrl.showText).toHaveBeenCalled();
                });
            });

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

                    it('should not preload anything if there are no thumbs', function() {
                        $scope.$apply(function() {
                            $scope.onDeck = false;
                            $rootScope.config.thumbs = null;
                        });

                        $scope.$apply(function() {
                            $scope.onDeck = true;
                        });

                        expect(c6ImagePreloader.load.calls.count()).toBe(1);
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
                });
            });

            describe('active', function() {
                var iface;

                beforeEach(function() {
                    iface = c6EventEmitter({
                        play: jasmine.createSpy('iface.play()'),
                        pause: jasmine.createSpy('iface.pause()')
                    });

                    $scope.$emit('playerAdd', iface);
                });

                describe('when initialized', function() {
                    beforeEach(function() {
                        $rootScope.$digest();
                    });

                    it('should not play or paused the player', function() {
                        expect(iface.play).not.toHaveBeenCalled();
                    });

                    it('should not put in a dummy vote', function() {
                        expect($scope.config._data.modules.ballot.vote).toBeNull();
                    });
                });

                describe('when not active', function() {
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

                describe('putting a dummy vote in', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    it('should happen when the card becomes inactive if the voting module is active', function() {
                        Object.defineProperty($scope.config._data.modules.ballot, 'ballotActive', {
                            configurable: true,
                            value: false
                        });

                        $scope.$apply(function() {
                            $scope.active = false;
                        });

                        expect($scope.config._data.modules.ballot.vote).toBeNull();

                        $scope.$apply(function() {
                            $scope.active = true;
                        });

                        Object.defineProperty($scope.config._data.modules.ballot, 'ballotActive', {
                            configurable: true,
                            value: true
                        });

                        $scope.$apply(function() {
                            $scope.active = false;
                        });

                        expect($scope.config._data.modules.ballot.vote).toBe(-1);
                    });
                });

                describe('when active', function() {
                    beforeEach(function() {
                        spyOn(VideoEmbedCardCtrl, 'dismissBallot');
                        spyOn(VideoEmbedCardCtrl, 'dismissBallotResults');

                        $scope.$apply(function() {
                            $scope.active = false;
                        });

                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    describe('if the video has never played before', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            $scope.config._data.playerEvents.play.emitCount = 0;
                            spyOn($scope, '$emit').and.callThrough();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should $emit <mr-card>:init', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:init', jasmine.any(Function));
                        });

                        describe('when the passed function is called back', function() {
                            var navController;

                            function passNavController() {
                                $scope.$emit.calls.mostRecent().args[1](navController);
                            }

                            function timeupdate(time) {
                                iface.currentTime = time;
                                iface.emit('timeupdate');
                            }

                            beforeEach(function() {
                                navController = {
                                    tick: jasmine.createSpy('NavController.tick()')
                                        .and.callFake(function() { return this; }),
                                    enabled: jasmine.createSpy('NavController.enabled()')
                                        .and.callFake(function() { return this; })
                                };
                            });

                            describe('if the card can be skipped any time', function() {
                                beforeEach(function() {
                                    $scope.config.data.skip = true;
                                    passNavController();
                                });

                                it('should not disable the nav', function() {
                                    expect(navController.enabled).not.toHaveBeenCalled();
                                    expect(navController.tick).not.toHaveBeenCalled();
                                });
                            });

                            describe('if the card can never be skipped', function() {
                                beforeEach(function() {
                                    $scope.config.data.skip = false;
                                });

                                [true, false].forEach(function(autoplay) {
                                    describe('if autoplay is ' + autoplay, function() {
                                        beforeEach(function() {
                                            iface.duration = 60;
                                            $scope.config.data.autoplay = autoplay;
                                            passNavController();
                                        });

                                        it('should tick the nav with the video\'s duration', function() {
                                            expect(navController.tick).toHaveBeenCalledWith(60);
                                        });

                                        it('should disable the nav', function() {
                                            expect(navController.enabled).toHaveBeenCalledWith(false);
                                        });

                                        it('should decrement the time as the video progresses', function() {
                                            timeupdate(0.5);
                                            expect(navController.tick).toHaveBeenCalledWith(59.5);

                                            timeupdate(2);
                                            expect(navController.tick).toHaveBeenCalledWith(58);
                                        });

                                        describe('when the video ends', function() {
                                            var tickCount, enabledCount;

                                            beforeEach(function() {
                                                iface.emit('ended');
                                                tickCount = navController.tick.calls.count();
                                                enabledCount = navController.enabled.calls.count();
                                            });

                                            it('should enable the nav', function() {
                                                expect(navController.enabled).toHaveBeenCalledWith(true);
                                            });

                                            it('should not interact with the nav controller again', function() {
                                                iface.emit('timeupdate');
                                                expect(navController.tick.calls.count()).toBe(tickCount, 'called tick');

                                                iface.emit('ended');
                                                expect(navController.enabled.calls.count()).toBe(enabledCount, 'called enabled');
                                            });
                                        });
                                    });
                                });
                            });

                            describe('if the card can be skipped after a certain amount of time', function() {
                                beforeEach(function() {
                                    $scope.config.data.skip = 6;
                                    passNavController();
                                });

                                it('should tick the controller with the amount of time remaining', function() {
                                    expect(navController.tick).toHaveBeenCalledWith(6);
                                });

                                it('should disable the nav', function() {
                                    expect(navController.enabled).toHaveBeenCalledWith(false);
                                });

                                describe('if the video is autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = true;
                                        passNavController();
                                    });

                                    it('should not count via $interval', function() {
                                        $interval.flush(1000);
                                        expect(navController.tick).not.toHaveBeenCalledWith(5);
                                    });

                                    it('should tick the nav controller as the video plays', function() {
                                        timeupdate(0.2);
                                        expect(navController.tick).toHaveBeenCalledWith(5.8);

                                        timeupdate(1);
                                        expect(navController.tick).toHaveBeenCalledWith(5);

                                        timeupdate(6.1);
                                        expect(navController.tick).toHaveBeenCalledWith(0);
                                    });

                                    it('should enable the nav when the video has played enough', function() {
                                        timeupdate(3);
                                        expect(navController.enabled).not.toHaveBeenCalledWith(true);

                                        timeupdate(6.4);
                                        expect(navController.enabled).toHaveBeenCalledWith(true);
                                    });

                                    it('should remove the timeupdate listener after the nav has been enabled', function() {
                                        var callCount;

                                        timeupdate(6);
                                        callCount = navController.tick.calls.count();

                                        timeupdate(7);
                                        expect(navController.tick.calls.count()).toBe(callCount);
                                    });
                                });

                                describe('if the video is not autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = false;
                                        iface.removeAllListeners();
                                        passNavController();
                                    });

                                    it('should count down via a $interval', function() {
                                        $interval.flush(1000);
                                        expect(navController.tick).toHaveBeenCalledWith(6);

                                        $interval.flush(1000);
                                        expect(navController.tick).toHaveBeenCalledWith(5);

                                        $interval.flush(1000);
                                        expect(navController.tick).toHaveBeenCalledWith(4);
                                    });

                                    it('should enable the nav after the countdown', function() {
                                        $interval.flush(1000);
                                        expect(navController.enabled).not.toHaveBeenCalledWith(true);

                                        $interval.flush(5000);
                                        expect(navController.enabled).toHaveBeenCalledWith(true);
                                    });
                                });
                            });
                        });
                    });

                    describe('if the video has played', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            $scope.config._data.playerEvents.play.emitCount = 1;
                            spyOn($scope, '$emit').and.callThrough();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not $emit <mr-card>:init', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });

                    it('should dismiss the ballot and results', function() {
                        expect(VideoEmbedCardCtrl.dismissBallot).toHaveBeenCalled();
                        expect(VideoEmbedCardCtrl.dismissBallotResults).toHaveBeenCalled();
                    });

                    describe('if the behavior can autoplay and the experience is set to autoplay', function() {
                        it('should play the video', function() {
                            expect(iface.play).toHaveBeenCalled();
                        });
                    });

                    describe('if the experience is set not to autoplay', function() {
                        var currentPlayCalls;

                        beforeEach(function() {
                            currentPlayCalls = iface.play.calls.count();

                            $scope.config.data.autoplay = false;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not play the video', function() {
                            expect(iface.play.calls.count()).toBe(currentPlayCalls);
                        });
                    });

                    describe('if the device does not support autoplay', function() {
                        var currentPlayCalls;

                        beforeEach(function() {
                            currentPlayCalls = iface.play.calls.count();

                            c6AppData.profile.autoplay = false;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not play the video', function() {
                            expect(iface.play.calls.count()).toBe(currentPlayCalls);
                        });
                    });

                    describe('if the behavior is not to autoplay', function() {
                        var currentPlayCalls;

                        beforeEach(function() {
                            currentPlayCalls = iface.play.calls.count();

                            c6AppData.behaviors.canAutoplay = false;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not play the video', function() {
                            expect(iface.play.calls.count()).toBe(currentPlayCalls);
                        });
                    });
                });
            });
        });

        describe('events', function() {
            describe('playerAdd', function() {
                var iface;

                beforeEach(function() {
                    iface = c6EventEmitter({
                        webHref: 'https://www.youtube.com/watch?v=oMB5YFtWQTE',
                        play: jasmine.createSpy('iface.play()'),
                        pause: jasmine.createSpy('iface.pause()')
                    });
                    spyOn(iface, 'once').and.callThrough();

                    $scope.$emit('playerAdd', iface);
                });

                it('should set the controller\'s videoUrl property to the webHref property of the player', function() {
                    iface.emit('ready', iface);

                    expect(VideoEmbedCardCtrl.videoUrl).toBe(iface.webHref);
                });

                describe('when "play" is emitted', function() {
                    beforeEach(function() {
                        VideoEmbedCardCtrl.postModuleActive = true;
                        iface.emit('play', iface);
                        VideoEmbedCardCtrl.postModuleActive = true;
                        iface.emit('play', iface);
                    });

                    it('should set "postModuleActive" to false', function() {
                        expect(VideoEmbedCardCtrl.postModuleActive).toBe(false);
                    });

                    it('should set _data.modules.displayAd.active to true', function() {
                        expect($scope.config._data.modules.displayAd.active).toBe(true);
                    });
                });

                describe('when "ended" is emitted', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').and.callThrough();
                    });

                    it('should set postModuleActive to true', function() {
                        $scope.$apply(function() {
                            iface.emit('ended');
                        });

                        expect(VideoEmbedCardCtrl.postModuleActive).toBe(true);
                    });

                    describe('if the ballot module is present', function() {
                        beforeEach(function() {
                            $scope.config.modules.length = 0;
                            $scope.config.modules.push('ballot');

                            $scope.$apply(function() {
                                iface.emit('ended', iface);
                            });
                        });

                        it('should not $emit the <mr-card>:contentEnd event', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the post module is present', function() {
                        beforeEach(function() {
                            $scope.config.modules.length = 0;
                            $scope.config.modules.push('post');

                            $scope.$apply(function() {
                                iface.emit('ended');
                            });
                        });

                        it('should not $emit the <mr-card>:contentEnd event', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the ballot module is not present', function() {
                        beforeEach(function() {
                            $scope.config.modules.length = 0;

                            $scope.$apply(function() {
                                iface.emit('ended', iface);
                            });
                        });

                        it('should $emit the <mr-card>:contentEnd event', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                        });

                        describe('if there is a config.meta object', function() {
                            beforeEach(function() {
                                $scope.config.meta = {};
                                $scope.$apply(function() {
                                    iface.emit('ended', iface);
                                });
                            });

                        it('should $emit the <mr-card>:contentEnd event with the meta object', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config.meta);
                        });
                        });
                    });
                });

                describe('config._data.modules.ballot.resultsActive', function() {
                    var ballot;

                    beforeEach(function() {
                        ballot = $scope.config._data.modules.ballot;
                    });

                    describe('if the results are inline', function() {
                        beforeEach(function() {
                            c6AppData.behaviors.inlineVoteResults = true;
                        });

                        it('should be true as long as there are voting results', function() {
                            expect(ballot.resultsActive).toBe(false);

                            ballot.vote = 0;
                            expect(ballot.resultsActive).toBe(true);

                            ballot.vote = -1;
                            expect(ballot.resultsActive).toBe(true);

                            ballot.vote = 2;
                            expect(ballot.resultsActive).toBe(true);
                        });
                    });

                    describe('if the results are not inline', function() {
                        beforeEach(function() {
                            c6AppData.behaviors.inlineVoteResults = false;
                        });

                        it('should be true if the user has voted and the video is not playing (and has been played once)', function() {
                            $scope.active = true;
                            iface.paused = true;
                            iface.ended = false;
                            ballot.vote = null;

                            expect(ballot.resultsActive).toBe(false);

                            iface.paused = false;
                            iface.emit('play', iface);

                            expect(ballot.resultsActive).toBe(false);

                            iface.paused = true;
                            iface.emit('pause', iface);

                            expect(ballot.resultsActive).toBe(false);

                            ballot.vote = 0;

                            expect(ballot.resultsActive).toBe(true);

                            iface.paused = false;
                            iface.emit('play', iface);

                            expect(ballot.resultsActive).toBe(false);

                            iface.paused = true;
                            iface.ended = true;
                            iface.emit('ended', iface);
                            iface.emit('paused', iface);

                            expect(ballot.resultsActive).toBe(true);
                        });

                        it('should be overrideable by VideoEmbedCardCtrl.dismissBallotResults()', function() {
                            $scope.active = true;
                            iface.paused = false;
                            iface.emit('play', iface);

                            iface.paused = true;
                            iface.emit('pause', iface);

                            ballot.vote = 1;

                            expect(ballot.resultsActive).toBe(true);

                            VideoEmbedCardCtrl.dismissBallotResults();

                            expect(ballot.resultsActive).toBe(false);

                            iface.paused = false;
                            iface.emit('play', iface);

                            iface.paused = true;
                            iface.emit('pause', iface);

                            expect(ballot.resultsActive).toBe(true);
                        });
                    });
                });

                describe('config._data.modules.ballot.ballotActive', function() {
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
                        expect(ballot.ballotActive).toBe(false);

                        $scope.$apply(function() {
                            iface.emit('play', iface);
                            iface.paused = false;
                            iface.ended = false;
                        });
                        expect(ballot.ballotActive).toBe(false);

                        $scope.$apply(function() {
                            iface.ended = true;
                        });
                        expect(ballot.ballotActive).toBe(true);

                        $scope.$apply(function() {
                            iface.paused = true;
                            iface.ended = false;
                        });
                        expect(ballot.ballotActive).toBe(true);

                        $scope.$apply(function() {
                            $scope.active = false;
                        });
                        expect(ballot.ballotActive).toBe(false);

                        $scope.$apply(function() {
                            $scope.active = true;
                            ballot.vote = 0;
                        });
                        expect(ballot.ballotActive).toBe(false);
                    });

                    it('should be temporarily overrideable by VideoEmbedCardCtrl.dismissBallot()', function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                        iface.emit('play', iface);
                        iface.emit('play', iface);
                        iface.paused = true;
                        iface.ended = false;

                        expect(ballot.ballotActive).toBe(true);

                        $scope.$apply(function() {
                            VideoEmbedCardCtrl.dismissBallot();
                        });
                        expect(ballot.ballotActive).toBe(false);

                        $scope.$apply(function() {
                            iface.paused = false;
                            iface.emit('play', iface);
                        });
                        expect(ballot.ballotActive).toBe(false);

                        $scope.$apply(function() {
                            iface.ended = true;
                        });
                        expect(ballot.ballotActive).toBe(true);
                    });
                });
            });
        });

        describe('@public', function() {
            describe('properties', function() {
                describe('postModuleActive', function() {
                    it('should be false', function() {
                        expect(VideoEmbedCardCtrl.postModuleActive).toBe(false);
                    });
                });

                describe('experienceTitle', function() {
                    it('should come from the c6AppData experience', function() {
                        expect(VideoEmbedCardCtrl.experienceTitle).toBe('Foo');
                    });
                });

                describe('videoUrl', function() {
                    it('should be initialized as null', function() {
                        expect(VideoEmbedCardCtrl.videoUrl).toBeNull();
                    });
                });

                describe('showPlay', function() {
                    describe('if the player has not been received yet', function() {
                        it('should be false', function() {
                            expect(VideoEmbedCardCtrl.showPlay).toBe(false);
                        });
                    });

                    describe('if the player has been received', function() {
                        var player;

                        beforeEach(function() {
                            player = c6EventEmitter({
                                paused: true
                            });

                            $scope.$emit('playerAdd', player);
                        });

                        it('should be the same as the "paused" property of the player', function() {
                            expect(VideoEmbedCardCtrl.showPlay).toBe(true);

                            player.paused = false;

                            expect(VideoEmbedCardCtrl.showPlay).toBe(false);
                        });
                    });
                });

                describe('enablePlayButton', function() {
                    describe('if this is a dailymotion video', function() {
                        beforeEach(function() {
                            $rootScope.config.type = 'dailymotion';

                            $scope.$apply(function() {
                                VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                            });
                        });

                        it('should be false', function() {
                            expect(VideoEmbedCardCtrl.enablePlayButton).toBe(false);
                        });
                    });

                    describe('if this is a touch device', function() {
                        beforeEach(function() {
                            $rootScope.profile.touch = true;

                            $scope.$apply(function() {
                                VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                            });
                        });

                        it('should be false', function() {
                            expect(VideoEmbedCardCtrl.enablePlayButton).toBe(false);
                        });
                    });

                    describe('if this is an autoplay card', function() {
                        beforeEach(function() {
                            $scope.config.data.autoplay = true;

                            $scope.$apply(function() {
                                VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                            });
                        });

                        it('should be false', function() {
                            expect(VideoEmbedCardCtrl.enablePlayButton).toBe(false);
                        });
                    });

                    describe('otherwise', function() {
                        beforeEach(function() {
                            $scope.config.data.autoplay = false;

                            $scope.$apply(function() {
                                VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                            });
                        });

                        it('should be true', function() {
                            expect(VideoEmbedCardCtrl.enablePlayButton).toBe(true);
                        });
                    });
                });

                describe('flyAway', function() {
                    describe('if the ballot module is not enabled', function() {
                        beforeEach(function() {
                            spyOn(VideoEmbedCardCtrl, 'hasModule').and.callFake(function(module) {
                                if (module === 'ballot') {
                                    return false;
                                }
                            });
                        });

                        it('should be false if the ballot module is active, but not enabled', function() {
                            $scope.active = true;
                            $scope.config._data.modules.ballot.ballotActive = true;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                        });

                        it('should be true if the card is not active', function() {
                            $scope.active = false;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                        });
                    });

                    describe(', if the ballot module is enabled,', function() {
                        beforeEach(function() {
                            spyOn(VideoEmbedCardCtrl, 'hasModule').and.callFake(function(module) {
                                if (module === 'ballot') {
                                    return true;
                                }
                            });
                        });

                        it('should be true if the ballot is active', function() {
                            $scope.$apply(function() {
                                $scope.config._data.modules.ballot.ballotActive = true;
                                $scope.active = true;
                            });

                            expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                        });

                        it('should be true if the card is not active', function() {
                            $scope.$apply(function() {
                                $scope.config._data.modules.ballot.ballotActive = false;
                                $scope.active = false;
                            });
                            expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                        });

                        it('should be true if the ballot results are active and they are not inline', function() {
                            var ballot = $scope.config._data.modules.ballot;

                            $scope.active = true;
                            c6AppData.behaviors.inlineVoteResults = true;
                            ballot.ballotActive = false;
                            ballot.resultsActive = true;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(false);

                            c6AppData.behaviors.inlineVoteResults = false;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                        });
                    });

                    describe('if the app has a separate text view', function() {
                        beforeEach(function() {
                            spyOn(VideoEmbedCardCtrl, 'hasModule').and.returnValue(false);

                            $scope.active = true;
                            c6AppData.behaviors.separateTextView = true;
                        });

                        it('should be true if text mode is on', function() {
                            $scope.config._data.textMode = true;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                        });

                        it('should be false if text mode is off', function() {
                            $scope.config._data.textMode = false;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                        });
                    });

                    describe('if the experience is click to play', function() {
                        beforeEach(function() {
                            spyOn(VideoEmbedCardCtrl, 'hasModule').and.returnValue(false);
                            $scope.config.data.autoplay = false;

                            $scope.active = true;
                            VideoEmbedCardCtrl.enablePlayButton = true;
                        });

                        it('should be false if this.enablePlayButton is false', function() {
                            VideoEmbedCardCtrl.enablePlayButton = false;

                            expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                        });

                        describe('if the video has not played yet', function() {
                            it('should be true', function() {
                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });
                        });

                        describe('after the video plays', function() {
                            beforeEach(function() {
                                $rootScope.config._data.playerEvents.play = {
                                    emitCount: 1
                                };
                            });

                            it('should be false', function() {
                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                            });
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

                describe('playVideo()', function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({
                            play: jasmine.createSpy('iface.play()')
                        });

                        $scope.$emit('playerAdd', iface);
                    });

                    it('should play the video', function() {
                        expect(iface.play).not.toHaveBeenCalled();

                        VideoEmbedCardCtrl.playVideo();

                        expect(iface.play).toHaveBeenCalled();
                    });
                });

                describe('mode methods', function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({
                            webHref: 'https://www.youtube.com/watch?v=oMB5YFtWQTE',
                            play: jasmine.createSpy('iface.play()'),
                            pause: jasmine.createSpy('iface.pause()')
                        });

                        $scope.$emit('playerAdd', iface);
                    });

                    describe('showText()', function() {
                        beforeEach(function() {
                            $scope.config._data.textMode = false;

                            VideoEmbedCardCtrl.showText();
                        });

                        it('should pause the player and show the text', function() {
                            expect(iface.pause).toHaveBeenCalled();
                            expect($scope.config._data.textMode).toBe(true);
                        });
                    });

                    describe('hideText()', function() {
                        beforeEach(function() {
                            $scope.config._data.textMode = true;

                            VideoEmbedCardCtrl.hideText();
                        });

                        it('should play the player and hide the text', function() {
                            expect(iface.play).toHaveBeenCalled();
                            expect($scope.config._data.textMode).toBe(false);
                        });

                        it('should not play the player if the device does not support autoplay', function() {
                            $rootScope.profile.autoplay = false;

                            VideoEmbedCardCtrl.hideText();
                            expect(iface.play.calls.count()).toBe(1);
                        });
                    });
                });
            });
        });
    });
});
