console.log('yeah it is running')

import {
    TransformControls
} from './js/TransformControls.js'
import {
    OrbitControls
} from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js"
import {
    SelectionBox
} from './js/SelectionBox.js'
import {
    SelectionHelper
} from './js/dbf-SelectionHelper.js'
import {
    MeshLambertMaterial
} from './js/three.module.js'
// import {DragControls} from './js/DragControls.js'


var allSelected = []

// 'editor.js functions'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
camera.position.x = 75
camera.position.y = 75
camera.position.z = 75


renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 'scene background'

const backgroundTexture = new THREE.CubeTextureLoader().load(['./textures/cube/clouds/3.png', './textures/cube/clouds/1.png', './textures/cube/clouds/top.png', './textures/cube/clouds/white.png', './textures/cube/clouds/2.png', './textures/cube/clouds/4.png'])
scene.background = backgroundTexture

// 'set lights'

const light = new THREE.SpotLight(0xffffff, 1.5)
light.position.set(0, 500, 2000)
light.angle = Math.PI / 9

light.castShadow = true
scene.add(light)


// 'set controls'
const orbitControls = new OrbitControls(camera, renderer.domElement)
const transformControls = new TransformControls(camera, renderer.domElement)


//  Example begins 

let pickingObject = new THREE.Object3D()
let objects = []

let tempGroup = new THREE.Group()
scene.add(tempGroup)

tempGroup.userData.selected = []
tempGroup.userData.prevParent = []


// 'set up picking geometry'


const geometry = new THREE.BoxGeometry(2, 2, 2)
let num = 1
let dim = 2

for (var x = -num; x < num; x++) {
    for (var y = -num; y < num; y++) {
        for (var z = -num; z < num; z++) {

            const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
            }))
            object.position.set(x * dim, y * dim, z * dim)
            scene.add(object)
            objects.push(object)

        }
    }
}

pickingObject.children = objects



////////////////////////////////////////////////////////////////////////////////

let selection = new THREE.Object3D()
scene.add(selection)





transformControls.setMode('translate')
scene.add(transformControls)

orbitControls.mouseButtons = {

    LEFT: null, //THREE.MOUSE.DOLLY,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,

}


transformControls.addEventListener('dragging-changed', function(event) {

    console.log('dragging')
    checkTO()




    orbitControls.enabled = !event.value

})


window.addEventListener('keydown', function(event) {

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

            /*
            case "d":
                console.log('drag enabled')
                dragControls.activate()
                break

            case "f":
                console.log('drag disabled')
                dragControls.deactivate()
                break

            */
    }

})

document.addEventListener('dblclick', function() {

    console.log('double click')

    resetSelectionBox(selectionBox)

})


const selectionBox = new SelectionBox(camera, scene)
const helper = new SelectionHelper(selectionBox, renderer, 'selectBox')



document.addEventListener('pointerdown', onMouseDown)
document.addEventListener('pointermove', onMouseMoved)
document.addEventListener('pointerup', onMouseUp)



function onMouseDown(event) {
    // console.log('single click')

    let x = (event.clientX / window.innerWidth) * 2 - 1
    let y = -(event.clientY / window.innerHeight) * 2 + 1

    switch (event.button) {
        case 0: // left 
            console.log('left click')

            selectionBox.startPoint.set(x, y, 0.5)
            helper.onPointerDown(event)

            break;

        case 1: // middle
            console.log('middle click')


            break;

        case 2: // right
            console.log('right click')
            resetSelectionBox(selectionBox)
            break;
    }

}

function onMouseMoved(event) {

    if (transformControls.dragging) {
        return
    }

    helper.onPointerMove(event)


    /*


    switch (event.button) {

        case 0: // left 

            console.log('onMouseMoved...')

            transformControls.dragging

            helper.onPointerMove(event)

            break;
        case 1: // middle
            console.log('middle')
            break;
        case 2: // right
            console.log('right click')

            break;
    }

    */
}

function setEmissiveColor(objects, hex) {

    for (let i = 0; i < objects.length; i++) {

        if (allSelected[i].material.emissive) {

            allSelected[i].material.emissive.set(hex);

        }

    }

}


function onMouseUp(event) {
    // console.log('single click')

    let x = (event.clientX / window.innerWidth) * 2 - 1
    let y = -(event.clientY / window.innerHeight) * 2 + 1

    switch (event.button) {

        case 0: // left 

            console.log('pointer up')
            selectionBox.endPoint.set(x, y, 0.5)
            helper.onPointerUp(event)

            let mySelection = selectionBox.select(null, null, pickingObject)
            pickingObject.children = mySelection.notSelected


            let newSelection = mySelection.selected
            allSelected.push(...newSelection)

            setEmissiveColor(allSelected, 0x00ff00)




            if (!transformControls.object) {

                if (allSelected.length > 0) {

                    // tempGroup = new THREE.Object3D()
                    // scene.add(group)

                    allSelected.forEach(o => tempGroup.add(o))

                    // let box = new THREE.Box3().setFromObject( group ).getCenter( group.position ).multiplyScalar( - 1 );
                    // let box = new THREE.Box3().setFromObject(group)
                    // let center = box.getCenter()

                    // console.l

                    // transformControls.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 8));


                    // group.applyMatrix(new THREE.Matrix4().makeTranslation(center.x, center.y, center.z));



                    transformControls.attach(tempGroup)

                    checkTO()


                }

            }


            // */

            // if (selection !== null) {
            //     transformControls.attach(selection)
            //     scene.add(transformControls)
            // }

            break;
        case 1: // middle
            console.log('middle')
            break;
        case 2: // right
            console.log('right click')

            break;
    }

}


function checkTO() {

    console.log(transformControls.object.position)

    transformControls.object.children.forEach(child => {

        console.log(child.position)

    })

}

function computeGroupCenter(group) {
    var childBox = new THREE.Box3();
    var groupBox = new THREE.Box3();
    var invMatrixWorld = new THREE.Matrix4();

    // if (!optionalTarget) optionalTarget = new THREE.Vector3();

    group.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            if (!child.geometry.boundingBox) {
                child.geometry.computeBoundingBox();
                childBox.copy(child.geometry.boundingBox);
                child.updateMatrixWorld(true);
                childBox.applyMatrix4(child.matrixWorld);
                groupBox.min.min(childBox.min);
                groupBox.max.max(childBox.max);
            }
        }
    });

    // All computations are in world space
    // But the group might not be in world space
    group.matrixWorld.getInverse(invMatrixWorld);
    groupBox.applyMatrix4(invMatrixWorld);

    // groupBox.getCenter(optionalTarget);
    // return optionalTarget;?

    return group

}

function resetSelectionBox() {

    // console.log('reset selection box')
    // console.log(selectionBox.collection)
    // console.log(allSelected.length)
    // for (const ch of selectionBox.collection) {

    // transformControls.object.updateWorldMatrix(true, false)

    // reset selection group 
    setEmissiveColor(allSelected, 0x00000)
    pickingObject.children.push(...allSelected)
    allSelected = []


        // console.log(pickingObject.children.length)

    tempGroup.children.forEach(child=>{

        child.position.x += tempGroup.position.x
        child.position.y += tempGroup.position.y
        child.position.z += tempGroup.position.z

    })

    let tempObjects = []

    tempGroup.children.forEach(child=>tempObjects.push(child))
    tempGroup.remove(...tempGroup.children);
    tempObjects.forEach(obj=> scene.add(obj))
 
    tempGroup.position.set(0,0,0)
    transformControls.detach()



    // const parent = object.parent;
    // parent.remove(object);

    // object.matrixWorld.decompose(object.position, object.quaternion, object.scale)
        // transformControls.dipose()
        // transformControls.dispose()



}


// document.addEventListener('pointermove', function(event) {

// console.log('pointer move event')
// helper.onPointerMove(event)


// onMouseMoved(event)

/*
    

// if (helper.isDown) {
    // console.log('pointer move')

    for (let i = 0; i < selectionBox.collection.length; i++) {

        try {
            if (selectionBox.collection[i].material.type === 'MeshLambertMaterial')
                selectionBox.collection[i].material.emissive.set(0x000000);

        } catch (err) {
            // console.log(selectionBox.collection[i].material)
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

        } catch (err) {
            // console.log(allSelected[i].material)
        }
    }
}

*/



// })



////////////////////////////////////////////////////////////////////////////////

var tempMatrix = new THREE.Matrix4()

/*

function onGroupingStart(event) {

    console.log('onGroupingStart')

    tempGroup.matrixWorldNeedsUpdate = true

    if (!event.detail.intersection) return

    if (event.detail.intersection.object !== undefined) {
        var intersectedObject = event.detail.intersection.object

        if (tempGroup.userData.selected.includes(intersectedObject)) {
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
        } else {
            transformControls.attach(intersectedObject)
        }



    }

}


function onGroupingEnd() {

    console.log('grouping end')

    if (tempGroup.userData.selected !== []) {
        var intersectedObject

        for (let i = 0; i < tempGroup.userData.selected.length; i++) {

            intersectedObject = tempGroup.userData.selected[i]
            intersectedObject.matrixWorldNeedsUpdate = true

            tempGroup.userData.prevParent[i].matrixWorldNeedsUpdate = true

            tempMatrix.getInverse(tempGroup.userData.prevParent[i].matrixWorld)

            let intersectedObject_matrix_old = intersectedObject.matrixWorld.premultiply(tempMatrix)
            intersectedObject_matrix_old.decompose(intersectedObject.position, intersectedObject.quaternion, intersectedObject.scale)

            tempGroup.userData.prevParent[i].add(intersectedObject)
            intersectedObject.material.emissive.b = 0

        }

        tempGroup.userData.selected = []
        tempGroup.userData.prevParent = []

    }
    transformControls.detach()


}

*/


////////////////////////////////////////////////////////////////////////////////



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

var animate = function() {
    requestAnimationFrame(animate)
    render()
}

animate()
window.focus()