(function() {
    'use strict';

    angular.module('c6.rumble.services', [])
        .service('InflectorService', [function() {
            var exceptions = [];

            this.pluralize = function(word) {
                var plural = (function() {
                    var result;

                    exceptions.some(function(exception) {
                        if (exception.singular === word) {
                            return !!(result = exception.plural);
                        }
                    });

                    return result;
                }());

                return plural || (word + 's');
            };

            this.singularize = function(word) {
                var singular = (function() {
                    var result;

                    exceptions.some(function(exception) {
                        if (exception.plural === word) {
                            return !!(result = exception.singular);
                        }
                    });

                    return result;
                }());

                return singular || word.replace(/s$/, '');
            };

            this.capitalize = function(word) {
                return word.charAt(0).toUpperCase() + word.substring(1);
            };

            this.getWords = function(string) {
                var result = [],
                    word = string.charAt(0),
                    character,
                    index,
                    length = string.length;

                function isDelimiter(char) {
                    return !!char.match(/-|_|[A-Z]| /);
                }

                function isLetter(char) {
                    return !!char.match(/[A-Za-z]/);
                }

                function pushWord(word) {
                    result.push(word.toLowerCase());
                }

                for (index = 1; index < length; index++) {
                    character = string.charAt(index);

                    if (isDelimiter(character) && word) {
                        pushWord(word);
                        word = isLetter(character) ? character : '';

                        continue;
                    }

                    word += character;
                }

                pushWord(word);

                return result;
            };

            this.toCamelCase = function(words) {
                var self = this;

                words = angular.isArray(words) ? words : this.getWords(words);

                return words.map(function(word, index) {
                    if (index === 0) { return word; }

                    return self.capitalize(word);
                }).join('');
            };

            this.toConstructorCase = function(words) {
                return this.capitalize(this.toCamelCase(words));
            };

            this.toSnakeCase = function(words) {
                words = angular.isArray(words) ? words : this.getWords(words);

                return words.join('_');
            };

            this.dasherize = function(words) {
                words = angular.isArray(words) ? words : this.getWords(words);

                return words.join('-');
            };

            this.toSentence = function(words) {
                words = angular.isArray(words) ? words : this.getWords(words);

                return words.join(' ');
            };

            this.addException = function(exception) {
                exceptions.push(exception);
            };
        }]);
}());
