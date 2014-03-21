(function(){
	'use strict';

	angular.module('c6.rumble')
		.service('VPAIDService', ['$log', '$q', '$window', 'c6EventEmitter', 'c6UrlMaker',
		function				(  $log ,  $q ,  $window ,  c6EventEmitter ,  c6UrlMaker ) {
			$log = $log.context('VPAIDService');

			this.createPlayer = function(playerId,config,$parentElement) {
				var $playerElement = angular.element('<div></div>');

				if(!$parentElement) {
					throw new Error('Parent element is required for vpaid.createPlayer');
				}

				$log.info(config); // do we need to use config for width and height???

				$parentElement.prepend($playerElement);

				function VPAIDPlayer(element$, playerId, $win) {
					var self = this;

					$log.info(playerId, element$);

					c6EventEmitter(self);

					self.getParamCode = function(obj, param, defaultValue, isFirst, prefix) {
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
					};

					self.getPlayerHTML = function() {
						// set up all the html and return it for embedding
						return '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="__WIDTH__" id="cinema6player" height="__HEIGHT__" align="left" margin="0" style= "margin: 0; padding:0; border: none">' +
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
						'<object type="application/x-shockwave-flash" data="__SWF__" id="cinema6player_alt" width="__WIDTH__" height="__HEIGHT__" margin="0" style= "margin: 0; padding:0; border: none">' +
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
					};

					self.loadAd = function() {
						element$.innerHTML = self.setup();
					};

					self.setup = function() {
						// obj.swf
						// obj.width
						// obj.height
						// obj.adXmlUrl
						// obj.playerId
						// obj.params
						var obj = {
							swf: '../player.swf',
							width: 640,
							height: 360,
							adXmlUrl: 'ttp://u-ads.adap.tv/a/h/AiVnje_CA3BJsRMP0_gPXAtRyCRFRZSd?cb=[CACHE_BREAKER]&pageUrl=http%3A%2F%2Ftribal360.com&description=[params.videoDesc]&duration=[params.videoDuration]&id=[params.videoId]&keywords=[params.keywords]&title=[params.videoTitle]&url=VIDEO_URL&eov=eov'
						};

						var html = self.getPlayerHTML().replace(/__SWF__/g, obj.swf);
						html = html.replace(/__WIDTH__/g, obj.width);
						html = html.replace(/__HEIGHT__/g, obj.height);

						var flashvars = '';

						flashvars += self.getParamCode(obj, 'adXmlUrl');
						flashvars += self.getParamCode(obj, 'playerId');

						if (obj.params){
							for (var i in obj.params){
								flashvars += self.getParamCode(obj.params, i, null, false, 'params.');
							}
						}

						html = html.replace(/__FLASHVARS__/g, flashvars);

						return html;
					};

					self.play = function() {
						return self.post('play');
					};

					self.pause = function() {
						return self.post('pause');
					};

					// move callback into a named function with more logic
					$win.addEventListener('message', function(e) {
						if(!e.data.__vpaid__) { return; }

						var data = JSON.parse(e.data);

						$log.info('EVENT: ', data.__vpaid__.type);

						if(data.__vpaid__.type === 'displayBanners') {
							// get the player element
							// scope.companionBanner = $element.getDisplayBanners();
						}
					});
				}

				return new VPAIDPlayer($playerElement, playerId, $window);
			};

		}])

		.controller('VpaidCardController', ['$log',
		function							($log ) {
			$log = $log.context('VpaidCardController');
		}])

		.directive('vpaidCard', ['$log', 'assetFilter', 'VPAIDService', '$window',
		function				( $log ,  assetFilter ,  VPAIDService ,  $window ) {
			$log = $log.context('<vpaid-card>');
			return {
				restrict: 'E',
				controller: 'VpaidCardController',
				controllerAs: 'Ctrl',
				templateUrl: assetFilter('directives/vpaid_card.html', 'views'),
				link: function(scope, $element) {
					// get config variables passed into directive from parent scopes
					// call VPAIDService.methods() to set things and get the ad

					// append it to element
					// or bind to scope variable!
					// $element.append(VPAIDService.getAd());
					// scope.adHTML = VPAIDService.getAd();
					$log.info(VPAIDService.createPlayer(scope.config.id, scope.config, $element.find('.mr-player')));

					$window.player = VPAIDService.createPlayer(scope.config.id, scope.config, $element.find('.mr-player'));

				}
			};
		}]);
}());