(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('EditorController', ['cModel','c6State',
        function                        ( cModel , c6State ) {
            this.model = cModel;

            this.editCard = function(card) {
                c6State.transitionTo('editor.editCard', { id: card.id });
            };

            this.newCard = function() {
                c6State.transitionTo('editor.newCard.type');
            };
        }])

        .controller('EditCardController', ['$scope','cModel','c6Computed','c6UrlParser','c6State','VideoService',
        function                          ( $scope , cModel , c6Computed , c6UrlParser , c6State , VideoService ) {
            var c = c6Computed($scope);

            this.model = cModel;
            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.close = function() {
                c6State.transitionTo('editor', { id: $scope.EditorCtrl.model.id });
            };
        }])

        .controller('NewCardTypeController', ['cModel','c6State',
        function                             ( cModel , c6State ) {
            this.model = cModel;
            this.type = null;

            this.edit = function() {
                var type = this.type;

                if (!type) {
                    throw new Error('Can\'t edit before a type is chosen.');
                }

                c6State.transitionTo('editor.newCard.edit', { type: type });
            };
        }])

        .controller('NewCardEditController', ['cModel',
        function                             ( cModel ) {
            this.model = cModel;
        }])

        .directive('videoPreview', ['c6UrlMaker',
        function                   ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_preview.html'),
                scope: {
                    service: '@',
                    videoid: '@'
                }
            };
        }]);
}());
