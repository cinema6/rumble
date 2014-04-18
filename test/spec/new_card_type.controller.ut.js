(function() {
    'use strict';

    define(['editor'], function() {
        describe('NewCardTypeController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6State,
                NewCardTypeCtrl;

            var model;

            beforeEach(function() {
                model = {};

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    NewCardTypeCtrl = $controller('NewCardTypeController', { $scope: $scope, cModel: model });
                });
            });

            it('should exist', function() {
                expect(NewCardTypeCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('type', function() {
                    it('should be null', function() {
                        expect(NewCardTypeCtrl.type).toBeNull();
                    });
                });
            });

            describe('methods', function() {
                describe('edit()', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');
                    });

                    it('should transition to the edit state with the chosen type', function() {
                        NewCardTypeCtrl.type = 'video';
                        NewCardTypeCtrl.edit();
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard.edit', { cardType: 'video' });

                        NewCardTypeCtrl.type = 'videoBallot';
                        NewCardTypeCtrl.edit();
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard.edit', { cardType: 'videoBallot' });

                        NewCardTypeCtrl.type = 'ad';
                        NewCardTypeCtrl.edit();
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard.edit', { cardType: 'ad' });
                    });

                    it('should throw an error if there is no type set', function() {
                        expect(function() {
                            NewCardTypeCtrl.edit();
                        }).toThrow(new Error('Can\'t edit before a type is chosen.'));
                        expect(c6State.goTo).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());
