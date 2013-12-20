/* jshint -W106 */
(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('vimeo',['$log','$window','$document','iframe',
        function($log,$window,$document,iframe){
        $log = $log.context('vimeo');
        var service = {};

        service.formatPlayerSrc = function(videoId,playerId,params){
            var src = 'http://player.vimeo.com/video/' + videoId + '?api=1' + 
                (playerId ? ('&player_id=' + playerId) : '');

            if (params){
                for (var name in params){
                    src += '&' + name.toLowerCase() + '=' + params[name];
                }
            }

            return src;
        };

        service.createPlayer = function(playerId,config) {
            var oldElt$ = $document[0].getElementById(playerId),newElt$,src, player;
            if (oldElt$ === null){
                throw new Error('Invalid tag id: ' + playerId);
            }
            
            src = this.formatPlayerSrc(config.videoId, playerId, config.params);

            newElt$ = angular.element(iframe.create(playerId,src,{
                width   : config.width,
                height  : config.height
            }));

            angular.element(oldElt$).replaceWith(newElt$[0]);

            function VimeoPlayer(iframe$,playerId){
                var _iframe$ = iframe$,_playerId = playerId,
                    self = this;

                self.getPlayerId = function(){
                    return _playerId;
                };

                self.getIframe = function(){
                    return _iframe$;
                };

                self.destroy = function(){
                    _iframe$.remove();
                };

                self.setSize = function(w,h){
                    _iframe$.css({
                        width : w,
                        height: h
                    });
                };
            }

            return new VimeoPlayer(newElt$,playerId);
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
            $attr.$observe('width',function(newWidth){
                if (player){
                    player.setSize($attr.width, $attr.height);
                }
            });

            $attr.$observe('height',function(newWidth){
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
        }

        return {
            restrict : 'E',
            link     : fnLink
        };
    }]);
}());
