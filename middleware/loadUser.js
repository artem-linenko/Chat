var User = require('./../models/user').User;

module.exports = function(req, res, next) {
	// res.locals holds all the variables that are available for all of the templates
  req.user = res.locals.user = null;

  if (!req.session.user) return next();

  User.findById(req.session.user, function(err, user) {
    if (err) return next(err);

    req.user = res.locals.user = user;
    next();
  });
};