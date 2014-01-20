/* jshint camelcase: false */
(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('youtube',['$log','$window','c6EventEmitter','iframe',
        function($log,$window,c6EventEmitter,iframe){
        $log = $log.context('youtube');
        var service = {};

        service.origin = 'https://www.youtube.com';
        service.formatPlayerSrc = function(videoId,params){
            var src = this.origin + '/embed/' + videoId + '?html5=1';

            if (params){
                for (var name in params){
                    src += '&' + name.toLowerCase() + '=' + params[name];
                }
            }

            return src;
        };

        service.isReady = function(){
            return (!!$window.YT);
        };

        service.createPlayer = function(playerId,config,$parentElement){
            if (!this.isReady()){
                throw new Error('Youtube has not been initialized');
            }
            var $playerElement,src,params;
            if (!$parentElement){
                throw new Error('Parent element is required for youtube.createPlayer');
            }

            src = this.formatPlayerSrc(config.videoId, config.params);
            params = {
                width       : config.width,
                height      : config.height
            };

            if (config.frameborder !== undefined){
                params.frameborder = config.frameborder;
            }
            $playerElement = angular.element(iframe.create(playerId,src,params));

            $parentElement.append($playerElement);

            function YoutubePlayer(iframe$,playerId,$win){
                var _iframe$ = iframe$,_playerId = playerId,
                    _val = 'YoutubePlayer#' + _playerId,
                    _readyHandler,_stateChangeHandler,_errorHandler, _player, self = this;
                c6EventEmitter(self);

                _readyHandler = function(){
                    self.emit('ready',self);
                };

                _stateChangeHandler = function(event){
                    $log.info('[%1] STATE:%2',_playerId,event.data);
                    var PlayerState = $win.YT.PlayerState;
                    switch(event.data){
                        case PlayerState.ENDED:
                            {
                                self.emit('ended',self);
                                break;
                            }
                        case PlayerState.PLAYING:
                            {
                                self.emit('playing',self);
                                break;
                            }
                        case PlayerState.PAUSED:
                            {
                                self.emit('paused',self);
                                break;
                            }
                        case PlayerState.BUFFERING:
                            {
                                self.emit('buffering',self);
                                break;
                            }
                        case PlayerState.CUED:
                            {
                                self.emit('cueued',self);
                                break;
                            }
                    }
                };

                _errorHandler = function(event){
                    var err, msg;
                    switch(event.data){
                        case 2:
                            {
                                msg = 'Invalid request parameter.';
                                break;
                            }
                        case 5:
                            {
                                msg = 'HTML5 player error.';
                                break;
                            }
                        case 100:
                            {
                                msg = 'The video requested was not found.';
                                break;
                            }
                        case 101:
                        case 150:
                            {
                                msg = 'The owner of the requested video does not allow playback in embeded players.';
                                break;
                            }
                        default:
                            {
                                msg = 'Unknown error.';
                                break;
                            }
                    }

                    err = new Error(msg);
                    err.code = event.data;
                    self.emit('error',self,err);
                };

                _player = new $win.YT.Player(playerId, {
                    events: {
                        'onReady'       : _readyHandler,
                        'onStateChange' : _stateChangeHandler,
                        'onError'       : _errorHandler
                    }
                } );


                self.getPlayerId = function(){
                    return _playerId;
                };

                self.getIframe = function(){
                    return _iframe$;
                };

                self.setSize = function(w,h){
                    _player.setSize(w,h);
                    return self;
                };

                self.play = function(){
                    _player.playVideo();
                    return self;
                };

                self.pause = function(){
                    _player.pauseVideo();
                    return self;
                };

                self.setPlaybackQuality = function(quality){
                    _player.setPlaybackQuality(quality);
                };

                self.destroy = function(){
                    _player.destroy();
                    $log.info('[%1] - destroyed',_playerId);
                };

                self.getCurrentTime = function() {
                    return _player.getCurrentTime();
                };

                self.isPlaying = function(){
                    return (_player.getPlayerState() === $win.YT.PlayerState.PLAYING);
                };

                self.seekTo = function(seconds){
                    _player.seekTo(seconds,true);
                    return self;
                };

                self.toString = function() {
                    return _val;
                };
                
                $log.info('[%1] - created',_playerId);
/*                
                function onMessageReceived(event){
                    if (event.origin !== service.origin) {
                        return;
                    }
                    var data = angular.fromJson(event.data);

                    if (data.event === 'initialDelivery'){
                        if (data.info && data.info.videoData) {
                            if (data.info.videoData.video_id === _videoId){
                                _ytId = data.id;
                            }
                        }
                    }

                    if (data.id !== _ytId){
                        return;
                    }

                    $log.info('[%1] - messageReceived [%2]',_playerId,event.data );
                }
                
                $win.addEventListener('message', onMessageReceived, false);
*/
            }
            return new YoutubePlayer($playerElement,playerId,$window);
        };

        return service;

    }])
    .directive('youtubePlayer',['$log','$window','$timeout','$interval','$q','youtube','_default','playerInterface','numberify',
        function($log,$window,$timeout,$interval,$q,youtube,_default,playerInterface,numberify){
        $log = $log.context('youtubePlayer');
        function fnLink(scope,$element,$attr){
            if (!$attr.videoid){
                throw new SyntaxError('youtubePlayer requires the videoid attribute to be set.');
            }
            
            var player, playerIface  = playerInterface(),
                playerIsReady = false, playerHasLoaded = false,
                currentTimeInterval, lastNotifiedCurrentTime = 0;
            
            $log.info('link: videoId=%1, start=%2, end=%3',
                $attr.videoid, $attr.start, $attr.end);

            /*function endListener(p){
                $log.info('[%1] - endListener',p);
                var timeCheck = $interval(function(){
                    console.log(p.getCurrentTime());
                    if (p.getCurrentTime() >= numberify($attr.end,0)){
                        $interval.cancel(timeCheck);
                        p.pause();
                        $log.info('[%1] - emit ended',p);
                        p.emit('ended',p);
                        return;
                    }

                    if (!p.isPlaying()){
                        $interval.cancel(timeCheck);
                        return;
                    }

                },1000,0,false);
            }
            
            function setEndListener(){
                $log.info('[%1] - setEndListener',player);
                if (numberify($attr.end,0) > 0){
                    player.removeListener('playing',endListener);
                    player.on('playing',endListener);
                }
            }*/

            function pollCurrentTime() {
                currentTimeInterval = $interval(function() {
                    var currentTime = player.getCurrentTime();

                    if (currentTime !== lastNotifiedCurrentTime) {
                        playerIface.emit('timeupdate', playerIface);
                        lastNotifiedCurrentTime = currentTime;
                    }
                }, 300);
            }

            function setStartListener(){
                $log.info('[%1] - setStartListener',player);
                var videoStart = numberify($attr.start,0);
                if (playerHasLoaded){
                    player.seekTo(videoStart);
                    return;
                }
                $log.info('[%1] - setStartListener set once',player);
                player.once('playing',function(){
                    $log.info('[%1] - setStartListener at once',player);
                    if (player.getCurrentTime() < videoStart){
                        player.seekTo(videoStart);
                    }
                    $log.info('[%1] - setStartListener emit videoStarted',player);
                    playerIface.emit('videoStarted',playerIface);
                    playerHasLoaded = true;
                });
            }

            function twerk(wait){
                var deferred = $q.defer(), waitTimer,
                playingListener = function(){
                    $log.info('[%1] - stop twerk',player);
                    if (waitTimer){
                        $timeout.cancel(waitTimer);
                    }
                    player.pause();
                    deferred.resolve(playerIface);
                };

                player.once('playing',playingListener);

                if (wait === undefined){
                    wait = 1000;
                }
                
                if (wait){
                    waitTimer = $timeout(function(){
                        waitTimer = undefined;
                        deferred.reject(new Error('Player twerk timed out'));
                    },wait);
                }
                
                $log.info('[%1] - start twerk, wait=%2',player,wait);
                player.play();

                return deferred.promise;
            }

            /* -- playerInterface : begin -- */

            playerIface.getType = function () {
                return 'youtube';
            };

            playerIface.getVideoId = function() {
                return $attr.videoid;
            };

            playerIface.isReady = function() {
                return playerIsReady;
            };

            playerIface.play = function(){
                if (playerIsReady){
                    player.play();
                }
            };

            playerIface.pause = function(){
                if (playerIsReady){
                    player.pause();
                }
            };

            playerIface.twerk = function(wait){
                if (!playerIsReady){
                    return $q.reject(new Error('Player is not ready to twerk'));
                }
                return twerk(wait);
            };

            playerIface.reset = function(){
                if (!playerIsReady){
                    return;
                }
                setStartListener();
                pollCurrentTime();
            };

            scope.$emit('playerAdd',playerIface);

            /* -- playerInterface : end -- */

            _default($attr,'enablejsapi'    ,1);
            _default($attr,'rel'            ,0);
            _default($attr,'modestbranding' ,1);

            $attr.$observe('width',function(){
                if (player){
                    player.setSize($attr.width, $attr.height);
                }
            });

            $attr.$observe('height',function(){
                if (player){
                    player.setSize($attr.width, $attr.height);
                }
            });
            
            scope.$on('$destroy',function(){
                scope.$emit('playerRemove',playerIface);
                if (player){
                    //player.destroy();
                }
            });

            function regeneratePlayer(){
                if (player){
                    player.destroy();
                    player          = undefined;
                    playerHasLoaded = false;
                    playerIsReady   = false;
                }
                $timeout(createPlayer);
            }

            function createPlayer(){
                var vparams     = { };

                ['controls','rel','modestbranding','autoplay','enablejsapi']
                .forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                playerIsReady = false;
                player = youtube.createPlayer('yt_' + $attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element);

                scope.$emit('createdPlayer',player);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p );
                    
                    if (numberify($attr.twerk)){
                        twerk(0)
                            .catch( function (err){
                                $log.error('[%1] %2',p,err);
                            })
                            .finally( function(){
                                playerIsReady = true;
                                playerIface.emit('ready',playerIface);
                            });
                    } else {
                        $timeout(function(){
                            playerIsReady = true;
                            playerIface.emit('ready',playerIface);
                        });
                    }

                    player.on('ended',function(p){
                        $log.info('[%1] - I am finished',p);
                        playerIface.emit('videoEnded',playerIface);
                        if ($attr.regenerate){
                            regeneratePlayer();
                        }
                    });
                });
            }

            regeneratePlayer();
        }

        return {
            restrict : 'E',
            link     : fnLink
        };
    }]);
}());
