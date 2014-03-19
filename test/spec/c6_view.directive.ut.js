(function() {
    'use strict';

    define(['c6_state'], function() {
        describe('<c6-view>', function() {
            var $rootScope,
                $scope,
                $compile,
                $animate;

            var c6State,
                HomeController;

            var view;

            beforeEach(function() {
                HomeController = jasmine.createSpy('HomeController');

                module('ngAnimateMock');

                module('c6.state', function($provide, $controllerProvider) {
                    $provide.factory('c6State', function(c6EventEmitter) {
                        var c6State = c6EventEmitter({});

                        spyOn(c6State, 'emit').and.callThrough();

                        return c6State;
                    });

                    $controllerProvider.register('HomeController', ['$scope', 'cModel', HomeController]);
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $animate = $injector.get('$animate');

                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                });

                $rootScope.$apply(function() {
                    view = $compile('<div><c6-view></c6-view></div>')($scope);
                });
            });

            describe('initialization', function() {
                it('should emit viewReady', function() {
                    expect(c6State.emit).toHaveBeenCalledWith('viewReady');
                });
            });

            describe('when viewChangeStart is emitted', function() {
                var homeState,
                    scope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        cTemplate: '<div>foo</div>',
                        cModel: {}
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    scope = view.find('c6-view div').scope();
                });

                it('should animate the new contents in', function() {
                    expect(view.text()).toBe('foo');
                    expect($animate.queue[0].event).toBe('enter');
                });

                it('should give the children a new scope', function() {
                    expect(view.find('c6-view div').scope().$parent).toBe($scope);
                });

                it('should replace the contents as views change', function() {
                    var contactsState = {
                            name: 'contacts',
                            cTemplate: '{{1 + 1}} is 2. Duh.',
                            cModel: null
                        },
                        oldScope = view.find('c6-view div').scope();

                    spyOn(oldScope, '$destroy').and.callThrough();

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', contactsState);
                    });

                    expect(oldScope.$destroy).toHaveBeenCalled();

                    expect(view.text()).toBe('2 is 2. Duh.');
                    expect($animate.queue[0].event).toBe('enter');
                    expect($animate.queue[1].event).toBe('enter');
                    expect($animate.queue[2].event).toBe('leave');
                });

                it('should put the cModel on the new scope', function() {
                    expect(scope.model).toBe(homeState.cModel);
                });
            });

            describe('if a controller is specified', function() {
                var homeState,
                    newScope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        controller: 'HomeController',
                        cTemplate: '<div>foo</div>',
                        cModel: {}
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    newScope = view.find('c6-view div').scope();
                });

                it('should invoke the controller with the new scope', function() {
                    expect(HomeController).toHaveBeenCalledWith(newScope, homeState.cModel);
                });
            });

            describe('if controllerAs is specified', function() {
                var homeState,
                    scope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        controller: 'HomeController',
                        controllerAs: 'HomeCtrl',
                        cTemplate: '<p>Hello</p>',
                        cModel: null
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    scope = view.find('c6-view *').scope();
                });

                it('should stick the controller on the scope', function() {
                    expect(scope.HomeCtrl).toEqual(new HomeController());
                });
            });

            describe('when the view change finishes', function() {
                var homeState;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        cTemplate: 'Foo',
                        cModel: null
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    $animate.queue[0].args[3]();
                });

                it('should emit viewChangeSuccess', function() {
                    expect(c6State.emit).toHaveBeenCalledWith('viewChangeSuccess', homeState);
                });
            });
        });
    });
}());
