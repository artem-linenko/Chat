var express = require('express');
var mongoose = require('./mongoose');

var MongoStore = require('connect-mongo/src-es5')(express); // storage for sessions - a class for  storing session information
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

module.exports = sessionStore;