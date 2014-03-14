module.exports = {
    options: {
        mongo: {
            host: 'dv-mongo1.corp.cinema6.com',
            db: 'voteDb',
            user: '<%= personal.mongo.user %>',
            password: '<%= personal.mongo.password %>',
        },
        content: {
            username: '<%= personal.auth.username %>',
            password: '<%= personal.auth.password %>',
            apiBase: 'http://staging.cinema6.com/api',
            authenticate: '/auth/login',
            findAll: '/content/experiences?type=minireel'
        }
    }
};
