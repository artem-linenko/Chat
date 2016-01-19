var crypto = require('crypto');
var async = require('async');
var util = require('util');

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

schema.statics.createConversation = function(users, callback) { // method for class not only for instance
  var Conversation = this; // link on the class
  // async.waterfall - all the data from previous function will go down to the next function as a first argument 
  async.waterfall([
    function(callback) {
      Conversation.findOne({users: {$all: users} }, callback); // find a conversation in DB and convey to the next function, if no user was found user == null
    },
    function(conversation, callback) {
      console.log(conversation);
      if (conversation) {
        callback(null, conversation);
      } else {
        console.log(users)
        var conversation = new Conversation({users: users, messages: []}); // if conversation wasn't found in DB - create one
        conversation.save(function(err) {
          if (err) return callback(err);
          callback(null, conversation);
        });
      }
    }
  ], callback);
};

exports.Conversation = mongoose.model('Conversation', schema);