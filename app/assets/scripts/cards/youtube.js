define (['angular','c6uilib','iframe','youtube'],
function( angular , c6uilib , iframe , youtube ) {
    'use strict';

    return angular.module('c6.rumble.cards.youtube', [c6uilib.name, iframe.name])
    .factory('youtube',['$log','c6EventEmitter','iframe',
    function           ( $log , c6EventEmitter , iframe ){
        $log = $log.context('youtube');
        var service = {};

        service.origin = 'https://www.youtube.com';
        service.formatPlayerSrc = function(videoId,params){
            var src = this.origin + '/embed/' + videoId + '?html5=1&wmode=opaque';

            if (params){
                for (var name in params){
                    src += '&' + name.toLowerCase() + '=' + params[name];
                }
            }

            return src;
        };

        service.createPlayer = function(playerId,config,$parentElement){
            var $playerElement,src,
                params = {};
            if (!$parentElement){
                throw new Error('Parent element is required for youtube.createPlayer');
            }

            src = this.formatPlayerSrc(config.videoId, config.params);

            if (config.frameborder !== undefined){
                params.frameborder = config.frameborder;
            }
            $playerElement = angular.element(iframe.create(playerId,src,params));

            $parentElement.prepend($playerElement);

            function YoutubePlayer(iframe$,playerId,YT){
                var _iframe$ = iframe$,_playerId = playerId,
                    _val = 'YoutubePlayer#' + _playerId,
                    _readyHandler,_stateChangeHandler,_errorHandler, _player, self = this;
                c6EventEmitter(self);

                _readyHandler = function(){
                    self.emit('ready',self);
                };

                _stateChangeHandler = function(event){
                    $log.info('[%1] STATE:%2',_playerId,event.data);
                    var PlayerState = YT.PlayerState;
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

                $log.info('API ready. Creating player: %1', playerId);
                _player = new YT.Player(playerId, {
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
                    return (_player.getPlayerState() === YT.PlayerState.PLAYING);
                };

                self.getDuration = function() {
                    return _player.getDuration();
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
            return new YoutubePlayer($playerElement,playerId,youtube);
        };

        return service;

    }])
    .directive('youtubeCard',['$log','$window','$timeout','$interval','$q','youtube','_default','playerInterface','numberify',
    function                 ( $log , $window , $timeout , $interval , $q , youtube , _default , playerInterface , numberify ){
        $log = $log.context('<youtube-card>');
        function fnLink(scope,$element,$attr){
            if (!$attr.videoid){
                throw new SyntaxError('<youtube-card> requires the videoid attribute to be set.');
            }

            var player, playerIface  = playerInterface(),
                _playerIface = {
                    ended: false,
                    twerked: false,
                    paused: true
                },
                playerIsReady = false, playerHasLoaded = false,
                currentTimeInterval, lastNotifiedCurrentTime = 0,
                start = numberify($attr.start, 0), end = numberify($attr.end, Infinity);

            $log.info('link: videoId=%1, start=%2, end=%3',
                $attr.videoid, $attr.start, $attr.end);

            function pollCurrentTime() {
                currentTimeInterval = $interval(function() {
                    var currentTime = player.getCurrentTime(),
                        isPlaying = player.isPlaying();

                    if (currentTime !== lastNotifiedCurrentTime) {
                        playerIface.emit('timeupdate', playerIface);
                        lastNotifiedCurrentTime = currentTime;
                    }

                    if ((currentTime >= end) && isPlaying){
                        player.pause();
                        $log.info('[%1] - emit ended',player);
                        player.emit('ended',player);
                        return;
                    }

                    if (isPlaying && currentTime < start) {
                        $log.info('Seeking to start time');
                        player.seekTo(start);
                    }
                }, 500);
            }

            function playListener(player) {
                _playerIface.paused = false;
                playerIface.emit('play', playerIface);

                if (playerIface.ended) {
                    player.seekTo(start);
                    _playerIface.ended = false;
                }
            }

            function pauseListener() {
                _playerIface.paused = true;
                playerIface.emit('pause', playerIface);
            }

            function twerk(wait){
                var deferred = $q.defer(), waitTimer,
                playingListener = function(){
                    $log.info('[%1] - Got playing event, stop twerk.',player);
                    if (waitTimer){
                        $timeout.cancel(waitTimer);
                    }

                    player.once('paused', function() {
                        deferred.resolve(playerIface);
                    });
                    player.pause();
                };

                if (playerIface.twerked) {
                    deferred.reject(new Error('Player has already been twerked'));
                    return deferred.promise;
                }

                $interval.cancel(currentTimeInterval);
                $log.info('[%1] - temporarily removing listeners during twerk.',player);
                player.removeListener('playing', playListener);
                player.removeListener('paused', pauseListener);

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

                deferred.promise
                    .then(function setTwerkedTrue() {
                        $log.info(
                            '[%1] - Twerk was a success! Playing: %2',
                            player,
                            player.isPlaying()
                        );
                        _playerIface.twerked = true;
                    }, function logErrors(reason) {
                        $log.error(
                            '[%1] - twerk failed (%2). Video is playing: %3',
                            player,
                            reason,
                            player.isPlaying()
                        );
                    })
                    .finally(function() {
                        pollCurrentTime();
                        $log.info('[%1] - restoring listeners after twerk.',player);
                        player.on('playing', playListener);
                        player.on('paused', pauseListener);
                    });

                return deferred.promise;
            }

            /* -- playerInterface : begin -- */

            playerIface.getType = function() {
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

            Object.defineProperties(playerIface, {
                webHref: {
                    get: function() {
                        return 'https://www.youtube.com/watch?v=' + $attr.videoid;
                    }
                },
                currentTime: {
                    get: function() {
                        if (!playerIsReady) { return 0; }

                        return Math.max((player.getCurrentTime() - start), 0);
                    },
                    set: function(time) {
                        if (!playerIsReady) {
                            throw new Error('Cannot set currentTime! Player is not yet ready.');
                        }

                        player.seekTo(Math.max((time + start), start));
                    }
                },
                ended: {
                    get: function() {
                        return _playerIface.ended;
                    }
                },
                twerked: {
                    get: function() {
                        return _playerIface.twerked;
                    }
                },
                duration: {
                    get: function() {
                        return (($attr.end || player.getDuration()) - ($attr.start || 0)) || NaN;
                    }
                },
                paused: {
                    get: function() {
                        return _playerIface.paused;
                    }
                }
            });

            scope.$emit('playerAdd', playerIface);

            /* -- playerInterface : end -- */

            _default($attr,'enablejsapi'    ,1);
            _default($attr,'rel'            ,0);
            _default($attr,'modestbranding' ,1);

            scope.$on('$destroy',function(){
                if (currentTimeInterval) {
                    $interval.cancel(currentTimeInterval);
                }

                scope.$emit('playerRemove',playerIface);
                if (player){
                    //player.destroy();
                }
            });

            function regeneratePlayer(){
                if (currentTimeInterval) {
                    $interval.cancel(currentTimeInterval);
                }

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

                ['controls','rel','modestbranding','enablejsapi']
                .forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                playerIsReady = false;
                player = youtube.createPlayer('yt_' + scope.config.id,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element.find('.js-playerBox'));

                scope.$emit('createdPlayer',player);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p );

                    $timeout(function() {
                        playerIsReady = true;
                        playerIface.emit('ready',playerIface);
                        pollCurrentTime();

                        scope.$watch('onDeck', function(onDeck) {
                            if (onDeck) {
                                if (numberify($attr.twerk, 0)) {
                                    playerIface.twerk(5000);
                                }
                            }
                        });
                    });

                    player.on('ended',function(p){
                        $log.info('[%1] - I am finished',p);

                        _playerIface.ended = true;
                        playerIface.emit('ended',playerIface);

                        if ($attr.regenerate){
                            regeneratePlayer();
                        }
                    });

                    $log.info('[%1] - setting player listeners',p);
                    player.on('playing', playListener);
                    player.on('paused', pauseListener);
                });
            }

            scope.$on('<youtube-card>:viewLoaded', function($event) {
                $event.stopPropagation();

                regeneratePlayer();
            });
        }

        return {
            restrict    : 'E',
            link        : fnLink,
            controller  : 'VideoEmbedCardController',
            controllerAs: 'Ctrl',
            template: [
                '<ng-include src="config.templateUrl || (\'directives/video_embed_card.html\' | asset:\'views\')"',
                '    onload="$emit(\'<youtube-card>:viewLoaded\')">',
                '</ng-include>'
            ].join('\n')
        };
    }]);
});
