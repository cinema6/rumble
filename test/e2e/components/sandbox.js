module.exports = function(browser) {
    'use strict';

    this.open = function() {
        browser.get('http://localhost:9000');
        return this.waitForLoad();
    };

    this.waitForLoad = function() {
        return browser.wait(function() {
            return browser.findElement({ tagName: 'iframe' })
                .then(function(elements) {
                    return elements.isDisplayed();
                });
        });
    };

    this.loadExperience = function(index) {
        this.open();
        browser.executeScript(function(index) {
            /* global c6Sandbox:true */
            c6Sandbox.setCurrentExperience(index);
        }, index);
        this.waitForLoad();
        return browser.switchTo().frame('experience');
    };
};
