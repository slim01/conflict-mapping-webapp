"use strict";

function addToPriorityList(feature, layer, map) {    
    var containingVotes = 0;
    var containingPoints = 0;
    buildings_json.eachLayer(function(featureInstancelayer) {
        if (turf.inside([featureInstancelayer._latlng.lng, featureInstancelayer._latlng.lat], feature)) {
            containingPoints++;
            containingVotes += (featureInstancelayer.feature.properties.negativeVotes + featureInstancelayer.feature.properties.positiveVotes);
        }
    });
    var featureNumber = feature.id + 1;
    if(containingPoints >= minContainingPointsForPriorityList){    
        $('#priorityList').append('<a id=' + featureNumber + '_pArea' + ' href="javascript:void(0)" class="list-group-item list-group-item-action customlistitem"></a>');

        $('#' + featureNumber + '_pArea').data('containingPoints', containingPoints);
        $('#' + featureNumber + '_pArea').data('containingVotes', containingVotes);

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

        liArray[i].innerHTML = "<span class='tab customlistitemspan'>" + (i + 1) + ". Area (" + $(liArray[i]).data('containingPoints') + " mapped buildings, " + $(liArray[i]).data('containingVotes') + "Votes)</span>";
        new_ul.appendChild(liArray[i]);
    }
    oldUl[0].parentNode.replaceChild(new_ul, oldUl[0]);

}