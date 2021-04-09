
console.log('yeah it is running')

import { TransformControls } from './js/TransformControls.js'
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js"

import { SelectionBox } from './js/SelectionBox.js'
import { SelectionHelper } from './js/SelectionHelper.js'
import { MeshLambertMaterial } from './js/three.module.js'


var allSelected=[]

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



const light = new THREE.SpotLight(0xffffff, 1.5)
light.position.set(0, 500, 2000)
light.angle=Math.PI/9

light.castShadow = true
scene.add(light)



////////////////////////////////////////////////////////////////////////////////



const tempGroup = new THREE.Group()
scene.add(tempGroup)

tempGroup.userData.selected = []
tempGroup.userData.prevParent = []


const geometry = new THREE.BoxGeometry(2, 2, 2)

for (let i = 0; i < 20; i++)
{
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))

    object.position.x = Math.random() * 50 - 25
    object.position.y = Math.random() * 50 - 25
    object.position.z = Math.random() * 50 - 25

    scene.add(object)

}


////////////////////////////////////////////////////////////////////////////////

const orbitControls = new OrbitControls(camera, renderer.domElement)


const transformControls = new TransformControls(camera, renderer.domElement)

transformControls.setMode('rotate')
scene.add(transformControls)

transformControls.addEventListener('dragging-changed', function (event) {

    orbitControls.enabled = !event.value

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

        case "z":
            orbitControls.enabled = false
            break

        case "x":
            orbitControls.enabled = true
            break


    }
})


document.addEventListener('dblclick', function () {

    if (orbitControls.enabled) {
        orbitControls.enabled = false
    }

    else orbitControls.enabled = true
})

////////////////////////////////////////////////////////////////////////////////

const selectionBox = new SelectionBox(camera, scene)
const helper = new SelectionHelper(selectionBox, renderer, 'selectBox')




document.addEventListener('pointerdown', function (event) {


    console.log('pointer down')

    for (const item of selectionBox.collection) {
              
        try {
            if (item.material.type === 'MeshLambertMaterial')
                item.material.emissive.set(0x000000);

        }
        catch (err) {
            console.log(item.material)
        }     

    }

    selectionBox.startPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5)

})



document.addEventListener('pointermove', function (event) {

    if (helper.isDown) {
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

    console.log('pointer up')


    selectionBox.endPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5)

    const allSelected = selectionBox.select()
    //console.log(allSelected)

    allSelected.forEach(o => tempGroup.add(o))
    transformControls.attach(tempGroup)

    //onGroupingStart(allSelected)
    //onGroupingEnd()

    for (let i = 0; i < allSelected.length; i++) {

        try {
            if (allSelected[i].material.type === 'MeshLambertMaterial')
                allSelected[i].material.emissive.set(0xffffff);

        }
        catch (err) {
            console.log(allSelected[i].material)
        }
    }
    
})


////////////////////////////////////////////////////////////////////////////////

var tempMatrix = new THREE.Matrix4()


function onGroupingStart(event)
{
    tempGroup.matrixWorldNeedsUpdate = true

    
    if (event.detail.intersection.object !== undefined)
    {        
        var intersectedObject = event.detail.intersection.object

        if (tempGroup.userData.selected.includes(intersectedObject))
        {
            return
        }

        intersectedObject.matrixWorldNeedsUpdate = true
        tempMatrix.getInverse(tempGroup.matrixWorld)

        var intersectedObject_matrix_new = intersectedObject.matrixWorld.premultiply(tempMatrix)
        intersectedObject_matrix_new.decompose(intersectedObject.position, intersectedObject.quaternion, intersectedObject.scale)

        tempGroup.userData.selected.push(intersectedObject)
        tempGroup.userData.prevParent.push(intersectedObject.parent)

        tempGroup.add(intersectedObject)
        intersectedObject.material.emissive.b = 1

        if (tempGroup.userData.selected.length > 1) {
            transformControls.attach(tempGroup)
        }
        else
        {
            transformControls.attach(intersectedObject)
        }



    }

}


function onGroupingEnd() {

    if (tempGroup.userData.selected !== [])
    {
        var intersectedObject

        for (let i = 0; i < tempGroup.userData.selected.length; i++)
        {
            intersectedObject = tempGroup.userData.selected[i]
            intersectedObject.matrixWorldNeedsUpdate = true

            tempGroup.userData.prevParent[i].matrixWorldNeedsUpdate = true

            tempMatrix.getInverse(tempGroup.userData.prevParent[i].matrixWorld)

            let intersectedObject_matrix_old = intersectedObject.matrixWorld.premultiply(tempMatrix)
            intersectedObject_matrix_old.decompose(intersectedObject.position, intersectedObject.quaternion, intersectedObject.scale)

            tempGroup.userData.prevParent[i].add(intersectedObject)
            intersectedObject.material.emissive.b=0

        }

        tempGroup.userData.selected = []
        tempGroup.userData.prevParent = []

    }
    transformControls.detach


}



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

