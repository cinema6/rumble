(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('EditorController', ['cModel','c6State',
        function                        ( cModel , c6State ) {
            this.model = cModel;

            this.editCard = function(card) {
                c6State.transitionTo('editor.editCard', { id: card.id });
            };
        }])

        .controller('EditCardController', ['$scope','cModel','c6Computed','c6UrlParser','c6State',
        function                          ( $scope , cModel , c6Computed , c6UrlParser , c6State ) {
            var c = c6Computed($scope);

            this.model = cModel;

            this.videoUrlBuffer = '';
            c(this, 'videoUrl', function(url) {
                var data = this.model.data,
                    service = data.service,
                    id = data.videoid,
                    self = this;

                function parseVideoUrl(url) {
                    var parsed = c6UrlParser(url),
                        service = parsed.host
                            .replace(/^www\./, '')
                            .replace(/\.com$/, ''),
                        idFetchers = {
                            youtube: function(url) {
                                var queryParams = (function() {
                                    var params = {};

                                    url.search.split('&').forEach(function(param) {
                                        var pair = param.split('=');

                                        params[pair[0]] = pair[1];
                                    });

                                    return params;
                                }());

                                return queryParams.v;
                            },
                            vimeo: function(url) {
                                return (url.pathname.match(/\d+/) || [])[0];
                            },
                            dailymotion: function(url) {
                                return (url.pathname.replace(/^\/video\//, '')
                                    .match(/[a-zA-Z0-9]+/) || [])[0];
                            }
                        };

                    data.service = (service.search(/youtube$|dailymotion$|vimeo$/) > -1) ?
                        service : null;
                    data.videoid = (idFetchers[service] || function() { return null; })(parsed);

                    self.videoUrlBuffer = url;

                    return url;
                }

                if (arguments.length) {
                    return parseVideoUrl(url);
                }

                if (!service || !id) {
                    return this.videoUrlBuffer;
                }

                switch (service) {

                case 'youtube':
                    return 'https://www.youtube.com/watch?v=' + id;
                case 'vimeo':
                    return 'http://vimeo.com/' + id;
                case 'dailymotion':
                    return 'http://www.dailymotion.com/video/' + id;

                }
            }, [
                'EditCardCtrl.model.data.service',
                'EditCardCtrl.model.data.videoid',
                'EditCardCtrl.videoUrlBuffer'
            ]);

            this.close = function() {
                c6State.transitionTo('editor', { id: $scope.EditorCtrl.model.id });
            };
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
