define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.modules.post', [])
        .directive('postModule', ['assetFilter',
        function                 ( assetFilter ) {
            return {
                restrict: 'E',
                scope: {
                    active: '=',
                    onReplay: '&',
                    sponsorHref: '@',
                    onDismiss: '&'
                },
                templateUrl: assetFilter('directives/post_module.html', 'views')
            };
        }]);
});
