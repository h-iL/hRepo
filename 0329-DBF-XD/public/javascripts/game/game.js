console.log('procedural texture')


var Game = function(params) {

    return new Game.init(params)

}


Game.prototype = {

    init: function() {



    },

    addUserTag: function(colour, id, name) {


        if (!this.tags.includes()) {

            this.tags.push(id)

            console.log('button color:', id, colour, name)

            var r = $('<input type="button"  id="' + id + '"value="' + name + '"/>');

            let value = colour
            r.css('background-color', value);
            r.css('font-family', 'Nunito', 'sans-serif');

            console.log(colour)

            $("#buttons").append(r);

        }




    },

    updateRemotePlayers: function(dt) {

        // console.log(this.remoteData)


        if (!this.initialized) return // if the game is not initalized dont do anything... 



        let remoteList = this.remoteData.filter(player => player.id != this.player.id)



        for (var i = 0; i < remoteList.length; i++) {

            let tempData = remoteList[i]

            if (this.remotePlayers[tempData.id] !== undefined) {

                // console.log('update player')

                let mesh = this.remotePlayers[tempData.id]

                // mesh.position.x ++
                mesh.position.x = tempData.x
                mesh.position.y = tempData.y
                mesh.position.z = tempData.z
                mesh.lookAt(0, 0, 0)


            } else {

                if (!this.avatar) return

                console.log('colour:', tempData.colour)


                var cubeMaterial2 = new THREE.MeshLambertMaterial({

                    color: tempData.colour,
                    envMap: this.reflectionCube,
                    combine: THREE.MixOperation,
                    reflectivity: .15,
                    transparent: true,
                    opacity: .7


                })

                let mesh = this.avatar.clone()
                mesh.material = cubeMaterial2
                mesh.position.x = tempData.x
                mesh.position.y = tempData.y
                mesh.position.z = tempData.z
                mesh.lookAt(0, 0, 0)


                this.remotePlayers[tempData.id] = mesh
                this.scene.add(mesh)

                console.log(tempData.colour)
                this.addUserTag(tempData.colour, tempData.id, tempData.name)




            }

            // have we made this player yet?  


        }

        // this.remotePlayers.forEach(player => this.updatePlayer(player))



        // console.log('remote players', this.remotePlayers.length)



    },





}

Game.init = function(params) {

    // this.container;
    this.player = {
        id: null
    }

    this.tags = []

    this.reflectionCube = params.reflectionCube
    this.refractionCube = params.refractionCube

    this.avatar = null

    // this.cameras;
    // this.camera;
    this.scene = params.scene
        // this.renderer;
        // this.animations = {};
        // this.assetsPath = 'assets/';

    this.remotePlayers = {};
    // this.remoteColliders = [];
    // this.initialisingPlayers = [];
    this.remoteData = [];
    this.initialized = false

    // this.messages = { 
    // 	text:[ 
    // 	"Welcome to Digital Blue Foam",
    // 	"GOOD LUCK!"
    // 	],
    // 	index:0
    // }

    // this.container = document.createElement( 'div' );
    // this.container.style.height = '100%';
    // document.body.appendChild( this.container );

    // const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';

    // const game = this;
    // this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];

    // const options = {
    // 	assets:[
    // 		`${this.assetsPath}images/nx.jpg`,
    // 		`${this.assetsPath}images/px.jpg`,
    // 		`${this.assetsPath}images/ny.jpg`,
    // 		`${this.assetsPath}images/py.jpg`,
    // 		`${this.assetsPath}images/nz.jpg`,
    // 		`${this.assetsPath}images/pz.jpg`
    // 	],
    // 	oncomplete: function(){
    // 		game.init();
    // 	}
    // }

    // this.anims.forEach( function(anim){ options.assets.push(`${game.assetsPath}fbx/anims/${anim}.fbx`)});
    // options.assets.push(`${game.assetsPath}fbx/town.fbx`);

    // this.mode = this.modes.PRELOAD;

    // this.clock = new THREE.Clock();

    // const preloader = new Preloader(options);

    // window.onError = function(error){
    // 	console.error(JSON.stringify(error));
    // }



}

Game.init.prototype = Game.prototype

export default Game