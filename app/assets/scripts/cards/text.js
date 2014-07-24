define( ['angular','services'],
function( angular , services ) {
    'use strict';

    return angular.module('c6.rumble.cards.text', [services.name])
        .directive('textCard', ['assetFilter',
        function               ( assetFilter ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/text_card.html', 'views'),
                controller: 'TextCardController',
                controllerAs: 'Ctrl'
            };
        }])

        .controller('TextCardController', ['$scope','ModuleService','AdTechService',
        function                          ( $scope , ModuleService , AdTechService ) {
            var self = this,
                config = $scope.config;

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            $scope.$watch('active', function(active) {
                if (active) {
                    if (self.hasModule('displayAd')) {
                        AdTechService.loadAd(config);
                    }
                }
            });
        }]);
});
