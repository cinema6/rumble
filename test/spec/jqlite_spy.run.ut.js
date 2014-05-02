(function() {
    'use strict';

    define(['app'], function() {
        var jqLite = angular.element;

        describe('jqLite spy', function() {
            var $timeout,
                cinema6,
                $q;

            var $testBox,
                session;

            function assertPingMod() {
                it('should ping the parent that the DOM was modified', function() {
                    $timeout.flush();
                    expect(session.ping).toHaveBeenCalledWith('domModified');
                });
            }

            beforeEach(function() {
                session = {
                    ping: jasmine.createSpy('session.ping()')
                };

                $testBox = $('<div>');
                $('body').append($testBox);

                module('c6.mrmaker');

                inject(function($injector) {
                    $timeout = $injector.get('$timeout');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');
                });

                spyOn(cinema6, 'getSession')
                    .and.returnValue($q.when(session));
            });

            afterEach(function() {
                $testBox.remove();
            });

            describe('addClass()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div>');

                    $div.addClass('foo');
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.hasClass('foo')).toBe(true);
                });

                assertPingMod();
            });

            describe('after()', function() {
                var $div, $span;

                beforeEach(function() {
                    $div = jqLite('<div>');
                    $testBox.append($div);
                    $span = jqLite('<span>');

                    $div.after($span);
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.next()[0]).toBe($span[0]);
                });

                assertPingMod();
            });

            describe('append()', function() {
                var $div, $span;

                beforeEach(function() {
                    $div = jqLite('<div>');
                    $span = jqLite('<span>');

                    $div.append($span);
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.children()[0]).toBe($span[0]);
                });

                assertPingMod();
            });

            describe('attr()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div>');

                    $div.attr('style', 'display: none;');
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.attr('style')).toBe('display: none;');
                });

                assertPingMod();
            });

            describe('css()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div>');

                    $div.css({
                        display: 'none',
                        color: 'red'
                    });
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.css('display')).toBe('none');
                    expect($div.css('color')).toBe('red');
                });

                assertPingMod();
            });

            describe('empty()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div>Hello!</div>');

                    $div.empty();
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.text()).toBe('');
                });

                assertPingMod();
            });

            describe('html()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div>');

                    $div.html('<b>Hey</b>');
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.html()).toBe('<b>Hey</b>');
                });

                assertPingMod();
            });

            describe('prepend()', function() {
                var $div, $span;

                beforeEach(function() {
                    $div = jqLite('<div><div></div></div>');
                    $span = jqLite('<span>');
                    $testBox.append($div);
                    $timeout.flush();
                    session.ping.calls.reset();

                    $div.prepend($span);
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.children()[0]).toBe($span[0]);
                });

                assertPingMod();
            });

            describe('remove()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div><span>Hello</span></div>');

                    $div.find('span').remove();
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.children().length).toBe(0);
                });

                assertPingMod();
            });

            describe('remove()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div><span data-hey="foo">Hello</span></div>');

                    $div.find('span').removeAttr('data-hey');
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.html()).toBe('<span>Hello</span>');
                });

                assertPingMod();
            });

            describe('removeClass()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div class="bar"></div>');

                    $div.removeClass('bar');
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.hasClass('bar')).toBe(false);
                });

                assertPingMod();
            });

            describe('replaceWith()', function() {
                var $div, $span;

                beforeEach(function() {
                    $div = jqLite('<div><div></div></div>');
                    $span = jqLite('<span>');

                    $div.find('div').replaceWith($span);
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.children()[0]).toBe($span[0]);
                    expect($div.children().length).toBe(1);
                });

                assertPingMod();
            });

            describe('text()', function() {
                var $div;

                beforeEach(function() {
                    $div = jqLite('<div>');

                    $div.text('Hello!');
                });

                it('should call through to the original jqLite method', function() {
                    expect($div.text()).toBe('Hello!');
                });

                assertPingMod();
            });

            describe('wrap()', function() {
                var $div, $span;

                beforeEach(function() {
                    $div = jqLite('<div class="wrapper">');
                    $span = jqLite('<span>');

                    $span.wrap($div);
                });

                it('should call through to the original jqLite method', function() {
                    expect($span.parent().hasClass('wrapper')).toBe(true);
                });

                assertPingMod();
            });
        });
    });
}());
