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
                c6UserAgent,
                RumbleCtrl,
                rumbleVotes,
                deck,
                appData,
                mockPlayer,
                cinema6,
                MiniReelService;

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

                                rumbleVotes.mockReturnsData(data.id, video.id, video.voting);
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
                        "voting" : [ 100, 50, 10 ],
                        "data"   : {
                            "videoid" : "vid1video"
                        }
                    },
                    {
                        "id"     : "vid2",
                        "type"   : "vimeo",
                        "caption": "vid2 caption",
                        "note"   : "vid2 note",
                        "voting" : [ 100, 50, 10 ],
                        "data"   : {
                            "videoid" : "vid2video"
                        }
                    },
                    {
                        "id"     : "vid3",
                        "type"   : "dailymotion",
                        "caption": "vid3 caption",
                        "note"   : "vid3 note",
                        "voting" : [ 100, 50, 10 ],
                        "data"   : {
                            "videoid" : "vid3video"
                        }
                    }
                ];

                appData = {
                    profile      : {},
                    experience: {
                        data : {
                            deck : deck 
                        }
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.value('cinema6', cinema6);
                });

                module('c6.rumble', function($provide) {
                    $provide.value('MiniReelService', MiniReelService);
                });

                inject(function($injector) {
                    $timeout    = $injector.get('$timeout');
                    $q          = $injector.get('$q');
                    $rootScope  = $injector.get('$rootScope');
                    $log        = $injector.get('$log');
                    $log.context = function() { return $log; };
                    $window     = $injector.get('$window');
                    c6UserAgent = $injector.get('c6UserAgent');
                    rumbleVotes = $injector.get('rumbleVotes');

                    $scope      = $rootScope.$new();

                    $scope.app = {
                        data: appData
                    };

                    RumbleCtrl = $injector.get('$controller')('RumbleController', {
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
            });

            describe('$scope.players()', function() {
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
                    var players = $scope.players;

                    function playlist(index) {
                        return $scope.deck[index];
                    }

                    function currentIndex(index) {
                        $scope.$apply(function() {
                            $scope.currentIndex = index;
                        });
                    }

                    expect(players()).toEqual([playlist(0), playlist(1)]);

                    currentIndex(0);
                    expect(players()).toEqual([playlist(0), playlist(1), playlist(2)]);

                    currentIndex(1);
                    expect(players()).toEqual([playlist(0), playlist(1), playlist(2), playlist(3)]);

                    currentIndex(2);
                    expect(players()).toEqual([playlist(0), playlist(1), playlist(2), playlist(3), playlist(4)]);
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
                beforeEach(function() {
                    spyOn($scope, '$emit');

                    RumbleCtrl.start();
                });

                it('should ask cinema6 to be moved fullscreen', function() {
                    expect(cinema6.fullscreen).toHaveBeenCalledWith(true);
                });

                it('should $emit the startReel event', function() {
                    expect($scope.$emit).toHaveBeenCalledWith('reelStart');
                });
            });

            describe('findCardByVideo',function(){
                it('returns an item that exists',function(){
                    expect(RumbleCtrl.findCardByVideo('vimeo','vid2video'))
                        .toBe($scope.deck[1]);
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
                        expect($scope.deck[1].player).toBeNull();
                        $scope.$emit('playerAdd',mockPlayer);
                        expect($scope.deck[1].player).toBe(mockPlayer);
                        expect(mockPlayer.on.callCount).toEqual(2);
                        expect(mockPlayer.on.argsForCall[0][0]).toEqual('ready');
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
                        $scope.deck[2].player = {
                            isReady : jasmine.createSpy('player2.isReady')
                        };
                        $scope.players = function() {
                            return [$scope.deck[0], $scope.deck[1], $scope.deck[2]];
                        };
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

                describe('ended', function() {
                    beforeEach(function(){
                        mockPlayer.getType.andReturn('vimeo');
                        mockPlayer.getVideoId.andReturn('vid2video');
                        mockPlayer.isReady.andReturn(true);

                        $scope.$emit('playerAdd',mockPlayer);
                        $scope.currentCard = $scope.deck[1];
                        mockPlayer._on.ended[0](mockPlayer);
                    });

                    it('should set the view to "ballot"', function() {
                        expect($scope.deck[1].state.view).toBe('ballot');
                    });
                });
            });
        });
    });
}());

