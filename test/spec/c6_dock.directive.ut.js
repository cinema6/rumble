(function() {
    'use strict';

    describe('c6-dock="" and c6-dock-anchor=""', function() {
        var $rootScope,
            $scope,
            $compile,
            $window;

        var $testBox;

        beforeEach(function() {
            module('c6.rumble');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $window = $injector.get('$window');

                $scope = $rootScope.$new();
            });

            $rootScope.$apply(function() {
                $testBox = $compile('<div id="test-box" style="width: 800px; height: 600px; position: relative;"></div>')($scope);
            });

            $('body').append($testBox);
        });

        describe('c6-dock-anchor=""', function() {
            it('should throw an error if no id is provided', function() {
                expect(function() {
                    $scope.$apply(function() {
                        $compile('<div c6-dock-anchor></div>')($scope);
                    });
                }).toThrow('c6-dock-anchor requires an id.');

                expect(function() {
                    $scope.$apply(function() {
                        $compile('<div id="foo" c6-dock-anchor></div>')($scope);
                    });
                }).not.toThrow();
            });
        });

        describe('c6-dock="cssProp to anchorId:(top|bottom|left|right)"', function() {
            it('should change the provided css propertry to dock to the correct positon relative to the anchor', function() {
                var $dock;

                $testBox.html([
                    '<div id="anchor" c6-dock-anchor style="height: 10%;"></div>',
                    '<div c6-dock="top to anchor:bottom" style="position: absolute;"></div>'
                ].join('\n'));
                $scope.$apply(function() {
                    $compile($testBox.contents())($scope);
                });
                $dock = $testBox.find('div:eq(1)');

                expect($dock.css('top')).toBe('60px');

                $testBox.children().remove();
                $testBox.html([
                    '<div id="foo" c6-dock-anchor style="position: absolute; top: 20%; height: 10%;"></div>',
                    '<div c6-dock="top to foo:bottom" style="position: absolute;"></div>'
                ].join('\n'));
                $scope.$apply(function() {
                    $compile($testBox.contents())($scope);
                });
                $dock = $testBox.find('div:eq(1)');

                expect($dock.css('top')).toBe('180px');

                $testBox.children().remove();
                $testBox.html([
                    '<div id="test" c6-dock-anchor style="left: 20%; width: 100px; position: absolute;"></div>',
                    '<div c6-dock="left to test:right" style="position: absolute;"></div>'
                ].join('\n'));
                $scope.$apply(function() {
                    $compile($testBox.contents())($scope);
                });
                $dock = $testBox.find('div:eq(1)');

                expect($dock.css('left')).toBe('260px');
            });

            it('should throw an error if the anchor does not have the same offsetParent as the element', function() {
                $testBox.html([
                    '<div style="position: absolute; top: 10%; right: 10%; bottom: 10%; left: 10%;">',
                    '    <div id="test" c6-dock-anchor style="position: absolute; height: 20px;"></div>',
                    '</div>',
                    '<div c6-dock="top to test:bottom" style="position: absolute;"></div>'
                ].join('\n'));

                expect(function() {
                    $scope.$apply(function() {
                        $compile($testBox.contents())($scope);
                    });
                }).toThrow('Cannot dock top to test:bottom because the element to dock has a different offsetParent than its anchor.');
            });

            it('should work for many properties', function() {
                var $dock;

                $testBox.html([
                    '<div id="anchor" style="position: absolute; top: 50px; height: 100px; width: 125px;" c6-dock-anchor></div>',
                    '<div style="position: absolute;"',
                    '    c6-dock="top to anchor:bottom, left to anchor:right">',
                    '</div>'
                ].join('\n'));
                $scope.$apply(function() {
                    $compile($testBox.contents())($scope);
                });
                $dock = $testBox.find('div:eq(1)');

                expect($dock.css('top')).toBe('150px');
                expect($dock.css('left')).toBe('125px');
            });

            it('should redock when the window resizes', function() {
                var $dock;

                spyOn($window.document, 'removeEventListener').andCallThrough();

                $testBox.html([
                    '<div id="test" style="position: absolute; height: 50%;" c6-dock-anchor></div>',
                    '<div style="position: absolute;" c6-dock="top to test:bottom"></div>'
                ].join('\n'));
                $scope.$apply(function() {
                    $compile($testBox.contents())($scope);
                });
                $dock = $testBox.find('div:eq(1)');

                expect($dock.css('top')).toBe('300px');

                $testBox.height('400px');
                $($window).trigger('resize');

                expect($dock.css('top')).toBe('200px');
            });
        });

        afterEach(function() {
            $testBox.remove();
        });
    });
}());
