(function() {
    'use strict';

    module.exports = {
        server: {
            url: 'http://localhost:<%= settings.sandboxPort %>/',
            app: '<%= personal.browser %>'
        }
    };
})();
