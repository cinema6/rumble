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

        .controller('CommentsModuleController', ['$scope','CommentsService',
        function                                ( $scope , CommentsService ) {
            var self = this;

            this.comments = null;

            $scope.$watch('fetchCommentsWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                CommentsService.fetch($scope.cardId)
                    .then(function(comments) {
                        self.comments = comments;
                    });
            });
        }]);
}());
