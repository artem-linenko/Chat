var crypto = require('crypto');
var async = require('async');
var util = require('util');
var log = require('./../libs/log')(module);

var mongoose = require('./../libs/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
  users: {
    type: Array,
    required: true
  },
  messages: {
    type: Array,
    required: false
  }
});

schema.statics.addMessage = function(_id, message, callback) { // method for class not only for instance
  var Conversation = this;

  Conversation.update({_id: _id}, { $addToSet: {messages: message} }, function(err, conversation) {
    if (err) {
      return callback('Error occured. Please try later');
    }

    if (conversation) {
      callback(null, conversation);
    } else {
      callback('No conversations found');
    }
  })

};

schema.statics.fetchAllMessages = function(_id, callback) { // method for class not only for instance
  var Conversation = this;

  Conversation.findOne({_id: _id}, function(err, conversation) {
    if (err) {
      return callback('Error occured. Please try later');
    }

    if (conversation) {
      callback(null, conversation);
    } else {
      callback('No conversations found');
    }
  })

};

schema.statics.createConversation = function(users, callback) { // method for class not only for instance
  var Conversation = this; // link on the class
  // async.waterfall - all the data from previous function will go down to the next function as a first argument 
  async.waterfall([
    function(callback) {
      Conversation.findOne({users: {$all: users} }, callback); // find a conversation in DB and convey to the next function, if no user was found user == null
    },
    function(conversation, callback) {
      if (conversation) {
        callback(null, conversation);
      } else {
        var conversation = new Conversation({users: users, messages: []}); // if conversation wasn't found in DB - create one
        
        conversation.save(function(err) {
          if (err) return callback(err);
          callback(null, conversation);
        });
      }
    }
  ], callback);
};

schema.statics.fetchActiveConversations = function(user, callback) { // method for class not only for instance
  var Conversation = this; // link on the class
  
  Conversation.find({users: user.username}, callback);
};

exports.Conversation = mongoose.model('Conversation', schema);