module.exports = {
    options: {
        apiBase: 'http://33.33.33.20/api',
        authenticate: '/auth/login',
        username: '<%= personal.auth.username %>',
        password: '<%= personal.auth.password %>'
    },
    experiences: {
        options: {
            decorate: {
                type: 'minireel'
            },
            findAll: {
                method: 'GET',
                url: '/content/experiences?type=minireel'
            },
            create: {
                method: 'POST',
                url: '/content/experience'
            },
            update: {
                method: 'PUT',
                url: '/content/experience/{{= id }}'
            }
        },
        src: ['<%= settings.experiencesJSON %>']
    }
};
