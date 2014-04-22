(function() {
    'use strict';

    define(['editor'], function() {
        describe('EmbedController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                cinema6,
                EditorCtrl,
                EmbedCtrl;

            var getAppDataDeferred;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');

                    getAppDataDeferred = $q.defer();
                    spyOn(cinema6, 'getAppData').and.returnValue(getAppDataDeferred.promise);

                    $scope = $rootScope.$new();
                    EditorCtrl = $scope.EditorCtrl = {
                        model: {
                            id: 'e-0277a8c7564f87'
                        }
                    };
                    EmbedCtrl = $controller('EmbedController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(EmbedCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('mode', function() {
                    it('should be initialized as responsive', function() {
                        expect(EmbedCtrl.mode).toBe('responsive');
                    });
                });

                describe('modes', function() {
                    it('should be the options for embedding', function() {
                        expect(EmbedCtrl.modes).toEqual([
                            {
                                name: 'Responsive Auto-fit *',
                                value: 'responsive'
                            },
                            {
                                name: 'Custom Size',
                                value: 'custom'
                            }
                        ]);
                    });
                });

                describe('size', function() {
                    it('should be initialized to a custom size', function() {
                        expect(EmbedCtrl.size).toEqual({
                            width: 650,
                            height: 522
                        });
                    });
                });

                describe('code', function() {
                    beforeEach(function() {
                        EmbedCtrl.c6EmbedSrc = 'embed.js';
                    });

                    describe('if the size is responsive', function() {
                        it('should be a responsive embed code', function() {
                            expect(EmbedCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87"></script>'
                            );
                        });
                    });

                    describe('if the size is explicit', function() {
                        beforeEach(function() {
                            EmbedCtrl.mode = 'custom';
                        });

                        it('should be an explicit embed code', function() {
                            expect(EmbedCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-width="650" data-height="522"></script>'
                            );
                        });

                        it('should update if the dimensions are updated', function() {
                            EmbedCtrl.size.height = 300;
                            EmbedCtrl.size.width = 400;

                            expect(EmbedCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-width="400" data-height="300"></script>'
                            );
                        });
                    });
                });

                describe('c6EmbedSrc', function() {
                    it('should be initialized as null', function() {
                        expect(EmbedCtrl.c6EmbedSrc).toBeNull();
                    });

                    it('should be the value set in the experience when the appData is fetched', function() {
                        $scope.$apply(function() {
                            getAppDataDeferred.resolve({
                                experience: {
                                    data: {
                                        c6EmbedSrc: '//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js'
                                    }
                                }
                            });
                        });

                        expect(EmbedCtrl.c6EmbedSrc).toBe('//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js');
                    });
                });
            });
        });
    });
}());
