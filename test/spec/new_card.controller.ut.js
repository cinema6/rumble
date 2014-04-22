(function() {
    'use strict';

    define(['editor'], function() {
        describe('NewCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                VideoService,
                computer,
                c6State,
                c6StateParams,
                MiniReelService,
                NewCardCtrl;

            var model;

            beforeEach(function() {
                model = {
                    id: 'rc-80402f8fe32a47'
                };

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
                    MiniReelService = $injector.get('MiniReelService');

                    spyOn(VideoService, 'createVideoUrl').and.callThrough();
                    c6State.get('editor').cModel = { id: 'e-fcfb709c23e0fd' };

                    $scope = $rootScope.$new();
                    NewCardCtrl = $controller('NewCardController', { $scope: $scope, cModel: model });
                    NewCardCtrl.model = model;
                });
            });

            it('should exist', function() {
                expect(NewCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('type', function() {
                    it('should be initialized as "video"', function() {
                        expect(NewCardCtrl.type).toBe('video');
                    });
                });
            });

            describe('methods', function() {
                describe('edit()', function() {
                    beforeEach(function() {
                        c6StateParams.insertionIndex = 4;
                        NewCardCtrl.type = 'blah';
                        spyOn($scope, '$emit').and.callThrough();
                        spyOn(c6State, 'goTo');
                        spyOn(MiniReelService, 'setCardType');

                        NewCardCtrl.edit();
                    });

                    it('should convert the card to the current type', function() {
                        expect(MiniReelService.setCardType).toHaveBeenCalledWith(model, 'blah');
                    });

                    it('should $emit a "addCard" event', function() {
                        expect($scope.$emit).toHaveBeenCalledWith('addCard', model, 4);
                    });

                    it('should transition to the edit card state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.editCard.copy', { cardId: 'rc-80402f8fe32a47' });
                    });
                });
            });
        });
    });
}());
