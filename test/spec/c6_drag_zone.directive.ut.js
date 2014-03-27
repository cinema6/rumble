(function() {
    'use strict';

    define(['helpers/drag', 'c6_drag'], function(helpers) {
        var Finger = helpers.Finger,
            TestFrame = helpers.TestFrame;

        describe('<c6-drag-zone>', function() {
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

            describe('when a draggable is above', function() {
                var $dragSpace;

                beforeEach(function() {
                    $dragSpace = $('<c6-drag-space controller-as="Ctrl"><div id="zone1" c6-drag-zone style="height: 50px; margin-bottom: 5px">Zone 1</div><span id="drag1" c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag 1</span></c6-drag-space>');
                    testFrame.$body.append($dragSpace);

                    $scope.$apply(function() {
                        $compile($dragSpace)($scope);
                    });
                });

                it('should add the "c6-drag-zone-active" class when there is a draggable on top of it', function() {
                    var indexFinger = new Finger(),
                        middleFinger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $drag1 = $dragSpace.find('#drag1'),
                        $drag2 = $('<span id="drag2" c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag 2</span>');

                    $dragSpace.append($drag2);
                    $scope.$apply(function() {
                        $compile($drag2)($scope);
                    });

                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);

                    indexFinger.placeOn($drag1);
                    // Drag 10px up
                    indexFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    middleFinger.placeOn($drag2);
                    // Drag 10px up
                    middleFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    // Drag 10px down
                    middleFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    // Drag 10px down
                    indexFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);
                });

                it('should add a "c6-drag-zone-under-draggableId" class for every draggable it is covered by', function() {
                    var indexFinger = new Finger(),
                        middleFinger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $drag1 = $dragSpace.find('#drag1'),
                        $drag2 = $('<span id="drag2" c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag 2</span>');

                    $dragSpace.append($drag2);
                    $scope.$apply(function() {
                        $compile($drag2)($scope);
                    });

                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);

                    indexFinger.placeOn($drag1);
                    //Drag 10px up
                    indexFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);

                    middleFinger.placeOn($drag2);
                    // Drag 10px up
                    middleFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(true);

                    // Drag 10px down
                    middleFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);

                    // Drag 10px down
                    indexFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);
                });
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
