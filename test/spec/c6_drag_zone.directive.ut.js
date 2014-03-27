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

            it('should make its data available via jqLite .data()', function() {
                var $dragSpace, $zone, scope, Ctrl;

                $scope.$apply(function() {
                    $dragSpace = $compile('<c6-drag-space controller-as="Ctrl"><div id="zone" c6-drag-zone>Zone</div></c6-drag-space>')($scope);
                });
                $zone = $dragSpace.find('#zone');
                scope = $zone.scope();
                Ctrl = scope.Ctrl;

                expect($zone.data('cDragZone')).toBe(Ctrl.zones.zone);
            });

            describe('when a draggable is above', function() {
                var $dragSpace;

                beforeEach(function() {
                    $dragSpace = $('<c6-drag-space controller-as="Ctrl"><div id="zone1" c6-drag-zone style="height: 50px; margin-bottom: 5px">Zone 1</div><span id="drag1" c6-draggable style="display: inline-block; width: 50px; height: 50px; vertical-align: top;">Drag 1</span></c6-drag-space>');
                    testFrame.$body.append($dragSpace);

                    $scope.$apply(function() {
                        $compile($dragSpace)($scope);
                    });
                });

                it('should add the "c6-drag-zone-primary" "c6-drag-zone-primary-of-draggableId" when it is a draggable\'s primaryZone', function() {
                    var finger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $zone2 = $('<div id="zone2" c6-drag-zone style="display: inline-block; width: 50px; height: 50px; margin-right: 1px;"></div>'),
                        $drag1 = $dragSpace.find('#drag1');

                    $zone1.css({
                        display: 'inline-block',
                        verticalAlign: 'top',
                        width: '50px',
                        margin: '0'
                    });
                    $zone2.insertAfter($zone1);
                    $scope.$apply(function() {
                        $compile($zone2)($scope);
                    });

                    finger.placeOn($drag1);
                    finger.drag(0, 0);
                    expect($zone1.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);

                    // Move 26px to the left
                    finger.drag(-26, 0);
                    expect($zone1.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary-of-drag1')).toBe(true);

                    // Move 35px to the left
                    finger.drag(-35, 0);
                    expect($zone1.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary-of-drag1')).toBe(true);

                    // Move 10px to the left
                    finger.drag(-10, 0);
                    expect($zone1.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary-of-drag1')).toBe(true);

                    // Move 10px to the left
                    finger.drag(-10, 0);
                    expect($zone1.hasClass('c6-drag-zone-primary')).toBe(true);
                    expect($zone2.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-primary-of-drag1')).toBe(true);
                    expect($zone2.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);

                    // Move 60px down
                    finger.drag(0, 60);
                    expect($zone1.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);
                    expect($zone2.hasClass('c6-drag-zone-primary-of-drag1')).toBe(false);
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
