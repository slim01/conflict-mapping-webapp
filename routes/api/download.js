var keystone = require('keystone'),
    Scenario = keystone.list('Scenario');
var fs = require('fs');
var AdmZip = require('adm-zip');
var ogr2ogr = require('ogr2ogr');

exports = module.exports = function(req, res) {
    var scenario_id = req.query.scenarioId;
    var format = req.query.format;
    var includeOnlyPositiveBuildings = req.query.includeOnlyPositiveBuildings;
    var includeOnlyPositiveSettlements = req.query.includeOnlyPositiveSettlements;
    if (!format) return;
    if (!scenario_id) return;
    Scenario.model.findById(scenario_id, function(err, scenario) {
        if (err) return res.apiError('database error', err);
        if (!scenario) return res.apiError('invalid id');
        var date = Date.now();
        buildings_json = scenario.geojson_buildings;
        settlements_json = scenario.geojson_settlements;
        var buildingsFile = "./data/downloads/" + scenario.title + date + "_buildings.json";
        var settlementsFile = "./data/downloads/" + scenario.title + date + "_settlements.json"

        if (includeOnlyPositiveBuildings === "true") {
            _json = JSON.parse(buildings_json);
            _json.features.filter(function(i) {
                if (i.status === "DELETED") {} else {
                    if (i.properties.positiveVotes <= i.properties.negativeVotes) {
                        delete i.geometry;
                        delete i.properties;
                        delete i.type;
                        i.status = "DELETED";
                    }
                }
            });
            buildings_json = JSON.stringify(_json, null, 2);
        }
        if (includeOnlyPositiveSettlements === "true") {
            _jsonSettlements = JSON.parse(settlements_json);
            _jsonSettlements.features.filter(function(i) {
                if (i.status === "DELETED") {} else {
                    if (i.properties.positiveVotes <= i.properties.negativeVotes) {
                        i.properties.settlement = 0;
                    } else {
                        i.properties.settlement = 1;
                    }
                }
            });
            settlements_json = JSON.stringify(_jsonSettlements, null, 2);
        }
        fs.writeFile(buildingsFile, buildings_json, function(err) {
            if (err) {
                return res.apiResponse({
                    data: {
                        "status": "failed"
                    }
                });
            }
            fs.writeFile(settlementsFile, settlements_json, function(err) {
                if (err) {
                    return res.apiResponse({
                        data: {
                            "status": "failed"
                        }
                    });
                }
                if (format === "JSON") {
                    var zip = new AdmZip();
                    zip.addLocalFile(buildingsFile);
                    zip.addLocalFile(settlementsFile);
                    var file = "./data/downloads/" + scenario.title + date + ".zip";
                    zip.writeZip(file);

                    res.download(file, function(err) {
                        if (err) {
                            console.log("Error");
                            console.log(err);
                        } else {
                            fs.unlink(file, function() {
                                console.log("file deleted");
                            });
                            fs.unlink(buildingsFile, function() {
                                console.log("file deleted");
                            });
                            fs.unlink(settlementsFile, function() {
                                console.log("file deleted");
                            });
                        }
                    });
                } else if (format === "Shapefile") {
                    /*
                     * TODO let user set output projection
                     */
                    var buildingsShapeFile = './data/downloads/' + scenario.title + date + '_buildings.zip';
                    var buildingsConversion = ogr2ogr(buildingsFile)
                        .format('ESRI Shapefile')
                        .skipfailures()
                        .project("EPSG:4037", "EPSG:4326")
                        .stream()
                    var stream = buildingsConversion.pipe(fs.createWriteStream(buildingsShapeFile));
                    stream.on('finish', function() {
                        var settlementsShapeFile = './data/downloads/' + scenario.title + date + '_settlements.zip';
                        var settlementsConversion = ogr2ogr(settlementsFile)
                            .format('ESRI Shapefile')
                            .skipfailures()
                            .project("EPSG:4037", "EPSG:4326")
                            .stream()
                        var shapeStream = settlementsConversion.pipe(fs.createWriteStream(settlementsShapeFile));
                        shapeStream.on('finish', function() {
                            var zip = new AdmZip();
                            zip.addLocalFile(buildingsShapeFile);
                            zip.addLocalFile(settlementsShapeFile);
                            var file = "./data/downloads/" + scenario.title + date + ".zip";
                            zip.writeZip(file);
                            res.download(file, function(err) {
                                if (err) {
                                    console.log("Error");
                                    console.log(err);
                                } else {
                                    fs.unlink(file, function() {
                                        console.log("file deleted");
                                    });
                                    fs.unlink(buildingsFile, function() {
                                        console.log("file deleted");
                                    });
                                    fs.unlink(settlementsFile, function() {
                                        console.log("file deleted");
                                    });
                                    fs.unlink(buildingsShapeFile, function() {
                                        console.log("file deleted");
                                    });
                                    fs.unlink(settlementsShapeFile, function() {
                                        console.log("file deleted");
                                    });
                                }
                            });


                        });

                    });

                }


            });

        });

    });
}