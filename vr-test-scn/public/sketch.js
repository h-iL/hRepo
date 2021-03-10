


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 4);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);



document.body.appendChild(VRButton.createButton(renderer));


//detect window size change and update projectionmatrix to current width/height
window.addEventListener('resize', function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

//*********************************************************//


var geometry = new THREE.BoxGeometry(6, 2, 2);
var material = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var ambientLight = new THREE.AmbientLight('white', 3);
scene.add(ambientLight);





//*********************************************************//

var update = function ()
{

};

var render = function ()
{
    renderer.render(scene, camera)
};

var GameLoop = function ()
{
    requestAnimationFrame(GameLoop);
    update();
    render();
};

//GameLoop();

renderer.setAnimationLoop(function ()
{
    renderer.render(scene, camera)
});
