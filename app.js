var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require('./libs/log')(module);
var mongoose = require('./libs/mongoose');
var HttpError = require('./error').HttpError;

var app = express();

// all environments
app.engine('ejs', require('ejs-locals'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());

var MongoStore = require('connect-mongo/src-es5')(express); // a class for  storing session information

// middleware for handling sessions
app.use(express.session({
	secret: config.get("session:secret"),
	key: config.get("session:key"),
	cookie: config.get("session:cookie"),
	store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(require('./middleware/loadUser')); // initializing user if active session exists
app.use(require('./middleware/sendHttpError'));

app.use(app.router);
require('./routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(function(err, req, res, next) { // error handling middleware
  if (typeof err == 'number') { // next(404);
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development') {
      express.errorHandler()(err, req, res, next);
    } else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

http.createServer(app).listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});