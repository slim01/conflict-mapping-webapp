/*
 * returns votes of specific element
 */

var keystone = require('keystone'),
    Scenario = keystone.list('Scenario');

exports = module.exports = function(req, res) {
    if (!req.user) return res.apiResponse({
        data: {
            "status": "no user"
        }
    });
    var scenario_id = req.query.scenarioId;
    var geojson_type = req.query.geojson_type;
    var feature_id = req.query.featureid;
    
    var positiveVotes = 0;
    var negativeVotes = 0;
    Scenario.model.findById(scenario_id, function(err, scenario) {
        if (err) return res.apiError('database error', err);
        if (geojson_type === "geojson_buildings") {
            _json = JSON.parse(scenario.geojson_buildings);
        } else {
            _json = JSON.parse(scenario.geojson_settlements);
        }
        _json.features.filter(function(i) {
            if (i.id.toString() === feature_id) {
                positiveVotes = i.properties.positiveVotes;
                negativeVotes = i.properties.negativeVotes;
                return;
            }
        });
        return res.apiResponse({
            data: {
                "positiveVotes": positiveVotes,
                "negativeVotes": negativeVotes,
                "status": "success"                
            }
        });
    });
};