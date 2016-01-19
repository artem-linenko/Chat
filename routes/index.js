var checkAuth = require('./../middleware/checkAuth');

module.exports = function(app) {
	app.get('/', require('./frontpage').get);

	app.get('/login', require('./login').get);
	app.get('/users', require('./users').get);

	app.post('/login', require('./login').post);
	app.post('/users', require('./users').post);
	app.get('/logout', require('./logout').post);
	app.post('/logout', require('./logout').post);

	app.get('/chat', checkAuth, require('./chat').get);
}