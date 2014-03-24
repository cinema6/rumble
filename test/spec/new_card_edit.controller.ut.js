(function() {
    'use strict';

    define(['editor'], function() {
        describe('NewCardEditController', function() {
            var $rootScope,
                $scope,
                $controller,
                NewCardEditCtrl;

            var model;

            beforeEach(function() {
                model = {};

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    NewCardEditCtrl = $controller('NewCardEditController', { $scope: $scope, cModel: model });
                });
            });

            it('should exist', function() {
                expect(NewCardEditCtrl).toEqual(jasmine.any(Object));
            });

            it('should put a reference to its model on itself', function() {
                expect(NewCardEditCtrl.model).toBe(model);
            });
        });
    });
}());
