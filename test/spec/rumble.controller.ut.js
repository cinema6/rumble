(function(){
    'use strict';
    define(['rumble'], function() {
        describe('RumbleController', function() {
            var $rootScope,
                $scope,
                $window,
                $timeout,
                $log,
                RumbleCtrl,
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
                ],
                AppCtrl = {
                    currentIndex : 0,
                    profile      : {},
                    experience: {
                        data : {
                            playList : playList 
                        }
                    }
                };

            beforeEach(function() {
                module('c6.rumble');

                inject(['$timeout','$rootScope','$log','$window','$controller',
                    function(_$timeout,_$rootScope,  _$log, _$window, _$controller) {
                    $timeout    = _$timeout;
                    $rootScope  = _$rootScope;
                    $log        = _$log;
                    $window     = _$window;
                    $scope      = $rootScope.$new();
                    $log.context = function() { return $log; };

                    $scope.AppCtrl = AppCtrl;

                    RumbleCtrl = _$controller('RumbleController', {
                        $scope: $scope,
                        $log: $log
                    });

                }]);
            });
            describe('initialization',function(){
                it('has proper dependencies',function(){
                    expect(RumbleCtrl).toBeDefined();
                    expect($scope.deviceProfile).toBe(AppCtrl.profile);
                    
                    expect($scope.playList.length)
                        .toEqual(AppCtrl.experience.data.playList.length);
                    expect($scope.currentIndex).toEqual(0);
                    expect($scope.currentItem.id).toEqual(playList[0].id);
                    expect($scope.currentItem.caption).toEqual(playList[0].caption);
                    expect($scope.currentItem.note).toEqual(playList[0].note);
                    expect($scope.currentItem.voting).toEqual(playList[0].voting);
                    expect($scope.currentItem.video.player).toEqual(playList[0].video.player);
                    expect($scope.currentItem.video.videoid).toEqual(playList[0].video.videoid);
                    expect($scope.currentItem.state.vote).toEqual(-1);
                    expect($scope.currentItem.state.viewed).toEqual(false);
                    expect($scope.atHead).toEqual(true);
                    expect($scope.atTail).toEqual(false);
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
            describe('navigation',function(){
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

//                it('can move forward',function(){
//                    AppCtrl.goto = jasmine.createSpy('app.goto');
//                    RumbleCtrl.goForward();
//                    expect(AppCtrl.goto).toHaveBeenCalledWith('experience.video',{ item : 1 });
//                });
//
//                it('can go back', function(){
//                    $window.history = {
//                        back : jasmine.createSpy('window.history.back')
//                    };
//                    RumbleCtrl.goBack();
//                    expect($window.history.back).toHaveBeenCalled();
//
//                });

                it('handles moving forward',function(){
                    $scope.currentIndex = 1;
                    $scope.currentItem  = $scope.playList[1];
                    RumbleCtrl.goForward();
//                    $scope.$emit('newVideo',2);
//                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(2);
                    expect($scope.currentItem).toBe($scope.playList[2]);
                    expect($scope.atHead).toEqual(false);
                    expect($scope.atTail).toEqual(true);
                });
                
                it('handles moving backward',function(){
                    $scope.currentIndex = 1;
                    $scope.currentItem  = $scope.playList[1];
                    RumbleCtrl.goBack();
//                    $scope.$emit('newVideo',0);
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(0);
                    expect($scope.currentItem).toBe($scope.playList[0]);
                    expect($scope.atHead).toEqual(true);
                    expect($scope.atTail).toEqual(false);
                });
            });
            describe('videoEnded event',function(){
                it('sets the viewed to true',function(){
                    expect($scope.currentItem.state).toEqual({ vote: -1, viewed: false });
                    $scope.$emit('videoEnded',playList[0].video.player,playList[0].video.videoid);
                    $scope.$digest();
                    expect($scope.currentItem.state).toEqual({ vote: -1, viewed: true });
                });
            });
        });
    });
}());

