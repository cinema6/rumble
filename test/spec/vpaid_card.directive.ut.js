(function() {
	'use strict';

	define(['vpaid_card'], function() {
		describe('<vpaid-card></vpaid-card>', function() {
			var $rootScope,
				$scope,
				$compile,
				$log,
				VPAIDService,
				c6EventEmitter;

			function MockPlayer() {
				var self = this;

				c6EventEmitter(self);

				this.play = jasmine.createSpy('player.play()');
				this.pause = jasmine.createSpy('player.pause()');
				this.loadAd = jasmine.createSpy('player.loadAd()');
				this.getCurrentTime = function() { return 2; };
				this.getDuration = function() { return 5; };
				this.getAdProperties = function() {};
				this.getDisplayBanners = function() {};
				this.setVolume = function(volume) {};
				this.resumeAd = function() {};
				this.stopAd = function() {};
				this.isC6VpaidPlayer = function() {};
			}

			beforeEach(function() {
				module('c6.rumble', function($provide) {
					$provide.value('c6AppData', {
						mode: 'full'
					});

					$provide.provider('VPAIDService', function() {
						this.$get = [function() {
							var service = {};
							service.createPlayer = function() {
								return new MockPlayer();
							};
							return service;
						}];

					});
				});

				inject(function($injector) {
					$rootScope = $injector.get('$rootScope');
					$compile = $injector.get('$compile');
					$log = $injector.get('$log');
					c6EventEmitter = $injector.get('c6EventEmitter');
					VPAIDService = $injector.get('VPAIDService');

					$scope = $rootScope.$new();
					$scope.config = {
						data: {}
					};
					$log.context = function() { return $log; };
				});
			});

			describe('initialization', function() {
				it('should $emit the playerAdd event with an interface', function() {
					spyOn($scope, '$emit').andCallThrough();

					$scope.$apply(function() {
						$compile('<vpaid-card></vpaid-card>')($scope);
					});

					expect($scope.$emit).toHaveBeenCalledWith('playerAdd', jasmine.any(Object));
				});
			});

			describe('when player says it\'s ready', function() {
				var iface,
					_player;

				beforeEach(function() {
					_player = VPAIDService.createPlayer();

					spyOn(VPAIDService, 'createPlayer').andReturn(_player);

					$scope.$on('playerAdd', function(event, playerInterface) {
						iface = playerInterface;
					});

					$scope.$apply(function() {
						$compile('<vpaid-card></vpaid-card>')($scope);
					});

					spyOn(iface, 'emit').andCallThrough();

					_player.emit('ready', _player);
				});

				it('the iface should should emit ready', function() {
					expect(iface.emit).toHaveBeenCalledWith('ready', iface);
				});

				it('it should set the duration', function() {
					expect(iface.duration).toBe(5);
				});
			});
		});
	});
}());