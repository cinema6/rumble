(function() {
    'use strict';

    define(['app'], function() {
        describe('cinema6', function() {
            var cinema6,
                $rootScope;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    cinema6 = $injector.get('cinema6');
                    $rootScope = $injector.get('$rootScope');
                });
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('db.mock(query, value)', function() {
                        var db;

                        beforeEach(function() {
                            db = cinema6.db;
                        });

                        it('should cause db.find() to resolve its promise to a copy of the value provided for the query', function() {
                            var spy = jasmine.createSpy('db.find() success handler'),
                                item2 = {
                                    id: '2',
                                    test: 'foo',
                                    okay: {}
                                },
                                item7 = {
                                    id: '7',
                                    org: 'cinema6',
                                    name: 'C6'
                                };

                            db.mock({ id: '2' }, item2);
                            $rootScope.$apply(function() {
                                db.find({ id: '2' }).then(spy);
                            });
                            expect(spy).toHaveBeenCalledWith(item2);
                            expect(spy.mostRecentCall.args[0]).not.toBe(item2);

                            db.mock({ org: 'cinema6', name: 'C6' }, item7);
                            $rootScope.$apply(function() {
                                db.find({ org: 'cinema6', name: 'C6' }).then(spy);
                            });
                            expect(spy).toHaveBeenCalledWith(item7);
                            expect(spy.mostRecentCall.args[0]).not.toBe(item7);
                        });

                        it('should return a reference to "db"', function() {
                            expect(db.mock({})).toBe(db);
                        });
                    });

                    describe('db.find(query)', function() {
                        var db;

                        beforeEach(function() {
                            db = cinema6.db;
                        });

                        it('should return a promise', function() {
                            expect(typeof db.find().then).toBe('function');
                        });

                        describe('if there is no mock provided', function() {
                            it('should reject the promise with a 404', function() {
                                var spy = jasmine.createSpy('db.find() error handler');

                                $rootScope.$apply(function() {
                                    db.find({ id: '8' }).catch(spy);
                                });
                                expect(spy).toHaveBeenCalledWith({ code: 404, message: 'Could not find experience with query: "{"id":"8"}"' });
                            });
                        });

                        describe('if there is a mock provided', function() {
                            it('should resolve the promise with a copy of the mock', function() {
                                var spy = jasmine.createSpy('db.find() success handler'),
                                    item2 = {
                                        id: '2',
                                        test: 'foo',
                                        okay: {}
                                    },
                                    item7 = {
                                        id: '7',
                                        org: 'cinema6',
                                        name: 'C6'
                                    };

                                db.mock({ id: '2' }, item2)
                                    .mock({ org: 'cinema6', name: 'C6' }, item7);

                                $rootScope.$apply(function() {
                                    db.find({ id: '2' }).then(spy);
                                });
                                expect(spy).toHaveBeenCalledWith(item2);
                                expect(spy.mostRecentCall.args[0]).not.toBe(item2);

                                $rootScope.$apply(function() {
                                    db.find({ org: 'cinema6', name: 'C6' }).then(spy);
                                });
                                expect(spy).toHaveBeenCalledWith(item7);
                                expect(spy.mostRecentCall.args[0]).not.toBe(item7);
                            });
                        });
                    });
                });
            });
        });
    });
}());
