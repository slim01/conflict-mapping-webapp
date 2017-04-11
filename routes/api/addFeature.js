var keystone = require('keystone'),
    Scenario = keystone.list('Scenario');
var fs = require('fs');
exports = module.exports = function(req, res) {
    var scenario_id = req.body.scenarioId;
    var lat = parseFloat(req.body.lat);
    var lng = parseFloat(req.body.lng);
    var featureCounter = req.body.featureCounter;

    if (!req.user) return res.apiResponse({
        data: {            
            "status": "no user"
        }
    });
    Scenario.model.findById(scenario_id, function(err, scenario) {        
        if (err) return res.apiError('database error', err);
        /*var _json = scenario.geojson_buildings; 
        _json.features += jsonString;       
        console.log(_json.features);*/
        var _json = JSON.parse(scenario.geojson_buildings);
        var lastFeature = _json.features[_json.features.length-1];

        var newFeature = new Object();
        newFeature.type = "Feature";
        newFeature.properties = {};
        newFeature.properties.diff_to_up = 0;
        newFeature.properties.positiveVotes = 0;
        newFeature.properties.negativeVotes = 0;
        newFeature.geometry = {};
        newFeature.geometry.type = "Point";
        newFeature.geometry.coordinates = [lng, lat];
        newFeature.id = lastFeature.id+1;

        _json.features.push(newFeature);       

   
        scenario.processed = true;
        scenario.geojson_buildings = JSON.stringify(_json, null, 2);
        scenario.save();
        scenario.save().then(function(scenario) {
            return res.apiResponse({
                data: {
                    "status": "success",
                    "featureCounter": featureCounter
                }
            });
        });
    });
}