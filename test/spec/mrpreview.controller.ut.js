(function() {
    'use strict';

    define(['editor'], function() {
        describe('PreviewController', function() {
            var $rootScope,
                $scope,
                $controller,
                MiniReelService,
                c6BrowserInfo,
                PreviewController;

            var session, postMessage;

            beforeEach(function() {
                c6BrowserInfo = {
                    profile: {}
                };

                // session = {
                //     on: jasmine.createSpy('session.on()'),
                //     ping: jasmine.createSpy('session.ping()')
                // };

                session = {
                    on: function(){},
                    ping: function(){}
                };

                module('c6.ui', function($provide) {
                    $provide.value('c6BroswerInfo',c6BrowserInfo);
                    $provide.service('postMessage',{
                        createSession: jasmine.createSpy('postMessage.createSession()')
                            .andReturn(session)
                    });
                });

                module('c6.mrmaker', function($provide) {
                    $provide.service('MiniReelService',{
                        convertForPlayer: jasmine.createSpy('MiniReelService.convertForPlayer()')
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                    postMessage = $injector.get('postMessage');

                    $scope = $rootScope.$new();

                    PreviewController = $controller('PreviewController', { $scope: $scope });
                });

            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(PreviewController).toEqual(jasmine.any(Object));
                });

                it('should set the default mode to full', function() {
                    expect(PreviewController.device).toBe('desktop');
                });
            });

            describe('$scope listeners', function() {
                describe('mrPreview:initExperience', function() {
                    var exp,
                        iframe;

                    beforeEach(function() {
                        exp = {};
                        iframe = {
                            prop: jasmine.createSpy('iframe.prop()')
                        };
                    });

                    it('should do stuff', function() {
                        $scope.$emit('mrPreview:initExperience', exp, iframe);
                        expect(iframe.prop).toHaveBeenCalled();
                        expect(MiniReelService.convertForPlayer).toHaveBeenCalled();
                        expect(postMessage.createSession).toHaveBeenCalled();
                        expect(session.on).toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());