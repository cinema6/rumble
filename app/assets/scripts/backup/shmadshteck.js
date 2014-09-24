define( ['jquery'],
function( $      ) {
    'use strict';

    return {
        loadAd: function(config) {
            setTimeout(function() {
                var callback = config.complete,
                    $container = $('#' + config.adContainerId);

                $container.append('<img src="img/snark.jpg" width="300px" height="250px" />');
                return callback();
            }, 0);
        }
    };
});
