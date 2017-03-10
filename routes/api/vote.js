var keystone = require('keystone'),
    Rates = keystone.list('Rates'),
    Scenario = keystone.list('Scenario');
var fs = require('fs');

exports = module.exports = function(req, res) {
    if (!req.user) return res.apiResponse({
        data: {
            "positiveVotes": 0,
            "negativeVotes": 0,
            "voted": false,
            "status": "no user"
        }
    });
    var user_id = req.user._id.toString();
    var scenario_id = req.body.scenarioId;
    var geojson_type = req.body.geoJSON; //either geojson_buildings or geojson_settlements
    var feature_id = req.body.feature.id;
    var voted_for = req.body.voted_for;

    Rates.model.count({
        'userId': user_id,
        'scenarioId': scenario_id,
        'geojson': geojson_type,
        'featureId': feature_id
    }, function(err, count) {
        if (err) return res.apiError('database error', err);

        if (count == 0) {
            // add rate to Rates
            var rate = new Rates.model({
                userId: user_id,
                scenarioId: scenario_id,
                geojson: geojson_type,
                featureId: feature_id,
                voted_for: voted_for
            });
            rate.save(function(err) {
                if (err) return res.apiError('database error on save', err);
            });


            // increase counter in scenario
            Scenario.model.findById(scenario_id, function(err, scenario) {
                if (err) return res.apiError('database error', err);
                if (!scenario) return res.apiError('invalid scenario id');
                var _json;
                var positiveVotes = 0;
                var negativeVotes = 0;
                if (geojson_type === "geojson_buildings") {
                    _json = JSON.parse(scenario.geojson_buildings);
                } else {
                    _json = JSON.parse(scenario.geojson_settlements);
                }
                _json.features.filter(function(i) {
                    if (i.id.toString() === feature_id) {
                        if (voted_for === 'positive') {
                            i.properties.positiveVotes++;
                            positiveVotes = i.properties.positiveVotes;
                            negativeVotes = i.properties.negativeVotes;

                        } else {
                            i.properties.negativeVotes++;
                            negativeVotes = i.properties.negativeVotes;
                            positiveVotes = i.properties.positiveVotes;
                        }
                        return;
                    }

                });
                scenario.processed = true;
                if (geojson_type === "geojson_buildings") {
                    scenario.geojson_buildings = JSON.stringify(_json, null, 2);
                } else {
                    scenario.geojson_settlements = JSON.stringify(_json, null, 2);
                }
                scenario.save();
                return res.apiResponse({
                    data: {
                        "positiveVotes": positiveVotes,
                        "negativeVotes": negativeVotes,
                        "voted": false,
                        "status": "success"
                    }
                });
            });
        } else {
            Rates.model.findOne({
                'userId': user_id,
                'scenarioId': scenario_id,
                'geojson': geojson_type,
                'featureId': feature_id,
            }, function(err, rate) {
                if (err) return res.apiError('database error', err);
                if (!rate) return res.apiError('could not find rate to update in db');
                Scenario.model.findById(scenario_id, function(err, scenario) {
                    var _json;
                    var positiveVotes = 0;
                    var negativeVotes = 0;
                    if (geojson_type === "geojson_buildings") {
                        _json = JSON.parse(scenario.geojson_buildings);
                    } else {
                        _json = JSON.parse(scenario.geojson_settlements);
                    }
                    _json.features.filter(function(i) {
                        if (i.id.toString() === feature_id) {
                            if (voted_for === 'positive') {
                                if (rate.voted_for != voted_for) {
                                    if (i.properties.negativeVotes > 0) {
                                        i.properties.negativeVotes--;
                                    }
                                    i.properties.positiveVotes++;
                                }
                                positiveVotes = i.properties.positiveVotes;
                                negativeVotes = i.properties.negativeVotes;
                            } else {
                                if (rate.voted_for != voted_for) {
                                    if (i.properties.positiveVotes > 0) {
                                        i.properties.positiveVotes--;
                                    }
                                    i.properties.negativeVotes++;
                                }
                                positiveVotes = i.properties.positiveVotes;
                                negativeVotes = i.properties.negativeVotes;
                            }
                            return;
                        }

                    });
                    if (rate.voted_for == voted_for) {
                        return res.apiResponse({
                            data: {
                                "positiveVotes": positiveVotes,
                                "negativeVotes": negativeVotes,
                                "voted": true,
                                "status": "already voted"
                            }
                        });
                    } else {

                        if (rate.voted_for === 'positive') {
                            rate.voted_for = 'negative';
                        } else {
                            rate.voted_for = 'positive';
                        }
                        rate.save();

                        scenario.processed = true;                        
                        if (geojson_type === "geojson_buildings") {
                            scenario.geojson_buildings = JSON.stringify(_json, null, 2);
                        } else {                            
                            scenario.geojson_settlements = JSON.stringify(_json, null, 2);
                        }                        
                        scenario.save();
                        return res.apiResponse({
                            data: {
                                "positiveVotes": positiveVotes,
                                "negativeVotes": negativeVotes,
                                "voted": true,
                                "status": "success"
                            }
                        });
                    }



                });


            });

        };

    });
}