console.log('socket-player')

import {
    getRandomName,
    getRandomAnimal,
    getRandomColour,
    colourNameToHex
} from './name-generator.js'



var Player = function(params) {

    return new Player.init(params)

}


Player.prototype = {

    init: function() {

        // console.log('initialize player')
        this.colour = getRandomColour()
        this.name = this.colour + getRandomAnimal()
        this.id = null
        this.model = null
        this.name = name
            // console.log(this.game.controls)
        this.position = null
        this.position = this.game.controls.object.position
        this.game.player = this 



    },

    initAvatar: function() {

        this.material = new THREE.MeshLambertMaterial({

            color: this.colour,
            envMap: this.game.reflectionCube

        })

        const objLoader = new THREE.OBJLoader();

        objLoader.setPath('obj/walt/')
        objLoader.load('WaltHead.obj', (object)=> {

            this.game.avatar = object.children[0];
            this.game.avatar.scale.multiplyScalar(1);
            this.game.avatar.material = this.material;
            // scene.add(globalPlayer);

            this.userData = {
                   ready: true,
                   name: this.name, 
                   model: this.model, 
                   colour: this.colour, 
                   x: this.position.x, 
                   y: this.position.y, 
                   z: this.position.z, 
                   action: 'idle', 
            }


            // this.socket.emit('init', this.userData )


        })
    },

    initSocket: function(socket) {

        console.log(this.game)



       socket.on('setId', (data) => {

            console.log(this.game) // returns error

            if (!this.game.initialized) {

                this.id = data.id
                this.game.addUserTag(this.colour, data.id, this.name + ' (You)')
                this.game.initialized = true

            }


        })

        socket.on('deletePlayer', function(data) {

            // delete  game.remotePlayers[data.id];  // or delete person["age"];
            // scene.remove(game.remotePlayers[data.id])
            // this.game.tags = this.game.tags.filter(tag => tag != data.id)
            // let id = "#" + data.id
            // $(id).remove();

        })


        socket.on('updateAsset', function(data) {

            // let o = objects[data.id]

            // if (o) {
            //     o.position.x = data.x
            //     o.position.y = data.y
            //     o.position.z = data.z
            // }

        })

        socket.on('update paper', function(data) {

            // paintPaper(data)

        })

        socket.on('toggle pencil', function(bool) {

            // console.log('togglePencil: ', bool)

            // paintmode = bool
            // controls.enabled = bool
            // togglePencil(paintmode)

        })

        socket.on('remoteData', function(data) {

            // game.remoteData = data

        })

        return socket

    },


    update: function() {


    },





}

Player.init = function(game) {

    this.game = game
    this.init()
    this.socket = this.initSocket(io())
    this.initAvatar()

}

Player.init.prototype = Player.prototype

export default Player