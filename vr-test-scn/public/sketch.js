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

    addSky()
    //addGrabbableStuff()
    let meshes =  generateProceduralCity()

    meshes.forEach(mesh=>scene.add(mesh))

    setControls()

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

function addSky()
{
    var skyRoomGeometry = new THREE.BoxGeometry(1000, 1000, 1000)
    //var material = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide })

    var skyMaterials =
        [
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/3.png'), side: THREE.DoubleSide }),//right  3
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/1.png'), side: THREE.DoubleSide }),//left 1
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/top.png'), side: THREE.DoubleSide }), //top
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/white.png'), side: THREE.DoubleSide }), //bottom
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/2.png'), side: THREE.DoubleSide }),//front 2
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/4.png'), side: THREE.DoubleSide })//back 4
        ]


    var skyRoomCube = new THREE.Mesh(skyRoomGeometry, skyMaterials)
    scene.add(skyRoomCube)
    skyRoomCube.position.set(0, 1, 0)


}

function geometry4Test()
{
    var obj1 = new THREE.BoxGeometry(1, 1, 1)
    var objMat = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })

    var objMesh = new THREE.Mesh(obj1, objMat)

    scene.add(objMesh)
    objMesh.position.set(0, 0, -6)
}

function addGrabbableStuff()
{
    


    
}

function generateProceduralCity()
{
    //var testBox = new THREE.BoxGeometry(1, 1, 1)
    //var boxMaterial = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide })
    //var boxGeo = new THREE.Mesh(testBox, boxMaterial)

    //testBox.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0.5,0))



    //scene.add(boxGeo)



    //boxGeo.position.set(0,0,-4)

    var city = new THREEx.ProceduralCity
    scene.add(city)
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



    controller2 = renderer.xr.getController(1)
    controller2.addEventListener('selectstart', onSelectStart)
    controller2.addEventListener('selectend', onSelectEnd)

    controller2.addEventListener('connected', function (event) {
        this.add(buildController(event.data))

    })

    controller2.addEventListener('disconnected', function () {
        this.remove(this.children[0])
    })

    scene.add(controller2)


    const controllerModelFactory = new XRControllerModelFactory()

    controllerGrip1 = renderer.xr.getControllerGrip(0)

    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
    scene.add(controllerGrip1)

    controllerGrip2 = renderer.xr.getControllerGrip(1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
    scene.add(controllerGrip2)

}

function onSelectStart()
{
    this.userData.isSelecting = true;
}

function onSelectEnd()
{
    this.userData.isSelecting = false;
}

function buildController(data)
{
    let geometry, material

    switch (data.targetRayMode)
    {
        case 'tracked-pointer':
            geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
            geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))

            material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending })


            return new THREE.Line(geometry, material);

        case 'gaze':
            geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
            material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true })
            return new THREE.Mesh(geometry, material)
    }

}
    