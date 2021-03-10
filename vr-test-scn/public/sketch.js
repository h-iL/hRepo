import { VRButton } from './js/VRButton.js'
import { XRControllerModelFactory } from './jsm//webxr/XRControllerModelFactory.js'


var camera, scene, renderer
var controller1, controller2
var controllerGrip1, controllerGrip2

init()
animate()

var update = function ()
{
    
}

function init() {
    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.xr.enabled = true

    document.body.appendChild(renderer.domElement)
    document.body.appendChild(VRButton.createButton(renderer))

    setCamera()

    setLight()

    var controls = new THREE.OrbitControls(camera, renderer.domElement)

    addStuff()

    window.addEventListener('resize', onWindowResize, false)
}


function setCamera()
{
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) 
    camera.position.set(0, 0, 0)
}

function setLight()
{
    var ambientLight = new THREE.AmbientLight('white', 3)
    scene.add(ambientLight)
}

function onWindowResize()
{
    var width = window.innerWidth
    var height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function animate()
{
    renderer.setAnimationLoop(function ()
    {
        renderer.render(scene, camera)
    })

}

function addStuff()
{
    var roomGeometry = new THREE.BoxGeometry(5, 3, 5)
    var material = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide })

    var roomMaterials =
        [
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/01.jpeg'), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/02.jpeg'), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/03.jpeg'), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/04.jpeg'), side: THREE.DoubleSide })
        ]


    var roomCube = new THREE.Mesh(roomGeometry, roomMaterials)
    scene.add(roomCube)
    roomCube.position.set(0, 1, 0)


    var cube2 = new THREE.Mesh(roomGeometry, roomMaterials)
    scene.add(cube2)
    cube2.position.set(1,0,0)
}

function setControls()
{
    controller1 = renderer.xr.getController(0)
    controller1.addEventListener('selectstart', onSelectStart)
    controller1.addEventListener('selectend', onSelectEnd)

    controller1.addEventListener('connected', function (event)
    {
        this.add(buildController(event.data))

    })

    controller1.addEventListener('disconnected', function ()
    {
        this.remove(this.children[0])
    })

    scene.add(controller1)

}

function onSelectStart()
{
    this.userData.isSelecting = true;
}

function onSelectEnd()
{
    this.userData.isSelecting = false;
}
    