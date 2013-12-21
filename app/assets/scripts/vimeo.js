/* jshint camelcase: false */
(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('vimeo',['$log','$window','$document','c6EventEmitter','iframe',
        function($log,$window,$document,c6EventEmitter,iframe){
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

        service.createPlayer = function(playerId,config) {
            var oldElt$ = $document[0].getElementById(playerId),newElt$,src;
            if (oldElt$ === null){
                throw new Error('Invalid tag id: ' + playerId);
            }

            src = this.formatPlayerSrc(config.videoId, playerId, config.params);

            newElt$ = angular.element(iframe.create(playerId,src,{
                width   : config.width,
                height  : config.height
            }));

            angular.element(oldElt$).replaceWith(newElt$[0]);

            function VimeoPlayer(iframe$,playerId,$win){
                var _iframe$ = iframe$,_playerId = playerId,
                    _url =  _iframe$.attr('src').split('?')[0],
                    self = this;

                c6EventEmitter(self);

                self.getPlayerId = function(){
                    return _playerId;
                };

                self.getUrl = function(){
                    return _url;
                };

                self.getIframe = function(){
                    return _iframe$;
                };

                self.post = function(action, value){
                    var data = { method : action };
                    if (value){
                        data.value = value;
                    }

                    _iframe$[0].contentWindow.postMessage(angular.toJson(data), _url);
                };

                self.destroy = function(){
                    _iframe$.remove();
                    $win.removeEventListener('message',onMessageReceived,false);
                    $log.info('[%1] - destroyed',_playerId);
                };

                self.setSize = function(w,h){
                    _iframe$.css({
                        width : w,
                        height: h
                    });
                };

                self.on('newListener',function(eventName){
                    self.post('addEventListener',eventName);
                });

                function onMessageReceived(event){
                    if (event.origin !== service.origin) {
                        return;
                    }

                    $log.info('[%1] - messageReceived: [%2]',_playerId, event.data);
                    var data = angular.fromJson(event.data);

                    if (data.player_id !== _playerId){
                        return;
                    }

                    self.emit(data.event,self);
                }

                $win.addEventListener('message', onMessageReceived, false);

                $log.info('[%1] - created',_playerId);
            }

            return new VimeoPlayer(newElt$,playerId,$window);
        };

        return service;
    }])
    .directive('vimeoPlayer',['$log','$timeout','vimeo',function($log,$timeout,vimeo){
        $log = $log.context('vimeoPlayer');
        function fnLink(scope,$element,$attr){
            var player;
            $log.info('link: videoId=%1, start=%2, end=%3',
                $attr.videoid, $attr.start, $attr.end);
            $element.append(angular.element('<div id="' + $attr.videoid + '"> </div>'));
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
                return vimeo.createPlayer($attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    params  : {
                        autoplay        : 1
                    }/*,
                    events: {
                        'onApiChange'   : onApiChange,
                        'onError'       : onError,
                        'onReady'       : onPlayerReady,
                        'onStateChange' : onPlayerStateChange
                    }*/
                });
            }

            $timeout(function(){
                player = createPlayer();
            },250);

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
