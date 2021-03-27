
console.log('node.js server is running')

let express = require('express')

let app = express()

let server = app.listen(3000)

app.use(express.static('public'))

console.log('express server is running')


//for websocket
var socket = require('socket.io')

var io = socket(server)

io.sockets.on('connection', newConnection)

function newConnection(socket)
{
    console.log('new connection: '+ socket.id)
}
