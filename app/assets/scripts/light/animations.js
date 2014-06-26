/*global TweenMax */
(function(){
    'use strict';
    angular.module('c6.rumble')
        .animation('.mr-cards__item',['$log', function($log){
            $log = $log.context('.mr-cards__item');
            return {
                enter: function(element,done) {
                    $log.log('enter setup');
                    TweenMax.set(element, {
                        opacity: 0
                    });
                    $log.info('enter start');
                    TweenMax.to(element, 0.5, {
                        opacity: 1,
                        delay:0.6,
                        onComplete: done
                    });
                },
                leave: function(element,done) {
                    $log.log('enter setup');
                    TweenMax.set(element, {
                        opacity: 1
                    });
                    $log.info('enter start');
                    TweenMax.to(element, 0.5, {
                        opacity: 0,
                        delay:0.1,
                        onComplete: done
                    });
                },
                beforeAddClass: function(element,className,done) {
                    $log.log('beforeAddClass setup:',className);
                    TweenMax.set(element, {
                        opacity: 1
                    });
                    $log.info('beforeAddClass start',className);
                    TweenMax.to(element, 0.5, {
                        opacity: 0,
                        delay:0.1,
                        onComplete: done
                    });
                },
                removeClass: function(element,className,done) {
                    $log.log('removeClass setup:',className);
                    TweenMax.set(element, {
                        opacity: 0
                    });
                    $log.info('removeClass start',className);
                    TweenMax.to(element, 0.5, {
                        opacity: 1,
                        delay:0.6,
                        onComplete: done
                    });
                }
            };
        }])
        .animation('.mr-ballot-module', ['$log', function($log) {
            $log = $log.context('.mr-ballot-module');
            return {
                beforeAddClass: function(element,className,done) {
                    $log.log('beforeAddClass setup:',className);
                    TweenMax.set(element, {
                        opacity: 1
                    });
                    $log.info('beforeAddClass start',className);
                    TweenMax.to(element, 0.5, {
                        opacity: 0,
                        delay:0.1,
                        onComplete: done
                    });
                },
                removeClass: function(element,className,done) {
                    $log.log('removeClass setup:',className);
                    TweenMax.set(element, {
                        opacity: 0
                    });
                    $log.info('removeClass start',className);
                    TweenMax.to(element, 0.5, {
                        opacity: 1,
                        delay:0.6,
                        onComplete: done
                    });
                }
            };
        }]);
}());