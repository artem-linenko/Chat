var User = require('./models/user').User;

var user = new User({
	username: "Tester2",
	password: "great"
});

user.save(function(err, user, affected) {
	console.log(arguments)
})