/**
*图层切换（切换底图）
*@module controls
*@class DCI.Controls.LayerSwitch
*@extends L.Control
*/
define("controls/layerswitch", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Controls.LayerSwitch = L.Control.extend({
        options: {
            collapsed: true,
            position: 'topright',
            autoZIndex: true
        },
        isbase:true,
        initialize: function (baseLayers, overlays, options) {
            L.setOptions(this, options);
            
            this._layers = {};
            this._lastZIndex = 0;
            this._handlingClick = false;

            for (var i in baseLayers) {
                this._addLayer(baseLayers[i], i);
            }

            for (i in overlays) {
                this.isbase = false;
                this._addLayer(overlays[i], i, true);
            }
        },

        onAdd: function (map) {
            this._initLayout();
            this._update();

            map
                .on('layeradd', this._onLayerChange, this)
                .on('layerremove', this._onLayerChange, this);

            return this._container;
        },

        onRemove: function (map) {
            map
                .off('layeradd', this._onLayerChange, this)
                .off('layerremove', this._onLayerChange, this);
        },

        addBaseLayer: function (layer, name) {
            this._addLayer(layer, name);
            this._update();
            return this;
        },

        addOverlay: function (layer, name) {
            this._addLayer(layer, name, true);
            this._update();
            return this;
        },

        removeLayer: function (layer) {
            var id = L.stamp(layer);
            delete this._layers[id];
            this._update();
            return this;
        },

        _initLayout: function () {
            var className = 'leaflet-control-layers',
                container = this._container = L.DomUtil.create('div', className);

            //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
            container.setAttribute('aria-haspopup', true);
            if (this.isbase) {
                container.setAttribute('style', "background-image:url('/themes/default/images/controls/layerswitch/bg.base.png');background-repeat:no-repeat");
            } else {
                container.setAttribute('style', "background-image:url('/themes/default/images/controls/layerswitch/bg.theme.png');background-repeat:no-repeat");
            }
            if (!L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(container)
                    .disableScrollPropagation(container);
            } else {
                L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
            }

            var form = this._form = L.DomUtil.create('form', className + '-list');

            if (this.options.collapsed) {
                if (!L.Browser.android) {
                    L.DomEvent
                        .on(container, 'mouseover', this._expand, this)
                        .on(container, 'mouseout', this._collapse, this);
                }
                var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
                link.href = '#';
                link.title = 'Layers';

                if (L.Browser.touch) {
                    L.DomEvent
                        .on(link, 'click', L.DomEvent.stop)
                        .on(link, 'click', this._expand, this);
                }
                else {
                    L.DomEvent.on(link, 'focus', this._expand, this);
                }
                L.DomEvent.on(form, 'click', function () {
                    setTimeout(L.bind(this._onInputClick, this), 0);
                }, this);

                this._map.on('click', this._collapse, this);
                // TODO keyboard accessibility
            } else {
                this._expand();
            }

            this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
            this._separator = L.DomUtil.create('div', className + '-separator', form);
            this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

            container.appendChild(form);
        },

        _addLayer: function (layer, name, overlay) {
            var id = L.stamp(layer);

            this._layers[id] = {
                layer: layer,
                name: name,
                overlay: overlay
            };

            if (this.options.autoZIndex && layer.setZIndex) {
                this._lastZIndex++;
                layer.setZIndex(this._lastZIndex);
            }
        },

        _update: function () {
            if (!this._container) {
                return;
            }

            this._baseLayersList.innerHTML = '';
            this._overlaysList.innerHTML = '';

            var baseLayersPresent = false,
                overlaysPresent = false,
                i, obj;

            for (i in this._layers) {
                obj = this._layers[i];
                this._addItem(obj);
                overlaysPresent = overlaysPresent || obj.overlay;
                baseLayersPresent = baseLayersPresent || !obj.overlay;
            }

            this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
        },

        _onLayerChange: function (e) {
            var obj = this._layers[L.stamp(e.layer)];

            if (!obj) { return; }

            if (!this._handlingClick) {
                this._update();
            }

            var type = obj.overlay ?
                (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
                (e.type === 'layeradd' ? 'baselayerchange' : null);

            if (type) {
                this._map.fire(type, obj);
            }
        },

        // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
        _createRadioElement: function (name, checked) {

            var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
            if (checked) {
                radioHtml += ' checked="checked"';
            }
            radioHtml += '/>';

            var radioFragment = document.createElement('div');
            radioFragment.innerHTML = radioHtml;

            return radioFragment.firstChild;
        },

        _addItem: function (obj) {
            var label = document.createElement('label'),
                input,
                checked = this._map.hasLayer(obj.layer);

            if (obj.overlay) {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'leaflet-control-layers-selector';
                input.defaultChecked = checked;
            } else {
                input = this._createRadioElement('leaflet-base-layers', checked);
            }

            input.layerId = L.stamp(obj.layer);
            input.setAttribute('style', "display:none;");
            //L.DomEvent.on(input, 'click', this._onInputClick, this);

            var name = document.createElement('span');
            name.innerHTML = ' ' + obj.name;

            label.appendChild(input);
            label.appendChild(name);
            //label.setAttribute();
            if (checked) {
                label.setAttribute("style", "background:#6699FF;cursor:pointer;padding:5px;");
            } else {
                label.setAttribute("style", "cursor:pointer;padding:5px;");
            }
            L.DomEvent.on(label, 'mouseover', this._onLabelMouseover, this);
            L.DomEvent.on(label, 'mouseout', this._onLabelMouseout, this);
            L.DomEvent.on(label, 'click', this._onLabelClick, this);
            L.DomEvent.on(label, 'click', this._onInputClick, this);

            var container = obj.overlay ? this._overlaysList : this._baseLayersList;
            container.appendChild(label);

            return label;
        },
        _onLabelMouseover:function(obj){
            obj.currentTarget.setAttribute("style", "background:#006699;cursor:pointer;padding:5px;");
        },
        _onLabelMouseout: function (obj) {
            var inputs = obj.currentTarget.getElementsByTagName('input');
            var input = inputs[0];
            if (input.checked) {
                obj.currentTarget.setAttribute("style", "background:#6699FF;cursor:pointer;padding:5px;");
            } else {
                obj.currentTarget.setAttribute("style", "cursor:pointer;padding:5px;");
            }
        },
        _onLabelClick:function(obj){
            var inputs = obj.currentTarget.getElementsByTagName('input');
            var input = inputs[0];
            input.checked = !input.checked;
            if (input.checked) {
                obj.currentTarget.setAttribute("style", "background:#6699FF;cursor:pointer;padding:5px;");
            } else {
                obj.currentTarget.setAttribute("style", "cursor:pointer;padding:5px;");
            }
            if (this.isbase) {
                //cancel other
                var others = obj.currentTarget.parentNode.childNodes;
                for (var i = 0; i < others.length; i++) {
                    var o = others[i];
                    var inps = o.getElementsByTagName('input');
                    var inp = inps[0];
                    if (inp.checked) {
                        o.setAttribute("style", "background:#6699FF;cursor:pointer;padding:5px;");
                    } else {
                        o.setAttribute("style", "cursor:pointer;padding:5px;");
                    }
                }
            }
        },
        _onInputClick: function () {
            var i, input, obj,
                inputs = this._form.getElementsByTagName('input'),
                inputsLen = inputs.length;

            this._handlingClick = true;

            for (i = 0; i < inputsLen; i++) {
                input = inputs[i];
                obj = this._layers[input.layerId];

                if (input.checked && !this._map.hasLayer(obj.layer)) {
                    this._map.addLayer(obj.layer);

                } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                    this._map.removeLayer(obj.layer);
                }
            }

            this._handlingClick = false;

            this._refocusOnMap();
        },

        _expand: function () {
            L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
            this._container.setAttribute('style', '');
        },

        _collapse: function () {
            this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
            if (this.isbase) {
                this._container.setAttribute('style', "background-image:url('/themes/default/images/controls/layerswitch/bg.base.png');background-repeat:no-repeat");
            } else {
                this._container.setAttribute('style', "background-image:url('/themes/default/images/controls/layerswitch/bg.theme.png');background-repeat:no-repeat");
            }
        }
    });
    L.DCI.layerswitch = function (baseLayers, overlays, options) {
        return new L.DCI.Controls.LayerSwitch(baseLayers, overlays, options);
    };
    L.DCI.layerswitch2 = function (baseLayers, overlays, options) {
        return new L.DCI.Controls.LayerSwitch(baseLayers, overlays, options);
    };
});