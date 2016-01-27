var User = require('./../models/user').User;
var Conversation = require('./../models/conversation').Conversation;
var HttpError = require('./../error').HttpError;
var AuthError = require('./../models/user').AuthError;

exports.get = function(req, res) {
  User.fetchAllUsers(function(err, users) {
    if (err) {
      console.log(err)
      res.send(err);
    } else {
      console.log(users.length)
      req.users = res.locals.users = users;
      res.render('users');
    }
  })
};

exports.post = function(req, res, next) {
	// req.body is provided by bodyParser middleware
  var users = [req.session.user, req.body.user]

  Conversation.createConversation(users, function(err, conversation) {
    if (err) {
      if (err instanceof AuthError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }

    res.send(JSON.stringify({url: '/chat?conversation=' + conversation._id}));
  });
};