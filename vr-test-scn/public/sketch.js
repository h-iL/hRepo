import { BoxGeometry, BufferAttribute, BufferGeometry, LineBasicMaterial } from './build/three.module.js'
import { VRButton } from './js/VRButton.js'
import { XRControllerModelFactory } from './jsm//webxr/XRControllerModelFactory.js'
import { BoxLineGeometry } from './jsm/geometries/BoxLineGeometry.js'
import { textureBlock } from './jsm/dbf-proc-tex.js'
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js"



var container
var camera, scene, renderer
var controller1, controller2
var controllerGrip1, controllerGrip2

var group
var raycaster 

var intersected = []
var tempMatrix = new THREE.Matrix4()

var controls
var dolly
var cameraVector = new THREE.Vector3()
const prevGamePads = new Map()
var speedFactor = [0.3, 0.3, 0.3, 0.3]


var objsToTest = []



init()
animate()


function init() {
    container = document.createElement("div")
    document.body.appendChild(container)

    scene = new THREE.Scene()
    addSky()
    setCamera()

    controls = new THREE.OrbitControls(camera, container)
    controls.target.set(0, 1.6, 0)
    controls.update()   
    
    setLight()

    group = new THREE.Group()
    scene.add(group)

    //addGrabbableStuff()

    var boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    var boxMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide })
    var object = new THREE.Mesh(boxGeometry, boxMaterial)
    object.position.set(0, 0, -8)
    object.castShadow=true
    object.receiveShadow = true
    scene.add(object)
    //group.add(object)

    addTextureBuilding()
    buildUI()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding=THREE.sRGBEncoding
    renderer.shadowMap.enabled=true
    renderer.xr.enabled = true
    renderer.xr.setFramebufferScaleFactor(2.0)
    container.appendChild(renderer.domElement)
    document.body.appendChild(VRButton.createButton(renderer))
            
    setControls()  
    
    dollySetup()

    window.addEventListener('resize', onWindowResize, false)
}

function dollySetup()
{
    dolly = new THREE.Group()
    dolly.position.set(0, 0, 0)
    dolly.name = "dolly"
    scene.add(dolly)
    dolly.add(camera)
    dolly.add(controller1)
    dolly.add(controller2)
    dolly.add(controllerGrip1)
    dolly.add(controllerGrip2)
}

function addTextureBuilding()
{
    
    var meshes = textureBlock({ solution: sampleSoln, reflection: null, refraction: null })
    meshes.forEach(mesh => scene.add(mesh))


}

function setCamera()
{
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) 
    camera.position.set(0, 1.6, 1)
}

function setLight()
{       
    scene.add(new THREE.HemisphereLight(0x808080, 0x110E3D, 2.5))

    var light = new THREE.DirectionalLight(0xffffff,50)
    light.position.set(0, 200, 0)
    light.castShadow = true
    light.shadow.camera.top = 200
    light.shadow.camera.bottom = -200
    light.shadow.camera.right = 200
    light.shadow.camera.left = -200
    light.shadow.mapSize.set(4096, 4096)

    scene.add(light)

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
    ThreeMeshUI.update()
    cleanIntersected()
    intersectObjects(controller1)
    intersectObjects(controller2)

    dollyMove()
    renderer.render(scene, camera)
    updateButton()
}

function updateButton()
{
    let intersect = raycast()


    if (intersect && intersect.object.isUI)
    {
        if (selectState) { intersect.object.setState('selected') }

        else { intersect.object.setState('hovered') }
    }


    objsToTest.forEach((obj) =>
    {
        if ((!intersect || obj !== intersect.object) && obj.isUI)
        {
            obj.setState('idle')
        }

    })
}

function raycast()
{

    var rcaster = new THREE.Raycaster()

    return objsToTest.reduce((closestIntersection, obj) =>
    {
        

        const intersection = rcaster.intersectedObject(obj.true)

        if (!intersection[0]) return closestIntersection
        if (!closestIntersection || intersection[0].distance < closestIntersection.distance)
        {
            intersection[0].object = obj

            return intersection[0]
        }

        else
        {
            return closestIntersection
        }

    }, null)
}



function buildUI() {

    var UIContainerBlk = new ThreeMeshUI.Block(
        {
            width: 0.7,
            height: 0.45,
            padding: 0.08,
            fontFamily: './assets/Roboto-msdf.json',
            fontTexture: './assets/Roboto-msdf.png',
        })

    //sub block facade selector
    const facadeSelBlock = new ThreeMeshUI.Block(
        {
            width: 0.6,
            height: 0.3,
            //padding: 0.2,
            //fontFamily: './assets/Roboto-msdf.json',
            //fontTexture: './assets/Roboto-msdf.png',
        })

    facadeSelBlock.position.set(-0.4, 0, 0)

    //texts for facade selector block (facadeSelBlock)
    const title = new ThreeMeshUI.Text({ content: 'Facade' })
    title.set({ fontSize: 0.06 })
    title.position.set(0, -0.04, 0)

    facadeSelBlock.add(title)

    const buttonOptions = {
        width: facadeSelBlock.width * 0.3,
        height: facadeSelBlock.height*0.4,
        justifyContent:'center',
        alignContent: 'center',
        margin: 0.01,
        borderRadius: 0.075,
        fontSize:0.04
    }

    //button 1 blk
    const buttonPrevBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonPrevBlk.position.set(-0.1, -0.02, 0)
    facadeSelBlock.add(buttonPrevBlk)

    //button 1 text    
    buttonPrevBlk.add(new ThreeMeshUI.Text({content: 'Previous'}))


    //button 2 blk
    const buttonNextBlk = new ThreeMeshUI.Block(buttonOptions)
    buttonNextBlk.position.set(0.14, -0.02, 0)
    facadeSelBlock.add(buttonNextBlk)

    //button 2 text
    buttonNextBlk.add(new ThreeMeshUI.Text({ content: 'Next' }))   

    const loader = new THREE.TextureLoader()    
    loader.load('./assets/button.png', (texture) => { buttonPrevBlk.set({ backgroundTexture: texture }) })
    loader.load('./assets/button.png', (texture) => { buttonNextBlk.set({ backgroundTexture: texture }) })
    loader.load('./assets/button.png', (texture) => { facadeSelBlock.set({ backgroundTexture: texture }) })
    loader.load('./assets/button.png', (texture) => { UIContainerBlk.set({ backgroundTexture: texture }) })    

    const hoveredStateAttributes =
    {
        state: 'hovered',
        attributes:
        {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,            
        }
    }

    const idleStateAttributes =
    {
        state: 'idle',
        attributes:
        {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 0.3,
        }
    }

    const selectedAttributes=
    {
        offset: 0.02,
    }

    buttonPrevBlk.setupState(
        {
            state: 'selected',
            attributes:selectedAttributes,
            onSet: () => { /*reserve*/ }
        })

    buttonPrevBlk.setupState(hoveredStateAttributes)
    buttonPrevBlk.setupState(idleStateAttributes)

    buttonNextBlk.setupState(
        {
            state: 'selected',
            attributes:selectedAttributes,
            onSet: () => { /*reserve*/ }
        })

    buttonNextBlk.setupState(hoveredStateAttributes)
    buttonNextBlk.setupState(idleStateAttributes)



    UIContainerBlk.add(facadeSelBlock)
   
    UIContainerBlk.position.set(0, 1.4, 0)
    UIContainerBlk.rotation.x=-0.55

    //facadeSelBlock.position.set(0, 1.4, 0)
    //facadeSelBlock.rotation.x=-0.55

    // scene is a THREE.Scene (see three.js)
    scene.add(UIContainerBlk)
}

function dollyMove()
{
    var handedness = "unknown"

    const session = renderer.xr.getSession()

    let i = 0

    if (session)
    {
        let xrCamera = renderer.xr.getCamera(camera)
        xrCamera.getWorldDirection(cameraVector);

        //a check to prevent console errors if only one input source
        if (isIterable(session.inputSources))
        {
            for (const source of session.inputSources)
            {
                if (source && source.handedness)
                {
                    handedness = source.handedness //left or right controllers
                }

                if (!source.gamepad) continue

                const controller = renderer.xr.getController(i++)
                const old = prevGamePads.get(source)
                const data =
                {
                    handedness: handedness,
                    buttons: source.gamepad.buttons.map((b) => b.value),
                    axes: source.gamepad.axes.slice(0)
                }

                if (old)
                {
                    data.buttons.forEach((value, i) =>
                    {
                        //handlers for buttons
                        if (value !== old.buttons[i] || Math.abs(value) > 0.8)
                        {
                            //check if it is 'all the way pushed'
                            if (value === 1)
                            {
                                //console.log("Button" + i + "Down")
                                if (data.handedness == "left")
                                {
                                    //console.log("Left Paddle Down")
                                    if (i == 1)
                                    {
                                        dolly.rotateY(-THREE.Math.degToRad(1))
                                    }
                                    if (i == 3)
                                    {
                                        //reset teleport to home position
                                        dolly.position.x = 0
                                        dolly.position.y = 5
                                        dolly.position.z = 0
                                    }
                                }
                                else
                                {
                                    //console.log("Right Paddle Down")
                                    if (i == 1)
                                    {
                                        dolly.rotateY(THREE.Math.degToRad(1))
                                    }
                                }
                            }
                            else
                            {
                                // console.log("Button" + i + "Up")

                                if (i == 1)
                                {
                                    //use the paddle buttons to rotate
                                    if (data.handedness == "left")
                                    {
                                        //console.log("Left Paddle Down")
                                        dolly.rotateY(-THREE.Math.degToRad(Math.abs(value)))
                                    }
                                    else
                                    {
                                        //console.log("Right Paddle Down");
                                        dolly.rotateY(THREE.Math.degToRad(Math.abs(value)))
                                    }
                                }
                            }
                        }
                    })

                    data.axes.forEach((value, i) =>
                    {
                        //handlers for thumbsticks
                        //if thumbstick axis has moved beyond the minimum threshold from center, windows mixed reality seems to wander up to about .17 with no input
                        if (Math.abs(value) > 0.2)
                        {
                            //set the speedFactor per axis, with acceleration when holding above threshold, up to a max speed
                            speedFactor[i] > 1 ? (speedFactor[i] = 1) : (speedFactor[i] *= 1.001)
                            console.log(value, speedFactor[i], i)
                            if (i == 2)
                            {
                                //left and right axis on thumbsticks
                                if (data.handedness == "left")
                                {
                                    // (data.axes[2] > 0) ? console.log('left on left thumbstick') : console.log('right on left thumbstick')

                                    //move our dolly
                                    //we reverse the vectors 90degrees so we can do straffing side to side movement
                                    dolly.position.x -= cameraVector.z * speedFactor[i] * data.axes[2]
                                    dolly.position.z += cameraVector.x * speedFactor[i] * data.axes[2]

                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    )
                                    {
                                        var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3])
                                        if (pulseStrength > 0.75)
                                        {
                                            pulseStrength = 0.75
                                        }

                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        )
                                    }
                                }
                                else
                                {
                                    // (data.axes[2] > 0) ? console.log('left on right thumbstick') : console.log('right on right thumbstick')
                                    dolly.rotateY(-THREE.Math.degToRad(data.axes[2]))
                                }
                                controls.update()
                            }

                            if (i == 3)
                            {
                                //up and down axis on thumbsticks
                                if (data.handedness == "left")
                                {
                                    // (data.axes[3] > 0) ? console.log('up on left thumbstick') : console.log('down on left thumbstick')
                                    dolly.position.y -= speedFactor[i] * data.axes[3]
                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    )
                                    {
                                        var pulseStrength = Math.abs(data.axes[3])
                                        if (pulseStrength > 0.75)
                                        {
                                            pulseStrength = 0.75
                                        }
                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        )
                                    }
                                }
                                else
                                {
                                    // (data.axes[3] > 0) ? console.log('up on right thumbstick') : console.log('down on right thumbstick')
                                    dolly.position.x -= cameraVector.x * speedFactor[i] * data.axes[3]
                                    dolly.position.z -= cameraVector.z * speedFactor[i] * data.axes[3]

                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    )
                                    {
                                        var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3])
                                        if (pulseStrength > 0.75)
                                        {
                                            pulseStrength = 0.75
                                        }
                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100 )
                                    }
                                }
                                controls.update()
                            }
                        }
                        else
                        {
                            //axis below threshold - reset the speedFactor if it is greater than zero  or 0.025 but below our threshold
                            if (Math.abs(value) > 0.025)
                            {
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

function isIterable(obj)
{  //function to check if object is iterable
    // checks for null and undefined
    if (obj == null)
    {
        return false
    }
    return typeof obj[Symbol.iterator] === "function"
}
    
function addSky()
{//skybox and ground
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
    
    skyRoomCube.position.set(0, 0, 0)
    scene.add(skyRoomCube)

    var geometry = new THREE.PlaneBufferGeometry(50000, 50000)
    var material = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1.0,  })
    var floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.position.set(0, -0.5, 0)
    floor.rotation.x = -Math.PI/2
    //scene.add(floor)




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

    for (var i = 0; i < 30; i++)
    {
        var geometry = geometries[Math.floor(Math.random() * geometries.length)]
        var material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.7, metalness: 0.1 })

        var object = new THREE.Mesh(geometry, material)
        object.position.x = Math.floor(Math.random() * 200 - 100) * 5
        //object.position.y = Math.floor(Math.random() * 200 - 100) * 10
        object.position.z = Math.floor(Math.random() * 200 - 100) * 5

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
    controller1.name="left"
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

    scene.add(controller1)


    controller2 = renderer.xr.getController(1)
    controller2.name ="right"
    controller2.addEventListener('selectstart', onSelectStart)
    controller2.addEventListener('selectend', onSelectEnd)

    //controller2.addEventListener('connected', function (event) {
    //    this.add(buildController(event.data))
    //})

    //controller2.addEventListener('disconnected', function () {
    //    this.remove(this.children[0])
    //})

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
    var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)])

    var line = new THREE.Line(geometry)
    line.name = 'line'
    line.scale.z = 5

    controller1.add(line.clone())
    controller2.add(line.clone())

    raycaster = new THREE.Raycaster()
    
    

}

function onSelectStart(event)
{
    var controller = event.target;

    var intersections = getIntersections(controller)

    if (intersections.length > 0)
    {
        
        

        var intersection = intersections[0]

        var object = intersection.object
        object.material.emissive.b = 1

        controller.attach(object)

        controller.userData.selected = object

    }

    

}

function onSelectEnd(event)
{
    var controller = event.target

    if (controller.userData.selected !== undefined)
    {

        var object = controller.userData.selected
        object.material.emissive.b = 0

        //group for grabbable
        group.attach(object)

        controller.userData.selected = undefined

    }

}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld)

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix)

    //group for grabbable
    return raycaster.intersectObjects(group.children)

}

function intersectObjects(controller)
{
    //dont highlight when already selected
    //if (controller.userData.selected !== undefined) return

    var line = controller.getObjectByName("line")
    var intersections = getIntersections(controller)

    if (intersections.length > 0) {
        var intersection = intersections[0]

        const session = renderer.xr.getSession()

        if (session)
        {//only if in webXR session
            for (const sourceXR of session.inputSources)
            {
                if (!sourceXR.gamepad) continue


                if (
                    sourceXR &&
                    sourceXR.gamepad &&
                    sourceXR.gamepad.hapticActuators &&
                    sourceXR.gamepad.hapticActuators[0] &&
                    sourceXR.handedness == controller.name
                )
                {
                    var didPulse = sourceXR.gamepad.hapticActuators[0].pulse(0.05, 5)

                }
            }
        }

        var object = intersection.object
        object.material.emissive.r = 1
        intersected.push(object)
        line.scale.z = intersection.distance


    }

    else
    {
        line.scale.z=5
    }
}

function cleanIntersected() {
    while (intersected.length) {
        var object = intersected.pop()
        object.material.emmisive.r = 0


    }
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








