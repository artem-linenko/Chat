var User = require('./../models/user').User;
var HttpError = require('./../error').HttpError;
var AuthError = require('./../models/user').AuthError;

exports.get = function(req, res) {
  res.render('register');
};

exports.post = function(req, res, next) {
	// req.body is provided by bodyParser middleware
  var userInfo = req.body.userInfo;

  User.register(userInfo, function(err, user) {
    if (err) {
      if (err instanceof AuthError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }
    // req.session is an object to write any session properties in
    req.session.user = user._id;
    res.send({});
  });
};