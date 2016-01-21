var Conversation = require('./../models/conversation').Conversation;

exports.get = function(req, res) {
  var conversationId = require('url').parse(req.originalUrl, true).query.conversation;
  
  Conversation.fetchAllMessages(conversationId, function(err, conversation) {
    if (err) {
      console.log(err)
      res.send(err);
    } else {
      var messages = conversation.messages;
      console.log('messages', messages);
      req.messages = res.locals.messages = messages;
      res.render('chat');
    }
  })
};