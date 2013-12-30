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
    .factory('rumbleVotes',['$log','$q','$timeout',function($log,$q,$timeout){
        $log = $log.context('rumbleVotes');
        var service = {}, mocks = {};

        service.mockReturnsData = function(rumbleId,itemId,votes, delay){
            $log.warn('Setting Mock Data');
            if (mocks[rumbleId] === undefined){
                mocks[rumbleId] = {};
            }

            if (delay === undefined){
                delay = 1000;
            }

            mocks[rumbleId][itemId] = {
                'votes' : votes,
                'delay' : delay
            };

            return this;
        };

        service.getReturnsForItem = function(rumbleId, itemId){
            var deferred = $q.defer(), mock;
            if (mocks[rumbleId] === undefined){
                $timeout(function(){
                    deferred.reject(
                        new Error('Unable to locate rumble [' + rumbleId + ']')
                    );
                },250);
                return deferred.promise;
            }
            
            if (mocks[rumbleId][itemId] === undefined){
                $timeout(function(){
                    deferred.reject(
                        new Error('Unable to locate item [' + itemId + ']')
                    );
                },250);
                return deferred.promise;
            }
            
            mock = mocks[rumbleId][itemId];
            $timeout(function(){
                deferred.resolve(mock.votes);
            }, mock.delay);

            return deferred.promise;
        };

        return service;
    }])
    .controller('RumbleController',['$log','$scope','$window','rumbleVotes',
        function($log,$scope,$window,rumbleVotes){
        $log = $log.context('RumbleCtrl');
        var theApp  = $scope.AppCtrl,
            self    = this;

        $scope.deviceProfile    = theApp.profile;
        $scope.ballot           = theApp.experience.data.ballot;
        $scope.rumbleId         = theApp.experience.data.rumbleId;
        
        $scope.playList         = [];
        $scope.currentIndex     = null;
        $scope.currentItem      = null;
        $scope.atHead           = null;
        $scope.atTail           = null;
        $scope.currentReturns   = null;
        
        theApp.experience.data.playList.forEach(function(item){
            var newItem = angular.copy(item);
            newItem.state = {
                viewed : false,
                vote   : -1
            };
            $scope.playList.push(newItem);
            //TODO: remove this when the service works for real
            rumbleVotes.mockReturnsData($scope.rumbleId,item.id,item.voting);
        });

        $scope.$on('newVideo',function(event,newVal){
            $log.info('newVideo index:',newVal);
            self.setPosition(newVal);
        });

        $scope.$on('videoEnded',function(event,player,videoId){
            $log.log('Video %1::%2 has ended!',player,videoId);
            if ((player === $scope.currentItem.video.player) &&
                (videoId === $scope.currentItem.video.videoid)){
                $scope.$apply(function(){
                    $scope.currentItem.state.viewed = true;
                });
            }
        });

        this.vote = function(v){
            $scope.currentItem.state.vote = v;
        };

        this.getVotePercent = function(votes,index){
            var tally = 0;
            votes.forEach(function(v){
                tally += v;
            });
            
            if (index === undefined){
                return votes.map(function(v){
                    return (tally < 1) ? 0 : Math.round((v / tally)* 100) / 100;
                });
            }

            if ((tally < 1) || (votes[index] === undefined)){
                return 0;
            }

            return Math.round((votes[index] / tally)* 100) / 100;
        };

        this.setPosition = function(i){
            $scope.currentReturns = null;
            $scope.currentIndex   = i;
            $scope.currentItem    = $scope.playList[$scope.currentIndex];
            $scope.atHead         = $scope.currentIndex === 0;
            $scope.atTail         = $scope.currentIndex === ($scope.playList.length -1);
            rumbleVotes.getReturnsForItem($scope.rumbleId,$scope.currentItem.id)
                .then(
                    function onVotes(votes){
                        $log.info('getReturns returned with: ',votes);
                        $scope.currentReturns = self.getVotePercent(votes);
                    },
                    function onErr(err){
                        $log.error('getReturnsErr: %1',err.message);
                    }
                );
        };
        
        this.goBack = function(){
            $window.history.back();
        };

        this.goForward = function(){
            theApp.goto('experience.video',{item : ($scope.currentIndex + 1) });
        };

        $scope.RumbleCtrl = this;

        this.setPosition(theApp.currentIndex);

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
