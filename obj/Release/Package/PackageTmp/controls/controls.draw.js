/*
*绘制控件
*/
define("controls/draw", [
    "leaflet",
    "core/dcins",
    "leaflet/draw",
    "leaflet/label",
    "common/plotting"
], function (L) {
    /*绘制点*/
    L.DCI.DrawPoint = L.Draw.Marker.extend({

        lays: null,

        options: {
            clickable: false,
            repeatMode: true,
            declaredClass: 'DrawPoint'
        },

        initialize: function () {
            L.Draw.Marker.prototype.initialize.apply(this, arguments);
            this.options.icon = new L.Icon({
                iconUrl: L.DCI.App.symbol.pointSymbol.iconUrl,
                iconSize: L.DCI.App.symbol.pointSymbol.iconSize,
                iconAnchor: [L.DCI.App.symbol.pointSymbol.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol.iconSize[1] + 10]
            });
            this.options.opacity = L.DCI.App.symbol.pointSymbol.opacity;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Marker.prototype.addHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Marker.prototype.removeHooks.call(this);
        },

        _exist: function (latlng) {
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.marker(latlng, this.options);
                lay.clone = this.clone;
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return L.marker(this.getLatLng(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _fireCreatedEvent: function () {
            this._exist(this._marker.getLatLng());
            L.Draw.Marker.prototype._fireCreatedEvent.call(this);
        },

    });

    /*绘制点2 linghuam add 20160707 传入回调函数，每次画完调用回调 */
    L.DCI.DrawPoint2 = L.Draw.Marker.extend({

        lays: null,

        options: {
            clickable: false,
            repeatMode: false,
            declaredClass: 'DrawPoint2'
        },

        initialize: function () {
            L.Draw.Marker.prototype.initialize.apply(this, arguments);
            this.options.icon = new L.Icon({
                iconUrl: L.DCI.App.symbol.pointSymbol.iconUrl,
                iconSize: L.DCI.App.symbol.pointSymbol.iconSize,
                iconAnchor: [L.DCI.App.symbol.pointSymbol.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol.iconSize[1] + 10]
            });
            this.options.opacity = L.DCI.App.symbol.pointSymbol.opacity;
        },

        enable: function (callback,context) {
            L.Draw.Marker.prototype.enable.call(this);
            this.callback = callback;
            this.context = context;
        },

        addHooks: function () {   //添加事件监听
            this._map.on('mouseup', this.exist, this);
            L.Draw.Marker.prototype.addHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        removeHooks: function () {  //移除事件监听
            this._map.off('mouseup', this.exist, this);
            L.Draw.Marker.prototype.removeHooks.call(this);
        },

        _exist: function (latlng) {
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.marker(latlng, this.options);
                lay.clone = this.clone;
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return L.marker(this.getLatLng(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _fireCreatedEvent: function () {  //绘制完成回调         
            this._exist(this._marker.getLatLng());
            var layer = L.marker(this._marker.getLatLng(), this.options);          
            L.Draw.Marker.prototype._fireCreatedEvent.call(this);
            typeof this.callback === "function" ? this.callback.apply(this.context || this, [{ layer: layer, layerType: this.type }]) : null;
        }
    });

    /*绘制标注*/
    L.DCI.DrawPointText = L.Draw.Marker.extend({

        lays: null,

        options: {
            clickable: true,
            repeatMode: false,
            declaredClass: 'DrawPointText',
        },

        initialize: function () {
            L.Draw.Marker.prototype.initialize.apply(this, arguments);
            this.options.icon = new L.Icon({
                iconUrl: L.DCI.App.symbol.pointSymbol_2.iconUrl,
                iconSize: L.DCI.App.symbol.pointSymbol_2.iconSize,
                iconAnchor: [L.DCI.App.symbol.pointSymbol_2.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol_2.iconSize[1] + 10]
            });
            this.options.opacity = L.DCI.App.symbol.pointSymbol_2.opacity;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Marker.prototype.addHooks.call(this);
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Marker.prototype.removeHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        clone: function () {
            return L.marker(this.getLatLng(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }

        },

        _exist: function (latlng, popup) {
            if (popup == null) {
                this.options.mypopup = {
                    _titles: '',
                    _content: '',
                    statu: 0,
                };
            } else {
                this.options.mypopup = popup;
            };            

            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.marker(latlng, this.options);
                lay.clone = this.clone;

                var _geometry = {
                    style: 'point',
                    ring: latlng,
                };
                var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
                if (mapGroup[q].id == bmap.id) {
                    var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    lay.on('click', function () {
                        var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    }, lay);
                }
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        _fireCreatedEvent: function () {
            this._exist(this._marker.getLatLng());
            L.Draw.Marker.prototype._fireCreatedEvent.call(this);
        }

    });

    /*绘制线*/
    L.DCI.DrawPolyline = L.Draw.Polyline.extend({

        lays: null,

        options: {
            repeatMode: false,
            showLength: false, // Whether to display distance in the tooltip
            clickable: false
        },

        initialize: function () {
            L.Draw.Polyline.prototype.initialize.apply(this, arguments);
            this.options.drawError.color = L.DCI.App.symbol.polylineSymbol.color;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Polyline.prototype.addHooks.call(this);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polylineSymbol.color,
                weight: L.DCI.App.symbol.polylineSymbol.weight,
                clickable: true,
                opacity: L.DCI.App.symbol.polylineSymbol.opacity,
                declaredClass: 'DrawPolyline'
            };
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Polyline.prototype.removeHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (intersects, popup) {
            if (popup == null) {
                this.options.shapeOptions.mypopup = {
                    _titles: '',
                    _content: '',
                    statu: 0,
                };
            } else {
                this.options.shapeOptions.mypopup = popup;
            };

            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.polyline(intersects, this.options.shapeOptions);
                lay.clone = this.clone;

                var _num = Math.round((intersects.length + 1) / 2);                  //取线的中心点
                var _geometry = {
                    style: 'polyline',
                    ring: intersects[_num - 1],
                };
                var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
                if (mapGroup[q].id == bmap.id) {
                    var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    lay.on('click', function () {
                        var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    }, lay);
                }
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return L.polyline(this.getLatLngs(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                for (ly in this.lays[q]._layers) {
                    if (this.lays[q]._layers[ly]._tooltip != null) {
                        this.lays[q]._layers[ly]._tooltip.dispose();
                    }
                    this.lays[q].removeLayer(this.lays[q]._layers[ly]);
                };
            }
        },

        _finishShape: function () {
            this._exist(this._poly.getLatLngs());
            L.Draw.Polyline.prototype._finishShape.call(this);
        }
    });
    //绘制线段  linghuam add 20160708 管线断面分析功能使用
    L.DCI.DrawPath = L.Draw.SimpleShape.extend({
        lay: null,

        statics:{
            TYPE: 'path',
            tooltip_start_txt: '点击拖动绘制直线',
            tooltip_end_txt:'释放鼠标完成绘制',
        },

        options: {
            repeatMode: false,         
            clickable: false
        },

        initialize: function (map,options) {
            L.Draw.SimpleShape.prototype.initialize.call(this,map,options);
            this.type = L.DCI.DrawPath.TYPE;
            this._initialLabelText = L.DCI.DrawPath.tooltip_start_txt;
            this._endLabelText = L.DCI.DrawPath.tooltip_end_txt;         
        },

        enable: function (callback, context) {
            L.Draw.SimpleShape.prototype.enable.call(this);
            this.callback = callback;
            this.context = context;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.SimpleShape.prototype.addHooks.call(this);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polylineSymbol.color,
                weight: L.DCI.App.symbol.polylineSymbol.weight,
                clickable: false,
                opacity: L.DCI.App.symbol.polylineSymbol.opacity,
                declaredClass: 'DrawPath'
            };
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.SimpleShape.prototype.removeHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (intersects) {
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.polyline(intersects, this.options.shapeOptions);
                lay.clone = this.clone;
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return L.polyline(this.getLatLngs(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _drawShape: function (latlng) {
            if (!this._shape) {
                this._shape = new L.Polyline([this._startLatLng, latlng], this.options.shapeOptions);
                this._map.addLayer(this._shape);
            } else {
                this._shape.setLatLngs([this._startLatLng, latlng]);
            }
        },

        _fireCreatedEvent: function () {
            this._exist(this._shape.getLatLngs());         
            var path = new L.Polyline(this._shape.getLatLngs(), this.options.shapeOptions);          
            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, path);
            typeof this.callback === "function" ? this.callback.apply(this.context || this, [{ layer: path, layerType: this.type }]) : null;
        }
    });
    /*绘制面类*/
    L.DCI.DrawPolygon = L.Draw.Polygon.extend({

        lays: null,

        options: {
            repeatMode: false,
            showArea: false,
            clickable: false
        },

        initialize: function () {
            L.Draw.Polygon.prototype.initialize.apply(this, arguments);
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Polygon.prototype.addHooks.call(this);

            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: L.DCI.App.symbol.polygonSymbol.fill,
                fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                clickable: true,
                declaredClass: 'DrawPolygon',
            };
            //if (this._map) {
            //    this._markerGroup = new L.LayerGroup();
            //    this._map.addLayer(this._markerGroup);

            //    this._markers = [];
            //    this._map.on('click', this._onClick, this);
            //    this._mouseMarker.on('contextmenu', function () { this.disable(); }, this);
            //    //this._startShape();
            //}
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Polygon.prototype.removeHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (latlngs, popup) {
            if (popup == null) {
                this.options.shapeOptions.mypopup = {
                    _titles: '',
                    _content: '',
                    statu: 0,
                };
            } else {
                this.options.shapeOptions.mypopup = popup;
            };
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.polygon(latlngs, this.options.shapeOptions);
                lay.clone = this.clone;

                var _geometry = {
                    style: 'polygon',
                    ring: lay.getBounds().getCenter(),
                };
                var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
                if (mapGroup[q].id == bmap.id) {
                    var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    lay.on('click', function () {
                        var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    });
                }
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return L.polygon(this.getLatLngs(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                for (ly in this.lays[q]._layers) {
                    if (this.lays[q]._layers[ly]._tooltip != null) {
                        this.lays[q]._layers[ly]._tooltip.dispose();
                    }
                    this.lays[q].removeLayer(this.lays[q]._layers[ly]);
                };
            }
        },

        _finishShape: function () {
            this._exist(this._poly.getLatLngs());
            L.Draw.Polygon.prototype._finishShape.call(this);
        }
    });
    /*绘制面类2 linghuam add 20160708 传入回调函数*/
    L.DCI.DrawPolygon2 = L.Draw.Polygon.extend({

        lays: null,

        options: {
            repeatMode: false,
            showArea: false,
            clickable: false
        },

        initialize: function () {
            L.Draw.Polygon.prototype.initialize.apply(this, arguments);
        },

        enable: function (callback, context) {
            L.Draw.Polygon.prototype.enable.call(this);
            this.callback = callback;
            this.context = context;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Polygon.prototype.addHooks.call(this);

            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: false,       
                clickable: true,
                declaredClass: 'DrawPolygon2',
                };              
            //if (this._map) {
            //    this._markerGroup = new L.LayerGroup();
            //    this._map.addLayer(this._markerGroup);

            //    this._markers = [];
            //    this._map.on('click', this._onClick, this);
            //    this._mouseMarker.on('contextmenu', function () { this.disable(); }, this);
            //    //this._startShape();
            //}
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Polygon.prototype.removeHooks.call(this);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (latlngs) {
            this.options.shapeOptions.mypopup = {
                _titles: '',
                _content: '',
                statu: 0,
            }
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = L.polygon(latlngs, this.options.shapeOptions);
                lay.clone = this.clone;
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return L.polygon(this.getLatLngs(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _finishShape: function () {
            this._exist(this._poly.getLatLngs());
            var lay = L.polygon(this._poly.getLatLngs(), this.options.shapeOptions);
            typeof this.callback === "function" ? this.callback.apply(this.context || this, [{ layer: lay, layerType: this.type }]) : null;
            L.Draw.Polygon.prototype._finishShape.call(this);
        }
    });
    /*绘制圆类*/
    L.DCI.DrawCircle = L.Draw.Circle.extend({

        lays: null,

        options: {
            repeatMode: false,
            showRadius: false,
            clickable: false
        },

        initialize: function () {
            L.Draw.Circle.prototype.initialize.apply(this, arguments);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: L.DCI.App.symbol.polygonSymbol.fill,
                fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                clickable: true,
                declaredClass: 'DrawCircle'
            };
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Circle.prototype.addHooks.apply(this, arguments);
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Circle.prototype.removeHooks.apply(this, arguments);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (center, radius, popup) {
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = new L.Circle(center, radius, this.options.shapeOptions);
                lay.clone = this.clone;

                if (popup == null) {
                    lay.options.mypopup = {
                        _titles: '',
                        _content: '',
                        statu: 0,
                    }
                } else {
                    lay.options.mypopup = popup;
                };
                
                var _geometry = {
                    style: 'circle',
                    ring: lay.getBounds().getCenter(),
                };
                var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
                if (mapGroup[q].id == bmap.id) {
                    lay.on('click', function () {
                        var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay);
                    }, lay);
                }
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        clone: function () {
            var lay = new L.Circle(this.getLatLng(), this.getRadius(), this.options);
            return lay;
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _fireCreatedEvent: function () {
            this._exist(this._startLatLng, this._shape.getRadius());
            L.Draw.Circle.prototype._fireCreatedEvent.call(this);
        }
    });
    /*绘制矩形类*/
    L.DCI.DrawRectangle = L.Draw.Rectangle.extend({

        lays: null,

        options: {
            repeatMode: false,
            clickable: false
        },

        initialize: function (map, options) {
            L.Draw.Rectangle.prototype.initialize.apply(this, arguments);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: L.DCI.App.symbol.polygonSymbol.fill,
                fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                clickable: true,
                declaredClass: 'DrawRectangle'
            };
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Rectangle.prototype.addHooks.apply(this, arguments);
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Rectangle.prototype.removeHooks.apply(this, arguments);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (latlngs, popup) {
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = new L.Rectangle(latlngs, this.options.shapeOptions);

                lay.clone = this.clone;
                if (popup == null) {
                    lay.options.mypopup = {
                        _titles: '',
                        _content: '',
                        statu: 0,
                    }
                } else {
                    lay.options.mypopup = popup;
                };
                var _geometry = {
                    style: 'rectangle',
                    ring: lay.getBounds().getCenter(),
                };
                var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
                if (mapGroup[q].id == bmap.id) {
                    var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    lay.on('click', function () {
                        var biao = new L.DCI.plotting(_geometry, bmap.getMap(), lay)._showpopup();
                    }, lay);
                }
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return new L.Rectangle(this.getBounds(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _fireCreatedEvent: function () {
            this._exist(this._shape.getBounds())
            L.Draw.Rectangle.prototype._fireCreatedEvent.call(this);
        },

    });

    /*绘制矩形类2 linghuam add 绘制矩形不弹出标注框 20160611*/
    L.DCI.DrawRectangle2 = L.Draw.Rectangle.extend({

        lays: null,

        options: {
            repeatMode: false,
            clickable: false
        },

        initialize: function () {
            L.Draw.Rectangle.prototype.initialize.apply(this, arguments);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: false,           
                clickable: false,
                declaredClass: 'DrawRectangle2'
            };
        },

        enable: function (callback, context) {
            L.Draw.Rectangle.prototype.enable.call(this);
            this.callback = callback;
            this.context = context;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Rectangle.prototype.addHooks.apply(this, arguments);
        },

        removeHooks: function () {
            this._map.off('mouseup', this.exist, this);
            L.Draw.Rectangle.prototype.removeHooks.apply(this, arguments);
        },

        exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
        },

        _exist: function (latlngs) {
            //多屏同步显示
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                var qmap = mapGroup[q].getMap();
                if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                var lay = new L.Rectangle(latlngs, this.options.shapeOptions);
                lay.clone = this.clone;             
                this.lays[q].addLayer(lay);
                this.lays[q].addTo(qmap);
            }
        },

        clone: function () {
            return new L.Rectangle(this.getBounds(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _fireCreatedEvent: function () {
            this._exist(this._shape.getBounds());
            var lay = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);          
            L.Draw.Rectangle.prototype._fireCreatedEvent.call(this);
            typeof this.callback === "function" ? this.callback.apply(this.context || this, [{ layer: lay, layerType: this.type }]) : null;
        }
    });


    /*绘制类*/
    L.DCI.Draw = L.Class.extend({

        initialize: function (map) {
            this._map = map;
            this.Tools = {
                point: null,
                point2:null, 
                pointtext: null,
                polyline: null,
                path:null,
                circle: null,
                rectangle: null,
                rectangle2: null,
                polygon: null,
                polygon2:null
            };
        },
        point: function () {
            this.disable();
            if (this.Tools.point == null) {
                this.Tools.point = new L.DCI.DrawPoint(this._map);
            }
            this.Tools.point.enable();
        },
        point2: function (callback,context) {
            this.disable();
            if (this.Tools.point2 == null) {            
                this.Tools.point2 = new L.DCI.DrawPoint2(this._map);
            }
            this.Tools.point2.enable(callback,context);       
        },
        pointtext: function () {
            this.disable();
            if (this.Tools.pointtext == null) {
                this.Tools.pointtext = new L.DCI.DrawPointText(this._map);
            }
            this.Tools.pointtext.enable();
        },

        polyline: function () {
            this.disable();
            if (this.Tools.polyline == null) {
                this.Tools.polyline = new L.DCI.DrawPolyline(this._map);
            }
            this.Tools.polyline.enable();
        },
        path: function (callback, context) {
            this.disable();
            if (this.Tools.path == null) {
                this.Tools.path = new L.DCI.DrawPath(this._map,null);
            }            
            this.Tools.path.enable(callback,context);
        },
        circle: function () {
            this.disable();
            if (this.Tools.circle == null) {
                this.Tools.circle = new L.DCI.DrawCircle(this._map);
            }
            this.Tools.circle.enable();
        },
        rectangle: function () {
            this.disable();
            if (this.Tools.rectangle == null) {
                this.Tools.rectangle = new L.DCI.DrawRectangle(this._map);
            }
            this.Tools.rectangle.enable();
        },
        rectangle2: function (callback, context) {
            this.disable();
            if (this.Tools.rectangle2 == null) {
                this.Tools.rectangle2 = new L.DCI.DrawRectangle2(this._map);
            }          
            this.Tools.rectangle2.enable(callback,context);
        },
        polygon: function () {
            this.disable();
            if (this.Tools.polygon == null) {
                this.Tools.polygon = new L.DCI.DrawPolygon(this._map);
            }
            this.Tools.polygon.enable();
        },
        polygon2: function (callback,context) {
            this.disable();
            if (this.Tools.polygon2 == null) {
                this.Tools.polygon2 = new L.DCI.DrawPolygon2(this._map);
            }         
            this.Tools.polygon2.enable(callback,context);
        },
        disable: function () {
            for (var tool in this.Tools) {
                if (this.Tools[tool] != null) this.Tools[tool].disable();
            }
        },
        clear: function () {
            //多屏同步显示
            for (var tool in this.Tools) {
                if (this.Tools[tool] != null) this.Tools[tool].clear();
            }
            //刷新地图
            this._map.panBy([10, 10]);
            this._map.panBy([-10, -10]);
        },
        //修复删除单个标绘之后，其他标绘信息无法删除的问题
        clearLayer: function (id) {
            //多屏同步显示
            for (var tool in this.Tools) {
                if (this.Tools[tool] != null) {
                    if (this.Tools[tool].lays == null) return;
                    //多屏同步显示
                    for (var q = 0; q < this.Tools[tool].lays.length; q++) {
                        delete this.Tools[tool].lays[q]._layers[id]
                        //刷新地图
                        this._map.panBy([10, 10]);
                        this._map.panBy([-10, -10]);
                    }
                }
                
            }
        }


    });
    if (L.dci == null) L.dci = {};
    return L.dci.draw = function (map) {
        return new L.DCI.Draw(map);
    };
});