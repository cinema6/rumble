(function() {
	'use strict';

	define(['ad_card'], function() {
		describe('<ad-card></ad-card>', function() {
			var $rootScope,
				$scope,
				$compile,
				$log;

			beforeEach(function() {
				module('c6.ui', function($provide) {
                    $provide.factory('c6VideoDirective', function() {
                        return {};
                    });
                });

				module('c6.rumble', function($provide) {
					$provide.value('c6AppData', {
						mode: 'full'
					});
				});

				inject(function($injector) {
					$rootScope = $injector.get('$rootScope');
					$compile = $injector.get('$compile');
					$log = $injector.get('$log');

					$scope = $rootScope.$new();
					$scope.config = {
						data: {
							type: 'ad'
						}
					};
					$log.context = function() { return $log; };
				});
			});

			describe('initialization', function() {
				xdescribe('with flash enabled', function() {
					it('should compile a vpaid-card', function() {
						var element$;

						$scope.$apply(function() {
							$scope.profile = {
								flash: true
							};
							element$ = $compile('<ad-card></ad-card>')($scope);
						});

						expect(element$.find('vpaid-card').length).toBe(1);
					});
				});

				describe('without flash enabled', function() {
					it('should compile a vast-card', function() {
						var element$;

						$scope.$apply(function() {
							$scope.profile = {
								flash: false
							};
							element$ = $compile('<ad-card></ad-card>')($scope);
						});

						expect(element$.find('vast-card').length).toBe(1);
					});
				});
			});

		});
	});
}());