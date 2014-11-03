define(['app'], function(appModule) {
    'use strict';

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
                $pager = $('<thumb-paginator active="activeIndex" class="pager__group">' + contents + '</thumb-paginator>');
                $testBox.append($pager);
                $compile($testBox.contents())($scope);
            });
            $timeout.flush();

            return $pager;
        }

        beforeEach(function() {
            $style = $([
                '<style>',
                    '.pager__group {',
                        'height:2.875rem;/*46px*/',
                        'margin:0; display: block; ',
                        'position: absolute; z-index: 1;',
                        'left:0; right:0; bottom:0',
                    '}',
                    '.pager__btn {',
                        'min-width:1.4375rem;/*80px*/ height:2.875rem;/*46px*/ position:absolute;',
                        'background:#d94040 no-repeat 50% 50%; border:0; padding:0; margin:0;',
                        'cursor:pointer;',
                    '}',
                        '.pager__btn--disabled {',
                            'opacity:0.25; cursor:default;',
                        '}',
                            '.pager__btn--disabled .pager__label {',
                                'color:#1b1b1b;',
                            '}',
                            '.pager__btn--disabled .pager__icon-path {',
                                'fill: #1b1b1b;',
                            '}',
                        '.pager__prev {',
                            'left:0;',
                        '}',
                        '.pager__next {',
                            'right:0;',
                        '}',
                    '.pager__border {',
                        'width:1px;',
                        'display: block;',
                        'position: absolute; top:0; bottom:0;',
                        'background:#fff;',
                    '}',
                        '.pager__prev .pager__border {',
                            'right:0;',
                        '}',
                        '.pager__next .pager__border {',
                            'left:0;',
                        '}',
                    '.pager__icon {',
                        'display:block; width:0.75rem;/*12px*/ height:100%;',
                        'position:absolute; top:0; left:12.5%; margin:0;',
                    '}',
                        '.pager__icon-next {',
                            'right:12.5%; left:auto;',
                        '}',
                        '.pager__icon-path {',
                            'fill: #fff;',
                        '}',
                    '.pager__label {',
                        'font-weight:bold; color:#fff; line-height:1; font-size:0.875rem;',
                        'display: block; text-transform: uppercase;',
                        'position:absolute; z-index: 1; top:1rem; left:40%;',
                    '}',
                        '.pager__next .pager__label {',
                            'right:40%; left:auto;',
                        '}',
                    '/* pages styles */',
                    '.pages__group {',
                        'position:absolute; left:1.5625rem;/*25px*/ right:1.5625rem;/*25px*/',
                        'height:100%; overflow: hidden; margin:0;',
                    '}',
                        '.pages__scroller {',
                            'position: relative; left: 0;',
                            '-webkit-transition: 1s left; -o-transition: 1s left;',
                            '-ms-transition: 1s left; -moz-transition: 1s left;',
                            'transition: 1s left;',
                        '}',
                            '.pages__list {',
                                'margin:0; padding:0; list-style: none;',
                                'width:12000%;',
                            '}',
                                '.pages__item {',
                                    'float:left;',
                                    'width:5.625rem;/*90px*/ height:2.875rem;/*46px*/',
                                    'margin:0; padding:0;',
                                    'position:relative; overflow: hidden;',
                                    'border:0;',
                                    'border-left:1px solid #fff;',
                                    'border-right:1px solid #fff;',
                                    'box-sizing:border-box;',
                                '}',
                                    '.pages__navBtn,',
                                    '.pages__page {',
                                        'display: block;',
                                        'width:100%; height:100%;',
                                        'margin:0; border:0; padding:0;',
                                    '}',
                                    '.pages__page {',
                                        'cursor: pointer;',
                                        'background:black url("../../img/default_square.jpg") 50% 50% / cover no-repeat;',
                                    '}',
                                        '.pages__page--ad:after {',
                                            'content:"Ad";',
                                            'position: absolute;',
                                            'top:2px; left:2px;',
                                            'background:#000; color:#fff;',
                                            'padding:0 2px;',
                                            'font-size:0.625rem; font-weight:bold;',
                                        '}',
                                        '.pages__preview-img {',
                                            'position:absolute; top:0;',
                                            'width:100%; height:100%; display: block;',
                                            'background:no-repeat 50% 50% / 100%;',
                                        '}',
                                        '.pages__label {',
                                            'display: block; width:100%;',
                                            'position: absolute; top:-0.875rem; left:0;',
                                            'color:#000; font-size:6rem; line-height: 1; font-weight: bold;',
                                            'opacity:0.5;',
                                        '}',
                                        '.pages__fader {',
                                            'background:#000; opacity:0.4;',
                                            'position:absolute; width:100%; height:100%;',
                                            'top:0; left:0; z-index: 1;',
                                        '}',
                                            '.pages__page--active .pages__fader {',
                                                'opacity:0;',
                                            '}',
                                        '.pages__current-indicator {',
                                            'opacity:0; display: block; ',
                                            'width:100%; height:0.25rem;',
                                            'position: absolute; bottom:0; left:0; z-index: 2;',
                                            'background:#d94040;',
                                            'overflow: hidden;',
                                        '}',
                                            '.pages__page--active .pages__current-indicator {',
                                                'opacity:1;',
                                            '}',
                '</style>'
            ].join('\n'));
            $style.appendTo('head');

            $testBox = $('<div style="width: 1024px; height: 768px; position: relative;">');
            $testBox.appendTo('body');

            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: 'light'
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

                expect($pager.find('.pager__prev').width()).toBe(62);
                expect($pager.find('.pager__next').width()).toBe(62);
            });

            it('should take the minimum width of the buttons into account', function() {
                $pager = create([
                    '<ul>',
                    '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                    '        <span thumb-paginator-item style="display: inline-block; width: 100px;">Foo</span>',
                    '    </li>',
                    '</ul>'
                ].join('\n'));

                expect($pager.find('.pager__prev').width()).toBe(62);
                expect($pager.find('.pager__next').width()).toBe(62);
            });

            it('should re-fetch the minimum width of the buttons when the window resizes', function() {
                $pager = create([
                    '<ul>',
                    '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                    '        <span thumb-paginator-item style="display: inline-block; width: 100px;">Foo</span>',
                    '    </li>',
                    '</ul>'
                ].join('\n'));

                $pager.find('.pager__btn').css('min-width', '100px');
                $($window).trigger('resize');
                $timeout.flush();

                expect($pager.find('.pager__prev').width()).toBe(112);
                expect($pager.find('.pager__next').width()).toBe(112);
            });

            it('should update the width of the thumbnails when the window resizes', function() {
                $pager = create([
                    '<ul>',
                    '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                    '        <span thumb-paginator-item style="display: inline-block; width: 100px;">Foo</span>',
                    '    </li>',
                    '</ul>'
                ].join('\n'));

                $pager.find('ul li span').width(125);
                $($window).trigger('resize');
                $timeout.flush();

                expect($pager.find('.pager__prev').width()).toBe(74);
                expect($pager.find('.pager__next').width()).toBe(74);
            });

            it('should not impose a width if all the buttons fit on one page', function() {
                $pager = create([
                    '<ul>',
                    '    <li ng-repeat="index in [0,1,2,3,4]">',
                    '        <span thumb-paginator-item style="display: inline-block; width: 100px;">Foo</span>',
                    '    </li>',
                    '</ul>'
                ].join('\n'));

                expect($pager.find('.pager__prev').prop('style').width).toBe('');
                expect($pager.find('.pager__next').prop('style').width).toBe('');
                expect($pager.find('.pages__group').prop('style').left).not.toBe('');
                expect($pager.find('.pages__group').prop('style').right).not.toBe('');
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
                $pages = $pager.find('.pages__group');
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

            it('should recalculate when resize is broadcast', function() {
                $testBox.width(800);
                $rootScope.$broadcast('resize');
                $timeout.flush();

                expect($pages.css('left')).toBe('50px');
                expect($pages.css('right')).toBe('50px');

                $testBox.width(1000);
                $rootScope.$broadcast('resize');
                $timeout.flush();

                expect($pages.css('left')).toBe('62px');
                expect($pages.css('right')).toBe('62px');
            });

            it('should watch the activeIndex and move to the correct page when it changes', function() {
                var $scroller = $pager.find('.pages__scroller'),
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

        describe('$watch', function() {
            describe('pagesCount', function() {
                var $pagerScope, content;
                
                beforeEach(function() {
                    content = [
                        '<ul>',
                        '    <li ng-repeat="index in [0,1,2,3,4,5,6,7,8,9,10,11]">',
                        '        <span thumb-paginator-item style="display: inline-block; width: 100px;">Foo</span>',
                        '    </li>',
                        '</ul>'
                    ].join('\n');

                    $testBox = $('<div style="width: 1000px; height: 768px; position: relative;">');
                    $testBox.appendTo('body');

                    $scope.$apply(function() {
                        $pager = $('<thumb-paginator active="activeIndex" class="pager__group">' + content + '</thumb-paginator>');
                        $testBox.append($pager);
                        $pagerScope = $compile($testBox.contents())($scope);
                    });
                    $timeout.flush();
                });

                it('should start at page 0', function() {
                    expect($pagerScope.children().scope().page).toBe(0);
                });

                it('should move pages when the activeIndex changes', function() {
                    $scope.$apply(function() {
                        $scope.activeIndex = 12;
                    });

                    expect($pagerScope.children().scope().page).toBe(1);
                });

                it('should go to first page if the width changes and causes the pageCount to be less than the current page number', function() {
                    $scope.$apply(function() {
                        $testBox.css('width','1500px');
                        $rootScope.$broadcast('resize');
                        $scope.activeIndex = 12;
                    });
                    
                    $timeout.flush();

                    expect($pagerScope.children().scope().page).toBe(0);
                });

                it('should go to second page if the width changes and causes the current index to be on the next page', function() {
                    $scope.$apply(function() {
                        $testBox.css('width','1500px');
                        $rootScope.$broadcast('resize');
                        $scope.activeIndex = 12;
                    });
                    
                    $timeout.flush();

                    expect($pagerScope.children().scope().page).toBe(0);

                    $scope.$apply(function() {
                        $testBox.css('width','1200px');
                        $rootScope.$broadcast('resize');
                        $scope.activeIndex = 11;
                    });
                    
                    $timeout.flush();

                    expect($pagerScope.children().scope().page).toBe(1);
                });
            });
        });

        afterEach(function() {
            $testBox.remove();
            $style.remove();
        });
    });
});
