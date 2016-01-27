var User = require('./../models/user').User;
var Conversation = require('./../models/conversation').Conversation;
var HttpError = require('./../error').HttpError;
var AuthError = require('./../models/user').AuthError;

exports.get = function(req, res) {
  User.fetchAllUsers(function(err, allUsers) {
    if (err) {
      res.send(err);
    } else {
      Conversation.fetchActiveConversations(req.user, function(err, activeConversations) {
        if (err) {
          res.send(err);
        } else {
          var conversations = [];

          for (var i = 0; i < activeConversations.length; i++) {
            var chatterer = defineChatterer(activeConversations[i], req.user.username),
              lastMessage;

            if (activeConversations[i].messages[activeConversations[i].messages.length - 1]) {
              lastMessage = activeConversations[i].messages[activeConversations[i].messages.length - 1].text || ''
            } else {
              lastMessage = "No messages"
            }

            conversations[i] = {
              chatterer: chatterer,
              lastMessage: lastMessage
            }
          };

          function defineChatterer(conversation, currenUser) {
            for (var j = 0; j < conversation.users.length; j++) {
              if (conversation.users[j] !== currenUser) {
                return conversation.users[j];
              }
            }
          }

          req.conversations = res.locals.conversations = conversations;
        }

        var users = [];

        for (var i = 0; i < allUsers.length; i++) {
          var user = allUsers[i].username,
            userhasActiveConversation = checkActiveConversation(conversations, user);

          if (!userhasActiveConversation) {
            users.push(user);
          }

          function checkActiveConversation(conversations, username) {
            var hasConversation = false;

            for (var j = 0; j < conversations.length; j++) {
              if (conversations[j].chatterer === username) {
                hasConversation = true;
              }
            }

            return hasConversation;
          }
        }

        req.users = res.locals.users = users;
        res.render('users');
      });
    }
  });



};

exports.post = function(req, res, next) {
	// req.body is provided by bodyParser middleware
  var users = [req.user.username, req.body.user]

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