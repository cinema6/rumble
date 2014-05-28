(function() {
    'use strict';

    var webdriver = require('selenium-webdriver'),
        browser = module.exports = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();

    browser.manage().timeouts().implicitlyWait(5000);
}());
