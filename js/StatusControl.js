/**
 * Custom map control to show status.
 */
function StatusControl(message) {
    this._message = message
}

StatusControl.prototype.setMessage = function(message) {
    this._message = message

    const div = this._container.querySelector('div.mapboxgl-ctrl-attrib-inner')
    div.innerText = this._message
}

StatusControl.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-attrib';

    const div = document.createElement('div');
    div.className = 'mapboxgl-ctrl-attrib-inner';
    div.innerText = this._message;

    this._container.appendChild(div);
    return this._container;
};

StatusControl.prototype.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
};

StatusControl.prototype.getDefaultPosition = function() {
    return 'bottom-right';
};

export default StatusControl;