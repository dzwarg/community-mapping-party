const _track = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'LineString',
        coordinates: []
    }
}

/**
 * Welcome splash
 */
const myModal = new bootstrap.Modal('#splash');
myModal.show();

/**
 * Custom map control to show help.
 */
function HelpControl(modal) {
    this._modal = modal;
}

HelpControl.prototype.helpListener = function () {
    this._modal.show();
}

HelpControl.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const btn = document.createElement('button');
    btn.className = 'cmp-ctrl-help';
    btn.addEventListener('click', this.helpListener.bind(this));

    const span = document.createElement('span');
    span.className = 'mapboxgl-ctrl-icon';
    btn.appendChild(span);

    this._container.appendChild(btn);
    return this._container;
};

HelpControl.prototype.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
};

/**
 * Custom map control to download the track.
 */
function TrackControl(feature) {
    this._feature = feature
}

TrackControl.prototype.downloadListener = function() {
    const track = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>

<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" creator="dzwarg/community-mapping-party" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">
  <metadata>
    <link href="http://dzwarg.github.io/community-mapping-party">
      <text>Community Mapping Party</text>
    </link>
    <time>${(new Date()).toUTCString()}</time>
  </metadata>
  <trk>
    <name>Simple GPX Document</name>
    <trkseg>
      ${this._feature.geometry.coordinates.map(function (item) {
        return `<trkpt lat="${item.lat}" lon="${item.lon}">
        <ele>${item.ele}</ele>
        <time>${item.time}</time>
      </trkpt>`;
      }).join('')}
    </trkseg>
  </trk>
</gpx>`

    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(track));
    element.setAttribute('download', 'track.gpx');
I
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

TrackControl.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const btn = document.createElement('button');
    btn.className = 'cmp-ctrl-track';
    btn.addEventListener('click', this.downloadListener.bind(this));

    const span = document.createElement('span');
    span.className = 'mapboxgl-ctrl-icon';
    btn.appendChild(span);

    this._container.appendChild(btn);
    return this._container;
};

TrackControl.prototype.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
};

/**
 * Map initialization
 */
mapboxgl.accessToken = 'pk.eyJ1IjoiZHp3YXJnMiIsImEiOiJja2VidXkweWwwY2hqMnFvYXZwOG51MDBoIn0.5tG41YFoo3NHZsHYR-12LA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
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

geolocate.on('geolocate', function (evt) {
    _track.geometry.coordinates.push([
        evt.coords.longitude , evt.coords.latitude 
    ]);
    this._map.getSource('track').setData(_track)
    console.log(`track length: ${_track.geometry.coordinates.length}`)
});

map.addControl(new TrackControl(_track));
map.addControl(new HelpControl(myModal));

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
