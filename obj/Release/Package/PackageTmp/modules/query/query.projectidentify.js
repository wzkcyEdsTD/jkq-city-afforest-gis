/*
类名：项目查看类
说明：
*/
define("query/projectidentify", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "query/resultpanel"
], function (L) {
    L.DCI.ProjectIdentify = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "projectIdentify",
        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map: null,

        /**
        *查询容差
        *@property _tolerance
        *@type {Number}
        *@private
        */
        _tolerance: 1,
        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: '项目查看',
        /**
       *查询结果集
       *@property _results
       *@type {Arrat}
       *@private
       */
        _results: [],
        /**
        *显示结果
        *@property _feature
        *@type {Array}
        *@private
        */
        _feature: [],
        /**
       *当前地图图层数量
       *@property _count
       *@type {Number}
       *@private
       */
        _count: 0,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (map) {
            this._map = map;
        },

        /**
       *激活属性查询功能
       *@method active
       */
        active: function () {
            this.clear();
            this._map.activate(L.DCI.Map.StatusType.SELECT, this._callback, null, this);
            this._map.setCursorImg(this._clsName + ".cur");
        },

        deactivate: function () {
            this.clear();
            this._map.deactivate();
        },

        /**
        *查询执行函数
        *@method _callback
        *@private
        */
        _callback: function (evt) {
            this.clear();
            var map = this._map.getMap();
            this._count = this._map.getLayers().length;
            //当前激活的专题
            this.curFeature = L.dci.app.pool.get("rightPanel").getCurrentItems();
            if (this.curFeature == null || this.curFeature.length == 0) return;
            var queryLayer = null;
            if (this.curFeature[1].context.getQueryLayer)
                queryLayer = this.curFeature[1].context.getQueryLayer();

            if (this.curFeature[1].context.queryProjectByIds == undefined)return;
            map.eachLayer(function (layer) {
                if (layer.options
                    && layer.options.id
                    && layer.options.id != "baseLayer"
                    && layer.options.name
                    && layer.options.name == this.curFeature[1].title) {
                    if (queryLayer == null || layer.url.toLowerCase() == queryLayer.toLowerCase()) {
                        var identify = layer.identify()
                            .on(map)
                            .at(evt.latlng)
                            .tolerance(this._tolerance);
                        if (layer.getLayers && layer.getLayers()) {
                            identify.layers('all:' + layer.getLayers()[0]);
                        } else {
                            if (layer.options.layers)
                                identify.layers('all:' + layer.options.layers.join(','));
                        };
                        for (var index in layer.options.layerDefs) {
                            identify.layerDef(parseInt(index), layer.options.layerDefs[index]);
                        }
                        identify.run(function(error, featureCollection, response) {
                            this._count--;
                            if (response && response.results)
                                this._results = this._results.concat(response.results);
                            if (this._count == 0)
                                this._showResult();
                        }, this);
                    } else {
                        this._count--;
                        if (this._count == 0) {
                            if (this._results.length == 0) {
                                this._showResult();
                            }
                        }
                    }
                } else {
                    this._count--;
                    if (this._count == 0) {
                        if (this._results.length == 0) {
                            this._showResult();
                        }
                    }
                }
            }, this);
        },

        /**
        *清除结果
        *@method clear
        */
        clear: function () {
            this._map.getHighLightLayer().clearLayers();
            if (this._feature && this._feature.length > 0) {
                if (this._feature[0] != null) {
                    this._map.getHighLightLayer().removeLayer(this._feature[0]);
                }
                this._feature = [];
            }
            this._results = [];
            this._count = 0;
        },

        /**
        *显示结果
        *@method _showResult
        *@private
        */
        _showResult: function () {
            try {
                $(".result-list-group-button .button:eq(1)").click();
                if (this._results.length > 0) {
                    var feature = this._results[0];
                    var geo = L.dci.app.util.highLight(this._map, feature, true, false);
                    this._feature.push(geo);
                }
                if (this.curFeature != null && this.curFeature[1]!=null)
                    this.curFeature[1].context.queryProjectByIds(this._results);
                L.dci.app.pool.get("rightPanel").show();
            } catch (e) {
                L.dci.app.util.dialog.error("错误提示", e);
            }
        }

    });
    return L.DCI.ProjectIdentify;
});