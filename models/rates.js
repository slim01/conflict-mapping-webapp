var keystone = require('keystone'),
    Types = keystone.Field.Types;
var Rates = new keystone.List('Rates', {hidden: true});
Rates.add({
    userId: {
        type: Types.Text,
        required: true,
        index: true,
        initial: false
    },
    scenarioId: {
        type: Types.Text,
        required: true,
        index: true,
        initial: false
    },
    geojson: {
        type: Types.Text,
        required: true,
        index: true,
        initial: false
    },
    featureId: {
        type: Types.Text,
        required: true,
        index: true,
        initial: false
    },
    voted_for: {
        type: Types.Select,
        options: 'negative, positive',
        required: true,
        index: true,
        initial: false
    }
})
Rates.register();