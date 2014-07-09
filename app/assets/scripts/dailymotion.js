(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('dailymotion',['$log','$window','$q','c6EventEmitter','iframe','c6UrlMaker',
    function               ( $log , $window , $q , c6EventEmitter , iframe , c6UrlMaker ) {
        $log = $log.context('dailymotion');
        var service = {};

        service.origin = c6UrlMaker('www.dailymotion.com', 'protocol');
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
            
            $parentElement.prepend($playerElement);

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
    .directive('dailymotionCard', ['$log','$timeout','$q','c6UserAgent','dailymotion','_default','numberify','playerInterface','c6UrlMaker','assetFilter',
    function                      ( $log , $timeout , $q , c6UserAgent , dailymotion , _default , numberify , playerInterface , c6UrlMaker , assetFilter ) {
        $log = $log.context('<dailymotion-card>');
        function fnLink(scope,$element,$attr){
            if (!$attr.videoid){
                throw new SyntaxError('<dailymotion-card> requires the videoid attribute to be set.');
            }
            var player, playerIface  = playerInterface(),
                _playerIface = {
                    currentTime: 0,
                    ended: false,
                    duration: NaN,
                    paused: true
                },
                playerIsReady = false, playerHasLoaded = false;

            $log.info('link: videoId=%1, start=%2, end=%3, autoPlay=%4',
                $attr.videoid, $attr.start, $attr.end, $attr.autoplay);

            function handleTimeUpdate(player, data) {
                _playerIface.currentTime = parseFloat(data.time);

                playerIface.emit('timeupdate', playerIface);
            }

            function twerk() {
                /*var deferred = $q.defer(), waitTimer,
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

                return deferred.promise;*/
                var deferred = $q.defer();

                deferred.reject(new Error('DailyMotion ain\'t ratchet enough for twerking.'));

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

            Object.defineProperties(playerIface, {
                webHref: {
                    get: function() {
                        return ('http://www.dailymotion.com/video/' + $attr.videoid);
                    }
                },
                currentTime: {
                    get: function() {
                        if (!playerIsReady) { return 0; }

                        return _playerIface.currentTime;
                    },
                    set: function(time) {
                        if (!playerIsReady) {
                            throw new Error('Cannot set currentTime! Player is not yet ready.');
                        }

                        player.seekTo(time);
                    }
                },
                ended: {
                    get: function() {
                        return _playerIface.ended;
                    }
                },
                twerked: {
                    get: function() {
                        return false;
                    }
                },
                duration: {
                    get: function() {
                        return _playerIface.duration;
                    }
                },
                paused: {
                    get: function() {
                        return _playerIface.paused;
                    }
                }
            });

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

                ['startscreen','related','html','info'].forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                player = dailymotion.createPlayer('dm_' + $attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element.find('.mr-player'));

                scope.$emit('createdPlayer',player);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p);

                    $timeout(function() {
                        playerIsReady = true;

                        player.on('timeupdate', handleTimeUpdate);
                        player.on('pause', function() {
                            _playerIface.paused = true;
                            playerIface.emit('pause', playerIface);
                        });

                        playerIface.emit('ready',playerIface);
                    });

                    player.on('ended',function(p){
                        $log.info('[%1] - I am finished',p);

                        _playerIface.ended = true;
                        playerIface.emit('ended',playerIface);

                        if (numberify($attr.regenerate)){
                            regeneratePlayer();
                        }
                    });

                    player.on('playing', function(p) {
                        _playerIface.paused = false;
                        playerIface.emit('play', playerIface);

                        if (playerIface.ended) {
                            _playerIface.ended = false;
                            p.seekTo(0);
                        }
                    });

                    player.on('durationchange', function(player, data) {
                        _playerIface.duration = parseFloat(data.duration);
                    });
                });
            }

            scope.$watch('active', function(active, wasActive) {
                if (active === wasActive) { return; }

                if (!active) {
                    regeneratePlayer();
                }
            });

            regeneratePlayer();
        }

        return {
            restrict : 'E',
            link     : fnLink,
            controller  : 'VideoEmbedCardController',
            controllerAs: 'Ctrl',
            templateUrl : assetFilter('directives/video_embed_card.html', 'views')
        };
    }]);
}());
