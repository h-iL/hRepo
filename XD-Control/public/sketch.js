
console.log('yeah it is running')

import { TransformControls } from './js/TransformControls.js'
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js"
import { DragControls } from './js/DragControls.js'


////////////////////////////////////////////////////////////////////////////////

const scene=new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

////////////////////////////////////////////////////////////////////////////////

const axesHelper = new THREE.AxesHelper(5)

scene.add(axesHelper)

////////////////////////////////////////////////////////////////////////////////

const backgroundTexture = new THREE.CubeTextureLoader().load(['./textures/cube/clouds/3.png', './textures/cube/clouds/1.png', './textures/cube/clouds/top.png', './textures/cube/clouds/white.png', './textures/cube/clouds/2.png', './textures/cube/clouds/4.png'])
scene.background = backgroundTexture

////////////////////////////////////////////////////////////////////////////////

let geometry = new THREE.BoxGeometry(1, 1, 1)
let material = new THREE.MeshBasicMaterial({ color: 'grey' })
let cube = new THREE.Mesh(geometry,material)

scene.add(cube)


////////////////////////////////////////////////////////////////////////////////

//renderer.domElement.ondragstart = function (event)
//{
//    event.preventDefault()
//    return false
//}

//adding only this line you will be able to zoom pan or
const orbitControls = new OrbitControls(camera, renderer.domElement)

const dragControls = new DragControls([cube], camera, renderer.domElement)

dragControls.addEventListener('hoveron', function () {

    orbitControls.enabled = false

})

dragControls.addEventListener('hoveroff', function () {

    orbitControls.enabled = true

})

dragControls.addEventListener('dragstart', function (event) {

    event.object.material.opacity=0.33
})

dragControls.addEventListener('dragend', function (event) {

    event.object.material.opacity=1
})

const transformControls = new TransformControls(camera, renderer.domElement)
transformControls.attach(cube)
transformControls.setMode('rotate')
scene.add(transformControls)


transformControls.addEventListener('dragging-changed', function (event) {

    orbitControls.enabled = !event.value
    dragControls.enabled = !event.value
})



window.addEventListener('keydown', function (event) {

    switch (event.key) {

        case "g":
            transformControls.setMode('translate')
            break

        case "r":
            transformControls.setMode('rotate')
            break

        case "s":
            transformControls.setMode('scale')
            break
    }
})


////////////////////////////////////////////////////////////////////////////////

camera.position.z = 2

window.addEventListener('resize', onWindowResize, false)

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function render()
{
    renderer.render(scene, camera)
}

var animate = function () {
    requestAnimationFrame(animate)
    render()
}

animate()
window.focus()

