/* jshint camelcase: false */
(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('vimeo',['$log','$window','$q','c6EventEmitter','iframe',
        function($log,$window,$q,c6EventEmitter,iframe){
        $log = $log.context('vimeo');
        var service = {};

        service.origin = 'http://player.vimeo.com';
        service.formatPlayerSrc = function(videoId,playerId,params){
            var src = this.origin + '/video/' + videoId + '?api=1' +
                (playerId ? ('&player_id=' + playerId) : '');

            if (params){
                for (var name in params){
                    src += '&' + name.toLowerCase() + '=' + params[name];
                }
            }

            return src;
        };

        service.createPlayer = function(playerId,config,$parentElement) {
            var $playerElement,src,params;
            if (!$parentElement){
                throw new Error('Parent element is required for vimeo.createPlayer');
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

            function VimeoPlayer(iframe$,playerId,$win){
                var _iframe$ = iframe$,_playerId = playerId,
                    _url =  _iframe$.attr('src').split('?')[0],
                    _val = 'VimeoPlayer#' + _playerId,
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

                self.setVolume = function(vol){
                    return self.post('setVolume',vol);
                };

                self.getVolumeAsync = function(){
                    var deferred = $q.defer();
                    self.post('getVolume');
                    getPromises('getVolume').push(deferred);
                    return deferred.promise;
                };

                self.getDurationAsync = function(){
                    var deferred = $q.defer();
                    self.post('getDuration');
                    getPromises('getDuration').push(deferred);
                    return deferred.promise;
                };

                self.getCurrentTimeAsync = function(){
                    var deferred = $q.defer();
                    self.post('getCurrentTime');
                    getPromises('getCurrentTime').push(deferred);
                    return deferred.promise;
                };

                self.getPausedAsync = function(){
                    var deferred = $q.defer();
                    self.post('paused');
                    getPromises('paused').push(deferred);
                    return deferred.promise;
                };

                self.post = function(action, value){
                    var data = { method : action };
                    if (value){
                        data.value = value;
                    }

                    _iframe$[0].contentWindow.postMessage(angular.toJson(data), _url);
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
                    self.post('seekTo',seconds);
                };

                self.on('newListener',function(eventName){
                    // ready does not need a listener
                    if ( (eventName !== 'ready') &&
                         (eventName !== 'newListener') &&
                         (eventName !== 'removeListener') ) {
                        self.post('addEventListener',eventName);
                    }
                });

                self.toString = function() {
                    return _val;
                };

                function onMessageReceived(event){
                    if (event.origin !== service.origin) {
                        return;
                    }

//                    $log.info('[%1] - messageReceived: [%2]',_playerId, event.data);
                    var data = angular.fromJson(event.data), deferreds, deferred;

                    if (data.player_id !== _playerId){
                        return;
                    }

                    if (data.method){
                        deferreds = getPromises(data.method);
                        while((deferred = deferreds.shift())){
                            deferred.resolve(data);
                        }
                        return;
                    }

                    self.emit(data.event,self,data.data);
                }

                $win.addEventListener('message', onMessageReceived, false);

                $log.info('[%1] - created',_playerId);
            }

            return new VimeoPlayer($playerElement,playerId,$window);
        };

        return service;
    }])
    .directive('vimeoCard',['$log','$timeout','$q','vimeo','_default','numberify','playerInterface','c6UrlMaker','c6Profile',
    function               ( $log , $timeout , $q , vimeo , _default , numberify , playerInterface , c6UrlMaker , c6Profile ) {
        $log = $log.context('<vimeo-card>');
        function fnLink(scope,$element,$attr){
            if (!$attr.videoid){
                throw new SyntaxError('<vimeo-card> requires the videoid attribute to be set.');
            }
            
            $log.info('link: videoId=%1, start=%2, end=%3, autoPlay=%4',
                $attr.videoid, $attr.start, $attr.end, $attr.autoplay);

            var player, playerIface  = playerInterface(),
                playerIsReady = false, playerHasLoaded = false,
                _playerIface = {
                    currentTime: 0,
                    ended: false,
                    twerked: false,
                    duration: NaN,
                    paused: true
                },
                start = numberify($attr.start, 0), end = numberify($attr.end, Infinity);

            function handlePlayProgress(player, data) {
                var time = _playerIface.currentTime = data.seconds;

                playerIface.emit('timeupdate', playerIface);

                if (time >= end){
                    player.pause();
                    $log.info('[%1] - emit ended',player);
                    player.emit('finish',player);
                    return;
                }

                if (time < start) {
                    $log.info('Seeking to start time');
                    player.seekTo(start);
                }
            }

            function playListener(player) {
                _playerIface.paused = false;
                playerIface.emit('play', playerIface);

                if (playerIface.ended) {
                    _playerIface.ended = false;
                    player.seekTo(start);
                }
            }

            function pauseListener() {
                _playerIface.paused = true;
                playerIface.emit('pause', playerIface);
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

                if (playerIface.twerked) {
                    deferred.reject(new Error('Player has already been twerked'));
                    return deferred.promise;
                }

                player.removeListener('playProgress', handlePlayProgress);
                player.removeListener('play', playListener);
                player.removeListener('pause', pauseListener);

                player.once('playProgress',playingListener);

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
                    .then(function() {
                        _playerIface.twerked = true;
                    })
                    .finally(function() {
                        player.on('playProgress', handlePlayProgress);
                        player.on('play', playListener);
                        player.on('pause', pauseListener);
                    });

                return deferred.promise;
            }

            /* -- playerInterface : begin -- */

            playerIface.getType = function () {
                return 'vimeo';
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
                currentTime: {
                    get: function() {
                        if (!playerIsReady) { return 0; }

                        return Math.max((_playerIface.currentTime - start), 0);
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
                        player.getDurationAsync().then(function(duration) {
                            _playerIface.duration = duration;
                        });

                        return (($attr.end || _playerIface.duration) - ($attr.start || 0)) || NaN;
                    }
                },
                paused: {
                    get: function() {
                        return _playerIface.paused;
                    }
                }
            });

            scope.$emit('playerAdd',playerIface);

            /* -- playerInterface : end -- */

            _default($attr,'badge',0);
            _default($attr,'portrait',0);

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
                var vparams  = { };

                ['badge','byline','portrait','title'].forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                playerIsReady = false;
                player = vimeo.createPlayer('vm_' + $attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element.find('.mr-player'));

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p);

                    $timeout(function() {
                        playerIsReady = true;
                        player.on('playProgress', handlePlayProgress);
                        playerIface.emit('ready',playerIface);

                        scope.$watch('onDeck', function(onDeck) {
                            if (onDeck) {
                                if (numberify($attr.twerk, 0)) {
                                    playerIface.twerk(5000);
                                }
                            }
                        });
                    });

                    player.on('finish',function(p){
                        $log.info('[%1] - I am finished',p);

                        _playerIface.ended = true;
                        playerIface.emit('ended',playerIface);

                        if ($attr.regenerate){
                            regeneratePlayer();
                        }
                    });

                    player.on('play', playListener);
                    player.on('pause', pauseListener);
                });
            }

            scope.$watch('active', function(active, wasActive) {
                if (active === wasActive) { return; }

                if (active) {
                    if (numberify($attr.autoplay, 0)) {
                        if (!playerIsReady) {
                            $log.warn('Player cannot autoplay because it is not ready.');
                            return;
                        }

                        player.play();
                    }
                } else {
                    player.pause();
                }
            });

            regeneratePlayer();
        }

        return {
            restrict    : 'E',
            link        : fnLink,
            controller  : 'VimeoCardController',
            controllerAs: 'Ctrl',
            templateUrl : c6UrlMaker('views/directives/video_embed_card' +
                                    ((c6Profile.device === 'phone') ? '--mobile' : '') +
                                    '.html')
        };
    }])
    .controller('VimeoCardController', ['$scope','ModuleService','ControlsService','EventService','c6Computed',
    function                           ( $scope , ModuleService , ControlsService , EventService , c6Computed ) {
        var config = $scope.config,
            _data = config._data = config._data || {
                playerEvents: {},
                modules: {
                    ballot: {
                        active: false,
                        vote: null
                    },
                    displayAd: {
                        active: false
                    }
                }
            },
            targetPlays = 0;

        c6Computed($scope)(this, 'videoUrl', function() {
            var id = $scope.config.data.videoid;

            return ('http://vimeo.com/' + id);
        }, ['config.data.videoid']);

        Object.defineProperties(this, {
            flyAway: {
                get: function() {
                    return ($scope.config._data.modules.ballot.active || !$scope.active) && this.hasModule('ballot');
                }
            }
        });

        this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

        this.dismissBallot = function() {
            targetPlays = _data.playerEvents.play.emitCount;
        };

        $scope.$on('playerAdd', function(event, player) {
            _data.playerEvents = EventService.trackEvents(player, ['play']);

            player.once('play', function() {
                _data.modules.displayAd.active = true;
            });

            Object.defineProperty(_data.modules.ballot, 'active', {
                get: function() {
                    var playing = (!player.paused && !player.ended),
                        voted = angular.isNumber(_data.modules.ballot.vote),
                        hasPlayed = _data.playerEvents.play.emitCount > targetPlays;

                    return !voted && !playing && hasPlayed && $scope.active;
                }
            });

            $scope.$watch('active', function(active) {
                if (active) {
                    ControlsService.bindTo(player);
                }
            });
        });
    }]);
}());
