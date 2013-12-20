/* jshint -W106 */
(function(){
    'use strict';

    angular.module('c6.rumble')
    .directive('dailymotionPlayer',['$log','$timeout',function($log,$timeout){
        $log = $log.context('dailymotionPlayer');
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
