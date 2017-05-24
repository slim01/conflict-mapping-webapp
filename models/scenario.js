var keystone = require('keystone'),
    Types = keystone.Field.Types;
const fs = require('fs');
var localStorage = new keystone.Storage({
    adapter: keystone.Storage.Adapters.FS,
    fs: {
        path: './data/scenarios',
        publicPath: 'public/data/scenarios',
    },
});
var ogr2ogr = require('ogr2ogr');
var Scenario = new keystone.List('Scenario');

Scenario.add({
    title: {
        type: Types.Text,
        required: true,
        index: true,
        initial: true
    },
    subtitle: {
        type: Types.Text,
        required: true,
        index: true,
        initial: true
    },
    shp_epsg: {
        type: Types.Number,
        required: true,
        initial: true
    },
    shp_buildings: {
        type: Types.File,
        required: true,
        initial: true,
        storage: localStorage,
        filename: function(item, file) {
            return item.id + '.' + file.extension
        }
    },
    geojson_buildings: {
        type: Types.Code,
        height: 180,
        noedit: true
    },
    shp_settlements: {
        type: Types.File,
        required: true,
        initial: true,
        storage: localStorage,
        filename: function(item, file) {
            return item.id + '.' + file.extension
        }
    },
    geojson_settlements: {
        type: Types.Code,
        height: 180,
        noedit: true
    },
    wms_before: {
        type: Types.Text,
        required: false,
        index: true,
        initial: true
    },
    layer_before: {
        type: Types.Text,
        required: false,
        index: true,
        initial: true
    },
    wms_after: {
        type: Types.Text,
        required: false,
        index: true,
        initial: true
    },
    layer_after: {
        type: Types.Text,
        required: false,
        index: true,
        initial: true
    },    
    useGeojsonInsteadOfShp: {
        type: Types.Boolean,
        required: false,
        index: true,
        initial: true
    },
    processed: {
        type: Boolean,
        hidden: true,
        default: false
    }
});

Scenario.schema.pre('save', function(next) {

    if (!this.processed) {
        var scenarioToSave = this;
        var epsg = this.shp_epsg;
        processBuildings(0);

        function processBuildings(counter) {
            console.log("uploaded " + scenarioToSave.shp_buildings.filename);
            if (counter == 20) {
                console.log("finally could not parse JSON data");
                return;
            }
            //convert buildings shp to geojson
            //try {
            if (!scenarioToSave.useGeojsonInsteadOfShp) {
                var buildings_conversion = ogr2ogr('./data/scenarios/' + scenarioToSave.shp_buildings.filename)
                    .format('GeoJSON')
                    .skipfailures()
                    .project("EPSG:4326", "EPSG:" + epsg)
                    .stream()
                var stream = buildings_conversion.pipe(fs.createWriteStream('./data/scenarios/' + scenarioToSave._id + '.json'));
            } else {
                var rstream = fs.createReadStream('./data/scenarios/' + scenarioToSave.shp_buildings.filename);
                var stream = rstream.pipe(fs.createWriteStream('./data/scenarios/' + scenarioToSave._id + '.json'));
            }
            /*} catch (err) {
                console.log(err);                
                console.log("could not convert buildings shp, trying again for the" + counter + "time");
                setTimeout(function() {
                    processBuildings(counter++);
                }, 1000);
                return;

            }
            counter = 0;*/
            // add custom properties
            stream.on('finish', function() {
                fs.readFile('./data/scenarios/' + scenarioToSave._id + '.json', (err, data) => {
                    if (err) throw err;
                    try {
                        jsondata_buildings = JSON.parse(data);
                    } catch (err) {
                        console.log("could not parse JSON data, trying again for the" + counter + "time");
                        setTimeout(function() {
                            processBuildings(counter++);
                        }, 1000);
                        return;
                    }
                    jsondata_buildings.features.forEach(function(feature, index) {
                        feature.id = index;
                        feature.properties.positiveVotes = 0;
                        feature.properties.negativeVotes = 0;
                    });
                    scenarioToSave.geojson_buildings = JSON.stringify(jsondata_buildings, null, 2);
                    next();
                });
            });

        }
    } else {
        console.log("incoming request where processed is true");
        next();
    }
});

Scenario.schema.pre('save', function(next) {
    if (!this.processed) {
        var scenarioToSave = this;
        var epsg = this.shp_epsg;
        processSettlements(0);

        function processSettlements(counter) {
            console.log("uploaded " + scenarioToSave.shp_settlements.filename);
            if (counter == 20) {
                console.log("finally could not parse JSON data");
                return;
            }
            //convert settlements shp to geojson
            //try {
            if (!scenarioToSave.useGeojsonInsteadOfShp) {
                var settlements_conversion = ogr2ogr('./data/scenarios/' + scenarioToSave.shp_settlements.filename)
                    .format('GeoJSON')
                    .skipfailures()
                    .project("EPSG:4326", "EPSG:" + epsg)
                    .stream()
                var set_stream = settlements_conversion.pipe(fs.createWriteStream('./data/scenarios/' + scenarioToSave._id + '_settlements.json'));
            } else {
                var rstream = fs.createReadStream('./data/scenarios/' + scenarioToSave.shp_settlements.filename);
                var set_stream = rstream.pipe(fs.createWriteStream('./data/scenarios/' + scenarioToSave._id + '_settlements.json'));                
            }
            //} catch (err) {
            //console.log(err);
            //console.log("error during settlements shp conversion");
            //return;
            //}

            // add custom properties
            set_stream.on('finish', function() {
                console.log("finished");
                fs.readFile('./data/scenarios/' + scenarioToSave._id + '_settlements.json', (err, data) => {
                    if (err) throw err;
                    try {
                        jsondata_settlements = JSON.parse(data);
                    } catch (err) {
                        console.log("could not parse JSON data, trying again for the " + counters + 2 + ". time");
                        setTimeout(function() {
                            processSettlements(counter++);
                        }, 1000);
                        return;
                    }
                    jsondata_settlements.features.forEach(function(feature, index) {
                        feature.id = index;
                        feature.properties.positiveVotes = 0;
                        feature.properties.negativeVotes = 0;
                    });
                    scenarioToSave.geojson_settlements = JSON.stringify(jsondata_settlements, null, 2);
                    next();
                });
            });
        }
    } else {
        this.processed = false;
        next();
    }
});

Scenario.defaultColumns = 'title, subtitle'
Scenario.register();