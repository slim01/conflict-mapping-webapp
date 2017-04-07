var keystone = require('keystone');
var fs = require('fs');

exports = module.exports = function(req, res) {
    var userId = "";
    var scenarioId = "";
    if (req.user) {
        userId = req.user.id;
    }
    if (req.body.scenarioId) {
        scenarioId = req.body.scenarioId;
    }
    logMessage = req.body.logMessage;
    var time = new Date().toString();
    fs.appendFile('log.txt', "\n" + time + "[scenarioId: " + scenarioId +   "] userId:" + userId + logMessage, function(err) {
        if (err) throw err;
        return res.apiResponse({
            "status": "log saved"
        });
    });
}