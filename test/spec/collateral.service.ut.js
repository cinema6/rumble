(function() {
    'use strict';

    define(['services'], function() {
        describe('CollateralService', function() {
            var $rootScope,
                $q,
                CollateralService,
                FileService;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    FileService = $injector.get('FileService');
                    $q = $injector.get('$q');

                    CollateralService = $injector.get('CollateralService');
                });
            });

            it('should exist', function() {
                expect(CollateralService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('set(key, file, experience)', function() {
                    var experience, splashImage,
                        uploadDeferred, splashImageWrapper,
                        result, success, notify;

                    beforeEach(function() {
                        splashImage = {};
                        splashImageWrapper = {
                            file: splashImage,
                            url: 'http://localhost:9000/f7394fn83'
                        };
                        experience = {
                            collateral: {}
                        };
                        uploadDeferred = $q.defer();

                        spyOn(FileService, 'upload')
                            .and.returnValue(uploadDeferred.promise);
                        spyOn(FileService, 'open')
                            .and.returnValue(splashImageWrapper);

                        success = jasmine.createSpy('set success');
                        notify = jasmine.createSpy('set notify');

                        $rootScope.$apply(function() {
                            result = CollateralService.set('splash', splashImage, experience);

                            result.then(success, null, notify);
                        });
                    });

                    it('should upload the file to the collateral service', function() {
                        expect(FileService.open).toHaveBeenCalledWith(splashImage);
                        expect(FileService.upload).toHaveBeenCalledWith('/api/collateral/files', [splashImageWrapper]);
                    });

                    it('should attach the progress state of the upload to the promise', function() {
                        var state1 = {
                                uploaded: 45,
                                total: 1024,
                                complete: 45 / 1024
                            },
                            state2 = {
                                uploaded: 356,
                                total: 1024,
                                complete: 356 / 1024
                            },
                            state3 = {
                                uploaded: 674,
                                total: 1024,
                                complete: 674 / 1024
                            };

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state1);
                        });
                        expect(result.progress).toBe(state1);
                        expect(notify).toHaveBeenCalledWith(state1);

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state2);
                        });
                        expect(result.progress).toBe(state2);
                        expect(notify).toHaveBeenCalledWith(state2);

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state3);
                        });
                        expect(result.progress).toBe(state3);
                        expect(notify).toHaveBeenCalledWith(state3);
                    });

                    describe('after the upload is complete', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                uploadDeferred.resolve({
                                    status: 201,
                                    data: [
                                        {
                                            name: 'splash',
                                            code: 201,
                                            path: 'collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg'
                                        }
                                    ]
                                });
                            });
                        });

                        it('should set the collateral asset\'s path to the provided key on the collateral object of the experience', function() {
                            expect(experience.collateral.splash).toBe('/collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg');
                        });

                        it('should resolve to the experience', function() {
                            expect(success).toHaveBeenCalledWith(experience);
                        });
                    });
                });
            });
        });
    });
}());
