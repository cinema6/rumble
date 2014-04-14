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
                RumbleCtrl,
                BallotService,
                CommentsService,
                deck,
                appData,
                mockPlayer,
                cinema6,
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
                    fullscreen: jasmine.createSpy('cinema6.fullscreen')
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
                    }
                ];

                appData = {
                    profile: {
                        device: 'desktop'
                    },
                    experience: {
                        id: 'e-722bd3c4942331',
                        data : {
                            id: 'r-43yt3fh85',
                            deck : deck 
                        }
                    },
                    behaviors: {}
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
                    BallotService = $injector.get('BallotService');
                    CommentsService = $injector.get('CommentsService');
                    ControlsService = $injector.get('ControlsService');

                    $scope      = $rootScope.$new();

                    $scope.app = {
                        data: appData
                    };
                    $scope.AppCtrl = {};

                    spyOn(CommentsService, 'init');
                    spyOn(BallotService, 'init');
                    spyOn(BallotService, 'getElection');
                    RumbleCtrl = $controller('RumbleController', {
                        $scope  : $scope,
                        $log    : $log
                    });
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
                });

                it('should initialize BallotService with the id', function() {
                    expect(BallotService.init).toHaveBeenCalledWith(appData.experience.id);
                });

                it('should get the election', function() {
                    expect(BallotService.getElection).toHaveBeenCalled();
                });

                it('should initialize the CommentsService with the id', function() {
                    expect(CommentsService.init).toHaveBeenCalledWith(appData.experience.id);
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
                    $scope.currentIndex = 4;
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

            describe('navigation',function(){
                beforeEach(function(){
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

                it('updates elements based on index with setPosition',function(){
                    RumbleCtrl.setPosition(1);
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
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
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(false);
                    expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                    expect($scope.$emit.callCount).toBe(1);
                });


                it('handles moving backward',function(){
                    $scope.currentIndex = 2;
                    $scope.currentCard  = $scope.deck[2];
                    RumbleCtrl.goBack();
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentCard).toBe($scope.deck[1]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(false);
                    expect($scope.$emit).toHaveBeenCalledWith('reelMove');
                    expect($scope.$emit.callCount).toBe(1);
                });
            });

            describe('starting the mini reel', function() {
                beforeEach(function(){
                    $window.c6MrGa = jasmine.createSpy('$window.c6MrGa');
                });
                describe('google analytics',function(){
                    beforeEach(function(){
                        spyOn($scope, '$emit');
                        RumbleCtrl.start();
                    });
                    it('sends a page view event for the launch',function(){
                        expect($window.c6MrGa).toHaveBeenCalledWith(
                            'c6-mr.send', 'pageview',{
                                'page' : '/mr/launch?experienceId=e-722bd3c4942331',
                                'title' : 'Minireel App Launch'
                            });
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
                        expect(mockPlayer.on.callCount).toEqual(1);
                        expect(mockPlayer.on.argsForCall[0][0]).toEqual('ready');
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
        });
    });
}());

