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
                        currentElement$ = null,
                        parentData = element.inheritedData('cView') || {},
                        viewLevel = (parentData.level || 0) + 1;

                    function leave() {
                        if (currentScope) {
                            currentScope.$destroy();
                        }

                        if (currentElement$) {
                            $animate.leave(currentElement$);
                        }
                    }

                    function update(state) {
                        var newScope = scope.$new(),
                            ctrl = state.controller,
                            controllerAs = state.controllerAs,
                            controller = ctrl ? $controller(ctrl, {
                                $scope: newScope,
                                cModel: state.cModel
                            }) : null,
                            stateLevel = state.name.split('.').length;

                        if (viewLevel !== stateLevel) { return; }

                        newScope.model = state.cModel;
                        if (controllerAs) {
                            newScope[controllerAs] = controller;
                        }

                        var clone$ = transclude(function(clone$) {
                            clone$.html(state.cTemplate);
                            clone$.data('cView', { level: viewLevel });
                            $compile(clone$.contents())(newScope);

                            $animate.enter(clone$, null, currentElement$ || element, function() {
                                c6State.emit('viewChangeSuccess', state);
                            });

                            leave();
                        });

                        currentScope = newScope;
                        currentElement$ = clone$;
                    }

                    c6State.emit('viewReady');

                    c6State.on('viewChangeStart', update);
                }
            };
        }])

        .provider('c6State', [function() {
            var states = {},
                indexState = null;

            function setupState(name, state, parent) {
                state.name = name;
                state.cModel = null;
                state.cTemplate = null;
                state.cParent = parent || null;

                angular.forEach(state.children, function(child, childName) {
                    setupState((name + '.' + childName), child, state);
                });

                states[name] = state;
            }

            this.state = function() {
                setupState.apply(null, arguments);
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
                    var tree;

                    function climbTree(tree) {
                        var item = tree[0],
                            parent = item.cParent;

                        if (parent) {
                            tree.unshift(parent);
                            return climbTree(tree);
                        }

                        return tree;
                    }

                    function doTransition(state) {
                        var from = c6State.current;

                        function resolveState(state) {
                            angular.copy(params, c6StateParams);

                            return _service.resolveState(state);
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
                            c6State.emit('viewChangeStart', state, from);

                            return deferred.promise;
                        }

                        function setCurrent(state) {
                            c6State.current = state;

                            return state;
                        }

                        function removeTransition() {
                            delete c6State.transitions[name];
                        }

                        c6State.emit('transitionStart', state, from);

                        return resolveState(state)
                            .then(changeView)
                            .then(setCurrent)
                            .finally(removeTransition);
                    }

                    function execute() {
                        var promise;

                        angular.forEach(tree, function(state) {
                            if (!promise) {
                                promise = doTransition(state);
                            } else {
                                promise = promise.then(function() {
                                    return doTransition(state);
                                });
                            }
                        });

                        c6State.transitions[name] = promise;

                        return promise;
                    }

                    tree = climbTree([states[name]]);

                    return $q.all(this.transitions)
                        .then(execute);
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
