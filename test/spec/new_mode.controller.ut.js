(function() {
    'use strict';

    define(['manager'], function() {
        describe('NewModeController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6State,
                NewCtrl,
                NewModeCtrl;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    NewCtrl = $scope.NewCtrl = {
                        baseState: 'manager.new'
                    };
                    NewModeCtrl = $controller('NewModeController', { $scope: $scope });
                    NewModeCtrl.model = {
                        minireel: {
                            id: 'e-123',
                            mode: 'light',
                            data: {
                                autoplay: true
                            }
                        },
                        modes: [
                            {
                                value: 'light',
                                autoplayable: true
                            },
                            {
                                value: 'full',
                                autoplayable: false
                            }
                        ]
                    };
                });
            });

            it('should exist', function() {
                expect(NewModeCtrl).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('setMode()', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        NewModeCtrl.mode = NewModeCtrl.model.modes[0];
                        NewModeCtrl.setMode();
                    });

                    it('should set the experience\'s mode to the provided mode', function() {
                        expect(NewModeCtrl.model.minireel.mode).toBe('light');
                    });

                    it('should go to the editor state with the id of the new minireel', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith(NewCtrl.baseState + '.autoplay');
                    });

                    it('should make the minireel not autoplay if mode selected is not autoplayable', function() {
                        NewModeCtrl.mode = NewModeCtrl.model.modes[1];

                        NewModeCtrl.setMode();
                        expect(NewModeCtrl.model.minireel.data.autoplay).toBe(false);
                    });
                });
            });
        });
    });
}());
