const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
// console.log('my node.js server is running')


// let express = require('express')



// let app = express()


// // const http = require('http').Server(app);
// // creates a new instance of express exported by the Express module:

// let server = app.listen(3000)
// // Starts a UNIX socket and listens for connections on the given path. This method is identical to Node’s http.Server.listen().

// app.use(express.static('public'))
// // Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path.
// // serve static content 


// // const io = require('socket.io')(app);

// console.log('my express server is running')