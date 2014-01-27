(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('<ballot-module>', function() {
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
