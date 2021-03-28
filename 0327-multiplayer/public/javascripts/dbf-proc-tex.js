console.log('procedural texturing')
let reflectionCube
let refractionCube

export function textureBlock(params) {

    let obj = {
        envelope: [],
        slabs: []
    }

    let meshes = []

    const {
        blocks
    } = params.solution
    reflectionCube = params.reflection
    refractionCube = params.refraction

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

        // let envelope = applyBlockTexture({shape:shape, translate:translate, rotate:rotate, scale:scale, floorHeight:f2f}) 
        let envelope = applyBlockTexture(shape, translate, rotate, scale, f2f)
        let slabs = applySlabs(block)

        envelope.forEach(mesh => obj.envelope.push(mesh))
        slabs.forEach(mesh => obj.slabs.push(mesh))

    }

    return obj

}

export function updateTexture(params) {

    // console.log('update texture')

    let options = {
        a:Math.random()*0.75+0.25,
        b:Math.random()*5+1,
        c:1,
        d:0 // checkerboard 
    }

    if (Math.random()>0.6){
        options.d = 1 
    }



    let result = params.meshes.map(mesh=>updateProceduralTexture(mesh,options)) // applies texture to 
    

    return params.meshes


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

        // console.log('h', h)

        let translation = new THREE.Vector3(block_translation.x, block_translation.y + h - slabThickness / 3, block_translation.z)
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

        // scene.add(slabMesh)
        slabs.push(slabMesh)

    }

    return slabs

}


function applyBlockTexture(shape, translate, rotate, scale, f2f) {


    let facadeMeshes = extrudePolygonEdges(shape, translate, f2f, scale) // returns array of boxes 
    facadeMeshes = updateTexture({meshes:facadeMeshes}) // apply textures 

    return facadeMeshes


}


function updateProceduralTexture(mesh, options){

    let {a,b,c,d} = options

        mesh.material = proceduralTexture({

            length: mesh.geometry.parameters.depth,
            height: mesh.geometry.parameters.height,
            windowRatio: a,
            offsetX: b,
            offsetY: mesh.floorHeight*c,
            checkerboard: d, 

        })

        return mesh 
}


function extrudePolygonEdges(shape, translate, floorHeight, scale) {

    let arr = []

    for (var i = -1; i < shape.length - 1; i++) {

        let a = shape[i]

        if (i == -1) {
            a = shape[shape.length - 1]
        }

        let b = shape[i + 1]
        let height = floorHeight * scale.y
        let elev = translate.y

        let ptA = new THREE.Vector3(a.x + translate.x, a.y, a.z + translate.z)
        let ptB = new THREE.Vector3(b.x + translate.x, b.y, b.z + translate.z)
        let mesh = extrudeWall(ptA, ptB, height, elev, floorHeight) // refactor 
        mesh.floorHeight = floorHeight

        arr.push(mesh)

    }

    return arr

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
        checkerBoard: params.checkerboard,

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

    return material

}


function extrudeWall(ptA, ptB, height, elev, f2f) {

    var thickness = 0.1
    var length = ptA.distanceTo(ptB)
    var geometry = new THREE.BoxGeometry(thickness, height, length); // align length with z-axis
    geometry.translate(0, height / 2 + elev, length / 2); // so one end is at the origin
    var wall = new THREE.Mesh(geometry);
    wall.position.copy(ptA);
    wall.lookAt(ptB);
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall

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

                // console.log('alpha!')
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
            context.moveTo(x, y + stepY);
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