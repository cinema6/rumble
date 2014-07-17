define(['services'], function(servicesModule) {
    'use strict';

    describe('InflectorService', function() {
        var InflectorService;

        beforeEach(function() {
            module(servicesModule.name);

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

                    it('should support strings with spaces', function() {
                        expect(getWords('it is cold outside')).toEqual(['it', 'is', 'cold', 'outside']);
                        expect(getWords('gotta get down on friday')).toEqual(['gotta', 'get', 'down', 'on', 'friday']);
                    });

                    it('should support combinations of the different forms', function() {
                        expect(getWords('this-isA_test')).toEqual(['this', 'is', 'a', 'test']);
                        expect(getWords('It\'s_really-coldOutside')).toEqual(['it\'s', 'really', 'cold', 'outside']);
                        expect(getWords('whatIs up-hommie')).toEqual(['what', 'is', 'up', 'hommie']);
                    });

                    it('should just return an array if given one', function() {
                        var array = [],
                            array2 = ['foo', 'hey'];

                        expect(getWords(array)).toBe(array);
                        expect(getWords(array2)).toBe(array2);
                    });
                });

                describe('toCamelCase(words)', function() {
                    var toCamelCase;

                    beforeEach(function() {
                        toCamelCase = InflectorService.toCamelCase.bind(InflectorService);
                    });

                    it('should convert the array to camelCase', function() {
                        expect(toCamelCase(['hello', 'my', 'friend'])).toBe('helloMyFriend');
                        expect(toCamelCase(['how', 'are', 'you'])).toBe('howAreYou');
                    });

                    it('should convert a string in any format to camelCase', function() {
                        expect(toCamelCase('how_are_you-today')).toBe('howAreYouToday');
                        expect(toCamelCase('it is freezing')).toBe('itIsFreezing');
                    });
                });

                describe('toConstructorCase(words)', function() {
                    var toConstructorCase;

                    beforeEach(function() {
                        toConstructorCase = InflectorService.toConstructorCase.bind(InflectorService);
                    });

                    it('should convert the array to ConstructorCase', function() {
                        expect(toConstructorCase(['my', 'class'])).toBe('MyClass');
                        expect(toConstructorCase(['it\'s', 'getting', 'late'])).toBe('It\'sGettingLate');
                    });

                    it('should convert a string in any format to ConstructorCase', function() {
                        expect(toConstructorCase('how_are_youToday')).toBe('HowAreYouToday');
                        expect(toConstructorCase('it is freezing')).toBe('ItIsFreezing');
                    });
                });

                describe('toSnakeCase(words)', function() {
                    var toSnakeCase;

                    beforeEach(function() {
                        toSnakeCase = InflectorService.toSnakeCase.bind(InflectorService);
                    });

                    it('should convert the array to snake_case', function() {
                        expect(toSnakeCase(['here\'s', 'a', 'test'])).toBe('here\'s_a_test');
                        expect(toSnakeCase(['this', 'is', 'fun'])).toBe('this_is_fun');
                    });

                    it('should convert a string in any format to snake_case', function() {
                        expect(toSnakeCase('it is_coldOut')).toBe('it_is_cold_out');
                        expect(toSnakeCase('StephAndMoo design stuff')).toBe('steph_and_moo_design_stuff');
                    });
                });

                describe('dasherize(words)', function() {
                    var dasherize;

                    beforeEach(function() {
                        dasherize = InflectorService.dasherize.bind(InflectorService);
                    });

                    it('should dasherize the array', function() {
                        expect(dasherize(['these', 'are', 'words'])).toBe('these-are-words');
                        expect(dasherize(['so', 'are', 'these'])).toBe('so-are-these');
                    });

                    it('should dasherize a string', function() {
                        expect(dasherize('iRan-today')).toBe('i-ran-today');
                        expect(dasherize('tomorrow IWill_bike-andRun')).toBe('tomorrow-i-will-bike-and-run');
                    });
                });

                describe('toSentence(words)', function() {
                    var toSentence;

                    beforeEach(function() {
                        toSentence = InflectorService.toSentence.bind(InflectorService);
                    });

                    it('should space out the words in an array', function() {
                        expect(toSentence(['this', 'is', 'an', 'array'])).toBe('this is an array');
                        expect(toSentence(['the', 'computer', 'can', 'speak'])).toBe('the computer can speak');
                    });

                    it('should space out a string in any format', function() {
                        expect(toSentence('holyCow How-are_you')).toBe('holy cow how are you');
                        expect(toSentence('ITruly-have_a great-job')).toBe('i truly have a great job');
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
