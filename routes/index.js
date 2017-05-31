var keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname);


// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Handle 404 errors
keystone.set('404', function(req, res, next) {
    res.notfound();
});

// Handle other errors
keystone.set('500', function(err, req, res, next) {
    var title, message;
    if (err instanceof Error) {
        message = err.message;
        err = err.stack;
    }
    res.err(err, title, message);
});

// Load Routes
var routes = {
    views: importRoutes('./views'),
    api: importRoutes('./api')
};

// Bind Routes
exports = module.exports = function(app) {
    app.get('/', routes.views.overview);
    app.get('/map', routes.views.map);
    app.get('/registration', routes.views.registration);
    app.get('/getVotes', keystone.middleware.api, routes.api.getVotes);
    app.get('/getUser', keystone.middleware.api, routes.api.getUser);
    app.all('/signin', routes.views.signin);
    app.get('/getScenarioById:id', keystone.middleware.api, routes.api.scenario);    
    app.get('/getVotesOfElement', keystone.middleware.api, routes.api.getVotesOfElement);
    app.post('/vote', keystone.middleware.api, routes.api.vote);
    app.post('/log', keystone.middleware.api, routes.api.log);
    app.post('/logCurrentPosition', keystone.middleware.api, routes.api.logCurrentPosition);
    app.get('/download', keystone.middleware.api, routes.api.download);
    app.post('/deleteElement', keystone.middleware.api, routes.api.deleteElement);
    app.post('/deleteAll', keystone.middleware.api, routes.api.deleteAll);
    app.post('/addFeature', keystone.middleware.api, routes.api.addFeature);
}