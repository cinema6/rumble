define(['app', 'services', 'tracker'], function(appModule, servicesModule, trackerModule) {
    'use strict';

    describe('VideoCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            $interval,
            c6EventEmitter,
            compileAdTag,
            trackerService,
            VideoTrackerService,
            MiniReelService,
            VideoCardCtrl;

        var ModuleService,
            c6ImagePreloader,
            c6AppData,
            adTag,
            tracker;


        function instantiate() {
            $scope.$apply(function() {
                VideoCardCtrl = $controller('VideoCardController', { $scope: $scope });
            });
        }

        function Player() {
            this.play = jasmine.createSpy('iface.play()');
            this.pause = jasmine.createSpy('iface.pause()');
            this.load = jasmine.createSpy('iface.load()');
            this.reload = jasmine.createSpy('iface.reload()');
            this.getCompanions = jasmine.createSpy('iface.getCompanions()')
                .and.returnValue(null);
            this.minimize = jasmine.createSpy('iface.minimize()');

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

                ModuleService = $injector.get('ModuleService');
                spyOn(ModuleService, 'hasModule').and.callThrough();
                c6ImagePreloader = $injector.get('c6ImagePreloader');
                spyOn(c6ImagePreloader, 'load');
                c6AppData = $injector.get('c6AppData');
                MiniReelService = $injector.get('MiniReelService');
                trackerService = $injector.get('trackerService');
                VideoTrackerService = $injector.get('VideoTrackerService');

                $scope = $rootScope.$new();
                $scope.hasModule = function(module) {
                    return $scope.config.modules.indexOf(module) > -1;
                };
                $scope.config = {
                    id: 'rc-dec185bad0c8ee',
                    title: 'I LOVE This Video!',
                    modules: ['displayAd'],
                    webHref: 'https://www.youtube.com/watch?v=NLBVBuZ1D-w',
                    source: 'YouTube',
                    type: 'youtube',
                    ballot: {
                        choices: [
                            'Too Funny',
                            'Too Far'
                        ]
                    },
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
                $scope.number = '3';
                spyOn($scope, '$emit').and.callThrough();
                instantiate();
                spyOn(tracker, 'trackEvent');
            });
        });

        it('should exist', function() {
            expect(VideoCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('initialization', function() {
            describe('if the config already has _data', function() {
                var origData;

                beforeEach(function() {
                    origData = $scope.config._data = {};

                    VideoCardCtrl = $controller('VideoCardController', { $scope: $scope });
                });

                it('should not overwrite the data', function() {
                    expect($scope.config._data).toBe(origData);
                });
            });

            describe('if the config has no _data', function() {
                it('should create some data', function() {
                    expect($scope.config._data).toEqual({
                        hasPlayed: false,
                        companion: null,
                        tracking: {
                            clickFired: false,
                            countFired: false
                        },
                        modules: {
                            ballot: {
                                ballotActive: false,
                                resultsActive: false,
                                vote: null
                            },
                            post: {
                                active: false,
                                ballot: $scope.config.ballot
                            }
                        }
                    });
                });
            });
        });

        describe('properties', function() {
            describe('player', function() {
                it('should be null', function() {
                    expect(VideoCardCtrl.player).toBeNull();
                });
            });

            describe('adType', function() {
                describe('if the browser does not support flash', function() {
                    beforeEach(function() {
                        $scope.profile.flash = false;
                        instantiate();
                    });

                    it('should be "vast"', function() {
                        expect(VideoCardCtrl.adType).toBe('vast');
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
                            expect(VideoCardCtrl.adType).toBe('vpaid');
                        });
                    });

                    describe('if there is no vpaid tag', function() {
                        beforeEach(function() {
                            delete $scope.config.data.vpaid;
                            instantiate();
                        });

                        it('should be "vast"', function() {
                            expect(VideoCardCtrl.adType).toBe('vast');
                        });
                    });
                });
            });

            describe('adTag', function() {
                describe('if the card is not an adUnit card', function() {
                    beforeEach(function() {
                        $scope.config.data = {
                            service: 'youtube',
                            videoid: '893rhfn43r'
                        };

                        instantiate();
                    });

                    it('should be null', function() {
                        expect(VideoCardCtrl.adTag).toBeNull();
                    });
                });

                describe('if the browser does not support flash', function() {
                    beforeEach(function() {
                        $scope.profile.flash = false;
                        instantiate();
                    });

                    it('should be the vast tag', function() {
                        expect(compileAdTag).toHaveBeenCalledWith($scope.config.data.vast);
                        expect(VideoCardCtrl.adTag).toBe(adTag);
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
                            expect(VideoCardCtrl.adTag).toBe(adTag);
                        });
                    });

                    describe('if there is no vpaid tag', function() {
                        beforeEach(function() {
                            delete $scope.config.data.vpaid;
                            instantiate();
                        });

                        it('should be "vast"', function() {
                            expect(compileAdTag).toHaveBeenCalledWith($scope.config.data.vast);
                            expect(VideoCardCtrl.adTag).toBe(adTag);
                        });
                    });
                });
            });

            describe('showPlay', function() {
                describe('if there is no player', function() {
                    beforeEach(function() {
                        VideoCardCtrl.player = null;
                    });

                    it('should be false', function() {
                        expect(VideoCardCtrl.showPlay).toBe(false);
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
                                        expect(VideoCardCtrl.showPlay).toBe(false);
                                    });
                                });
                            });

                            describe('if the player has played', function() {
                                beforeEach(function() {
                                    player.emit('play');
                                });

                                it('should be ' + bool, function() {
                                    expect(VideoCardCtrl.showPlay).toBe(bool);
                                });

                                describe('if the player is reinstantiated', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            VideoCardCtrl = $controller('VideoCardController', {
                                                $scope: $scope
                                            });
                                        });
                                        $scope.$apply(function() {
                                            $scope.$emit('<vpaid-player>:init', player);
                                        });
                                        $scope.$apply(function() {
                                            player.emit('ready');
                                        });
                                    });

                                    it('should be false', function() {
                                        expect(VideoCardCtrl.showPlay).toBe(false);
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('flyAway', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.active = true;
                    });
                });

                describe('if the video has played', function() {
                    beforeEach(function() {
                        var player = new Player();

                        $scope.$emit('<vpaid-player>:init', player);
                        player.emit('ready');
                        player.emit('play');
                    });

                    describe('if the post module is not present', function() {
                        beforeEach(function() {
                            $scope.config.modules = ['displayAd'];
                        });

                        [true, false].forEach(function(bool) {
                            describe('if $scope.config._data.modules.post.active is ' + bool, function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.post.active = bool;
                                });

                                it('should be false', function() {
                                    expect(VideoCardCtrl.flyAway).toBe(false);
                                });

                                describe('if active is false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.active = false;
                                        });
                                    });

                                    it('should be true', function() {
                                        expect(VideoCardCtrl.flyAway).toBe(true);
                                    });
                                });
                            });
                        });
                    });

                    describe('if the post module is present', function() {
                        beforeEach(function() {
                            $scope.config.modules = ['displayAd', 'post'];
                        });

                        [true, false].forEach(function(bool) {
                            describe('if $scope.config._data.modules.post.active is ' + bool, function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.post.active = bool;
                                });

                                it('should be ' + bool, function() {
                                    expect(VideoCardCtrl.flyAway).toBe(bool);
                                });

                                describe('if active is false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.active = false;
                                        });
                                    });

                                    it('should be true', function() {
                                        expect(VideoCardCtrl.flyAway).toBe(true);
                                    });
                                });
                            });
                        });
                    });

                    describe('if the ballot module is not present', function() {
                        beforeEach(function() {
                            $scope.config.modules = ['displayAd'];
                        });

                        [true, false].forEach(function(bool) {
                            describe('if _data.modules.ballot.ballotActive is ' + bool, function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.ballot.ballotActive = bool;
                                });

                                it('should be false', function() {
                                    expect(VideoCardCtrl.flyAway).toBe(false);
                                });

                                describe('if active is false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.active = false;
                                        });
                                    });

                                    it('should be true', function() {
                                        expect(VideoCardCtrl.flyAway).toBe(true);
                                    });
                                });
                            });
                        });

                        [true, false].forEach(function(bool) {
                            describe('if _data.modules.ballot.resultsActive is ' + bool, function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.ballot.resultsActive = bool;
                                });

                                [true, false].forEach(function(inlineVoteResults) {
                                    describe('if c6AppData.behaviors.inlineVoteResults is ' + inlineVoteResults, function() {
                                        beforeEach(function() {
                                            c6AppData.behaviors.inlineVoteResults = inlineVoteResults;
                                        });

                                        it('should be false', function() {
                                            expect(VideoCardCtrl.flyAway).toBe(false);
                                        });

                                        describe('if active is false', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    $scope.active = false;
                                                });
                                            });

                                            it('should be true', function() {
                                                expect(VideoCardCtrl.flyAway).toBe(true);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });

                    describe('if the ballot module is present', function() {
                        beforeEach(function() {
                            $scope.config.modules = ['displayAd', 'ballot'];
                        });

                        [true, false].forEach(function(bool) {
                            describe('if _data.modules.ballot.ballotActive is ' + bool, function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.ballot.ballotActive = bool;
                                });

                                it('should be ' + bool, function() {
                                    expect(VideoCardCtrl.flyAway).toBe(bool);
                                });

                                describe('if active is false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.active = false;
                                        });
                                    });

                                    it('should be true', function() {
                                        expect(VideoCardCtrl.flyAway).toBe(true);
                                    });
                                });
                            });
                        });

                        [true, false].forEach(function(bool) {
                            describe('if _data.modules.ballot.resultsActive is ' + bool, function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.ballot.resultsActive = bool;
                                });

                                [true, false].forEach(function(inlineVoteResults) {
                                    describe('if c6AppData.behaviors.inlineVoteResults is ' + inlineVoteResults, function() {
                                        beforeEach(function() {
                                            c6AppData.behaviors.inlineVoteResults = inlineVoteResults;
                                        });

                                        it('should be ' + (bool && !inlineVoteResults), function() {
                                            expect(VideoCardCtrl.flyAway).toBe(bool && !inlineVoteResults);
                                        });

                                        describe('if active is false', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    $scope.active = false;
                                                });
                                            });

                                            it('should be true', function() {
                                                expect(VideoCardCtrl.flyAway).toBe(true);
                                            });
                                        });
                                    });
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
                            expect(VideoCardCtrl.enablePlay).toBe(!bool);
                        });

                        describe('if the type is "dailymotion"', function() {
                            beforeEach(function() {
                                $scope.config.type = 'dailymotion';
                                instantiate();
                            });

                            it('should be false', function() {
                                expect(VideoCardCtrl.enablePlay).toBe(false);
                            });
                        });

                        describe('if the type is "embedded"', function() {
                            beforeEach(function() {
                                $scope.config.type = 'embedded';
                                instantiate();
                            });

                            it('should be false', function() {
                                expect(VideoCardCtrl.enablePlay).toBe(false);
                            });
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('closeBallot()', function() {
                beforeEach(function() {
                    ['ballotActive'].forEach(function(prop) {
                        $scope.config._data.modules.ballot[prop] = true;
                    });

                    VideoCardCtrl.closeBallot();
                });

                it('should the ballot', function() {
                    ['ballotActive'].forEach(function(prop) {
                        expect($scope.config._data.modules.ballot[prop]).toBe(false);
                    });
                });
            });

            describe('closeBallotResults()', function() {
                beforeEach(function() {
                    $scope.config._data.modules.ballot.resultsActive = true;

                    VideoCardCtrl.closeBallotResults();
                });

                it('should the ballot results', function() {
                    expect($scope.config._data.modules.ballot.resultsActive).toBe(false);
                });
            });
        });

        describe('$events', function() {
            [
                '<vast-player>:init',
                '<vpaid-player>:init',
                '<youtube-player>:init',
                '<vimeo-player>:init',
                '<dailymotion-player>:init',
                '<rumble-player>:init',
                '<embedded-player>:init'
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
                        expect(VideoCardCtrl.player).not.toBe(iface);
                    });

                    describe('when the iface is ready', function() {
                        beforeEach(function() {
                            spyOn(VideoTrackerService, 'trackQuartiles').and.callThrough();

                            $scope.$apply(function() {
                                iface.emit('ready');
                            });
                        });

                        it('should out the player on the controller', function() {
                            expect(VideoCardCtrl.player).toBe(iface);
                        });

                        describe('<ballot-vote-module>:vote', function() {
                            beforeEach(function() {
                                spyOn(VideoCardCtrl, 'closeBallot').and.callThrough();
                                $scope.config._data.modules.ballot.resultsActive = false;

                                $scope.$emit('<ballot-vote-module>:vote', 0);
                            });

                            it('should close the ballot', function() {
                                expect(VideoCardCtrl.closeBallot).toHaveBeenCalled();
                            });

                            it('should show the results', function() {
                                expect($scope.config._data.modules.ballot.resultsActive).toBe(true);
                            });
                        });

                        describe('<post-module>:vote', function() {
                            beforeEach(function() {
                                expect($scope.config._data.modules.post.ballot).toEqual(jasmine.any(Object));
                                $scope.config._data.modules.post.active = true;

                                $scope.$emit('<post-module>:vote', 0);
                                $scope.$emit.calls.reset();
                            });

                            it('should close the post module', function() {
                                expect($scope.config._data.modules.post.active).toBe(false);
                            });

                            it('should nullify the ballot', function() {
                                expect($scope.config._data.modules.post.ballot).toBeNull();
                            });

                            describe('if the video is not ended', function() {
                                beforeEach(function() {
                                    iface.ended = false;

                                    $scope.$emit('<post-module>:vote', 1);
                                });

                                it('should not $emit any events', function() {
                                    expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                                });
                            });

                            describe('if the video is ended', function() {
                                beforeEach(function() {
                                    iface.ended = true;

                                    $scope.$emit('<post-module>:vote', 1);
                                });

                                it('should $emit the <mr-card>:contentEnd event', function() {
                                    expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                                });
                            });
                        });

                        describe('video tracking', function() {
                            function trackingData(action) {
                                return MiniReelService.getTrackingData($scope.config, $scope.number - 1, {
                                    category: 'Video',
                                    action: action,
                                    label: $scope.config.webHref,
                                    videoSource: $scope.config.source,
                                    videoDuration: iface.duration,
                                    nonInteraction: 0
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
                                });

                                describe('if the card is autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = true;

                                        iface.emit('play');
                                    });

                                    it('should track a non-interaction event', function() {
                                        expect(tracker.trackEvent).toHaveBeenCalledWith((function() {
                                            var data = trackingData('Play');

                                            data.nonInteraction = 1;

                                            return data;
                                        }()));
                                    });
                                });

                                describe('if the card is not autoplay', function() {
                                    beforeEach(function() {
                                        $scope.config.data.autoplay = false;

                                        iface.emit('play');
                                    });

                                    it('should track an event', function() {
                                        expect(tracker.trackEvent).toHaveBeenCalledWith(trackingData('Play'));
                                    });
                                });
                            });

                            describe('when the video pauses', function() {
                                beforeEach(function() {
                                    expect(tracker.trackEvent).not.toHaveBeenCalled();
                                    delete $scope.config.source;
                                    $scope.config.type = 'adUnit';

                                    iface.emit('pause');
                                });

                                it('should track an event', function() {
                                    expect(tracker.trackEvent).toHaveBeenCalledWith((function() {
                                        var data = trackingData('Pause');

                                        data.videoSource = $scope.config.type;

                                        return data;
                                    }()));
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

                            describe('when the user votes with the ballot module', function() {
                                beforeEach(function() {
                                    expect(tracker.trackEvent).not.toHaveBeenCalled();

                                    $scope.$emit('<ballot-vote-module>:vote', 1);
                                });

                                it('should track an event', function() {
                                    expect(tracker.trackEvent).toHaveBeenCalledWith((function() {
                                        var data = trackingData('Vote');

                                        data.label = $scope.config.ballot.choices[1];

                                        return data;
                                    }()));
                                });

                                describe('if the user passes on voting', function() {
                                    beforeEach(function() {
                                        tracker.trackEvent.calls.reset();

                                        $scope.$emit('<ballot-vote-module>:vote', -1);
                                    });

                                    it('should not track an event', function() {
                                        expect(tracker.trackEvent).not.toHaveBeenCalled();
                                    });
                                });
                            });

                            describe('when the user votes with the ballot module', function() {
                                beforeEach(function() {
                                    expect(tracker.trackEvent).not.toHaveBeenCalled();
                                    $scope.config.ballot = {
                                        prompt: 'Was it the best thing ever?',
                                        choices: ['YES', 'NO']
                                    };
                                });

                                it('should track an event', function() {
                                    $scope.config.ballot.choices.forEach(function(choice, index) {
                                        $scope.$emit('<post-module>:vote', index);

                                        expect(tracker.trackEvent).toHaveBeenCalledWith((function() {
                                            var data = trackingData('Vote');

                                            data.label = choice;

                                            return data;
                                        }()));
                                    });
                                });
                            });
                        });

                        describe('when the video ends', function() {
                            beforeEach(function() {
                                expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', jasmine.any(Object));

                                iface.emit('ended');
                            });

                            ['post', 'ballot'].forEach(function(module) {
                                describe('if the ' + module + ' module is present', function() {
                                    beforeEach(function() {
                                        $scope.config.modules = [module, 'displayAd'];
                                        $scope.$emit.calls.reset();

                                        iface.emit('ended');
                                    });

                                    it('should not emit <mr-card>:contentEnd', function() {
                                        expect($scope.$emit).not.toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                                    });
                                });

                                describe('if the ' + module + ' module is not present', function() {
                                    beforeEach(function() {
                                        $scope.config.modules = ['displayAd'];
                                        $scope.$emit.calls.reset();

                                        iface.emit('ended');
                                    });

                                    it('should $emit the <mr-card>:contentEnd event', function() {
                                        expect($scope.$emit).toHaveBeenCalledWith('<mr-card>:contentEnd', $scope.config);
                                    });
                                });
                            });

                            it('should set $scope.config._data.modules.post.active to true', function() {
                                expect($scope.config._data.modules.post.active).toBe(true);
                            });

                            describe('if the browser supports inline video', function() {
                                beforeEach(function() {
                                    iface.reload.calls.reset();

                                    $scope.profile.inlineVideo = true;

                                    iface.emit('ended');
                                });

                                it('should not minimize the video', function() {
                                    expect(iface.reload).not.toHaveBeenCalled();
                                });
                            });

                            describe('if the browser does not support inline video', function() {
                                beforeEach(function() {
                                    iface.minimize.calls.reset();

                                    $scope.profile.inlineVideo = false;

                                    iface.emit('ended');
                                });

                                it('should minimize the video', function() {
                                    expect(iface.minimize).toHaveBeenCalled();
                                });

                                describe('if minimize() returns an error', function() {
                                    beforeEach(function() {
                                        iface.reload.calls.reset();
                                        iface.minimize.and.returnValue(new Error());

                                        iface.emit('ended');
                                    });

                                    it('should reload the video', function() {
                                        expect(iface.reload).toHaveBeenCalled();
                                    });
                                });
                            });
                        });

                        describe('when the video pauses', function() {
                            beforeEach(function() {
                                ['ballotActive', 'resultsActive'].forEach(function(prop) {
                                    $scope.config._data.modules.ballot[prop] = false;
                                });
                            });

                            it('should enable the postModule', function() {
                                expect($scope.config._data.modules.post.active).toBe(false);
                                iface.emit('pause');
                                expect($scope.config._data.modules.post.active).toBe(true);
                            });

                            describe('if the user has not voted', function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.ballot.vote = null;

                                    iface.emit('pause');
                                });

                                it('should activate the ballot', function() {
                                    expect($scope.config._data.modules.ballot.resultsActive).toBe(false);
                                    expect($scope.config._data.modules.ballot.ballotActive).toBe(true);
                                });
                            });

                            describe('if the user has voted', function() {
                                beforeEach(function() {
                                    $scope.config._data.modules.ballot.vote = 0;

                                    iface.emit('pause');
                                });

                                it('should activate the results', function() {
                                    expect($scope.config._data.modules.ballot.resultsActive).toBe(true);
                                    expect($scope.config._data.modules.ballot.ballotActive).toBe(false);
                                });
                            });
                        });

                        describe('when the video plays', function() {
                            beforeEach(function() {
                                $scope.config._data.modules.post.active = true;
                                ['closeBallot', 'closeBallotResults'].forEach(function(method) {
                                    spyOn(VideoCardCtrl, method).and.callThrough();
                                });

                                iface.emit('play');
                            });

                            it('should disable the postModule', function() {
                                expect($scope.config._data.modules.post.active).toBe(false);
                            });

                            it('should close the ballot module', function() {
                                expect(VideoCardCtrl.closeBallot).toHaveBeenCalled();
                                expect(VideoCardCtrl.closeBallotResults).toHaveBeenCalled();
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

                                    it('should preload the large thumbnail', function() {
                                        expect(c6ImagePreloader.load).toHaveBeenCalledWith(['large.jpg']);
                                    });

                                    it('should load the video', function() {
                                        expect(iface.load).toHaveBeenCalled();
                                    });

                                    describe('if the card is the first one in the MR', function() {
                                        beforeEach(function() {
                                            $scope.$apply(function() {
                                                 $scope.onDeck = false;
                                            });
                                            iface.load.calls.reset();
                                            $scope.number = '1';
                                        });

                                        it('should not load the video', function() {
                                            expect(iface.load).not.toHaveBeenCalled();
                                        });
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

                                describe('when false', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.active = true;
                                        });

                                        $scope.config._data.modules.ballot.ballotActive = false;

                                        ['closeBallot', 'closeBallotResults'].forEach(function(method) {
                                            spyOn(VideoCardCtrl, method).and.callThrough();
                                        });
                                        $scope.$apply(function() {
                                            $scope.active = false;
                                        });
                                    });

                                    it('should close the ballot', function() {
                                        ['closeBallot', 'closeBallotResults'].forEach(function(method) {
                                            expect(VideoCardCtrl[method]).toHaveBeenCalled();
                                        });
                                    });

                                    it('should not set a vote', function() {
                                        expect($scope.config._data.modules.ballot.vote).not.toBe(-1);
                                    });

                                    describe('if the ballot is active', function() {
                                        beforeEach(function() {
                                            $scope.config._data.modules.ballot.ballotActive = true;

                                            $scope.$apply(function() {
                                                $scope.active = true;
                                            });
                                            $scope.$apply(function() {
                                                $scope.active = false;
                                            });
                                        });

                                        it('should set the vote to -1', function() {
                                            expect($scope.config._data.modules.ballot.vote).toBe(-1);
                                        });
                                    });

                                    [true, false].forEach(function(bool) {
                                        describe('if the card\'s autoplay property is ' + bool, function() {
                                            beforeEach(function() {
                                                iface.pause.calls.reset();

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

                                            it('should not calls reload()', function() {
                                                expect(iface.reload).not.toHaveBeenCalled();
                                            });

                                            describe('if the pause method returns an error', function() {
                                                beforeEach(function() {
                                                    iface.pause.and.returnValue(new Error('I suck.'));

                                                    $scope.$apply(function() {
                                                        $scope.active = true;
                                                    });
                                                    $scope.$apply(function() {
                                                        $scope.active = false;
                                                    });
                                                });

                                                it('should call reload', function() {
                                                    expect(iface.reload).toHaveBeenCalled();
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

        describe('if the card is sponsored', function() {
            var iface;
            beforeEach(function() {
                iface = new Player();
                iface.duration = 60;
                $scope.$apply(function() {
                    $scope.$emit('<vast-player>:init', iface);
                });
            });

            describe('with a clickUrl', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.config.campaign = { clickUrl: 'click.me' };
                    });
                });

                it('should setup a one-time handler for the play event', function() {
                    iface.emit('ready');
                    iface.emit('play');
                    expect(c6ImagePreloader.load).toHaveBeenCalledWith(['click.me']);
                    expect($scope.config._data.tracking.clickFired).toBe(true);
                    iface.emit('play');
                    expect(c6ImagePreloader.load.calls.count()).toBe(1);
                });

                it('should not setup a play handler if the click has been fired', function() {
                    $scope.config._data.tracking.clickFired = true;
                    iface.emit('ready');
                    iface.emit('play');
                    expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                    expect($scope.config._data.tracking.clickFired).toBe(true);
                });
            });

            describe('with a countUrl', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.config.campaign = { countUrl: 'count.me', minViewTime: 5 };
                    });
                });

                it('should set up a timeupdate handler', function() {
                    iface.emit('ready');
                    expect(iface.listeners('timeupdate')).toEqual([jasmine.any(Function), jasmine.any(Function)]);
                });

                it('should not set up a timeupdate handler if the countUrl has been fired', function() {
                    $scope.config._data.tracking.countFired = true;
                    iface.emit('ready');
                    expect(iface.listeners('timeupdate')).toEqual([jasmine.any(Function)]);
                });

                it('should not set up a timeupdate handler if there is no minViewTime', function() {
                    $scope.config.campaign = { countUrl: 'count.me' };
                    iface.emit('ready');
                    expect(iface.listeners('timeupdate')).toEqual([jasmine.any(Function)]);
                });

                describe('sets up a timeupdate handler that', function() {
                    beforeEach(function() {
                        iface.emit('ready');
                    });

                    describe(', if the the minViewTime is < 0', function() {
                        beforeEach(function() {
                            c6ImagePreloader.load.calls.reset();
                            $scope.config.campaign.minViewTime = -1;
                        });

                        describe('and the player duration is 0', function() {
                            beforeEach(function() {
                                iface.duration = 0;
                            });

                            it('should never fire the AdCount pixel', function() {
                                iface.currentTime = 0.122;
                                iface.emit('timeupdate');

                                expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                            });
                        });

                        describe('and the currentTime is < one second from the end of the video,', function() {
                            beforeEach(function() {
                                [1, 4, 7, 9, 33, 54, 58.999].forEach(function(time) {
                                    iface.currentTime = time;
                                    iface.emit('timeupdate');
                                });
                            });

                            it('should not fire the AdCount pixel', function() {
                                expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                            });
                        });

                        describe('and the currentTime is one second from the end of the video,', function() {
                            beforeEach(function() {
                                iface.currentTime = 59;
                                iface.emit('timeupdate');
                            });

                            it('should fire the AdCount pixel', function() {
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['count.me']);
                            });
                        });

                        describe('and the currentTime is greater than one second from the end of the video,', function() {
                            beforeEach(function() {
                                iface.currentTime = 59.3;
                                iface.emit('timeupdate');
                            });

                            it('should fire the AdCount pixel', function() {
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['count.me']);
                            });

                            it('should fire a GA event', function() {
                                expect(tracker.trackEvent).toHaveBeenCalledWith(MiniReelService.getTrackingData($scope.config, $scope.number - 1, {
                                    category: 'Video',
                                    action: 'AdCount',
                                    label: $scope.config.webHref,
                                    videoSource: $scope.config.source,
                                    videoDuration: iface.duration,
                                    nonInteraction: 1
                                }));
                            });

                            describe('and the pixel has already been fired,', function() {
                                beforeEach(function() {
                                    c6ImagePreloader.load.calls.reset();

                                    iface.currentTime = 59.5;
                                    iface.emit('timeupdate');
                                });

                                it('does not fire the pixel again', function() {
                                    expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                                });
                            });
                        });
                    });

                    it('should fire the AdCount pixel after minViewTime', function() {
                        for (var i = 0; i < 6; i++) {
                            iface.currentTime = i;
                            iface.emit('timeupdate');
                            if (i < 5) {
                                expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                            } else {
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['count.me']);
                                expect(iface.listeners('timeupdate')).toEqual([jasmine.any(Function)]);
                                expect($scope.config._data.tracking.countFired).toBe(true);
                            }
                        }
                    });

                    it('should not fire the AdCount pixel if it was already fired', function() {
                        for (var i = 0; i < 6; i++) {
                            iface.currentTime = i;
                            if (i < 5) {
                                iface.emit('timeupdate');
                            } else {
                                iface.emit('timeupdate'); iface.emit('timeupdate');
                                expect(c6ImagePreloader.load.calls.count()).toBe(1);
                            }
                        }
                    });

                    it('should ignore large time jumps forward or backward', function() {
                        iface.currentTime = -1;
                        for (var i = 0; i < 6; i++) {
                            iface.currentTime++;
                            iface.emit('timeupdate');
                            if (i < 5) {
                                expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                                if (i === 2) {
                                    iface.currentTime += 10;
                                    iface.emit('timeupdate');
                                }
                                if (i === 4) {
                                    iface.currentTime -= 5;
                                    iface.emit('timeupdate');
                                }
                            } else {
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['count.me']);
                                expect(iface.listeners('timeupdate')).toEqual([jasmine.any(Function)]);
                                expect($scope.config._data.tracking.countFired).toBe(true);
                            }
                        }
                    });
                });
            });
        });
    });
});
