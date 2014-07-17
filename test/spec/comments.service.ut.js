define(['services','c6ui'], function(servicesModule, c6uiModule) {
    'use strict';

    describe('CommentsService', function() {
        var $rootScope,
            $q,
            CommentsService,
            _private;

        var $window,
            currentTime;

        beforeEach(function() {
            currentTime = 1391011589127;

            module('ng', function($provide) {
                $provide.factory('$window', function() {
                    var $window = {};

                    function MockDate() {

                    }
                    MockDate.now = function() {
                        return currentTime;
                    };

                    $window.Date = MockDate;

                    return $window;
                });
            });

            module(c6uiModule.name, function($provide) {
                $provide.value('cinema6', {});
            });

            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                $window = $injector.get('$window');

                CommentsService = $injector.get('CommentsService');
                _private = CommentsService._private;
            });
        });

        it('should exist', function() {
            expect(CommentsService).toEqual(jasmine.any(Object));
        });

        describe('@public', function() {
            describe('methods', function() {
                describe('init(id)', function() {
                    it('should set the mrId', function() {
                        CommentsService.init('r-3758r4hf');
                        expect(_private.mrId).toBe('r-3758r4hf');

                        CommentsService.init('r-vdw6d37r');
                        expect(_private.mrId).toBe('r-vdw6d37r');
                    });

                    it('should create a cache for the comments', function() {
                        var cache;

                        CommentsService.init('r-123');
                        cache = _private.cache.get('r-123');
                        expect(cache).toEqual(jasmine.any(Object));
                        expect(cache.get).toEqual(jasmine.any(Function));
                        expect(cache.put).toEqual(jasmine.any(Function));

                        CommentsService.init('r-abc');
                        cache = _private.cache.get('r-abc');
                        expect(cache).toEqual(jasmine.any(Object));
                        expect(cache.get).toEqual(jasmine.any(Function));
                        expect(cache.put).toEqual(jasmine.any(Function));
                    });
                });

                describe('push(id, comments)', function() {
                    beforeEach(function() {
                        CommentsService.init('r-123');
                    });

                    it('should add the comments to the correct cache', function() {
                        var comments = [],
                            comments2 = [];

                        CommentsService.push('rc-1', comments);
                        expect(_private.cache.get('r-123').get('rc-1')).toBe(comments);

                        CommentsService.push('rc-2', comments2);
                        expect(_private.cache.get('r-123').get('rc-2')).toBe(comments2);
                    });
                });

                describe('fetch(id)', function() {
                    var success,
                        failure;

                    beforeEach(function() {
                        success = jasmine.createSpy('success');
                        failure = jasmine.createSpy('failure');

                        CommentsService.init('r-123');
                    });

                    it('should return a promise', function() {
                        var promise = CommentsService.fetch();

                        expect(promise).toEqual(jasmine.any(Object));
                        expect(promise.then).toEqual(jasmine.any(Function));
                    });

                    describe('if the service hasn\'t been initialized', function() {
                        beforeEach(function() {
                            _private.mrId = null;

                            $rootScope.$apply(function() {
                                CommentsService.fetch('rc-2').then(null, failure);
                            });
                        });

                        it('should reject the promise', function() {
                            expect(failure).toHaveBeenCalledWith('Service has not been initialized with CommentsService.init(id)!');
                        });
                    });

                    describe('if the comments are in the cache', function() {
                        var comments1,
                            comments2;

                        beforeEach(function() {
                            var cache = _private.cache.get('r-123');

                            comments1 = [];
                            comments2 = [];

                            cache.put('r-1', comments1);
                            cache.put('r-2', comments2);
                        });

                        it('should resolve the promise with the cached value', function() {
                            $rootScope.$apply(function() {
                                CommentsService.fetch('r-1').then(success);
                            });
                            expect(success).toHaveBeenCalledWith(comments1);

                            $rootScope.$apply(function() {
                                CommentsService.fetch('r-2').then(success);
                            });
                            expect(success).toHaveBeenCalledWith(comments2);
                        });
                    });

                    describe('if the comments are not in the cache', function() {
                        it('should reject the promise', function() {
                            $rootScope.$apply(function() {
                                CommentsService.fetch('r-1').catch(failure);
                            });
                            expect(failure).toHaveBeenCalledWith({ code: 404, message: 'Could not find comments with id: r-1.' });

                            $rootScope.$apply(function() {
                                CommentsService.fetch('r-2').catch(failure);
                            });
                            expect(failure).toHaveBeenCalledWith({ code: 404, message: 'Could not find comments with id: r-2.' });
                        });
                    });
                });

                describe('post(id, message)', function() {
                    var cache;

                    beforeEach(function() {
                        CommentsService.init('r-123');

                        cache = _private.cache.get('r-123');
                    });

                    describe('if there are no comments for the card', function() {
                        it('should create a new array with the comment', function() {
                            CommentsService.post('r-1', 'This is a comment.');
                            expect(cache.get('r-1')[0]).toEqual({
                                user: {
                                    pic: 'anonymous.png',
                                    name: 'Anonymous'
                                },
                                date: 1391011589,
                                message: 'This is a comment.'
                            });
                        });
                    });

                    describe('if there are comments for the card', function() {
                        beforeEach(function() {
                            cache.put('r-1', [{
                                user: {
                                    pic: 'anonymous.png',
                                    name: 'Anonymous'
                                },
                                date: 1391011589,
                                message: 'This is a comment.'
                            }]);
                        });

                        it('should "unshift()" the comment onto the array', function() {
                            CommentsService.post('r-1', 'Hello Moo!');
                            expect(cache.get('r-1')[0]).toEqual({
                                user: {
                                    pic: 'anonymous.png',
                                    name: 'Anonymous'
                                },
                                date: 1391011589,
                                message: 'Hello Moo!'
                            });

                            currentTime = 1391012385999;
                            CommentsService.post('r-1', 'Evan, stop throwing stuff at me.');
                            expect(cache.get('r-1')[0]).toEqual({
                                user: {
                                    pic: 'anonymous.png',
                                    name: 'Anonymous'
                                },
                                date: 1391012385,
                                message: 'Evan, stop throwing stuff at me.'
                            });
                        });
                    });
                });
            });
        });

        describe('@private', function() {
            describe('properties', function() {
                describe('mrId', function() {
                    it('should be initialized null', function() {
                        expect(_private.mrId).toBeNull();
                    });
                });

                describe('cache', function() {
                    it('should be a cache', function() {
                        var cache = _private.cache;

                        expect(cache).toEqual(jasmine.any(Object));
                        expect(cache.get).toEqual(jasmine.any(Function));
                        expect(cache.put).toEqual(jasmine.any(Function));
                    });
                });
            });
        });
    });
});
