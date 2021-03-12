import { BoxGeometry, BufferAttribute } from './build/three.module.js'
import { VRButton } from './js/VRButton.js'
import { XRControllerModelFactory } from './jsm//webxr/XRControllerModelFactory.js'
import { BoxLineGeometry } from './jsm/geometries/BoxLineGeometry.js'
import { textureBlock } from "./jsm/dbf-proc-tex.js"



var camera, scene, renderer
var controller1, controller2
var controllerGrip1, controllerGrip2
let group
let group2
let raycaster 



const intersected = []
const tempMatrix = new THREE.Matrix4()


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

    addSky()
    //addGrabbableStuff()
    addTextureBuilding()

    setControls()

    window.addEventListener('resize', onWindowResize, false)
}


function addTextureBuilding()
{
    
    var meshes = textureBlock({ solution: sampleSoln, reflection: null, refraction: null })
    meshes.forEach(mesh => scene.add(mesh))


}

function setCamera()
{
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) 
    camera.position.set(0, 0, 0)

    //dolly = new THREE.Object3D()
    //dolly.add(camera)
    //scene.add(dolly)

    //dummyCam = new THREE.Object3D()
    //camera.add(dummyCam)

}

function setLight()
{       
    scene.add(new THREE.HemisphereLight(0x808080, 0x110E3D, 2.5))






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
    renderer.setAnimationLoop(render)

}

function render()
{
    cleanIntersected()
    



    renderer.render(scene, camera)
}
    
function addSky()
{
    var skyRoomGeometry = new THREE.BoxGeometry(1000, 1000, 1000)

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

function addGrabbableStuff()
{    
    group = new THREE.Group()

    scene.add(group)

    const geometries =
        [
            new THREE.BoxGeometry(1, 1, 1),

            //new THREE.CylinderGeometry(1, 1, 1, 64)
        ]

    for (let i = 0; i < 30; i++)
    {
        const geo = geometries[Math.floor(Math.random() * geometries.length)]
        const mat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.7, metalness: 0.1 })

        const object = new THREE.Mesh(geo, mat)
        object.position.x = Math.floor(Math.random() * 100 - 50) * 5
        //object.position.y = Math.floor(Math.random() * 200 - 100) * 10
        object.position.z = Math.floor(Math.random() * 100 - 50) * 5

        object.scale.setScalar(Math.random()+30)

        object.castShadow = true
        object.receiveShadow = true

        group.add(object)
    }

    
}

function generateProceduralCity()
{
    let meshes = new THREEx.ProceduralCity

    console.log(meshes)

    meshes.forEach(mesh => scene.add(mesh))
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

    //


    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 15;

    controller1.add(line.clone());
    controller2.add(line.clone());

    raycaster = new THREE.Raycaster();

    //
    

}

//function handleController(controller, dt)
//{
//    if (controller1.userData.selectPressed)
//    {
//        const speed = 2
//        const quaternion = dolly.quaternion.clone()
//        dolly.quaternion.copy(dummyCam.getWorldQuaternion())
//        dolly.translateZ(-dt * speed)
//        dolly.position.y = 0
//        dolly.quaternion.copy(quaternion)

//    }
//}


function onSelectStart(event)
{
    const controller = event.target;

    const intersections = getIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.b = 1;

        controller.attach(object);

        controller.userData.selected = object;

    }

}

function onSelectEnd(event)
{
    const controller = event.target;

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;

        //group for grabbable
        group.attach(object);

        controller.userData.selected = undefined;

    }

}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    //group for grabbable
    return raycaster.intersectObjects(group.children);

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

function cleanIntersected()
{
    while (intersected.length)
    {
        const object = intersected.pop()
        object.material.emmisive.r = 0

    }
}





