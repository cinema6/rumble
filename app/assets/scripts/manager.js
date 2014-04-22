(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['c6State','MiniReelService',
        function                         ( c6State , MiniReelService ) {
            var self = this;

            this.filter = 'all';

            this.edit = function(minireel) {
                c6State.goTo('editor', { minireelId: minireel.id });
            };

            this.makePublic = function(minireel) {
                MiniReelService.publish(minireel);
            };

            this.makePrivate = function(minireel) {
                MiniReelService.unpublish(minireel);
            };

            this.determineInclusionWithFilter = function(minireel) {
                return self.filter === 'all' || self.filter === minireel.status;
            };
        }]);
}());
