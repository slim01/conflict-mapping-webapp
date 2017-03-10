exports = module.exports = function(done) {
    var fs = require('fs');
    // Load Signin UI file
    const buff = fs.readFileSync('node_modules/keystone/admin/client/Signin/Signin.js');
    const content = buff.toString();

    //delete footer from Signin
    var newContent = content.replace('<span>Powered by </span>', '');
    newContent = newContent.replace('<a href="http://keystonejs.com" target="_blank" title="The Node.js CMS and web application platform (new window)">KeystoneJS</a>', '');
    fs.writeFileSync('node_modules/keystone/admin/client/Signin/Signin.js', newContent);
    done();
    
};