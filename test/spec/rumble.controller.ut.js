(function(){
    'use strict';
    define(['rumble'], function() {
        describe('RumbleController', function() {
            var $rootScope,
                $scope,
                $window,
                $timeout,
                $q,
                $log,
                $controller,
                c6UserAgent,
                c6EventEmitter,
                RumbleCtrl,
                BallotService,
                CommentsService,
                deck,
                appData,
                mockPlayer,
                cinema6,
                sessionDeferred,
                MiniReelService,
                ControlsService;

            beforeEach(function() {
                MiniReelService = {
                    createDeck: jasmine.createSpy('MiniReelService.createDeck()')
                        .andCallFake(function(data) {
                            var playlist = angular.copy(data.deck);

                            MiniReelService.createDeck.mostRecentCall.result = playlist;

                            playlist.forEach(function(video) {
                                video.player = null;
                                video.state = {
                                    twerked: false,
                                    vote: -1,
                                    view: 'video'
                                };
                            });

                            return playlist;
                        })
                };

                cinema6 = {
                    fullscreen: jasmine.createSpy('cinema6.fullscreen'),
                    getSession: function(){}
                };

                mockPlayer = {
                    getType         : jasmine.createSpy('player.getType'),
                    getVideoId      : jasmine.createSpy('player.getVideoId'),
                    isReady         : jasmine.createSpy('player.isReady'),
                    on              : jasmine.createSpy('player.on'),
                    removeListener  : jasmine.createSpy('player.removeListener'),
                    _on       : {}
                };
                mockPlayer.on.andCallFake(function(eventName,handler){
                    if (mockPlayer._on[eventName] === undefined){
                        mockPlayer._on[eventName] = [];
                    }
                    mockPlayer._on[eventName].push(handler);
                });

                deck = [
                    {
                        "id"     : "vid1",
                        "type"   : "youtube",
                        "caption": "vid1 caption",
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
                        "type"   : "vast",
                        "voting" : [ 100, 50, 10 ],
                        "ad"     : true,
                        "data"   : {}
                    },
                    {
                        "id"     : "vid2",
                        "type"   : "vimeo",
                        "caption": "vid2 caption",
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
                        "caption": "ad2 caption",
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
                        "caption": "vid3 caption",
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
                        "caption": "vid4 caption",
                        "note"   : "vid4 note",
                        "thumbs" : {
                            "small": "vid4.jpg",
                            "large": "vid4--large.jpg"
                        },
                        "data"   : {
                            "videoid" : "vid4video"
                        }
                    }
                ];

                appData = {
                    profile: {
                        device: 'desktop',
                        inlineVideo: true
                    },
                    experience: {
                        id: 'e-722bd3c4942331',
                        title: 'my title',
                        data : {
                            title : 'my title',
                            election: 'el-a30a5954440d66',
                            deck : deck,
                            mode : 'testMode'
                        }
                    },
                    behaviors: {},
                    mode : 'testMode'
                };

                module('c6.ui', function($provide) {
                    $provide.value('cinema6', cinema6);
                });

                module('c6.rumble', function($provide) {
                    $provide.value('MiniReelService', MiniReelService);
                    $provide.value('ControlsService', {
                        init: jasmine.createSpy('ControlsService.init()')
                            .andReturn({})
                    });
                });

                inject(function($injector) {
                    $timeout    = $injector.get('$timeout');
                    $q          = $injector.get('$q');
                    $rootScope  = $injector.get('$rootScope');
                    $log        = $injector.get('$log');
                    $controller = $injector.get('$controller');
                    $log.context = function() { return $log; };
                    $window     = $injector.get('$window');
                    c6UserAgent = $injector.get('c6UserAgent');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    BallotService = $injector.get('BallotService');
                    CommentsService = $injector.get('CommentsService');
                    ControlsService = $injector.get('ControlsService');

                    $window.c6MrGa = jasmine.createSpy('$window.c6MrGa');

                    $scope      = $rootScope.$new();

                    $scope.app = {
                        data: appData
                    };
                    $scope.AppCtrl = {};

                    spyOn(cinema6, 'getSession').andCallFake(function() {
                        sessionDeferred = $q.defer();
                        return sessionDeferred.promise;
                    });
                    spyOn(CommentsService, 'init');
                    spyOn(BallotService, 'init');
                    spyOn(BallotService, 'getElection');
                    RumbleCtrl = $controller('RumbleController', {
                        $scope  : $scope,
                        $log    : $log
                    });

                    $scope.$emit('analyticsReady');
                    $timeout.flush(1000);
                });
            });
            describe('initialization',function(){
                it('has proper dependencies',function(){
                    expect(RumbleCtrl).toBeDefined();
                    expect($scope.deviceProfile).toBe(appData.profile);

                    expect($scope.deck).toBe(MiniReelService.createDeck.mostRecentCall.result);
                    expect($scope.currentIndex).toEqual(-1);
                    expect($scope.currentCard).toBeNull();
                    expect($scope.atHead).toBeNull();
                    expect($scope.atTail).toBeNull();
                    expect($scope.ready).toEqual(false);
                    expect($scope.nav).toEqual({
                        enabled: true,
                        wait: null
                    });
                });

                it('should initialize BallotService with the id', function() {
                    expect(BallotService.init).toHaveBeenCalledWith(appData.experience.data.election);
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

                    expect(BallotService.init.callCount).toBe(1);
                });

                it('should initialize the CommentsService with the id', function() {
                    expect(CommentsService.init).toHaveBeenCalledWith(appData.experience.id);
                });

                it('should initialize the google analytics', function(){
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.set','dimension1',
                        'testMode']);
                    expect($window.c6MrGa.calls[1].args).toEqual(['c6mr.send','pageview',{
                        page : '/mr/e-722bd3c4942331',
                        title : 'my title'
                    }]);
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

            describe('$scope.controls', function() {
                var controlsIFace;

                beforeEach(function() {
                    var newScope = $rootScope.$new();

                    newScope.app = $scope.app;
                    newScope.AppCtrl = {
                        resize: angular.noop
                    };

                    controlsIFace = {};

                    ControlsService.init.andReturn(controlsIFace);

                    $scope = newScope;
                    RumbleCtrl = $controller('RumbleController', { $scope: $scope });
                });

                it('should be the result of calling init() on the ControlsService', function() {
                    expect($scope.controls).toBe(controlsIFace);
                    expect(ControlsService.init).toHaveBeenCalled();
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

            describe('getVirtualPage', function(){
                it('returns base experience page if $scope.currentCard not set',function(){
                    $scope.currentCard = null;
                    expect(RumbleCtrl.getVirtualPage()).toEqual({
                        page :  '/mr/e-722bd3c4942331',
                        title : 'my title'
                    });
                });

                it('returns current card url if $scope.currentCard is set',function(){
                    $scope.currentCard = deck[0];
                    expect(RumbleCtrl.getVirtualPage()).toEqual({
                        page :  '/mr/e-722bd3c4942331/vid1',
                        title : 'my title - vid1'
                    });
                });
            });

            describe('reportPageView', function(){
                beforeEach(function(){
                    $window.c6MrGa = jasmine.createSpy('$window.c6MrGa-reportPageView');
                });

                it('reports a pageview when default time of 1000ms expires', function(){
                    RumbleCtrl.reportPageView({ page : 'foo' });
                    expect($window.c6MrGa.callCount).toEqual(0);
                    $timeout.flush(500);
                    expect($window.c6MrGa.callCount).toEqual(0);
                    $timeout.flush(600);
                    expect($window.c6MrGa.callCount).toEqual(1);
                    expect($window.c6MrGa.mostRecentCall.args)
                        .toEqual(['c6mr.send','pageview', { page : 'foo'}  ]); 
                });

                it('reports a pageview when override timeout expires', function(){
                    RumbleCtrl.reportPageView({ page : 'foo' }, 100);
                    expect($window.c6MrGa.callCount).toEqual(0);
                    $timeout.flush(101);
                    expect($window.c6MrGa.callCount).toEqual(1);
                    expect($window.c6MrGa.mostRecentCall.args)
                        .toEqual(['c6mr.send','pageview', { page : 'foo'}  ]); 
                });

                it('overwrites a pageview if new one comes in before delay', function(){
                    RumbleCtrl.reportPageView({ page : 'foo' });
                    RumbleCtrl.reportPageView({ page : 'bar' });
                    $timeout.flush();
                    expect($window.c6MrGa.callCount).toEqual(1);
                    expect($window.c6MrGa.mostRecentCall.args)
                        .toEqual(['c6mr.send','pageview', { page : 'bar'}  ]); 
                });
            });

            describe('navigation',function(){
                beforeEach(function(){
                    $window.c6MrGa = jasmine.createSpy('$window.c6MrGa');
                    $scope.deviceProfile = { multiPlayer : true };
                    $scope.deck.forEach(function(item,index){
                        item.player = {
                            isReady : jasmine.createSpy('item'+index+'.isReady'),
                            play    : jasmine.createSpy('item'+index+'.play'),
                            pause   : jasmine.createSpy('item'+index+'.pause')
                        };
                        item.player.isReady.andReturn(true);
                    });
                    spyOn($scope, '$emit');
                });

                describe('showing ads', function() {
                    beforeEach(function() {
                        $scope.deck = [
                            {},
                            {},
                            {
                                ad: true
                            },
                            {},
                            {},
                            {}
                        ];

                        spyOn(RumbleCtrl, 'setPosition').andCallThrough();
                    });

                    describe('going forward', function() {
                        it('should show an ad if the user is skipping to the card after an ad', function() {
                            RumbleCtrl.setPosition(1);
                            expect(RumbleCtrl.setPosition.callCount).toBe(1);

                            RumbleCtrl.setPosition(3);
                            expect(RumbleCtrl.setPosition).toHaveBeenCalledWith(2);
                            expect($scope.currentIndex).toBe(2);
                            expect($scope.currentCard).toBe($scope.deck[2]);
                        });

                        it('should not show the ad if it has already been viewed', function() {
                            RumbleCtrl.setPosition(2);
                            RumbleCtrl.setPosition(-1);
                            RumbleCtrl.setPosition(3);

                            expect($scope.currentIndex).toBe(3);
                            expect($scope.currentCard).toBe($scope.deck[3]);
                        });
                    });

                    describe('going backward', function() {
                        beforeEach(function() {
                            RumbleCtrl.setPosition(5);
                            RumbleCtrl.setPosition.callCount = 0;
                        });

                        it('should show an ad if the user is skipping to the card before an ad', function() {
                            RumbleCtrl.setPosition(3);
                            expect(RumbleCtrl.setPosition.callCount).toBe(1);

                            RumbleCtrl.setPosition(1);
                            expect(RumbleCtrl.setPosition).toHaveBeenCalledWith(2);
                            expect($scope.currentIndex).toBe(2);
                            expect($scope.currentCard).toBe($scope.deck[2]);
                        });

                        it('should not show the ad if it has already been viewed', function() {
                            RumbleCtrl.setPosition(2);
                            RumbleCtrl.setPosition(5);
                            RumbleCtrl.setPosition(1);

                            expect($scope.currentIndex).toBe(1);
                            expect($scope.currentCard).toBe($scope.deck[1]);
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
                    $scope.currentIndex = 0;
                    $scope.currentCard  = $scope.deck[0];
                    RumbleCtrl.goForward();
                    $timeout.flush();
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(false);
                    expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                    expect($scope.$emit.callCount).toBe(1);
                    expect($window.c6MrGa.callCount).toEqual(1);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','pageview',{
                        page : '/mr/e-722bd3c4942331/ad1', title : 'my title - ad1'
                    }]); 
                });

                it('sends ga event if moving forward from control', function(){
                    $scope.currentIndex = 0;
                    $scope.currentCard  = $scope.deck[0];
                    RumbleCtrl.goForward('test');
                    $timeout.flush();
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
                    expect($window.c6MrGa.callCount).toEqual(2);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','event','Navigation','Move','Next', { page : '/mr/e-722bd3c4942331/ad1', title : 'my title - ad1' }  ]); 
                });


                it('handles moving backward',function(){
                    $scope.currentIndex = 2;
                    $scope.currentCard  = $scope.deck[2];
                    RumbleCtrl.goBack();
                    $timeout.flush();
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(false);
                    expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                    expect($scope.$emit.callCount).toBe(1);
                    expect($window.c6MrGa.callCount).toEqual(1);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','pageview',{
                        page : '/mr/e-722bd3c4942331/ad1', title : 'my title - ad1'
                    }]); 
                });

                it('sends ga event if moving backward from control', function(){
                    $scope.currentIndex = 2;
                    $scope.currentCard  = $scope.deck[2];
                    RumbleCtrl.goBack('test');
                    $timeout.flush();
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
                    expect($window.c6MrGa.callCount).toEqual(2);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','event','Navigation','Move','Previous', { page : '/mr/e-722bd3c4942331/ad1', title : 'my title - ad1' } ]); 
                });

                it('handles goTo', function(){
                    $scope.deck.forEach(function(card) {
                        if (card.ad) { card.visited = true; }
                    });

                    $scope.currentIndex = 0;
                    $scope.currentCard  = $scope.deck[0];
                    RumbleCtrl.goTo(2);
                    $timeout.flush();
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(2);
                    expect($scope.currentCard).toBe($scope.deck[2]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(false);
                    expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                    expect($scope.$emit.callCount).toBe(1);
                    expect($window.c6MrGa.callCount).toEqual(1);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','pageview',{
                        page : '/mr/e-722bd3c4942331/vid2', title : 'my title - vid2'
                    }]);
                });

                it('sends ga event if going to from control', function(){
                    $scope.deck.forEach(function(card) {
                        if (card.ad) { card.visited = true; }
                    });

                    $scope.currentIndex = 0;
                    $scope.currentCard  = $scope.deck[0];
                    RumbleCtrl.goTo(2,'test');
                    $timeout.flush();
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(2);
                    expect($scope.currentCard).toBe($scope.deck[2]);
                    expect($window.c6MrGa.callCount).toEqual(2);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','event','Navigation','Move','Skip', { page : '/mr/e-722bd3c4942331/vid2', title : 'my title - vid2' } ]); 
                });

                it('sends ga event if navigates to tail',function(){
                    $scope.currentIndex = 0;
                    $scope.currentCard  = $scope.deck[0];
                    RumbleCtrl.goTo(5,'test');
                    $timeout.flush();
                    $scope.$digest();
                    expect($scope.atTail).toEqual(true);
                    expect($scope.currentIndex).toEqual(5);
                    expect($scope.currentCard).toBe($scope.deck[5]);
                    expect($window.c6MrGa.callCount).toEqual(2);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','event','Navigation','End','Skip', 1, { page : '/mr/e-722bd3c4942331/vid4', title : 'my title - vid4' } ]); 
                });

                it('sends ga event with value===1 if ends with all cards visited',function(){
                    angular.forEach($scope.deck,function(card){
                        card.visited = true;
                    });
                    $scope.currentIndex = 4;
                    $scope.currentCard  = $scope.deck[4];
                    RumbleCtrl.goForward('test');
                    $timeout.flush();
                    $scope.$digest();
                    expect($scope.atTail).toEqual(true);
                    expect($scope.currentIndex).toEqual(5);
                    expect($scope.currentCard).toBe($scope.deck[5]);
                    expect($window.c6MrGa.callCount).toEqual(2);
                    expect($window.c6MrGa.calls[0].args).toEqual(['c6mr.send','event','Navigation','End','Next', 6, { page : '/mr/e-722bd3c4942331/vid4', title : 'my title - vid4' } ]); 
                });


            });

            describe('starting the mini reel', function() {
                describe('google analytics',function(){
                    beforeEach(function(){
                        spyOn($scope, '$emit');
                        RumbleCtrl.start();
                    });
                    it('sends an event for the launch',function(){
                        expect($window.c6MrGa.calls[2].args).toEqual([
                            'c6mr.send', 'event', 'Navigation', 'Start', 'Start', { page : '/mr/e-722bd3c4942331/vid1', title : 'my title - vid1' }]);
                    });
                });

                describe('if the behavior allows fullscreen', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit');
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
                        spyOn($scope, '$emit');
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
                        spyOn($scope, '$emit');
                        $scope.$apply(function() {
                            $scope.deck = [{ id: 'foo', type: 'recap' }];
                        });

                        RumbleCtrl.start();

                        expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                        expect($scope.$emit).toHaveBeenCalledWith('reelEnd');
                    });
                });
            });

            describe('findCardByVideo',function(){
                it('returns an item that exists',function(){
                    expect(RumbleCtrl.findCardByVideo('vimeo','vid2video'))
                        .toBe($scope.deck[2]);
                });

                it('returns undefined for an item that does not exist',function(){
                    expect(RumbleCtrl.findCardByVideo('xxxxx','yyyyyyyyy'))
                        .not.toBeDefined();
                });
            });

            describe('event',function(){
                beforeEach(function(){
                    mockPlayer.getType.andReturn('vimeo');
                    mockPlayer.getVideoId.andReturn('vid2video');
                    mockPlayer.isReady.andReturn(false);
                });

                describe('playerAdd',function(){
                    it('adds new player to deck item',function(){
                        expect($scope.deck[2].player).toBeNull();
                        $scope.$emit('playerAdd',mockPlayer);
                        expect($scope.deck[2].player).toBe(mockPlayer);
                        expect(mockPlayer.on.callCount).toEqual(4);
                        expect(mockPlayer.on.argsForCall[0][0]).toEqual('ready');
                    });
                });

                describe('<vast-card>:init', function() {
                    var provideController;

                    beforeEach(function() {
                        provideController = jasmine.createSpy('provideController()');

                        $scope.$apply(function() {
                            $scope.$emit('<vast-card>:init', provideController);
                        });
                    });

                    it('should call the provided function, passing in a controller object', function() {
                        expect(provideController).toHaveBeenCalledWith(jasmine.any(Object));
                    });

                    describe('the NavController', function() {
                        var navController;

                        beforeEach(function() {
                            navController = provideController.mostRecentCall.args[0];
                        });

                        describe('methods', function() {
                            describe('enabled(bool)', function() {
                                describe('on a device that does not allow inline video', function() {
                                    beforeEach(function() {
                                        appData.profile.inlineVideo = false;
                                    });

                                    it('should not do anything', function() {
                                        expect(navController.enabled(false)).toBe(navController);
                                        expect($scope.nav.enabled).toBe(true);
                                    });
                                });

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

                describe('<vast-card>:contentEnd', function() {
                    beforeEach(function() {
                        spyOn(RumbleCtrl, 'goForward');
                    });

                    it('should move to the next card if the event is for the currentCard', function() {
                        var card1 = {},
                            card2 = {};

                        $scope.currentCard = card2;

                        $scope.$emit('<vast-card>:contentEnd', card1);
                        expect(RumbleCtrl.goForward).not.toHaveBeenCalled();

                        $scope.$emit('<vast-card>:contentEnd', card2);
                        expect(RumbleCtrl.goForward).toHaveBeenCalled();
                    });
                });

                describe('ready',function(){
                    it('runs a ready check when a player becomes ready',function(){
                        spyOn(RumbleCtrl,'checkReady').andCallThrough();
                        
                        $scope.$emit('playerAdd',mockPlayer);
                        
                        mockPlayer.isReady.andReturn(true);

                        expect(RumbleCtrl.checkReady).not.toHaveBeenCalled();
                        expect($scope.ready).toEqual(false);

                        mockPlayer._on.ready[0](mockPlayer);
                        expect(RumbleCtrl.checkReady).toHaveBeenCalled();
                        expect($scope.ready).toEqual(false);
                    });

                    it('reports ready when all players are ready',function(){
                        spyOn(RumbleCtrl,'checkReady').andCallThrough();
                        $scope.deck[0].player = {
                            isReady : jasmine.createSpy('player0.isReady')
                        };
                        $scope.deck[1].player = mockPlayer;
                        $scope.deck[2].player = {
                            isReady : jasmine.createSpy('player2.isReady')
                        };

                        $scope.$apply(function() {
                            $scope.currentIndex = 0;
                        });

                        $scope.deck[0].player.isReady.andReturn(true);
                        $scope.deck[2].player.isReady.andReturn(true);
                        $scope.$emit('playerAdd',mockPlayer);
                        expect($scope.ready).toEqual(false);
                        mockPlayer.isReady.andReturn(true);
                        mockPlayer._on.ready[0](mockPlayer);
                        expect(RumbleCtrl.checkReady).toHaveBeenCalled();
                        expect($scope.deck[0].player.isReady).toHaveBeenCalled();
                        expect($scope.deck[1].player.isReady).toHaveBeenCalled();
                        expect($scope.deck[2].player.isReady).toHaveBeenCalled();
                        expect($scope.ready).toEqual(true);
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
                            .andReturn(request.promise)
                    });

                    spyOn(session, 'on').andCallThrough();
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
                    expect(session.on.callCount).toEqual(3);
                    expect(session.on.calls[0].args[0]).toEqual('mrPreview:updateExperience');
                    expect(session.on.calls[1].args[0]).toEqual('mrPreview:jumpToCard');
                    expect(session.on.calls[2].args[0]).toEqual('mrPreview:reset');
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
}());

