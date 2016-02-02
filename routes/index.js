var checkAuth = require('./../middleware/checkAuth');

module.exports = function(app) {
	app.get('/', require('./frontpage').get);

	app.get('/login', require('./login').get);
	app.post('/login', require('./login').post);

	// Register is a separate angular app which uses routing 
	app.get(['/register',
			'/authentication',
			'/personal',
			'/sending'], 
		require('./register').get);
	app.post('/register', require('./register').post);

	app.get('/users', checkAuth, require('./users').get);
	app.post('/users',  require('./users').post);

	app.get('/chat', checkAuth, require('./chat').get);

	app.get('/logout', require('./logout').post);
	app.post('/logout', require('./logout').post);

}