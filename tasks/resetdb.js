(function() {
    'use strict';
    var mongodb = require('mongodb'), q = require('q');

    function resetCollection(collection,data,dbConfig){
        /* jshint camelcase:false */
        var cli, db, coll;
        var mongoClient = new mongodb.MongoClient(
            new mongodb.Server(dbConfig.host, dbConfig.port), {native_parser:true}
        );
        return q.npost(mongoClient, 'open')
            .then(function(mongoClient){
                cli     = mongoClient;
                db      = cli.db(dbConfig.db);
                coll    = db.collection(collection);
                if  (dbConfig.user){
                    return q.npost(db, 'authenticate', [ dbConfig.user, dbConfig.pass]);
                }
                return q();
            })
            .then(function(){
                return q.npost(db, 'collectionNames', [collection]);
            })
            .then(function(names){
                if (names.length === 0 ) {
                    return q();
                }
                return q.npost(coll, 'drop');
            })
            .then(function(){
                if (!data) {
                    return q();
                }

                if (data instanceof Array) {
                    return q.all(data.map(function(obj) {
                        return q.npost(coll,'insert',[obj, { w: 1, journal: true }]);
                    }));
                }

                return q.npost(coll,'insert',[data, { w: 1, journal: true }]);
            })
            .then(function(){
                cli.close();
            });
    }

    module.exports = function(grunt) {
        grunt.registerMultiTask('resetdb', 're-initializes the test db', function() {
            var done       = this.async(),
                collection =  this.options().collection || this.target,
                data       =  this.data ? this.data.data : undefined,
                timeout    =  this.options().timeout || 5000;

            grunt.log.writelns('Reset collection: ',collection);
            resetCollection(collection,this.data.data,this.options())
            .timeout(timeout)
            .then(function(){
                var recs = data ? ( (data instanceof Array) ? data.length : 1) : 0;
                grunt.log.ok(recs + ' records written.');
                done(true);
            })
            .catch(function(err){
                grunt.fail.fatal(err);
                done(false);
            });
        });
    };
}());
