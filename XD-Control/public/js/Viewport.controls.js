console.log('viewport.controls.js')

import * as THREE from './three.module.js';


export function Controls(editor, viewport) {

    // Rhino Defaults

    /*

    Orbit - Right Click
    Pan - Shift + Right Click
    Box Select - Left Drag

    */


    /*


    document.addEventListener('pointerdown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize, false);
    // window.addEventListener('click', onClick, false);
    // window.addEventListener('oncontextmenu', onRightClick, false);
    window.addEventListener('dblclick', onDblClick, false);

    function onMouseDown(event) {
        console.log('single click')

        switch (event.button) {
            case 0: // left 
            console.log('left')
            onClick()
                break;
            case 1: // middle
            console.log('middle')
                break;
            case 2: // right
            console.log('right')

            viewport.control.detach()
                break;
        }

    }

    function onClick(event) {


        if (viewport.INTERSECTED) {

            if (!viewport.control.object) {

                viewport.control.attach(viewport.INTERSECTED)

            }

            if (!viewport.control.object.dragging) {

                viewport.control.attach(viewport.INTERSECTED)

            }

        }


    }

    function onDblClick() {


        if (viewport.INTERSECTED) {

            fitCameraToObject(editor.camera, viewport.INTERSECTED, 2, viewport.orbit)

            return
        }

        if (!viewport.INTERSECTED && viewport.control.object) {

            viewport.control.detach()
        }


    }


    function onWindowResize() {

        const aspect = window.innerWidth / window.innerHeight;

        editor.cameraPersp.aspect = aspect;
        editor.cameraPersp.updateProjectionMatrix();

        editor.cameraOrtho.left = editor.cameraOrtho.bottom * aspect;
        editor.cameraOrtho.right = editor.cameraOrtho.top * aspect;
        editor.cameraOrtho.updateProjectionMatrix();

        viewport.renderer.setSize(window.innerWidth, window.innerHeight);

    }




    function onMouseMove(event) {

        // console.log('mouse move', viewport.mouse)

        event.preventDefault();
        viewport.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        viewport.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    }

*/
}

// const resetCamera = function() {


// }

const fitCameraToObject = function(camera, object, offset, controls) {

    offset = offset || 1.25;

    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    // camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    // camera.far = cameraToFarEdge * 3;
    // camera.updateProjectionMatrix();

    if (controls) {

        // set camera to rotate around center of loaded object
        controls.target = center;

        // prevent camera from zooming out far enough to create far plane cutoff
        // controls.maxDistance = cameraToFarEdge * 2;

        controls.saveState();
        controls.update()


        // camera.far = 1000
        controls.maxDistance = 30000

    }


}