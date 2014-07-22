define(['app'], function(appModule) {
    'use strict';

    describe('<comments-module>', function() {
        var $rootScope,
            $scope,
            $compile;

        var $animate;

        beforeEach(function() {
            module(appModule.name);

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
