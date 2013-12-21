(function(){
    'use strict';

    angular.module('c6.rumble')
    .factory('iframe',[function(){
        var service = {};

        service.formatIframe = function(id, src, attrs){
            var html = '<iframe id="' + id + '" src="' + src + '"';

            if (attrs){
                for (var name in attrs){
                    html += ' ' + name.toLowerCase();
                    if (attrs[name] === true){
                        continue;
                    }
                    html += '="' + attrs[name] + '"';
                }
            }

            html += '></iframe>';

            return html;
        };

        service.create = function(id,src,attrs) {
            return angular.element(this.formatIframe(id, src, attrs));
        };

        return service;
    }]);
}());

