(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('EditorController', ['cModel',
        function                        ( cModel ) {
            this.model = cModel;
        }]);
}());
