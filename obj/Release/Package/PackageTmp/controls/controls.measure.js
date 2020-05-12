/**
*测量控件
*@module controls
*@class DCI.Controls.Measure
*@extends L.Control
*/
define("controls/measure", [
    "leaflet",
    "core/dcins",
    "leaflet/draw"
], function (L) {
    L.DCI.Controls.MeasureDistance = L.Draw.Polyline.extend({

        addHooks: function () {
            L.Draw.Polyline.prototype.addHooks.call(this);
            if (this._map) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);

                this._markers = [];
                //this._map.on('click', this._onClick, this);
                this._startShape();
            }
        },

        removeHooks: function () {
            L.Draw.Polyline.prototype.removeHooks.call(this);
            this._clearHideErrorTimeout();
            this._map.off('mousemove', this._onMouseMove);
            this._clearGuides();
            this._container.style.cursor = '';
            this._removeShape();
            this._map.off('click', this._onClick, this);
        },

        _startShape: function () {
            this._drawing = true;
            this._poly = new L.Polyline([], this.options.shapeOptions);
            this._container.style.cursor = 'crosshair';
            this._updateTooltip();
            this._map.on('mousemove', this._onMouseMove, this);
        },

        _finishShape: function () {
            this._drawing = false;
            this._cleanUpShape();
            this._clearGuides();

            this._updateTooltip(this.fylatlng);
            //添加关闭“×”
            this._addClose(this.fylatlng);

            this._map.off('mousemove', this._onMouseMove, this);
            this._container.style.cursor = '';
        },

        _addClose: function (latlng) {
            var closePic = $('<img id="closePic" style="position: absolute;left: 30px;top: 35px;cursor: pointer;" alt="" src="themes/default/images/controls/draw/close.png"/>');
            $(this._tooltip._container).append(closePic);

            L.DomEvent.on(closePic[0], 'click', function (e) {
                L.DCI.App.pool.get("Tool").clear();
                //L.dci.app.util.dialog.alert("提示", "点击成功");
            }, this);
        },

        _onZoomEnd: function () {
            this._tooltip.updatePosition(this.fylatlng)
            L.Draw.Polyline.prototype._onZoomEnd.call(this);
            //this._updateTooltip(this.fylatlng);
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
            var labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);
            if (!this._drawing) {
                labelText.text = '';
            }
            return labelText;
        }
    });

    /*测面积类*/
    L.DCI.Controls.MeasureArea = L.Draw.Polygon.extend({

        addHooks: function () {
            L.Draw.Polygon.prototype.addHooks.call(this);
            if (this._map) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);

                this._markers = [];
                //this._map.on('click', this._onClick, this);
                this._startShape();
            }
        },

        removeHooks: function () {
            L.Draw.Polygon.prototype.removeHooks.call(this);
            this._clearHideErrorTimeout();
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
            //添加关闭“×”
            this._addClose(this.fylatlng);
            this._map.off('mousemove', this._onMouseMove, this);
            this._container.style.cursor = '';
        },

        _addClose: function (latlng) {
            var closePic = $('<img id="closePic" style="position: absolute;left: 30px;top: 32px;cursor: pointer;" alt="" src="themes/default/images/controls/draw/close.png"/>');
            $(this._tooltip._container).append(closePic);

            L.DomEvent.on(closePic[0], 'click', function (e) {
                L.DCI.App.pool.get("Tool").clear();
                //L.dci.app.util.dialog.alert("提示", "点击成功");
            }, this);
        },

        _onZoomEnd: function () {
            L.Draw.Polyline.prototype._onZoomEnd.call(this);
            this._tooltip.updatePosition(this.fylatlng)
            //this._updateTooltip(this.fylatlng);
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
                labelText.text = '';
            }
            return labelText;
        },

        _getMeasurementString: function () {
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
        }
    });

    /*测量类*/
    L.DCI.Controls.Measure = L.Class.extend({
        Type: {
            DISTANCE: "DISTANCE",
            AREA: "AREA"
        },
        Tools: {
            distance: null,
            area: null
        },

        initialize: function (map) {
            this._map = map;
        },

        distance: function () {
            this.disable();
            //if (this.Tools.distance == null) {
            this.Tools.distance = new L.DCI.Controls.MeasureDistance(this._map);
            //}
            this.Tools.distance.enable();
        },
        area: function () {
            this.disable();
            //if (this.Tools.area == null) {
            this.Tools.area = new L.DCI.Controls.MeasureArea(this._map);
            //}
            this.Tools.area.enable();
        },
        disable: function () {
            for (var tool in this.Tools) {
                if (this.Tools[tool] != null) this.Tools[tool].disable();
            }
        }
    });
    L.dci.measure = function (map) {
        return new L.DCI.Controls.Measure(map);
    };
});
