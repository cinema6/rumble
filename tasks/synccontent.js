module.exports = function(grunt) {
    'use strict';

    var request = require('request'),
        q = require('q');

    var log = grunt.log;

    grunt.template.addDelimiters('url-segment', '{{', '}}');

    grunt.registerMultiTask('synccontent', 'Synchronize local content JSON files with cinema6 persistence services', function() {
        /********PROMISE FLOW CHART********\
         * authenticate()
         * .then(fetchContent)
         * .catch(normalize)
         * .then(syncContent)
         *     all(jsonContent):
         *         getId()
         *         .then(updateContent, createContent)
         *             sendToServer()
         *             .then(updateLocalId)
         * .then(updateLocal)
         **********************************/

        var done = this.async(),
            options = this.options({
                apiBase: 'http://33.33.33.20/api',
                authenticate: '/auth/login',
                identifier: 'uri',
                decorate: {}
            }),
            file = this.files[0],
            jsonContent = grunt.file.readJSON(file.src);

        function copy(object) {
            return JSON.parse(JSON.stringify(object));
        }

        function api(route) {
            return options.apiBase + route;
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

            return send('POST', api(options.authenticate), {
                email: options.username,
                password: options.password
            });
        }

        function fetchContent() {
            log.ok('Success!');

            log.subhead('Fetching Existing Content');

            return send(options.findAll.method, api(options.findAll.url));
        }

        function normalize() {
            return [];
        }

        function syncContent(content) {
            function decorateContent(content) {
                content = copy(content);

                delete content.id;
                delete content.user;
                delete content.created;

                for (var key in options.decorate) {
                    content[key] = options.decorate[key];
                }

                return content;
            }

            log.ok('Success!');

            log.subhead('Synchronizing Content');

            return q.all(jsonContent.map(function(object) {
                function getId(object) {
                    var id = null,
                        identifier = options.identifier;

                    content.forEach(function(serverObject) {
                        if (serverObject[identifier] === object[identifier]) {
                            id = serverObject.id;
                        }
                    });

                    return id ?
                        q.when(id) :
                        q.reject('Could not find an ID for local object: ' + object.id);
                }

                function updateLocalId(serverData) {
                    object.id = serverData.id;
                }

                function updateContent(id) {
                    var url = api(grunt.template.process(options.update.url, {
                            data: { id: id },
                            delimiters: 'url-segment'
                        })),
                        content = decorateContent(object);

                    log.writeln('Update content: ' + content[options.identifier]);

                    function sendToServer() {
                        return send(options.update.method, url, content);
                    }

                    return sendToServer()
                        .then(updateLocalId);
                }

                function createContent() {
                    var content = decorateContent(object);

                    log.writeln('Create content: ' + content[options.identifier]);

                    function sendToServer() {
                        return send(options.create.method, api(options.create.url), content);
                    }

                    return sendToServer()
                        .then(updateLocalId);
                }

                return getId(object)
                    .then(updateContent, createContent);
            }));
        }

        function updateLocal() {
            grunt.file.write(file.dest, JSON.stringify(jsonContent, null, '    '));
        }

        authenticate()
            .then(fetchContent)
            .catch(normalize)
            .then(syncContent)
            .then(updateLocal)
            .then(done, grunt.fail.fatal.bind(grunt.fail));
    });
};
