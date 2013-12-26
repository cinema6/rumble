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
                timeline.to(element, 2, { opacity: 0 });
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
    .controller('RumbleController',['$log','$scope',function($log,$scope){
        $log = $log.context('RumbleCtrl');
        var theApp = $scope.AppCtrl;

        $scope.userProfile  = theApp.profile;
        $scope.playList     = theApp.experience.data.playList;
        $scope.currentIndex = theApp.currentItem;
        $scope.currentVideo = $scope.playList[$scope.AppCtrl.currentItem];

        $scope.$on('newVideo',function(event,newVal){
            $log.info('newVideo index:',newVal);
            $scope.currentVideo = $scope.playList[newVal];
            $scope.currentIndex = newVal;
        });

        $log.log('Rumble Controller is initialized!',$scope.playList);
    }])
    .directive('rumblePlayer',['$log','$compile','$window',function($log,$compile,$window){
        $log = $log.context('rumblePlayer');
        function fnLink(scope,$element,$attr){
            $log.info('link:',scope);

            function resize(event,noDigest){
                var pw = Math.round($window.innerWidth * 0.75),
                    ph = Math.round(pw * 0.5625);
                $element.css({
                    width : pw,
                    height: ph
                });
                scope.playerWidth   = pw;
                scope.playerHeight  = ph;
                if(!noDigest){
                    scope.$digest();
                }
            }

            var inner = '<' + scope.config.player + '-player';
            for (var key in scope.config){
                if ((key !== 'player') && (scope.config.hasOwnProperty(key))){
                    inner += ' ' + key.toLowerCase() + '="' + scope.config[key] + '"';
                }
            }

            inner += ' width="{{playerWidth}}" height="{{playerHeight}}"';
            inner += ' autoplay="' + $attr.autoplay + '"';
            
            if (!scope.profile.inlineVideo){
                $log.info('Will need to regenerate the player');
                inner += ' regenerate="1"';
            }

            inner += '></'  + scope.config.player + '-player' + '>';
            $log.info('INNER:',inner);

            var player$ = $compile(inner)(scope);
            $element.append(player$);

            $window.addEventListener('resize',resize);
            resize({},true);
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
