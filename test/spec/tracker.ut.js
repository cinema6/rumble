(function() {
    'use strict';

    define(['tracker'], function() {
        var tracker,
            trackerProvider,
            $window;

        describe('tracker',function(){
            beforeEach(function(){
                module('c6.ui');
    
                module('c6.rumble.services', function($provide, $injector) {

                    $window = { };

                    $provide.value('$window',$window);
                    trackerProvider = $injector.get('trackerServiceProvider');
                });
    
                inject(function($injector) {
                    tracker  = $injector.get('trackerService');
                });

            });

            describe('trackerSerivceProvider',function(){
                describe('api',function(){
                    it('defaults to ga',function(){
                        expect(trackerProvider.api()).toEqual('ga');
                    });

                    it('can be overridden',function(){
                        expect(trackerProvider.api('other')).toEqual('other');
                    });
                });
            });

            describe('tracker',function(){
                describe('TrackerContext',function(){
                    var TrackerContext;
                    beforeEach(function(){
                        TrackerContext = tracker._private.TrackerContext;
                        trackerProvider.api('_c6_');
                        $window._c6_ = jasmine.createSpy('$window._c6_');
                    });
                    describe('methodContext',function(){
                        it('uses ctxName if initted with one',function(){
                            var tc = new TrackerContext('xyz');
                            expect(tc.methodContext('send')).toEqual('xyz.send');
                        });
                        
                        it('uses nothing if initted with _default',function(){
                            var tc = new TrackerContext('_default');
                            expect(tc.methodContext('send')).toEqual('send');
                        });
                        
                        it('uses nothing if initted with nothing',function(){
                            var tc = new TrackerContext();
                            expect(tc.methodContext('send')).toEqual('send');
                        });
                    });

                    describe('alias',function(){
                        var tracker;
                        beforeEach(function(){
                            tracker = new TrackerContext();
                        });
                        it('sets an alias of you pass in a name and val',function(){
                            tracker.alias('a1','b1');
                            tracker.alias('a2','b2');
                            expect(tracker.aliases.a1).toEqual('b1');
                            expect(tracker.aliases.a2).toEqual('b2');
                        });

                        it('returns an alias if you only pass in a name',function(){
                            tracker.alias('a1','b1');
                            tracker.alias('a2','b2');
                            expect(tracker.alias('a1')).toEqual('b1');
                            expect(tracker.alias('a2')).toEqual('b2');
                        });

                        it('returns the name passed if not an alias',function(){
                            expect(tracker.alias('a1')).toEqual('a1');
                            expect(tracker.alias('a2')).toEqual('a2');
                        });

                        it('clears an alias if you pass null as the value',function(){
                            tracker.alias('a1','b1');
                            tracker.alias('a2','b2');
                            tracker.alias('a1',null);
                            expect(tracker.alias('a1')).toEqual('a1');
                            expect(tracker.alias('a2')).toEqual('b2');
                        });

                        it('can take a hash of name,vals',function(){
                            tracker.alias({
                                a1 : 'b1',
                                a2 : 'b2',
                                a3 : 'b3'
                            });
                            expect(tracker.alias('a1')).toEqual('b1');
                            expect(tracker.alias('a2')).toEqual('b2');
                            expect(tracker.alias('a3')).toEqual('b3');
                            tracker.alias({
                                a1 : 'c1',
                                a2 : null,
                                a3 : 'c3'
                            });
                            expect(tracker.alias('a1')).toEqual('c1');
                            expect(tracker.alias('a2')).toEqual('a2');
                            expect(tracker.alias('a3')).toEqual('c3');
                        });
                    });

                    describe('create',function(){
                        it('proxies call to underlying api create',function(){
                            var tc = new TrackerContext('tt');
                            tc.create('param1','param2');
                            expect($window._c6_.argsForCall[0])
                                .toEqual(['create','param1','param2']);
                            expect($window._c6_.argsForCall[1])
                                .toEqual(['tt.require','displayfeatures']);
                        });

                        it('sets the created property when called',function(){
                            var tc = new TrackerContext('tt');
                            expect(tc.created).toEqual(false);
                            tc.create('param1','param2');
                            expect(tc.created).toEqual(true);
                        });
                    });

                    describe('set',function(){
                        var tracker;
                        beforeEach(function(){
                            tracker = new TrackerContext('tt');
                        });

                        it('handles a single property',function(){
                            tracker.set('prop1','val1');
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.set','prop1','val1');
                        });

                        it('handles a property object',function(){
                            var obj = {
                                prop1 : 'val1',
                                prop2 : 'val2'
                            };
                            tracker.set(obj);
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.set',obj);
                        });

                        it('handles a single property with an alias',function(){
                            tracker.alias('algebra','prop1');
                            tracker.set('algebra','val1');
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.set','prop1','val1');
                        });
                        
                        it('handles a property object with aliases',function(){
                            tracker.alias('algebra','prop1');
                            tracker.alias('geometry','prop2');
                            tracker.set({
                                algebra : 'val1',
                                geometry : 'val2'
                            });
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.set',{
                                    prop1 : 'val1',
                                    prop2 : 'val2'
                                });
                        });

                    });

                    describe('trackPage',function(){
                        var tracker;
                        beforeEach(function(){
                            tracker = new TrackerContext('tt');
                        });

                        it('works with no arguments',function(){
                            tracker.trackPage();
                            expect($window._c6_).toHaveBeenCalledWith('tt.send','pageview');
                        });

                        it('works with just a page',function(){
                            tracker.trackPage('/somepage');
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send','pageview','/somepage');
                        });

                        it('works with a page and title as params',function(){
                            tracker.trackPage('/mypage','My Page');
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send','pageview',{
                                    page  : '/mypage',
                                    title : 'My Page'
                                });
                        });

                        it('works with a page object',function(){
                            tracker.trackPage({
                                page : '/mypage',
                                title: 'My Page'
                            });
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send','pageview',{
                                    page  : '/mypage',
                                    title : 'My Page'
                                });
                        });
                        
                        it('works with a page object with aliases',function(){
                            tracker.alias('prop1','dimension1');
                            tracker.alias('prop2','dimension2');
                            tracker.trackPage({
                                page  : '/mypage',
                                title : 'My Page',
                                prop1 : 'val1',
                                prop2 : 'val2',
                            });
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send','pageview',{
                                    page  : '/mypage',
                                    title : 'My Page',
                                    dimension1 : 'val1',
                                    dimension2 : 'val2'
                                });
                        });
                    });
                    
                    describe('trackEvent',function(){
                        var tracker;
                        beforeEach(function(){
                            tracker = new TrackerContext('tt');
                        });

                        it('works with category and action params',function(){
                            tracker.trackEvent('cat1','action1');
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send',{
                                    hitType         : 'event',
                                    eventCategory   : 'cat1',
                                    eventAction     : 'action1'
                                });
                        });

                        it('works with category, action and label params',function(){
                            tracker.trackEvent('cat1','action1','label1');
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send',{
                                    hitType         : 'event',
                                    eventCategory   : 'cat1',
                                    eventAction     : 'action1',
                                    eventLabel      : 'label1'
                                });
                        });

                        it('works with category, action ,label and value params',function(){
                            tracker.trackEvent('cat1','action1','label1',99);
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send',{
                                    hitType         : 'event',
                                    eventCategory   : 'cat1',
                                    eventAction     : 'action1',
                                    eventLabel      : 'label1',
                                    eventValue      : 99
                                });
                        });

                        it('works with an event object', function(){
                            tracker.trackEvent({
                                eventCategory : 'cat1',
                                eventAction   : 'action1',
                            });
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send',{
                                    hitType         : 'event',
                                    eventCategory   : 'cat1',
                                    eventAction     : 'action1'
                                });
                        });

                        it('works with an event object using aliases', function(){
                            tracker.alias('category','eventCategory');
                            tracker.alias('action','eventAction');
                            tracker.alias('customProp','dimension1');
                            tracker.trackEvent({
                                category : 'cat1',
                                action   : 'action1',
                                customProp : 'val1'
                            });
                            expect($window._c6_)
                                .toHaveBeenCalledWith('tt.send',{
                                    hitType         : 'event',
                                    eventCategory   : 'cat1',
                                    eventAction     : 'action1',
                                    dimension1      : 'val1'
                                });
                        });
                    });
                });
                describe('service',function(){
                    it('returns a default context if none passed',function(){
                        var def = tracker();
                        expect(tracker._private.contexts._default).toBe(def);
                    });

                    it('creates a new named context if referenced',function(){
                        expect(tracker._private.contexts).toEqual({});
                        var t = tracker('abc');
                        expect(tracker._private.contexts.abc).toBe(t);
                    });

                    it('returns an existing named context if exists',function(){
                        var tracker1 = tracker('abc'),
                            tracker2 = tracker('abc');
                        expect(tracker2).toBe(tracker1);

                    });
                });
            });
        });
    });

}());
