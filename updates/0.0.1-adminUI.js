    exports = module.exports = function(done) {
        var fs = require('fs');

        // Load UI template fileu
        const buff = fs.readFileSync('node_modules/keystone/admin/server/templates/index.html');
        const content = buff.toString();

        const styleLink = '<link rel="stylesheet" href="../css/adminUI.css">';

        // Add link to our stylesheet at the end of <head>
        const newContent = content.replace('</head>', `${styleLink} \n </head>`);
        fs.writeFileSync('node_modules/keystone/admin/server/templates/index.html', newContent);
        done();
    }