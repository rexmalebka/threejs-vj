const Server = require('socket.io')

const io = new Server.Server(3000, {cors: {origin: '*'}});

io.on("connection", (socket) => {
	console.debug("connected", socket)

	let i=0;
	setInterval(function(){
		socket.emit('pos_1', [
			Math.sin(i)*3,
			Math.sin(i)*5,
			Math.sin(i)*4,
		])
		i+=0.1;
	},50)

	setInterval(function(){
		socket.emit('pos_2', [
			Math.sin(i*4)*3,
			Math.sin(i*3)*5,
			Math.sin(i*4)*4,
		])
		i+=0.1;
	},50)
});
