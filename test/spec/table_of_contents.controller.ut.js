define(['app'], function(appModule) {
    'use strict';

    describe('TableOfContentsController', function() {
        var $rootScope,
            $scope,
            $controller,
            TableOfContentsCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                TableOfContentsCtrl = $controller('TableOfContentsController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(TableOfContentsCtrl).toEqual(jasmine.any(Object));
        });

        describe('@public', function() {
            describe('methods', function() {
                describe('select(card)', function() {
                    var onSelect, onExit,
                        card1, card2, card3;

                    beforeEach(function() {
                        card1 = { id: 'rc-bdde5741aba091' };
                        card2 = { id: 'rc-27b27644558f31' };
                        card3 = { id: 'rc-a095fbf4e4b9cd' };

                        onSelect = $scope.onSelect = jasmine.createSpy('onSelect()');
                        onExit = $scope.onExit = jasmine.createSpy('onExit()');
                    });

                    it('should call onSelect(), providing the card and call onExit()', function() {
                        TableOfContentsCtrl.select(card2);
                        expect(onSelect).toHaveBeenCalledWith({ card: card2 });
                        expect(onExit.calls.count()).toBe(1);

                        TableOfContentsCtrl.select(card3);
                        expect(onSelect).toHaveBeenCalledWith({ card: card3 });
                        expect(onExit.calls.count()).toBe(2);

                        TableOfContentsCtrl.select(card1);
                        expect(onSelect).toHaveBeenCalledWith({ card: card1 });
                        expect(onExit.calls.count()).toBe(3);
                    });
                });
            });
        });
    });
});
