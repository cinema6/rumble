(function() {
    'use strict';

    define(['editor'], function() {
        describe('<mr-preview>', function() {
            var $rootScope,
                $scope,
                $compile,
                postMessage,
                experience;

            beforeEach(function() {
                experience = {
                    id: 'foo',
                    data: {
                        deck: [
                            {
                                id: '1'
                            },
                            {
                                id: '2'
                            },
                            {
                                id: '3'
                            }
                        ]
                    }
                };

                module('c6.ui');

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    postMessage = $injector.get('postMessage');

                    $scope = $rootScope.$new();
                });
            });

            describe('initialization', function() {
                beforeEach(function() {
                    spyOn(postMessage, 'createSession');
                    spyOn($scope, '$emit').and.callThrough();
                    spyOn($scope, '$watch').and.callThrough();

                    $scope.$apply(function() {
                        $compile('<iframe src="about:blank" mr-preview="experience"></iframe>')($scope);
                    });
                });

                it('should setup a watcher', function() {
                    expect($scope.$watch).toHaveBeenCalled();
                    expect(postMessage.createSession).not.toHaveBeenCalled();
                    expect($scope.$emit).not.toHaveBeenCalled();
                });

                describe('when an experience is passed in', function() {
                    it('should do something', function() {
                        $scope.$apply(function() {
                            $scope.experience = experience;
                        });

                        expect(postMessage.createSession).toHaveBeenCalled();
                        expect($scope.$emit.calls.argsFor(0)[0]).toBe('mrPreview:initExperience');
                        expect($scope.$emit.calls.argsFor(0)[1]).toBe(experience);
                    });
                });
            });
        });
    });
}());