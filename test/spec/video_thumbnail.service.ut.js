(function() {
    'use strict';

    define(['services'], function() {
        describe('VideoThumbnailService', function() {
            var $rootScope,
                $q,
                VideoThumbnailService;

            var _private;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    VideoThumbnailService = $injector.get('VideoThumbnailService');
                    _private = VideoThumbnailService._private;
                });
            });

            it('should exist', function() {
                expect(VideoThumbnailService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('methods', function() {
                    describe('fetchYouTubeThumbs(videoid)', function() {
                        var success;

                        beforeEach(function() {
                            success = jasmine.createSpy('fetchYouTubeThumbs()');

                            $rootScope.$apply(function() {
                                _private.fetchYouTubeThumbs('abc123').then(success);
                            });
                        });

                        it('should return an object that has thumbnail urls for the video', function() {
                            var model = success.calls.mostRecent().args[0];

                            expect(model.small).toBe('http://img.youtube.com/vi/abc123/2.jpg');
                            expect(model.large).toBe('http://img.youtube.com/vi/abc123/0.jpg');
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('getThumbsFor(service, videoid)', function() {
                        var result;

                        describe('youtube', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchYouTubeThumbs')
                                    .and.returnValue($q.when({
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }));

                                result = VideoThumbnailService.getThumbsFor('youtube', '12345');
                            });

                            it('should imediately retrun an object with null properties', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });

                            it('should cache the model', function() {
                                expect(VideoThumbnailService.getThumbsFor('youtube', '12345')).toBe(result);

                                expect(VideoThumbnailService.getThumbsFor('youtube', 'abc123')).not.toBe(result);
                            });
                        });

                        describe('an unknown service', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = VideoThumbnailService.getThumbsFor('foo', 'abc');
                                });
                            });

                            it('should return an empty model', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });
                        });
                    });
                });
            });
        });
    });
}());
