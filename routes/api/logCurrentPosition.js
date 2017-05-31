var keystone = require('keystone');
var fs = require('fs');
var bunyan = require('bunyan');
var _log = bunyan.createLogger({
    name: 'crisisMap',
    useStdOut: false,
    useFile: true,    
    streams: [{
        level: 'info',
        path: 'positionLog.json' // log ERROR and above to a file
    }]
});


exports = module.exports = function(req, res) {

    var userId = "";
    var scenarioId = "";

    var scenarioId = req.body.scenarioId;
    var zoom = req.body.zoom;
    var northEast = req.body.bounds_northEast;
    var southWest = req.body.bounds_southWest;
    var center = req.body.center;
    var time = new Date().toString();
    var newLog = new Object();
    newLog.scenarioId = scenarioId;
    newLog.zoom = zoom;
    newLog.center = center;
    newLog.time = time;
    //console.log(southWest.toString());
    newLog.bounds = {};
    newLog.bounds.southWest = southWest;
    newLog.bounds.northEast = northEast;
    _log.info(newLog);
    return res.apiResponse({
        "status": "log saved"
    });

    //var logPositionFile = fs.readFileSync('logPosition.json');
    //var logPosition = JSON.parse(logPositionFile);
    //logPosition.push(newLog);
    //var logPositionJson = JSON.stringify(logPosition);    
    /*fs.readFile('logPosition.json', (err, data) => {
        if (err) throw err;

        var logPosition = JSON.parse(data);
        console.log(logPosition);
        
        logPosition.push(newLog);

        var logPositionJson = JSON.stringify(logPosition);
        fs.writeFile('logPosition.json', logPositionJson, (err) => {
            if (err) throw err;
            return res.apiResponse({
                "status": "log saved"
            });
        });

    });*/

}