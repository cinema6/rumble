(function() {
    'use strict';

    /* global before,after */

    var browser = require('../../driver.js')(),
        chai = require('chai'),
        chaiWD = require('chai-webdriver'),
        expect = chai.expect;

    var Sandbox = require('../../components/sandbox.js'),
        VideoCard = require('../components/VideoCard.js');

    var sandbox = new Sandbox(browser),
        videoCard = new VideoCard(browser);

    chai.use(chaiWD(browser));

    describe('MiniReel Player [light] Video Card', function() {
        this.timeout(10000);

        before(function() {
            sandbox.loadExperience(1);
            return videoCard.get();
        });

        it('should be displayed', function() {

        });

        after(function() {
            return browser.quit();
        });
    });
}());
