
console.log('sketch2.js')

import { TransformControls } from './js/TransformControls.js'
import { OrbitControls } from "./js/OrbitControls.js"
import { SelectionBox } from './js/SelectionBox.js'
import { SelectionHelper } from './js/SelectionHelper.js'
import { MeshLambertMaterial } from './js/three.module.js'
import { DragControls } from './js/DragControls.js'
import { EditorControls } from './js/EditorControls.js'

import { Controls } from './js/Viewport.controls.js'


var allSelected = []

////////////////////////////////////////////////////////////////////////////////

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


////////////////////////////////////////////////////////////////////////////////

const axesHelper = new THREE.AxesHelper(2)

scene.add(axesHelper)

////////////////////////////////////////////////////////////////////////////////

const backgroundTexture = new THREE.CubeTextureLoader().load(['./textures/cube/clouds/3.png', './textures/cube/clouds/1.png', './textures/cube/clouds/top.png', './textures/cube/clouds/white.png', './textures/cube/clouds/2.png', './textures/cube/clouds/4.png'])
scene.background = backgroundTexture

////////////////////////////////////////////////////////////////////////////////

const light = new THREE.SpotLight(0xffffff, 1.5)
light.position.set(0, 500, 2000)
light.angle = Math.PI / 9

light.castShadow = true
scene.add(light)

////////////////////////////////////////////////////////////////////////////////

let objects = []

const geometry = new THREE.BoxGeometry()

for (let x = 0; x < 5; x ++){
    for (let y = 0; y < 5; y++){
        for (let z = 0; z < 5; z++){

            const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
            object.position.set(x,y,z)
            scene.add(object)
            objects.push(object)
        }
    }
}


////////////////////////////////////////////////////////////////////////////////


let selection = new THREE.Object3D()
scene.add(selection)

const dragControls = new DragControls([...objects], camera, renderer.domElement)

dragControls.deactivate()

dragControls.addEventListener('dragstart', function (event) {
    orbitControls.enabled = false
})

dragControls.addEventListener('dragend', function (event) {
    orbitControls.enabled = true
})

const orbitControls = new OrbitControls(camera, renderer.domElement)

orbitControls.mouseButtons =
{
    RIGHT: THREE.MOUSE.ROTATE,
    LEFT: null,
    MIDDLE: THREE.MOUSE.PAN
}

let transformControls = new TransformControls(camera, renderer.domElement)

transformControls.setMode('translate')
transformControls.space = "local"
scene.add(transformControls)

transformControls.addEventListener('dragging-changed', function (event) {

    orbitControls.enabled = !event.value
})

transformControls.addEventListener('mouseUp', function (event) {

    console.log('done')
    selection.matrixWorldNeedsUpdate = true
})

document.onkeydown = function (e) { console.log(e) }

window.addEventListener('keydown', function (event) {

    switch (event.key || event.keyCode) {

        case "g":
            transformControls.setMode('translate')
            break

        case "r":
            transformControls.setMode('rotate')
            break

        case "s":
            transformControls.setMode('scale')
            break

        case "d":
            console.log('drag enabled')
            dragControls.activate()
            break

        case "f":
            console.log('drag disabled')
            dragControls.deactivate()
            break
    }
})


const selectionBox = new SelectionBox(camera, scene)
const helper = new SelectionHelper(selectionBox, renderer,'selectBox')


    document.addEventListener('pointerdown', function (event) {

        if (event.button === 0){
            console.log('pointer down')

            // for (const item of selectionBox.collection) {

            //     try {
            //         if (item.material.type === 'MeshLambertMaterial')
            //             item.material.emissive.set(0x000000);

            //     }
            //     catch (err) {
            //         console.log(item.material)
            //     }

            // }

            selectionBox.startPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5)
        }

    })



    document.addEventListener('pointermove', function (event) {

        if (helper.isDown && event.button === 0 ) {
            console.log('pointer move')

            for (let i = 0; i < selectionBox.collection.length; i++) {

                try {
                    if (selectionBox.collection[i].material.type === 'MeshLambertMaterial')
                        selectionBox.collection[i].material.emissive.set(0x000000);

                }
                catch (err) {
                    console.log(selectionBox.collection[i].material)
                }
            }

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5)

            allSelected = selectionBox.select()


            for (let i = 0; i < allSelected.length; i++) {

                try {
                    if (allSelected[i].material.type === 'MeshLambertMaterial')
                        allSelected[i].material.emissive.set(0xffffff);

                }
                catch (err) {
                    console.log(allSelected[i].material)
                }
            }
        }

    })

document.addEventListener('pointerup', function (event) {
    if (event.button === 0)
    {


        console.log('pointer up')


        selectionBox.endPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5)

        allSelected = selectionBox.select()

        allSelected.forEach(o => {
            if (o.type === 'Mesh') {
                selection.add(o)
                console.log(selection)
            }
        })

        if (selection !== null) {
            //transformControls = new TransformControls(camera, renderer.domElement)
            transformControls.attach(selection)
            //scene.add(transformControls)

        }


        for (let i = 0; i < allSelected.length; i++) {

            try {
                if (allSelected[i].material.type === 'MeshLambertMaterial')
                    allSelected[i].material.emissive.set(0xffffff);

            }
            catch (err) {
                console.log(allSelected[i].material)
            }
        }

    }

    })





////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////

camera.position.z = 2

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function render() {
   
    renderer.render(scene, camera)
}

var animate = function () {
    requestAnimationFrame(animate)
    render()
}

animate()
window.focus()

