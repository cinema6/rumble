(function() {
    'use strict';

    define(['youtube'], function() {
        describe('VideoEmbedCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6EventEmitter,
                VideoEmbedCardCtrl;

            var ModuleService,
                ControlsService,
                c6AppData;

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.value('ModuleService', {
                        hasModule: jasmine.createSpy('ModuleService.hasModule()')
                    });

                    $provide.value('ControlsService', {
                        bindTo: jasmine.createSpy('ControlsService.bindTo()')
                    });
                });

                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {
                        mode: null,
                        profile: {
                            autoplay: true
                        },
                        behaviors: {
                            autoplay: true,
                            separateTextView: false
                        }
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    ModuleService = $injector.get('ModuleService');
                    ControlsService = $injector.get('ControlsService');
                    c6AppData = $injector.get('c6AppData');

                    $rootScope.config = {
                        modules: ['ballot', 'comments'],
                        data: {
                            videoid: 'gy1B3agGNxw'
                        }
                    };
                    $scope = $rootScope.$new();
                    VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(VideoEmbedCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    var origData;

                    beforeEach(function() {
                        origData = $rootScope.config._data = {};

                        VideoEmbedCardCtrl = $controller('VideoEmbedCardController', { $scope: $scope });
                    });

                    it('should not overwrite the data', function() {
                        expect($scope.config._data).toBe(origData);
                    });
                });

                describe('if the config has no _data', function() {
                    it('should create some data', function() {
                        expect($scope.config._data).toEqual({
                            playerEvents: {},
                            textMode: true,
                            modules: {
                                ballot: {
                                    ballotActive: false,
                                    resultsActive: false,
                                    vote: null
                                },
                                displayAd: {
                                    active: false
                                }
                            }
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('config._data.textMode', function() {
                    beforeEach(function() {
                        spyOn(VideoEmbedCardCtrl, 'dismissBallot');
                        $rootScope.$digest();
                    });

                    describe('initialization', function() {
                        it('should not dismiss the ballot', function() {
                            expect(VideoEmbedCardCtrl.dismissBallot).not.toHaveBeenCalled();
                        });
                    });

                    describe('whenever the property changes', function() {
                        function set(value) {
                            $scope.$apply(function() {
                                $scope.config._data.textMode = value;
                            });
                        }

                        it('should dismiss the ballot', function() {
                            set(false);
                            expect(VideoEmbedCardCtrl.dismissBallot).toHaveBeenCalled();

                            set(true);
                            expect(VideoEmbedCardCtrl.dismissBallot.callCount).toBe(2);

                            set(false);
                            expect(VideoEmbedCardCtrl.dismissBallot.callCount).toBe(3);
                        });
                    });
                });

                describe('config._data.modules.ballot.vote', function() {
                    beforeEach(function() {
                        spyOn(VideoEmbedCardCtrl, 'showText');

                        $scope.$apply(function() {
                            $scope.config._data.modules.ballot.vote = null;
                        });
                    });

                    it('should not switch to text mode on initialization', function() {
                        expect(VideoEmbedCardCtrl.showText).not.toHaveBeenCalled();
                    });

                    it('should switch to text mode after a vote is recorded', function() {
                        $scope.$apply(function() {
                            $scope.config._data.modules.ballot.vote = 0;
                        });

                        expect(VideoEmbedCardCtrl.showText).toHaveBeenCalled();
                    });
                });

                describe('active', function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({
                            play: jasmine.createSpy('iface.play()'),
                            pause: jasmine.createSpy('iface.pause()')
                        });

                        $scope.$emit('playerAdd', iface);
                    });

                    describe('when initialized', function() {
                        beforeEach(function() {
                            $rootScope.$digest();
                        });

                        it('should not play or paused the player', function() {
                            expect(iface.play).not.toHaveBeenCalled();
                            expect(iface.pause).not.toHaveBeenCalled();
                        });

                        it('should not put in a dummy vote', function() {
                            expect($scope.config._data.modules.ballot.vote).toBeNull();
                        });
                    });

                    describe('when not active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should not bind to the controls', function() {
                            expect(ControlsService.bindTo).not.toHaveBeenCalled();
                        });

                        it('should pause the player', function() {
                            expect(iface.pause).toHaveBeenCalled();
                        });
                    });

                    describe('putting a dummy vote in', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should happen when the card becomes inactive if the voting module is active', function() {
                            Object.defineProperty($scope.config._data.modules.ballot, 'ballotActive', {
                                configurable: true,
                                value: false
                            });

                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            expect($scope.config._data.modules.ballot.vote).toBeNull();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            Object.defineProperty($scope.config._data.modules.ballot, 'ballotActive', {
                                configurable: true,
                                value: true
                            });

                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            expect($scope.config._data.modules.ballot.vote).toBe(-1);
                        });
                    });

                    describe('when active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should bind to the controls', function() {
                            expect(ControlsService.bindTo).toHaveBeenCalledWith(iface);
                        });

                        describe('if the behavior is autoplay', function() {
                            it('should play the video', function() {
                                expect(iface.play).toHaveBeenCalled();
                            });
                        });

                        describe('if the device does not support autoplay', function() {
                            var currentPlayCalls;

                            beforeEach(function() {
                                currentPlayCalls = iface.play.callCount;

                                c6AppData.profile.autoplay = false;

                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                            });

                            it('should not play the video', function() {
                                expect(iface.play.callCount).toBe(currentPlayCalls);
                            });
                        });

                        describe('if the behavior is not to autoplay', function() {
                            var currentPlayCalls;

                            beforeEach(function() {
                                currentPlayCalls = iface.play.callCount;

                                c6AppData.behaviors.autoplay = false;

                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                            });

                            it('should not play the video', function() {
                                expect(iface.play.callCount).toBe(currentPlayCalls);
                            });
                        });
                    });
                });
            });

            describe('events', function() {
                describe('playerAdd', function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({
                            webHref: 'https://www.youtube.com/watch?v=oMB5YFtWQTE',
                            play: jasmine.createSpy('iface.play()'),
                            pause: jasmine.createSpy('iface.pause()')
                        });
                        spyOn(iface, 'once').andCallThrough();

                        $scope.$emit('playerAdd', iface);
                    });

                    it('should set the controller\'s videoUrl property to the webHref property of the player', function() {
                        iface.emit('ready', iface);

                        expect(VideoEmbedCardCtrl.videoUrl).toBe(iface.webHref);
                    });

                    it('should attach a listener to the "play" event', function() {
                        expect(iface.once).toHaveBeenCalledWith('play', jasmine.any(Function));
                    });

                    describe('when "play" is emitted', function() {
                        beforeEach(function() {
                            iface.emit('play', iface);
                        });

                        it('should set _data.modules.displayAd.active to true', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });

                    describe('config._data.modules.ballot.resultsActive', function() {
                        var ballot;

                        beforeEach(function() {
                            ballot = $scope.config._data.modules.ballot;
                        });

                        describe('if the results are inline', function() {
                            beforeEach(function() {
                                c6AppData.behaviors.inlineVoteResults = true;
                            });

                            it('should be true as long as there are voting results', function() {
                                expect(ballot.resultsActive).toBe(false);

                                ballot.vote = 0;
                                expect(ballot.resultsActive).toBe(true);

                                ballot.vote = -1;
                                expect(ballot.resultsActive).toBe(true);

                                ballot.vote = 2;
                                expect(ballot.resultsActive).toBe(true);
                            });
                        });

                        describe('if the results are not inline', function() {
                            beforeEach(function() {
                                c6AppData.behaviors.inlineVoteResults = false;
                            });

                            it('should be true if the user has voted and the video is not playing (and has been played once)', function() {
                                $scope.active = true;
                                iface.paused = true;
                                iface.ended = false;
                                ballot.vote = null;

                                expect(ballot.resultsActive).toBe(false);

                                iface.paused = false;
                                iface.emit('play', iface);

                                expect(ballot.resultsActive).toBe(false);

                                iface.paused = true;
                                iface.emit('pause', iface);

                                expect(ballot.resultsActive).toBe(false);

                                ballot.vote = 0;

                                expect(ballot.resultsActive).toBe(true);

                                iface.paused = false;
                                iface.emit('play', iface);

                                expect(ballot.resultsActive).toBe(false);

                                iface.paused = true;
                                iface.ended = true;
                                iface.emit('ended', iface);
                                iface.emit('paused', iface);

                                expect(ballot.resultsActive).toBe(true);
                            });

                            it('should be overrideable by VideoEmbedCardCtrl.dismissBallotResults()', function() {
                                $scope.active = true;
                                iface.paused = false;
                                iface.emit('play', iface);

                                iface.paused = true;
                                iface.emit('pause', iface);

                                ballot.vote = 1;

                                expect(ballot.resultsActive).toBe(true);

                                VideoEmbedCardCtrl.dismissBallotResults();

                                expect(ballot.resultsActive).toBe(false);

                                iface.paused = false;
                                iface.emit('play', iface);

                                iface.paused = true;
                                iface.emit('pause', iface);

                                expect(ballot.resultsActive).toBe(true);
                            });
                        });
                    });

                    describe('config._data.modules.ballot.ballotActive', function() {
                        var ballot;

                        beforeEach(function() {
                            ballot = $scope.config._data.modules.ballot;
                        });

                        it('should be a computed property that is true when the video is paused or ended and false when there are votes or the video is playing', function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                                iface.paused = true;
                                iface.ended = false;
                            });
                            expect(ballot.ballotActive).toBe(false);

                            $scope.$apply(function() {
                                iface.emit('play', iface);
                                iface.paused = false;
                                iface.ended = false;
                            });
                            expect(ballot.ballotActive).toBe(false);

                            $scope.$apply(function() {
                                iface.ended = true;
                            });
                            expect(ballot.ballotActive).toBe(true);

                            $scope.$apply(function() {
                                iface.paused = true;
                                iface.ended = false;
                            });
                            expect(ballot.ballotActive).toBe(true);

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            expect(ballot.ballotActive).toBe(false);

                            $scope.$apply(function() {
                                $scope.active = true;
                                ballot.vote = 0;
                            });
                            expect(ballot.ballotActive).toBe(false);
                        });

                        it('should be temporarily overrideable by VideoEmbedCardCtrl.dismissBallot()', function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                                iface.emit('play', iface);
                                iface.emit('play', iface);
                                iface.paused = true;
                                iface.ended = false;
                            });
                            expect(ballot.ballotActive).toBe(true);

                            $scope.$apply(function() {
                                VideoEmbedCardCtrl.dismissBallot();
                            });
                            expect(ballot.ballotActive).toBe(false);

                            $scope.$apply(function() {
                                iface.paused = false;
                                iface.emit('play', iface);
                            });
                            expect(ballot.ballotActive).toBe(false);

                            $scope.$apply(function() {
                                iface.ended = true;
                            });
                            expect(ballot.ballotActive).toBe(true);
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('videoUrl', function() {
                        it('should be initialized as null', function() {
                            expect(VideoEmbedCardCtrl.videoUrl).toBeNull();
                        });
                    });

                    describe('flyAway', function() {
                        describe('if the ballot module is not enabled', function() {
                            beforeEach(function() {
                                spyOn(VideoEmbedCardCtrl, 'hasModule').andCallFake(function(module) {
                                    if (module === 'ballot') {
                                        return false;
                                    }
                                });
                            });

                            it('should be false if the ballot module is active, but not enabled', function() {
                                $scope.active = true;
                                $scope.config._data.modules.ballot.ballotActive = true;

                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                            });

                            it('should be true if the card is not active', function() {
                                $scope.active = false;

                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });
                        });

                        describe(', if the ballot module is enabled,', function() {
                            beforeEach(function() {
                                spyOn(VideoEmbedCardCtrl, 'hasModule').andCallFake(function(module) {
                                    if (module === 'ballot') {
                                        return true;
                                    }
                                });
                            });

                            it('should be true if the ballot is active', function() {
                                $scope.$apply(function() {
                                    $scope.config._data.modules.ballot.ballotActive = true;
                                    $scope.active = true;
                                });

                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });

                            it('should be true if the card is not active', function() {
                                $scope.$apply(function() {
                                    $scope.config._data.modules.ballot.ballotActive = false;
                                    $scope.active = false;
                                });
                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });

                            it('should be true if the ballot results are active and they are not inline', function() {
                                var ballot = $scope.config._data.modules.ballot;

                                $scope.active = true;
                                c6AppData.behaviors.inlineVoteResults = true;
                                ballot.ballotActive = false;
                                ballot.resultsActive = true;

                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);

                                c6AppData.behaviors.inlineVoteResults = false;

                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });
                        });

                        describe('if the app has a separate text view', function() {
                            beforeEach(function() {
                                spyOn(VideoEmbedCardCtrl, 'hasModule').andReturn(false);

                                $scope.active = true;
                                c6AppData.behaviors.separateTextView = true;
                            });

                            it('should be true if text mode is on', function() {
                                $scope.config._data.textMode = true;

                                expect(VideoEmbedCardCtrl.flyAway).toBe(true);
                            });

                            it('should be false if text mode is off', function() {
                                $scope.config._data.textMode = false;

                                expect(VideoEmbedCardCtrl.flyAway).toBe(false);
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('hasModule(module)', function() {
                        it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                            VideoEmbedCardCtrl.hasModule('ballot');
                            expect(ModuleService.hasModule).toHaveBeenCalledWith($rootScope.config.modules, 'ballot');

                            VideoEmbedCardCtrl.hasModule('comments');
                            expect(ModuleService.hasModule).toHaveBeenCalledWith($rootScope.config.modules, 'comments');
                        });
                    });

                    describe('mode methods', function() {
                        var iface;

                        beforeEach(function() {
                            iface = c6EventEmitter({
                                webHref: 'https://www.youtube.com/watch?v=oMB5YFtWQTE',
                                play: jasmine.createSpy('iface.play()'),
                                pause: jasmine.createSpy('iface.pause()')
                            });

                            $scope.$emit('playerAdd', iface);
                        });

                        describe('showText()', function() {
                            beforeEach(function() {
                                $scope.config._data.textMode = false;

                                VideoEmbedCardCtrl.showText();
                            });

                            it('should pause the player and show the text', function() {
                                expect(iface.pause).toHaveBeenCalled();
                                expect($scope.config._data.textMode).toBe(true);
                            });
                        });

                        describe('hideText()', function() {
                            beforeEach(function() {
                                $scope.config._data.textMode = true;

                                VideoEmbedCardCtrl.hideText();
                            });

                            it('should play the player and hide the text', function() {
                                expect(iface.play).toHaveBeenCalled();
                                expect($scope.config._data.textMode).toBe(false);
                            });
                        });
                    });
                });
            });
        });
    });
}());
