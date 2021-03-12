console.log('sketch.js')

var container;
var camera, scene, renderer;
var pointLight;

let reflectionCube
let refractionCube

init()
textureObject(sampleSoln)
animate()

loadSampleSite()


function textureObject(params) {

    console.log('sample:: ', sampleSoln)

    const {
        blocks
    } = params

    for (let block of blocks) {

        const {
            block_shape,
            block_f2f,
            block_rotation,
            block_translation,
            block_scale
        } = block

        const centroid = utils.avg_Pt(block_shape, 0)

        const blockMesh = utils3D.getExtrudedMesh({
            shapePts: block_shape,
            depth: block_scale.y * block_f2f,
            centerPt: centroid,
            rotVec: block_rotation,
            scaleVec: block_scale,
            posVec: block_translation
        })

        let translate = block_translation
        let rotate = block_rotation
        let scale = block_scale
        let shape = block_shape
        let f2f = block_f2f



        applyBlockTexture(shape, translate, rotate, scale, f2f)
        applySlabs(block)

    }

}

function applySlabs(block) {

    let slabs = []

    const {
        block_shape,
        block_f2f,
        block_rotation,
        block_translation,
        block_scale
    } = block

    const centroid = utils.avg_Pt(block_shape, 0)
    let height = block_f2f * block_scale.y
    let slabThickness = 0.3


    for (var h = 0; h <= height; h += block_f2f) {

        console.log('h', h)

        let translation = new THREE.Vector3(block_translation.x, block_translation.y + h-slabThickness/3, block_translation.z)
        let slabMat = new THREE.MeshLambertMaterial({
            color: 'white'
        })

        const slabMesh = utils3D.getExtrudedMesh({


            shapePts: block_shape,
            material: slabMat,
            depth: slabThickness,
            centerPt: centroid,
            rotVec: block_rotation,
            scaleVec: block_scale,
            posVec: translation
        })

        scene.add(slabMesh)
        slabs.push(slabMesh)

    }

    return slabs

}


function applyBlockTexture(shape, translate, rotate, scale, f2f, options) {

    let walls = []

    for (var i = -1; i < shape.length - 1; i++) {

        let a = shape[i]

        if (i == -1) {
            a = shape[shape.length - 1]
        }

        let b = shape[i + 1]
        let height = f2f * scale.y
        let elev = translate.y

        let ptA = new THREE.Vector3(a.x + translate.x, a.y, a.z + translate.z)
        let ptB = new THREE.Vector3(b.x + translate.x, b.y, b.z + translate.z)

        let wall = extrudeWall(ptA, ptB, height, elev, f2f)
        walls.push(wall)
        scene.add(wall)

    }

    return walls


}


function proceduralTexture(params) {

    // ratio = 40% 


    let t = (1 - params.windowRatio) / 2



    let options = {

        length: params.length,
        height: params.height,
        spacingX: params.offsetX,
        spacingY: params.offsetY,
        parameter: t,
        checkerBoard: false,

    }

    var texture = new THREE.Texture(generateFacadeTexture(options, false));
    texture.needsUpdate = true;
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 16;

    var alphaTexture = new THREE.Texture(generateFacadeTexture(options, true));
    alphaTexture.needsUpdate = true;
    alphaTexture.encoding = THREE.sRGBEncoding;
    alphaTexture.anisotropy = 16;

    const material = new THREE.MeshPhongMaterial({

        map: texture,
        transparent: true,
        alphaMap: alphaTexture,
        envMap: reflectionCube,
        combine: THREE.MixOperation,
        reflectivity: 0.1,


    })

        // var material = new THREE.MeshPhongMaterial( {

        //             map: texture,
        // transparent: true,
        // alphaMap: alphaTexture,
        //             // color: 0xff0000,
        //             // shininess: 150,
        //             // specular: 0x222222
        //         } );


  //     const material = new THREE.MeshBasicMaterial({
  //   // map: texture,
  //   side: THREE.DoubleSide,
  // });

    return material

}


function extrudeWall(ptA, ptB, height, elev, f2f) {


    var thickness = 0.1
    var length = ptA.distanceTo(ptB)
    var geometry = new THREE.BoxGeometry(thickness, height, length); // align length with z-axis
    geometry.translate(0, height / 2 + elev, length / 2); // so one end is at the origin


    let material = proceduralTexture({
        length: length,
        height: height,
        windowRatio: 1,
        offsetX: 1.5,
        offsetY: f2f,
    })




    var wall = new THREE.Mesh(geometry, material);
    wall.position.copy(ptA);
    wall.lookAt(ptB);

    wall.castShadow = true;
    wall.receiveShadow = true;


    return wall

}

/*

    reflectionCube = setCubeMap()

    scene = new THREE.Scene();
    scene.background = reflectionCube

    */

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

    container.appendChild(renderer.domElement);

    reflectionCube = setCubeMap()

    scene = new THREE.Scene();
    scene.background = reflectionCube


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

}

function setControls() {


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {

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

    var ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    var sun = setSunlight()
    scene.add(sun);

}

function setSunlight() {

    //sets the sun 
    var c1 = 0xffffff
    var lightArray = []

    // light
    var light = new THREE.DirectionalLight(c1, 0.6);
    light.position.set(100, 1000, 500);
    light.castShadow = true;
    light.radius = 1000
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    // light.shadow.mapSize.width = 5000;
    // light.shadow.mapSize.height = 5000;
    lightArray.push(light);

    var d = 100;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 3500;
    light.shadow.bias = -0.0001;

    return light

}





function generateFacadeTexture(params, isAlpha) {


    // build a small canvas 32x64 and paint it in white

    let scl = 25
    var canvas = document.createElement('canvas');

    // console.log(params.length, params.height)
    canvas.width = params.length * scl;
    canvas.height = params.height * scl;
    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let stepY = params.spacingY * scl

    // console.log('stepY')

    let stepX = params.spacingX * scl
    let i = 0
    let j = 0


    for (var y = 0; y < canvas.height; y += stepY) {


        for (var x = 0; x < canvas.width; x += stepX) {

            var value = Math.floor(Math.random() * 64);

            context.fillStyle = 'rgb(' + [34, 155 + value, 215].join(',') + ')';


            if (isAlpha) {

                console.log('alpha!')
                value = 50
                context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';

            }


            if (params.checkerBoard) {

                if (i % 2 == 0 & j % 2 == 0 || i % 2 != 0 & j % 2 != 0) {

                    context.fillStyle = 'white';

                }


            }




            context.fillRect(x, y, stepX, stepY);

            let t = params.parameter



            context.fillStyle = 'white';
            context.fillRect(x, y, stepX, stepY * t);
            context.fillRect(x, y + stepY * t, stepX, stepY * t)




            // if (!params.alpha){

            context.lineWidth = 5;

            context.strokeStyle = 'white';
            context.stroke();
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, y + stepY);

            context.strokeStyle = 'white';
            context.stroke();
            context.beginPath();
            context.moveTo(x + stepX, y);
            context.lineTo(x + stepX, y + stepY);


            context.lineWidth = 10;

            context.strokeStyle = 'white';
            context.stroke();
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + stepX, y);

            context.strokeStyle = 'white';
            context.stroke();
            context.beginPath();
            context.moveTo(x , y + stepY);
            context.lineTo(x + stepX, y + stepY);
            // context.lineWidth = 5;
            // }


            j++

        }

        j = 0

        i++

    }


    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;

    return canvas;
}



function generateFacadeTextureOld(params) {


    // build a small canvas 32x64 and paint it in white
    var canvas = document.createElement('canvas');

    // console.log(params.length, params.height)
    canvas.width = params.length * 10;
    canvas.height = params.height * 10;
    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let stepY = params.spacingY * 10

    // console.log('stepY')

    let stepX = params.spacingX * 10
    let i = 0
    let j = 0


    for (var y = 0; y < canvas.height; y += stepY) {


        for (var x = 0; x < canvas.width; x += stepX) {

            var value = Math.floor(Math.random() * 64);

            context.fillStyle = 'rgb(' + [34, 155 + value, 215].join(',') + ')';


            if (params.alpha) {
                value = 50
                context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';

            }


            if (params.checkerBoard) {

                if (i % 2 == 0 & j % 2 == 0 || i % 2 != 0 & j % 2 != 0) {

                    context.fillStyle = 'white';

                }


            }




            context.fillRect(x, y, stepX, stepY);

            // let t = params.parameter

            let t = 0.25

            context.fillStyle = 'white';
            context.fillRect(x, y, stepX, stepY * (0.2));
            context.fillRect(x, y + stepY * (0.2), stepX, stepY * (0.2));





            if (isAlpha) {

                context.strokeStyle = 'silver';
                context.stroke();
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y + stepY);
                context.lineWidth = 2;

                context.strokeStyle = 'white';
                context.stroke();
                context.beginPath();
                context.moveTo(x + stepX, y);
                context.lineTo(x + stepX, y + stepY);
                context.lineWidth = 2;
            }


            j++

        }

        j = 0

        i++

    }


    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;

    return canvas;
}









function generateTextureCanvas() {
    // build a small canvas 32x64 and paint it in white
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 64;
    var context = canvas.getContext('2d');
    // plain it in white
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 32, 64);

    for (var y = 2; y < 64; y += 2) {
        for (var x = 0; x < 32; x += 2) {
            var value = Math.floor(Math.random() * 64);
            context.fillStyle = 'rgb(' + [34, 155 + value, 215].join(',') + ')';
            context.fillRect(x, y, 2, 1);
        }
    }

    // build a bigger canvas and copy the small one in it
    // This is a trick to upscale the texture without filtering
    var canvas2 = document.createElement('canvas');
    canvas2.width = 1024;
    canvas2.height = 2048;
    var context = canvas2.getContext('2d');
    // disable smoothing
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    // then draw the image
    context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
    // return the just built canvas2
    return canvas2;
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