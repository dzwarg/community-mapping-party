/**
 * Custom map control to show status.
 */
function StatusControl(status) {
    this._status = status
}

StatusControl.prototype.formatMessage = function() {
    return `${this._status['track'] ? '✛' : '❖'} | ⎓ ${this._status['length']}`
}

StatusControl.prototype.setMessage = function(type, message) {
    this._status[type] = message;

    const div = this._container.querySelector('div.mapboxgl-ctrl-attrib-inner');
    div.innerText = this.formatMessage();
}

StatusControl.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-attrib';

    const div = document.createElement('div');
    div.className = 'mapboxgl-ctrl-attrib-inner';
    div.innerText = this.formatMessage();

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