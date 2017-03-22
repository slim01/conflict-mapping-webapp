var keystone = require('keystone'),
    User = keystone.list('User');
 
exports = module.exports = function(done) {
    
    new User.model({
        name: { first: 'User', last: 'User' },
        email: 'user@conflictmapping.de',
        password: 'user',
        canAccessKeystone: false
    }).save(done);
    
};