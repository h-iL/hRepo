function sph2cart(r, d) {

    const x = r * Math.cos(d.altitude) * Math.cos(d.azimuth)
    const y = r * Math.cos(d.altitude) * Math.sin(d.azimuth)
    const z = r * Math.sin(d.altitude)

    return new THREE.Vector3(x, z, y)


}

function getTime(params) {

    const { date, time, coords } = params

    const offset = new Date().getTimezoneOffset()
    const timezone = tzlookup(coords.lat, coords.lng)

    const now = moment().year(date.year).month(date.month - 1).date(date.day).hour(time.hour).minute(time.minute)
    const localTime = now.tz(timezone)

    const adjusted = now.add(-offset - localTime._offset, 'minutes')

    return adjusted

}


function toggleFromScene(params) {

    const { item, scene, bool } = params

    if (bool === true) {
        scene.add(item)
        return;
    }

    scene.remove(item)
}


export default {
    getTime: getTime,
    toggleFromScene: toggleFromScene,
    sph2cart: sph2cart
}