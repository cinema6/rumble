/* jshint -W106 */
(function(){
    'use strict';

    angular.module('c6.rumble')
    .animation('videoView-enter', ['$log', 'c6AniCache', function($log, aniCache) {
        $log = $log.context('videoView-enter');
        return aniCache({
            id : 'videoView-enter',
            setup: function(element) {
                $log.log('setup');
                var timeline        = new TimelineLite({paused:true});

                //reset states
                element.css({ opacity : 0, visibility : 'hidden' });
                timeline.to(element, 2, { opacity: 1, visibility: 'visible' });
                return timeline;
            },
            start: function(element, done, timeline) {
                $log.info('start');
                timeline.eventCallback('onComplete',function(){
                    $log.info('end');
                    done();
                });
                timeline.play();
            }
        });
    }])
    .animation('videoView-leave', ['$log', 'c6AniCache', function($log, aniCache) {
        $log = $log.context('videoView-leave');
        return aniCache({
            id : 'videoView-leave',
            setup: function(element) {
                $log.log('setup');
                var timeline        = new TimelineLite({paused:true});

                //reset states
                element.css({ opacity : 1, visibility : 'visible' });
                timeline.to(element, 2, { opacity: 0, visibility: 'hidden' });
                return timeline;
            },
            start: function(element, done, timeline) {
                $log.info('start');
                timeline.eventCallback('onComplete',function(){
                    $log.info('end');
                    done();
                });
                timeline.play();
            }
        });
    }])
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
                    width       : $attr.width,
                    height      : $attr.height,
                    playerVars  : {
                        autoplay        : 1,
                        start           : $attr.start,
                        end             : $attr.end,
                        controls        : 0,
                        modestbranding  : 1,
                        rel             : 0
                    },
                    videoId: $attr.videoid,
                    events: {
                        'onApiChange'   : onApiChange,
                        'onError'       : onError,
                        'onReady'       : onPlayerReady,
                        'onStateChange' : onPlayerStateChange
                    }
                });
            }

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

            $timeout(function(){
                player = createPlayer();
            },250);
        }

        return {
            restrict : 'E',
            link     : fnLink
        };
    }])
    .directive('rumblePlayer',['$log','$compile','$window',function($log,$compile,$window){
        $log = $log.context('rumblePlayer');
        function fnLink(scope,$element,$attr){
            $log.info('link:',scope.config);
            $log.info('width: %1',$element.css('width'));

            var inner = '<' + scope.config.player + '-player';
            for (var key in scope.config){
                if ((key !== 'player') && (scope.config.hasOwnProperty(key))){
                    inner += ' ' + key.toLowerCase() + '="' + scope.config[key] + '"';
                }
            }
            scope.playerWidth  = $element.css('width').replace(/px/,'');
            scope.playerHeight = $element.css('height').replace(/px/,'');

            inner += ' width="{{playerWidth}}" height="{{playerHeight}}"';

            inner += '></'  + scope.config.player + '-player' + '>';
            var player$ = $compile(inner)(scope);
            $element.append(player$);

            $window.addEventListener('resize',function(event){
                scope.playerWidth   = $element.css('width').replace(/px/,'');
                scope.playerHeight  = $element.css('height').replace(/px/,'');
                scope.$digest();
            });
        }

        return {
            restrict : 'E',
            link     : fnLink,
            scope    : {
                config  : '='
            }
        };

    }]);


}());
