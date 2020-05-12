/**
*全图控件
*@module controls
*@class DCI.Controls.DefaultExtent
*@extends L.Control
*/
define("controls/defaultextent", [
    "leaflet",
    "core/dcins"
], function (L) {

    L.DCI.Controls.DefaultExtent = L.Control.extend({
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            position: 'topleft',
            text: '全图',
            title: '缩放到全图范围',
            className: 'leaflet-control-defaultextent'
        },
        /**
        *添加到地图上
        *@method onAdd
        *@param map {Object} 地图对象
        */
        onAdd: function (map) {
            this._map = map;
            return this._initLayout();
        },
        /**
        *设置当前地图中心
        *@method setCenter
        *@param center {Object} 中心坐标
        */
        setCenter: function (center) {
            this._center = center;
            return this;
        },
        /**
        *设置当前地图级别
        *@method setZoom
        *@param zoom {Number} 级数
        */
        setZoom: function (zoom) {
            this._zoom = zoom;
            return this;
        },
        /**
        *初始化布局
        *@method _initLayout
        *@private
        */
        _initLayout: function () {
            var container = L.DomUtil.create('div', 'leaflet-bar ' +
              this.options.className);
            this._container = container;
            this._fullExtentButton = this._createExtentButton(container);

            L.DomEvent.disableClickPropagation(container);

            this._map.whenReady(this._whenReady, this);

            return this._container;
        },
        /**
        *创建全图按钮
        *@method _createExtentButton
        *@private
        */
        _createExtentButton: function () {
            var link = L.DomUtil.create('a', this.options.className + '-toggle',
              this._container);
            link.href = '#';
            link.innerHTML = this.options.text;
            link.title = this.options.title;

            L.DomEvent
              .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
              .on(link, 'click', L.DomEvent.stop)
              .on(link, 'click', this._zoomToDefault, this);
            return link;
        },
        /**
        *生成后执行
        *@method _whenReady
        *@private
        */
        _whenReady: function () {
            if (!this._center) {
                this._center = this._map.getCenter();
            }
            if (!this._zoom) {
                this._zoom = this._map.getZoom();
            }
            return this;
        },
        /**
        *缩放到全图
        *@method _zoomToDefault
        *@private
        */
        _zoomToDefault: function () {
            this._map.setView(this._center, this._zoom);
        }
    });

    L.dci.defaultExtent = function (options) {
        return new L.DCI.Controls.DefaultExtent(options);
    };

    return L.DCI.Controls.DefaultExtent;
});