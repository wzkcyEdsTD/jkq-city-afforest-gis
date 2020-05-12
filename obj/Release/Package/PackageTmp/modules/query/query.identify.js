/**
*属性查询类
*@module modules.query
*@class DCI.Identify
*@constructor initialize
*/
define("query/identify", [
    "leaflet",
    "core/dcins",
    "leaflet/esri"
], function (L) {
    L.DCI.Identify = L.Class.extend({
        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map: null,
        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: '属性查询',
        /**
        *显示结果
        *@property _feature
        *@type {Array}
        *@private
        */
        _feature: [],
        /**
        *查询结果集
        *@property _results
        *@type {Arrat}
        *@private
        */
        _results:[],
        /**
        *查询容差
        *@property _tolerance
        *@type {Number}
        *@private
        */
        _tolerance: 2,
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
            this._map.clear();
            this._map.activate(L.DCI.Map.StatusType.SELECT, this._callback, this.precall, this);
            this._map.setCursorImg(this._clsName+".cur");
        },
        /**
        *查询执行函数
        *@method active
        *@private
        */
        _callback: function (evt) {
            //弹出面板
            if (this._queryResult == null)
                this._queryResult = new L.DCI.QueryResult();
            this._queryResult.showTo('属性查询');
            //显示加载动画
            var obj = $('.result-list-group-loadflash');
            L.dci.app.util.showLoadFlash(obj);

            this.clear();
            var map = this._map.getMap();
            this._count = this._map.getLayers().length;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && (layer.options.name == undefined ||
                    (layer.options.name && layer.options.name.indexOf("影像图") == -1))) {

                    var identify = layer.identify()
                        .on(map)
                        .at(evt.latlng)
                        .tolerance(this._tolerance);
                    if (layer.options.opacity && layer.options.opacity != 0)
                    {
                        if (layer.getLayers && layer.getLayers())
                        {
                            //identify.layers('visible:' + layer.getLayers()[0]);
                            identify.layers('visible');
                        } else
                        {
                            if (layer.options.layers)
                                identify.layers('visible:' + layer.options.layers.join(','));
                        };
                        //for (var index in layer.options.layerDefs)
                        //{
                        //    if (index == "all")
                        //    {
                        //        identify.layerDef(0, layer.options.layerDefs[index]);
                        //        break;
                        //    }
                        //    else
                        //    {
                        //        identify.layerDef(parseInt(index), layer.options.layerDefs[index]);
                        //    }
                        //}
                        identify.run(function (error, featureCollection, response) {
                            this._count--;
                            if (response && response.results)
                                this._results = this._results.concat(response.results);
                            if (this._count == 0)
                                this._showResult();
                        }, this);
                    }
                    else
                    {
                        this._count--;
                    }
                    //if (layer.getLayers && layer.getLayers()) {
                    //    //identify.layers('visible:' + layer.getLayers()[0]);
                    //    identify.layers('visible');
                    //} else {
                    //    if (layer.options.layers)
                    //        identify.layers('visible:' + layer.options.layers.join(','));
                    //};
                    //for (var index in layer.options.layerDefs) {
                    //    identify.layerDef(parseInt(index), layer.options.layerDefs[index]);
                    //}
                    
                } else {
                    this._count--;
                    if (this._count == 0) {
                        if (this._results.length == 0) {
                            this._queryResult.load(this._results);
                        }
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.hideLoadFlash(obj);
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
            try{
                if (this._results.length > 0) {
                        var feature = this._results[0];
                        var geo = L.dci.app.util.highLight(this._map, feature, true, false);
                        this._feature.push(geo);
                }
                this._queryResult.load(this._results);
                //隐藏加载动画
                var obj = $('.result-list-group-loadflash');
                L.dci.app.util.hideLoadFlash(obj);
                
            } catch (e) {
                L.dci.app.util.dialog.error("错误提示",e);
            }
        },
        /**
        *获取结果对象
        *@method getResultFeature
        *@return {Object} 要素
        */
        getResultFeature: function () {
            return this._feature;
        },
        /**
        *获取结果集合
        *@method getResult
        *@return {Object} 结果集合
        */
        getResult: function () {
            return this._results;
        }
    });

    return L.DCI.Identify;
});