(function() {
    'use strict';

    define(['editor'], function() {
        describe('MRPreviewController', function() {
            var $rootScope,
                $scope,
                $controller,
                MiniReelService,
                postMessage,
                session,
                c6BrowserInfo,
                MRPreviewController;

            beforeEach(function() {
                c6BrowserInfo = {
                    profile: {}
                };

                session = {
                    on: jasmine.createSpy('session.on()')
                };

                module('c6.ui', function($provide) {
                    $provide.value('c6BroswerInfo',c6BrowserInfo);
                });
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $scope = $rootScope.$new();
                    MiniReelService = $injector.get('MiniReelService');
                    postMessage = $injector.get('postMessage');

                    MRPreviewController = $controller('MRPreviewController', { $scope: $scope });
                });

            });

            xdescribe('initialization', function() {
                it('should exist', function() {
                    expect(MRPreviewController).toEqual(jasmine.any(Object));
                });

                it('should set the default mode to full', function() {
                    expect(MRPreviewController.mode).toBe('full');
                });
            });

            xdescribe('$scope listeners', function() {
                describe('mrPreview:initExperience', function() {
                    var exp, iframe;

                    beforeEach(function() {
                        exp = {};
                        iframe = {
                            prop: jasmine.createSpy('iframe.prop()')
                        };
                        MiniReelService.preview = jasmine.createSpy('MiniReelService.preview()');
                        spyOn(postMessage, 'createSession').andReturn(session);
                    });

                    it('should do stuff', function() {
                        $scope.$emit('mrPreview:initExperience', exp, iframe);
                        expect(iframe.prop).toHaveBeenCalled();
                        expect(MiniReelService.preview).toHaveBeenCalled();
                        expect(postMessage.createSession).toHaveBeenCalled();
                        expect(session.on).toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());