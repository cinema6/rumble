(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorController', function() {
            var $rootScope,
                $scope,
                $controller,
                EditorCtrl;

            var cModel;

            beforeEach(function() {
                cModel = {};

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    EditorCtrl = $controller('EditorController', { $scope: $scope, cModel: cModel });
                });
            });

            it('should exist', function() {
                expect(EditorCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                it('should put a reference to the model on itself', function() {
                    expect(EditorCtrl.model).toBe(cModel);
                });
            });
        });
    });
}());
