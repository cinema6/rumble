(function() {
    'use strict';

    define(['display_ad_module'], function() {
        describe('<display-ad-module>', function() {
            var $rootScope,
                $scope,
                $compile;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });
        });
    });
}());
