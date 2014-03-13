module.exports = function(grunt) {
    'use strict';

    var request = require('request'),
        q = require('q');

    var log = grunt.log;

    grunt.template.addDelimiters('url-segment', '{{', '}}');

    grunt.registerMultiTask('synccontent', 'Synchronize local content JSON files with cinema6 persistence services', function() {
        var done = this.async(),
            options = this.options({
                apiBase: 'http://33.33.33.20/api',
                authenticate: '/auth/login',
                decorate: {}
            }),
            jsonContent = grunt.file.readJSON(this.filesSrc[0]);

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
                username: options.username,
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
                delete content.id;
                delete content.user;
                delete content.created;

                for (var key in options.decorate) {
                    content[key] = options.decorate[key];
                }

                return content;
            }

            function getId(object) {
                var id = null;

                content.forEach(function(serverObject) {
                    if (serverObject.uri === object.uri) {
                        id = serverObject.id;
                    }
                });

                return id ?
                    q.when({
                        id: id,
                        data: object
                    }) :
                    q.reject({
                        message: 'Could not find an ID for local object: ' + object.id,
                        data: object
                    });
            }

            function updateContent(data) {
                var url = api(grunt.template.process(options.update.url, {
                        data: { id: data.id },
                        delimiters: 'url-segment'
                    })),
                    content = decorateContent(data.data);

                log.writeln('Update content: ' + content.uri);

                return send('PUT', url, content);
            }

            function createContent(error) {
                var content = decorateContent(error.data);

                log.writeln('Create content: ' + content.uri);

                return send(options.create.method, api(options.create.url), content);
            }

            log.ok('Success!');

            log.subhead('Synchronizing Content');

            return q.all(jsonContent.map(function(object) {
                return getId(object)
                    .then(updateContent, createContent);
            }));
        }

        authenticate()
            .then(fetchContent)
            .catch(normalize)
            .then(syncContent)
            .then(done, grunt.fail.fatal.bind(grunt.fail));
    });
};
