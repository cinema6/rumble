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
                playList,
                appData,
                mockPlayer;
            
            beforeEach(function() {
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
                
                playList = [
                    {
                        "id"     : "vid1",
                        "caption": "vid1 caption",
                        "note"   : "vid1 note",
                        "voting" : [ 100, 50, 10 ],
                        "video"  : {
                            "player"  : "youtube",
                            "videoid" : "vid1video"
                        }
                    },
                    {
                        "id"     : "vid2",
                        "caption": "vid2 caption",
                        "note"   : "vid2 note",
                        "voting" : [ 100, 50, 10 ],
                        "video"  : {
                            "player"  : "vimeo",
                            "videoid" : "vid2video"
                        }
                    },
                    {
                        "id"     : "vid3",
                        "caption": "vid3 caption",
                        "note"   : "vid3 note",
                        "voting" : [ 100, 50, 10 ],
                        "video"  : {
                            "player"  : "dailymotion",
                            "videoid" : "vid3video"
                        }
                    }
                ];
                
                appData = {
                    profile      : {},
                    experience: {
                        data : {
                            playList : playList 
                        }
                    }
                };

                module('c6.rumble');

                inject(['$timeout','$q','$rootScope','$log','$window','$controller','c6UserAgent',
                    function(_$timeout,_$q,_$rootScope,  _$log, _$window, _$controller,_c6UserAgent) {
                    $timeout    = _$timeout;
                    $q          = _$q;
                    $rootScope  = _$rootScope;
                    $log        = _$log;
                    $window     = _$window;
                    $scope      = $rootScope.$new();
                    c6UserAgent = _c6UserAgent;
                    $log.context = function() { return $log; };

                    RumbleCtrl = _$controller('RumbleController', {
                        $scope  : $scope,
                        $log    : $log,
                        appData : appData
                    });

                }]);
            });
            describe('initialization',function(){
                it('has proper dependencies',function(){
                    expect(RumbleCtrl).toBeDefined();
                    expect($scope.deviceProfile).toBe(appData.profile);
                    
                    expect($scope.playList.length)
                        .toEqual(appData.experience.data.playList.length);
                    expect($scope.currentIndex).toEqual(-1);
                    expect($scope.currentItem).toBeNull();
                    expect($scope.atHead).toBeNull();
                    expect($scope.atTail).toBeNull();
                    expect($scope.ready).toEqual(false);
                });
            });
            describe('voting',function(){
                describe('getVotePercent',function(){
                    it('returns 0 if tally is 0', function(){
                        expect(RumbleCtrl.getVotePercent([0,0,0],0))
                            .toEqual(0);
                    });

                    it('returns 0 if the index is bad',function(){
                        expect(RumbleCtrl.getVotePercent([10,20,10],5))
                            .toEqual(0);
                    });

                    it('returns the right percent',function(){
                        var  votes = [7,10,5] ;
                        expect(RumbleCtrl.getVotePercent(votes,0)).toEqual(0.32);
                        expect(RumbleCtrl.getVotePercent(votes,1)).toEqual(0.45);
                        expect(RumbleCtrl.getVotePercent(votes,2)).toEqual(0.23);
                    });

                    it('returns an array of percents if no index is provided', function(){
                        var votes = [7,10,5];
                        expect(RumbleCtrl.getVotePercent(votes)).toEqual([0.32,0.45,0.23]);
                    });

                    it('returns an array of zeros if no index is provided and votes are zero', function(){
                        var votes = [0,0,0] ;
                        expect(RumbleCtrl.getVotePercent(votes)).toEqual([0,0,0]);
                    });
                });
            });

            describe('$scope.players()', function() {
                beforeEach(function() {
                    $scope.playList = [
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
                        return $scope.playList[index];
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

            describe('twerkNext',function(){
                var resolveSpy, rejectSpy;
                beforeEach(function(){
                    resolveSpy = jasmine.createSpy('twerk.resolve');
                    rejectSpy  = jasmine.createSpy('twerk.reject');
                    
                    c6UserAgent.app.name = 'chrome';
                    $scope.deviceProfile = { multiPlayer : true };
                    $scope.playList.forEach(function(item,index){
                        item.player = {
                            isReady  : jasmine.createSpy('item'+index+'.isReady'),
                            play     : jasmine.createSpy('item'+index+'.play'),
                            pause    : jasmine.createSpy('item'+index+'.pause'),
                            reset    : jasmine.createSpy('item'+index+'.reset'),
                            twerk    : jasmine.createSpy('item'+index+'.twerk'),
                            getType  : jasmine.createSpy('item'+index+'.getType')
                        };
                        item.player.isReady.andReturn(true);
                    });
                });

                it('rejects if there is no next player',function(){
                    $scope.currentIndex = 2;
                    RumbleCtrl.twerkNext().then(resolveSpy,rejectSpy);
                    $scope.$digest();
                    expect(resolveSpy).not.toHaveBeenCalled();
                    expect(rejectSpy).toHaveBeenCalledWith({
                        message : 'No next item to twerk.'
                    });
                });

                it('rejects if the next player has unsupportd browser',function(){
                    $scope.currentIndex = 0;
                    c6UserAgent.app.name = 'phantomjs';
                    RumbleCtrl.twerkNext().then(resolveSpy,rejectSpy);
                    $scope.$digest();
                    expect(resolveSpy).not.toHaveBeenCalled();
                    expect(rejectSpy).toHaveBeenCalledWith({
                        message: 'Twerking not supported on phantomjs'
                    });
                });

                it('rejects if the next player has already been twerked',function(){
                    $scope.currentIndex = 0;
                    $scope.playList[1].state.twerked = true;
                    RumbleCtrl.twerkNext().then(resolveSpy,rejectSpy);
                    $scope.$digest();
                    expect(resolveSpy).not.toHaveBeenCalled();
                    expect(rejectSpy).toHaveBeenCalledWith({
                        message: 'Item is already twerked'
                    });
                });

                it('resolves when the next player resolves',function(){
                    var deferred = $q.defer();
                    $scope.currentIndex = 0;
                    $scope.playList[1].player.twerk.andReturn(deferred.promise);
                    RumbleCtrl.twerkNext().then(resolveSpy,rejectSpy);
                    deferred.resolve($scope.playList[1].player);
                    $scope.$digest();
                    expect(resolveSpy).toHaveBeenCalledWith($scope.playList[1].player);
                    expect(rejectSpy).not.toHaveBeenCalled();
                    expect($scope.playList[1].state.twerked).toEqual(true);
                });

            });

            describe('navigation',function(){
                beforeEach(function(){
                    $scope.deviceProfile = { multiPlayer : true };
                    $scope.playList.forEach(function(item,index){
                        item.player = {
                            isReady : jasmine.createSpy('item'+index+'.isReady'),
                            play    : jasmine.createSpy('item'+index+'.play'),
                            pause   : jasmine.createSpy('item'+index+'.pause'),
                            reset   : jasmine.createSpy('item'+index+'.reset')
                        };
                        item.player.isReady.andReturn(true);
                    });
                });

                it('updates elements based on index with setPosition',function(){
                    RumbleCtrl.setPosition(1);
                    expect($scope.currentIndex).toEqual(1);
                    expect($scope.currentItem).toBe($scope.playList[1]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(false);
                    expect($scope.currentReturns).toBeNull();
                    $timeout.flush();
                    expect($scope.currentReturns).toEqual([0.63,0.31,0.06]);
                });

                it('handles moving forward',function(){
                    $scope.currentIndex = 1;
                    $scope.currentItem  = $scope.playList[1];
                    spyOn(RumbleCtrl,'twerkNext').andReturn({
                        then: jasmine.createSpy('twerkNext.then')
                    });
                    RumbleCtrl.goForward();
                    expect($scope.playList[1].player.pause).toHaveBeenCalled();
                    expect($scope.playList[2].player.reset).toHaveBeenCalled();
                    expect($scope.playList[2].player.play).toHaveBeenCalled();
                    expect($scope.currentIndex).toEqual(2);
                    expect($scope.currentItem).toBe($scope.playList[2]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(true);
                    expect(RumbleCtrl.twerkNext).toHaveBeenCalled();
                });
                
                it('handles moving backward',function(){
                    $scope.currentIndex = 1;
                    $scope.currentItem  = $scope.playList[1];
                    RumbleCtrl.goBack();
                    expect($scope.playList[1].player.pause).toHaveBeenCalled();
                    expect($scope.playList[0].player.reset).toHaveBeenCalled();
                    expect($scope.playList[0].player.play).toHaveBeenCalled();
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(0);
                    expect($scope.currentItem).toBe($scope.playList[0]);
                    expect($scope.atHead).toEqual(true);
                    expect($scope.atTail).toEqual(false);
                });
            });

            describe('findPlayListItemByVideo',function(){
                it('returns an item that exists',function(){
                    expect(RumbleCtrl.findPlayListItemByVideo('vimeo','vid2video'))
                        .toBe($scope.playList[1]);
                });

                it('returns undefined for an item that does not exist',function(){
                    expect(RumbleCtrl.findPlayListItemByVideo('xxxxx','yyyyyyyyy'))
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
                    it('adds new player to playList item',function(){
                        expect($scope.playList[1].player).toBeNull();
                        $scope.$emit('playerAdd',mockPlayer);
                        expect($scope.playList[1].player).toBe(mockPlayer);
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
                        $scope.playList[0].player = {
                            isReady : jasmine.createSpy('player0.isReady')
                        };
                        $scope.playList[2].player = {
                            isReady : jasmine.createSpy('player2.isReady')
                        };
                        $scope.playList[0].player.isReady.andReturn(true);
                        $scope.playList[2].player.isReady.andReturn(true);
                        $scope.$emit('playerAdd',mockPlayer);
                        expect($scope.ready).toEqual(false);
                        mockPlayer.isReady.andReturn(true);
                        mockPlayer._on.ready[0](mockPlayer);
                        expect(RumbleCtrl.checkReady).toHaveBeenCalled();
                        expect($scope.playList[0].player.isReady).toHaveBeenCalled();
                        expect($scope.playList[1].player.isReady).toHaveBeenCalled();
                        expect($scope.playList[2].player.isReady).toHaveBeenCalled();
                        expect($scope.ready).toEqual(true);
                    });
                });

                describe('videoStarted',function(){
                    beforeEach(function(){
                        mockPlayer.getType.andReturn('vimeo');
                        mockPlayer.getVideoId.andReturn('vid2video');
                        mockPlayer.isReady.andReturn(true);
                    });

                    it('is listened to when a player is added',function(){
                        expect(mockPlayer._on.videoStarted).not.toBeDefined();
                        $scope.$emit('playerAdd',mockPlayer);
                        expect(mockPlayer._on.videoStarted).toBeDefined();
                    });

                    it('sets the play list item to viewed when raised',function(){
                        $scope.$emit('playerAdd',mockPlayer);
                        $scope.currentItem = $scope.playList[1];
                        expect($scope.playList[1].player).toBe(mockPlayer);
                        expect($scope.playList[1].state.viewed).toEqual(false);
                        mockPlayer._on.videoStarted[0](mockPlayer);
                        $timeout.flush();
                        expect($scope.playList[1].state.viewed).toEqual(true);
                    });
                });
            });
        });
    });
}());

