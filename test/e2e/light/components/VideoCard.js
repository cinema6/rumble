module.exports = function(browser) {
    'use strict';

    var Splash = require('../components/Splash.js'),
        splash = new Splash(browser);

    this.get = function() {
        splash.get();
        return splash.click();
    };
};
