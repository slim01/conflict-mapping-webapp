/*
* returns votes of a specific user
*/

var keystone = require('keystone'),
    Rates = keystone.list('Rates');

exports = module.exports = function(req, res) {
    if (!req.user) return res.apiResponse({
        data: {
            "status": "no user"
        }
    });
    Rates.model.find()
        .where('userId', req.user._id.toString())
        .where('scenarioId', req.query.scenarioId.toString())
        .exec(function(err, rates) {     
        	if (err) return res.apiError('database error', err);       
            return res.apiResponse({
                data: {
                    "rates": rates
                }
            });
        });




};