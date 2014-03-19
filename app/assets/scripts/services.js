(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .service('MiniReelService', [function() {
            this.open = function(minireel) {
                var model = {
                        data: {
                            deck: [
                                {
                                    id: 'foo',
                                    type: 'intro'
                                }
                            ]
                        }
                    },
                    template, dataTemplates, videoDataTemplate;

                /******************************************************\
                 * * * * * * * * * * HELPER FUNCTIONS * * * * * * * * *
                \******************************************************/
                // Copy the value from the raw source with an optional
                // default.
                function copy(def) {
                    return function(key) {
                        var value = this[key];

                        return angular.isUndefined(value) ?
                            def : angular.copy(value);
                    };
                }

                // Used for copying the start/end times off of the
                // cards. This is needed because the start/end for
                // Dailymotion must be "undefined" rather than
                // "null".
                function trim() {
                    return function(key, card) {
                        var value = card.data[key],
                            def = (card.type === 'dailymotion') ?
                                undefined : null;

                        return angular.isNumber(value) ?
                            value : def;
                    };
                }

                // Simply use the provided value.
                function value(val) {
                    return function() {
                        return val;
                    };
                }

                /******************************************************\
                 * * * * * * * * CONFIGURATION DEFINITION * * * * * * *
                \******************************************************/
                // template: this is for every part of every card with the
                // exception of the "data" object.
                // IMPORTANT: when this configuration is read, every function
                // will be called with the name of the current property and
                // a reference to the untranspiled card as arguments. It will
                // also set "this" to be a reference to the untranspiled card.
                template = {
                    id: copy(),
                    type: function(key, card) {
                        switch(card.type) {

                        case 'youtube':
                        case 'vimeo':
                        case 'dailymotion':
                            return 'video' + ((card.modules.indexOf('ballot') > -1) ?
                                'Ballot' : '');
                        default:
                            return card.type;

                        }
                    },
                    title: copy(null),
                    note: copy(null),
                    ad: copy(false)
                };

                // videoDataTemplate: this is the base template for all
                // video cards.
                videoDataTemplate = {
                    service: function(key, card) {
                        return card.type;
                    },
                    videoid: copy(),
                    start: trim(),
                    end: trim()
                };

                // dataTemplates: configuration for the "data" section of
                // every card, organized by card type.
                // IMPORTANT: when this configuration is read, every function
                // will be called with the name of the current property and
                // a reference to the untranspiled card as arguments. It will
                // also set "this" to be a reference to the untranspiled card's
                // "data" object.
                dataTemplates = {
                    video: videoDataTemplate,
                    videoBallot: angular.extend(angular.copy(videoDataTemplate), {
                        ballot: value([])
                    }),
                    ad: {
                        autoplay: copy(),
                        publisher: copy()
                    },
                    links: {
                        links: copy()
                    }
                };

                /******************************************************\
                 * * * * * * * * * READ CONFIGURATION * * * * * * * * *
                \******************************************************/
                // Loop through the experience and copy everything but
                // the "data" object.
                angular.forEach(minireel, function(value, key) {
                    if (key !== 'data') {
                        model[key] = value;
                    }
                });

                // Loop through the deck.
                angular.forEach(minireel.data.deck, function(rawCard) {
                    var card = {
                        data: {}
                    };

                    // Use the template defined above to populate the
                    // properties of the card.
                    angular.forEach(template, function(fn, key) {
                        card[key] = fn.call(rawCard, key, rawCard);
                    });

                    // Use the dataTemplates defined above to populate
                    // the data object of the card.
                    angular.forEach(dataTemplates[card.type], function(fn, key) {
                        card.data[key] = fn.call(rawCard.data, key, rawCard);
                    });

                    // Add the card to our deck.
                    model.data.deck.push(card);
                });

                return model;
            };
        }]);
}());
