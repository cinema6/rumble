(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('$yt',['$window',function($window){
        var service = {};

        service.isReady = function(){
            return (!!$window.YT);
        };

        service.createPlayer = function(name,params){
            if (!this.isReady()){
                throw new Error('You tube has not been initialized');
            }

            return new $window.YT.Player(name,params);
        };

        return function(){
            return service;
        };

    }])
    .directive('youtubePlayer',['$log','$timeout','$yt',function($log,$timeout,$yt){
        $log = $log.context('youtubePlayer');
        function fnLink(scope,$element,$attr){
            var player;
            $log.info('link: videoId=%1, start=%2, end=%3',
                $attr.videoid, $attr.start, $attr.end);
            $element.append(angular.element('<div id="' + $attr.videoid + '"> </div>'));

            function onPlayerReady(event){
                $log.info('onPlayerReady %1 - %2',$attr.id,event.data);
            }

            function onApiChange(event){
                $log.info('onApiChange %1 - %2',$attr.id,event.data);
            }

            function onError(event){
                $log.info('onError %1 - %2',$attr.id,event.data);
            }

            function onPlayerStateChange(event){
                $log.info('onPlayerStateChange %1 - %2',$attr.id,event.data);

                if (event.data === 0){
                    //var elt$ = angular.element(player.getIframe());
                    //elt$.css('display','none');
                    //player = createPlayer();
                }
            }

            function createPlayer(){
                return $yt().createPlayer($attr.videoid,{
                    videoId     : $attr.videoid,
                    width       : $attr.width,
                    height      : $attr.height,
                    playerVars  : {
                        autoplay        : 1,
                        start           : $attr.start,
                        end             : $attr.end,
                        controls        : 1,
                        modestbranding  : 1,
                        rel             : 0
                    },
                    events: {
                        'onApiChange'   : onApiChange,
                        'onError'       : onError,
                        'onReady'       : onPlayerReady,
                        'onStateChange' : onPlayerStateChange
                    }
                });
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
