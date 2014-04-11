(function() {
    'use strict';

    define(['helpers/drag', 'editor'], function(helpers) {
        var TestFrame = helpers.TestFrame,
            Finger = helpers.Finger;

        describe('<video-trimmer>', function() {
            var $rootScope,
                $scope,
                $compile;

            var frame,
                $trimmer;

            beforeEach(function() {
                frame = new TestFrame();

                $([
                    '<style type="text/css">',
                    '    video-trimmer {',
                    '        display: block;',
                    '    }',
                    '        .video-trimmer__start-marker {',
                    '            position: relative;',
                    '            width: 0; height: 0;',
                    '            border-left: 1rem solid transparent; border-right: 1rem solid transparent;',
                    '            border-top: 1rem solid green;',
                    '            cursor: pointer;',
                    '        }',
                    '        .video-trimmer__seek-bar {',
                    '            height: 2rem;',
                    '            margin: 0 1rem;',
                    '            background: blue;',
                    '        }',
                    '            .video-trimmer__playhead {',
                    '                height: 100%; width: 10px;',
                    '                background: yellow;',
                    '            }',
                    '        .video-trimmer__end-marker {',
                    '            position: relative;',
                    '            width: 0; height: 0;',
                    '            border-left: 1rem solid transparent; border-right: 1rem solid transparent;',
                    '            border-bottom: 1rem solid red;',
                    '            cursor: pointer;',
                    '        }',
                    '</style>'
                ].join('\n'))
                    .appendTo(frame.$document.find('head'));

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });

                $scope.start = 10;
                $scope.end = 40;

                $trimmer = $('<video-trimmer start="start" end="end" duration="60"></video-trimmer>');
                frame.$body.append($trimmer);
                $scope.$apply(function() {
                    $compile($trimmer)($scope);
                });
            });

            afterEach(function() {
                frame.destroy();
            });

            describe('the start/end markers', function() {
                var $start, $end,
                    initial;

                function assertPosition($element, left, top) {
                    expect($element.css('left')).toBe(left + 'px');
                    expect($element.css('top')).toBe(top + 'px');
                }

                beforeEach(function() {
                    $start = $trimmer.find('#start-marker');
                    $end = $trimmer.find('#end-marker');

                    initial = {
                        start: {
                            top: $start.offset().top,
                            left: $start.offset().left
                        },
                        end: {
                            top: $end.offset().top,
                            left: $end.offset().left
                        }
                    };
                });

                it('should be draggable along the x axis', function() {
                    var finger = new Finger();

                    finger.placeOn($start);
                    finger.drag(0, 0);
                    assertPosition($start, initial.start.left, initial.start.top);

                    finger.drag(10, 5);
                    assertPosition($start, initial.start.left + 10, initial.start.top);

                    finger.drag(10, 5);
                    assertPosition($start, initial.start.left + 20, initial.start.top);
                    finger.lift();

                    finger.placeOn($end);
                    finger.drag(0, 0);
                    assertPosition($end, initial.end.left, initial.end.top);

                    finger.drag(10, 5);
                    assertPosition($end, initial.end.left + 10, initial.end.top);

                    finger.drag(10, 5);
                    assertPosition($end, initial.end.left + 20, initial.end.top);
                    finger.lift();
                });

                it('should not be able to move past the boundaries of the timeline', function() {
                    var finger = new Finger(),
                        $seek = $trimmer.find('.video-trimmer__seek-bar'),
                        seekZone = $seek.data('cDragZone');

                    // set the start/end time to 0 to make this easier
                    $scope.$apply(function() {
                        $scope.start = 0;
                        $scope.end = 0;
                    });
                    initial.start.top = $start.offset().top;
                    initial.start.left = $start.offset().left;
                    initial.end.top = $end.offset().top;
                    initial.end.left = $end.offset().left;

                    finger.placeOn($start);
                    finger.drag(10, 0);
                    assertPosition($start, initial.start.left + 10, initial.start.top);

                    finger.drag(-10);
                    assertPosition($start, initial.start.left, initial.start.top);

                    finger.drag(-5, 0);
                    assertPosition($start, initial.start.left, initial.start.top);

                    finger.drag(seekZone.display.width + 5, 0);
                    assertPosition($start, initial.start.left + seekZone.display.width, initial.start.top);

                    finger.drag(10, 0);
                    assertPosition($start, initial.start.left + seekZone.display.width, initial.start.top);
                    finger.lift();

                    finger.placeOn($end);
                    finger.drag(10, 0);
                    assertPosition($end, initial.end.left + 10, initial.end.top);

                    finger.drag(-10);
                    assertPosition($end, initial.end.left, initial.end.top);

                    finger.drag(-5, 0);
                    assertPosition($end, initial.end.left, initial.end.top);

                    finger.drag(seekZone.display.width + 5, 0);
                    assertPosition($end, initial.end.left + seekZone.display.width, initial.end.top);

                    finger.drag(10, 0);
                    assertPosition($end, initial.end.left + seekZone.display.width, initial.end.top);
                    finger.lift();
                });
            });

            describe('the start marker', function() {
                var $start,
                    $seek;

                beforeEach(function() {
                    $start = $trimmer.find('#start-marker');
                    $seek = $trimmer.find('#seek-bar');
                });

                it('should be at its 0 position if there is no start time specified', function() {
                    $scope.$apply(function() {
                        $scope.start = null;
                    });

                    expect($start.css('left')).toBe('0px');
                });

                it('should adjust its position based on the provided start time', function() {
                    var seekWidth = $seek.width();

                    function positionFor(start) {
                        return Math.floor((seekWidth * start) / 60) + 'px';
                    }

                    expect($start.css('position')).toBe('relative');
                    expect($start.css('left')).toBe(positionFor(10));

                    $scope.$apply(function() {
                        $scope.start = 20;
                    });
                    expect($start.css('left')).toBe(positionFor(20));

                    $scope.$apply(function() {
                        $scope.start = 48;
                    });
                    expect($start.css('left')).toBe(positionFor(48));
                });

                it('should modify the start time based on the position to which its moved', function() {
                    var finger = new Finger(),
                        seekWidth = $seek.width();

                    function pxMovedToDuration(px) {
                        return (px * 60) / seekWidth;
                    }

                    // Start at 0
                    $scope.$apply(function() {
                        $scope.start = 0;
                    });

                    finger.placeOn($start);
                    finger.drag(10, 0);
                    finger.lift();

                    expect($scope.start).toBe(pxMovedToDuration(10));
                    expect($start.css('left')).toBe('10px');

                    finger.placeOn($start);
                    finger.drag(20, 0);
                    finger.lift();

                    expect($scope.start).toBe(pxMovedToDuration(30));
                    expect($start.css('left')).toBe('30px');

                    finger.placeOn($start);
                    finger.drag(17, 0);
                    finger.lift();

                    expect($scope.start).toBe(pxMovedToDuration(47));
                    expect($start.css('left')).toBe('47px');
                    expect($start.css('top')).toBe('auto');
                });

                it('should not be able to move past the end marker', function() {
                    var finger = new Finger(),
                        seekWidth = $seek.width(),
                        end = $trimmer.find('#end-marker').data('cDrag'),
                        endPosition = end.display;

                    end.refresh();

                    // Start at 0
                    $scope.$apply(function() {
                        $scope.start = 0;
                    });

                    finger.placeOn($start);
                    finger.drag(seekWidth, 0);
                    expect($start.css('left')).toBe((endPosition.center.x - ($start.width() / 2)) + 'px');
                });
            });

            describe('the end marker', function() {
                var $end,
                    $seek;

                beforeEach(function() {
                    $end = $trimmer.find('#end-marker');
                    $seek = $trimmer.find('#seek-bar');
                });

                it('should move to its end position if there is no end time specified', function() {
                    $scope.$apply(function() {
                        $scope.end = null;
                    });

                    expect($end.css('left')).toBe($seek.width() + 'px');
                });

                it('should adjust its position based on the provided end time', function() {
                    var seekWidth = $seek.width();

                    function positionFor(end) {
                        return Math.floor((seekWidth * end) / 60) + 'px';
                    }

                    expect($end.css('position')).toBe('relative');
                    expect($end.css('left')).toBe(positionFor(40));

                    $scope.$apply(function() {
                        $scope.end = 30;
                    });
                    expect($end.css('left')).toBe(positionFor(30));

                    $scope.$apply(function() {
                        $scope.end = 57;
                    });
                    expect($end.css('left')).toBe(positionFor(57));
                });

                it('should modify the start time based on the position to which its moved', function() {
                    var finger = new Finger(),
                        seekWidth = $seek.width();

                    function pxMovedToDuration(px) {
                        return (60 - (px * 60) / seekWidth);
                    }

                    // Start at the end
                    $scope.$apply(function() {
                        $scope.end = 60;
                    });

                    finger.placeOn($end);
                    finger.drag(-10, 0);
                    finger.lift();

                    expect($scope.end).toBe(pxMovedToDuration(10));
                    expect($end.css('left')).toBe((seekWidth - 10) + 'px');

                    finger.placeOn($end);
                    finger.drag(-20, 0);
                    finger.lift();

                    expect($scope.end).toBe(pxMovedToDuration(30));
                    expect($end.css('left')).toBe((seekWidth - 30) + 'px');

                    finger.placeOn($end);
                    finger.drag(-17, 0);
                    finger.lift();

                    expect($scope.end).toBe(pxMovedToDuration(47));
                    expect($end.css('left')).toBe((seekWidth - 47) + 'px');
                    expect($end.css('top')).toBe('auto');
                });
            });
        });
    });
}());
