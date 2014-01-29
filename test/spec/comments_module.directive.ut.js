(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('<comments-module>', function() {
            var $rootScope,
                $scope,
                $compile;

            var $animate;

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.value('rumbleVotes', {

                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $animate = $injector.get('$animate');

                    spyOn($animate, 'addClass');
                    spyOn($animate, 'removeClass');

                    $scope = $rootScope.$new();
                });
            });
        });
    });
}());
