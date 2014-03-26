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
                    var finger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $drag1 = $dragSpace.find('#drag1');

                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);

                    finger.placeOn($drag1);
                    // Drag 10px up
                    finger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    // Drag 10px down
                    finger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);
                });
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
