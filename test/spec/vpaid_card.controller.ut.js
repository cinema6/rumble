(function() {
	'use strict';

	define(['vpaid_card'], function() {
		describe('VpaidCardController', function() {
			var $rootScope,
				$scope,
				$controller,
				$log,
				VpaidCardController,
				c6EventEmitter;

			var ModuleService;

			function IFace() {
				var self = this;

				this.play = jasmine.createSpy('iface.play()')
					.andCallFake(function() {
						self.emit('play', self);
					});
				this.pause = jasmine.createSpy('iface.pause()')
					.andCallFake(function() {
						self.emit('pause', self);
					});
				this.loadAd = jasmine.createSpy('iface.loadAd()');

				c6EventEmitter(this);
			}

			beforeEach(function() {
				module('c6.rumble.services', function($provide) {
                    $provide.value('ModuleService', {
                        hasModule: jasmine.createSpy('ModuleService.hasModule()')
                    });
                });

				module('c6.rumble');

				inject(function($injector) {
					$rootScope = $injector.get('$rootScope');
					$controller = $injector.get('$controller');
					$log = $injector.get('$log');
					c6EventEmitter = $injector.get('c6EventEmitter');
					ModuleService = $injector.get('ModuleService');

					$log.context = function() { return $log; };
					$scope = $rootScope.$new();
					$scope.config = {
						data: {
							autoplay: true
						}
					};
					$scope.$apply(function() {
						VpaidCardController = $controller('VpaidCardController', { $scope: $scope });
					});
				});
			});

			it('should exist', function() {
				expect(VpaidCardController).toEqual(jasmine.any(Object));
			});

			describe('initialization', function() {
				describe('if the config already has _data', function() {
					it('should not overwrite the data', function() {
						var origData = $scope.config._data = {};

						VpaidCardController = $controller('VpaidCardController', { $scope: $scope });

						expect($scope.config._data).toBe(origData);
					});
				});

				describe('if the config has no _data', function() {
					it('should create some data', function() {
						expect($scope.config._data).toEqual({
							modules: {
								displayAd: {
									active: false
								}
							}
						});
					});
				});
			});

			describe('@properties', function() {
				describe('showVideo', function() {
					it('should be true', function() {
						expect(VpaidCardController.showVideo).toBe(true);
					});
				});
			});

			describe('@methods', function() {
				describe('hasModule(module)', function() {
					it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
						VpaidCardController.hasModule('displayAd');
						expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'displayAd');
					});
				});
			});

			describe('player events', function() {
				var iface;

				beforeEach(function() {
					iface = new IFace();

					$scope.$apply(function() {
						$scope.$emit('playerAdd', iface);
					});

					spyOn($scope, '$emit').andCallThrough();
				});

				describe('ended', function() {
					describe('if there is a displayAd', function() {
						it('should not $emit the contentEnd event', function() {
							$scope.config._data.modules.displayAd.src = 'foo.jpg';

							iface.emit('ended', iface);

							expect($scope.$emit).not.toHaveBeenCalledWith('<vpaid-card>:contentEnd', $scope.config);
						});
					});

					describe('if there is no displayAd', function() {
						it('should emit the contentEnd event', function() {
							iface.emit('ended', iface);

							expect($scope.$emit).toHaveBeenCalledWith('<vpaid-card>:contentEnd', $scope.config);
						});
					});
				});

				describe('play', function() {
					it('should deactivate the displayAd', function() {
						iface.emit('play', iface);

						expect($scope.config._data.modules.displayAd.active).toBe(false);
					});
				});
			});

			describe('$watchers', function() {
				describe('active', function() {
					var iface;

					beforeEach(function() {
						iface = new IFace();

						$scope.$apply(function() {
							$scope.$emit('playerAdd', iface);
						});
					});

					describe('when initialized', function() {
						it('should not call loadAd', function() {
							expect(iface.loadAd).not.toHaveBeenCalled();
						});
					});

					describe('when true', function() {
						it('should play the ad', function() {
							$scope.$apply(function() {
								$scope.active = true;
							});
							expect(iface.loadAd).toHaveBeenCalled();
						});
					});
				});
			});
		});
	});
}());