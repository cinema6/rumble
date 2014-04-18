(function() {
    'use strict';

    define(['editor'], function() {
        describe('NewCardEditController', function() {
            var $rootScope,
                $scope,
                $controller,
                VideoService,
                computer,
                c6State,
                c6StateParams,
                NewCardEditCtrl;

            var model;

            beforeEach(function() {
                model = {};

                module('c6.ui', function($provide) {
                    $provide.decorator('c6Computed', function($delegate) {
                        return jasmine.createSpy('c6Computed()')
                            .and.callFake(function() {
                                computer = $delegate.apply($delegate, arguments);
                                return computer;
                            });
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    VideoService = $injector.get('VideoService');
                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');

                    spyOn(VideoService, 'createVideoUrl').and.callThrough();
                    c6State.get('editor').cModel = { id: 'e-fcfb709c23e0fd' };

                    $scope = $rootScope.$new();
                    NewCardEditCtrl = $controller('NewCardEditController', { $scope: $scope, cModel: model });
                    NewCardEditCtrl.model = model;
                });
            });

            it('should exist', function() {
                expect(NewCardEditCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                it('should create a videoUrl', function() {
                    expect(VideoService.createVideoUrl).toHaveBeenCalledWith(computer, NewCardEditCtrl, 'NewCardEditCtrl');
                });
            });

            describe('methods', function() {
                describe('save()', function() {
                    beforeEach(function() {
                        c6StateParams.insertionIndex = 4;
                        spyOn($scope, '$emit').and.callThrough();
                        spyOn(c6State, 'goTo');

                        NewCardEditCtrl.save();
                    });

                    it('should $emit a "addCard" event', function() {
                        expect($scope.$emit).toHaveBeenCalledWith('addCard', model, 4);
                    });

                    it('should transition back to the editor state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor');
                    });
                });
            });
        });
    });
}());
