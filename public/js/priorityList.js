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
        var Acp = $(a).data('containingPoints');
        var Acv = $(a).data('containingVotes');
        var Bcp = $(b).data('containingPoints');
        var Bcv = $(b).data('containingVotes');
        var rankA = Acp - Acv;
        var rankB = Bcp - Bcv;
        if (rankA < 1){
            rankA = Acp/Acv - 0.1
        }
        if(rankB < 1){
            rankB = Bcp/Bcv - 0.1
        }

        if (rankA > rankB) {
            return -1;
        }

        if (rankA < rankB) {
            return 1;
        }
        return 0;

    });

    for (var i = 0; i < liArray.length; i++) {

        liArray[i].innerHTML = "<span class='tab customlistitemspan'><h3>" + (i + 1) + ". Area</h3> " + $(liArray[i]).data('containingPoints') + " <span title='" + $(liArray[i]).data('containingPoints') + " mapped buldings' class='glyphicon glyphicon-home'></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + $(liArray[i]).data('containingVotes') + " <span title='" + $(liArray[i]).data('containingVotes') + " votes on buildings' class='glyphicon glyphicon-user'></span></span>";
        new_ul.appendChild(liArray[i]);
    }
    oldUl[0].parentNode.replaceChild(new_ul, oldUl[0]);

}