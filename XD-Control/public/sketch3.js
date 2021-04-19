
console.log('sketch2.js')

import { TransformControls } from './js/TransformControls.js'
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js"

import { SelectionBox } from './js/SelectionBox.js'
import { SelectionHelper } from './js/SelectionHelper.js'
import { MeshLambertMaterial } from './js/three.module.js'
import { DragControls } from './js/DragControls.js'


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

let objects=new THREE.Object3D()

const geometry = new THREE.BoxGeometry(2, 2, 2)

const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
const object2 = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))

object.position.set(2,5,1)



objects.add(object)
objects.add(object2)

scene.add(objects)

////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////



const dragControls = new DragControls([objects], camera, renderer.domElement)

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
transformControls.attach(objects)

scene.add(transformControls)


transformControls.addEventListener('dragging-changed', function (event) {

    orbitControls.enabled = !event.value
})

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

