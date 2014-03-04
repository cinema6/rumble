(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['cModel',
        function                         ( cModel ) {
            this.model = cModel;
        }]);
}());
