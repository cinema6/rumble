(function(win$){
    'use strict';

    angular.module('c6.rumble.services')
    .provider('tracker',[ function(){

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
            }

            TrackerContext.prototype.alias = function(name,val){
                if (val === null){
                    delete this.aliases[name];
                } else
                if (val !== undefined){
                    this.aliases[name] = val;
                }

                return this.aliases[name] || name;
            };

            TrackerContext.prototype.methodContext = function(method){
                if (this.ctxName){
                    method = this.ctxName + '.' + method;
                }
                return method;
            };

            TrackerContext.prototype.create = function(){
                var args = Array.prototype.slice.call(arguments,0);
                args.unshift(this.methodContext('create'));
                $window[api].apply(null,args);
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
                    if (args[2]){
                        props.eventLabel   = args[2];
                    }
                    if (args[3]){
                        props.eventValue  = args[3];
                    }
                }
                props.hitType = 'event';
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
            
            if (win$.__karma__){
                service._private = _private;
            }

            return service;
        }];
    }]);

}(window));
