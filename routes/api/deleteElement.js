var keystone = require('keystone'),
    Scenario = keystone.list('Scenario');

exports = module.exports = function(req, res) {
    console.log(req.user.canAccessKeystone);
    if (!req.user || !req.user.canAccessKeystone) return res.apiResponse({
        data: {
            "status": "no admin user"
        }
    });
    var scenario_id = req.body.scenarioId;
    var geojson_type = req.body.geojson_type;
    var feature_id = req.body.featureid;
    /*Array.prototype.removeValue = function(name, value) {        
        var array = this.map(function(v, i) {
            if(v[name] != value){
                console.log(v);
                return v;
            }
        });
        this.length = 0; //clear original array
        this.push.apply(this, array); //push all elements except the one we want to delete
    }*/

    Scenario.model.findById(scenario_id, function(err, scenario) {
        if (err) return res.apiError('database error', err);
        if (geojson_type === "geojson_buildings") {
            _json = JSON.parse(scenario.geojson_buildings);
        } else {
            _json = JSON.parse(scenario.geojson_settlements);
        }
        //_json.features.removeValue('id', +feature_id);
        _json.features.filter(function(i) {
            if (i.id.toString() === feature_id) {                
                delete i.geometry;
                delete i.properties;
                delete i.type;                
                i.status = "DELETED";                             
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
                "status": "success"
            }
        });
    });
};