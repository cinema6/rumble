/*global TweenMax, TimelineMax, $, Cubic */
(function(){
    'use strict';
    var isFirstSlide        = true;
    angular.module('c6.rumble')
        .animation('.mr-overlay', [function() {
            var aniIntro,
                mrOverlay,
                mrExperience,
                mrPagerGroup,
                mrPagesScroller;
            return {
                beforeRemoveClass : function(element,className,done) {
                    isFirstSlide    = true;
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
                    var introEnd    = function() {
                        isFirstSlide    = false;
                        done();
                    };
                    aniIntro        = new TimelineMax({paused:true, onComplete:introEnd()});
                    
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
                beforeAddClass: function(element,className,done) {
                    //element.css({ 'opacity' : 1, 'visibility' : 'visible' });
                    if(isFirstSlide === true) {
                        TweenMax.set(element, {
                            opacity: 1
                        });
                        done();
                    } else {
                        $log.log('addClass setup:',className);
                        TweenMax.set(element, {
                            opacity: 1
                        });
                        $log.info('addClass start',className);
                        TweenMax.to(element, 0.3 , {
                            opacity: 0
                        });
                        done();
                    }
                    
                    /*element.animate({
                        opacity: 0
                    }, 1, function() {
                        $log.info('addClass end',className);
                        element.css({'visibility' : 'hidden'});
                        done();
                    });*/
                },
                removeClass: function(element,className,done) {
                    
                    //element.css({ 'opacity' : 0, 'visibility' : 'visible' });
                    if(isFirstSlide === true) {
                        TweenMax.set(element, {
                            opacity: 1
                        });
                        done();
                    } else {
                        $log.log('removeClass setup:',className);
                        TweenMax.set(element, {
                            opacity: 0
                        });
                        $log.info('removeClass start',className);
                        TweenMax.to(element, 0.3 , {
                            opacity: 1
                        });
                        done();
                    }
                        
                    /*element.delay(50).animate({
                        opacity: 1
                    }, 400, function() {
                        $log.info('removeClass end',className);
                        done();
                    });*/
                }
            };
        }])
        .animation('.mr-ballot-module', ['$log', function($log) {
            $log = $log.context('.mr-ballot-module');
            return {
                beforeAddClass: function(element,className,done) {
                    $log.log('addClass setup:',className);
                    //element.css({opacity: 1, 'visibility': 'visible'});

                    $log.info('addClass start',className);
                    /* element.delay(250).animate({
                        opacity: 0
                    }, 750, function() {
                        $log.info('addClass end',className);
                        element.css('visibility','hidden');
                        done();
                    });*/
                    done();
                },
                removeClass: function(element,className,done) {
                    $log.log('removeClass setup:', className);
                    //element.css({opacity: 0, 'visibility':'visible'});

                    $log.info('removeClass start',className);
                    /* element.animate({
                        opacity: 1
                    }, 750, function() {
                        $log.info('removeClass end', className);
                        done();
                    }); */
                    done();
                }
            };
        }]);
}());