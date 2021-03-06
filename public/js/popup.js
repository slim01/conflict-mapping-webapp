"use strict";

function addPopupForBuildings(feature, layer, map, isAdmin) {
    var container = $('<div />');
    container.on('click', '#positiveVote', function() {
        $.post('/vote', {
                scenarioId: scenario_id,
                geoJSON: "geojson_buildings",
                feature: feature,
                voted_for: "positive"
            },
            function(returnedData) {
                if (returnedData.data.status === "no user") {
                    $('#bottomText').html("Please log in first");
                    return;
                }
                showVotesInPopup(returnedData.data);
                if (returnedData.data.status === "success") {
                    $.post('/log', {
                            scenarioId: scenario_id,
                            logMessage: " voted positive on building with id " + feature.id + " with coordinates " + feature.geometry.coordinates[0] + " " + feature.geometry.coordinates[1]
                        },
                        function(returnedData) {});

                    layer.setStyle({
                        color: buildingColor_voted
                    });

                    $('#bottomText').html("Thanks for your vote");
                } else {
                    $('#bottomText').html("You have already voted for this");
                }
            });


    });
    container.on('click', '#negativeVote', function() {
        $.post('/vote', {
                scenarioId: scenario_id,
                geoJSON: "geojson_buildings",
                feature: feature,
                voted_for: "negative"
            },
            function(returnedData) {
                if (returnedData.data.status === "no user") {
                    $('#bottomText').html("Please log in first");
                    return;
                }
                showVotesInPopup(returnedData.data);
                if (returnedData.data.status === "success") {
                    $.post('/log', {
                            scenarioId: scenario_id,
                            logMessage: " voted negative on building with id " + feature.id + " with coordinates " + feature.geometry.coordinates[0] + " " + feature.geometry.coordinates[1]
                        },
                        function(returnedData) {});

                    layer.setStyle({
                        color: buildingColor_voted_against
                    });

                    $('#bottomText').html("Thanks for your vote");

                } else {
                    $('#bottomText').html("You have already voted for this");
                }
            });

    });

    container.on('click', '#delete', function() {
        $.post('/deleteElement', {
                scenarioId: scenario_id,
                geojson_type: "geojson_buildings",
                featureid: feature.id
            },
            function(returnedData) {
                console.log(returnedData);
                refresh(map);
            });

    });

    container.html("Is this destroyed building mapped correctly? <br><br><button type='button' id='positiveVote' class='btn btn-success'><span class='glyphicon glyphicon-thumbs-up'></span></button> <button type='button' id='negativeVote' class='btn btn-danger'><span class='glyphicon glyphicon-thumbs-down'></span></button><br><br><div id ='positiveResult'></div><br><div id ='negativeResult'></div><br><div id ='bottomText'></div><div id = 'adminControl'></div>");

    if (isAdmin) {
        $(container).children('#adminControl').html("<button type='button' id='delete' class='btn btn-danger'>Delete</button>");
    }

    layer.bindPopup(container[0]);

}

function showVotesInPopup(data) {
    $('#positiveResult').html("agreeing: " + data.positiveVotes);
    $('#negativeResult').html("disagreeing: " + data.negativeVotes);

    var container = document.getElementById("positiveResult");
    var content = container.innerHTML;
    container.innerHTML = content;

}


function addPopupForSettlements(feature, layer, map, isAdmin) {
    var container = $('<div />');

    container.on('click', '#positiveVote', function() {
        $.post('/vote', {
                scenarioId: scenario_id,
                geoJSON: "geojson_settlements",
                feature: feature,
                voted_for: "positive"
            },
            function(returnedData) {
                if (returnedData.data.status === "no user") {
                    $('#bottomText').html("Please log in first");
                    return;
                }
                showVotesInPopup(returnedData.data);
                if (returnedData.data.status === "success") {
                    $.post('/log', {
                            scenarioId: scenario_id,
                            logMessage: " voted positive on tile with id " + feature.id
                        },
                        function(returnedData) {});
                    layer.setStyle({
                        color: settlementColor_voted
                    });

                    $('#bottomText').html("Thanks for your vote");
                } else {
                    $('#bottomText').html("You have already voted");
                }
            });


    });
    container.on('click', '#negativeVote', function() {
        $.post('/vote', {
                scenarioId: scenario_id,
                geoJSON: "geojson_settlements",
                feature: feature,
                voted_for: "negative"
            },
            function(returnedData) {
                if (returnedData.data.status === "no user") {
                    $('#bottomText').html("Please log in first");
                    return;
                }
                showVotesInPopup(returnedData.data);
                if (returnedData.data.status === "success") {
                    $.post('/log', {
                            scenarioId: scenario_id,
                            logMessage: " voted negative on tile with id " + feature.id
                        },
                        function(returnedData) {});
                    layer.setStyle({
                        color: settlementColor_voted_against,
                        opacity: 1
                    });
                    showVotesInPopup(returnedData.data);

                    $('#bottomText').html("Thanks for your vote");
                } else {
                    $('#bottomText').html("You have already voted");
                }
            });

    });


    container.on('click', '#delete', function() {
        $.post('/deleteElement', {
                scenarioId: scenario_id,
                geojson_type: "geojson_settlements",
                featureid: feature.id
            },
            function(returnedData) {
                console.log(returnedData);
                refresh(map);
            });

    });
    var settlement_string = "";
    /*if (feature.properties.settlement === 0) {
        settlement_string = "as 'no settlement' ?"
    } else {
        settlement_string = "as 'settlement' ?"
    }*/
    container.html("Does this tile contain buildings? <br><br><button type='button' id='positiveVote' class='btn btn-success'><span class='glyphicon glyphicon-thumbs-up'></span></button> <button type='button' id='negativeVote' class='btn btn-danger'><span class='glyphicon glyphicon-thumbs-down'></span></button><br><br><div id ='positiveResult'></div><br><div id ='negativeResult'></div><br><div id ='bottomText'></div><div id = 'adminControl'></div>");

    if (isAdmin) {
        $(container).children('#adminControl').html("<button type='button' id='delete' class='btn btn-danger'>Delete</button>");
    }
    layer.bindPopup(container[0]);

}