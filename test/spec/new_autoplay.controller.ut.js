(function() {
    'use strict';

    define(['manager'], function() {
        describe('NewAutoplayController', function() {
            var $rootScope,
                $scope,
                $controller,
                NewAutoplayCtrl;

            var NewCtrl;

            var minireel;

            beforeEach(function() {
                minireel = {
                    mode: 'full'
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    $scope.NewCtrl = NewCtrl = {
                        model: {
                            /* jshint quotmark:false */
                            modes: [
                                {
                                    "modes": [
                                        {
                                            "value": "lightbox"
                                        },
                                        {
                                            "value": "lightbox-ads"
                                        }
                                    ]
                                },
                                {
                                    "modes": [
                                        {
                                            "value": "light"
                                        },
                                        {
                                            "value": "full"
                                        }
                                    ]
                                }
                            ]
                            /* jshint quotmark:single */
                        }
                    };
                    $scope.$apply(function() {
                        NewAutoplayCtrl = $controller('NewAutoplayController', { $scope: $scope });
                        NewAutoplayCtrl.model = minireel;
                    });
                });
            });

            it('should exist', function() {
                expect(NewAutoplayCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('modeData', function() {
                    it('should be the mode data for its model\'s mode', function() {
                        expect(NewAutoplayCtrl.modeData).toBe(NewCtrl.model.modes[1].modes[1]);

                        minireel.mode = 'light';
                        expect(NewAutoplayCtrl.modeData).toBe(NewCtrl.model.modes[1].modes[0]);

                        minireel.mode = 'lightbox-ads';
                        expect(NewAutoplayCtrl.modeData).toBe(NewCtrl.model.modes[0].modes[1]);

                        minireel.mode = 'lightbox';
                        expect(NewAutoplayCtrl.modeData).toBe(NewCtrl.model.modes[0].modes[0]);
                    });
                });
            });
        });
    });
}());
