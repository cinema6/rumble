(function(){
	'use strict';

	angular.module('c6.rumble')
		.service('VPAIDService', ['$log', '$q', '$window', 'c6EventEmitter',
		function				(  $log ,  $q ,  $window ,  c6EventEmitter ) {
			$log = $log.context('VPAIDService');
			var _private = {};

			_private.player = function() {
				// gets a reference to the player
			};

			this.adTag = function(url) {
				_private.serverUrl = url;
			};

			this.getAdHTML = function() {
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

			this.getAd = function(setupObj) {
				// get the html, replace the __STUFF__ with actual data
				$log.info(setupObj);
				
				return this.getAdHTML();
			};

			this.createPlayer = function(playerId,config,$parentElement) {
				// pass in config.id for access later
				var $playerElement;

				$log.info(config, $parentElement);

				function VPAIDPlayer(element$, playerId, $win) {
					var self = this;

					$log.info(playerId, element$);

					c6EventEmitter(self);

					// move callback into a named function with more logic
					$win.addEventListener('message', function(e) {
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

		.directive('vpaidCard', ['$log', 'assetFilter', 'VPAIDService',
		function				( $log ,  assetFilter ,  VPAIDService ) {
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

					VPAIDService.createPlayer(scope.config.id, scope.config, $element);
					
				}
			};
		}]);
}());