define(['cards/recap'], function(recapModule) {
    'use strict';

    describe('<mini-reel-card>', function() {
        var $rootScope,
            $scope,
            $compile;

        beforeEach(function() {
            module(recapModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
            });
        });
    });
});
