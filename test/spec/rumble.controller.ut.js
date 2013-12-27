(function(){
    'use strict';
    define(['rumble'], function() {
        describe('RumbleController', function() {
            var $rootScope,
                $scope,
                $window,
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

                inject(['$rootScope','$log','$window','$controller',
                    function(_$rootScope,  _$log, _$window, _$controller) {
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
                    expect($scope.userProfile).toBe(AppCtrl.profile);
                    
                    expect($scope.playList).toBe(AppCtrl.experience.data.playList);
                    expect($scope.currentIndex).toEqual(0);
                    expect($scope.currentItem).toEqual(playList[0]);

                    expect($scope.voteList).toBeDefined();
                    expect($scope.voteList.length).toEqual(3);
                    expect($scope.currentVote).toBe($scope.voteList[0]);
                });
            });
            describe('findItemByVideo',function(){
                it('returns an item if it can find one',function(){
                    expect(RumbleCtrl.findItemByVideo('youtube','vid1video')).toBe(playList[0]);
                });
                it('returns undefined if it cannot find one',function(){
                    expect(RumbleCtrl.findItemByVideo('x','y')).not.toBeDefined();
                });
            });
            describe('findVoteForItem',function(){
                it('returns a valid item',function(){
                    expect(RumbleCtrl.findVoteForItem(playList[1]))
                        .toBe($scope.voteList[1]);
                });
                it('returns vote from a valid item id',function(){
                    expect(RumbleCtrl.findVoteForItem(playList[1].id))
                        .toBe($scope.voteList[1]);
                });
                it('returns undefined with an invalid id',function(){
                    expect(RumbleCtrl.findVoteForItem('xx')).not.toBeDefined();
                });
            });
            describe('navigation',function(){
                it('can move forward',function(){
                    AppCtrl.goto = jasmine.createSpy('app.goto');
                    RumbleCtrl.goForward();
                    expect(AppCtrl.goto).toHaveBeenCalledWith('experience.video',{ item : 1 });
                });

                it('can go back', function(){
                    $window.history = {
                        back : jasmine.createSpy('window.history.back')
                    };
                    RumbleCtrl.goBack();
                    expect($window.history.back).toHaveBeenCalled();

                });

                it('handles newVideo event moving forward',function(){
                    $scope.currentIndex = 1;
                    $scope.currentItem  = playList[1];
                    $scope.$emit('newVideo',2);
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(2);
                    expect($scope.currentItem).toBe(playList[2]);
                    expect($scope.currentVote).toBe($scope.voteList[2]);
                    expect($scope.voteList[2].id).toEqual(playList[2].id);
                });
                
                it('handles newVideo event moving backward',function(){
                    $scope.currentIndex = 1;
                    $scope.currentItem  = playList[1];
                    $scope.$emit('newVideo',0);
                    $scope.$digest();
                    expect($scope.currentIndex).toEqual(0);
                    expect($scope.currentItem).toBe(playList[0]);
                    expect($scope.currentVote).toBe($scope.voteList[0]);
                    expect($scope.voteList[0].id).toEqual(playList[0].id);
                });
            });
            describe('videoEnded event',function(){
                it('sets the viewed to true',function(){
                    expect($scope.currentVote).toBe($scope.voteList[0]);
                    expect($scope.currentVote.viewed).toEqual(false);
                    $scope.$emit('videoEnded',playList[0].video.player,playList[0].video.videoid);
                    $scope.$digest();
                    expect($scope.currentVote.viewed).toEqual(true);
                });
            });
        });
    });
}());

