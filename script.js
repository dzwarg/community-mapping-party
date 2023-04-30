import HelpControl from './js/HelpControl.js'
import TrackControl from './js/TrackControl.js'
import StatusControl from './js/StatusControl.js'

/**
 * Global feature to store tracks.
 */
const _track = {
    type: 'FeatureCollection',
    features: []
}
const _featureTemplate = {
    type: 'Feature',
    properties: {
        'line-color': '#000'
    },
    geometry: {
        type: 'LineString',
        coordinates: []
    }
}
let _addTrack = true
const randomColor = function() {
    const ish = Math.random()
    const randByte = () => Math.round(((Math.random() * 55) + 200))
    const cmps = {r:0,g:0,b:0}
    if (ish < 1/12) {
        cmps.b = randByte()
        cmps.r = randByte()
    } else if (ish < 3/12) {
        cmps.r = randByte()
    } else if (ish < 5/12) {
        cmps.g = randByte()
        cmps.r = randByte()
    } else if (ish < 7/12) {
        cmps.g = randByte()
    } else if (ish < 9/12) {
        cmps.g = randByte()
        cmps.b = randByte()
    } else if (ish < 11/12) {
        cmps.b = randByte()
    } else {
        cmps.r = randByte()
        cmps.b = randByte()
    }
    return `rgb(${cmps.r},${cmps.g},${cmps.b})`
}

/**
 * Map initialization
 */
mapboxgl.accessToken = 'pk.eyJ1IjoiZHp3YXJnMiIsImEiOiJja2VidXkweWwwY2hqMnFvYXZwOG51MDBoIn0.5tG41YFoo3NHZsHYR-12LA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/dzwarg2/clekuzenb000v01ps32sectby', // style URL
    center: [-70.187361, 43.802546], // starting position [lng, lat]
    zoom: 16 // starting zoom
});

// Add geolocate control to the map.
const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true
});
map.addControl(geolocate);

// Required global resources for wake/lock
let timeout = null,
    wakelock = null,
    release = function () {
        if (wakelock) wakelock.release();
        timeout = null;

        status.setMessage('track', false);
    };

geolocate.on('geolocate', function (evt) {
    // this timeout and wakelock are used inside of the geolocate event, since we can't detect
    // when a user turns on or off geolocation, except that geolocate events are happening.
    if (!timeout) {
        timeout = setTimeout(release, 5000)

        navigator.wakeLock.request("screen")
            .then(function (sentinel) {
                wakelock = sentinel;
                status.setMessage('track', true);
            })
            .catch(function (err) {
                // the wake lock request fails - usually system related, such being low on battery
                console.log(`${err.name}, ${err.message}`);
            })
    } else {
        // renew timeout
        clearTimeout(timeout)
        timeout = setTimeout(release, 5000)
    }

    // store the geolocated point
    _track.features[_track.features.length-1].geometry.coordinates.push([
        evt.coords.longitude, // X
        evt.coords.latitude,  // Y
        evt.coords.altitude,  // Z
        (new Date(evt.timestamp)).toISOString() // unspecified; time
    ]);

    this._map.getSource('track').setData(_track);

    status.setMessage('length', _track.features[_track.features.length-1].geometry.coordinates.length);
});

map.addControl(new TrackControl(_track));

const help = new HelpControl();
help.show()
map.addControl(help);

const status = new StatusControl({track: false, length: 0});
map.addControl(status);

map.on('load', () => {
    map.addSource('track', {
        'type': 'geojson',
        'data': _track
    })

    map.addLayer({
        id: 'track',
        type: 'line',
        source: 'track',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': ['get', 'line-color'],
            'line-width': 5
        }
    })

    const geolocateElem = document.getElementsByClassName('mapboxgl-ctrl-geolocate')[0]
    geolocateElem.addEventListener('click', function (evt) {
        const pressed = evt.target.parentNode.ariaPressed === 'true'
        if (pressed & _addTrack) {
            console.log('created new track')
            const newFeature = Object.assign({}, _featureTemplate)
            newFeature.properties['line-color'] = randomColor()
            _track.features.push(newFeature)
            _addTrack = false
        } else if (!pressed) {
            _addTrack = true
        }
    })

})