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

				Object.defineProperties(this, {
					currentTime: {
						get: function() {
							return self.getCurrentTime();
						}
					}
				});

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

				describe('and when the player fires "play"', function() {
					beforeEach(function() {
						spyOn(_player, 'getDuration').andCallThrough();

						_player.emit('play', _player);
					});

					it('should set the iface.paused to false', function() {
						expect(iface.paused).toBe(false);
					});

					it('should getDuration', function() {
						expect(_player.getDuration).toHaveBeenCalled();
						expect(iface.duration).toBe(5);
					});

					it('the iface should emit "play"', function() {
						expect(iface.emit).toHaveBeenCalledWith('play', iface);
					});
				});

				describe('and when the player fires "pause"', function() {
					beforeEach(function() {
						_player.emit('pause', _player);
					});

					it('should set the iface.paused to true', function() {
						expect(iface.paused).toBe(true);
					});

					it('the iface should emit "pause"', function() {
						expect(iface.emit).toHaveBeenCalledWith('pause', iface);
					});
				});

				describe('and when the player fires "ended"', function() {
					beforeEach(function() {
						_player.emit('ended', _player);
					});

					it('should set the iface.ended to true', function() {
						expect(iface.ended).toBe(true);
					});

					it('the iface should emit "ended"', function() {
						expect(iface.emit).toHaveBeenCalledWith('ended', iface);
					});
				});
			});

			describe('playerInterface', function() {
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
				});

				describe('currentTime', function() {
					describe('getting', function() {
						describe('if the player is not ready', function() {
							it('should return 0', function() {
								expect(iface.currentTime).toBe(0);
							});
						});

						describe('if the player is ready', function() {
							it('should return the current time', function() {
								_player.emit('ready', _player);
								expect(iface.currentTime).toBe(2);
							});
						});
					});
					describe('setting', function() {
						it('should throw an error cuz you can\'t set the time on VPAID ads', function() {
							expect(function() {
								iface.currentTime = 3;
							}).toThrow('setting a property that has only a getter');

							_player.emit('ready', _player);

							expect(function() {
								iface.currentTime = 3;
							}).toThrow('setting a property that has only a getter');
						});
					});
				});

				describe('duration', function() {
					describe('getting', function() {
						describe('if the player is not ready', function() {
							it('should return NaN', function() {
								expect(iface.duration).toBeNaN();
							});
						});

						describe('if the player is ready and an ad has loaded', function() {
							it('should return the duration', function() {
								_player.emit('ready', _player);
								_player.emit('play', _player);
								expect(iface.duration).toBe(5);
							});
						});
					});
					describe('setting', function() {
						it('should throw an error cuz you can\'t set the duration on VPAID ads', function() {
							expect(function() {
								iface.duration = 3;
							}).toThrow('setting a property that has only a getter');
						});
					});
				});

				describe('paused', function() {
					describe('getting', function() {
						describe('if the player is not ready', function() {
							it('should return false', function() {
								expect(iface.paused).toBe(false);
							});
						});

						describe('if the player is ready and an ad has been paused', function() {
							it('should return true', function() {
								_player.emit('ready', _player);
								_player.emit('pause', _player);
								expect(iface.paused).toBe(true);
							});
						});
					});
					describe('setting', function() {
						it('should throw an error cuz it\'s not publicly accessible', function() {
							expect(function() {
								iface.paused = true;
							}).toThrow('setting a property that has only a getter');
						});
					});
				});

				describe('ended', function() {
					describe('getting', function() {
						describe('if the player is not ready', function() {
							it('should return false', function() {
								expect(iface.ended).toBe(false);
							});
						});

						describe('if the player is ready and an ad has ended', function() {
							it('should return the duration', function() {
								_player.emit('ready', _player);
								_player.emit('ended', _player);
								expect(iface.ended).toBe(true);
							});
						});
					});
					describe('setting', function() {
						it('should throw an error cuz it\'s not publicly accessible', function() {
							expect(function() {
								iface.ended = true;
							}).toThrow('setting a property that has only a getter');
						});
					});
				});
			});
		});
	});
}());