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
                iconAnchor: [L.DCI.App.symbol.pointSymbol_2.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol_2.iconSize[1]]
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
            //for (var q = 0; q < mapGroup.length; q++) {
            for (var q = mapGroup.length - 1; q >= 0; q--) {
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
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polylineSymbol.color,
                weight: L.DCI.App.symbol.polylineSymbol.weight,
                clickable: true,
                opacity: L.DCI.App.symbol.polylineSymbol.opacity,
                declaredClass: 'DrawPolyline'
            };
            this.options.drawError.color = L.DCI.App.symbol.polylineSymbol.color;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Polyline.prototype.addHooks.call(this);            
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
            //for (var q = 0; q < mapGroup.length; q++) {
            for (var q = mapGroup.length - 1; q >= 0; q--) {
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
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);

            L.Draw.Polygon.prototype.addHooks.call(this);
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
            //for (var q = 0; q < mapGroup.length; q++) {
            for (var q = mapGroup.length - 1; q >= 0; q--) {
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
            //for (var q = 0; q < mapGroup.length; q++) {
            for (var q = mapGroup.length - 1; q >= 0; q--) {
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
            //for (var q = 0; q < mapGroup.length; q++) {
            for (var q = mapGroup.length - 1; q >= 0; q--) {
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
    /*绘制矩形查询类*/
    L.DCI.DrawRectangleIdentify = L.Draw.Rectangle.extend({

        lays: null,

        options: {
            repeatMode: true,
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
            this._initialLabelText = "可点击拖动绘制矩形进行查询";
            L.Draw.Rectangle.prototype.addHooks.apply(this, arguments);
        },

        removeHooks: function () {
            L.Draw.Rectangle.prototype.removeHooks.apply(this, arguments);
        },
        
        _exist: function (latlngs) {
            if (this.lays == null) {
                this.lays = L.layerGroup([]);
            }
            this.lays.clearLayers();
            var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            var qmap = bmap.getMap();
            var lay = new L.Rectangle(latlngs, this.options.shapeOptions);
            this.lays.addLayer(lay);
            this.lays.addTo(qmap);
            if (L.dci.app.pool.has("FacilitiesStatistics") != true) {
                this.lays.clearLayers();
            }
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            if (this.lays == null) return;
            this.lays.clearLayers();
            //for (var q = 0; q < this.lays.length; q++) {
            //    this.lays[q].clearLayers();
            //}
        },

        _fireCreatedEvent: function () {
            this._exist(this._shape.getBounds())
            L.Draw.Rectangle.prototype._fireCreatedEvent.call(this);
            if (L.dci.app.pool.has("FacilitiesStatistics") != true) {
                this.disable();
            }
        },
        
    });
    /*绘制点选查询类*/
    L.DCI.DrawPointIdentify = L.DCI.DrawPoint.extend({

        lays: null,

        options: {
            clickable: false,
            repeatMode: true,
            declaredClass: 'DrawPoint'
        },

        initialize: function (map, options) {
            L.Draw.Marker.prototype.initialize.apply(this, arguments);
            this.options.icon = new L.Icon({
                iconUrl: L.DCI.App.symbol.pointSymbol.iconUrl,
                iconSize: L.DCI.App.symbol.pointSymbol.iconSize,
                iconAnchor: [L.DCI.App.symbol.pointSymbol.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol.iconSize[1] + 10]
            });
            this.options.opacity = L.DCI.App.symbol.pointSymbol.opacity;
        },

        addHooks: function () {
            this._initialLabelText = "可点击进行查询";
            //L.DCI.DrawPoint.prototype.addHooks.apply(this, arguments);
            L.Draw.Marker.prototype.addHooks.call(this);
        },

        removeHooks: function () {
            //L.DCI.DrawPoint.prototype.removeHooks.apply(this, arguments);
            L.Draw.Marker.prototype.removeHooks.call(this);
        },

        _exist: function (latlng) {
            if (this.lays == null) {
                this.lays = L.layerGroup([]);
            }
            this.lays.clearLayers();
            var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            var qmap = bmap.getMap();
            var lay = L.marker(latlng, this.options);
            lay.clone = this.clone;
            this.lays.addLayer(lay);
            this.lays.addTo(qmap);
           
        },

        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            if (this.lays == null) return;
            this.lays.clearLayers();
            //for (var q = 0; q < this.lays.length; q++) {
            //    this.lays[q].clearLayers();
            //}
        },

        _fireCreatedEvent: function () {
            this._exist(this._marker.getLatLng());
            L.Draw.Marker.prototype._fireCreatedEvent.call(this);
            var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            if (L.dci.app.pool.has("FacilitiesStatistics") == true) {
                bmap.deactivate();
            }
        }

    });

    /*绘制线选查询类*/
    L.DCI.DrawPolylineIdentify = L.DCI.DrawPolyline.extend({
        lays: null,

        options: {
            repeatMode: false,
            showLength: false, // Whether to display distance in the tooltip
            clickable: false
        },

        initialize: function () {
            L.Draw.Polyline.prototype.initialize.apply(this, arguments);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polylineSymbol.color,
                weight: L.DCI.App.symbol.polylineSymbol.weight,
                clickable: true,
                opacity: L.DCI.App.symbol.polylineSymbol.opacity,
                declaredClass: 'DrawPolyline'
            };
            this.options.drawError.color = L.DCI.App.symbol.polylineSymbol.color;
        },

        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Polyline.prototype.addHooks.call(this);
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
           
            if (this.lays == null) {
                this.lays = L.layerGroup([]);
            }
            var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            var qmap = bmap.getMap();
            var lay = L.polyline(intersects, this.options.shapeOptions);
            lay.clone = this.clone;

            this.lays.addLayer(lay);
            this.lays.addTo(qmap);
            bmap.polylineIdentifyCallBack(intersects);
        },

        clone: function () {
            return L.polyline(this.getLatLngs(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            this.lays.clearLayers();
        },

        _finishShape: function () {
            this._exist(this._poly.getLatLngs());
            this.clear();
            L.Draw.Polyline.prototype._finishShape.call(this);
        }
    });
    
    /*绘制线选查询Buffer类*/
    L.DCI.DrawPolylineIdentifyBuffer = L.DCI.DrawPolyline.extend({
        lays: null,

        options: {
            repeatMode: false,
            showLength: false, // Whether to display distance in the tooltip
            clickable: false
        },

        initialize: function () {
            L.Draw.Polyline.prototype.initialize.apply(this, arguments);
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polylineSymbol.color,
                weight: L.DCI.App.symbol.polylineSymbol.weight,
                clickable: true,
                opacity: L.DCI.App.symbol.polylineSymbol.opacity,
                declaredClass: 'DrawPolyline'
            };
            this.options.drawError.color = L.DCI.App.symbol.polylineSymbol.color;
        },
        
        addHooks: function () {
            this._map.on('mouseup', this.exist, this);
            L.Draw.Polyline.prototype.addHooks.call(this);
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

            if (this.lays == null) {
                this.lays = L.layerGroup([]);
            }
            var bmap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            var qmap = bmap.getMap();
            var lay = L.polyline(intersects, this.options.shapeOptions);
            lay.clone = this.clone;

            this.lays.addLayer(lay);
            this.lays.addTo(qmap);
            bmap.polylineIdentifyCallBackBuffer(intersects);
        },

        clone: function () {
            return L.polyline(this.getLatLngs(), this.options);
        },

        clear: function () {
            if (this.lays == null) return;
            this.lays.clearLayers();
        },

        _finishShape: function () {
            this._exist(this._poly.getLatLngs());
            this.clear();
            L.Draw.Polyline.prototype._finishShape.call(this);
        }
    });

    /*绘制面类*/
    L.DCI.DrawPolygonStatistics = L.Draw.Polygon.extend({

        lays: null,
        options: {
            repeatMode: true,
            showArea: false,
            clickable: false
        },
        addHooks: function () {
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: L.DCI.App.symbol.polygonSymbol.fill,
                fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                clickable: false
            };
            L.Draw.Polygon.prototype.addHooks.call(this);
            if (this._map) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);

                this._markers = [];
                this._map.on('click', this._onClick, this);
                this._mouseMarker.on('contextmenu', function () { this.disable(); }, this);
                this._startShape();
            }
        },

        removeHooks: function () {
            L.Draw.Polygon.prototype.removeHooks.call(this);

            this._clearHideErrorTimeout();

            //!\ Still useful when control is disabled before any drawing (refactor needed?)
            this._map.off('mousemove', this._onMouseMove);
            this._clearGuides();
            this._container.style.cursor = '';

            this._removeShape();

            this._map.off('click', this._onClick, this);
        },

        _startShape: function () {
            this._drawing = true;
            this._poly = new L.Polygon([], this.options.shapeOptions);

            this._container.style.cursor = 'crosshair';

            this._updateTooltip();
            this._map.on('mousemove', this._onMouseMove, this);
        },

        _finishShape: function () {
            this._drawing = false;
            this._cleanUpShape();
            this._clearGuides();

            this._updateTooltip(this.fylatlng);

            this._map.off('mousemove', this._onMouseMove, this);
            this._container.style.cursor = '';

            //多屏同步显示
            if (this._poly) {
                var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                for (var q = 0; q < mapGroup.length; q++) {
                    var qmap = mapGroup[q].getMap();
                    if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                    var lay = L.polygon(this._poly._latlngs, this._poly.options);
                    this.lays[q].addLayer(lay);
                    //this.lays[q].addTo(qmap);
                    mapGroup[q].clear();
                    mapGroup[q].getHighLightLayer().addLayer(lay);

                    //if (L.dci.app.pool.has("querycontain") == true) {
                    //    L.DCI.App.pool.get("querycontain").data.query_geo = lay;
                    //}
                    if (L.dci.app.pool.has("FacilitiesStatistics") == true) {
                        L.dci.app.pool.get("FacilitiesStatistics")._geometry = lay;
                    }
                }
            }
            L.Draw.Polyline.prototype._finishShape.call(this);
            //this._exist(this._poly.getLatLngs());
            //L.Draw.Polygon.prototype._finishShape.call(this);
            
            //去掉多边形绘制状态
            //L.DCI.App.pool.get('querycontain')._polygon.disable();
            //$(".query-choose-contain .choose-style-choose>a:last-child").removeClass("choose-style-choose-click");

        },
        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },
        _onZoomEnd: function () {
            L.Draw.Polyline.prototype._onZoomEnd.call(this);
            this._updateTooltip(this.fylatlng);
        },

        _onMouseMove: function (e) {
            L.Draw.Polyline.prototype._onMouseMove.call(this, e);
            this.fylatlng = e.latlng;
        },

        _removeShape: function () {
            if (!this._poly)
                return;
            this._map.removeLayer(this._poly);
            delete this._poly;
            this._markers.splice(0);
            this._markerGroup.clearLayers();


        },

        _onClick: function (e) {
            if (!this._drawing) {
                this._removeShape();
                this._startShape();
                return;
            }
        },

        _getTooltipText: function () {
            var labelText = L.Draw.Polygon.prototype._getTooltipText.call(this);
            if (!this._drawing) {
                labelText.text = '点击完成绘制';
            }
            return labelText;
        },

        _getMeasurementString: function () {
            return;
            var area = this._area;

            if (!area) {
                return null;
            }

            return L.GeometryUtil.readableArea(area, true);
        },

        _vertexChanged: function (latlng, added) {
            var latLngs = this._poly.getLatLngs();
            this._area = L.GeometryUtil.geodesicArea(latLngs);
            L.Draw.Polyline.prototype._vertexChanged.call(this, latlng, added);
        },
        _onMouseDown: function (e) {
            if (e.originalEvent.button == 2) return;
            L.Draw.Polyline.prototype._onMouseDown.call(this, e);
        },

        _onMouseUp: function (e) {
            if (e.originalEvent.button == 2) return;
            L.Draw.Polyline.prototype._onMouseUp.call(this, e);
        }
    });
    /*绘制类*/
    L.DCI.Draw = L.Class.extend({

        initialize: function (map) {
            this._map = map;
   
            this.Tools = {
                point: null,
                pointtext: null,
                polyline: null,
                circle: null,
                rectangle: null,
                rectangleIdentify: null,
                pointIdentify: null,
                polylineIdentify: null,
                polylineIdentifyBuffer: null,
                polygonStatistics:null,
                polygon: null
            };
        },
        point: function () {
            this.disable();
            if (this.Tools.point == null) {
                this.Tools.point = new L.DCI.DrawPoint(this._map);
            }
            this.Tools.point.enable();
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
        rectangleIdentify: function () {
            this.disable();
            if (this.Tools.rectangleIdentify == null) {
                this.Tools.rectangleIdentify = new L.DCI.DrawRectangleIdentify(this._map);
            }
            this.Tools.rectangleIdentify.enable();
        },
        pointIdentify: function () {
            this.disable();
            if (this.Tools.pointIdentify == null) {
                this.Tools.pointIdentify = new L.DCI.DrawPointIdentify(this._map);
            }
            this.Tools.pointIdentify.enable();
        },
        polylineIdentify: function () {
            this.disable();
            if (this.Tools.polylineIdentify == null) {
                this.Tools.polylineIdentify = new L.DCI.DrawPolylineIdentify(this._map);
            }
            this.Tools.polylineIdentify.enable();
        },
        polylineIdentifyBuffer: function () {
            this.disable();
            if (this.Tools.polylineIdentifyBuffer == null) {
                this.Tools.polylineIdentifyBuffer = new L.DCI.DrawPolylineIdentifyBuffer(this._map);
            }
            this.Tools.polylineIdentifyBuffer.enable();
        },
        polygonStatistics: function () {
            this.disable();
            if (this.Tools.polygonStatistics == null) {
                this.Tools.polygonStatistics = new L.DCI.DrawPolygonStatistics(this._map);
            }
            this.Tools.polygonStatistics.enable();
        },
        polygon: function () {
            this.disable();
            if (this.Tools.polygon == null) {
                this.Tools.polygon = new L.DCI.DrawPolygon(this._map);
            }
            this.Tools.polygon.enable();
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
            //this._map.panBy([10, 10]);
            //this._map.panBy([-10, -10]);
          
        },
        //修复删除单个标绘之后，其他标绘信息无法删除的问题
        clearLayer: function (id) {
            //多屏同步显示
            for (var tool in this.Tools) {
                if (this.Tools[tool] != null) {
                    if (this.Tools[tool].lays == null) return;
                    if (this.Tools[tool].lays[0]._layers[id] == undefined) continue;
                    //多屏同步显示
                    for (var q = 0; q < this.Tools[tool].lays.length; q++) {
                        //delete this.Tools[tool].lays[q]._layers[id];
                        this.Tools[tool].lays[q].removeLayer(id);
                        if (this.Tools[tool].lays[q + 1] && !this.isEmpty(this.Tools[tool].lays[q + 1]._layers)) {
                            id--;
                            var limitCount = 0;
                            while (this.Tools[tool].lays[q + 1] && !this.Tools[tool].lays[q + 1]._layers[id]) {
                                id--;
                                limitCount++;
                                if (limitCount > 10) break;
                            }
                        }
                        //刷新地图
                        this._map.panBy([10, 10]);
                        this._map.panBy([-10, -10]);
                    }
                }
                
            }
        },
        //判断对象是否为空
        isEmpty: function (obj)
        {
            for (var name in obj)
            {
                return false;
            }
            return true;
        }


    });
    if (L.dci == null) L.dci = {};
    return L.dci.draw = function (map) {
        return new L.DCI.Draw(map);
    };
});