/**
*地图容器操作工具类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/foldcontrol", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.BMap.Fold = L.Control.extend({
        /**
        *配置参数
        *@property options
        *@type {Object}
        *@private
        */
        options: {
            position: 'topright',
            autoZIndex: true,
            title: '地图容器缩小放大',
            order: 'normal',
            foldCloseText: '关闭',/*关闭按钮文字*/
            foldExpandText: '放大',/*显示大屏*/
            foldCollapseText: '缩小',/*显示小屏*/
            foldCloseTitle: '关闭',
            foldExpandTitle: '放大地图显示区域',
            foldCollapseTitle: '缩小地图显示区域',
            expend: false,/*地图是否以大屏模式显示*/
            mapContainer: null,
            sClass: null,
            lClass: null
        },

        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            L.setOptions(this, options);
        },

        /**
        *添加
        *@method onAdd
        */
        onAdd: function (map) {
            return this._createUi(map);
        },

        /**
        *
        *@method getBody
        */
        getBody: function (map) {
            return this._createUi(map);
        },

        /**
        *
        *@method onRemove
        */
        onRemove: function (map) {

        },

        /**
        *创建UI视图
        *@method _createUi
        *@param map {Object}       map对象
        */
        _createUi: function (map) {
            this._map = map;
            var foldName = 'bmap-control-fold';
            var container = L.DomUtil.create('div', foldName, null);

            /*
            定义了大视图、小视图class才显示切换按钮，
            否侧以地图容器默认样式显示
            */
            if (this.options.sClass != null && this.options.lClass != null &&
                this.options.sClass.length > 0 && this.options.lClass.length > 0) {
                var foldButton = this._foldButton = L.DomUtil.create('span', 'bmap-control-fold-fullscr icon-full-screen');

                L.DomEvent.on(foldButton, 'click', this._foldClick, this);
                container.appendChild(foldButton);
            }

            /*
            地图视图关闭按钮
            设置地图视图容器的可见性
            */
            var closeButton = this._closeButton = L.DomUtil.create('span', 'icon-close1');

            L.DomEvent.on(closeButton, 'click', this._closeClick, this);
            container.appendChild(closeButton);

            return container;
        },

        /**
        *
        *@method _closeClick
        */
        _closeClick: function () {
            $("#" + this.options.mapContainer).css('display', 'none');
        },

        /**
        *
        *@method _foldClick
        */
        _foldClick: function (e) {
            this.options.expend = !this.options.expend;
            if (this.options.expend) {
                //$(e.target).removeClass('icon-full-screen')
                //$(e.target).addClass('icon-exit-full-screen')
                //if (L.DomUtil.hasClass(document.getElementById(this.options.mapContainer), this.options.sClass))
                //    L.DomUtil.removeClass(document.getElementById(this.options.mapContainer), this.options.sClass);
                //L.DomUtil.addClass(document.getElementById(this.options.mapContainer), this.options.lClass)
                
            } else {
                //$(e.target).removeClass('icon-exit-full-screen')
                //$(e.target).addClass('icon-full-screen')
                //if (L.DomUtil.hasClass(document.getElementById(this.options.mapContainer), this.options.lClass))
                //    L.DomUtil.removeClass(document.getElementById(this.options.mapContainer), this.options.lClass);
                //L.DomUtil.addClass(document.getElementById(this.options.mapContainer), this.options.sClass)
            }
            this._map.invalidateSize(true);
        }
    });

    return L.DCI.BMap.Fold;
});
