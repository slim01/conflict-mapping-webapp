var keystone = require('keystone');
exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    view.query('scenarios', keystone.list('Scenario').model.find())
        .then(function(err, results, next) {
            if (err) return next(err);
            next();
        });

    view.render('overview');
}