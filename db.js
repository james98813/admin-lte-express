var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// Uncomment for use mongo database
//mongoose.connect('mongodb://localhost:27017/admin-lte-express');

// Users Model
var usersSchema = new Schema({
  id: Number,
  username: String,
  password: String,
  displayName: String,
  emails: Array
}, {collection:'users'});

var User = exports.User = mongoose.model('User', usersSchema);

exports.getUsers = function(cb) {
  User.find().exec(function(err, results) {
    cb(err, results);
  });
};

var users = exports.users = [
  new User({ 
    id: 1, 
    username: 'admin', 
    password: 'admin', 
    displayName: 'Jack', 
    emails: [ { value: 'jack@example.com' } ] 
  })]

// add users from collection mongo
this.getUsers(function(err, results) {
  if (err) throw err;
  results.forEach(function(user) {
    users.push(user);
  });
});

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (users[idx]) {
      cb(null, users[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = users.length; i < len; i++) {
      var user = users[i];
      if (user.username === username) {
        return cb(null, user);
      }
    }
    return cb(null, null);
  });
}