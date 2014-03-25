(function() {
    'use strict';

    define(['helpers/drag', 'c6_drag'], function(helpers) {
        var Finger = helpers.Finger,
            TestFrame = helpers.TestFrame;

        describe('<c6-drag-space>', function() {
            var $rootScope,
                $scope,
                $compile;

            var testFrame;

            beforeEach(function() {
                testFrame = new TestFrame();

                module('c6.drag');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });

            describe('attributes', function() {
                describe('controller-as', function() {
                    it('should make its controller available on the $scope as the provided name', function() {
                        var $dragSpace,
                            scope;

                        $scope.$apply(function() {
                            $dragSpace = $compile('<c6-drag-space controller-as="FooCtrl"><p>Foo</p></c6-drag-space>')($scope);
                        });
                        scope = $dragSpace.children().scope();

                        expect(scope.FooCtrl).toEqual(jasmine.any(Object));
                    });

                    it('should be optional', function() {
                        var $dragSpace,
                            scope;

                        $scope.$apply(function() {
                            $dragSpace = $compile('<c6-drag-space><p>Foo</p></c6-drag-space>')($scope);
                        });
                        scope = $dragSpace.children().scope();

                        expect(scope.undefined).not.toBeDefined();
                    });
                });
            });

            describe('controller', function() {
                var $dragSpace,
                    Controller;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $dragSpace = $compile('<c6-drag-space controller-as="Ctrl"><span id="drag1" c6-draggable>Drag 1</span></c6-drag-space>')($scope);
                    });
                    testFrame.$body.append($dragSpace);
                    Controller = $dragSpace.children().scope().Ctrl;
                });

                describe('properties', function() {
                    describe('draggables', function() {
                        it('should be an object with each draggable\'s state, keyed by its ID', function() {
                            expect(Controller.draggables.drag1).toEqual(jasmine.any(Object));
                        });
                    });
                });
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
