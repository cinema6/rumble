(function() {
    'use strict';

    define(['app'], function() {
        describe('EditorState', function() {
            var $injector,
                EditorState,
                $rootScope,
                $q,
                cinema6,
                c6State;

            var c6StateParams,
                EditorService;

            var minireel = {
                    id: 'e-9990920583a712',
                    processed: false
                },
                editorMinireel = {
                    id: 'e-9990920583a712',
                    processed: true
                };

            beforeEach(function() {
                module('c6.state', function($provide) {
                    $provide.value('c6StateParams', {});
                });

                module('c6.mrmaker', function($provide) {
                    $provide.service('EditorService', function() {
                        this.open = jasmine.createSpy('MiniReelService.open()')
                            .and.returnValue(editorMinireel);
                    });
                });

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');

                    c6StateParams = $injector.get('c6StateParams');
                    EditorService = $injector.get('EditorService');

                    EditorState = c6State.get('editor');
                });
            });

            it('should exist', function() {
                expect(EditorState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result,
                    success;

                beforeEach(function() {
                    spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));

                    success = jasmine.createSpy('model() success');

                    c6StateParams.minireelId = 'e-9990920583a712';

                    $rootScope.$apply(function() {
                        result = $injector.invoke(EditorState.model, EditorState);
                        result.then(success);
                    });
                });

                it('should return a promise', function() {
                    expect(result.then).toEqual(jasmine.any(Function));
                });

                it('should "open" the minireel for editing', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('experience', c6StateParams.minireelId);

                    expect(EditorService.open).toHaveBeenCalledWith(minireel);
                });

                it('should resolve to the transpiled minireel', function() {
                    expect(success).toHaveBeenCalledWith(editorMinireel);
                });

                describe('if there is already a model', function() {
                    beforeEach(function() {
                        EditorState.cModel = {};
                    });

                    it('should return the minireel in the editor format', function() {
                        expect($injector.invoke(EditorState.model, EditorState)).toBe(EditorState.cModel);
                    });
                });
            });
        });
    });
}());
