/**
 * Global feature to store tracks.
 */
const _track = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'LineString',
        coordinates: []
    }
}

import HelpControl from './js/HelpControl.js'
import TrackControl from './js/TrackControl.js'
import StatusControl from './js/StatusControl.js'

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
    _track.geometry.coordinates.push([
        evt.coords.longitude, // X
        evt.coords.latitude,  // Y
        evt.coords.altitude,  // Z
        (new Date(evt.timestamp)).toISOString() // unspecified; time
    ]);

    this._map.getSource('track').setData(_track);

    status.setMessage('length', _track.geometry.coordinates.length);
});

map.addControl(new TrackControl(_track));

const help = new HelpControl();
help.init()
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
            'line-color': '#0c0',
            'line-width': 5
        }
    })
})