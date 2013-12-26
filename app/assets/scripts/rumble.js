(function(){
    'use strict';

    angular.module('c6.rumble')
    .animation('videoView-enter', ['$log', 'c6AniCache','gsap',
        function($log, aniCache, gsap) {
        $log = $log.context('videoView-enter');
        return aniCache({
            id : 'videoView-enter',
            setup: function(element) {
                $log.log('setup');
                var timeline        = new gsap.TimelineLite({paused:true});

                //reset states
                element.css({ opacity : 0, visibility : 'hidden' });
                timeline.to(element, 2, { opacity: 1, visibility: 'visible' });
                return timeline;
            },
            start: function(element, done, timeline) {
                $log.info('start');
                timeline.eventCallback('onComplete',function(){
                    $log.info('end');
                    done();
                });
                timeline.play();
            }
        });
    }])
    .animation('videoView-leave', ['$log', 'c6AniCache','gsap',
        function($log, aniCache, gsap) {
        $log = $log.context('videoView-leave');
        return aniCache({
            id : 'videoView-leave',
            setup: function(element) {
                $log.log('setup');
                var timeline        = new gsap.TimelineLite({paused:true});

                //reset states
                element.css({ opacity : 1, visibility : 'visible' });
                timeline.to(element, 2, { opacity: 0 });
                return timeline;
            },
            start: function(element, done, timeline) {
                $log.info('start');
                timeline.eventCallback('onComplete',function(){
                    $log.info('end');
                    done();
                });
                timeline.play();
            }
        });
    }])
    .controller('RumbleController',['$log','$scope','$window',function($log,$scope,$window){
        $log = $log.context('RumbleCtrl');
        var theApp = $scope.AppCtrl, self = this;

        $scope.userProfile  = theApp.profile;
        $scope.playList     = theApp.experience.data.playList;
        $scope.ballot       = theApp.experience.data.ballot;

        $scope.currentIndex = theApp.currentIndex;
        $scope.currentItem  = $scope.playList[$scope.currentIndex];

        $scope.userHistory  = [];
        $scope.playList.forEach(function(item){
            $scope.userHistory.push({
                id      : item.id,
                viewed  : false,
                vote    : -1
            });
        });

        $scope.$on('newVideo',function(event,newVal){
            $log.info('newVideo index:',newVal);
            $scope.currentItem = $scope.playList[newVal];
            $scope.currentIndex = newVal;
        });

        $scope.$on('videoEnded',function(event,player,videoId){
            $log.log('Video %1::%2 has ended!',player,videoId);
            var historyItem = self.findUserHistoryForItem(
                self.findItemByVideo(player,videoId)
            );
            if (!historyItem){
                $log.error('Unable to locate user history for %1::%2',player,videoId);
                return;
            }
            $scope.$apply(function(){
                historyItem.viewed = true;
            });
        });

        this.vote = function(v){
            $scope.userHistory[$scope.currentIndex].vote = v;
            console.log('HISTORY:',$scope.userHistory);
        };

        this.findUserHistoryForItem = function(item){
            var userHistory = $scope.userHistory, result;
            if (!angular.isString(item)){
                item = item.id;
            }
            userHistory.some(function(history){
                if (history.id === item){
                    result = history;
                    return true;
                }
            });
            return result;
        };
        this.findItemByVideo = function(player,videoId){
            var playList = $scope.playList, result;
            playList.some(function(item){
                if ((item.video.player === player) && (item.video.videoid === videoId)){
                    result = item;
                    return true;
                }
            });
            return result;
        };

        this.goBack = function(){
            $window.history.back();
        };

        this.goForward = function(){
            theApp.goto('experience.video',{item : ($scope.currentIndex + 1) });
        };

        $scope.RumbleCtrl = this;

        $log.log('Rumble Controller is initialized!',$scope.playList);
    }])
    .directive('rumblePlayer',['$log','$compile','$window',function($log,$compile,$window){
        $log = $log.context('rumblePlayer');
        function fnLink(scope,$element,$attr){
            $log.info('link:',scope);

            function resize(event,noDigest){
                var pw = Math.round($window.innerWidth * 0.75),
                    ph = Math.round(pw * 0.5625);
                $element.css({
                    width : pw,
                    height: ph
                });
                scope.playerWidth   = pw;
                scope.playerHeight  = ph;
                if(!noDigest){
                    scope.$digest();
                }
            }

            var inner = '<' + scope.config.player + '-player';
            for (var key in scope.config){
                if ((key !== 'player') && (scope.config.hasOwnProperty(key))){
                    inner += ' ' + key.toLowerCase() + '="' + scope.config[key] + '"';
                }
            }

            inner += ' width="{{playerWidth}}" height="{{playerHeight}}"';
            inner += ' autoplay="' + $attr.autoplay + '"';
            
            if (!scope.profile.inlineVideo){
                $log.info('Will need to regenerate the player');
                inner += ' regenerate="1"';
            }

            inner += '></'  + scope.config.player + '-player' + '>';

            var player$ = $compile(inner)(scope);
            $element.append(player$);

            $window.addEventListener('resize',resize);
            resize({},true);
        }

        return {
            restrict : 'E',
            link     : fnLink,
            scope    : {
                config  : '=',
                profile : '='
            }
        };

    }]);


}());
