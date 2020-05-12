/**
*图形切换
*@module controls
*@class DCI.Controls.GroupedLayers
*@extends L.Control
*/
define("controls/groupedlayer", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Controls.GroupedLayers = L.Control.extend({

        options: {
            collapsed: true,    
            position: 'topright',
            autoZIndex: true,
            exclusiveGroups: []
        },

        initialize: function (baseLayers, groupedOverlays, options) {
            var i, j;
            L.Util.setOptions(this, options);

            this._layers = {};
            this._baseLayers = baseLayers;
            this._lastZIndex = 0;
            this._handlingClick = false;
            this._groupList = [];
            this._domGroups = [];

            for (i in baseLayers) {
                for (var j in baseLayers[i]) {
                    this._addLayer(baseLayers[i][j], j, i, false);
                }
            }

            for (i in groupedOverlays) {
                for (var j in groupedOverlays[i]) {
                    this._addLayer(groupedOverlays[i][j], j, i, true);
                }
            }
        },
        getBody: function (map) {
            this._map = map;
            this._initLayout();
            this._update();
            map
                .on('layeradd', this._onLayerChange, this)
                .on('layerremove', this._onLayerChange, this);
            return this._container;
        },
        onAdd: function (map) {
            this._map = map;
            this._initLayout();
            this._update();
            map
                .on('layeradd', this._onLayerChange, this)
                .on('layerremove', this._onLayerChange, this);
            return this._container;
        },


        onRemove: function (map) {
            map
                .off('layeradd', this._onLayerChange)
                .off('layerremove', this._onLayerChange);
        },

        addBaseLayer: function (layer, name) {
            this._addLayer(layer, name);
            this._update();
            return this;
        },

        addOverlay: function (layer, name, group) {
            this._addLayer(layer, name, group, true);
            this._update();
            return this;
        },

        removeLayer: function (layer) {
            var id = L.Util.stamp(layer);
            delete this._layers[id];
            this._update();
            return this;
        },
        clearLayer: function () {
            for (var id in this._layers) {
                delete this._layers[id];
            }
            this._update();
        },


        _initLayout: function () {
            var className = 'leaflet-control-layers',
                container = this._container = L.DomUtil.create('div', className);
            L.DomUtil.addClass(this._container, 'baselayer-control');
            
            container.setAttribute('aria-haspopup', true);

            var form = this._form = L.DomUtil.create('form', className + '-list');
            

            if (this.options.collapsed) {               
                var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
                link.href = '#';
                link.title = '背景底图';

                L.DomEvent.on(link, 'click', this._expandOrCollapse, this);
                L.DomEvent.addListener(link, 'click', function (e) {
                    L.DomEvent.stopPropagation(e);
                });
                L.DomEvent.addListener(link, 'dblclick', function (e) {
                    L.DomEvent.stopPropagation(e);
                });
                
            }

            this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
            this._separator = L.DomUtil.create('div', className + '-separator', form);
            this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
            L.DomUtil.create('span', 'leaflet-control-layers-list-tip', form);
            container.appendChild(form);
        },

        _addLayer: function (layer, name, group, overlay) {
            var id = L.Util.stamp(layer);

            this._layers[id] = {
                layer: layer,
                name: name,
                overlay: overlay
            };

            group = group || '';
            var groupId = this._groupList.indexOf(group);

            if (groupId === -1) {
                groupId = this._groupList.push(group) - 1;
            }

            var exclusive = (this.options.exclusiveGroups.indexOf(group) != -1);

            this._layers[id].group = {
                name: group,
                id: groupId,
                exclusive: exclusive
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
            this._domGroups.length = 0;

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
            var obj = this._layers[L.Util.stamp(e.layer)];

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
            var container, label,input;
            //快捷图层切换
            if (obj.overlay) {
                label = document.createElement('label'),
                checked = this._map.hasLayer(obj.layer);
                if (obj.overlay) {
                    if (obj.group.exclusive) {
                        groupRadioName = 'leaflet-exclusive-group-layer-' + obj.group.id;
                        input = this._createRadioElement(groupRadioName, checked);
                    } else {
                        input = document.createElement('input');
                        input.type = 'checkbox';
                        input.className = 'leaflet-control-layers-selector';
                        input.defaultChecked = checked;
                    }
                } else {
                    input = this._createRadioElement('leaflet-base-layers', checked);
                }

                input.layerId = L.Util.stamp(obj.layer);

                L.DomEvent.on(input, 'click', this._onInputClick, this);

                var name = document.createElement('span');
                name.innerHTML = ' ' + obj.name;

                label.appendChild(input);
                label.appendChild(name);
            } else {
                var label = document.createElement('div');
                label.className = "leaflet-control-layers-group-tile";
                label.id = "leaflettile=" + obj.layer.options.id;
                label.style.backgroundImage = "url('themes/default/" + obj.layer.options.img + "')";
                var subLabel = document.createElement('div');
                subLabel.className = "layer-group-tile-des";
                subLabel.id = "leaflettilesub=" + obj.layer.options.id;
                subLabel.layerId = L.Util.stamp(obj.layer);
                subLabel.layerStatus = false;
                var span = document.createElement("span");
                span.innerHTML = obj.name;
                span.id = "leaflettilespan=" + obj.layer.options.id;
                subLabel.appendChild(span);
                label.appendChild(subLabel);
                if (obj.layer.options.id == "baseLayer") {
                    subLabel.style.backgroundColor = "#32b4ff";
                    subLabel.layerStatus = true;
                }
                L.DomEvent.on(label, 'click', this._changeBaseLayer, this);
            }

            if (obj.overlay) {
                container = this._overlaysList;

                var groupContainer = this._domGroups[obj.group.id];

                // Create the group container if it doesn't exist
                if (!groupContainer) {
                    groupContainer = document.createElement('div');
                    groupContainer.className = 'leaflet-control-layers-group';
                    groupContainer.id = 'leaflet-control-layers-group-' + obj.group.id;

                    var groupLabel = document.createElement('span');
                    groupLabel.className = 'leaflet-control-layers-group-name';
                    groupLabel.innerHTML = obj.group.name;

                    groupContainer.appendChild(groupLabel);
                    container.appendChild(groupContainer);

                    this._domGroups[obj.group.id] = groupContainer;
                }

                container = groupContainer;
            } else {
                container = this._baseLayersList;
                var groupContainer = this._domGroups[obj.group.id];

                // Create the group container if it doesn't exist
                if (!groupContainer) {
                    groupContainer = document.createElement('div');
                    groupContainer.className = 'leaflet-control-layers-group';
                    groupContainer.id = 'leaflet-control-layers-group-' + obj.group.id;

                    var groupLabel = document.createElement('span');
                    groupLabel.className = 'leaflet-control-layers-group-name';
                    groupLabel.innerHTML = obj.group.name;

                    groupContainer.appendChild(groupLabel);
                    container.appendChild(groupContainer);

                    this._domGroups[obj.group.id] = groupContainer;
                }
            }
            container.appendChild(label);

            return label;
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
        },

        addLayerByName: function(name) {
            var inputs = this._form.getElementsByTagName('input'),
                inputsLen = inputs.length;
            for (var i = 0; i < inputsLen; i++) {
                var text = inputs[i].nextSibling.innerText.replace(/(^\s+)|(\s+$)/g, "");
                if (text == name) {
                    inputs[i].click();
                    break;
                }
            }
        },

        /**
        *展开或隐藏控件
        *@method _expandOrCollapse
        *@private
        */
        _expandOrCollapse: function (e) {
            //判断是否打开了时间轴，若打开则关闭。二者为互斥事件
            var timeEle = $("#timeslider-control");
            if (timeEle.hasClass("time-selector-open"))
            {
                timeEle.removeClass("time-selector-open");
                $("#time-selector").fadeOut(500);
            }

            //展开或隐藏
            if (L.DomUtil.hasClass(this._container, 'leaflet-control-layers-open'))
            {
                L.DomUtil.removeClass(this._container, 'leaflet-control-layers-open');
                $(".leaflet-control-layers-list").fadeOut(500);
            }
            else
            {
                L.DomUtil.addClass(this._container, 'leaflet-control-layers-open');
                $(".leaflet-control-layers-list").fadeIn(600);
            }
                
        },

        /*切换底图*/
        _changeBaseLayer: function (e) {
            var id = e.target.id.split('=')[1];
            var con = document.getElementById("leaflettilesub=" + id);
            var obj = this._layers[con.layerId];
            this._handlingClick = true;
            if (con.layerStatus) {
                con.style.backgroundColor = "";
                con.layerStatus = false;
                this._map.removeLayer(obj.layer);
                $(".leaflet-control-layers-toggle").css("background-image", 'url(themes/default/images/controls/grouplayer/kongbai-xiao.png)');
            } else {
                var child = $(".leaflet-control-layers-group-tile").children();
                for (var i = 0; i < child.length; i++) {
                    if (child[i].layerStatus) {
                        child[i].style.backgroundColor = "";
                        child[i].layerStatus = false;
                        var delObj = this._layers[child[i].layerId];
                        this._map.removeLayer(delObj.layer);
                        break;
                    }
                }
                this._map.addLayer(obj.layer);
                obj.layer.bringToBack();
                con.style.backgroundColor = "#32b4ff";
                con.layerStatus = true;
                var img = $(e.currentTarget).css("background-image");
                //下面的字符串处理，主要是针对ie和chrome对字符串解释的误差
                var img2 = img.replace(/\"/g, ""); 
                img2 = img2.replace(/\\/g, "");
                var newImg = img2.substring(0, img2.length - 5);
                var updateImg = newImg + '-xiao.png';
                $(".leaflet-control-layers-toggle").css("background-image", updateImg);
            }
        }
    });

    L.dci.groupedLayers = function (baseLayers, groupedOverlays, options) {
        return new L.DCI.Controls.GroupedLayers(baseLayers, groupedOverlays, options);
    };

    return L.DCI.Controls.GroupedLayers;
});