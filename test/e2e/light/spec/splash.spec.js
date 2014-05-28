(function() {
    'use strict';

    /* global before,after */

    var browser = require('../../driver'),
        chai = require('chai'),
        chaiWD = require('chai-webdriver'),
        expect = chai.expect;

    var Sandbox = require('../../components/sandbox'),
        Splash = require('../components/Splash');

    var sandbox = new Sandbox(browser),
        splash = new Splash(browser);

    chai.use(chaiWD(browser));

    describe('MiniReel Player [light] Splash Page', function() {
        this.timeout(10000);

        before(function() {
            sandbox.loadExperience(1);
            return splash.get();
        });

        it('should be displayed', function() {
            return expect('#splash-button').dom.to.be.visible();
        });

        it('should display an image', function() {
            return expect('#splash-button').dom.to.have.style('background-image', 'url(http://staging.cinema6.com/collateral/experiences/gopro/splash-6thumb.jpg)');
        });

        after(function() {
            return browser.quit();
        });
    });
}());
