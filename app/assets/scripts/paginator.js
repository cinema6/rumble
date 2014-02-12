(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('mrPaginator', ['c6UrlMaker','c6Computed',
        function                  ( c6UrlMaker , c6Computed ) {
            return {
                restrict: 'E',
                scope: {
                    length: '=',
                    current: '='
                },
                templateUrl: c6UrlMaker('views/directives/paginator.html'),
                link: function(scope) {
                    var c = c6Computed(scope);

                    c(scope, 'indices', function() {
                        var length = this.length,
                            array = [],
                            index = 0;

                        for ( ; index < length; index++) {
                            array.push(index);
                        }

                        return array;
                    }, ['length']);
                }
            };
        }]);
}());
