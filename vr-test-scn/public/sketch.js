import { BoxGeometry, BufferAttribute, BufferGeometry, LineBasicMaterial, TextureLoader } from './build/three.module.js'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'
import { FBXLoader } from './jsm/loaders/FBXLoader.js'

import { VRButton } from './js/VRButton.js'
import { XRControllerModelFactory } from './jsm//webxr/XRControllerModelFactory.js'
import { BoxLineGeometry } from './jsm/geometries/BoxLineGeometry.js'
//import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js"
import {
    textureBlock,
    updateTexture
} from "./jsm/dbf-proc-tex.js"

import Sun from './javascripts/dbf-sun.js'
import { Lensflare, LensflareElement } from './jsm/objects/Lensflare.js'
import { Reflector } from './jsm/objects/Reflector.js'
import { TubePainter } from './jsm/misc/TubePainter.js'



var container
var camera, scene, renderer
var controller1, controller2
var controllerGrip1, controllerGrip2

var group
var raycaster

var buildingElements = null
let reflectionCube = null

var intersected = []
var tempMatrix = new THREE.Matrix4()

var controls
var dolly
var cameraVector = new THREE.Vector3()
const prevGamePads = new Map()
var speedFactor = [1, 1, 1, 1]//0.3

var buttonObjs = []

var UIContainerBlk
let selectState = false

var viewIndex = 0
var storedPositions = []

let reflector

var socket

const cursor = new THREE.Vector3()
const painter1 =new TubePainter()
const painter2 = new TubePainter()


init()
animate()


function init() {

    container = document.createElement("div")
    document.body.appendChild(container)

    scene = new THREE.Scene()

    setCamera()

    controls = new THREE.OrbitControls(camera, container)
    controls.target.set(0, 1.6, 0)
    controls.update()   
    
    setLight()

    initPlane()

    group = new THREE.Group()
    scene.add(group)

    //addGrabbableStuff()
    add3DFiles()
    //addSanta()

  
    addTextureBuilding()
    setCubeMap()
    buildUI()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.xr.enabled = true
    renderer.xr.setFramebufferScaleFactor(2.0)
    container.appendChild(renderer.domElement)
    document.body.appendChild(VRButton.createButton(renderer))


    

    setControls()
    paintVR()

    //view 1 - street
    storedPositions.push(new THREE.Vector3(16, 1.6, 0))
    //view 2 - inside building
    storedPositions.push(new THREE.Vector3(30, 1.6, -10))
    //view 3 - aerial 1
    storedPositions.push(new THREE.Vector3(0, 20, 100))
    //view 4 - aerial 2
    storedPositions.push(new THREE.Vector3(0, 20, -100))
    //view 5 - trees
    storedPositions.push(new THREE.Vector3(-37, 1.6, 0))



    dollySetup()

   


    window.addEventListener('resize', onWindowResize, false)

    socket = io.connect('http://localhost:3000')
    socket.on() //add the event and function here

}

function paintVR()
{
    
    scene.add(painter1.mesh)

    scene.add(painter2.mesh)

    const cylinderGeo = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5)
    cylinderGeo.rotateX(-Math.PI / 2)
    const brushMesh = new THREE.Mesh(cylinderGeo, new THREE.MeshStandardMaterial({ flatShading: true }))
    const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3))
    pivot.name = 'pivot'
    pivot.position.z = -0.05
    brushMesh.add(pivot)
    controller1.add(brushMesh.clone())
    controller2.add(brushMesh.clone())


}

function newPlayer()
{

}

function dollySetup() {
    dolly = new THREE.Group()
    dolly.position.set(16, 1.6, 0)
    dolly.name = "dolly"
    scene.add(dolly)
    dolly.add(camera)
    dolly.add(UIContainerBlk)
    dolly.add(controller1)
    dolly.add(controller2)
    dolly.add(controllerGrip1)
    dolly.add(controllerGrip2)
}

function addTextureBuilding() {

    buildingElements = textureBlock({
        solution: sampleSoln,
        reflection: reflectionCube,
        refraction: reflectionCube
    })


    buildingElements.slabs.forEach(mesh => scene.add(mesh))
    buildingElements.envelope.forEach(mesh => scene.add(mesh))

    //buildingElements.slabs.forEach(mesh => group.add(mesh))
    //buildingElements.envelope.forEach(mesh => group.add(mesh))


}

function setCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 1.6, 1)
}

function setLight() {
    let sun = Sun(scene)

    scene.add(sun.getLight())
   // let mesh = sun.getMesh()
   // scene.add(mesh)
    // scene.add(sun.getMesh())

    var ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    /*var sun = setSunlight()
    scene.add(sun);*/
    //let sun = new THREE.DirectionalLight('0xffffff',200)
    //scene.add(sun)
    //sun.position.set(10,100,10)


    const textureFlare0 = new THREE.TextureLoader().load("./textures/lensflare/lensflare1.png")
    //const textureFlare1 = new THREE.TextureLoader().load("./textures/lensflare/lensflare2.png")
    const textureFlare2 = new THREE.TextureLoader().load("./textures/lensflare/lensflare3.png")
    const lensflare = new Lensflare()
    lensflare.position.set(0, 5, -5)

    lensflare.addElement(new LensflareElement(textureFlare0, 700, 1))
    lensflare.addElement(new LensflareElement(textureFlare2, 60, 0.6))
    lensflare.addElement(new LensflareElement(textureFlare2, 70, 0.7))
    lensflare.addElement(new LensflareElement(textureFlare2, 120, 0.9))
    lensflare.addElement(new LensflareElement(textureFlare2, 70, 0.4))

    scene.add(lensflare)
    ambient.add(lensflare)
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

function onWindowResize() {
    var width = window.innerWidth
    var height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function animate() {

    renderer.setAnimationLoop(render)
}

function render() {
    cleanIntersected()
    ThreeMeshUI.update()

    intersectObjects(controller1)
    intersectObjects(controller2)

    handleController(controller1)
    handleController(controller2)

    dollyMove()
    renderer.render(scene, camera)
    updateButton()
}

function handleController(controller)
{
    const userData = controller.userData
    const painter = userData.painter

    const pivot = controller.getObjectByName('pivot')

    if (userData.isSqueezing == true)
    {
        const delta = (controller.position.y - userData.positionAtSqeezeStart) * 5
        const scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta)
        pivot.scale.setScalar(scale)
        painter.setSize(scale)

    }

    cursor.setFromMatrixPosition(pivot.matrixWorld)

    if (userData.isSelecting == true) {
        painter.lineTo(cursor)
        painter.update()
    }
    else
    {
        painter.moveTo(cursor)
    }
}

function updateButton() {
    let intersect
    setFromController(controller1, raycaster.ray)
    setFromController(controller2, raycaster.ray)

    intersect = raycast()

    if (intersect) {}

    if (intersect && intersect.object.isUI) {
        if (selectState) { intersect.object.setState('selected') } else { intersect.object.setState('hovered') }
    }

    buttonObjs.forEach((obj) => {
        if ((!intersect || obj !== intersect.object) && obj.isUI) {
            obj.setState('idle')
        }

    })
}

function raycast() {
    return buttonObjs.reduce((closestIntersection, obj) => {
        const intersection = raycaster.intersectObject(obj, true)

        if (!intersection[0]) return closestIntersection
        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {
            intersection[0].object = obj

            return intersection[0]
        } else {
            return closestIntersection
        }

    }, null)
}


function buildUI() {

    UIContainerBlk = new ThreeMeshUI.Block({
        justifyContent: 'center',
        alignContent: 'center',
        contentDirection: 'row-reverse',
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.08,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
        backgroundOpacity: 0.2,
        backgroundColor: new THREE.Color('0xffffff')

    })

    //----------------------------------------------------------------------------------//

    //sub block facade selector
    const facadeSelBlock = new ThreeMeshUI.Block({
        width: 0.6,
        height: 0.3,
        margin: 0.01,
        backgroundOpacity: 0.4,
        backgroundColor: new THREE.Color('0xffffff'),
        //padding: 0.2,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',

    })


    facadeSelBlock.position.set(-0.4, 0, 0)

    //texts for facade selector block (facadeSelBlock)
    const title = new ThreeMeshUI.Text({
        content: 'Facade',
        fontSize: 0.06,
        fontColor: new THREE.Color('#2646530')
    })


    title.position.set(0, -0.04, 0)

    facadeSelBlock.add(title)

    const buttonOptions = {
        width: facadeSelBlock.width * 0.3,
        height: facadeSelBlock.height * 0.25,
        justifyContent: 'center',
        alignContent: 'center',
        margin: 0.01,
        borderRadius: 0.025,
        fontSize: 0.04,
        offset: 0.055,
    }

    //button 1 blk
    const buttonPrevBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonPrevBlk.position.set(-0.1, -0.02, 0)
    facadeSelBlock.add(buttonPrevBlk)

    //button 1 text    
    buttonPrevBlk.add(new ThreeMeshUI.Text({ content: 'Previous' }))


    //button 2 blk
    const buttonNextBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonNextBlk.position.set(0.14, -0.02, 0)
    facadeSelBlock.add(buttonNextBlk)

    //button 2 text
    buttonNextBlk.add(new ThreeMeshUI.Text({ content: 'Next' }))

    const loader = new THREE.TextureLoader()
    //loader.load('./assets/button.png', (texture) => { buttonPrevBlk.set({ backgroundTexture: texture }) })
    //loader.load('./assets/button.png', (texture) => { buttonNextBlk.set({ backgroundTexture: texture }) })
    //loader.load('./assets/button.png', (texture) => { facadeSelBlock.set({ backgroundTexture: texture }) })
    //loader.load('./assets/button.png', (texture) => { UIContainerBlk.set({ backgroundTexture: texture }) })    

    const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color('#029DAF'),
            backgroundOpacity: 0.5,
            fontColor: new THREE.Color('0xffffff')
        }
    }

    const idleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color('#029DAF'),
            backgroundOpacity: 0.85,
            fontColor: new THREE.Color('0xffffff')
        }
    }

    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color('0xffffff'),
        fontColor: new THREE.Color('#029DAF')
    }

    buttonPrevBlk.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {
            updateTexture({
                meshes: buildingElements.envelope
            })
        }
    })

    buttonPrevBlk.setupState(hoveredStateAttributes)
    buttonPrevBlk.setupState(idleStateAttributes)

    buttonNextBlk.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {
            updateTexture({
                meshes: buildingElements.envelope
            })
        }
    })

    buttonNextBlk.setupState(hoveredStateAttributes)
    buttonNextBlk.setupState(idleStateAttributes)

    buttonObjs.push(buttonNextBlk, buttonPrevBlk)

    UIContainerBlk.add(facadeSelBlock)

    //-----------------------------------------------------------------------//

    //sub block viewpoint selector

    const viewpointSelBlock = new ThreeMeshUI.Block({
        width: 0.6,
        height: 0.3,
        margin: 0.01,
        backgroundOpacity: 0.4,
        backgroundColor: new THREE.Color('0xffffff')
        //fontFamily: './assets/Roboto-msdf.json',
        //fontTexture: './assets/Roboto-msdf.png',
    })

    viewpointSelBlock.position.set(0.4, 0, 0)

    //texts for facade selector block (facadeSelBlock)
    const title2 = new ThreeMeshUI.Text({
        content: 'Set View',
        fontSize: 0.06,
        fontColor: new THREE.Color('#2646530')
    })
    
    title2.position.set(0, -0.04, 0)

    viewpointSelBlock.add(title2)

    //view 1 blk
    const buttonPrevViewBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonPrevViewBlk.position.set(-0.1, -0.02, 0)
    viewpointSelBlock.add(buttonPrevViewBlk)
    //add text    
    buttonPrevViewBlk.add(new ThreeMeshUI.Text({ content: 'Previous' }))


    //view 2 blk
    const buttonNextViewBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonNextViewBlk.position.set(0.1, -0.02, 0)
    viewpointSelBlock.add(buttonNextViewBlk)
    //add text    
    buttonNextViewBlk.add(new ThreeMeshUI.Text({ content: 'Next' }))

    buttonPrevViewBlk.setupState(hoveredStateAttributes)
    buttonPrevViewBlk.setupState(idleStateAttributes)

    buttonNextViewBlk.setupState(hoveredStateAttributes)
    buttonNextViewBlk.setupState(idleStateAttributes)

    buttonPrevViewBlk.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {
            updateView(-1)
        }
    })

    buttonNextViewBlk.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {
            updateView(1)
        }

    })

    buttonObjs.push(buttonPrevViewBlk, buttonNextViewBlk)

    UIContainerBlk.add(viewpointSelBlock)
    //-----------------------------------------------------------------------//

    //sub block for generate new solutions selector
    const generateSolutionsBlk = new ThreeMeshUI.Block(
        {
        width: 0.6,
        height: 0.3,
        margin: 0.01,
        backgroundOpacity: 0.4,
        backgroundColor: new THREE.Color('0xffffff')
        }
    )
    
    const title3 = new ThreeMeshUI.Text({
        content: 'New Solutions',
        fontSize: 0.06,
        fontColor: new THREE.Color('#2646530')
    })

    title3.position.set(0, -0.04, 0)
    generateSolutionsBlk.add(title3)

    const buttonSolutionsBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonSolutionsBlk.position.set(0, -0.02, 0)
    buttonSolutionsBlk.add(new ThreeMeshUI.Text({ content: 'New' }))


    generateSolutionsBlk.add(buttonSolutionsBlk)

    buttonSolutionsBlk.setupState(hoveredStateAttributes)
    buttonSolutionsBlk.setupState(idleStateAttributes)
    buttonSolutionsBlk.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => { console.log('new solution generate')}
    })
    buttonObjs.push(buttonSolutionsBlk)


    UIContainerBlk.add(generateSolutionsBlk)


    //-----------------------------------------------------------------------//


    UIContainerBlk.position.set(-0.5, 0.9, -0.5)

    UIContainerBlk.rotation.x = -0.55
    UIContainerBlk.rotation.y = 0.30
    UIContainerBlk.rotation.z = 0.2

    // scene is a THREE.Scene (see three.js)
    scene.add(UIContainerBlk)
}

function updateView(num) {
    console.log('change viewpoint')

    viewIndex = (viewIndex + num + storedPositions.length) % storedPositions.length

    dolly.position.set(storedPositions[viewIndex].x, storedPositions[viewIndex].y, storedPositions[viewIndex].z)

    console.log(viewIndex)


}



function dollyMove() {
    var handedness = "unknown"

    const session = renderer.xr.getSession()

    let i = 0

    if (session) {
        let xrCamera = renderer.xr.getCamera(camera)
        xrCamera.getWorldDirection(cameraVector);

        //a check to prevent console errors if only one input source
        if (isIterable(session.inputSources)) {
            for (const source of session.inputSources) {
                if (source && source.handedness) {
                    handedness = source.handedness //left or right controllers
                }

                if (!source.gamepad) continue

                const controller = renderer.xr.getController(i++)
                const old = prevGamePads.get(source)
                const data = {
                    handedness: handedness,
                    buttons: source.gamepad.buttons.map((b) => b.value),
                    axes: source.gamepad.axes.slice(0)
                }

                if (old) {
                    data.buttons.forEach((value, i) => {
                        //handlers for buttons
                        if (value !== old.buttons[i] || Math.abs(value) > 0.8) {
                            //check if it is 'all the way pushed'
                            if (value === 1) {
                                //console.log("Button" + i + "Down")
                                if (data.handedness == "left") {
                                    //console.log("Left Paddle Down")
                                    if (i == 1) {
                                        dolly.rotateY(-THREE.Math.degToRad(1))
                                    }
                                    if (i == 3) {
                                        //reset teleport to home position
                                        dolly.position.x = 0
                                        dolly.position.y = 5
                                        dolly.position.z = 0
                                    }
                                } else {
                                    //console.log("Right Paddle Down")
                                    if (i == 1) {
                                        dolly.rotateY(THREE.Math.degToRad(1))
                                    }
                                }
                            } else {
                                // console.log("Button" + i + "Up")

                                if (i == 1) {
                                    //use the paddle buttons to rotate
                                    if (data.handedness == "left") {
                                        //console.log("Left Paddle Down")
                                        dolly.rotateY(-THREE.Math.degToRad(Math.abs(value)))
                                    } else {
                                        //console.log("Right Paddle Down");
                                        dolly.rotateY(THREE.Math.degToRad(Math.abs(value)))
                                    }
                                }
                            }
                        }
                    })

                    data.axes.forEach((value, i) => {
                        //handlers for thumbsticks
                        //if thumbstick axis has moved beyond the minimum threshold from center, windows mixed reality seems to wander up to about .17 with no input
                        if (Math.abs(value) > 0.2) {
                            //set the speedFactor per axis, with acceleration when holding above threshold, up to a max speed
                            speedFactor[i] > 1 ? (speedFactor[i] = 1) : (speedFactor[i] *= 1.001)
                            console.log(value, speedFactor[i], i)
                            if (i == 2) {
                                //left and right axis on thumbsticks
                                if (data.handedness == "left") {
                                    // (data.axes[2] > 0) ? console.log('left on left thumbstick') : console.log('right on left thumbstick')

                                    //move our dolly
                                    //we reverse the vectors 90degrees so we can do straffing side to side movement
                                    dolly.position.x -= cameraVector.z * speedFactor[i] * data.axes[2]
                                    dolly.position.z += cameraVector.x * speedFactor[i] * data.axes[2]

                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    ) {
                                        var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3])
                                        if (pulseStrength > 0.75) {
                                            pulseStrength = 0.75
                                        }

                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        )
                                    }
                                } else {
                                    // (data.axes[2] > 0) ? console.log('left on right thumbstick') : console.log('right on right thumbstick')
                                    dolly.rotateY(-THREE.Math.degToRad(data.axes[2]))
                                }
                                controls.update()
                            }

                            if (i == 3) {
                                //up and down axis on thumbsticks
                                if (data.handedness == "left") {
                                    // (data.axes[3] > 0) ? console.log('up on left thumbstick') : console.log('down on left thumbstick')
                                    dolly.position.y -= speedFactor[i] * data.axes[3]
                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    ) {
                                        var pulseStrength = Math.abs(data.axes[3])
                                        if (pulseStrength > 0.75) {
                                            pulseStrength = 0.75
                                        }
                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        )
                                    }
                                } else {
                                    // (data.axes[3] > 0) ? console.log('up on right thumbstick') : console.log('down on right thumbstick')
                                    dolly.position.x -= cameraVector.x * speedFactor[i] * data.axes[3]
                                    dolly.position.z -= cameraVector.z * speedFactor[i] * data.axes[3]

                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    ) {
                                        var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3])
                                        if (pulseStrength > 0.75) {
                                            pulseStrength = 0.75
                                        }
                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100)
                                    }
                                }
                                controls.update()
                            }
                        } else {
                            //axis below threshold - reset the speedFactor if it is greater than zero  or 0.025 but below our threshold
                            if (Math.abs(value) > 0.025) {
                                speedFactor[i] = 0.025
                            }
                        }
                    })
                }
                ///store this frames data to compate with in the next frame
                prevGamePads.set(source, data)
            }
        }
    }


}

function isIterable(obj) { //function to check if object is iterable
    // checks for null and undefined
    if (obj == null) {
        return false
    }
    return typeof obj[Symbol.iterator] === "function"
}

function addSky() { //skybox and ground
    var skyRoomGeometry = new THREE.BoxGeometry(1000, 1000, 1000)

    var skyMaterials = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/3.png'), side: THREE.DoubleSide }), //right  3
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/1.png'), side: THREE.DoubleSide }), //left 1
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/top.png'), side: THREE.DoubleSide }), //top
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/white.png'), side: THREE.DoubleSide }), //bottom
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/2.png'), side: THREE.DoubleSide }), //front 2
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./img/clouds/4.png'), side: THREE.DoubleSide }) //back 4
    ]
    var skyRoomCube = new THREE.Mesh(skyRoomGeometry, skyMaterials)

    skyRoomCube.position.set(0, 0, 0)
    scene.add(skyRoomCube)

    var geometry = new THREE.PlaneBufferGeometry(50000, 50000)
    var material = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1.0, })
    var floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.position.set(0, -0.5, 0)
    floor.rotation.x = -Math.PI / 2
    //scene.add(floor)
}

function setCubeMap() {
    var path = 'textures/cube/clouds'
    var format = '.png'

    var urls = ['textures/cube/clouds/2.png', 'textures/cube/clouds/4.png', 'textures/cube/clouds/top.png', 'textures/cube/clouds/white.png',
        'textures/cube/clouds/1.png', 'textures/cube/clouds/3.png'
    ]

    reflectionCube = new THREE.CubeTextureLoader().load(urls)

    scene.background = reflectionCube
    scene.fog = new THREE.Fog(scene.background, 3500, 5000)

}

function addGrabbableStuff() {

    group = new THREE.Group()

    scene.add(group)

    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),

        //new THREE.CylinderGeometry(1, 1, 1, 64)
    ]

    for (var i = 0; i < 30; i++) {
        var geometry = geometries[Math.floor(Math.random() * geometries.length)]
        var material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.7, metalness: 0.1 })

        const object = new THREE.Mesh(geometry, material)

        object.position.x = Math.floor(Math.random() * 150 - 100) * 5
        //object.position.y = Math.floor(Math.random() * 200 - 100) * 10
        object.position.z = Math.floor(Math.random() * 150 - 100) * 5

        object.scale.setScalar(Math.random() + 10)

        object.castShadow = true
        object.receiveShadow = true

        group.add(object)
    }


}

function add3DFiles() {

    const gltfLoader = new GLTFLoader()
    var treeGroup = new THREE.Group()

    for (let i = 0; i < 30; i++)
    {

        gltfLoader.load(

            './assets/glb/tree_1.glb',

            function (gltf) {

                //treeGroup.add(gltf.scene.children[0])

                //let tree = gltf.scene
                //tree.position.set(5,5,5)

                //console.log('add3DFiles:: ', gltf.scene.children[0])
                //scene.add(tree)  

                let tree = gltf.scene
                tree.castShadow = true
                tree.receiveShadow = true
                tree.position.x = Math.floor(Math.random() * 10 - 5) * 2 + 17
                tree.position.z = Math.floor(Math.random() * 20 - 5) * 2 + 40

                tree.scale.setScalar(Math.random()+1 )

                treeGroup.add(tree)

            },

            undefined,

            function (error) {

                console.error(error)

            })
    }

    scene.add(treeGroup)


}

async function addSanta() {

    var santa = await loadFBX({
        filename: 'santa.fbx',
        filepath: './assets/glb/',
        scale: 0.25,
        position: new THREE.Vector3(0, 0, 0),
        material: null,
        name: 'santa'

    })

    var animationGroup = new THREE.AnimationObjectGroup()
    animationGroup.add(santa)

    scene.add(santa)
    var mixer = new THREE.AnimationMixer(animationGroup)
    var action = mixer.clipAction(santa.animations[0])

    action.play()

}

function setControls() {
    controller1 = renderer.xr.getController(0)
    controller1.name = "left"
    controller1.addEventListener('selectstart', onSelectStart)
    controller1.addEventListener('selectend', onSelectEnd)

    //controller1.addEventListener('connected', function (event)
    //{
    //    this.add(buildController(event.data))
    //})

    //controller1.addEventListener('disconnected', function ()
    //{
    //    this.remove(this.children[0])
    //})

    controller1.addEventListener('squeezestart', onSqueezeStart)
    controller1.addEventListener('squeezeend', onSqueezeEnd)
    controller1.userData.painter = painter1


    scene.add(controller1)


    controller2 = renderer.xr.getController(1)
    controller2.name = "right"
    controller2.addEventListener('selectstart', onSelectStart)
    controller2.addEventListener('selectend', onSelectEnd)

    //controller2.addEventListener('connected', function (event) {
    //    this.add(buildController(event.data))
    //})

    //controller2.addEventListener('disconnected', function () {
    //    this.remove(this.children[0])
    //})

    controller2.addEventListener('squeezestart', onSqueezeStart)
    controller2.addEventListener('squeezeend', onSqueezeEnd)
    controller2.userData.painter = painter2

    scene.add(controller2)



    //Controller 3d model
    var controllerModelFactory = new XRControllerModelFactory()

    controllerGrip1 = renderer.xr.getControllerGrip(0)

    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
    scene.add(controllerGrip1)

    controllerGrip2 = renderer.xr.getControllerGrip(1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
    scene.add(controllerGrip2)


    //Controller pointing line
    var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)])

    var line = new THREE.Line(geometry)
    line.name = 'line'
    line.scale.z = 5

    controller1.add(line.clone())
    controller2.add(line.clone())

    raycaster = new THREE.Raycaster()



}

function onSqueezeStart()
{
    this.userData.isSqueezing = true
    this.userData.positionAtSqeezeStart = this.position.y
    this.userData.scaleAtSqueezeStart = this.scale.x
}

function onSqueezeEnd()
{
    this.userData.isSqueezing = false

}

function onSelectStart(event) {
    //ui
    selectState = true
    //

    this.userData.isSelecting = true


    const controller = event.target;

    var intersections = getIntersections(controller)

    if (intersections.length > 0) {
        const intersection = intersections[0]

        const object = intersection.object
        object.material.emissive.b = 1

        controller.attach(object)

        controller.userData.selected = object
    }



}

function onSelectEnd(event) {
    selectState = false

    this.userData.isSelecting = false

    const controller = event.target

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected
        object.material.emissive.b = 0

        //group for grabbable
        group.attach(object)

        controller.userData.selected = undefined

    }

}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld)

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

    //group for grabbable
    return raycaster.intersectObjects(group.children)

}

function setFromController(controller, ray) {
    tempMatrix.identity().extractRotation(controller.matrixWorld)
    ray.origin.setFromMatrixPosition(controller.matrixWorld)
    ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)
}

function setPointerAt(controller, vec) {
    const localVec = controller.matrixWorld(vec)
}

function intersectObjects(controller) {
    //dont highlight when already selected
    if (controller.userData.selected !== undefined) return

    const line = controller.getObjectByName("line")
    const intersections = getIntersections(controller)

    if (intersections.length > 0) {
        const intersection = intersections[0]
        const object = intersection.object
        object.material.emissive.r = 1
        intersected.push(object)
        line.scale.z = intersection.distance


        const session = renderer.xr.getSession()

        if (session) { //only if in webXR session
            for (const sourceXR of session.inputSources) {
                if (!sourceXR.gamepad) continue


                if (
                    sourceXR &&
                    sourceXR.gamepad &&
                    sourceXR.gamepad.hapticActuators &&
                    sourceXR.gamepad.hapticActuators[0] &&
                    sourceXR.handedness == controller.name
                ) {
                    var didPulse = sourceXR.gamepad.hapticActuators[0].pulse(0.05, 5)

                }
            }
        }

    } else {
        line.scale.z = 5
    }
}

function cleanIntersected() {
    while (intersected.length) {
        const object = intersected.pop()
        object.material.emissive.r = 0
    }
}

function buildController(data) {
    let geometry, material

    switch (data.targetRayMode) {
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

function loadFBX(params) {

    const { filename, filepath, scale, position, material, name } = params

    return new Promise((resolve, reject) => {

        const loader = new FBXLoader()

        loader.load(filepath + filename, function(object) {



            object.rotateX(-Math.PI / 2)
            object.rotateZ(-Math.PI / 2)

            object.scale.set(scale, scale, scale)
            object.position.set(position.x, position.y, position.z)

            if(object) resolve(object)
            else reject('Failed')

            

        })

    })

}