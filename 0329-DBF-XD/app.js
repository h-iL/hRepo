console.log('my node.js server is running')

// creating a server

const express = require('express')
const app = express()
const server = app.listen(3000)
const util = require('util');

let connected = []
let sockets = {}
let globalData = {}



// app.use(express.static('/public/javascripts'));
// app.get('/',function(req, res) {
//     res.sendFile(__dirname + '/public/index.html');
// });


app.use(express.static('public'))

console.log('my socket server is running')

var io = require('socket.io')(server);

io.on('connection', function(socket) {

    sockets[socket.id] = socket

    connected.push(socket.id)


    socket.userData = {

        ready: false,
        x: 0,
        y: 0,
        z: 0,
        colour: null,
        name: 'anonymous',
        // heading: 0
    }; //Default values;


    socket.emit('setId', {
        id: socket.id
    });

    socket.on('disconnect', function() {


        delete sockets[socket.id]
        connected = connected.filter(id => id != socket.id)
        socket.broadcast.emit('deletePlayer', {

            id: socket.id,

        });

    });

    socket.on('init', function(data) {

        console.log('initialize player', data)

        // console.log(`socket.init ${data.name}`);
        socket.userData.ready = true;
        socket.userData.name = data.name
        socket.userData.model = data.model;
        socket.userData.colour = data.colour;
        socket.userData.x = data.position.x;
        socket.userData.y = data.position.y;
        socket.userData.z = data.position.z;
        socket.userData.action = "Idle";
        socket.userData.assets = {}

        console.log(JSON.stringify(globalData,null,4))

        for (id in globalData){

            socket.emit('updateAsset',globalData[id])
        }
        
        // globalData.forEach(asset => socket.emit('updateAsset',data))

        // socket.emit('updateAllAssets', globalData);


    });

    socket.on('update', function(data) {


        // console.log('update player ' + player.id + ' at position ' + player.position )
        socket.userData.x = data.position.x;
        socket.userData.y = data.position.y;
        socket.userData.z = data.position.z;
        // socket.broadcast.emit('update global', player)

    })


    socket.on('updateAsset', function(data) {

        console.log('update asset')


        globalData[data.id] = data

        console.log(globalData)
        socket.broadcast.emit('updateAsset', data)

    })

    socket.on('comment', function(data) {

        globalData[data.id] = data

        socket.broadcast.emit('comment', data)

    })


    socket.on('updateDraw', function(data) {

        // console.log('draw ' + player.id + ' at position ' + player.position )
        socket.broadcast.emit('update paper', data)

    })

    socket.on('toggle pencil', function(bool) {

        console.log('toggle pencil!')

        // console.log('draw ' + player.id + ' at position ' + player.position )
        socket.broadcast.emit('toggle pencil', bool)

    })





    //    socket.on('disconnect', function(){
    // 	socket.broadcast.emit('deletePlayer', { id: socket.id });
    //    });	

    // socket.on('init', function(data){
    // 	console.log(`socket.init ${data.model}`);
    // 	socket.userData.model = data.model;
    // 	socket.userData.colour = data.colour;
    // 	socket.userData.x = data.x;
    // 	socket.userData.y = data.y;
    // 	socket.userData.z = data.z;
    // 	socket.userData.heading = data.h;
    // 	socket.userData.pb = data.pb,
    // 	socket.userData.action = "Idle";
    // });

    // socket.on('update', function(data){
    // 	socket.userData.x = data.x;
    // 	socket.userData.y = data.y;
    // 	socket.userData.z = data.z;
    // 	socket.userData.heading = data.h;
    // 	socket.userData.pb = data.pb,
    // 	socket.userData.action = data.action;
    // });

    // socket.on('chat message', function(data){
    // 	console.log(`chat message:${data.id} ${data.message}`);
    // 	io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
    // })


})


setInterval(function() {

    let pack = []


    // console.log('connected:', connected.length)

    for (var i = 0; i < connected.length; i++) {

        let id = connected[i]
        const socket = sockets[id]

        // //Only push sockets that have been initialised

        if (socket.userData.ready) {

            let data = {

                id: socket.id,
                position: socket.userData.position,
                x: socket.userData.x,
                y: socket.userData.y,
                z: socket.userData.z,
                colour: socket.userData.colour,
                name: socket.userData.name

            }

            pack.push(data);
        }
        //   }





    }

    if (pack.length > 0) io.emit('remoteData', pack);
  

}, 40);


/*


const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('../../public_html/blockland/'));
app.use(express.static('../../public_html/libs'));
app.use(express.static('../../public_html/blockland/v3'));
app.get('/',function(req, res) {
    res.sendFile(__dirname + '../../public_html/blockland/v3/index.html');
});

io.sockets.on('connection', function(socket){
	socket.userData = { x:0, y:0, z:0, heading:0 };//Default values;
 
	console.log(`${socket.id} connected`);
	socket.emit('setId', { id:socket.id });
	
    socket.on('disconnect', function(){
		socket.broadcast.emit('deletePlayer', { id: socket.id });
    });	
	
	socket.on('init', function(data){
		console.log(`socket.init ${data.model}`);
		socket.userData.model = data.model;
		socket.userData.colour = data.colour;
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = "Idle";
	});
	
	socket.on('update', function(data){
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = data.action;
	});
	
	socket.on('chat message', function(data){
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
	})
});

http.listen(2002, function(){
  console.log('listening on *:2002');
});

setInterval(function(){
	const nsp = io.of('/');
    let pack = [];
	
    for(let id in io.sockets.sockets){
        const socket = nsp.connected[id];
		//Only push sockets that have been initialised
		if (socket.userData.model!==undefined){
			pack.push({
				id: socket.id,
				model: socket.userData.model,
				colour: socket.userData.colour,
				x: socket.userData.x,
				y: socket.userData.y,
				z: socket.userData.z,
				heading: socket.userData.heading,
				pb: socket.userData.pb,
				action: socket.userData.action
			});    
		}
    }
	if (pack.length>0) io.emit('remoteData', pack);
}, 40);

*/