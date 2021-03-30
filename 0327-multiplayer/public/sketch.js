console.log('sketch.js')

// import * as THREE from './build/three.module.js';

// import * as THREE from './jsm/three.module.js';
// import { OrbitControls } as THREE.OrbitControls from './jsm/OrbitControls.js';
import {
    TransformControls
} from './jsm/TransformControls.js';


import {
    textureBlock,
    updateTexture
} from "./javascripts/dbf-proc-tex.js"
import Sun from './javascripts/sun/dbf-sun.js'
import Game from './javascripts/game/game.js'
import {
    getRandomName,
    getRandomAnimal,
    getRandomColour,
    colourNameToHex
} from './javascripts/name-generator/name-generator.js'


var container;
var camera, scene, renderer;
var pointLight;
var reflectionCube
var refractionCube
var buildingElements = null
var clock = new THREE.Clock();
var controls
var socket
var player
var raycaster
var control

var INTERSECTED2 

var objects = []


let INTERSECTED;
let theta = 0;
const mouse = new THREE.Vector2();
const radius = 100;


// multi player variables 
var localPlayer
var globalPlayer

// paper stuff 
let paperMesh
let paintmode = false
var p5js

let lighting
let game



const geometry = new THREE.ConeGeometry(10, 50, 32);
const material = new THREE.MeshBasicMaterial({
    color: 0xff00ff
});
const pencil = new THREE.Mesh(geometry, material);
pencil.rotateX(-Math.PI);



init()
animate()






function init() {






    initTHREE()

    game = Game({
        scene: scene,
        reflectionCube: refractionCube,
        refractionCube: reflectionCube
    })

    addModel()
    initPaper()
    initPlayer(game)

    // initGlobalPlayer()
    // initLocalPlayer()
}


function initGlobalPlayer() {



}


function initPlayer(game) {

    let colour = getRandomColour()
    let name = colour + getRandomAnimal()

    player = {

        id: null,
        colour: colourNameToHex(colour),
        // colour: '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'),
        model: null,
        name: name,
        position: controls.object.position,
        rotation: {
            x: null,
            y: null
        },
        target: null,
    }

    game.player = player
        // initialize socket io 

    socket = initSocket(io())


    var cubeMaterial1 = new THREE.MeshLambertMaterial({

        color: 0xffffff,
        envMap: reflectionCube

    })

    const objLoader = new THREE.OBJLoader();

    objLoader.setPath('obj/walt/')
    objLoader.load('WaltHead.obj', function(object) {

        game.avatar = object.children[0];
        game.avatar.scale.multiplyScalar(1);
        game.avatar.material = cubeMaterial1;

        console.log('avatar ready!')

        // scene.add(globalPlayer);
        socket.emit('init', player)


    })


}

function initSocket(socket) {


    socket.on('setId', function(data) {

        console.log('set id:', data.id)
        player.id = data.id

        console.log('initalize game!')

        game.addUserTag(player.colour, data.id, player.name + ' (You)')
        game.initialized = true

    })

    socket.on('deletePlayer', function(data) {

        // console.log('delete player:', data.id)



        // delete  game.remotePlayers[data.id];  // or delete person["age"];
        scene.remove(game.remotePlayers[data.id])

        let id = "#" + data.id
        $(id).remove();



        // game.remotePlayers = game.remotePlayers.filter((player => player.id != data.id))

    })


    socket.on('updateAsset', function(data) {

        let o = objects[data.id]

        o.position.x = data.x
        o.position.y = data.y
        o.position.z = data.z

    })

    socket.on('update paper', function(data) {

        paintPaper(data)

    })


    socket.on('toggle pencil', function(bool) {

        console.log('togglePencil: ', bool)

        paintmode = bool
        controls.enabled = bool
        togglePencil(paintmode)

    })

    socket.on('remoteData', function(data) {

        game.remoteData = data


    })

    // player.socket = socket 


    //     const player = this;
    // const socket = io.connect();
    // socket.on('setId', function(data){
    //     player.id = data.id;
    // });
    // socket.on('remoteData', function(data){
    //     game.remoteData = data;
    // });
    // socket.on('deletePlayer', function(data){
    //     const players = game.remotePlayers.filter(function(player){
    //         if (player.id == data.id){
    //             return player;
    //         }
    //     });
    //     if (players.length>0){
    //         let index = game.remotePlayers.indexOf(players[0]);
    //         if (index!=-1){
    //             game.remotePlayers.splice( index, 1 );
    //             game.scene.remove(players[0].object);
    //         }
    //     }else{
    //         index = game.initialisingPlayers.indexOf(data.id);
    //         if (index!=-1){
    //             const player = game.initialisingPlayers[index];
    //             player.deleted = true;
    //             game.initialisingPlayers.splice(index, 1);
    //         }
    //     }
    // });

    // socket.on('chat message', function(data){
    //     document.getElementById('chat').style.bottom = '0px';
    //     const player = game.getRemotePlayerById(data.id);
    //     game.speechBubble.player = player;
    //     game.chatSocketId = player.id;
    //     game.activeCamera = game.cameras.chat;
    //     game.speechBubble.update(data.message);
    // });

    return socket

}


function updateLocal() {

}

function updateGlobal() {

    player.rotation.x = controls.getAzimuthalAngle()
    player.rotation.y = controls.getPolarAngle()
    player.target = camera.getWorldDirection(new THREE.Vector3(0, 0, 0));

    // camera.getWorldQuaternion( quaternion );
    player.position = controls.object.position
    socket.emit('update', player)

    // globalPlayer.geometry.postion.set(100,100,100)


}



function initTHREE() {

    setEnvironmentMap()
    setRenderer()
    setScene()
    setCamera()
    setControls()
    setLights()
    initPlane() // make an invisible plane for shadows 
    setEvents()
    addPickingBoxes()
    setRaycaster()


    control = initTransformControl(scene)
}

function setRaycaster() {

    raycaster = new THREE.Raycaster();

}


function setEvents() {
    // body...
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
    document.body.onkeyup = function(e) {
        if (e.keyCode == 32) {
            //your code
            console.log('hi')
            updateTexture({
                meshes: buildingElements.envelope
            })
        }
    }
}


function setRenderer() {

    container = document.createElement('div');
    document.body.appendChild(container);
    //renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.VSMShadowMap; // default THREE.PCFShadowMap  THREE.VSMShadowMap PCFSoftShadowMap
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap  THREE.VSMShadowMap PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);


}



function setControls() {


    // controls = new OrbitControls(camera, renderer.domElement);

    // orbit.addEventListener('change', render);


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.addEventListener('change', updateGlobal)


}

function addModel() {

    buildingElements = textureBlock({
        solution: sampleSoln,
        reflection: reflectionCube,
        refraction: refractionCube
    })
    buildingElements.slabs.forEach(mesh => scene.add(mesh))
    buildingElements.envelope.forEach(mesh => scene.add(mesh))


        buildingElements.slabs.forEach(mesh => {
                mesh.sid = objects.length
            objects.push(mesh)

        })
    buildingElements.envelope.forEach(mesh => {

        mesh.sid = objects.length

         objects.push(mesh)


    })


}


function setCamera() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.x = 200
    camera.position.y = 200
    camera.position.z = 200
    camera.target = new THREE.Vector3(0, 0, 0)
}


function setScene() {


    scene = new THREE.Scene();
    scene.background = reflectionCube
    scene.fog = new THREE.Fog(scene.background, 3500, 15000);


}


function setEnvironmentMap() {

    reflectionCube = setCubeMap()
    refractionCube = setCubeMap()

    function setCubeMap() {
        //cubemap
        var path = 'textures/cube/clouds/';
        var format = '.png';

        var urls = ['textures/cube/clouds/2.png', 'textures/cube/clouds/4.png', 'textures/cube/clouds/top.png', 'textures/cube/clouds/white.png',
            'textures/cube/clouds/1.png', 'textures/cube/clouds/3.png'
        ];

        return new THREE.CubeTextureLoader().load(urls);

    }

}

function addPickingBoxes() {

    const geometry = new THREE.BoxBufferGeometry(20, 20, 20);

    for (var x = -2; x < 2; x++) {
        for (var y = -2; y < 2; y++) {
            for (var z = -2; z < 2; z++) {

                let red = Math.floor((x + 3) / 6 * 255)
                let green = Math.floor((y + 3) / 6 * 255)
                let blue = Math.floor((z + 3) / 6 * 255)

                console.log(red, green, blue)

                // let col = 'rgb('+ red + ',' + greed ',' + blue + ')'

                let col = 'rgb(' + red + ',' + green + ',' + blue + ')'


                const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                    color: col
                }));


                object.position.x = x * 50
                object.position.y = y * 50
                object.position.z = z * 50


                scene.add(object)

                objects.push(object)

                object.sid = objects.length

            }
        }
    }

    // for (let i = 0; i < 100; i++) {

    //     const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
    //         color: Math.random() * 0xffffff
    //     }));

    //     object.position.x = Math.random() * 200 - 100;
    //     object.position.y = Math.random() * 200 - 100;
    //     object.position.z = Math.random() * 200 - 100;

    //     object.rotation.x = Math.random() * 2 * Math.PI;
    //     object.rotation.y = Math.random() * 2 * Math.PI;
    //     object.rotation.z = Math.random() * 2 * Math.PI;

    //     object.scale.x = Math.random() + 0.5;
    //     object.scale.y = Math.random() + 0.5;
    //     object.scale.z = Math.random() + 0.5;


    // }

}





function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function animate() {

    // const dt = this.clock.getDelta();  
    let dt = null
    game.updateRemotePlayers(dt)

    selectionHover()

    // raycast()
    requestAnimationFrame(animate);
    render();

}

function render() {
    var delta = clock.getDelta();
    // controls.update(delta);
    renderer.render(scene, camera);

}

function initPlane() {

    var planeGeometry = new THREE.PlaneGeometry(500, 500);
    planeGeometry.rotateX(-Math.PI / 2);

    var planeMaterial = new THREE.ShadowMaterial();
    planeMaterial.opacity = 0.3;

    let plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.y = -0.5;
    plane.receiveShadow = true;

    scene.add(plane)

}

function setLights(argument) {

    let sun = Sun(scene)

    scene.add(sun.getLight())
        // let mesh = sun.getMesh()
        // scene.add(mesh)
        // scene.add(sun.getMesh())

    var ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    /*var sun = setSunlight()
    scene.add(sun);*/

}



function loadSampleSite() {

    const siteBorder = JSON.parse('[[-52.38009712839171,0,-57.572181531831134],[-55.78941815186939,0,44.83860224468809],[-47.89056310142493,0,53.081648578593786],[53.770388009299744,0,57.595581127132164],[55.78941815186939,0,-57.595581127132164]]')

    let pGeom = new THREE.Geometry()

    for (const pt of siteBorder) {
        pGeom.vertices.push(new THREE.Vector3(
            pt[0], 0, pt[2]
        ))
    }

    const siteBorderLine = new THREE.LineLoop(pGeom, new THREE.LineBasicMaterial({
        color: 0x01091F,
        transparent: !0,
        opacity: 0.5,
        linewidth: 100,
    }))
    console.log('siteBorderLine:: ', siteBorderLine)
    scene.add(siteBorderLine)

    const constraintMesh = JSON.parse('[[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-62.050228118896484,59.287635803222656,-0.14100000262260437],[62.050228118896484,59.009254455566406,-0.14100000262260437]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[62.050228118896484,59.009254455566406,-0.14100000262260437],[58.75368118286133,-41.94188690185547,-0.14100000262260437]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[58.75368118286133,-41.94188690185547,-0.14100000262260437],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[43.0016975402832,-59.287635803222656,-0.14100000262260437],[-54.99468994140625,-57.11777877807617,-0.14100000262260437]],[[-58.50157928466797,-21.936792373657227,28.718210220336914],[-57.82185363769531,-52.993804931640625,28.3713321685791],[-55.86619567871094,-54.07796096801758,31.25587272644043]],[[-58.50157928466797,-21.936792373657227,28.718210220336914],[-55.86619567871094,-54.07796096801758,31.25587272644043],[-53.78293991088867,-52.164833068847656,34.463558197021484]],[[-58.50157928466797,-21.936792373657227,28.718210220336914],[-53.78293991088867,-52.164833068847656,34.463558197021484],[-54.50519943237305,-22.106916427612305,34.702720642089844]],[[-54.462669372558594,-21.107820510864258,20.569435119628906],[-58.459049224853516,-20.93769645690918,14.584925651550293],[-58.50157928466797,-21.936792373657227,28.718210220336914]],[[-54.462669372558594,-21.107820510864258,20.569435119628906],[-58.50157928466797,-21.936792373657227,28.718210220336914],[-54.50519943237305,-22.106916427612305,34.702720642089844]],[[-57.09728240966797,58.07588195800781,20.102073669433594],[-61.09366226196289,58.246009826660156,14.11756420135498],[-58.459049224853516,-20.93769645690918,14.584925651550293]],[[-57.09728240966797,58.07588195800781,20.102073669433594],[-58.459049224853516,-20.93769645690918,14.584925651550293],[-54.462669372558594,-21.107820510864258,20.569435119628906]],[[53.58808517456055,-45.72561264038086,51.82698440551758],[57.75458908081055,-41.899356842041016,45.82698440551758],[61.752506256103516,52.015586853027344,45.82698440551758]],[[53.58808517456055,-45.72561264038086,51.82698440551758],[61.752506256103516,52.015586853027344,45.82698440551758],[57.628536224365234,49.18843078613281,51.82698440551758]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[-52.78384780883789,-52.20736312866211,51.981346130371094],[-51.91234588623047,-55.2471809387207,47.4399528503418]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[-51.91234588623047,-55.2471809387207,47.4399528503418],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[62.007694244384766,58.010162353515625,32.758811950683594],[57.628536224365234,49.18843078613281,51.82698440551758],[61.752506256103516,52.015586853027344,45.82698440551758]],[[57.628536224365234,49.18843078613281,51.82698440551758],[62.007694244384766,58.010162353515625,32.758811950683594],[-55.099090576171875,57.990821838378906,32.848384857177734]],[[-55.099090576171875,57.990821838378906,32.848384857177734],[-53.952293395996094,-9.118680953979492,199.85899353027344],[57.628536224365234,49.18843078613281,51.82698440551758]],[[-53.952293395996094,-9.118680953979492,199.85899353027344],[54.16263961791992,-8.716562271118164,199.578369140625],[57.628536224365234,49.18843078613281,51.82698440551758]],[[-52.74131393432617,-51.20826721191406,199.85899353027344],[48.29488754272461,-52.506622314453125,199.85899353027344],[-53.952293395996094,-9.118680953979492,199.85899353027344]],[[54.16263961791992,-8.716562271118164,199.578369140625],[-53.952293395996094,-9.118680953979492,199.85899353027344],[48.29488754272461,-52.506622314453125,199.85899353027344]],[[52.50392532348633,-47.681270599365234,199.85899353027344],[54.16263961791992,-8.716562271118164,199.578369140625],[48.29488754272461,-52.506622314453125,199.85899353027344]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[48.29488754272461,-52.506622314453125,199.85899353027344],[-52.74131393432617,-51.20826721191406,199.85899353027344]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[-52.74131393432617,-51.20826721191406,199.85899353027344],[-52.78384780883789,-52.20736312866211,51.981346130371094]],[[-52.78384780883789,-52.20736312866211,51.981346130371094],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-53.78293991088867,-52.164833068847656,34.463558197021484]],[[-52.78384780883789,-52.20736312866211,51.981346130371094],[-52.74131393432617,-51.20826721191406,199.85899353027344],[-53.952293395996094,-9.118680953979492,199.85899353027344]],[[-53.952293395996094,-9.118680953979492,199.85899353027344],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-52.78384780883789,-52.20736312866211,51.981346130371094]],[[-55.099090576171875,57.990821838378906,32.848384857177734],[-57.09728240966797,58.07588195800781,20.102073669433594],[-54.462669372558594,-21.107820510864258,20.569435119628906]],[[-55.099090576171875,57.990821838378906,32.848384857177734],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-53.952293395996094,-9.118680953979492,199.85899353027344]],[[-54.462669372558594,-21.107820510864258,20.569435119628906],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-55.099090576171875,57.990821838378906,32.848384857177734]],[[-62.050228118896484,59.287635803222656,-0.14100000262260437],[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-58.459049224853516,-20.93769645690918,14.584925651550293]],[[-61.09366226196289,58.246009826660156,14.11756420135498],[-62.050228118896484,59.287635803222656,-0.14100000262260437],[-58.459049224853516,-20.93769645690918,14.584925651550293]],[[-58.459049224853516,-20.93769645690918,14.584925651550293],[-57.82185363769531,-52.993804931640625,28.3713321685791],[-58.50157928466797,-21.936792373657227,28.718210220336914]],[[-58.459049224853516,-20.93769645690918,14.584925651550293],[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-57.82185363769531,-52.993804931640625,28.3713321685791]],[[-57.09728240966797,58.07588195800781,20.102073669433594],[-55.099090576171875,57.990821838378906,32.848384857177734],[62.007694244384766,58.010162353515625,32.758811950683594]],[[62.007694244384766,58.010162353515625,32.758811950683594],[62.050228118896484,59.009254455566406,-0.14100000262260437],[-57.09728240966797,58.07588195800781,20.102073669433594]],[[-62.050228118896484,59.287635803222656,-0.14100000262260437],[-57.09728240966797,58.07588195800781,20.102073669433594],[62.050228118896484,59.009254455566406,-0.14100000262260437]],[[-61.09366226196289,58.246009826660156,14.11756420135498],[-57.09728240966797,58.07588195800781,20.102073669433594],[-62.050228118896484,59.287635803222656,-0.14100000262260437]],[[54.16263961791992,-8.716562271118164,199.578369140625],[53.58808517456055,-45.72561264038086,51.82698440551758],[57.628536224365234,49.18843078613281,51.82698440551758]],[[54.16263961791992,-8.716562271118164,199.578369140625],[52.50392532348633,-47.681270599365234,199.85899353027344],[53.58808517456055,-45.72561264038086,51.82698440551758]],[[52.50392532348633,-47.681270599365234,199.85899353027344],[46.25416946411133,-53.420658111572266,52.19639587402344],[53.58808517456055,-45.72561264038086,51.82698440551758]],[[52.50392532348633,-47.681270599365234,199.85899353027344],[48.29488754272461,-52.506622314453125,199.85899353027344],[46.25416946411133,-53.420658111572266,52.19639587402344]],[[62.007694244384766,58.010162353515625,32.758811950683594],[58.75368118286133,-41.94188690185547,-0.14100000262260437],[62.050228118896484,59.009254455566406,-0.14100000262260437]],[[58.75368118286133,-41.94188690185547,-0.14100000262260437],[61.752506256103516,52.015586853027344,45.82698440551758],[57.75458908081055,-41.899356842041016,45.82698440551758]],[[62.007694244384766,58.010162353515625,32.758811950683594],[61.752506256103516,52.015586853027344,45.82698440551758],[58.75368118286133,-41.94188690185547,-0.14100000262260437]],[[42.04513168334961,-58.246009826660156,44.8725700378418],[53.58808517456055,-45.72561264038086,51.82698440551758],[46.25416946411133,-53.420658111572266,52.19639587402344]],[[58.75368118286133,-41.94188690185547,-0.14100000262260437],[42.04513168334961,-58.246009826660156,44.8725700378418],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[57.75458908081055,-41.899356842041016,45.82698440551758],[53.58808517456055,-45.72561264038086,51.82698440551758],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[58.75368118286133,-41.94188690185547,-0.14100000262260437],[57.75458908081055,-41.899356842041016,45.82698440551758],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[-54.9521598815918,-56.118682861328125,28.659866333007812],[-54.99468994140625,-57.11777877807617,-0.14100000262260437],[-51.95487594604492,-56.24627685546875,28.530075073242188]],[[-51.95487594604492,-56.24627685546875,28.530075073242188],[-54.99468994140625,-57.11777877807617,-0.14100000262260437],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[42.04513168334961,-58.246009826660156,44.8725700378418],[-51.95487594604492,-56.24627685546875,28.530075073242188],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[-51.91234588623047,-55.2471809387207,47.4399528503418],[-51.95487594604492,-56.24627685546875,28.530075073242188],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[-52.78384780883789,-52.20736312866211,51.981346130371094],[-53.78293991088867,-52.164833068847656,34.463558197021484],[-51.91234588623047,-55.2471809387207,47.4399528503418]],[[-53.78293991088867,-52.164833068847656,34.463558197021484],[-51.95487594604492,-56.24627685546875,28.530075073242188],[-51.91234588623047,-55.2471809387207,47.4399528503418]],[[-51.95487594604492,-56.24627685546875,28.530075073242188],[-53.78293991088867,-52.164833068847656,34.463558197021484],[-55.86619567871094,-54.07796096801758,31.25587272644043]],[[-55.86619567871094,-54.07796096801758,31.25587272644043],[-54.9521598815918,-56.118682861328125,28.659866333007812],[-51.95487594604492,-56.24627685546875,28.530075073242188]],[[-54.9521598815918,-56.118682861328125,28.659866333007812],[-57.82185363769531,-52.993804931640625,28.3713321685791],[-54.99468994140625,-57.11777877807617,-0.14100000262260437]],[[-57.82185363769531,-52.993804931640625,28.3713321685791],[-54.9521598815918,-56.118682861328125,28.659866333007812],[-55.86619567871094,-54.07796096801758,31.25587272644043]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-54.99468994140625,-57.11777877807617,-0.14100000262260437],[-57.82185363769531,-52.993804931640625,28.3713321685791]]]')

}

function initPaper() {

    raycaster = new THREE.Raycaster()
    p5js = new p5(createTexturePainter, 'paper')
    var x = document.getElementById("paper");
    x.style.display = "none";

    const geometry = new THREE.PlaneGeometry(512, 512, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    paperMesh = new THREE.Mesh(geometry, material);
    paperMesh.material.needsUpdate = true;
    paperMesh.rotateX(-Math.PI / 2)





}



function raycast() {


    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);



    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            console.log(intersects[0].object)

            // if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);



            INTERSECTED = intersects[0].object;

            scene.remove(INTERSECTED)
                // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                // INTERSECTED.material.color =0xff0000;

        }

        // } else {

        //     if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        //     INTERSECTED = null;

    }
}


function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}



function createTexturePainter(p) {

    p.col = [p.random(255), p.random(255), p.random(255)]

    p.setup = function() {

        let myCanvas = p.createCanvas(512, 512)
            // p.background(255)


    }

    p.draw = function() {

    }

    p.paint = function(x, y, r, g, b) {

        p.fill(r, g, b, 10)
        p.noStroke()

        for (var i = 0; i < 10; i += 5) {

            p.circle(x, y, i)
        }

    }

    return p;
}

function getMousePosition() {

    const pos = {}

    let screen_posX = event.clientX
    let screen_posY = event.clientY

    pos.x = ((screen_posX - renderer.domElement.offsetLeft) / window.innerWidth) * 2 - 1
    pos.y = -((screen_posY - renderer.domElement.offsetTop) / window.innerHeight) * 2 + 1

    return pos

}



$(document).mousemove(function(e) {

    if (!paintmode) {
        return
    }
    if (e.target.nodeName != "CANVAS") {
        return;
    }

    const pos = raycast()
    if (pos) {

        let stroke = {

            pos: pos,
            col: p5js.col,
        }

        paintPaper(stroke)
        socket.emit('updateDraw', stroke)

    }

})

function paintPaper(stroke) {

    p5js.paint(stroke.pos.x + 250, stroke.pos.z + 250, stroke.col[0], stroke.col[1], stroke.col[2])

    pencil.position.set(stroke.pos.x, 15, stroke.pos.z)

    paperMesh.material.map = new THREE.CanvasTexture(p5js.canvas)
    paperMesh.material.needsUpdate = true

}

$('#toggle-paint').click(() => {

    paintmode = !paintmode
        // controls.enabled = !paintmode
    togglePencil(paintmode)
    socket.emit('toggle pencil', paintmode)



})

function togglePencil(bool) {

    if (bool) {
        scene.add(pencil)
    } else {
        scene.remove(pencil)
    }

}



function selectionHover() {

    raycaster.setFromCamera(mouse, camera);

    // const intersects = raycaster.intersectObjects(scene.children);

    const intersects = raycaster.intersectObjects(objects);

    //

    if (intersects.length > 0) {

        // if new object hovered 

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) {

                // old mesh 

                INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                control.detach(INTERSECTED)

            }

            // new mesh

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);

            control.attach(INTERSECTED)

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;

    }

}






function initTransformControl(scene) {


    console.log('init TransformControls')

    let newControl = new TransformControls(camera, renderer.domElement);
    newControl.addEventListener('change', function(event) {

        // console.log('transform changed..', INTERSECTED)

        if (INTERSECTED) {


            // console.log(INTERSECTED.sid)

            let hi = objects[INTERSECTED.sid - 1]

            // console.log(hi.position)

        }




        // object.id = objects.length


    });

    newControl.addEventListener('objectChange', function(event) {


        console.log('objectChange')

        if (control.object){

            let o = control.object 

            let data = {

                id: o.sid,
                x: o.position.x, 
                y: o.position.y, 
                z: o.position.z 

            }

            console.log(data)

            socket.emit('updateAsset', data )

        }



    });

    newControl.addEventListener('dragging-changed', function(event) {

        controls.enabled = !event.value;

        console.log('dragging-changed!', INTERSECTED)

    });

    scene.add(newControl);



    return newControl
}


function updateTransformControl(mesh) {

    console.log()

    control.attach(mesh);
    // control.detach(mesh)
}



/*




let container
let camera, scene, raycaster;
let renderer, control, orbit;

let INTERSECTED;
let theta = 0;

const mouse = new THREE.Vector2();
const radius = 100;


let objects = []

init();
animate();


function createMesh() {

    // add a mesh to scene at a random position 

    const geometry = new THREE.BoxBufferGeometry(50, 50, 50);


    const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
    }));



    mesh.position.x = Math.random() * 250 - 500
    mesh.position.y = Math.random() * 250 - 500
    mesh.position.z = Math.random() * 250 - 500


    return mesh

}

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    const aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);

    camera.position.set(500, 250, 500);
    camera.lookAt(0, 0, 0);




    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const geometry = new THREE.BoxBufferGeometry(20, 20, 20);

    for (let i = 0; i < 100; i++) {


        let object = createMesh()
        objects.push(object)

        scene.add(object);

    }

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);



    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);


    control = initTransformControl(scene)
    // updateTransformControl(currentObject)

    // scene.add(new THREE.GridHelper(1000, 10, 0x888888, 0x444444));


    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('mouseup', selectionClick);

    //

    window.addEventListener('resize', onWindowResize, false);

}


function selectionClick(){

console.log('hi')

}

// function selectionClick(){


//  console.log('selection lcick')


//     // raycaster.setFromCamera(mouse, camera);

//     // // const intersects = raycaster.intersectObjects(scene.children);

//     // const intersects = raycaster.intersectObjects(objects);

//     // if (intersects.length > 0) {

//     //     if (INTERSECTED != intersects[0].object) {

//     //         if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

//     //         INTERSECTED = intersects[0].object;
//     //         INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
//     //         INTERSECTED.material.setHex(0x000000);

//     //     }

//     // } else {

//     //     if (INTERSECTED) INTERSECTED.material.setHex(INTERSECTED.currentHex);

//     //     INTERSECTED = null;

//     // }

// }

function selectionHover(){

    raycaster.setFromCamera(mouse, camera);

    // const intersects = raycaster.intersectObjects(scene.children);

    const intersects = raycaster.intersectObjects(objects);

    //

    if (intersects.length > 0) {

        // if new object hovered 

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) { 

                // old mesh 

                INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                control.detach(INTERSECTED)

            } 

            // new mesh

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);

            control.attach(INTERSECTED)

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;

    }

}




function initTransformControl(scene) {

    let newControl = new TransformControls(camera, renderer.domElement);
    newControl.addEventListener('change', render);

    newControl.addEventListener('dragging-changed', function(event) {

        orbit.enabled = !event.value;

    });

    scene.add(newControl);



    return newControl
}


function updateTransformControl(mesh) {

    console.log()

    control.attach(mesh);
    // control.detach(mesh)
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

//

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    // theta += 0.1;

    // camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    // camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    // camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
    // camera.lookAt( scene.position );

    // camera.updateMatrixWorld();

    // find intersections

    selectionHover()

    renderer.render(scene, camera);

}





*/