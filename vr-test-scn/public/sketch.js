 import {VRButton} from './js/VRButton.js'


var camera, scene, renderer

init()



var roomGeometry = new THREE.BoxGeometry(5, 3, 5)
var material = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide })

var roomMaterials =
    [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/01.jpeg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/02.jpeg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({color:'black', side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({color:'black', side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/03.jpeg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/04.jpeg'), side: THREE.DoubleSide })
    ]


var roomCube = new THREE.Mesh(roomGeometry, roomMaterials)
scene.add(roomCube)
roomCube.position.set(0, 1, 0)

var ambientLight = new THREE.AmbientLight('white', 3)
scene.add(ambientLight)


var update = function ()
{

}


renderer.setAnimationLoop(function ()
{
    renderer.render(scene, camera)
})


function init() {
    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.xr.enabled = true

    document.body.appendChild(renderer.domElement)
    document.body.appendChild(VRButton.createButton(renderer))

    setCamera()

    window.addEventListener('resize', onWindowResize, false)
}


function setCamera()
{
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) 
    camera.position.set(0, 0, 0)
}

function onWindowResize()
{
    var width = window.innerWidth
    var height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}
