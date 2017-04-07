"use strict";
/*
 * OPTIONS
 */
var buildingColor_voted = "#006600";
var settlementColor_voted = "#006600";
var buildingColor_voted_against = "#b2d1b2";
var settlementColor_voted_against = "#b2d1b2";
var TileColor_noSettlement = "#D3D3D3";
var minContainingPointsForPriorityList = 1;

/*
 * Global variables
 */
var buildings_json;
var settlements_json;
var scenario_id;
var refreshBounds;
var layer_visibilty = true;

var refresh;

$(document).ready(function() {

    _init("init");

    function _init(mode) {
        scenario_id = window.location.hash.substring(1);
        var map = L.map('mapid').setView([51.505, -0.09], 13);

        $.get('/getScenarioById' + scenario_id, function(res) {
            var scenario = res.data;
            _createBaseLayer(map, scenario.wms_before, scenario.wms_after, scenario.layer_before, scenario.layer_after);
            _addGeoJsons(map, JSON.parse(scenario.geojson_buildings), JSON.parse(scenario.geojson_settlements), mode);
            _colorVotedFeatures();
            addFeatureSwitcher(map);
            addDownloadFunctionality(map);
        });


        /*
         * Event listener to show votes in popup if user has already voted
         */
        map.on('popupopen', function(e) {
            var marker = e.popup._source;
            if (marker.options.color === buildingColor_voted || marker.options.color === buildingColor_voted_against || marker.options.color === settlementColor_voted || marker.options.color === buildingColor_voted_against) {
                var geojson_type = "";
                if (marker.feature.geometry.type === "Point") {
                    geojson_type = "geojson_buildings";
                } else if (marker.feature.geometry.type === "Polygon") {
                    geojson_type = "geojson_settlements";
                }
                $.get('/getVotesOfElement', {
                        scenarioId: scenario_id,
                        geojson_type: geojson_type,
                        featureid: marker.feature.id
                    },
                    function(res) {
                        showVotesInPopup(res.data);
                    });
            }
        });


    }

    function _createBaseLayer(map, wms_before, wms_after, layer_before, layer_after) {

        var layer_before = new L.tileLayer.wms(wms_before, {
            layers: layer_before
        }).addTo(map);

        var layer_after = new L.tileLayer.wms(wms_after, {
            layers: layer_after
        });


        var baseLayer = {
            "Before": layer_before,
            "After": layer_after
        };

        var center = map.getCenter();
        map.options.crs = L.CRS.EPSG4326;
        map.setView(center);
        map._resetView(map.getCenter(), map.getZoom());
        console.log(baseLayer);       


        addLayerControl(map, baseLayer);
    }

    function addDownloadFunctionality(map) {
        $.get('/getUser', {},
            function(res) {
                if (!res.data) return;
                if (res.data.user && res.data.user.canAccessKeystone) {
                    addDownloadControl(map);
                }
            });
        $("#downloadModalButton").click(function() {
            var format = $("input[name=formatRadio]:checked").val();
            if (!format) {
                alert("please select format first");
                return;
            }
            var includeOnlyPositiveBuildings = $('#buildingsPositiveBalance').is(":checked");
            var includeOnlyPositiveSettlements = $('#settlementsPositiveBalance').is(":checked");
            window.open('/download?scenarioId=' + scenario_id + '&format=' + format + '&includeOnlyPositiveBuildings=' + includeOnlyPositiveBuildings + '&includeOnlyPositiveSettlements=' + includeOnlyPositiveSettlements);           

        });


    }

    function _colorVotedFeatures() {
        $.get('/getVotes', {
                scenarioId: scenario_id
            },
            function(res) {
                var votesArray = res.data.rates;
                if (!votesArray) return;
                votesArray.forEach(function(item) {
                    if (item.geojson === "geojson_buildings") {
                        buildings_json.eachLayer(function(layer) {
                            if (layer.feature.id == item.featureId) {
                                if (item.voted_for === "positive") {
                                    layer.setStyle({
                                        color: buildingColor_voted
                                    });
                                } else {
                                    layer.setStyle({
                                        color: buildingColor_voted_against
                                    });
                                }
                            }

                        })
                    } else {
                        settlements_json.eachLayer(function(layer) {
                            if (layer.feature.id == item.featureId) {
                                if (item.voted_for === "positive") {
                                    layer.setStyle({
                                        color: settlementColor_voted
                                    });
                                } else {
                                    layer.setStyle({
                                        color: settlementColor_voted_against,
                                        opacity: 1
                                    });
                                }
                            }

                        })
                    }
                })
            });
    }


    function _addGeoJsons(map, buildings, settlements, mode) {
        var isAdmin = false;
        $.get('/getUser', {},
            function(res) {
                if (!res.data) return;
                if (res.data.user && res.data.user.canAccessKeystone) {
                    isAdmin = true;
                }

                buildings_json = new L.geoJSON(buildings, {

                    onEachFeature: function(feature, layer) {
                        //if (feature.properties) {
                        /*
                        layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                            return k + ": " + feature.properties[k];
                        }).join("<br />"), {
                            maxHeight: 200
                        });*/
                        addPopupForBuildings(feature, layer, map, isAdmin);
                        //}
                    },
                    pointToLayer: function(feature, latlng) {
                        return L.circleMarker(latlng, {
                            color: "#ff7800",
                        });
                    }
                });


                settlements_json = new L.geoJSON(settlements, {
                    onEachFeature: function(feature, layer) {
                        //if (feature.properties) {
                        /*
                        layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                            return k + ": " + feature.properties[k];
                        }).join("<br />"), {
                            maxHeight: 200
                        });*/
                        if (feature.properties.settlement === 0) {
                            layer.setStyle({
                                color: TileColor_noSettlement,
                                opacity: 0.2
                            });
                        }
                        addToPriorityList(feature, layer, map);
                        addPopupForSettlements(feature, layer, map, isAdmin);
                        //}
                    },
                    pointToLayer: function(feature, latlng) {
                        return L.circleMarker(latlng);
                    }
                });
                sortPriorityList();

                map.addLayer(settlements_json);
                var circleMarkers = L.markerClusterGroup({
                    zoomToBoundsOnClick: true,
                    spiderfyOnMaxZoom: false,
                    maxClusterRadius: 40,
                    disableClusteringAtZoom: 17
                });
                circleMarkers.addLayer(buildings_json);
                map.addLayer(circleMarkers);


                if (mode === "init") {
                    map.fitBounds(buildings_json.getBounds());
                } else {
                    map.fitBounds(refreshBounds);
                }
                addDrawControl(map, settlements_json, circleMarkers);

            });

    }
    refresh = function(map) {
        refreshBounds = map.getBounds();
        $('#priorityList').empty();
        map.remove();
        _init("refresh");
    }

});