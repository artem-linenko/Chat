var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('./../libs/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String,
    required: false
  },
  birthDate: {
    type: Date,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) { // method for class not only for instance
  var User = this; // link on the class
  // async.waterfall - all the data from previous function will go down to the next function as a first argument 
  async.waterfall([
    function(callback) {
      User.findOne({username: username}, callback); // find a user in DB and convey to the next function, if no user was found user == null
    },
    function(user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user);
        } else {
          callback(new AuthError("Wrong password"));
        }
      } else {
        callback(new AuthError("Cannot find the user"));
      }
    }
  ], callback);
};

schema.statics.register = function(userInfo, callback) {
  var User = this;

  async.waterfall([
    function(callback) {
      User.findOne({username: userInfo.username}, callback); // find a user in DB and convey to the next function, if no user was found user == null
    },
    function(user, callback) {
      if (user) {
        callback(new AuthError("User already exists"));
      } else {
        var user = new User(userInfo); // if user wasn't found in DB - create one
        user.save(function(err) {
          if (err) return callback(err);
          callback(null, user);
        });
      }
    }
  ], callback);

}

schema.statics.fetchAllUsers = function(callback) {
  var User = this; // link on the class

  User.find({}, function(err, users) {
    if (err) {
      return callback('Error occured. Please try later');
    }

    if (users) {
      callback(null, users);
    } else {
      callback('No users found');
    }
  })
};

module.exports.User = mongoose.model('User', schema);

function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

module.exports.AuthError = AuthError;