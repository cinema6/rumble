module.exports = function(browser) {
    'use strict';

    this.get = function() {
        return browser.wait(function() {
            return browser.findElement({ id: 'splash-button' })
                .then(function(element) {
                    return element.isDisplayed();
                });
        });
    };
};
