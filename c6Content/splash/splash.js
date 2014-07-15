module.exports = function(c6, settings, splash) {
    'use strict';

    var loader = splash.querySelectorAll('.c6js-loader')[0],
        starts = Array.prototype.slice.call(splash.querySelectorAll('.c6js-start'));

    starts.forEach(function(start) {
        start.addEventListener('click', function() {
            if (loader) {
                loader.style.display = '';
            }
            c6.loadExperience(settings);
        }, false);
    });

    return {
        didHide: loader ? function() {
            loader.style.display = 'none';
        } : function() {}
    };
};
