init()
animate()

let paintmode = false



const geometry = new THREE.PlaneGeometry(512, 512, 1);
const material = new THREE.MeshBasicMaterial({
    color: 0xffff00
});
const plane = new THREE.Mesh(geometry, material);
plane.material.needsUpdate = true;

plane.rotateX(-Math.PI / 2)
scene.add(plane)


const raycaster = new THREE.Raycaster()

function raycast() {

    const pos = getMousePosition()
    raycaster.setFromCamera(pos, camera)

    const intersects = raycaster.intersectObject(plane)

    if (intersects.length) return intersects[0].point;
}




function createTexturePainter(p) {

    p.setup = function() {

        // background(255, 30, 120)
        let myCanvas = p.createCanvas(512, 512)


        // myCanvas.hide()


    }

    p.draw = function() {

    }

    p.paint = function(x, y) {

        p.fill(255, 0, 255, 10)
        p.noStroke()

        for (var i = 0; i < 20; i += 4) {

            p.circle(x, y, i)
        }
    }

    return p;
}

const p = new p5(createTexturePainter, 'texturePainter')

var x = document.getElementById("texturePainter");
console.log(x)
x.style.display = "none";



function init() {

    elem = 'container'
    container = document.getElementById(elem)

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.x = 0
    camera.position.y = 500
    camera.position.z = 500
    this.camera.target = new THREE.Vector3(0, 0, 0)


    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement)
    controls = new THREE.OrbitControls(camera, renderer.domElement)

}


function animate() {

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}




function getMousePosition() {

    const pos = {}

    let screen_posX = event.clientX
    let screen_posY = event.clientY

    pos.x = ((screen_posX - renderer.domElement.offsetLeft) / window.innerWidth) * 2 - 1
    pos.y = -((screen_posY - renderer.domElement.offsetTop) / window.innerHeight) * 2 + 1

    return pos

}


$(document).mousemove(function(e) {

    if (!paintmode) {
        return
    }
    if (e.target.nodeName != "CANVAS") {
        return;
    }

    const pos = raycast()
    if (pos) {
        p.paint(pos.x + 250, pos.z + 250)
            // console.log('p.oCanvas:: ', p)
        plane.material.map = new THREE.CanvasTexture(p.canvas)
        plane.material.needsUpdate = true
    }

})

$('#toggle-paint').click(() => {

    paintmode = !paintmode
    controls.enabled = !paintmode
})