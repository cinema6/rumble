module.exports = function(grunt) {
    'use strict';

    var mongodb = require('mongodb'),
        q = require('q'),
        request = require('request');

    var log = grunt.log;

    grunt.registerTask('holdelection', 'Initialize the vote service with an election for each new (uninitialized) minireel', function() {
        /* jshint camelcase:false */
        var done = this.async(),
            options = this.options(),
            mongo = new mongodb.MongoClient(
                new mongodb.Server(options.mongo.host, options.mongo.port || 27017),
                { native_parser: true }
            ),
            db = mongo.db(options.mongo.db),
            collection = db.collection('elections');

        function api(route) {
            return options.content.apiBase + route;
        }

        function send(method, url, body) {
            var deferred = q.defer();

            request({
                method: method,
                url: url,
                json: body,
                jar: true
            }, function(error, response, body) {
                var json;

                if (error || (response.statusCode >= 400)) {
                    deferred.reject(error || body);
                }

                try {
                    json = JSON.parse(body);
                } catch(e) {
                    json = body;
                }

                deferred.resolve(json);
            });

            return deferred.promise;
        }

        function authenticate() {
            log.subhead('Authenticating');

            return send('POST', api(options.content.authenticate), {
                username: options.content.username,
                password: options.content.password
            });
        }

        function getMinireels() {
            log.ok('Success!');

            log.subhead('Fetching MiniReels');

            return send('GET', api(options.content.findAll));
        }

        function createElections(minireels) {
            log.ok('Success!');

            log.subhead('Creating Elections');

            function connectToMongo() {
                function open() {
                    return q.ninvoke(mongo, 'open');
                }

                function authenticate() {
                    return q.ninvoke(db, 'authenticate', options.mongo.user, options.mongo.password);
                }

                return open()
                    .then(authenticate);
            }

            function createElection(minireel) {
                function verifyNonExistence(minireel) {
                    var cursor = collection.find({ id: minireel.id });

                    function query() {
                        return q.ninvoke(cursor, 'toArray');
                    }

                    function count(items) {
                        return (items.length > 0) ?
                            q.reject('Election ' + minireel.id + ' already exists!') :
                            q.when(true);
                    }

                    return query()
                        .then(count);
                }

                function insert() {
                    function generateElection() {
                        var deck = minireel.data.deck,
                            election = {
                                id: minireel.id,
                                ballot: {}
                            },
                            ballot = election.ballot;

                        deck.forEach(function(card) {
                            var choices;

                            if ((card.modules || []).indexOf('ballot') < 0) {
                                return;
                            }

                            choices = ballot[card.id] = {};

                            card.ballot.forEach(function(choice) {
                                choices[choice] = 0;
                            });
                        });

                        return q.when(election);
                    }

                    function writeToDb(election) {
                        log.writeln('Writing election ' + election.id + ' to Mongo.');

                        return q.ninvoke(collection, 'insert', election, {
                            w: 1,
                            journal: true
                        });
                    }

                    return generateElection()
                        .then(writeToDb);
                }

                function warn() {
                    return log.writeln('MiniReel ' + minireel.id + ' already has an election. Skipping!');
                }

                return verifyNonExistence(minireel)
                    .then(insert, warn);
            }

            return connectToMongo()
                .then(function() {
                    return q.all(minireels.map(createElection));
                });
        }

        authenticate()
            .then(getMinireels)
            .then(createElections)
            .then(done, grunt.fail.fatal.bind(grunt.fail));
    });
};
