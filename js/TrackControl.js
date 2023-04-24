/**
 * Custom map control to download the track.
 */
function TrackControl(feature) {
    this._feature = feature
}

/**
 * Simulate a browser download with a GPX file from memory
 */
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
        return `<trkpt lat="${item[1]}" lon="${item[0]}">
        <ele>${item[2]}</ele>
        <time>${item[3]}</time>
      </trkpt>`;
      }).join('')}
    </trkseg>
  </trk>
</gpx>`

    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(track));
    element.setAttribute('download', 'track.gpx');

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

export default TrackControl;