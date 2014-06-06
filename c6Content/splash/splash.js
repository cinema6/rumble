module.exports = function(c6, settings, splash) {
    'use strict';

    var loader = splash.querySelectorAll('#loader')[0],
        start = splash.querySelectorAll('#start')[0];

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
