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
				vpaid.service.ut.js
	*/

	angular.module('c6.rumble')
		.directive('adCard',[ '$log', '$compile',
		function			(  $log ,  $compile ) {
			$log = $log.context('<ad-card>');

			function fnLink(scope, $element) {
				var data = scope.config.data,
					type = scope.profile.flash ? 'vpaid' : 'vast',
					innerCard;

				innerCard = '<' + type + '-card';

				for (var key in data) {
					if((key !== 'type') && (data.hasOwnProperty(key))) {
						innerCard += ' ' + key.toLowerCase() + '="' + data[key] + '"';
					}
				}

				// if(!scope.profile.inlineVideo) {
				// 	innerCard += ' regenerate="1"';
				// }

				if(scope.profile.autoplay) {
					innerCard += ' autoplay="1"';
				}

				if(scope.profile.device === 'phone') {
					innerCard += ' controls="1"';
				}

				innerCard += '></' + type + '-card>';

				$element.append($compile(innerCard)(scope));

			}

			return {
				restrict: 'E',
				link: fnLink
			};
		}]);

}());