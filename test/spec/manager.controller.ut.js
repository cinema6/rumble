(function() {
    'use strict';

    define(['manager'], function() {
        describe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                ManagerCtrl;

            var model;

            beforeEach(function() {
                model = [];

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    ManagerCtrl = $controller('ManagerController', { $scope: $scope, cModel: model });
                });
            });

            it('should exist', function() {
                expect(ManagerCtrl).toEqual(jasmine.any(Object));
            });

            describe('construction', function() {
                it('should put its model on itself', function() {
                    expect(ManagerCtrl.model).toBe(model);
                });
            });
        });
    });
}());
