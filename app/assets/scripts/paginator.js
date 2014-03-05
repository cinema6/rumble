(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('mrPaginator', ['assetFilter','c6Computed',
        function                  ( assetFilter , c6Computed ) {
            return {
                restrict: 'E',
                scope: {
                    length: '=',
                    current: '='
                },
                templateUrl: assetFilter('directives/paginator.html', 'views'),
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
