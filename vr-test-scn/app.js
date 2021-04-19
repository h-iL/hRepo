
console.log('node.js server is running')

let express = require('express')

let app = express()

let server = app.listen(3000)

app.use(express.static('public'))

console.log('express server is running')


//for websocket

let connected = []
let sockets = {}

var socket = require('socket.io')

var io = socket(server)

io.sockets.on('connection', newConnection)

function newConnection(socket)
{
    console.log('new connection: ' + socket.id)

    sockets[socket.id] = socket

    socket.join("room1")

    connected.push(socket.id)


    socket.emit( 'hello')
        

    socket.on('disconnect', function () {

        delete sockets[socket.id]
        connected = connected.filter(id => id != socket.id)
        socket.broadcast.emit('deletePlayer',
            {
                id: socket.id,
            })
    })
}
