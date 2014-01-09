(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('youtube',['$log','$window','c6EventEmitter','iframe',
        function($log,$window,c6EventEmitter,iframe){
        $log = $log.context('youtube');
        var service = {};

        service.origin = 'https://www.youtube.com';
        service.formatPlayerSrc = function(videoId,params){
            var src = this.origin + '/embed/' + videoId + '?enablejsapi=1';

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
                    $log.info('STATE:',event.data);
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
            }

            return new YoutubePlayer($playerElement,playerId,$window);
        };

        return service;

    }])
    .directive('youtubePlayer',['$log','$window','$timeout','youtube','_default','playerInterface',
        function($log,$window,$timeout,youtube,_default,playerInterface){
        $log = $log.context('youtubePlayer');
        function fnLink(scope,$element,$attr){
            if (!$attr.videoid){
                throw new SyntaxError('youtubePlayer requires the videoid attribute to be set.');
            }
            
            var player, playerIface  = playerInterface(),
                playerIsReady = false;/*, playerHasLoaded = false;*/
            
            $log.info('link: videoId=%1, start=%2, end=%3',
                $attr.videoid, $attr.start, $attr.end);

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

            playerIface.reset = function(){
                /*
                if (!playerIsReady){
                    return;
                }
                setStartListener();
                setEndListener();
                */
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

            scope.$on('playVideo',function(event,data){
                if (data.player === 'youtube' && data.videoid === $attr.videoid){
                    $log.info('[%1] on.PlayVideo: %2, %3',player,data.player,data.videoid);
                    player.play();
                } else {
                    player.pause();
                    var videoStart = parseInt($attr.start,10);
                    if (!isNaN(videoStart)){
                        player.seekTo(videoStart);
                    }
                }
            });

            function createPlayer(){
                var videoStart = parseInt($attr.start,10),
                    videoEnd = parseInt($attr.end,10),
                    vparams     = { }, twerking = false;

                ['controls','rel','modestbranding','autoplay','enablejsapi']
                .forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                player = youtube.createPlayer($attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element);

                scope.$emit('createdPlayer',player);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p );

                    if (parseInt($attr.twerk,10)){
                        $log.info('[%1] - start twerk',p);
                        player.setPlaybackQuality('hd720');
                        player.play();
                        player.on('playing',function(p){
                            var self = this;
                            $log.info('[%1] - stop twerk',p);
                            twerking = false;
                            player.pause();
                            $timeout(function(){
                                $log.info('[%1] - remoteListenr',p);
                                player.removeListener('playing',self);
                            });
                        });
                    }

                    player.on('ended',function(p){
                        $log.info('[%1] - I am finished',p);
                        scope.$emit('videoEnded','youtube',$attr.videoid);
                        if ($attr.regenerate){
                            player.destroy();
                            $timeout(createPlayer);
                        }
                    });

                    if (!isNaN(videoStart)){
                        player.on('playing',function(/*p*/){
                            if (player.getCurrentTime() < videoStart){
                                player.seekTo(videoStart);
                            }
                        });
                    }

                    if (!isNaN(videoEnd)){
                        player.on('playing',function(/*p*/){
                            if (player.getCurrentTime() >= videoEnd){
                                return;
                            }
                            var i = $window.setInterval(function(){
                                if (!player.isPlaying()){
                                    $window.clearInterval(i);
                                    return;
                                }

                                if (player.getCurrentTime() >= videoEnd){
                                    player.pause();
                                    $timeout(function(){
                                        $timeout(function(){
                                            player.emit('ended',player);
                                        });
                                    });
                                }
                            },1000);
                        });
                    }
                });
            }

            $timeout(createPlayer);
        }

        return {
            restrict : 'E',
            link     : fnLink
        };
    }]);
}());
