(function(){
	'use strict';

	angular.module('c6.rumble')
		.service('VPAIDService', ['$log', '$q', '$window', 'c6EventEmitter', 'c6UrlMaker',
		function				(  $log ,  $q ,  $window ,  c6EventEmitter ,  c6UrlMaker ) {
			$log = $log.context('VPAIDService');

			this.createPlayer = function(playerId,config,$parentElement) {
				var $playerElement = angular.element('<div style="text-align:center;"></div>');

				if(!$parentElement) {
					throw new Error('Parent element is required for vpaid.createPlayer');
				}

				$log.info(config); // do we need to use config for width and height???

				$parentElement.prepend($playerElement);

				function VPAIDPlayer(element$, playerId, $win) {
					var self = this;

					c6EventEmitter(self);

					function getParamCode(obj, param, defaultValue, isFirst, prefix) {
						var amp = '&';
						var pre = '';
						if (isFirst) { amp = ''; }
						if (prefix) { pre = prefix; }

						if (obj && obj[param]){
							if (typeof obj[param] === 'string' && obj[param].length > 0){
								return amp + pre + param + '=' + encodeURIComponent(obj[param]);
							} else if (typeof (obj[param] === 'object')){
								var value = '';
								var firstInObj = true;
								for (var i=0;i<obj[param].length;i++){
									if (firstInObj){
										firstInObj = false;
									}else{
										value += '||';
									}
									value += obj[param][i];
								}

								return amp + pre + param + '=' + encodeURIComponent(value);
							}
						}

						if (defaultValue){
							return amp + pre + param + '=' + defaultValue;
						}

						return '';
					}

					function getPlayerHTML() {
						// set up all the html and return it for embedding
						// IE requires the classid attribute and the movie param
						return '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="__WIDTH__" id="c6VPAIDplayer_ie" height="__HEIGHT__">' +
						'<param name="movie" value="__SWF__" />' +
						'<param name="quality" value="high" />' +
						'<param name="bgcolor" value="#000000" />' +
						'<param name="play" value="false" />' +
						'<param name="loop" value="false" />' +
						'<param name="wmode" value="opaque" />' +
						'<param name="scale" value="noscale" />' +
						'<param name="salign" value="lt" />' +
						'<param name="flashvars" value="__FLASHVARS__" />' +
						'<param name="allowScriptAccess" value="always" />' +
						'<param name="allowFullscreen" value="true" />' +
						'<!--[if !IE]>-->' +
						'<object type="application/x-shockwave-flash" data="__SWF__" id="c6VPAIDplayer" width="__WIDTH__" height="__HEIGHT__">' +
						'<param name="movie" value="__SWF__" />' +
						'<param name="quality" value="high" />' +
						'<param name="bgcolor" value="#000000" />' +
						'<param name="play" value="false" />' +
						'<param name="loop" value="false" />' +
						'<param name="wmode" value="opaque" />' +
						'<param name="scale" value="noscale" />' +
						'<param name="salign" value="lt" />' +
						'<param name="flashvars" value="__FLASHVARS__" />' +
						'<param name="allowScriptAccess" value="always" />' +
						'<param name="allowFullscreen" value="true" />' +
						'<!--<![endif]-->' +
						'<!--[if !IE]>-->' +
						'</object>' +
						'<!--<![endif]-->' +
						'</object>';
					}

					Object.defineProperties(this, {
						player : {
							get: function() {
								var obj = element$.find('#c6VPAIDplayer')[0],
									val;

								try {
									val = obj.isCinema6player();

									if (val){ return obj; }

								} catch(e) {}

								obj = element$.find('#c6VPAIDplayer_ie')[0];

								try {
									val = obj.isCinema6player();

									if (val) { return obj; }

								} catch(e) {}

								return null;
							}
						}
					});

					self.loadAd = function() {
						// currently the ad starts right when html is inserted
						// we need to add a vast prefetcher to the swf
						element$.prepend(self.setup());
					};

					self.setup = function() {
						var obj = {
							params: {},
							playerId: '',
							swf: c6UrlMaker('swf/player.swf'),
							width: 640,
							height: 360,
							adXmlUrl: 'http://u-ads.adap.tv/a/h/AiVnje_CA3BJsRMP0_gPXAtRyCRFRZSd?cb=[CACHE_BREAKER]&pageUrl=http%3A%2F%2Ftribal360.com&description=[params.videoDesc]&duration=[params.videoDuration]&id=[params.videoId]&keywords=[params.keywords]&title=[params.videoTitle]&url=VIDEO_URL&eov=eov'
						};

						var html = getPlayerHTML().replace(/__SWF__/g, obj.swf);
						html = html.replace(/__WIDTH__/g, obj.width);
						html = html.replace(/__HEIGHT__/g, obj.height);

						var flashvars = '';

						flashvars += getParamCode(obj, 'adXmlUrl');
						flashvars += getParamCode(obj, 'playerId');

						if (obj.params){
							for (var i in obj.params){
								flashvars += getParamCode(obj.params, i, null, false, 'params.');
							}
						}

						html = html.replace(/__FLASHVARS__/g, flashvars);

						return html;
					};

					self.play = function() {
						self.player.play();
					};

					self.pause = function() {
						self.player.pauseAd();
					};

					self.getAdProperties = function() {
						return self.player.getAdProperties();
					};

					self.getDisplayBanners = function() {
						return self.player.getDisplayBanners();
					};

					self.setVolume = function(volume) {
						self.player.setVolume(volume);
					};

					self.resumeAd = function() {
						self.player.resumeAd();
					};

					self.stopAd = function() {
						self.player.stopAd();
					};

					self.isC6VpaidPlayer = function() {
						return self.player.isCinema6player();
					};

					self.getCurrentTime = function() {
						return self.player.getAdProperties().adCurrentTime;
					};

					self.destroy = function() {
						// element$[0].parentNode.removeChild(element$[0]);
					};

					function handlePostMessage(e) {
						$log.info(e);
						var data = JSON.parse(e.data);

						if(!data.__vpaid__) { return; }

						$log.info('EVENT: ', data.__vpaid__.type);

						switch(data.__vpaid__.type) {
							case 'AdLoaded':
								{
									self.emit('ready', self);
									break;
								}
							case 'AdStarted':
								{
									self.emit('play', self);
									break;
								}
							case 'AdPaused':
								{
									self.emit('pause', self);
									break;
								}
							case 'AdVideoComplete':
								{
									self.emit('ended', self);
									break;
								}
						}

						self.emit(data.__vpaid__.type, self);
					}

					$win.addEventListener('message', handlePostMessage);

				}

				return new VPAIDPlayer($playerElement, playerId, $window);
			};

		}])

		.controller('VpaidCardController', ['$scope', '$log', 'ModuleService',
		function							($scope ,  $log , ModuleService ) {
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

			$log.info(_data); // using _data so jshint doesn't complain

			this.showVideo = true;

			this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

			$scope.$on('playerAdd', function(event, iface) {
				self.playAd = function() {
					iface.loadAd();
				};
				self.pauseAd = function() {
					iface.pause();
				};
			});
		}])

		.directive('vpaidCard', ['$log', 'assetFilter', 'VPAIDService', 'playerInterface',
		function				( $log ,  assetFilter ,  VPAIDService ,  playerInterface ) {
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
						player,
						playerIsReady = false;

					Object.defineProperties(iface, {
						currentTime: {
							get: function() {
								return player.isC6VpaidPlayer ? player.currentTime : 0;
							}
						},
						duration: {
							get: function() {
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

					};

					iface.webHref = null;
					iface.twerked = null;

					// end of not needed

					scope.$emit('playerAdd', iface); // send iface up to controller

					function createPlayer() {
						player = VPAIDService.createPlayer(scope.config.id, scope.config, $element.find('.mr-player'));

						player.on('ready', function() {
							playerIsReady = true;
							// player.on('playProgress', function(e) {
							// 	// do stuff
							// });

							iface.emit('ready', iface);

							scope.$watch('onDeck', function(onDeck) {
								if(onDeck) {
									// do stuff
								}
							});

							player.on('ended', function() {
								// do stuff
								_iface.ended = true;
								iface.emit('ended', iface);
							});

							player.on('play', function() {
								// do stuff
								iface.paused = false;
								iface.emit('play', iface);
							});

							player.on('pause', function() {
								// do stuff
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

					// scope.$emit('VPAIDPlayerAdd', player);

				}
			};
		}]);
}());