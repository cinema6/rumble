(function() {
    'use strict';

    define(['manager'], function() {
        describe('NewModeController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6State,
                NewModeCtrl;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    NewModeCtrl = $controller('NewModeController', { $scope: $scope });
                    NewModeCtrl.model = {
                        minireel: {
                            id: 'e-123',
                            mode: 'light'
                        }
                    };
                });
            });

            it('should exist', function() {
                expect(NewModeCtrl).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('launchEditor(mode)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        NewModeCtrl.launchEditor('foo');
                    });

                    it('should set the experience\'s mode to the provided mode', function() {
                        expect(NewModeCtrl.model.minireel.mode).toBe('foo');
                    });

                    it('should go to the editor state with the id of the new minireel', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor', { minireelId: 'e-123' });
                    });
                });
            });
        });
    });
}());
