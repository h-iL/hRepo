console.log('sketch.js')

import {
    textureBlock,
    updateTexture
} from "./javascripts/dbf-proc-tex.js"
import Sun from './javascripts/dbf-sun.js'

// import Lenslare from './javascripts/lensflare/LensFlare.js'

var container;
var camera, scene, renderer;
var pointLight;
var reflectionCube
var refractionCube
var buildingElements = null
var clock = new THREE.Clock();

let lighting

init()
addModel()
animate()



function addModel() {

    buildingElements = textureBlock({
            solution: sampleSoln,
            reflection: reflectionCube,
            refraction: refractionCube
        })
        // buildingElements.slabs.forEach(mesh=>scene.add(mesh))
        // buildingElements.envelope.forEach(mesh=>scene.add(mesh))

    let multi_material = buildingElements.envelope.map(mesh => mesh.material)
    console.log(multi_material.length)


    const length = 12,
        width = 8;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = {
        steps: 1,
        depth: 16,
        bevelEnabled: false,

    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });


    var extr = new THREE.Mesh(geometry, multi_material)
    extr.geometry.faces[0].materialIndex = 0;
    extr.geometry.faces[1].materialIndex = 1;
    extr.geometry.faces[4].materialIndex = 4;


    // var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, multi_material)
    scene.add(extr);

    // mesh.geometry.faces.forEach(face=>console.log(face))

    // console.log(geometry.faces.length)

    extr.position.x = 50


    const geo = new THREE.PlaneGeometry(50, 50, 32);
    const plane = new THREE.Mesh(geo, multi_material[1]);
    scene.add(plane);

    var box = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), multi_material)
    box.geometry.faces[0].materialIndex = 0;
    box.geometry.faces[1].materialIndex = 1;
    scene.add(box)

    box.position.x = -50

}

function setCubeMap() {
    //cubemap
    var path = 'textures/cube/clouds/';
    var format = '.png';

    var urls = ['textures/cube/clouds/2.png', 'textures/cube/clouds/4.png', 'textures/cube/clouds/top.png', 'textures/cube/clouds/white.png',
        'textures/cube/clouds/1.png', 'textures/cube/clouds/3.png'
    ];

    return new THREE.CubeTextureLoader().load(urls);

}

function setCamera() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.x = 200
    camera.position.y = 200
    camera.position.z = 200
    camera.target = new THREE.Vector3(0, 0, 0)
}


function init() {

    container = document.createElement('div');
    document.body.appendChild(container);


    //renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.VSMShadowMap; // default THREE.PCFShadowMap  THREE.VSMShadowMap PCFSoftShadowMap
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap  THREE.VSMShadowMap PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding;


    container.appendChild(renderer.domElement);

    reflectionCube = setCubeMap()

    scene = new THREE.Scene();
    scene.background = reflectionCube

    scene.fog = new THREE.Fog(scene.background, 3500, 15000);



    setCamera()

    //controls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // set lights for scene 
    setLights()

    // make an invisible plane for shadows 
    initPlane()

    window.addEventListener('resize', onWindowResize, false);

    document.body.onkeyup = function(e) {
        // if(e.keyCode == 32){
        //     //your code
        //     console.log('hi')
        //     updateTexture({meshes: buildingElements.envelope} )
        // }
    }

}

function setControls() {


}

function onWindowResize() {

    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();

    // renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    var delta = clock.getDelta();
    // controls.update(delta);
    renderer.render(scene, camera);

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

function setLights(argument) {

    let sun = Sun(scene)

    scene.add(sun.getLight())
        // let mesh = sun.getMesh()
        // scene.add(mesh)
        // scene.add(sun.getMesh())

    var ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    /*var sun = setSunlight()
    scene.add(sun);*/

}



function loadSampleSite() {

    const siteBorder = JSON.parse('[[-52.38009712839171,0,-57.572181531831134],[-55.78941815186939,0,44.83860224468809],[-47.89056310142493,0,53.081648578593786],[53.770388009299744,0,57.595581127132164],[55.78941815186939,0,-57.595581127132164]]')

    let pGeom = new THREE.Geometry()

    for (const pt of siteBorder) {
        pGeom.vertices.push(new THREE.Vector3(
            pt[0], 0, pt[2]
        ))
    }

    const siteBorderLine = new THREE.LineLoop(pGeom, new THREE.LineBasicMaterial({
        color: 0x01091F,
        transparent: !0,
        opacity: 0.5,
        linewidth: 100,
    }))
    console.log('siteBorderLine:: ', siteBorderLine)
    scene.add(siteBorderLine)

    const constraintMesh = JSON.parse('[[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-62.050228118896484,59.287635803222656,-0.14100000262260437],[62.050228118896484,59.009254455566406,-0.14100000262260437]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[62.050228118896484,59.009254455566406,-0.14100000262260437],[58.75368118286133,-41.94188690185547,-0.14100000262260437]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[58.75368118286133,-41.94188690185547,-0.14100000262260437],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[43.0016975402832,-59.287635803222656,-0.14100000262260437],[-54.99468994140625,-57.11777877807617,-0.14100000262260437]],[[-58.50157928466797,-21.936792373657227,28.718210220336914],[-57.82185363769531,-52.993804931640625,28.3713321685791],[-55.86619567871094,-54.07796096801758,31.25587272644043]],[[-58.50157928466797,-21.936792373657227,28.718210220336914],[-55.86619567871094,-54.07796096801758,31.25587272644043],[-53.78293991088867,-52.164833068847656,34.463558197021484]],[[-58.50157928466797,-21.936792373657227,28.718210220336914],[-53.78293991088867,-52.164833068847656,34.463558197021484],[-54.50519943237305,-22.106916427612305,34.702720642089844]],[[-54.462669372558594,-21.107820510864258,20.569435119628906],[-58.459049224853516,-20.93769645690918,14.584925651550293],[-58.50157928466797,-21.936792373657227,28.718210220336914]],[[-54.462669372558594,-21.107820510864258,20.569435119628906],[-58.50157928466797,-21.936792373657227,28.718210220336914],[-54.50519943237305,-22.106916427612305,34.702720642089844]],[[-57.09728240966797,58.07588195800781,20.102073669433594],[-61.09366226196289,58.246009826660156,14.11756420135498],[-58.459049224853516,-20.93769645690918,14.584925651550293]],[[-57.09728240966797,58.07588195800781,20.102073669433594],[-58.459049224853516,-20.93769645690918,14.584925651550293],[-54.462669372558594,-21.107820510864258,20.569435119628906]],[[53.58808517456055,-45.72561264038086,51.82698440551758],[57.75458908081055,-41.899356842041016,45.82698440551758],[61.752506256103516,52.015586853027344,45.82698440551758]],[[53.58808517456055,-45.72561264038086,51.82698440551758],[61.752506256103516,52.015586853027344,45.82698440551758],[57.628536224365234,49.18843078613281,51.82698440551758]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[-52.78384780883789,-52.20736312866211,51.981346130371094],[-51.91234588623047,-55.2471809387207,47.4399528503418]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[-51.91234588623047,-55.2471809387207,47.4399528503418],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[62.007694244384766,58.010162353515625,32.758811950683594],[57.628536224365234,49.18843078613281,51.82698440551758],[61.752506256103516,52.015586853027344,45.82698440551758]],[[57.628536224365234,49.18843078613281,51.82698440551758],[62.007694244384766,58.010162353515625,32.758811950683594],[-55.099090576171875,57.990821838378906,32.848384857177734]],[[-55.099090576171875,57.990821838378906,32.848384857177734],[-53.952293395996094,-9.118680953979492,199.85899353027344],[57.628536224365234,49.18843078613281,51.82698440551758]],[[-53.952293395996094,-9.118680953979492,199.85899353027344],[54.16263961791992,-8.716562271118164,199.578369140625],[57.628536224365234,49.18843078613281,51.82698440551758]],[[-52.74131393432617,-51.20826721191406,199.85899353027344],[48.29488754272461,-52.506622314453125,199.85899353027344],[-53.952293395996094,-9.118680953979492,199.85899353027344]],[[54.16263961791992,-8.716562271118164,199.578369140625],[-53.952293395996094,-9.118680953979492,199.85899353027344],[48.29488754272461,-52.506622314453125,199.85899353027344]],[[52.50392532348633,-47.681270599365234,199.85899353027344],[54.16263961791992,-8.716562271118164,199.578369140625],[48.29488754272461,-52.506622314453125,199.85899353027344]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[48.29488754272461,-52.506622314453125,199.85899353027344],[-52.74131393432617,-51.20826721191406,199.85899353027344]],[[46.25416946411133,-53.420658111572266,52.19639587402344],[-52.74131393432617,-51.20826721191406,199.85899353027344],[-52.78384780883789,-52.20736312866211,51.981346130371094]],[[-52.78384780883789,-52.20736312866211,51.981346130371094],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-53.78293991088867,-52.164833068847656,34.463558197021484]],[[-52.78384780883789,-52.20736312866211,51.981346130371094],[-52.74131393432617,-51.20826721191406,199.85899353027344],[-53.952293395996094,-9.118680953979492,199.85899353027344]],[[-53.952293395996094,-9.118680953979492,199.85899353027344],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-52.78384780883789,-52.20736312866211,51.981346130371094]],[[-55.099090576171875,57.990821838378906,32.848384857177734],[-57.09728240966797,58.07588195800781,20.102073669433594],[-54.462669372558594,-21.107820510864258,20.569435119628906]],[[-55.099090576171875,57.990821838378906,32.848384857177734],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-53.952293395996094,-9.118680953979492,199.85899353027344]],[[-54.462669372558594,-21.107820510864258,20.569435119628906],[-54.50519943237305,-22.106916427612305,34.702720642089844],[-55.099090576171875,57.990821838378906,32.848384857177734]],[[-62.050228118896484,59.287635803222656,-0.14100000262260437],[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-58.459049224853516,-20.93769645690918,14.584925651550293]],[[-61.09366226196289,58.246009826660156,14.11756420135498],[-62.050228118896484,59.287635803222656,-0.14100000262260437],[-58.459049224853516,-20.93769645690918,14.584925651550293]],[[-58.459049224853516,-20.93769645690918,14.584925651550293],[-57.82185363769531,-52.993804931640625,28.3713321685791],[-58.50157928466797,-21.936792373657227,28.718210220336914]],[[-58.459049224853516,-20.93769645690918,14.584925651550293],[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-57.82185363769531,-52.993804931640625,28.3713321685791]],[[-57.09728240966797,58.07588195800781,20.102073669433594],[-55.099090576171875,57.990821838378906,32.848384857177734],[62.007694244384766,58.010162353515625,32.758811950683594]],[[62.007694244384766,58.010162353515625,32.758811950683594],[62.050228118896484,59.009254455566406,-0.14100000262260437],[-57.09728240966797,58.07588195800781,20.102073669433594]],[[-62.050228118896484,59.287635803222656,-0.14100000262260437],[-57.09728240966797,58.07588195800781,20.102073669433594],[62.050228118896484,59.009254455566406,-0.14100000262260437]],[[-61.09366226196289,58.246009826660156,14.11756420135498],[-57.09728240966797,58.07588195800781,20.102073669433594],[-62.050228118896484,59.287635803222656,-0.14100000262260437]],[[54.16263961791992,-8.716562271118164,199.578369140625],[53.58808517456055,-45.72561264038086,51.82698440551758],[57.628536224365234,49.18843078613281,51.82698440551758]],[[54.16263961791992,-8.716562271118164,199.578369140625],[52.50392532348633,-47.681270599365234,199.85899353027344],[53.58808517456055,-45.72561264038086,51.82698440551758]],[[52.50392532348633,-47.681270599365234,199.85899353027344],[46.25416946411133,-53.420658111572266,52.19639587402344],[53.58808517456055,-45.72561264038086,51.82698440551758]],[[52.50392532348633,-47.681270599365234,199.85899353027344],[48.29488754272461,-52.506622314453125,199.85899353027344],[46.25416946411133,-53.420658111572266,52.19639587402344]],[[62.007694244384766,58.010162353515625,32.758811950683594],[58.75368118286133,-41.94188690185547,-0.14100000262260437],[62.050228118896484,59.009254455566406,-0.14100000262260437]],[[58.75368118286133,-41.94188690185547,-0.14100000262260437],[61.752506256103516,52.015586853027344,45.82698440551758],[57.75458908081055,-41.899356842041016,45.82698440551758]],[[62.007694244384766,58.010162353515625,32.758811950683594],[61.752506256103516,52.015586853027344,45.82698440551758],[58.75368118286133,-41.94188690185547,-0.14100000262260437]],[[42.04513168334961,-58.246009826660156,44.8725700378418],[53.58808517456055,-45.72561264038086,51.82698440551758],[46.25416946411133,-53.420658111572266,52.19639587402344]],[[58.75368118286133,-41.94188690185547,-0.14100000262260437],[42.04513168334961,-58.246009826660156,44.8725700378418],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[57.75458908081055,-41.899356842041016,45.82698440551758],[53.58808517456055,-45.72561264038086,51.82698440551758],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[58.75368118286133,-41.94188690185547,-0.14100000262260437],[57.75458908081055,-41.899356842041016,45.82698440551758],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[-54.9521598815918,-56.118682861328125,28.659866333007812],[-54.99468994140625,-57.11777877807617,-0.14100000262260437],[-51.95487594604492,-56.24627685546875,28.530075073242188]],[[-51.95487594604492,-56.24627685546875,28.530075073242188],[-54.99468994140625,-57.11777877807617,-0.14100000262260437],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[42.04513168334961,-58.246009826660156,44.8725700378418],[-51.95487594604492,-56.24627685546875,28.530075073242188],[43.0016975402832,-59.287635803222656,-0.14100000262260437]],[[-51.91234588623047,-55.2471809387207,47.4399528503418],[-51.95487594604492,-56.24627685546875,28.530075073242188],[42.04513168334961,-58.246009826660156,44.8725700378418]],[[-52.78384780883789,-52.20736312866211,51.981346130371094],[-53.78293991088867,-52.164833068847656,34.463558197021484],[-51.91234588623047,-55.2471809387207,47.4399528503418]],[[-53.78293991088867,-52.164833068847656,34.463558197021484],[-51.95487594604492,-56.24627685546875,28.530075073242188],[-51.91234588623047,-55.2471809387207,47.4399528503418]],[[-51.95487594604492,-56.24627685546875,28.530075073242188],[-53.78293991088867,-52.164833068847656,34.463558197021484],[-55.86619567871094,-54.07796096801758,31.25587272644043]],[[-55.86619567871094,-54.07796096801758,31.25587272644043],[-54.9521598815918,-56.118682861328125,28.659866333007812],[-51.95487594604492,-56.24627685546875,28.530075073242188]],[[-54.9521598815918,-56.118682861328125,28.659866333007812],[-57.82185363769531,-52.993804931640625,28.3713321685791],[-54.99468994140625,-57.11777877807617,-0.14100000262260437]],[[-57.82185363769531,-52.993804931640625,28.3713321685791],[-54.9521598815918,-56.118682861328125,28.659866333007812],[-55.86619567871094,-54.07796096801758,31.25587272644043]],[[-58.82094955444336,-52.951271057128906,-0.14100000262260437],[-54.99468994140625,-57.11777877807617,-0.14100000262260437],[-57.82185363769531,-52.993804931640625,28.3713321685791]]]')

}