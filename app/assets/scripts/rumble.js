(function(){
    'use strict';

    angular.module('c6.rumble')
    .animation('.splash-screen',['$log','gsap',function($log,gsap){
        $log = $log.context('.splash-screen');
        return {
            beforeAddClass : function(element,className,done){
                if (className === 'ng-hide'){
                    var timeline = new gsap.TimelineLite({paused:true});
                    //timeline.to(element, 1, { left: (element.width() * -1) });
                    timeline.to(element, 1, { opacity: 0 });
                    timeline.eventCallback('onComplete',function(){
                        $log.info('addClass end',className);
                        done();
                    });
                    $log.info('addClass start',className);
                    timeline.play();
                }
            }
        };
    }])
    .animation('.player-list-item',['$log','gsap', function($log, gsap){
        $log = $log.context('.player-list-item');
        return {
            beforeAddClass: function(element,className,done) {
                $log.log('addClass setup:',className);
                var timeline = new gsap.TimelineLite({paused:true});
                element.css({ opacity : 1, visibility : 'visible' });
                timeline.to(element, 2, { opacity: 0 });
                timeline.eventCallback('onComplete',function(){
                    $log.info('addClass end',className);
                    element.css('visibility','hidden');
                    done();
                });
                $log.info('addClass start',className);
                timeline.play();
            },
            removeClass: function(element,className,done) {
                $log.log('removeClass setup:',className);
                var timeline = new gsap.TimelineLite({paused:true});
                element.css({ opacity : 0, visibility : 'visible' });
                timeline.to(element, 2, { opacity: 1 });
                timeline.eventCallback('onComplete',function(){
                    $log.info('removeClass end',className);
                    done();
                });
                $log.info('removeClass start',className);
                timeline.play();
            }
        };
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
    .controller('RumbleController',['$log','$scope','$timeout','$q','$window','c6UserAgent','appData','rumbleVotes','c6Computed',
        function($log,$scope,$timeout,$q,$window,c6UserAgent,appData,rumbleVotes,c){
        $log = $log.context('RumbleCtrl');
        var self    = this, readyTimeout;

        $scope.deviceProfile    = appData.profile;
        $scope.title            = appData.experience.title;
        $scope.ballot           = appData.experience.data.ballot;
        $scope.rumbleId         = appData.experience.data.rumbleId;

        $scope.playList         = [];
        $scope.players          = c($scope, function(index, playList) {
            return playList.slice(0, (index + 3));
        }, ['currentIndex', 'playList']);
        $scope.currentIndex     = -1;
        $scope.currentItem      = null;
        $scope.atHead           = null;
        $scope.atTail           = null;
        $scope.currentReturns   = null;
        $scope.ready            = false;

        appData.experience.data.playList.forEach(function(item){
            var newItem = angular.copy(item);
            newItem.player = null;
            newItem.state = {
                viewed  : false,
                twerked : false,
                vote    : -1
            };
            $scope.playList.push(newItem);
            //TODO: remove this when the service works for real
            rumbleVotes.mockReturnsData($scope.rumbleId,item.id,item.voting);
        });

        $scope.$on('playerAdd',function(event,player){
            $log.log('Player added: %1 - %2',player.getType(),player.getVideoId());
            var playListItem = self.findPlayListItemByVideo(player.getType(),player.getVideoId());

            if (!playListItem){
                $log.error('Unable to locate item for player.');
                return;
            }

            playListItem.player = player;

            player.on('ready',function(){
                $log.log('Player ready: %1 - %2',player.getType(),player.getVideoId());
                self.checkReady();
                player.removeListener('ready',this);

                if (playListItem === $scope.playList[0]){
                    self.twerkNext().then(null,function(e){
                        $log.warn(e.message);
                    });
                }
            });

            player.on('videoStarted',function(){
                $log.log('Player start detected: %1 - %2',player.getType(),player.getVideoId());
                if (playListItem === $scope.currentItem){
                    $log.log('Player start recorded: %1 - %2',player.getType(),player.getVideoId());
                    player.removeListener('videoStarted');
                    $timeout(function(){
                        playListItem.state.viewed = true;
                    });
                }
            });
        });
        
        this.findPlayListItemByVideo = function(videoType,videoId){
            var result;
            $scope.playList.some(function(item){
                if (item.video.player !== videoType){
                    return false;
                }

                if (item.video.videoid !== videoId){
                    return false;
                }

                result = item;
                return true;
            });

            return result;
        };

        this.checkReady = function(){
            if ($scope.ready){
                return;
            }

            var result = true;
            $scope.playList.some(function(item){
                if ((!item.player) || (!item.player.isReady())){
                    result = false;
                    return true;
                }
            });

            $scope.ready = result;

            if ($scope.ready){
                $timeout.cancel(readyTimeout);
            }
        };

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

        this.twerkNext = function(){
            var nextItem = $scope.playList[$scope.currentIndex + 1];
            if (!nextItem){
                return $q.reject(new Error('No next item to twerk.'));
            }
            
            if ((c6UserAgent.app.name !== 'chrome') &&
                (c6UserAgent.app.name !== 'firefox') &&
                (c6UserAgent.app.name !== 'safari')) {
                return $q.reject(
                    new Error('Twerking not supported on ' + c6UserAgent.app.name)
                );
            }
            
            if (!$scope.deviceProfile.multiPlayer){
                return $q.reject(new Error('Item cannot be twerked, device not multiplayer.'));
            }
            
            if (nextItem.player.getType() === 'dailymotion'){
                return $q.reject(new Error('Twerking not supported with DailyMotion.'));
            }
            
            if (nextItem.state.twerked){
                return $q.reject(new Error('Item is already twerked'));
            }
            
            nextItem.state.twerked = true;
            return nextItem.player.twerk(5000);
        };

        this.setPosition = function(i){
            $log.info('setPosition: %1',i);
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
            if ($scope.currentItem){
                $scope.currentItem.player.pause();
            }
            self.setPosition($scope.currentIndex - 1);
            $scope.currentItem.player.reset();
            if ($scope.deviceProfile.multiPlayer){
                $scope.currentItem.player.play();
            }
        };

        this.goForward = function(){
            if ($scope.currentItem){
                $scope.currentItem.player.pause();
            }
            self.setPosition($scope.currentIndex + 1);
            $scope.currentItem.player.reset();
            if ($scope.deviceProfile.multiPlayer){
                $scope.currentItem.player.play();
            }

            self.twerkNext().then(null,function(e){
                $log.warn(e.message);
            });
        };

        readyTimeout = $timeout(function(){
            $log.warn('Not all players are ready, but proceding anyway!');
            $scope.ready = true;
        });

        $log.log('Rumble Controller is initialized!');
    }])
    .directive('rumblePlayer',['$log','$compile','$window', function($log,$compile,$window){
        $log = $log.context('rumblePlayer');
        function fnLink(scope,$element,$attr){
            $log.info('link:',scope);
            function resize(event,noDigest){
                var pw = Math.round($window.innerWidth * 1),
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

            if ($attr.autoplay === undefined){
                $attr.autoplay = 0;
            }

            $attr.twerk = parseInt($attr.twerk,10);
            if (isNaN($attr.twerk)){
                $attr.twerk = 0;
            }
            if ($attr.twerk && !scope.profile.multiPlayer){
                $attr.twerk = 0;
            }

            var inner = '<' + scope.config.player + '-player';
            for (var key in scope.config){
                if ((key !== 'player') && (scope.config.hasOwnProperty(key))){
                    inner += ' ' + key.toLowerCase() + '="' + scope.config[key] + '"';
                }
            }

            inner += ' width="{{playerWidth}}" height="{{playerHeight}}"';
            inner += ' autoplay="' + $attr.autoplay + '"';
            inner += ' twerk="' + $attr.twerk + '"';
           
            if (!scope.profile.inlineVideo){
                $log.info('Will need to regenerate the player');
                inner += ' regenerate="1"';
            }

            inner += '></'  + scope.config.player + '-player' + '>';

            $element.append($compile(inner)(scope));

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
