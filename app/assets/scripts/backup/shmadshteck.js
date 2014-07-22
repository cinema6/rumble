define( ['jquery'],
function( $      ) {
    'use strict';

    return {
        loadAd: function(config) {
            setTimeout(function() {
                var callback = config.complete,
                    $container = $('#' + config.adContainerId);

                if (!window.c6AdtechPlacementId) {
                    window.c6AdtechPlacementId = 12345;
                    return callback();
                }

                $container.append('<img src="img/snark.jpg" width="300px" height="250px" />');
                return callback();
            }, 0);
        }
    };
});
