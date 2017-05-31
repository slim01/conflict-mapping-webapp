"use strict";
//var dbPort = 27017;
var keystone = require('keystone');
keystone.init({
    'name': 'crisis map',
    'signin logo': [],

    'static': ['public'],
    'views': 'templates/views',
    'view engine': 'jade',

    'auto update': true,
    'mongo': 'mongodb://localhost/DMap_noPremapped',


    'signin url': '/signin',
    'signin redirect': '/',
    'signout redirect': '/',
    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': 'q+]z<YtVL62L8|9'
});

require('./models');
keystone.set('routes', require('./routes'));
keystone.set('brand', 'crisis map control panel');
keystone.start();