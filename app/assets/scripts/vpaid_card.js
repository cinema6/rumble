(function(){
	'use strict';

	angular.module('c6.rumble')
		.controller('VpaidCardController', ['$scope', '$log', 'ModuleService',
		function							($scope ,  $log ,  ModuleService ) {
			$log = $log.context('VpaidCardController');
			var self = this,
				config = $scope.config,
				_data = config._data = config._data || {
					modules: {
						displayAd: {
							active: false
						}
					}
				};

			this.showVideo = true;

			this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

			$scope.$on('playerAdd', function(event, iface) {
				self.resumeAd = function() {
					iface.resume();
				};
				self.pauseAd = function() {
					iface.pause();
				};

				self.destroy = function() {
					iface.destroy();
				};

				iface.on('ended', function() {
					if(!_data.modules.displayAd.src) {
						$scope.$emit('<vpaid-card>:contentEnd', config);
					}
				});

				iface.on('play', function() {
					_data.modules.displayAd.active = false;
				});

				// $scope.$watch('onDeck', function(onDeck) {
				// 	// if(onDeck) {
				// 	// 	iface.insertHTML();
				// 	// }
				// });

				$scope.$watch('active', function(active, wasActive) {
					if(active === wasActive) { return; }

					if(active) {
						iface.loadAd();
					}
				});
			});
		}])

		.directive('vpaidCard', ['$log', 'assetFilter', 'VPAIDService', 'playerInterface', '$q',
		function				( $log ,  assetFilter ,  VPAIDService ,  playerInterface ,  $q ) {
			$log = $log.context('<vpaid-card>');
			return {
				restrict: 'E',
				controller: 'VpaidCardController',
				controllerAs: 'Ctrl',
				templateUrl: assetFilter('directives/vpaid_card.html', 'views'),
				link: function(scope, $element, $attr) {
					var iface = playerInterface(),
						_iface = {
							paused: false,
							ended: false,
							duration: NaN
						},
						playerIsReady = false,
						adIsReady = false,
						player;

					Object.defineProperties(iface, {
						currentTime: {
							get: function() {
								return playerIsReady ? player.currentTime : 0;
							}
						},
						duration: {
							get: function() {
								// maybe this returns a private prop that's set when player is loaded?
								return _iface.duration;
								// return playerIsReady ? player.getDuration() : NaN;
							}
						},
						paused: {
							get: function() {
								return _iface.paused;
							}
						},
						ended: {
							get: function() {
								return _iface.ended;
							}
						}
					});

					// iface.insertHTML = function() {
					// 	player.insertHTML();
					// };

					iface.loadAd = function() {
						if(adIsReady) {
							player.loadAd();
						}
					};

					iface.getType = function() {
						// return 'vpaid';
						return 'ad';
					};

					iface.getVideoId = function() {
						return $attr.videoid;
					};

					iface.isReady = function() {
						return playerIsReady;
					};

					iface.play = function() {
						if(playerIsReady) {
							player.loadAd();
						}
					};

					iface.resume = function() {
						if(playerIsReady) {
							player.resumeAd();
						}
					};

					iface.pause = function() {
						if (playerIsReady) {
							player.pause();
						}
					};

					iface.destroy = function() {
						if(playerIsReady) {
							player.destroy();
						}
					};

					// not needed
					iface.twerk = function() {
						return $q.reject('Twerking is not supported in the VPAID player.');
					};
					iface.webHref = null;
					iface.twerked = false;
					// end of not needed

					scope.$emit('playerAdd', iface);

					function createPlayer() {
						player = VPAIDService.createPlayer(scope.config.id, scope.config, $element.find('.mr-player'));

						player.on('ready', function() {
							// this fires when the flash object exists and responds to isCinema6player()
							playerIsReady = true;

							iface.emit('ready', iface);

							player.on('adReady', function() {
								adIsReady = true;
							});

							player.on('ended', function() {
								_iface.ended = true;
								iface.emit('ended', iface);
							});

							player.on('play', function() {
								_iface.paused = false;
								_iface.duration = player.getDuration();
								iface.emit('play', iface);
							});

							player.on('pause', function() {
								_iface.paused = true;
								iface.emit('pause', iface);
							});

							// scope.$watch('onDeck', function(onDeck) {
							// 	if(onDeck) {
							// 		// do stuff
							// 	}
							// });
						});

						player.insertHTML();
					}

					createPlayer();

				}
			};
		}]);
}());