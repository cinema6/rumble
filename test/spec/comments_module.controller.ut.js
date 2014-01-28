(function() {
    'use strict';

    define(['comments_module'], function() {
        describe('CommentsModuleController', function() {
            var $rootScope,
                $scope,
                $controller,
                CommentsModuleCtrl;

            var CommentsService;

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.service('CommentsService', function($q) {
                        var self = this;

                        this._ = {
                            fetchDeferred: $q.defer()
                        };

                        this.fetch = jasmine.createSpy('CommentsService.fetch()')
                            .andCallFake(function() {
                                return self._.fetchDeferred.promise;
                            });
                    });
                });

                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    CommentsService = $injector.get('CommentsService');

                    $scope = $rootScope.$new();
                    $scope.cardId = 'rc-76tfg5467ug';
                    $scope.fetchCommentsWhen = false;

                    CommentsModuleCtrl = $controller('CommentsModuleController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(CommentsModuleCtrl).toEqual(jasmine.any(Object));
            });

            describe('$watchers', function() {
                describe('fetchCommentsWhen', function() {
                    beforeEach(function() {
                        expect(CommentsService.fetch).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            $scope.fetchCommentsWhen = true;
                        });
                    });

                    it('should get comments for the card', function() {
                        var comments = [{}, {}, {}];

                        expect(CommentsService.fetch).toHaveBeenCalledWith($scope.cardId);

                        $scope.$apply(function() {
                            CommentsService._.fetchDeferred.resolve(comments);
                        });

                        expect(CommentsModuleCtrl.comments).toBe(comments);
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('comments', function() {
                        it('should be initialized as null', function() {
                            expect(CommentsModuleCtrl.comments).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
