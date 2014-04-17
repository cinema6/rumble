(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['c6State',
        function                         ( c6State ) {
            this.edit = function(minireel) {
                c6State.goTo('editor', { minireelId: minireel.id });
            };
        }]);
}());
