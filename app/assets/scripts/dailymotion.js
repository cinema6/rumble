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
    .directive('dailymotionPlayer',['$log','$timeout','dailymotion','_default',
        function($log,$timeout,dailymotion,_default){
        $log = $log.context('dailymotionPlayer');
        function fnLink(scope,$element,$attr){
            var player;
            $log.info('link: videoId=%1, start=%2, end=%3, autoPlay=%4',
                $attr.videoid, $attr.start, $attr.end, $attr.autoplay);
            
            _default($attr,'autoplay'   ,1);
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


            function createPlayer(){
                var vparams  = { };

                ['startscreen','related','html','info','autoplay'].forEach(function(prop){
                    if ($attr[prop] !== undefined) {
                        vparams[prop] = $attr[prop];
                    }
                });

                player = dailymotion.createPlayer('dm-' + $attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    frameborder : 0,
                    params      : vparams
                },$element);

                player.on('ready',function(p){
                    $log.info('[%1] - I am ready',p);

                    player.on('ended',function(p){
                        $log.info('[%1] - I am finished',p);
                        if ($attr.regenerate){
                            player.destroy();
                            $timeout(createPlayer);
                        }
                    });

                });
            }

            $timeout(createPlayer);

            scope.$on('$destroy',function(){
                if (player){
                    //player.destroy();
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
