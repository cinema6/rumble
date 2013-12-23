(function(){
    'use strict';

    angular.module('c6.rumble')
    .animation('videoView-enter', ['$log', 'c6AniCache','gsap',
        function($log, aniCache, gsap) {
        $log = $log.context('videoView-enter');
        return aniCache({
            id : 'videoView-enter',
            setup: function(element) {
                $log.log('setup');
                var timeline        = new gsap.TimelineLite({paused:true});

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
    .animation('videoView-leave', ['$log', 'c6AniCache','gsap',
        function($log, aniCache, gsap) {
        $log = $log.context('videoView-leave');
        return aniCache({
            id : 'videoView-leave',
            setup: function(element) {
                $log.log('setup');
                var timeline        = new gsap.TimelineLite({paused:true});

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
    .directive('rumblePlayer',['$log','$compile','$window',function($log,$compile,$window){
        $log = $log.context('rumblePlayer');
        function fnLink(scope,$element/*,$attr*/){
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
            
            if (!scope.profile.inlineVideo){
                $log.info('Will need to regenerate the player');
                inner += ' regenerate="1"';
            }

            inner += '></'  + scope.config.player + '-player' + '>';
            var player$ = $compile(inner)(scope);
            $element.append(player$);

            $window.addEventListener('resize',function(){
                scope.playerWidth   = $element.css('width').replace(/px/,'');
                scope.playerHeight  = $element.css('height').replace(/px/,'');
                scope.$digest();
            });
        }

        return {
            restrict : 'E',
            link     : fnLink,
            scope    : {
                config  : '=',
                profile : '='
            }
        };

    }]);


}());
