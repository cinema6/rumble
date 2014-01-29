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

                        this.post = jasmine.createSpy('CommentsService.post()');
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
                    $scope.Ctrl = CommentsModuleCtrl;
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
                    describe('commentsByFriends()', function() {
                        describe('if comments are null', function() {
                            it('should be null', function() {
                                expect(CommentsModuleCtrl.commentsByFriends()).toBeNull();
                            });
                        });

                        describe('if comments are set', function() {
                            var comments;

                            beforeEach(function() {
                                comments = CommentsModuleCtrl.comments = [
                                    {
                                        user: {
                                            isFriend: true
                                        }
                                    },
                                    {
                                        user: {}
                                    },
                                    {
                                        user: {
                                            isFriend: true
                                        }
                                    },
                                    {
                                        user: {
                                            isFriend: true
                                        }
                                    },
                                    {
                                        user: {}
                                    }
                                ];
                            });

                            it('should return the comments made by friends', function() {
                                expect(CommentsModuleCtrl.commentsByFriends()).toEqual([
                                    comments[0],
                                    comments[2],
                                    comments[3]
                                ]);
                            });
                        });
                    });

                    describe('commentsByStrangers()', function() {
                        describe('if comments are null', function() {
                            it('should be null', function() {
                                expect(CommentsModuleCtrl.commentsByStrangers()).toBeNull();
                            });
                        });

                        describe('if comments are set', function() {
                            var comments;

                            beforeEach(function() {
                                comments = CommentsModuleCtrl.comments = [
                                    {
                                        user: {
                                            isFriend: true
                                        }
                                    },
                                    {
                                        user: {}
                                    },
                                    {
                                        user: {
                                            isFriend: true
                                        }
                                    },
                                    {
                                        user: {
                                            isFriend: true
                                        }
                                    },
                                    {
                                        user: {}
                                    }
                                ];
                            });

                            it('should return the comments made by strangers', function() {
                                expect(CommentsModuleCtrl.commentsByStrangers()).toEqual([
                                    comments[1],
                                    comments[4]
                                ]);
                            });
                        });
                    });

                    describe('showFriendsFirst', function() {
                        it('should be true', function() {
                            expect(CommentsModuleCtrl.showFriendsFirst).toBe(true);
                        });
                    });

                    describe('comments', function() {
                        it('should be initialized as null', function() {
                            expect(CommentsModuleCtrl.comments).toBeNull();
                        });
                    });

                    describe('sortOptions', function() {
                        it('should map to bool values', function() {
                            expect(CommentsModuleCtrl.sortOptions).toEqual({
                                'Show my friends first': true,
                                'Show chronologically': false
                            });
                        });
                    });

                    describe('userComment', function() {
                        var userComment;

                        beforeEach(function() {
                            userComment = CommentsModuleCtrl.userComment;
                        });

                        describe('message', function() {
                            it('should be null', function() {
                                expect(userComment.message).toBeNull();
                            });
                        });

                        describe('post()', function() {
                            it('should post to the CommentsService with the cardId and message', function() {
                                userComment.message = 'Foo';
                                userComment.post();
                                expect(CommentsService.post).toHaveBeenCalledWith($scope.cardId, 'Foo');

                                userComment.message = 'SUSHI PALACE';
                                userComment.post();
                                expect(CommentsService.post).toHaveBeenCalledWith($scope.cardId, 'SUSHI PALACE');
                            });

                            it('should reset the message', function() {
                                userComment.message = 'Foo';
                                userComment.post();
                                expect(userComment.message).toBeNull();

                                userComment.message = 'Test';
                                userComment.post();
                                expect(userComment.message).toBeNull();
                            });
                        });
                    });
                });
            });
        });
    });
}());
