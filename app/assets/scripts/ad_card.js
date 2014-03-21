(function(){
	'use strict';

	/*
		the rumble controller gets the card type from the mock
		then pieces together and $compiles an <ad-card></ad-card>
		the adCard directive needs to check the device.profile
		and then load/render/$compile a vast or vpaid-card

		ad-card: like the mr-card, logic to render vast or vpaid directive
			directive: ad_card.js
			template: none
			controller: none
			tests:
				ad_card.ut.js
				ad_card.directive.ut.js

		vast-card
			template (done): vast_card.html
			directive (done): vast_card.js
			controller (done): vast_card.js
			service (done): services.js
			tests (done):
				vast_card.directive.ut.js
				vast_card.controller.ut.js
				vast.service.ut.js

		vpaid-card
			template: vpaid_card.html
			directive: vpaid_card.js
			controller: vpaid_card.js
			service: vpaid_card.js
			tests:
				vpaid_card.directive.ut.js
				vpaid_card.controller.ut.js
				vpaid_card.service.ut.js
	*/

	angular.module('c6.rumble')
		.directive('adCard',[ '$log', '$compile', 'c6UserAgent',
		function			(  $log ,  $compile ,  c6UserAgent ) {
			$log = $log.context('<ad-card>');

			function fnLink(scope, $element, $attr) {
				$log.info('----------------',$attr);
				var canTwerk = (function() {
						if ((c6UserAgent.app.name !== 'chrome') &&
							(c6UserAgent.app.name !== 'firefox') &&
							(c6UserAgent.app.name !== 'safari')) {

							return false;
						}

						if (!scope.profile.multiPlayer || !scope.profile.autoplay){
							return false;
						}

						return true;
					}()),
					data = scope.config.data,
					innerCard;

				var type = scope.profile.flash ? 'vpaid' : 'vast';

				// if(scope.profile.flash) { // this is just to get things working
				innerCard = '<' + type + '-card';

				for (var key in data) {
					if((key !== 'type') && (data.hasOwnProperty(key))) {
						innerCard += ' ' + key.toLowerCase() + '="' + data[key] + '"';
					}
				}

				if(!scope.profile.inlineVideo) {
					innerCard += ' regenerate="1"';
				}

				if(canTwerk) {
					innerCard += ' twerk="1"';
				}

				if(scope.profile.autoplay) {
					innerCard += ' autoplay="1"';
				}

				if(scope.profile.device === 'phone') {
					innerCard += ' controls="1"';
				}

				innerCard += '></' + type + '-card>';
				// }

				$element.append($compile(innerCard)(scope));

			}

			return {
				restrict: 'E',
				link: fnLink
			};
		}]);

}());