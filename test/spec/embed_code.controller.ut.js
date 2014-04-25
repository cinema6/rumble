(function() {
    'use strict';

    define(['app'], function() {
        describe('EmbedCodeController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                cinema6,
                EmbedCodeCtrl;

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
                    $scope.minireelId = 'e-0277a8c7564f87';
                    EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(EmbedCodeCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('mode', function() {
                    it('should be initialized as responsive', function() {
                        expect(EmbedCodeCtrl.mode).toBe('responsive');
                    });
                });

                describe('modes', function() {
                    it('should be the options for embedding', function() {
                        expect(EmbedCodeCtrl.modes).toEqual([
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
                        expect(EmbedCodeCtrl.size).toEqual({
                            width: 650,
                            height: 522
                        });
                    });
                });

                describe('code', function() {
                    beforeEach(function() {
                        EmbedCodeCtrl.c6EmbedSrc = 'embed.js';
                    });

                    describe('if the size is responsive', function() {
                        it('should be a responsive embed code', function() {
                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87"></script>'
                            );
                        });
                    });

                    describe('if the size is explicit', function() {
                        beforeEach(function() {
                            EmbedCodeCtrl.mode = 'custom';
                        });

                        it('should be an explicit embed code', function() {
                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-width="650" data-height="522"></script>'
                            );
                        });

                        it('should update if the dimensions are updated', function() {
                            EmbedCodeCtrl.size.height = 300;
                            EmbedCodeCtrl.size.width = 400;

                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-width="400" data-height="300"></script>'
                            );
                        });
                    });
                });

                describe('c6EmbedSrc', function() {
                    it('should be initialized as null', function() {
                        expect(EmbedCodeCtrl.c6EmbedSrc).toBeNull();
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

                        expect(EmbedCodeCtrl.c6EmbedSrc).toBe('//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js');
                    });
                });
            });
        });
    });
}());