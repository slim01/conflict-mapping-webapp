var keystone = require('keystone'),
    Scenario = keystone.list('Scenario');

exports = module.exports = function(req, res) {	
    Scenario.model.findById(req.params.id, function(err, scenario) {
        if (err) return res.apiError('database error', err);
        if (!scenario) return res.apiError('invalid id');
        return res.apiResponse({
            data: scenario.toJSON()
        });
    });
};