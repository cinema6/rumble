define (['angular','c6_defines'],
function( angular , c6Defines  ) {
    'use strict';

    return angular.module('c6.rumble.tracker', [])
    .provider('trackerService',[ function(){

        var api = 'ga';

        this.api = function(apiName) {
            if (apiName !== undefined){
                api = apiName;
            }
            return api;
        };

        this.$get = ['$window', function ( $window ) {
            var service, _private = {};

            function TrackerContext(ctxName){
                this.created = false;
                this.ctxName = (ctxName === '_default') ? '' : ctxName;
                this.aliases = {};
                this.makePagePath = angular.noop;
            }

            TrackerContext.prototype.alias = function(){
                var self = this, args = Array.prototype.slice.call(arguments,0), key;
                function setAlias(name,val){
                    if (val === null){
                        delete self.aliases[name];
                    } else
                    if (val !== undefined){
                        self.aliases[name] = val;
                    }
                
                    return self.aliases[name] || name;
                }

                if (angular.isObject(args[0])){
                    for (key in args[0]){
                        setAlias(key,args[0][key]);
                    }
                    return this;
                }
                return setAlias(args[0],args[1]);
            };

            TrackerContext.prototype.methodContext = function(method){
                if (this.ctxName){
                    method = this.ctxName + '.' + method;
                }
                return method;
            };

            TrackerContext.prototype.create = function(){
                var args = Array.prototype.slice.call(arguments,0);
                args.unshift('create');
                $window[api].apply(null,args);
                $window[api].apply(null,[this.methodContext('require'),'displayfeatures']);
                this.created = true;
                return this;
            };

            TrackerContext.prototype.set = function(){
                var args = Array.prototype.slice.call(arguments,0), props, aliased, k;
                if (args.length === 2){
                    args[0] = this.alias(args[0]);
                } else
                if (angular.isObject(args[0])){
                    props = args[0];
                    aliased = {};
                    for (k in props){
                        aliased[this.alias(k)] = props[k];
                    }
                    args[0] = aliased;
                }
                args.unshift(this.methodContext('set'));
                $window[api].apply(null,args);
                return this;
            };
            
            TrackerContext.prototype.trackPage = function(){
                var args = Array.prototype.slice.call(arguments,0), props, k, aliased;
                if (args.length > 1){
                    args = [{
                        page  : args[0],
                        title : args[1]
                    }];
                } else
                if (angular.isObject(args[0])){
                    props = args[0];
                    aliased = {};
                    for (k in props){
                        aliased[this.alias(k)] = props[k];
                    }
                    args[0] = aliased;
                }
                args.unshift('pageview');
                args.unshift(this.methodContext('send'));
                $window[api].apply(null,args);
                return this;
            };
            
            TrackerContext.prototype.trackEvent = function(){
                var args = Array.prototype.slice.call(arguments,0), props = {}, k;
                if (angular.isObject(args[0])){
                    args = args[0];
                    for (k in args){
                        props[this.alias(k)] = args[k];
                    }
                } else {
                    props.eventCategory = args[0];
                    props.eventAction   = args[1];
                    if ((args[2] !== undefined) && (args[2] !== null)){
                        props.eventLabel   = args[2];
                    }
                    if ((args[3] !== undefined) && (args[3] !== null)){
                        props.eventValue  = args[3];
                    }
                }
                props.hitType = 'event';
                $window[api].call(null,this.methodContext('send'),props);
                return this;
            };

            TrackerContext.prototype.trackTiming = function(){
                var args = Array.prototype.slice.call(arguments,0), props = {}, k;
                if (angular.isObject(args[0])){
                    args = args[0];
                    for (k in args){
                        props[this.alias(k)] = args[k];
                    }
                } else {
                    props.timingCategory = args[0];
                    props.timingVar   = args[1];
                    if ((args[2] !== undefined) && (args[2] !== null)){
                        props.timingValue  = args[2];
                    }
                    if ((args[3] !== undefined) && (args[3] !== null)){
                        props.timingLabel = args[3];
                    }
                }
                props.hitType = 'timing';
                $window[api].call(null,this.methodContext('send'),props);
                return this;
            };

            _private.TrackerContext = TrackerContext;
            _private.contexts = {};

            service = function(contextName){
                contextName = contextName || '_default';
                var ctx = _private.contexts[contextName];
                
                if (!ctx){
                    ctx = new TrackerContext(contextName);
                    _private.contexts[contextName] = ctx;
                }

                return ctx;
            };
            
            if (c6Defines.kHasKarma){
                service._private = _private;
            }

            return service;
        }];
    }]);

});
