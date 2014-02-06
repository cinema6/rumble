(function() {
    'use strict';

    define(['vast_card'], function() {
        describe('VastCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                VastCardCtrl;

            var VASTService,
                vast;

            beforeEach(function() {
                vast = {
                    video : {
                        mediaFiles:[]
                    },
                    getVideoSrc : jasmine.createSpy('getVideoSrc()').andReturn('http://www.videos.com/video.mp4')
                };

                module('c6.rumble.services', function($provide) {
                    $provide.provider('VASTService', function() {
                        this.$get = function($q) {
                            return {
                                getVAST : jasmine.createSpy('getVAST()').andReturn($q.when(vast))
                            };
                        };

                        this.adServerUrl = angular.noop;
                    });
                });
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    VASTService = $injector.get('VASTService');

                    $scope = $rootScope.$new();
                    $scope.onDeck = false;
                    $scope.active = false;
                    $scope.$apply(function() {
                        VastCardCtrl = $controller('VastCardController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(VastCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('@properties', function() {
                describe('videoSrc', function() {
                    it('should be null', function() {
                        expect(VastCardCtrl.videoSrc).toBeNull();
                    });
                });
            });

            describe('$watchers', function() {
                describe('onDeck', function() {
                    describe('when true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });
                        });

                        it('should call getVAST on the vast service', function() {
                            expect(VASTService.getVAST).toHaveBeenCalled();
                        });

                        describe('after the promise is resolved', function() {
                            it('should set videoSrc to vast video ad url', function() {
                                expect(vast.getVideoSrc).toHaveBeenCalledWith('video/mp4');
                                expect(VastCardCtrl.videoSrc).toBe('http://www.videos.com/video.mp4');
                            });
                        });
                    });

                    describe('when false', function() {
                        it('should not getVAST on the vast service', function() {
                            expect(VASTService.getVAST).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
