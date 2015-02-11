define(['c6uilib', 'services', 'app', 'angular', 'speed'], function(c6uilibModule, servicesModule, appModule, angular, speed) {
    'use strict';

    describe('RumbleController', function() {
        var $rootScope,
            $scope,
            $timeout,
            $q,
            $log,
            $controller,
            c6UserAgent,
            c6EventEmitter,
            c6ImagePreloader,
            RumbleCtrl,
            BallotService,
            deck,
            appData,
            mockPlayer,
            cinema6,
            sessionDeferred,
            MiniReelService,
            ControlsService,
            trackerServiceSpy,
            trackerSpy,
            initController,
            compileCtrlWithDynamicAds;

        beforeEach(function() {
            trackerSpy = {
                alias       : jasmine.createSpy('tracker.alias'),
                set         : jasmine.createSpy('tracker.set'),
                trackPage   : jasmine.createSpy('tracker.trackPage'),
                trackEvent  : jasmine.createSpy('tracker.trackEvent'),
                trackTiming : jasmine.createSpy('tracker.trackTiming')
            };
            trackerServiceSpy = jasmine.createSpy('trackerService').and.returnValue(trackerSpy);

            cinema6 = {
                fullscreen: jasmine.createSpy('cinema6.fullscreen'),
                getSession: function(){}
            };

            deck = [
                /* jshint quotmark:false */
                {
                    "id"     : "vid1",
                    "type"   : "youtube",
                    "title": "vid1 caption",
                    "note"   : "vid1 note",
                    "thumbs" : {
                        "small": "vid1.jpg",
                        "large": "vid1--large.jpg"
                    },
                    "voting" : [ 100, 50, 10 ],
                    "data"   : {
                        "videoid" : "vid1video"
                    }
                },
                {
                    "id"     : "ad1",
                    "title"  : "ad",
                    "type"   : "vast",
                    "voting" : [ 100, 50, 10 ],
                    "ad"     : true,
                    "data"   : {}
                },
                {
                    "id"     : "vid2",
                    "type"   : "vimeo",
                    "title": "vid2 caption",
                    "note"   : "vid2 note",
                    "thumbs" : {
                        "small": "vid2.jpg",
                        "large": "vid2--large.jpg"
                    },
                    "voting" : [ 100, 50, 10 ],
                    "data"   : {
                        "videoid" : "vid2video"
                    }
                },
                {
                    "id"     : "ad2",
                    "type"   : "vimeo",
                    "ad"     : true,
                    "sponsored": true,
                    "title": "ad2 caption",
                    "note"   : "ad2 note",
                    "thumbs" : {
                        "small": "ad2.jpg",
                        "large": "ad2--large.jpg"
                    },
                    "data"   : {
                        "videoid" : "ad2video"
                    }
                },
                {
                    "id"     : "vid3",
                    "type"   : "dailymotion",
                    "title": "vid3 caption",
                    "note"   : "vid3 note",
                    "thumbs" : {
                        "small": "vid3.jpg",
                        "large": "vid3--large.jpg"
                    },
                    "voting" : [ 100, 50, 10 ],
                    "data"   : {
                        "videoid" : "vid3video"
                    }
                },
                {
                    "id"     : "vid4",
                    "type"   : "youtube",
                    "title": "vid4 caption",
                    "note"   : "vid4 note",
                    "thumbs" : {
                        "small": "vid4.jpg",
                        "large": "vid4--large.jpg"
                    },
                    "data"   : {
                        "videoid" : "vid4video"
                    }
                }
                /* jshint quotmark:single */
            ];

            appData = {
                profile: {
                    device: 'desktop',
                    inlineVideo: true
                },
                experience: {
                    id: 'e-722bd3c4942331',
                    versionId: 'xyz',
                    title: 'my title',
                    data : {
                        title : 'my title',
                        election: 'el-a30a5954440d66',
                        links: {
                            'YouTube': 'youtube.com/032845trf43d',
                            'Twitter': 'twitter.com/38rhd32e3'
                        },
                        deck : deck,
                        mode : 'testMode',
                        adConfig : {
                            video: {
                                firstPlacement: 1,
                                frequency: 3,
                                waterfall: 'cinema6',
                                skip: 6
                            },
                            display: {
                                waterfall: 'cinema6'
                            }
                        }
                    }
                },
                behaviors: {},
                mode : 'testMode'
            };

            module(c6uilibModule.name, function($provide) {
                $provide.value('cinema6', cinema6);
            });
            module(servicesModule.name, function($provide) {
                $provide.value('ControlsService', {
                    init: jasmine.createSpy('ControlsService.init()')
                        .and.returnValue({})
                });
            });
            module(appModule.name, function($provide) {
                $provide.value('c6AppData', appData);
            });

            inject(function($injector) {
                $timeout    = $injector.get('$timeout');
                $q          = $injector.get('$q');
                $rootScope  = $injector.get('$rootScope');
                $log        = $injector.get('$log');
                $controller = $injector.get('$controller');
                $log.context = function() { return $log; };
                c6UserAgent = $injector.get('c6UserAgent');
                c6EventEmitter = $injector.get('c6EventEmitter');
                BallotService = $injector.get('BallotService');
                ControlsService = $injector.get('ControlsService');
                MiniReelService = $injector.get('MiniReelService');
                c6ImagePreloader = $injector.get('c6ImagePreloader');

                spyOn(MiniReelService, 'createDeck')
                    .and.callFake(function(data) {
                        var playlist = angular.copy(data.deck);

                        MiniReelService.createDeck.calls.mostRecent().result = playlist;

                        playlist.forEach(function(video) {
                            video.player = null;
                            video.state = {
                                twerked: false,
                                vote: -1,
                                view: 'video'
                            };
                        });

                        return playlist;
                    });
                spyOn(MiniReelService, 'createSocialLinks').and.callThrough();

                mockPlayer = c6EventEmitter({
                    getType         : jasmine.createSpy('player.getType'),
                    getVideoId      : jasmine.createSpy('player.getVideoId'),
                    isReady         : jasmine.createSpy('player.isReady'),
                });
                spyOn(mockPlayer, 'on').and.callThrough();

                spyOn(cinema6, 'getSession').and.callFake(function() {
                    sessionDeferred = $q.defer();
                    return sessionDeferred.promise;
                });
                spyOn(BallotService, 'init');
                spyOn(BallotService, 'getElection');

                initController = function() {
                    $scope = $rootScope.$new();

                    $scope.app = {
                        data: appData
                    };
                    $scope.AppCtrl = {};

                    RumbleCtrl = $controller('RumbleController', {
                        $scope  : $scope,
                        $log    : $log,
                        trackerService : trackerServiceSpy
                    });
                };

                initController();

                compileCtrlWithDynamicAds = function(first, freq) {
                    $scope = $rootScope.$new();
                    $scope.app = {
                        data: appData
                    };
                    $scope.app.data.experience.data.adConfig.video.frequency = freq;
                    $scope.app.data.experience.data.adConfig.video.firstPlacement = first;
                    $scope.app.data.experience.data.deck = [{id: 'foo'},{id: 'bar'},{id: 'baz'},{id:'biz'},{id:'buzz'},{id:'fub'}];
                    $scope.AppCtrl = {};

                    spyOn($scope, '$broadcast').and.callThrough();

                    initController();
                };

                $scope.$emit('analyticsReady');
                $timeout.flush(1000);
            });
        });
        describe('initialization',function(){
            it('has proper dependencies',function(){
                expect(RumbleCtrl).toBeDefined();
                expect($scope.deviceProfile).toBe(appData.profile);

                expect($scope.deck).toBe(MiniReelService.createDeck.calls.mostRecent().result);
                expect($scope.currentIndex).toEqual(-1);
                expect($scope.currentCard).toBeNull();
                expect($scope.atHead).toBeNull();
                expect($scope.atTail).toBeNull();
                expect($scope.ready).toEqual(true);
                expect($scope.nav).toEqual({
                    enabled: true,
                    wait: null
                });
            });

            it('should initialize BallotService with the id', function() {
                expect(BallotService.init).toHaveBeenCalledWith(appData.experience.data.election,{});
            });

            it('should not initialize the BallotService if there is no election', function() {
                $rootScope.$apply(function() {
                    $scope = $rootScope.$new();
                    $scope.AppCtrl = {};
                    $scope.app = {
                        data: appData
                    };
                    delete appData.experience.data.election;
                    RumbleCtrl = $controller('RumbleController', {
                        $scope: $scope,
                        $log: $log
                    });
                });

                expect(BallotService.init.calls.count()).toBe(1);
            });

            it('should initialize the google analytics', function(){
                expect(trackerSpy.alias).toHaveBeenCalledWith({
                    'category'      : 'eventCategory',
                    'action'        : 'eventAction',
                    'label'         : 'eventLabel',
                    'href'          : 'dimension11',
                    'slideCount'    : 'dimension4',
                    'slideIndex'    : 'dimension7',
                    'videoDuration' : 'dimension8',
                    'videoSource'   : 'dimension9'
                });
                expect(trackerSpy.set).toHaveBeenCalledWith({
                    'slideCount' : 6,
                    'href'       : jasmine.any(String)
                });
            });

            it('should send up timing data to GA', function() {
                expect(trackerSpy.trackTiming).toHaveBeenCalledWith(MiniReelService.getTrackingData(null, -1, {
                    timingCategory: 'API',
                    timingVar: 'downloadSpeed',
                    timingLabel: 'c6ui',
                    timingValue: speed.average().time
                }));
            });
        });

        describe('methods', function() {
            describe('moduleActive(module)', function() {
                var card;

                beforeEach(function() {
                    card = {
                        modules: [
                            'displayAd',
                            'ballot'
                        ]
                    };

                    $scope.currentCard = card;
                });

                it('should be true if the current card has the provided module', function() {
                    expect(RumbleCtrl.moduleActive('displayAd')).toBe(true);
                    expect(RumbleCtrl.moduleActive('ballot')).toBe(true);
                });

                it('should be false if the current card does not have the provided module', function() {
                    expect(RumbleCtrl.moduleActive('foo')).toBe(false);
                    expect(RumbleCtrl.moduleActive('comments')).toBe(false);
                });

                describe('if the card has no modules array', function() {
                    beforeEach(function() {
                        $scope.currentCard = {};
                    });

                    it('should return false', function() {
                        expect(RumbleCtrl.moduleActive('displayAd')).toBe(false);
                    });
                });

                describe('if there is no current card', function() {
                    beforeEach(function() {
                        $scope.currentCard = null;
                    });

                    it('should return false', function() {
                        expect(RumbleCtrl.moduleActive('ballot')).toBe(false);
                    });
                });
            });
        });

        describe('$scope.cardBuffer', function() {
            describe('on iOS', function() {
                beforeEach(function() {
                    spyOn(c6UserAgent.device, 'isIOS').and.returnValue(true);
                });

                ['7.1', '6.2'].forEach(function(version) {
                    describe(version, function() {
                        beforeEach(function() {
                            c6UserAgent.app.version = version;
                            initController();
                        });

                        it('should be 0', function() {
                            expect($scope.cardBuffer).toBe(0);
                        });
                    });
                });

                ['8.0', '8.1'].forEach(function(version) {
                    describe(version, function() {
                        beforeEach(function() {
                            c6UserAgent.app.version = version;
                            initController();
                        });

                        it('should be 1', function() {
                            expect($scope.cardBuffer).toBe(1);
                        });
                    });
                });
            });

            describe('on not iOS', function() {
                beforeEach(function() {
                    spyOn(c6UserAgent.device, 'isIOS').and.returnValue(false);
                    c6UserAgent.app.version = '6.3';
                    initController();
                });

                it('should be 1', function() {
                    expect($scope.cardBuffer).toBe(1);
                });
            });
        });

        describe('$scope.prevThumb', function() {
            beforeEach(function() {
                $scope.currentIndex = 0;
            });

            it('should be null if there is no previous card', function() {
                expect($scope.prevThumb).toBeNull();
            });

            it('should be the thumb of the previous card if there is one', function() {
                $scope.$apply(function() {
                    $scope.currentIndex = 4;
                });
                expect($scope.prevThumb).toBe('ad2.jpg');

                $scope.$apply(function() {
                    $scope.currentIndex = 3;
                });
                expect($scope.prevThumb).toBe('vid2.jpg');
            });

            it('should skip non-sponsored ads and go to the next thumb', function() {
                $scope.$apply(function() {
                    $scope.currentIndex = 2;
                });
                expect($scope.prevThumb).toBe('vid1.jpg');
            });

            describe('if the next card has no thumbs', function() {
                beforeEach(function() {
                    $scope.deck[2].thumbs = null;
                    $scope.$apply(function() {
                        $scope.currentIndex = 3;
                    });
                });

                it('should be null', function() {
                    expect($scope.prevThumb).toBeNull();
                });
            });
        });

        describe('$scope.nextThumb', function() {
            beforeEach(function() {
                $scope.currentIndex = 5;
            });

            it('should be null if there is no next card', function() {
                expect($scope.nextThumb).toBeNull();
            });

            it('should be the thumb of the next card if there is one', function() {
                $scope.$apply(function() {
                    $scope.currentIndex = -1;
                });
                expect($scope.nextThumb).toBe('vid1.jpg');

                $scope.$apply(function() {
                    $scope.currentIndex = 1;
                });
                expect($scope.nextThumb).toBe('vid2.jpg');

                $scope.$apply(function() {
                    $scope.currentIndex = 2;
                });
                expect($scope.nextThumb).toBe('ad2.jpg');
            });

            describe('if the next card has no thumbs', function() {
                beforeEach(function() {
                    $scope.deck[0].thumbs = null;
                    $scope.$apply(function() {
                        $scope.currentIndex = -1;
                    });
                });

                it('should be null', function() {
                    expect($scope.nextThumb).toBeNull();
                });
            });

            it('should skip non-sponsored ads and go to the next thumb', function() {
                $scope.$apply(function() {
                    $scope.currentIndex = 0;
                });
                expect($scope.nextThumb).toBe('vid2.jpg');
            });
        });

        describe('$scope.dockNav', function() {
            beforeEach(function() {
                $scope.currentCard = {};
            });

            it('should be false if the currentCard is any kind of video', function() {
                ['video', 'vast', 'youtube', 'vimeo', 'dailymotion'].forEach(function(type) {
                    $scope.$apply(function() {
                        $scope.currentCard.type = type;
                    });
                    expect($scope.dockNav).toBe(false);
                });
            });

            it('should be true if anything else', function() {
                ['foo', 'test', 'miniReel', 'displayAd'].forEach(function(type) {
                    $scope.$apply(function() {
                        $scope.currentCard.type = type;
                    });
                    expect($scope.dockNav).toBe(true);
                });
            });

            it('should be true if there is no card', function() {
                $scope.$apply(function() {
                    $scope.currentCard = null;
                });

                expect($scope.dockNav).toBe(true);
            });
        });

        describe('$scope.players', function() {
            beforeEach(function() {
                $scope.deck = [
                    {
                        id: 'foo'
                    },
                    {
                        id: 'hello'
                    },
                    {
                        id: 'okay'
                    },
                    {
                        id: 'sweet'
                    },
                    {
                        id: 'umm'
                    },
                    {
                        id: 'cool'
                    }
                ];

                $scope.currentIndex = -1;
            });

            it('should always have the current and next two players and should not remove players', function() {
                function playlist(index) {
                    return $scope.deck[index];
                }

                function currentIndex(index) {
                    $scope.$apply(function() {
                        $scope.currentIndex = index;
                    });
                }

                expect($scope.players).toEqual([playlist(0), playlist(1)]);

                currentIndex(0);
                expect($scope.players).toEqual([playlist(0), playlist(1), playlist(2)]);

                currentIndex(1);
                expect($scope.players).toEqual([playlist(0), playlist(1), playlist(2), playlist(3)]);

                currentIndex(2);
                expect($scope.players).toEqual([playlist(0), playlist(1), playlist(2), playlist(3), playlist(4)]);
            });
        });

        describe('$scope.tocCards', function() {
            var deck;

            beforeEach(function() {
                $scope.$apply(function() {
                    deck = $scope.deck = [
                        {},
                        {
                            ad: true,
                            sponsored: true
                        },
                        {
                            ad: true
                        },
                        {},
                        {},
                        {
                            ad: true
                        },
                        {
                            ad: true,
                            sponsored: true
                        }
                    ];
                });
            });

            it('should only include non-ad cards, unless they are sponsored', function() {
                expect($scope.tocCards).toEqual([
                    deck[0],
                    deck[1],
                    deck[3],
                    deck[4],
                    deck[6]
                ]);
            });
        });

        describe('$scope.tocIndex', function() {
            var deck;

            beforeEach(function() {
                deck = $scope.deck = [
                    {},
                    {
                        ad: true,
                        sponsored: true
                    },
                    {
                        ad: true
                    },
                    {},
                    {},
                    {
                        ad: true
                    },
                    {
                        ad: true,
                        sponsored: true
                    }
                ];

                $scope.currentCard = null;
            });

            it('should reflect the index of the card in the tocCards', function() {
                expect($scope.tocIndex).toBe(-1);

                $scope.$apply(function() {
                    $scope.currentCard = deck[0];
                });
                expect($scope.tocIndex).toBe(0);

                $scope.$apply(function() {
                    $scope.currentCard = deck[1];
                });
                expect($scope.tocIndex).toBe(1);

                $scope.$apply(function() {
                    $scope.currentCard = deck[2];
                });
                expect($scope.tocIndex).toBe(-1);

                $scope.$apply(function() {
                    $scope.currentCard = deck[3];
                });
                expect($scope.tocIndex).toBe(2);
            });
        });

        describe('$scope.showTOC', function() {
            it('should be false', function() {
                expect($scope.showTOC).toBe(false);
            });
        });

        describe('jumpTo(card)', function() {
            beforeEach(function() {
                spyOn(RumbleCtrl, 'setPosition');
            });

            it('should call "setPosition" with the index of the provided card', function() {
                RumbleCtrl.jumpTo($scope.deck[1]);
                expect(RumbleCtrl.setPosition).toHaveBeenCalledWith(1);

                RumbleCtrl.jumpTo($scope.deck[0]);
                expect(RumbleCtrl.setPosition).toHaveBeenCalledWith(0);

                RumbleCtrl.jumpTo($scope.deck[2]);
                expect(RumbleCtrl.setPosition).toHaveBeenCalledWith(2);
            });
        });

        describe('trackNavEvent',function(){
            beforeEach(function(){
                spyOn(MiniReelService,'getTrackingData');
            });

            it('tracks actions and labels',function(){
                RumbleCtrl.trackNavEvent('a1','b2');
                expect(MiniReelService.getTrackingData)
                    .toHaveBeenCalledWith($scope.currentCard, $scope.currentIndex, {
                        category : 'Navigation',
                        action   : 'a1',
                        label    : 'b2'
                    });
            });

        });

        describe('navigation',function(){
            beforeEach(function(){
                $scope.deviceProfile = { multiPlayer : true };
                $scope.deck.forEach(function(item,index){
                    item.player = {
                        isReady : jasmine.createSpy('item'+index+'.isReady'),
                        play    : jasmine.createSpy('item'+index+'.play'),
                        pause   : jasmine.createSpy('item'+index+'.pause')
                    };
                    item.player.isReady.and.returnValue(true);
                });
                spyOn($scope, '$emit').and.callThrough();
            });

            describe('splicing ads', function() {
                describe('when leaving an ad card', function() {
                    var ad;

                    beforeEach(function() {
                        ad = $scope.deck[1];
                    });

                    it('should not remove the ad from the deck if static ads are enabled', function() {
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(2);
                        expect($scope.deck.indexOf(ad)).toBe(1);
                        expect($scope.currentIndex).toBe(2);
                        expect($scope.currentCard).toBe($scope.deck[2]);
                    });

                    it('should remove the ad card from the deck if dynamic ads are enabled', function() {
                        $scope.$apply(function() {
                            $scope.deck = [{id: 'foo'},{id: 'bar'},{id: 'baz'},{id:'biz'},{id:'buzz'},{id:'fub'}];
                        });

                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).toBe(true);

                        ad = $scope.currentCard;

                        RumbleCtrl.setPosition(4);
                        expect($scope.deck.indexOf(ad)).toBe(-1);
                        expect($scope.currentIndex).toBe(3);
                        expect($scope.currentCard).toBe($scope.deck[3]);
                    });
                });
            });

            describe('loading ads', function() {
                beforeEach(function() {
                    spyOn($scope, '$broadcast').and.callThrough();
                });

                it('should broadcast adOnDeck when a static ad is in the next position', function() {
                    RumbleCtrl.setPosition(0); // video 1
                    expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement1');

                    RumbleCtrl.setPosition(1); // shows static ad
                    RumbleCtrl.setPosition(2); // video 2
                    RumbleCtrl.setPosition(3); // shows other static ad

                    expect($scope.$broadcast.calls.count()).toBe(2);
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement2');
                });

                it('should broadcast adOnDeck if a static ad is jumped to directly', function() {
                    RumbleCtrl.setPosition(1);
                    expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement1');
                });

                it('should broadcast adOnDeck when dynamic ad should play in the next position', function() {
                    $scope.$apply(function() {
                        $scope.deck = [{id: 'foo'},{id: 'bar'},{id: 'baz'},{id:'biz'},{id:'buzz'},{id:'fub'}];
                    });

                    RumbleCtrl.setPosition(0);
                    expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement1');

                    RumbleCtrl.setPosition(1); // shows ad
                    RumbleCtrl.setPosition(2); // video #1
                    RumbleCtrl.setPosition(3); // video #2
                    RumbleCtrl.setPosition(4); // video #3, ad should show after 3rd video, so it's loaded now

                    expect($scope.$broadcast.calls.count()).toBe(2);
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement2');
                });

                it('should only happen once if frequency is set to 0', function() {
                    compileCtrlWithDynamicAds(1, 0);
                    spyOn($scope, '$broadcast');

                    RumbleCtrl.setPosition(0);
                    expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement1');

                    RumbleCtrl.setPosition(1); // shows ad
                    RumbleCtrl.setPosition(2); // video #1
                    RumbleCtrl.setPosition(3); // video #2
                    RumbleCtrl.setPosition(4); // video #3

                    expect($scope.$broadcast.calls.count()).toBe(1);
                });

                it('should not occur if firstPLacement is set to -1', function() {
                    compileCtrlWithDynamicAds(-1, 2);
                    spyOn($scope, '$broadcast');

                    RumbleCtrl.setPosition(0);
                    RumbleCtrl.setPosition(1); // shows ad
                    RumbleCtrl.setPosition(2); // video #1
                    RumbleCtrl.setPosition(3); // video #2
                    RumbleCtrl.setPosition(4); // video #3
                    expect($scope.$broadcast).not.toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                });

                it('should not matter what the navigation sequence is when dynamic ads are enabled', function() {
                    $scope.$apply(function() {
                        $scope.deck = [{id: 'foo'},{id: 'bar'},{id: 'baz'},{id:'biz'},{id:'buzz'},{id:'fub'}];
                    });

                    RumbleCtrl.setPosition(0);
                    expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement1');

                    RumbleCtrl.setPosition(4); // shows ad
                    expect($scope.currentCard.ad).toBe(true);

                    RumbleCtrl.setPosition(5); // video #1
                    RumbleCtrl.setPosition(0); // video #2
                    RumbleCtrl.setPosition(2); // video #3, ad should show after 3rd video, so it's loaded now

                    expect($scope.$broadcast.calls.count()).toBe(2);
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement2');
                });
            });

            describe('showing ads', function() {
                beforeEach(function() {
                    spyOn(RumbleCtrl, 'setPosition').and.callThrough();
                    spyOn($scope, '$broadcast').and.callThrough();
                });

                describe('when static ads are in the deck', function(){
                    it('should show if user moves to a card with an ad before it from either direction', function() {
                        RumbleCtrl.setPosition(4);
                        expect($scope.currentCard.ad).toBe(true);
                        expect($scope.currentIndex).toBe(3);

                        RumbleCtrl.setPosition(0);
                        expect($scope.currentCard.ad).toBe(true);
                        expect($scope.currentIndex).toBe(1);
                    });

                    it('should only show the ad once and skip over the card', function() {
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).toBe(true);
                        expect($scope.currentCard.visited).toBe(true);
                        expect($scope.currentIndex).toBe(1);

                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).toBe(undefined);
                        expect($scope.currentIndex).toBe(2);

                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).toBe(undefined);
                        expect($scope.currentIndex).toBe(0);
                    });

                    it('should show ads again if user closes player and re-opens', function() {
                        RumbleCtrl.setPosition(1); // show ad
                        expect($scope.currentCard.ad).toBe(true);
                        expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));

                        RumbleCtrl.setPosition(1); // now ad will not show again
                        expect($scope.currentCard.ad).toBe(undefined);

                        RumbleCtrl.setPosition(-1); // reset reel
                        RumbleCtrl.setPosition(1); // will show ad again
                        expect($scope.currentCard.ad).toBe(true);
                        expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));

                        expect($scope.$broadcast.calls.count()).toBe(2);
                        expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('adOnDeck');
                        expect($scope.$broadcast.calls.argsFor(1)[0]).toBe('adOnDeck');
                    });
                });

                describe('when using dynamic ads', function() {
                    var i;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.deck = [{id: 'foo'},{id: 'bar'},{id: 'baz'},{id:'biz'},{id:'buzz'},{id:'fub'}];
                        });

                        i = function() { return $scope.currentIndex; };
                    });

                    it('should be a valid card object', function() {
                        compileCtrlWithDynamicAds(1, 0);

                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard).toEqual(jasmine.objectContaining({
                            id: 'rc-advertisement1',
                            type: 'ad',
                            title: 'Advertisement',
                            ad: true,
                            dynamic: true,
                            modules: [],
                            data: {
                                autoplay: true,
                                autoadvance: true,
                                skip: 6,
                                source: 'cinema6'
                            }
                        }));
                    });

                    it('should not happen if firstPlacement is set to -1', function() {
                        compileCtrlWithDynamicAds(-1, 3);
                        spyOn($scope, '$broadcast');

                        RumbleCtrl.setPosition(0);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(2);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(3);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(4);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(5);
                        expect($scope.currentCard.ad).not.toBe(true);
                        expect($scope.$broadcast).not.toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    });

                    it('should only happen once if frequency is set to 0', function() {
                        compileCtrlWithDynamicAds(1, 0);
                        spyOn($scope, '$broadcast');

                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(2);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(3);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(4);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(3);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(2);
                        expect($scope.currentCard.ad).not.toBe(true);
                        RumbleCtrl.setPosition(1);
                        expect($scope.currentCard.ad).not.toBe(true);
                    });

                    it('should show first ad based on config', function() {
                        RumbleCtrl.setPosition(0);
                        expect(i()).toBe(0);

                        RumbleCtrl.setPosition(i()+1); // ad
                        expect(i()).toBe(1);
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(i()+1); // vid1
                        expect(i()).toBe(1);

                        RumbleCtrl.setPosition(i()+1); // vid2
                        expect(i()).toBe(2);

                        RumbleCtrl.setPosition(i()+1); // vid3
                        expect(i()).toBe(3);

                        RumbleCtrl.setPosition(i()+1); // ad
                        expect(i()).toBe(4);
                        expect($scope.currentCard.ad).toBe(true);
                    });

                    it('manipulates the index when leaving ad cards', function() {
                        RumbleCtrl.setPosition(0); // video
                        expect(i()).toBe(0);

                        RumbleCtrl.setPosition(1); // ad
                        expect(i()).toBe(1);
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(2); // vid1
                        expect(i()).toBe(1); // leaving an ad and moving forward shifts the index down 1

                        RumbleCtrl.setPosition(2); // vid2
                        expect(i()).toBe(2);

                        RumbleCtrl.setPosition(1); // vid3
                        expect(i()).toBe(1);

                        RumbleCtrl.setPosition(3); // ad2
                        expect(i()).toBe(3);
                        expect($scope.currentCard.ad).toBe(true); // leaving an ad and moving backward does not shift the index

                        RumbleCtrl.setPosition(3);
                        expect(i()).toBe(2);
                    });

                    it('should not matter what order the user navigates', function() {
                        RumbleCtrl.setPosition(0); // first vid
                        RumbleCtrl.setPosition(4); // shows ad
                        expect($scope.currentCard.ad).toBe(true);
                        RumbleCtrl.setPosition(2); // vid1
                        RumbleCtrl.setPosition(5); // vid1
                        RumbleCtrl.setPosition(1); // vid1
                        RumbleCtrl.setPosition(3); // shows ad2
                        expect($scope.currentCard.ad).toBe(true);
                    });

                    it('should use the navigation direction to determine which card should come after the ad', function() {
                        var card;
                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(4); // ad

                        card = $scope.currentCard;
                        $scope.$emit('<mr-card>:contentEnd', card);

                        expect($scope.currentCard).toBe($scope.deck[4]);

                        RumbleCtrl.setPosition(-1);
                        RumbleCtrl.setPosition(4);
                        RumbleCtrl.setPosition(2);

                        card = $scope.currentCard;
                        $scope.$emit('<mr-card>:contentEnd', card);

                        expect($scope.currentCard).toBe($scope.deck[2]);
                    });

                    it('should show ads again if user closes player and re-opens', function() {
                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(1); // ad
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(1);
                        RumbleCtrl.setPosition(2);
                        RumbleCtrl.setPosition(3);
                        RumbleCtrl.setPosition(4); // ad
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(-1); // reset reel
                        RumbleCtrl.setPosition(0);
                        RumbleCtrl.setPosition(1); // ad again!
                        expect($scope.currentCard.ad).toBe(true);

                        RumbleCtrl.setPosition(1);
                        RumbleCtrl.setPosition(2);
                        RumbleCtrl.setPosition(3);
                        RumbleCtrl.setPosition(4); // ad
                        expect($scope.currentCard.ad).toBe(true);
                    });
                });
            });

            it('updates elements based on index with setPosition',function(){
                RumbleCtrl.setPosition(1);
                expect($scope.currentIndex).toEqual(1);
                expect($scope.currentCard).toBe($scope.deck[1]);
                expect($scope.currentCard.visited).toEqual(true);
                expect($scope.atHead).toEqual(false);
                expect($scope.atTail).toEqual(false);
            });

            it('emits reelReset when going back to before the first card', function() {
                RumbleCtrl.setPosition(-1);
                expect($scope.currentIndex).toBe(-1);
                expect($scope.currentCard).toBe(null);
                expect($scope.atHead).toBe(false);
                expect($scope.atTail).toBe(false);
                expect($scope.$emit).toHaveBeenCalledWith('reelReset');
            });

            it('handles moving forward',function(){
                trackerSpy.trackPage.calls.reset();
                $scope.currentIndex = 0;
                $scope.currentCard  = $scope.deck[0];
                RumbleCtrl.goForward();

                expect($scope.currentIndex).toEqual(1);
                expect($scope.currentCard).toBe($scope.deck[1]);
                expect($scope.atHead).toEqual(false);
                expect($scope.atTail).toEqual(false);
                expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                expect($scope.$emit.calls.count()).toBe(3); // positionWillChange, positionDidChange, reelMove
                expect(trackerSpy.trackPage.calls.count()).toEqual(1);
                expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                    page : '/mr/e-722bd3c4942331/ad1/?ix=1',
                    title : 'my title - ad',
                    slideIndex : 1
                }); 
            });

            it('sends ga event if moving forward from control', function(){
                trackerSpy.trackPage.calls.reset();
                trackerSpy.trackEvent.calls.reset();
                $scope.currentIndex = 0;
                $scope.currentCard  = $scope.deck[0];
                RumbleCtrl.goForward('test');

                expect($scope.currentIndex).toEqual(1);
                expect($scope.currentCard).toBe($scope.deck[1]);
                expect(trackerSpy.trackPage.calls.count()).toEqual(1);
                expect(trackerSpy.trackEvent.calls.count()).toEqual(1);
                expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                    page : '/mr/e-722bd3c4942331/ad1/?ix=1',
                    title : 'my title - ad',
                    slideIndex : 1
                }); 
                expect(trackerSpy.trackEvent).toHaveBeenCalledWith({
                    category : 'Navigation',
                    action   : 'Next',
                    label    : 'test',
                    page     : '/mr/e-722bd3c4942331/ad1/?ix=1', 
                    title    : 'my title - ad',
                    slideIndex : 1
               }); 
            });


            it('handles moving backward',function(){
                trackerSpy.trackPage.calls.reset();
                trackerSpy.trackEvent.calls.reset();
                $scope.currentIndex = 2;
                $scope.currentCard  = $scope.deck[2];
                RumbleCtrl.goBack();

                expect($scope.currentIndex).toEqual(1);
                expect($scope.currentCard).toBe($scope.deck[1]);
                expect($scope.atHead).toEqual(false);
                expect($scope.atTail).toEqual(false);
                expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                expect($scope.$emit.calls.count()).toBe(3); // positionWillChange, positionDidChange, reelMove
                expect(trackerSpy.trackPage.calls.count()).toEqual(1);
                expect(trackerSpy.trackEvent.calls.count()).toEqual(1);
                expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                    page : '/mr/e-722bd3c4942331/ad1/?ix=1',
                    title : 'my title - ad',
                    slideIndex : 1
                }); 
                expect(trackerSpy.trackEvent).toHaveBeenCalledWith({
                    category : 'Navigation',
                    action   : 'Previous',
                    label    : 'auto',
                    page     : '/mr/e-722bd3c4942331/ad1/?ix=1', 
                    title    : 'my title - ad',
                    slideIndex : 1
                }); 
            });

            it('does not go past the last card', function() {
                RumbleCtrl.setPosition($scope.deck.length - 1, 'set to last card');
                expect($scope.currentIndex).toBe($scope.deck.length - 1);

                RumbleCtrl.setPosition($scope.deck.length);
                expect($scope.currentIndex).toBe($scope.deck.length - 1, 'set past last card');
            });

            it('sends ga event if moving backward from control', function(){
                trackerSpy.trackPage.calls.reset();
                trackerSpy.trackEvent.calls.reset();
                $scope.currentIndex = 2;
                $scope.currentCard  = $scope.deck[2];
                RumbleCtrl.goBack('test');

                expect($scope.currentIndex).toEqual(1);
                expect($scope.currentCard).toBe($scope.deck[1]);
                expect(trackerSpy.trackPage.calls.count()).toEqual(1);
                expect(trackerSpy.trackEvent.calls.count()).toEqual(1);
                expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                    page : '/mr/e-722bd3c4942331/ad1/?ix=1',
                    title : 'my title - ad',
                    slideIndex : 1
                }); 
                expect(trackerSpy.trackEvent).toHaveBeenCalledWith({
                    category : 'Navigation',
                    action   : 'Previous',
                    label    : 'test',
                    page     : '/mr/e-722bd3c4942331/ad1/?ix=1', 
                    title    : 'my title - ad',
                    slideIndex : 1
                }); 
            });

            it('handles goTo', function(){
                trackerSpy.trackPage.calls.reset();
                trackerSpy.trackEvent.calls.reset();
                $scope.deck.forEach(function(card) {
                    if (card.ad) { card.visited = true; }
                });

                $scope.currentIndex = 0;
                $scope.currentCard  = $scope.deck[0];
                RumbleCtrl.goTo(2);

                expect($scope.currentIndex).toEqual(2);
                expect($scope.currentCard).toBe($scope.deck[2]);
                expect($scope.atHead).toEqual(false);
                expect($scope.atTail).toEqual(false);
                expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                expect($scope.$emit.calls.count()).toBe(3); // positionWillChange, positionDidChange, reelMove
                expect(trackerSpy.trackPage.calls.count()).toEqual(1);
                expect(trackerSpy.trackEvent.calls.count()).toEqual(1);
                expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                    page : '/mr/e-722bd3c4942331/vid2/?ix=2',
                    title : 'my title - vid2 caption',
                    slideIndex : 2
                }); 
                expect(trackerSpy.trackEvent).toHaveBeenCalledWith({
                    category : 'Navigation',
                    action   : 'Skip',
                    label    : 'auto',
                    page     : '/mr/e-722bd3c4942331/vid2/?ix=2', 
                    title    : 'my title - vid2 caption',
                    slideIndex : 2
                }); 
            });

            it('sends ga event if going to from control', function(){
                trackerSpy.trackPage.calls.reset();
                trackerSpy.trackEvent.calls.reset();
                $scope.deck.forEach(function(card) {
                    if (card.ad) { card.visited = true; }
                });

                $scope.currentIndex = 0;
                $scope.currentCard  = $scope.deck[0];
                RumbleCtrl.goTo(2,'test');

                expect($scope.currentIndex).toEqual(2);
                expect($scope.currentCard).toBe($scope.deck[2]);
                expect(trackerSpy.trackPage.calls.count()).toEqual(1);
                expect(trackerSpy.trackEvent.calls.count()).toEqual(1);
                expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                    page : '/mr/e-722bd3c4942331/vid2/?ix=2',
                    title : 'my title - vid2 caption',
                    slideIndex : 2
                }); 
                expect(trackerSpy.trackEvent).toHaveBeenCalledWith({
                    category : 'Navigation',
                    action   : 'Skip',
                    label    : 'test',
                    page     : '/mr/e-722bd3c4942331/vid2/?ix=2', 
                    title    : 'my title - vid2 caption',
                    slideIndex : 2
                }); 
            });

            it('will call enable() on a NavController if there is one', function() {
                ['<mr-card>:init'].forEach(function(event) {
                    var provideNavController = jasmine.createSpy('provideNavController()'),
                        navController;

                    $scope.$apply(function() {
                        $scope.$emit(event, provideNavController);
                    });
                    navController = provideNavController.calls.mostRecent().args[0];
                    spyOn(navController, 'enabled');

                    RumbleCtrl.setPosition(1);
                    expect(navController.enabled).toHaveBeenCalledWith(true);
                });
            });
        });

        describe('starting the mini reel', function() {
            beforeEach(function() {
                spyOn(c6ImagePreloader, 'load');
            });

            describe('if the minireel has a campaign', function() {
                beforeEach(function() {
                    appData.experience.data.campaign = {};
                });

                describe('if there are launchUrls', function() {
                    beforeEach(function() {
                        appData.experience.data.campaign.launchUrls = ['hello-world.foo'];
                        RumbleCtrl.start();
                    });

                    it('should fire them', function() {
                        expect(c6ImagePreloader.load).toHaveBeenCalledWith(['hello-world.foo']);
                    });

                    describe('if the minireel is launched again', function() {
                        beforeEach(function() {
                            c6ImagePreloader.load.calls.reset();
                            RumbleCtrl.start();
                        });

                        it('should not fire the pixels again', function() {
                            expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('if there are no launchUrls', function() {
                    beforeEach(function() {
                        delete appData.experience.data.campaign.launchUrls;
                        RumbleCtrl.start();
                    });

                    it('should not fire anything', function() {
                        expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                    });
                });
            });

            describe('if the minireel has no campaign', function() {
                beforeEach(function() {
                    delete appData.experience.data.campaign;
                    RumbleCtrl.start();
                });

                it('should not fire anything', function() {
                    expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                });
            });

            describe('google analytics',function(){
                beforeEach(function(){
                    trackerSpy.trackPage.calls.reset();
                    trackerSpy.trackEvent.calls.reset();
                    spyOn($scope, '$emit').and.callThrough();
                    RumbleCtrl.start();
                });
                it('does not send an event for the launch',function(){
                    expect(trackerSpy.trackEvent).not.toHaveBeenCalled();
                });

                it('sends a pageview for the first slide',function(){
                    expect(trackerSpy.trackPage).toHaveBeenCalledWith({
                        page : '/mr/e-722bd3c4942331/vid1/?ix=0',
                        title : 'my title - vid1 caption',
                        slideIndex : 0,
                        sessionControl: 'start'
                    });
                });
            });

            describe('if the behavior allows fullscreen', function() {
                beforeEach(function() {
                    spyOn($scope, '$emit').and.callThrough();
                    appData.behaviors.fullscreen = true;

                    RumbleCtrl.start();
                });

                it('should ask cinema6 to be moved fullscreen', function() {
                    expect(cinema6.fullscreen).toHaveBeenCalledWith(true);
                });

                it('should $emit the startReel event', function() {
                    expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                });
            });

            describe('if the behavior does not allow fullscreen', function() {
                beforeEach(function() {
                    spyOn($scope, '$emit').and.callThrough();
                    appData.behaviors.fullscreen = false;

                    RumbleCtrl.start();
                });

                it('should not ask cinema6 to be moved fullscreen', function() {
                    expect(cinema6.fullscreen).not.toHaveBeenCalled();
                });

                it('should $emit the startReel event', function() {
                    expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                });
            });

            describe('if the deck is empty except for a recap card', function() {
                it('should start and end at the same time', function() {
                    $scope.deck = [{ id: 'foo', type: 'recap' }];

                    spyOn($scope, '$emit').and.callThrough();

                    RumbleCtrl.start();

                    expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                    expect($scope.$emit).toHaveBeenCalledWith('reelEnd');
                });
            });
        });

        describe('event',function(){
            beforeEach(function(){
                mockPlayer.getType.and.returnValue('vimeo');
                mockPlayer.getVideoId.and.returnValue('vid2video');
                mockPlayer.isReady.and.returnValue(false);
            });

            describe('deckControllerReady', function() {
                it('should broadcast adOnDeck if first card should be an ad', function() {
                    compileCtrlWithDynamicAds(0, 3);
                    spyOn($scope, '$broadcast');

                    $scope.$emit('deckControllerReady');

                    expect($scope.$broadcast).toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                    expect($scope.$broadcast.calls.mostRecent().args[1].id).toBe('rc-advertisement1');
                    expect($scope.$broadcast.calls.count()).toBe(1);
                });

                it('should not broadcast adOnDeck if first card is not an ad', function() {
                    compileCtrlWithDynamicAds(1, 3);
                    spyOn($scope, '$broadcast');

                    $scope.$emit('deckControllerReady');

                    expect($scope.$broadcast).not.toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                });

                it('should not broadcast adOnDeck if first card is a static ad card', function() {
                    $scope.deck.unshift({
                        "id"     : "ad1",
                        "title"  : "ad",
                        "type"   : "vast",
                        "voting" : [ 100, 50, 10 ],
                        "ad"     : true,
                        "data"   : {}
                    });

                    spyOn($scope, '$broadcast').and.callThrough();

                    $scope.$emit('deckControllerReady');

                    expect($scope.$broadcast).not.toHaveBeenCalledWith('adOnDeck',jasmine.any(Object));
                });
            });

            describe('shouldStart', function() {
                beforeEach(function() {
                    spyOn(RumbleCtrl, 'start');

                    $scope.currentIndex = -1;
                    $scope.$emit('shouldStart');
                });

                it('should start the minireel when emitted', function() {
                    expect(RumbleCtrl.start).toHaveBeenCalled();
                });

                describe('if the minireel is already started', function() {
                    beforeEach(function() {
                        RumbleCtrl.start = jasmine.createSpy('RumbleCtrl.start()');

                        $scope.currentIndex = 0;

                        $scope.$emit('shouldStart');
                    });

                    it('should not start', function() {
                        expect(RumbleCtrl.start).not.toHaveBeenCalled();
                    });
                });
            });

            describe('<mr-card>:init', function() {
                var provideController;

                beforeEach(function() {
                    provideController = jasmine.createSpy('provideController()');

                    $scope.$apply(function() {
                        $scope.$emit('<mr-card>:init', provideController);
                    });
                });

                it('should call the provided function, passing in a controller object', function() {
                    expect(provideController).toHaveBeenCalledWith(jasmine.any(Object));
                });

                describe('the NavController', function() {
                    var navController;

                    beforeEach(function() {
                        navController = provideController.calls.mostRecent().args[0];
                    });

                    describe('methods', function() {
                        describe('enabled(bool)', function() {
                            it('should be chainable', function() {
                                expect(navController.enabled()).toBe(navController);
                            });

                            describe('when true is passed in', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        navController.enabled(true);
                                    });
                                });

                                it('should set $scope.nav.enabled to true', function() {
                                    expect($scope.nav.enabled).toBe(true);
                                });
                            });

                            describe('when false is passed in', function() {
                                beforeEach(function() {
                                    $scope.nav.enabled = true;
                                    $scope.nav.wait = 2;

                                    $scope.$apply(function() {
                                        navController.enabled(false);
                                    });
                                });

                                it('should set $scope.nav.enabled to false', function() {
                                    expect($scope.nav.enabled).toBe(false);
                                });

                                it('should set $scope.nav.wait to null', function() {
                                    expect($scope.nav.wait).toBeNull();
                                });
                            });
                        });

                        describe('tick(time)', function() {
                            it('should be chainable', function() {
                                expect(navController.tick()).toBe(navController);
                            });

                            it('should set $scope.nav.wait to the provided time', function() {
                                [2, 12, 14, 11, 16, 8].forEach(function(time) {
                                    navController.tick(time);
                                    expect($scope.nav.wait).toBe(time);
                                });
                            });

                            it('should round everything', function() {
                                [2.7, 3.2, 5.5, 6.7].forEach(function(time) {
                                    navController.tick(time);
                                    expect($scope.nav.wait).toBe(Math.round(time));
                                });
                            });
                        });
                    });
                });
            });

            describe('<mr-card>:contentEnd', function() {
                var currentCard;

                beforeEach(function() {
                    $scope.currentCard = currentCard = {
                        data: {
                            autoadvance: true
                        }
                    };

                    spyOn(RumbleCtrl, 'goForward');
                });

                describe('if the event is not for the current card', function() {
                    beforeEach(function() {
                        $scope.$emit('<mr-card>:contentEnd', {});
                    });

                    it('should not move forward', function() {
                        expect(RumbleCtrl.goForward).not.toHaveBeenCalled();
                    });
                });

                describe('if the event is for the currentCard', function() {
                    beforeEach(function() {
                        $scope.$emit('<mr-card>:contentEnd', currentCard);
                    });

                    it('should move forward', function() {
                        expect(RumbleCtrl.goForward).toHaveBeenCalled();
                    });

                    describe('if the card is not set to autoadvance', function() {
                        beforeEach(function() {
                            currentCard.data.autoadvance = false;
                            RumbleCtrl.goForward = jasmine.createSpy('goForward()');
                            $scope.$emit('<mr-card>:contentEnd', currentCard);
                        });

                        it('should not move forward', function() {
                            expect(RumbleCtrl.goForward).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });

        describe('cinema6 session handlers', function() {
            var session, request, card;

            beforeEach(function() {
                $scope.deck = [
                    {
                        id: 'foo',
                        data: 'test'
                    },
                    {
                        id: 'bar',
                        data: 'more info'
                    },
                    {
                        id: 'baz',
                    }
                ];

                card = {
                    id: 'bar'
                };

                request = $q.defer();

                session = c6EventEmitter({
                    request: jasmine.createSpy('session.request()')
                        .and.returnValue(request.promise)
                });

                spyOn(session, 'on').and.callThrough();
                spyOn($scope, '$emit');
                spyOn(RumbleCtrl, 'jumpTo');

                $scope.$apply(function() {
                    sessionDeferred.resolve(session);
                });
            });

            it('should have called getSession()', function() {
                expect(cinema6.getSession).toHaveBeenCalled();
            });

            it('should register three handlers', function() {
                expect(session.on.calls.count()).toEqual(3);
                expect(session.on.calls.argsFor(0)[0]).toEqual('mrPreview:updateExperience');
                expect(session.on.calls.argsFor(1)[0]).toEqual('mrPreview:jumpToCard');
                expect(session.on.calls.argsFor(2)[0]).toEqual('mrPreview:reset');
            });

            it('should request a card', function() {
                expect(session.request).toHaveBeenCalledWith('mrPreview:getCard');
            });

            describe('mrPreview:updateExperience', function() {
                it('should update the deck when called', function() {
                    var deck = MiniReelService.createDeck(appData.experience.data);
                    session.emit('mrPreview:updateExperience', appData.experience);
                    expect(MiniReelService.createDeck).toHaveBeenCalled();
                    expect($scope.deck).toEqual(deck);
                });
            });

            describe('mrPreview:jumpToCard', function() {
                describe('when player is not at the beginning', function() {
                    beforeEach(function() {
                        $scope.currentIndex = 1;
                        session.emit('mrPreview:jumpToCard', card);
                    });

                    it('should not emit reelStart', function() {
                        expect($scope.$emit).not.toHaveBeenCalledWith('reelStart');
                    });

                    it('should find and jumpTo the right card', function() {
                        expect(RumbleCtrl.jumpTo).toHaveBeenCalledWith($scope.deck[1]);
                    });
                });

                describe('when player is at the beginning', function() {
                    beforeEach(function() {
                        $scope.currentIndex = -1;
                        session.emit('mrPreview:jumpToCard', card);
                    });

                    it('should not emit reelStart', function() {
                        expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                    });

                    it('should find and jumpTo the right card', function() {
                        expect(RumbleCtrl.jumpTo).toHaveBeenCalledWith($scope.deck[1]);
                    });
                });

                describe('when player should be in fullscreen mode', function() {
                    it('should emit fullscreen event', function() {
                        appData.behaviors.fullscreen = true;
                        session.emit('mrPreview:jumpToCard', card);
                        expect(cinema6.fullscreen).toHaveBeenCalledWith(true);
                    });
                });

                describe('when player shouldn\'t be in fullscreen mode', function() {
                    it('should emit fullscreen event', function() {
                        appData.behaviors.fullscreen = false;
                        session.emit('mrPreview:jumpToCard', card);
                        expect(cinema6.fullscreen).not.toHaveBeenCalledWith(false);
                    });
                });
            });

            describe('mrPreview:reset', function() {
                it('should set the position to -1, which enables the splash page', function() {
                    spyOn(RumbleCtrl, 'setPosition');
                    session.emit('mrPreview:reset');
                    expect(RumbleCtrl.setPosition).toHaveBeenCalledWith(-1);
                });
            });

            describe('mrPreview:getCard', function() {
                describe('if there is no card returned', function() {
                    it('should not jumpTo anything', function() {
                        card = undefined;

                        $scope.$apply(function() {
                            request.resolve(card);
                        });

                        expect(RumbleCtrl.jumpTo).not.toHaveBeenCalled();
                    });
                });

                describe('if there a card is returned', function() {
                    it('should find and jumpTo the right card', function() {
                        $scope.$apply(function() {
                            request.resolve(card);
                        });

                        expect(RumbleCtrl.jumpTo).toHaveBeenCalledWith($scope.deck[1]);
                    });

                    it('should not emit reelStart if the player is not at the beginning', function() {
                        $scope.$apply(function() {
                            $scope.currentIndex = 1;
                            request.resolve(card);
                        });

                        expect($scope.$emit).not.toHaveBeenCalledWith('reelStart');
                    });

                    it('should emit reelStart if the player is at the beginning', function() {
                        $scope.$apply(function() {
                            $scope.currentIndex = -1;
                            request.resolve(card);
                        });

                        expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                    });

                    describe('when player should be in fullscreen mode', function() {
                        it('should emit fullscreen event', function() {
                            appData.behaviors.fullscreen = true;

                            $scope.$apply(function() {
                                request.resolve(card);
                            });
                            
                            expect(cinema6.fullscreen).toHaveBeenCalledWith(true);
                        });
                    });

                    describe('when player shouldn\'t be in fullscreen mode', function() {
                        it('should emit fullscreen event', function() {
                            appData.behaviors.fullscreen = false;

                            $scope.$apply(function() {
                                request.resolve(card);
                            });
                            
                            expect(cinema6.fullscreen).not.toHaveBeenCalledWith(false);
                        });
                    });
                });
            });
        });
    });
});
