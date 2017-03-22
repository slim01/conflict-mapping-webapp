"use strict"

function addLayerControl(map, baseLayer) {
    var CustomControl = L.Control.extend({

        options: {
            position: 'topleft'
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.id = "layerSwitcher";
            container.title = "switch to afterwards image";
            var image = L.DomUtil.create('img', 'leaflet-buttons-control-img', container);
            image.setAttribute('src', '/images/arrow_forward_25.png');
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.onclick = function() {
                if (map.hasLayer(baseLayer.After)) {
                    container.innerHTML = "";
                    var image = L.DomUtil.create('img', 'leaflet-buttons-control-img', container);
                    image.setAttribute('src', '/images/arrow_forward_25.png');
                    container.title = "switch to afterwards image";
                    map.removeLayer(baseLayer.After);
                    map.addLayer(baseLayer.Before);
                } else if (map.hasLayer(baseLayer.Before)) {
                    container.innerHTML = "";
                    var image = L.DomUtil.create('img', 'leaflet-buttons-control-img', container);
                    image.setAttribute('src', '/images/arrow_back_25.png');
                    container.title = "switch to before image";
                    map.removeLayer(baseLayer.Before);
                    map.addLayer(baseLayer.After);
                }

            }
            return container
        }

    });

    map.addControl(new CustomControl());
}

function addFeatureSwitcher(map) {

    var CustomControl = L.Control.extend({

        options: {
            position: 'topleft'
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.id = "featureSwitcher";
            container.title = "turn features on/off";
            //var image = L.DomUtil.create('img', 'leaflet-buttons-control-img', container);
            //image.setAttribute('src','/images/arrow_forward_25.png');
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.onclick = function() {
                if (layer_visibilty == true) {

                    layer_visibilty = false;
                    buildings_json.setStyle({
                        opacity: 0
                    });
                    settlements_json.setStyle({
                        opacity: 0
                    });

                } else {
                    layer_visibilty = true;
                    buildings_json.setStyle({
                        opacity: 1
                    });
                    settlements_json.setStyle({
                        opacity: 1
                    });
                }

            }
            return container
        }

    });

    map.addControl(new CustomControl());

}

function addDownloadControl(map) {

    var DownloadControl = L.Control.extend({

        options: {
            position: 'topright'
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'glyphicon glyphicon-download-alt leaflet-bar leaflet-control leaflet-control-custom');
            container.id = "downloadControl";
            container.title = "Download";
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.onclick = function() {
                $("#downloadModal").modal();
            }
            return container
        }

    });

    map.addControl(new DownloadControl());
}

function addDrawControl(map, settlements_json, circleMarkers) {
    var drawLayer = new L.FeatureGroup();
    map.addLayer(drawLayer);

    var options = {
        position: 'topleft',
        draw: {
            polyline: false,
            polygon: false,
            circle: false,
            rectangle: false,
            marker: {

            }
        },
        edit: {
            featureGroup: drawLayer,
            remove: false
        }
    };

    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function(e) {
        var type = e.layerType,
            layer = e.layer;
        drawLayer.addLayer(layer);
    });
    map.on('draw:edited', function(e) {
        var drawLayerArray = drawLayer.getLayers();
        addLayerFeature(0);

        function addLayerFeature(featureCounter) {
            var layer = drawLayerArray[featureCounter];
            $.post('/addFeature', {
                    scenarioId: scenario_id,
                    lat: layer._latlng.lat,
                    lng: layer._latlng.lng,
                    featureCounter: featureCounter
                },
                function(returnedData) {
                    if (returnedData.data.status === "no user") {
                        drawLayer.remove();
                        alert("please log in first");
                        return;
                    }
                    if (returnedData.data.featureCounter == drawLayerArray.length - 1) {
                        drawLayer.remove();
                        refresh(map);
                        return;
                    } else {
                        var fcounter = parseInt(returnedData.data.featureCounter);
                        fcounter++;
                        addLayerFeature(fcounter);
                    }

                });
        }
    });
}