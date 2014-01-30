(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('commentsModule', ['c6UrlMaker',
        function                     ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/comments_module.html'),
                controller: 'CommentsModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    cardId: '@',
                    fetchCommentsWhen: '='
                }
            };
        }])

        .controller('CommentsModuleController', ['$scope','CommentsService','c6Computed',
        function                                ( $scope , CommentsService , c          ) {
            var self = this;

            this.comments = null;
            this.commentsByFriends = c($scope, function(comments) {
                return (comments ? comments.filter(function(comment) {
                    return comment.user.isFriend;
                }) : null);
            }, ['Ctrl.comments', 'Ctrl.comments.length']);
            this.commentsByStrangers = c($scope, function(comments) {
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
}());
