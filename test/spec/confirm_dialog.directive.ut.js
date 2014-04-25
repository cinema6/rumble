(function() {
    'use strict';

    define(['app'], function() {
        describe('<confirm-dialog>', function() {
            var $rootScope,
                $scope,
                $compile,
                ConfirmDialogService,
                $confirm;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $confirm = $compile('<confirm-dialog></confirm-dialog>')($scope);
                    });
                });
            });

            it('should set its scope.model propertry to be the ConfirmDialogService\'s model', function() {
                expect($confirm.isolateScope().model).toBe(ConfirmDialogService.model);
            });
        });
    });
}());
