define (['angular','c6ui'],
function( angular , c6ui ) {
    'use strict';

    return angular.module('c6.mrplayer.modules.comments', [c6ui.name])
        .directive('commentsModule', ['assetFilter',
        function                     ( assetFilter ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/comments_module.html', 'views'),
                controller: 'CommentsModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    cardId: '@',
                    fetchCommentsWhen: '='
                }
            };
        }])

        .controller('CommentsModuleController', ['$scope','CommentsService','c6Computed',
        function                                ( $scope , CommentsService , c6Computed ) {
            var self = this,
                c = c6Computed($scope);

            this.comments = null;
            c(this, 'commentsByFriends', function() {
                var comments = this.comments;

                return (comments ? comments.filter(function(comment) {
                    return comment.user.isFriend;
                }) : null);
            }, ['Ctrl.comments', 'Ctrl.comments.length']);
            c(this, 'commentsByStrangers', function() {
                var comments = this.comments;

                return (comments ? comments.filter(function(comment) {
                    return !comment.user.isFriend;
                }) : null);
            }, ['Ctrl.comments', 'Ctrl.comments.length']);

            this.showFriendsFirst = true;
            this.sortOptions = {
                'Show my friends first': true,
                'Show chronologically': false
            };

            this.userComment = {
                message: null,
                post: function() {
                    CommentsService.post($scope.cardId, this.message);

                    this.message = null;
                }
            };

            $scope.$watch('fetchCommentsWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                CommentsService.fetch($scope.cardId)
                    .then(function(comments) {
                        self.comments = comments;
                    });
            });
        }]);
});
