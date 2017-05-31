"use strict";

function addToPriorityList(feature, layer, map) {
    var containingVotes = 0;
    var containingPoints = 0;
    if (feature.properties.positiveVotes > 0 || feature.properties.negativeVotes > 0) {
        return;
    }
    buildings_json.eachLayer(function(featureInstancelayer) {
        if (turf.inside([featureInstancelayer._latlng.lng, featureInstancelayer._latlng.lat], feature)) {
            if (featureInstancelayer.feature.properties.createdBy !== "human") {
                containingPoints++;
            }
        }
    });
    var featureNumber = feature.id + 1;
    if (containingPoints >= minContainingPointsForPriorityList) {
        $('#priorityList').append('<a id=' + featureNumber + '_pArea' + ' href="javascript:void(0)" class="list-group-item list-group-item-action customlistitem"></a>');

        $('#' + featureNumber + '_pArea').data('containingPoints', containingPoints);

        $('#' + featureNumber + '_pArea').on("click", function() {
            map.fitBounds(layer.getBounds());
        });
    }
}

function sortPriorityList() {
    var oldUl = $('#priorityList');
    var new_ul = oldUl[0].cloneNode(false);
    var liArray = [];
    for (var i = 0; i < oldUl[0].childNodes.length; i++) {
        if (oldUl[0].childNodes[i].nodeName === 'A')
            liArray.push(oldUl[0].childNodes[i]);
    }
    liArray.sort(function(a, b) {
        if ($(a).data('containingPoints') > $(b).data('containingPoints')) {
            return -1;
        }
        if ($(a).data('containingPoints') < $(b).data('containingPoints')) {
            return 1;
        }
        return 0;

    });

    for (var i = 0; i < liArray.length; i++) {

        liArray[i].innerHTML = "<span class='tab customlistitemspan'><h3>" + (i + 1) + ". Area</h3> " + $(liArray[i]).data('containingPoints') + " <span title='" + $(liArray[i]).data('containingPoints') + " potentially destroyed buldings' class='glyphicon glyphicon-home'></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
        new_ul.appendChild(liArray[i]);
    }
    oldUl[0].parentNode.replaceChild(new_ul, oldUl[0]);

}