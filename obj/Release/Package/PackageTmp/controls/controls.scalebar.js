/**
*比例尺控件
*@module controls
*@class DCI.Controls.ScaleBar
*@extends L.Control
*/
define("controls/scalebar", [
    "leaflet",
    "core/dcins"
], function (L) {

    L.DCI.Controls.ScaleBar = L.Control.extend({
        options: {
            position: 'bottomleft',
            latlng: false,//是否显示经纬度
            maxWidth: 100,
            metric: false,
            imperial: false,
            resolution: true,
            coordinate: true,
            updateWhenIdle: false,
            numDigits: 5
        },
        baseLayer: null,

        onAdd: function (map) {
            this._map = map;
            if (this.baseLayer == null) {
                if (this._map.options.baseLayer.type == "tile") {
                    this.baseLayer = L.esri.tiledMapLayer(this._map.options.baseLayer.url);
                }
                else {
                    this.baseLayer = L.esri.dynamicMapLayer(this._map.options.baseLayer.url);
                }
            }
            var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

            this._addScales(options, className, container);
            map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);

            this._mousePosition(options, className, container);
            map.on('mousemove', this._updataMouse, this);
            map.whenReady(this._update, this);

            return container;
        },
        onRemove: function (map) {
            map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
        },
        _addScales: function (options, className, container) {
            if (options.metric) {
                this._mScale = L.DomUtil.create('div', className + '-line', container);
            }
            if (options.imperial) {
                this._iScale = L.DomUtil.create('div', className + '-line', container);
            }
            if (options.resolution) {
                this._resolution = L.DomUtil.create('div', className + '-resolution', container);
                this._resolution.style.display = "none";
            }
        },
        _mousePosition: function (options, className, container) {
            if (options.coordinate) {
                this._Coordinates = L.DomUtil.create('div', className + '-Coord', container);
                this._Coordinates.style.display = "none";
            }
        },
        _update: function () {
            var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,

		    size = this._map.getSize(),
		    options = this.options,
		    maxMeters = 0;

            if (size.x > 0) {
                maxMeters = dist * (options.maxWidth / size.x);
            }

            //有待改进
            this._updataResolution(options);
            this._updateScales(options, maxMeters);
        },
        _updataMouse: function (e) {
            if (this.options.coordinate) {
                /*显示地理坐标*/
                if (this.options.latlng == false) {
                    var point = this._map.options.crs.projection.project(e.latlng);
                    var x = L.Util.formatNum(point.x, this.options.numDigits);
                    var y = L.Util.formatNum(point.y, this.options.numDigits);
                    var coordinates = this._Coordinates;
                    coordinates.innerHTML = 'X:' + x + '&nbsp;&nbsp;Y:' + y;
                } else {//显示经纬度
                    var lng = L.Util.formatNum(e.latlng.lng, this.options.numDigits);
                    var lat = L.Util.formatNum(e.latlng.lat, this.options.numDigits);
                    var coordinates = this._Coordinates;
                    coordinates.innerHTML = '经度:' + lng + '&nbsp;&nbsp;纬度:' + lat;
                }
                this._Coordinates.style.display = "";
            }
        },
        _updataResolution: function (options) {
            if (options.resolution) {
                if (this._map.options.baseLayer.type == "tile") {
                    this.baseLayer.metadata(function (error, metadata) {
                        if (!error) {
                            var index = this._map.getZoom();
                            if (metadata && metadata.tileInfo && metadata.tileInfo.lods && metadata.tileInfo.lods[index]) {
                                var resol = metadata.tileInfo.lods[index].scale;
                                resol = L.Util.formatNum(resol, options.numDigits);
                                this._updataResolutionZoon(resol);
                            } else {
                                var resol = this._map.options.baseLayer.lods[index];
                                resol = L.Util.formatNum(resol, options.numDigits);
                                this._updataResolutionZoon(resol);
                            }
                        }
                    }, this);
                } else {
                    var index = this._map.getZoom();
                    var resol = this._map.options.crs.getScale(index);
                    this._updataResolutionZoon(resol);
                }

            }
        },
        _updataResolutionZoon: function (resol) {
            this._resolution.innerHTML = '比例尺' + ':' + '1' + ':' + resol;
            this._resolution.style.display = "";
        },
        _updateScales: function (options, maxMeters) {
            if (options.metric && maxMeters) {
                this._updateMetric(maxMeters);
            }

            if (options.imperial && maxMeters) {
                this._updateImperial(maxMeters);
            }
        },

        _updateMetric: function (maxMeters) {
            var meters = this._getRoundNum(maxMeters);

            this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
            this._mScale.innerHTML = meters < 1000 ? meters + ' 米' : (meters / 1000) + ' 千米';
        },

        _updateImperial: function (maxMeters) {
            var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

            if (maxFeet > 5280) {
                maxMiles = maxFeet / 5280;
                miles = this._getRoundNum(maxMiles);

                scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
                scale.innerHTML = miles + ' 英里';

            } else {
                feet = this._getRoundNum(maxFeet);

                scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
                scale.innerHTML = feet + ' 英尺';
            }
        },

        _getScaleWidth: function (ratio) {
            return Math.round(this.options.maxWidth * ratio) - 10;
        },

        _getRoundNum: function (num) {
            var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

            d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

            return pow10 * d;
        }
    });

    L.Map.addInitHook(function () {
        if (this.options.scalebarControl) {
            this.addControl(new L.DCI.Controls.ScaleBar());
        }
    });

    return L.dci.scalebar = function (options) {
        return new L.DCI.Controls.ScaleBar(options);
    };

});
