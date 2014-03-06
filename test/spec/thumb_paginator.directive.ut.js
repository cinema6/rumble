(function() {
    'use strict';

    define(['thumb_paginator'], function() {
        describe('<thumb-paginator>', function() {
            var $rootScope,
                $scope,
                $compile,
                $window,
                $timeout;

            var $testBox,
                $style;

            var $pager;

            function create(contents) {
                var $pager;

                $scope.$apply(function() {
                    $pager = $('<thumb-paginator active="activeIndex" class="mr-pager__group">' + contents + '</thumb-paginator>');
                    $testBox.append($pager);
                    $compile($testBox.contents())($scope);
                });
                $timeout.flush();

                return $pager;
            }

            beforeEach(function() {
                $style = $([
                    '<style>',
                    '    .mr-pager__group {',
                    '        width:100%; height:4.0625rem; /*65px*/ position:relative;',
                    '        margin:0.875rem 0 0 0; display: block;',
                    '    }',
                    '    .mr-pager__btn {',
                    '        min-width:1.4375rem;/*23px*/ height:4.065rem; position:absolute;',
                    '        background:#404040 no-repeat 50% 50%; border:0; padding:0; margin:0;',
                    '        cursor:pointer;',
                    '    }',
                    '        .mr-pager__btn--disabled {',
                    '            opacity:0.25;',
                    '        }',
                    '        .mr-pager__prev {',
                    '            left:0;',
                    '        }',
                    '        .mr-pager__next {',
                    '            right:0;',
                    '        }',
                    '    .mr-pager__icon {',
                    '        display:block; width:0.5625rem;/*9px*/ height:1rem;/*16px*/',
                    '        position:absolute; top:1.5625rem;/*25px*/ left:0.4375rem;/*7px*/',
                    '        opacity:0.5;',
                    '    }',
                    '        .mr-pager__icon-next {',
                    '            background-position:-0.625rem 0;',
                    '        }',
                    '    /* pages styles */',
                    '    .mr-pages__group {',
                    '        position:absolute; left:1.5625rem;/*25px*/ right:1.5625rem;/*25px*/',
                    '        height:100%; overflow: hidden; padding: 0 2px;',
                    '    }',
                    '        .mr-pages__scroller {',
                    '            position: relative; left: 0;',
                    '        }',
                    '</style>'
                ].join('\n'));
                $style.appendTo('head');

                $testBox = $('<div style="width: 1024px; height: 768px; position: relative;">');
                $testBox.appendTo('body');

                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {
                        mode: 'full'
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $window = $injector.get('$window');
                    $timeout = $injector.get('$timeout');

                    $scope = $rootScope.$new();
                });

                $scope.activeIndex = -1;
            });

            describe('the buttons', function() {
                it('should grow to fill the remaining space of the paginator', function() {
                    $pager = create([
                        '<ul>',
                        '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                        '        <span thumb-paginator-item style="display: inline-block; width: 150px;">Foo</span>',
                        '    </li>',
                        '</ul>'
                    ].join('\n'));

                    expect($pager.find('.mr-pager__prev').width()).toBe(62);
                    expect($pager.find('.mr-pager__next').width()).toBe(62);
                });

                it('should take the minimum width of the buttons into account', function() {
                    $pager = create([
                        '<ul>',
                        '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                        '        <span thumb-paginator-item style="display: inline-block; width: 100px;">Foo</span>',
                        '    </li>',
                        '</ul>'
                    ].join('\n'));

                    expect($pager.find('.mr-pager__prev').width()).toBe(62);
                    expect($pager.find('.mr-pager__next').width()).toBe(62);
                });
            });

            describe('the paginator', function() {
                var $pages;

                beforeEach(function() {
                    $pager = create([
                        '<ul>',
                        '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                        '        <span thumb-paginator-item style="display: inline-block; width: 170px; margin-right: 5px;">Foo</span>',
                        '    </li>',
                        '</ul>'
                    ].join('\n'));
                    $pages = $pager.find('.mr-pages__group');
                });

                it('should be centered', function() {
                    expect($pages.css('left')).toBe('74px');
                    expect($pages.css('right')).toBe('74px');
                });

                it('should recalculate when the window resizes', function() {
                    $testBox.width(800);
                    $($window).trigger('resize');
                    $timeout.flush();

                    expect($pages.css('left')).toBe('50px');
                    expect($pages.css('right')).toBe('50px');
                });

                it('should watch the activeIndex and move to the correct page when it changes', function() {
                    var $scroller = $pager.find('.mr-pages__scroller'),
                        style = $scroller.prop('style');

                    expect(style.left).toBe('0%');

                    $scope.$apply(function() {
                        $scope.activeIndex = 4;
                    });
                    expect(style.left).toBe('0%');

                    $scope.$apply(function() {
                        $scope.activeIndex = 6;
                    });
                    expect(style.left).toBe('-100%');

                    $scope.$apply(function() {
                        $scope.activeIndex = -1;
                    });
                    expect(style.left).toBe('-100%');

                    $scope.$apply(function() {
                        $scope.activeIndex = 4;
                    });
                    expect(style.left).toBe('0%');
                });
            });

            afterEach(function() {
                $testBox.remove();
                $style.remove();
            });
        });
    });
}());
