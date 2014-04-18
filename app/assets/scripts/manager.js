(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['c6State',
        function                         ( c6State ) {
            var self = this;

            this.filter = 'all';

            this.edit = function(minireel) {
                c6State.goTo('editor', { minireelId: minireel.id });
            };

            this.makeActive = function(minireel) {
                minireel.status = 'active';
            };

            this.makePending = function(minireel) {
                minireel.status = 'pending';
            };

            this.determineInclusionWithFilter = function(minireel) {
                return self.filter === 'all' || self.filter === minireel.status;
            };
        }]);
}());
