(function() {
    'use strict';

    define(['helpers/drag', 'c6_drag'], function(helpers) {
        describe('c6-draggable=""', function() {
            var $rootScope,
                $scope,
                $compile;

            var testFrame,
                domEvents;

            var Finger = helpers.Finger,
                TestFrame = helpers.TestFrame;

            beforeEach(function() {
                var createEvent = document.createEvent;

                testFrame = new TestFrame();

                domEvents = [];
                domEvents.mostRecent = null;

                module('c6.drag');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });

                spyOn(document, 'createEvent')
                    .and.callFake(function() {
                        var event = createEvent.apply(document, arguments);

                        spyOn(event, 'preventDefault').and.callThrough();

                        domEvents.push(event);
                        domEvents.mostRecent = event;

                        return event;
                    });
            });

            it('should make the element draggable', function() {
                var finger = new Finger(),
                    $div;

                testFrame.$body.append('<div style="width: 100%; height: 100px;"></div>');
                $div = $('<div c6-draggable style="width: 50px; height: 50px;"></div>');
                testFrame.$body.append($div);
                $scope.$apply(function() {
                    $compile($div)($scope);
                });

                finger.placeOn($div);
                // Drag 10px to the right
                finger.drag(10, 0);
                expect($div.css('position')).toBe('fixed');
                expect($div.css('top')).toBe('100px');
                expect($div.css('left')).toBe('10px');

                // Drag 5px up
                finger.drag(0, -5);
                expect($div.css('top')).toBe('95px');

                // Drag 5px to the left and 20px down
                finger.drag(-5, 20);
                expect($div.css('top')).toBe('115px');
                expect($div.css('left')).toBe('5px');

                finger.lift();
                expect($div.css('position')).toBe('static');
                expect($div.css('top')).toBe('auto');
                expect($div.css('left')).toBe('auto');

                domEvents.forEach(function(event) {
                    if (event.type.search(/^(drag)$/) > -1) {
                        expect(event.gesture.preventDefault).toHaveBeenCalled();
                    }
                });
            });

            it('should support multiple drags/drops', function() {
                var finger = new Finger(),
                    $div = $('<div c6-draggable style="width: 50px; height: 50px;"></div>');

                testFrame.$body.append($div);
                $scope.$apply(function() {
                    $compile($div)($scope);
                });

                finger.placeOn($div);
                finger.drag(0, 0);
                expect($div.css('top')).toBe('0px');
                expect($div.css('left')).toBe('0px');

                finger.drag(10, 10);
                expect($div.css('top')).toBe('10px');
                expect($div.css('left')).toBe('10px');

                finger.lift();

                finger.placeOn($div);
                finger.drag(0, 0);
                expect($div.css('top')).toBe('0px');
                expect($div.css('left')).toBe('0px');

                finger.drag(10, 10);
                expect($div.css('top')).toBe('10px');
                expect($div.css('left')).toBe('10px');
            });

            it('should add the "c6-dragging" class to the element while it is being dragged', function() {
                var finger = new Finger(),
                    $div;

                $scope.$apply(function() {
                    $div = $compile('<div c6-draggable>')($scope);
                });
                testFrame.$body.append($div);
                expect($div.hasClass('c6-dragging')).toBe(false);

                finger.placeOn($div);
                finger.drag(0, 0);
                expect($div.hasClass('c6-dragging')).toBe(true);

                finger.drag(5, 10);
                expect($div.hasClass('c6-dragging')).toBe(true);

                finger.lift();
                expect($div.hasClass('c6-dragging')).toBe(false);
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
