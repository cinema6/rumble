(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('dailymotion',['$log','$window','$q','c6EventEmitter','iframe',
        function($log,$window,$q,c6EventEmitter,iframe){
        $log = $log.context('dailymotion');
        var service = {};

        service.origin = 'http://www.dailymotion.com';
        service.formatPlayerSrc = function(videoId,playerId,params){
            var src = this.origin + '/embed/video/' + videoId + '?api=postMessage' +
                (playerId ? ('&id=' + playerId) : '');

            if (params){
                for (var name in params){
                    src += '&' + name.toLowerCase() + '=' + params[name];
                }
            }

            return src;
        };

        service.parseEventData = function(qstring){
            var result;
            if (qstring){
                qstring.split('&').forEach(function(fragment){
                    var nvp = fragment.split('=');
                    if (nvp){
                        if (!result) {
                            result = {};
                        }
                        result[nvp[0]] = nvp[1];
                    }
                });
            }
            return result;
        };

        service.createPlayer = function(playerId,config,$parentElement) {
            var $playerElement,src,params;
            if (!$parentElement){
                throw new Error('Parent element is required for dailymotion.createPlayer');
            }

            src = this.formatPlayerSrc(config.videoId, playerId, config.params);
            params = {
                width       : config.width,
                height      : config.height
            };

            if (config.frameborder !== undefined){
                params.frameborder = config.frameborder;
            }
            $playerElement = angular.element(iframe.create(playerId,src,params));
            
            $parentElement.append($playerElement);

            function DailymotionPlayer(iframe$,playerId,$win){
                var _iframe$ = iframe$,_playerId = playerId,
                    _url =  _iframe$.attr('src').split('?')[0],
                    _val = 'DailymotionPlayer#' + _playerId,
                    _promises = {},
                    self = this;

                c6EventEmitter(self);

                function getPromises(id){
                    if (!id){
                        return _promises;
                    }

                    if (!_promises[id]){
                        _promises[id] = [];
                    }

                    return _promises[id];
                }

                self.getPlayerId = function(){
                    return _playerId;
                };

                self.getUrl = function(){
                    return _url;
                };

                self.getIframe = function(){
                    return _iframe$;
                };

                self.play = function(){
                    return self.post('play');
                };

                self.pause = function(){
                    return self.post('pause');
                };

                self.post = function(action, value){
                    var data = action;
                    if (value){
                        data += '=' + value;
                    }

                    _iframe$[0].contentWindow.postMessage(data, _url);
                    return self;
                };

                self.destroy = function(){
                    var err, deferred;
                    _iframe$.remove();
                    $win.removeEventListener('message',onMessageReceived,false);
                    for (var id in _promises){
                        err = new Error('Player destroyed, cannot resolve ' + id);
                        while ( (deferred = _promises[id].shift()) ){
                            deferred.reject(err);
                        }
                    }
                    $log.info('[%1] - destroyed',_playerId);
                };

                self.setSize = function(w,h){
                    _iframe$.css({
                        width : w,
                        height: h
                    });
                };

                self.seekTo = function(seconds){
                    self.post('seek',seconds);
                };

                self.toString = function() {
                    return _val;
                };

                function onMessageReceived(event){
                    if (event.origin !== service.origin) {
                        return;
                    }

//                    $log.info('[%1] - messageReceived: [%2]',_playerId, event.data);
                    var data = service.parseEventData(event.data), deferreds, deferred;

                    if (data.id !== _playerId){
                        return;
                    }

                    if (data.method){
                        deferreds = getPromises(data.method);
                        while((deferred = deferreds.shift())){
                            deferred.resolve(data);
                        }
                        return;
                    }

                    if (data.event === 'apiready'){
                        data.event = 'ready';
                    }

                    self.emit(data.event,self,data);
                }

                $win.addEventListener('message', onMessageReceived, false);

                $log.info('[%1] - created',_playerId);
            }

            return new DailymotionPlayer($playerElement,playerId,$window);
        };

        return service;
    }])
    .directive('dailymotionPlayer',
        ['$log','$timeout','$q','c6UserAgent','dailymotion','_default','numberify','playerInterface',
        function($log,$timeout,$q,c6UserAgent,dailymotion,_default,numberify,playerInterface){
        $log = $log.context('dailymotionPlayer');
        function fnLink(scope,$element,$attr){
            if (!$attr.videoid){
                throw new SyntaxError('dailymotionPlayer requires the videoid attribute to be set.');
            }
            var player, playerIface  = playerInterface(),
                playerIsReady = false, playerHasLoaded = false;

            $log.info('link: videoId=%1, start=%2, end=%3, autoPlay=%4',
                $attr.videoid, $attr.start, $attr.end, $attr.autoplay);
            
            function endListener(p,data){
                if (data.seconds >= numberify($attr.end,0)){
                    player.pause();
                    $timeout(function(){
                        player.post('removeEventListener','playing');
                        player.removeListener('playing',endListener);
                        player.emit('ended',player);
                    });
                }
            }

            function setEndListener(){
                if (numberify($attr.end,0) > 0){
                    player.removeListener('playing',endListener);
                    player.on('playing',endListener);
                }
            }

            function setStartListener(){
                var videoStart = numberify($attr.start,0);
                if (playerHasLoaded){
                    player.seekTo(videoStart);
                    return;
                }
                player.once('playing',function(){
                    if (videoStart > 0){
                        player.seekTo(videoStart);
                    }
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
                        player.pause();
                        player.removeListener('playing',playingListener);
                        deferred.reject(new Error('Player twerk timed out'));
                    },wait);
                }
                
                $log.info('[%1] - start twerk, wait=%2',player,wait);
                player.play();

                return deferred.promise;
            }

            /* -- playerInterface : begin -- */

            playerIface.getType = function () {
                return 'dailymotion';
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
                setEndListener();
            };

            scope.$emit('playerAdd',playerIface);
            
            scope.$on('$destroy',function(){
                scope.$emit('playerRemove',playerIface);
                if (player){
                    //player.destroy();
                }
            });

            /* -- playerInterface : end -- */
            
            _default($attr,'related'    ,0);

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

            scope.$on('playVideo',function(event,data){
                if (data.player === 'dailymotion' && data.videoid === $attr.videoid){
                    $log.info('[%1] on.PlayVideo: %2, %3',player,data.player,data.videoid);
                    player.play();
                } else {
                    player.pause();
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
                var vparams  = { };
                playerIsReady = false;
                playerHasLoaded = false;

                ['startscreen','related','html','info','autoplay'].forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                // Twerking and FireFox
                if (c6UserAgent.app.name === 'firefox'){
                    $attr.twerk = 0;
                }

                if (numberify($attr.twerk)){
                    vparams.html = '1';
                }

                player = dailymotion.createPlayer('dm_' + $attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element);

                scope.$emit('createdPlayer',player);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p);
                    
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
                        scope.$emit('videoEnded','dailymotion',$attr.videoid);
                        if (numberify($attr.regenerate)){
                            regeneratePlayer();
                        }
                    });
                });
            }

            regeneratePlayer();
        }

        return {
            restrict : 'E',
            link     : fnLink,
            scope    : {
                width   : '@',
                height  : '@',
                videoid : '@'
            }
        };
    }]);

}());
