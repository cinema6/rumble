(function(){
	'use strict';

	angular.module('c6.rumble')
		.controller('VpaidCardController', ['$scope', '$log', 'ModuleService', 'c6AppData',
		function							($scope ,  $log ,  ModuleService ,  c6AppData ) {
			$log = $log.context('VpaidCardController');
			var self = this,
				config = $scope.config;

			config._data = config._data || {
				modules: {
					displayAd: {
						active: false
					}
				}
			};

			this.showVideo = true;

			this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

			$scope.$on('playerAdd', function(event, iface) {
				self.playAd = function() {
					iface.loadAd();
				};
				self.pauseAd = function() {
					iface.pause();
				};

				$scope.$watch('active', function(active, wasActive) {
					if(active === wasActive) { return; }

					if(active) {
						if(c6AppData.behaviors.autoplay && c6AppData.profile.autoplay) {
							iface.loadAd();
						}
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
							ended: false
						},
						playerIsReady = false,
						player;

					Object.defineProperties(iface, {
						currentTime: {
							get: function() {
								// maybe just check if player is ready? no need for isC6VpaidPlayer?
								return player.isC6VpaidPlayer ? player.currentTime : 0;
							}
						},
						duration: {
							get: function() {
								// maybe no need for $attr end or start?
								// maybe this returns a private prop that's set when player is loaded?
								// return _iface.duration
								return (($attr.end || player.getDuration()) - ($attr.start || 0)) || NaN;
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

					iface.loadAd = function() {
						player.loadAd();
					};

					iface.getType = function() {
						return 'vpaid';
					};

					iface.getVideoId = function() {
						return $attr.videoid;
					};

					iface.isReady = function() {
						return playerIsReady;
					};

					iface.play = function() {
						if(playerIsReady) {
							player.play();
						}
					};

					iface.pause = function() {
						if (playerIsReady) {
							player.pause();
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
							// currently this happens when AdLoaded is fired from Player
							// when prefetching is working maybe it should be fired when isCinema6player is true?
							playerIsReady = true;

							iface.emit('ready', iface);

							scope.$watch('onDeck', function(onDeck) {
								if(onDeck) {
									// do stuff
								}
							});

							player.on('ended', function() {
								_iface.ended = true;
								iface.emit('ended', iface);
							});

							player.on('play', function() {
								_iface.paused = false;
								iface.emit('play', iface);
							});

							player.on('pause', function() {
								_iface.paused = true;
								iface.emit('pause', iface);
							});
						});
					}

					// function regeneratePlayer() {
					// 	if(player) {
					// 		player.destroy();
					// 		player = undefined;
					// 	}
					// 	$timeout(createPlayer);
					// }

					createPlayer();

				}
			};
		}]);
}());