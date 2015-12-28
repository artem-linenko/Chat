var log = require('./../libs/log')(module);

module.exports = function(server) {
	var io = require('socket.io').listen(server);
	io.set('logger', log);

	io.sockets.on('connection', function (socket) {

	  socket.on('message', function (text, cb) {
	    socket.broadcast.emit('message', text); // send message everyone except of sender
	    cb("unneccesary data approving that text is accepted");
	  });
	});	
}