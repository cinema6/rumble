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
                    scope,
                    Controller;

                beforeEach(function() {
                    $dragSpace = $('<c6-drag-space controller-as="Ctrl" style="display: block; width: 800px; height: 600px; vertical-align: top;"><span style="display: inline-block; width: 50px; height: 50px; vertical-align: top;" id="drag1" c6-draggable>Drag 1</span></c6-drag-space>');
                    testFrame.$body.append($dragSpace);
                    $scope.$apply(function() {
                        $compile($dragSpace)($scope);
                    });
                    scope = $dragSpace.children().scope();
                    Controller = scope.Ctrl;
                });

                describe('properties', function() {
                    describe('zones', function() {
                        it('should be an object with each zone\'s state, keyed by its ID', function() {
                            var $zone1 = $('<span id="zone1" c6-drag-zone style="display: inline-block; height: 50px; width: 50px"></span>'),
                                $zone2 = $('<span id="zone2" c6-drag-zone style="display: inline-block; height: 50px; width: 50px"></span>'),
                                zone1, zone2;

                            $dragSpace.prepend($zone2);
                            $dragSpace.prepend($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                                $compile($zone2)($scope);
                            });
                            zone1 = Controller.zones.zone1;
                            zone2 = Controller.zones.zone2;

                            expect(zone1).toEqual(jasmine.any(Object));
                            expect(zone2).toEqual(jasmine.any(Object));

                            expect(zone1.display).toEqual({
                                top: 0,
                                right: 50,
                                bottom: 50,
                                left: 0,
                                width: 50,
                                height: 50
                            });

                            expect(zone2.display).toEqual({
                                top: 0,
                                right: 100,
                                bottom: 50,
                                left: 50,
                                width: 50,
                                height: 50
                            });
                        });

                        it('should keep an array of draggables it is "currentlyUnder"', function() {
                            var indexFinger = new Finger(),
                                middleFinger = new Finger(),
                                $drag1 = $dragSpace.find('#drag1'),
                                $drag2 = $('<span id="drag2" c6-draggable style="display: inline-block; width: 50px; height: 50px; vertical-align: top;"></span>'),
                                $zone1 = $('<span id="zone1" c6-drag-zone style="display: inline-block; width: 50px; height: 50px;"></span>'),
                                zone1, drag1, drag2, $watchSpy = jasmine.createSpy('$watch()');

                            scope.$watchCollection('Ctrl.zones.zone1.currentlyUnder', $watchSpy);

                            $dragSpace.prepend($zone1);
                            $dragSpace.append($drag2);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                                $compile($drag2)($scope);
                            });
                            zone1 = Controller.zones.zone1;
                            drag1 = Controller.draggables.drag1;
                            drag2 = Controller.draggables.drag2;

                            expect($watchSpy.calls.count()).toBe(1);
                            expect(zone1.currentlyUnder).toEqual([]);

                            $zone1.css({
                                margin: '50px 5px 0 100px'
                            });

                            indexFinger.placeOn($drag1);
                            // Drag 10px to the left and 50px down
                            indexFinger.drag(-10, 50);
                            // Drag another 5px to the left
                            indexFinger.drag(-5, 0);
                            expect($watchSpy.calls.count()).toBe(2);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            // Drag 15px to the right and 55px down
                            indexFinger.drag(15, 55);
                            expect($watchSpy.calls.count()).toBe(3);
                            expect(zone1.currentlyUnder).toEqual([]);

                            // Drag 55px to the left and 10px up
                            indexFinger.drag(-55, -10);
                            expect($watchSpy.calls.count()).toBe(4);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            // Drag 55px to the left and 45px up
                            indexFinger.drag(-55, -45);
                            expect($watchSpy.calls.count()).toBe(5);
                            expect(zone1.currentlyUnder).toEqual([]);

                            // Drag 10px to the right
                            indexFinger.drag(10, 0);
                            expect($watchSpy.calls.count()).toBe(6);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            // Drag 45px to the right and 50px up
                            indexFinger.drag(45, -55);
                            expect($watchSpy.calls.count()).toBe(7);
                            expect(zone1.currentlyUnder).toEqual([]);

                            // Drag 10px down
                            indexFinger.drag(0, 10);
                            expect($watchSpy.calls.count()).toBe(8);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            middleFinger.placeOn($drag2);
                            // Drag 5px to the left
                            middleFinger.drag(-5, 0);
                            expect($watchSpy.calls.count()).toBe(9);
                            expect(zone1.currentlyUnder).toEqual([drag1, drag2]);

                            indexFinger.lift();
                            expect($watchSpy.calls.count()).toBe(10);
                            expect(zone1.currentlyUnder).toEqual([drag2]);

                            middleFinger.lift();
                            expect($watchSpy.calls.count()).toBe(11);
                            expect(zone1.currentlyUnder).toEqual([]);
                        });
                    });

                    describe('draggables', function() {
                        it('should be an object with each draggable\'s state, keyed by its ID', function() {
                            var drag1 = Controller.draggables.drag1,
                                $drag1 = $dragSpace.find('#drag1'),
                                finger = new Finger();

                            expect(drag1).toEqual(jasmine.any(Object));
                            expect(drag1.display).toEqual({
                                top: 0,
                                left: 0,
                                bottom: 50,
                                right: 50,
                                width: 50,
                                height: 50
                            });

                            finger.placeOn($drag1);

                            // Drag 5px to the right and 5px down
                            finger.drag(5, 5);
                            expect(drag1.display).toEqual({
                                top: 5,
                                left: 5,
                                bottom: 55,
                                right: 55,
                                width: 50,
                                height: 50
                            });

                            // Drag 770px to the right
                            finger.drag(770, 0);
                            expect(drag1.display).toEqual({
                                top: 5,
                                left: 775,
                                bottom: jasmine.any(Number),
                                right: 825,
                                width: 50,
                                height: jasmine.any(Number)
                            });
                        });

                        it('should remove the draggable if it is destroyed', function() {
                            var $drag1 = $dragSpace.find('#drag1');

                            $drag1.scope().$destroy();
                            $drag1.remove();

                            expect(Controller.draggables.drag1).not.toBeDefined();
                        });
                    });

                    describe('currentDrags', function() {
                        it('should exist', function() {
                            expect(Controller.currentDrags).toEqual([]);
                        });

                        it('should contain draggables for all of the items currently being dragged', function() {
                            var $drag1 = $dragSpace.find('#drag1'),
                                $drag2 = $('<span style="display: inline-block; width: 50px; height: 50px;" id="drag2" c6-draggable>Drag 2</span>'),
                                drag1, drag2,
                                $watchSpy = jasmine.createSpy('$watch()');

                            scope.$watchCollection('Ctrl.currentDrags', $watchSpy);

                            var indexFinger = new Finger(),
                                middleFinger = new Finger();

                            $dragSpace.append($drag2);
                            $scope.$apply(function() {
                                $compile($drag2)($scope);
                            });
                            drag1 = Controller.draggables.drag1;
                            drag2 = Controller.draggables.drag2;

                            indexFinger.placeOn($drag1);
                            indexFinger.drag(5, 20);
                            expect(Controller.currentDrags).toEqual([drag1]);
                            expect($watchSpy.calls.count()).toBe(2);

                            middleFinger.placeOn($drag2);
                            middleFinger.drag(-2, 10);
                            expect(Controller.currentDrags).toEqual([drag1, drag2]);
                            expect($watchSpy.calls.count()).toBe(3);

                            indexFinger.lift();
                            expect(Controller.currentDrags).toEqual([drag2]);
                            expect($watchSpy.calls.count()).toBe(4);

                            middleFinger.lift();
                            expect(Controller.currentDrags).toEqual([]);
                            expect($watchSpy.calls.count()).toBe(5);
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
