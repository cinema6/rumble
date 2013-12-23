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
            
            $parentElement.append($playerElement);

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

                    $log.info('[%1] - messageReceived: [%2]',_playerId, event.data);
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
    .directive('vimeoPlayer',['$log','$timeout','vimeo',function($log,$timeout,vimeo){
        $log = $log.context('vimeoPlayer');
        function fnLink(scope,$element,$attr){
            var player;
            $log.info('link: videoId=%1, start=%2, end=%3, autoPlay=%4',
                $attr.videoid, $attr.start, $attr.end, $attr.autoplay);

            if ($attr.autoplay === undefined){
                $attr.autoplay = 0;
            }

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


            function createPlayer(){
                var videoStart = parseInt($attr.start,10),
                    videoEnd = parseInt($attr.end,10),
                    vparams  = { };

                ['badge','byline','portrait','title','autoplay'].forEach(function(prop){
                    if ($attr[prop]) {
                        vparams[prop] = $attr[prop];
                    }
                });

                player = vimeo.createPlayer($attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p);

                    player.on('finish',function(p){
                        $log.info('[%1] - I am finished',p);
                        if ($attr.regenerate){
                            player.destroy();
                            $timeout(createPlayer);
                        }
                    });

                    if (!isNaN(videoStart)){
                        player.once('loadProgress',function(p,data){
                            $log.info('[%1] - loaded %1 percent',data.percent);
                            player.seekTo($attr.start);
                            player.post('removeEventListener','loadProgress');
                        });
                    }

                    if (!isNaN(videoEnd)){
                        player.on('playProgress',function(p,data){
                            var self = this;
                            $log.info('[%1] - playProgress: %2 (%3)',p,data.seconds,data.percent);
                            if (data.seconds >= videoEnd){
                                player.pause();
                                $timeout(function(){
                                    player.post('removeEventListener','playProgress');
                                    player.removeListener('playProgress',self);
                                    $timeout(function(){
                                        player.emit('finish',player);
                                    });
                                });
                            }
                        });
                    }
                });
            }

            $timeout(createPlayer);

            scope.$on('$destroy',function(){
                if (player){
                    player.destroy();
                }
            });
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
