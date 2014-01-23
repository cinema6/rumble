(function() {
    'use strict';

    define(['services'], function() {
        describe('InflectorService', function() {
            var InflectorService;

            beforeEach(function() {
                module('c6.rumble.services');

                inject(function($injector) {
                    InflectorService = $injector.get('InflectorService');
                });
            });

            it('should exist', function() {
                expect(InflectorService).toBeDefined();
            });

            describe('@public', function() {
                describe('methods: ', function() {
                    describe('pluralize(word)', function() {
                        it('should add an "s" to the word', function() {
                            var pluralize = InflectorService.pluralize.bind(InflectorService);

                            expect(pluralize('home')).toBe('homes');
                            expect(pluralize('friend')).toBe('friends');
                            expect(pluralize('computer')).toBe('computers');
                        });
                    });

                    describe('singularize(word)', function() {
                        it('should remove the trailing s on a word (if present)', function() {
                            var singularize = InflectorService.singularize.bind(InflectorService);

                            expect(singularize('homes')).toBe('home');
                            expect(singularize('snakes')).toBe('snake');
                            expect(singularize('vespers')).toBe('vesper');
                            expect(singularize('person')).toBe('person');
                            expect(singularize('howdy')).toBe('howdy');
                        });
                    });

                    describe('capitalize(word)', function() {
                        it('should capitalize the first letter of the word', function() {
                            var capitalize = InflectorService.capitalize.bind(InflectorService);

                            expect(capitalize('josh')).toBe('Josh');
                            expect(capitalize('evan')).toBe('Evan');
                            expect(capitalize('steph')).toBe('Steph');
                        });
                    });

                    describe('getWords(string)', function() {
                        var getWords;

                        beforeEach(function() {
                            getWords = InflectorService.getWords.bind(InflectorService);
                        });

                        it('should support camelcase', function() {
                            expect(getWords('helloGoodFriend')).toEqual(['hello', 'good', 'friend']);
                            expect(getWords('howAreYou')).toEqual(['how', 'are', 'you']);
                        });

                        it('should support "constructor-like" names', function() {
                            expect(getWords('MyConstructor')).toEqual(['my', 'constructor']);
                            expect(getWords('HomeController')).toEqual(['home', 'controller']);
                        });

                        it('should support snakecase', function() {
                            expect(getWords('my_class')).toEqual(['my', 'class']);
                            expect(getWords('hello_friend')).toEqual(['hello', 'friend']);
                        });

                        it('should support dasherized strings', function() {
                            expect(getWords('are-you-okay')).toEqual(['are', 'you', 'okay']);
                            expect(getWords('i-ate-icecream')).toEqual(['i', 'ate', 'icecream']);
                        });

                        it('should support combinations of the different forms', function() {
                            expect(getWords('this-isA_test')).toEqual(['this', 'is', 'a', 'test']);
                            expect(getWords('It\'s_really-coldOutside')).toEqual(['it\'s', 'really', 'cold', 'outside']);
                        });
                    });

                    describe('toCamelCase(words)', function() {
                        it('should convert the array to camelcase', function() {
                            var toCamelCase = InflectorService.toCamelCase.bind(InflectorService);

                            expect(toCamelCase(['hello', 'my', 'friend'])).toBe('helloMyFriend');
                            expect(toCamelCase(['how', 'are', 'you'])).toBe('howAreYou');
                        });
                    });

                    describe('addException(exception)', function() {
                        it('should make singularize() and pluralize() use its rule', function() {
                            var singularize = InflectorService.singularize.bind(InflectorService),
                                pluralize = InflectorService.pluralize.bind(InflectorService),
                                addException = InflectorService.addException.bind(InflectorService);

                            addException({
                                singular: 'person',
                                plural: 'people'
                            });

                            expect(pluralize('person')).toBe('people');
                            expect(singularize('people')).toBe('person');

                            addException({
                                singular: 'foot',
                                plural: 'feet'
                            });

                            expect(pluralize('foot')).toBe('feet');
                            expect(singularize('feet')).toBe('foot');
                        });
                    });
                });
            });
        });
    });
}());
