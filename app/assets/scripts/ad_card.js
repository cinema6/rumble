(function(){
    'use strict';

    angular.module('c6.rumble')
        .directive('adCard',[ '$log', '$compile',
        function            (  $log ,  $compile ) {
            $log = $log.context('<ad-card>');

            function fnLink(scope, $element) {
                var data = scope.config.data,
                    type = scope.profile.flash ? 'vpaid' : 'vast',
                    innerCard;

                innerCard = '<' + type + '-card';

                for (var key in data) {
                    if((key !== 'type') && (data.hasOwnProperty(key))) {
                        innerCard += ' ' + key.toLowerCase() + '="' + data[key] + '"';
                    }
                }

                innerCard += '></' + type + '-card>';

                $element.append($compile(innerCard)(scope));

            }

            return {
                restrict: 'E',
                link: fnLink
            };
        }]);

}());