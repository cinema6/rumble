(function() {
    'use strict';

    angular.module('c6.state', ['c6.ui'])
        .value('c6StateParams', {})

        .directive('c6View', ['c6State','$compile','$animate','$controller',
        function             ( c6State , $compile , $animate , $controller ) {
            return {
                restrict: 'EAC',
                transclude: 'element',
                link: function(scope, element, attrs, controller, transclude) {
                    var currentScope = null,
                        currentElement$ = null;

                    function leave() {
                        if (currentScope) {
                            currentScope.$destroy();
                        }

                        if (currentElement$) {
                            $animate.leave(currentElement$);
                        }
                    }

                    c6State.emit('viewReady');

                    function update(state) {
                        var newScope = scope.$new(),
                            ctrl = state.controller,
                            controllerAs = state.controllerAs,
                            controller = ctrl ? $controller(ctrl, {
                                $scope: newScope,
                                cModel: state.cModel
                            }) : null;

                        newScope.model = state.cModel;
                        if (controllerAs) {
                            newScope[controllerAs] = controller;
                        }

                        var clone$ = transclude(function(clone$) {
                            clone$.html(state.cTemplate);
                            $compile(clone$.contents())(newScope);

                            $animate.enter(clone$, null, currentElement$ || element, function() {
                                c6State.emit('viewChangeSuccess', state);
                            });
                            leave();
                        });

                        currentScope = newScope;
                        currentElement$ = clone$;
                    }

                    c6State.on('viewChangeStart', update);
                }
            };
        }])

        .provider('c6State', [function() {
            var states = {},
                indexState = null;

            this.state = function(name, state) {
                state.name = name;
                state.cModel = null;
                state.cTemplate = null;

                states[name] = state;

                return this;
            };

            this.index = function(index) {
                indexState = index;

                return this;
            };

            this.$get = ['c6StateParams','c6EventEmitter','$injector','$q','$http','$templateCache','$log',
            function    ( c6StateParams , c6EventEmitter , $injector , $q , $http , $templateCache , $log ) {
                var c6State = c6EventEmitter({}),
                    _service = {};

                _service.resolveState = function(state) {
                    function setTemplate() {
                        var template = state.template,
                            templateUrl = state.templateUrl;

                        state.cTemplate = template || null;

                        return templateUrl ? $http.get(templateUrl, {
                            cache: $templateCache
                        }).then(function(response) {
                            state.cTemplate = response.data;
                        }).then(returnState) : $q.when(state);
                    }

                    function beforeModel() {
                        return $q.when($injector.invoke(state.beforeModel || angular.noop, state));
                    }

                    function model() {
                        return $injector.invoke(state.model || angular.noop, state);
                    }

                    function afterModel(model) {
                        state.cModel = model || null;

                        return $injector.invoke(state.afterModel || angular.noop, state, { model: model });
                    }

                    function handleError(error) {
                        if (!state.handleError) {
                            return $q.reject(error);
                        }

                        return $injector.invoke(state.handleError, state, { error: error });
                    }

                    function returnState() {
                        return state;
                    }

                    return setTemplate()
                        .then(beforeModel)
                        .catch(handleError)
                        .then(model)
                        .then(afterModel)
                        .then(returnState);
                };

                c6State.current = null;
                c6State.transitions = {};

                c6State.get = function(name) {
                    return states[name];
                };

                c6State.transitionTo = function(name, params) {
                    var promise,
                        to = states[name],
                        from = this.current;

                    function resolveState() {
                        angular.copy(params, c6StateParams);

                        c6State.transitions[name] = promise;

                        return _service.resolveState(to);
                    }

                    function changeView(state) {
                        var deferred = $q.defer();

                        function handleViewChangeSuccess(toState) {
                            if (toState === state) {
                                deferred.resolve(state);
                                c6State.removeListener('viewChangeSuccess', handleViewChangeSuccess);
                            }
                        }

                        c6State.on('viewChangeSuccess', handleViewChangeSuccess);
                        c6State.emit('viewChangeStart', to, from);

                        return deferred.promise;
                    }

                    function removeTransition() {
                        delete c6State.transitions[name];
                    }

                    function setCurrent(state) {
                        c6State.current = state;

                        return state;
                    }

                    this.emit('transitionStart', to, from);

                    promise = $q.all(this.transitions)
                        .then(resolveState)
                        .then(changeView)
                        .then(setCurrent)
                        .finally(removeTransition);

                    return promise;
                };

                c6State.on('viewReady', function() {
                    if (!c6State.current) {
                        c6State.transitionTo(indexState)
                            .catch($log.error);
                    }
                });

                if (window.c6.kHasKarma) { c6State._private = _service; }

                return c6State;
            }];
        }]);
}());
