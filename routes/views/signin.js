var keystone = require('keystone'),
    async = require('async');


exports = module.exports = function(req, res) {

    if (req.user) {
        return res.redirect('/profile')
    }

    var locals = res.locals,
        view = new keystone.View(req, res);

    // Set locals
    locals.section = 'session';

    //Set form
    locals.form = req.body;

    //TODO registration


    view.on('post', {
        action: 'signin'
    }, function(next) {
        if (!req.body.signin_email || !req.body.signin_password) {
            req.flash('warning', 'Please type in username and password');
            return next();
        }

        var onSuccess = function() {
            if (req.query && req.query.from) {
                res.redirect(req.query.from);
            } else {
                res.redirect('/');
            }
        }

        var onFail = function() {
            req.flash('warning', 'Your username or password were incorrect, please try again.');
            return next();
        }

        keystone.session.signin({
            email: req.body.signin_email,
            password: req.body.signin_password
        }, req, res, onSuccess, onFail);

    });

    // Render the view
    view.render('signin');
}