/*global TweenMax, TimelineMax, $, Cubic */
(function(){
    'use strict';
    angular.module('c6.rumble')
        .animation('.mr-overlay', [function() {
            var aniIntro,
                mrOverlay,
                mrExperience,
                mrPagerGroup,
                mrPagesScroller;
            return {
                beforeRemoveClass : function(element,className,done) {
                    mrOverlay       = $('.mr-overlay');
                    mrExperience    = $('.mr-experience');
                    mrPagerGroup    = $('.mr-pager__group');
                    mrPagesScroller = $('.mr-pages__scroller');
                    //prep animation states
                    TweenMax.set(mrOverlay, {
                        opacity: 0
                    });
                    TweenMax.set(mrExperience, {
                        scaleX: 0.5,
                        scaleY: 0.5,
                        opacity: 0
                    });
                    TweenMax.set(mrPagerGroup, {
                        opacity: 0
                    });
                    TweenMax.set(mrPagesScroller, {
                        y: 40,
                        opacity: 0
                    });
                    done();
                },
                removeClass: function(element,className,done) {
                    aniIntro        = new TimelineMax({paused:true, onComplete:function(){
                            done();
                        }
                    });
                    
                    //define animation
                    aniIntro.add(TweenMax.to(mrOverlay, 0.3, {
                        opacity: 1
                    }));
                    aniIntro.add(TweenMax.to(mrExperience, 0.5, {
                        scaleX: 1,
                        scaleY: 1,
                        opacity: 1,
                        ease:Cubic.easeOut
                    }), '-=0.3');
                    aniIntro.add(TweenMax.to(mrPagerGroup, 0.3 , {
                        opacity: 1
                    }), '+=0.1');
                    aniIntro.add(TweenMax.to(mrPagesScroller, 0.3, {
                        y:0,
                        opacity: 1,
                        ease:Cubic.easeOut
                    }));
                    aniIntro.play();
                }
            };
        }])
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