module.exports = function(c6, settings, splash) {
    'use strict';

    var loader = splash.querySelectorAll('.c6js-loader')[0],
        start = splash.querySelectorAll('.c6js-start')[0];

    start.addEventListener('click', function() {
        loader.style.display = '';
        c6.loadExperience(settings);
    }, false);

    return {
        didHide: function() {
            loader.style.display = 'none';
        }
    };
};
