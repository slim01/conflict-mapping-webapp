var keystone = require('keystone');
var fs = require('fs');

exports = module.exports = function(req, res) {
    var userId = "";
    if (req.user) {
        userId = req.user.id;
    }
    logMessage = req.body.logMessage;
    var time = new Date().toString();
    fs.appendFile('log.txt', "\n" + time +  " userId:" + userId + logMessage, function(err) {
        if (err) throw err;
        return res.apiResponse({
            "status": "log saved"
        });
    });
}