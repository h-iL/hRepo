console.log('my node.js server is running')

// creating a server

let express = require('express')
let app = express()
let server = app.listen(3000)
app.use(express.static('public'))

console.log('my socket server is running')

var io = require('socket.io')(server);

io.on('connection',function(socket){

	console.log('A user connected')

	socket.on('disconnect',function(){

		console.log('a user disconnected')
	
	})

	socket.on('update', function(player){

		console.log('update player ' + player.id + ' at position ' + player.position )
		socket.broadcast.emit('update global', player)

	})

})

/*

io.sockets.on('connection',

      // We are given a websocket object in our function
      function (socket) {

      	console.log(' connected to client ')

   //      socket.on('getWeather', function( city ){

   //      	let apiKey = '4efbc6b7681a84b8edb85f7a9b618d70';
   //      	// let city = 'portland';
   //      	let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

			// request(url, function (err, response, body) {

			// 	// call back function

			//   if(err){
			  
			//     console.log('error:', error);

			//   } else {
			    
			//     console.log('body:', JSON.stringify(body));
			//     io.emit('weatherReport', body);
			  
			//   }
			  
			// });


   //      })

      }

)
*/

