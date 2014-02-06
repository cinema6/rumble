(function() {
    'use strict';

    define(['vast_card'], function() {
        describe('VastCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                VastCardCtrl;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    VastCardCtrl = $controller('VastCardController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(VastCardCtrl).toEqual(jasmine.any(Object));
            });
        });
    });
}());
