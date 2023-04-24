/**
 * Custom map control to show help.
 */
function HelpControl() {
    this._modal = null
}

/**
 * Show the modal when the help button is pressed.
 */
HelpControl.prototype.show = function () {
    this._modal.show();
}

HelpControl.prototype.init = function() {
    this._modal = new bootstrap.Modal('#splash');
}

HelpControl.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const btn = document.createElement('button');
    btn.className = 'cmp-ctrl-help';
    btn.addEventListener('click', this.show.bind(this));

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

export default HelpControl;