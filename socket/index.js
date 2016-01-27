var log = require('./../libs/log')(module);
var config = require('./../config');
var connect = require('connect'); // npm i connect
var async = require('async');
var cookie = require('cookie');   // npm i cookie
var cookieParser = require('cookie-parser');   // npm i cookie
var sessionStore = require('./../libs/sessionStore');
var HttpError = require('./../error').HttpError;
var User = require('./../models/user').User;
var Conversation = require('./../models/conversation').Conversation;

function loadSession(sid, callback) {

  // sessionStore callback is not quite async-style!
  sessionStore.load(sid, function(err, session) {
    if (arguments.length == 0) {
      // no arguments => no session
      // log.debug("session: " + session);
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  });

}

function loadUser(session, callback) {

  if (!session || !session.user) {
    return callback(null, null);
  }

  User.findById(session.user, function(err, user) {
    if (err) return callback(err);

    if (!user) {
      return callback(null, null);
    }

    // log.debug("user: " + user);
    callback(null, user);
  });
}

function writeConversationMessage(conversationId, message, callback) {
  Conversation.addMessage(conversationId, message, function(err, success) {
    if (success) {
      callback(null, success);
    }
  })
}

module.exports = function(server) {
  var io = require('socket.io').listen(server);

  // AUTHORIZATION middleware
  io.use(function(socket, next) {
  	var handshake = socket.request;
    async.waterfall([
      function(callback) {
        // сделать handshakeData.cookies - объектом с cookie
        handshake.cookies = cookie.parse(handshake.headers.cookie || '');
        var sidCookie = handshake.cookies[config.get('session:key')],
        	sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

        loadSession(sid, callback);
      },
      function(session, callback) {
        if (!session) {
          callback(new HttpError(401, "No session"));
        }

        handshake.session = session;
        loadUser(session, callback);
      },
      function(user, callback) {
        if (!user) {
          callback(new HttpError(403, "Anonymous session may not connect"));
        }

        handshake.user = user;
        callback(null, true);
      },
      function(user, callback) {
        var conversationId = require('url').parse(socket.handshake.headers.referer, true).query.conversation

        handshake.conversationId = conversationId;
        callback(null, true)
      }
      

    ], function(err) {
      if (!err) {
        return next();
      }

      if (err instanceof HttpError) {
        return next(null, false);
      }

      next(err);
    });

	next();
  });

  io.sockets.on('session:reload', function(sid) {
    var clients = io.sockets.clients();

    clients.forEach(function(client) {
      if (client.handshake.session.id != sid) return;

      loadSession(sid, function(err, session) {
        if (err) {
          client.emit("error", "server error");
          client.disconnect();
          return;
        }

        if (!session) {
          client.emit("logout");
          client.disconnect();
          return;
        }

        client.handshake.session = session;
      });
    });
  });

  io.sockets.on('connection', function(socket) {
  	if (socket.request.user) {
	  	var username = socket.request.user._doc.username,
        conversationId = socket.request.conversationId;
        
      // log.debug('conversationId: ', conversationId)

      //notify that user came
	    socket.broadcast.emit('join', username);

	    socket.on('message', function(text, cb) {
        var message = {
          text: text,
          username: username,
          timestamp: new Date()
        }

        writeConversationMessage(conversationId, message, function(err, success) {
          if (success) {
            socket.broadcast.emit('message', username, text);
            cb("unneccesary data approving that text is accepted");
          }
        });

	    });

      //notify that user gone
	    socket.on('disconnect', function() {
	      socket.broadcast.emit('leave', username);
	    });
  	}
  });

  return io;
};