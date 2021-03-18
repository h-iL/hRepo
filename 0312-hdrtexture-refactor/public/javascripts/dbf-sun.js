console.log('procedural texture')


import Utils from './utils.js'

var Sun = function(scene) {

    return new Sun.init(scene)

}


Sun.prototype = {

    init: function() {

        const scope = this

        scope.sun = scope.createSun()
            // scope.scene.add(scope.sun.light)
        scope.updateSun()
            // this.createAmbient()
            // this.createHemisphere()

        // return this.sun

    },

    getLight: function() {

        return this.sun.light

    },

    getMesh: function(){

        console.log('get mesh')

        const geometry = new THREE.SphereGeometry( 10, 32, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        const sphere = new THREE.Mesh( geometry, material );
        let position = this.sun.light.position
        sphere.position.set(position.x, position.y, position.z)

        return sphere 



    },

    createSun: function(params) {

        const scope = this
        const { radius } = scope.props
        const sun = {}

        sun.position = new THREE.Vector3()
        sun.light = scope.createLight()
        // sun.mesh = scope.getMesh()

        return sun;
    },

    createLight: function(params){


        const light = new THREE.DirectionalLight(0xffffff, 0.3);

        light.castShadow = true;
        light.radius = 1 //tj_note:: changed from 25 to 1
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        const d = 100;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.far = 5000;
        light.shadow.bias = -0.0001;

        return light 

    },

    createMesh: function(params)
{
    },

    getSunPosition: function(time, lat, lng) {

        const scope = this
        const result = SunCalc.getPosition(time, lat, lng)

        return Utils.sph2cart(scope.props.radius, result)

    },

    updateSun: function() {

        const scope = this
        const { sun } = scope
        const { radius, coords, date, time } = scope.props
        const now = Utils.getTime({ date: date, time: time, coords: coords })

        const position = scope.getSunPosition(now, coords.lat, coords.lng)
        sun.light.position.set(position.x, position.y, position.z)
            // console.log('Position is:: ', position)



    },

    updateSpecials: function() {

    },

    createAmbient: function() {

    },

    createHemisphere: function() {

    },

    toggle: function(light) {

    }

}

Sun.init = function(scene) {

    this.scene = scene

    this.props = {
        time: {
            hour: 10,
            minute: 36
        },
        date: {
            year: 2021,
            month: 3,
            day: 17
        },
        radius: 500,
        coords: {
            lat: 34.6937,
            lng: 135.5023
        },
        specials: {
            sunrise: null,
            sunset: null
        }

    }

    this.config = {
        sun: true,
        halos: true,
        ambient: true,
    }

    this.init()


}

Sun.init.prototype = Sun.prototype

export default Sun