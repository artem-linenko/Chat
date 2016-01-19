var HttpError = require('./../error').HttpError;

module.exports = function(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  }

  next();
};