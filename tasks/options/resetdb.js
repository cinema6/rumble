
(function() {
    'use strict';

    module.exports = {
        options: {
            host: '33.33.33.20',
            port:  27017,
            pass: 'password'
        },
        users: {
            options: {
                db: 'c6Db',
                user: 'auth'
            },
            data: [
                {
                    id : 'u-e1d2c19c42d6ee',
                    created : new Date(),
                    username : 'josh',
                    password : '$2a$10$ik8VD1MLOJT.VBBISmLPI.q2Okr4LvGYIE9ZOt4UjCU7iIVI.Qurq',
                    permissions: {
                        experiences: {
                            read: 'all',
                            create: 'all',
                            delete: 'all',
                            edit: 'all'
                        },
                        users: {
                            read: 'all',
                            create: 'all',
                            delete: 'all',
                            edit: 'all'
                        }
                    },
                    status: 'active'
                }
            ]
        },
        elections: {
            options: {
                db: 'voteDb',
                user: 'vote'
            },
            data: [
                {
                    id: 'e-80fcd03196b3d2',
                    ballot: {
                        'rc-22119a8cf9f755': {
                            'Catchy': 0,
                            'Painful': 0
                        },
                        'rc-4770a2d7f85ce0': {
                            'Funny': 0,
                            'Lame': 0
                        },
                        'rc-e489d1c6359fb3': {
                            'Cute': 0,
                            'Ugly': 0
                        },
                        'rc-e2947c9bec017e': {
                            'Cool': 0,
                            'Geeky': 0
                        },
                        'rc-99b87ea709d7ac': {
                            'Funny': 0,
                            'Gross': 0
                        }
                    }
                },
                {
                    id: 'e-220f09b2398217',
                    ballot: {
                        'rc-22119a8cf9f755': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-337f092e881524': {
                            'Awesome': 0,
                            'Stupid': 0
                        },
                        'rc-facb167546a4ff': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-4b9dc6b9651428': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-9b524d0c0535db': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-828007b55441ca': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-4ea854fd34d960': {
                            'Cute': 0,
                            'Lame': 0
                        },
                        'rc-77d0ea2794cc6b': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-389f9dea3498d2': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-065050baf27d98': {
                            'Awesome': 0,
                            'Stupid': 0
                        },
                        'rc-3194c992829ad5': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-974e99904a58fd': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-0518f251954d3d': {
                            'Cool': 0,
                            'Lame': 0
                        },
                        'rc-3502759494071f': {
                            'Cute': 0,
                            'Lame': 0
                        },
                        'rc-6c107d42d383ec': {
                            'YAY!': 0,
                            'ARGH!': 0
                        }
                    }
                },
                {
                    id: 'e-d222ba38f50e09',
                    ballot: {
                        'rc-080fb573e704cf': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-7311404ad44b52': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-df375fb28cc776': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-4f9cb78c41dcd9': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-b0f8f58e21f202': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-ca8adce82b632f': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-cd2a90ac077d87': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-cd6b62c0bf1025': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-ef6ffe2bab25f5': {
                            'All Skill': 0,
                            'All Luck': 0
                        },
                        'rc-7c2c6b5040f21b': {
                            'All Skill': 0,
                            'All Luck': 0
                        }
                    }
                },
                {
                    id: 'e-0bf9209b8cf08f',
                    ballot: {
                        'rc-0c4d7938b6fe3c': {
                            'Strong': 0,
                            'Weak': 0
                        },
                        'rc-29bd38a14dc46b': {
                            'Strong': 0,
                            'Weak': 0
                        },
                        'rc-9e477d23518112': {
                            'Strong': 0,
                            'Weak': 0
                        },
                        'rc-e1919a486fccfb': {
                            'Strong': 0,
                            'Weak': 0
                        },
                        'rc-2d991b6317e23d': {
                            'Strong': 0,
                            'Weak': 0
                        },
                        'rc-26eb95e7e9d2ca': {
                            'Strong': 0,
                            'Weak': 0
                        },
                        'rc-cf6102c95f8d91': {
                            'Strong': 0,
                            'Weak': 0
                        }
                    }
                }
            ]
        }
    };

}());
