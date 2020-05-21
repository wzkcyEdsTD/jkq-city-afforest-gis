/**
*属性查询类
*@module modules.query
*@class DCI.Identify
*@constructor initialize
*/
define("query/spatialIdentify", [
    "leaflet",
    "core/dcins",
    "leaflet/esri"
], function (L) {
    L.DCI.SpatialIdentify = L.Class.extend({
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
        _results: [],
        /**
        *点选查询容差
        *@property _tolerance
        *@type {Number}
        *@private
        */
        _pointTolerance: 10,
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
        *鼠标落下点坐标
        *@property _mousedown
        *@type {Object}
        *@private
        */
        _mousedown: null,
        /**
        *鼠标收起点坐标
        *@property _mouseup
        *@type {Object}
        *@private
        */
        _mouseup: null,
        
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
        active: function (type) {
            this._map.clear();
            this._identifyType = type;
            switch(type){
                case L.DCI.Map.StatusType.RECTANGLE:
                    this._map.activate(L.DCI.Map.StatusType.RECT_SELECT, this._callback, this.precall, this);
                    break;
                case L.DCI.Map.StatusType.POINT:
                    this._map.activate(L.DCI.Map.StatusType.POINT_SELECT, this._callback, this.precall, this);
                    break;
                case L.DCI.Map.StatusType.POLYLINE:
                    this._map.activate(L.DCI.Map.StatusType.POLYLINE_SELECT, this._callback_polyline, this.precall, this);
                    break;
                //case L.DCI.Map.StatusType.CIRCLE:
                //    this._map.activate(L.DCI.Map.StatusType.CIRCLE_SELECT, this._callback_polyline, this.precall, this);
                //    break;
            }
            this._map.setCursorImg(this._clsName+".cur");
        },
        /**
        *查询执行函数
        *@method active
        *@private
        */
        _callback: function (evt) {
            
            if (evt.type == "mousedown") {
                this._mousedown = evt.latlng;   //设置鼠标落下坐标

            } else if ((evt.type == "mouseup" && this._mousedown != null) || evt.type == 'click') {
                if (evt.type == "mouseup") {
                    this._mouseup = evt.latlng;   //设置鼠标收起坐标
                } else if (evt.type == 'click') {
                    this._mousedown = evt.latlng;   //设置鼠标收起坐标
                    this._mouseup = evt.latlng;   //设置鼠标收起坐标
                }

                //显示加载动画
                var obj = $('.result-list-group-loadflash');
                //L.dci.app.util.showLoadFlash(obj);

                this.clear();
                var map = this._map.getMap();
                this._count = this._map.getLayers().length;
                var _this = this;
                map.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != "baseLayer"
                        && layer.options.id != null
                        && (layer.options.name == undefined ||
                        (layer.options.name && layer.options.name.indexOf("影像图") == -1))) {
                        if (this._mousedown.lat == this._mouseup.lat && this._mousedown.lng == this._mouseup.lng) {   //如果为点选
                            var identify = layer.identify()
                                .on(map)
                                .at(this._mousedown)
                                .tolerance(this._pointTolerance);
                        } else {   //如果为框选
                            var bounds = L.latLngBounds(this._mousedown, this._mouseup);
                            var lay = new L.Rectangle(bounds);

                            var identify = layer.identify()
                                .on(map)
                                .setGeometry(lay, true)
                                .tolerance(this._tolerance);
                        }
                        if (layer.options.opacity && layer.options.opacity != 0) {
                            if (layer.options.layers) {
                                identify.layers('visible:' + layer.options.layers.join(','));
                            } else {
                                identify.layers('visible');
                            }
                            identify.run(function (error, featureCollection, response) {
                                this._count--;
                                if (response && response.results)
                                    this._results = this._results.concat(response.results);
                                if (this._count == 0) {
                                    if (this._results.length) {
                                        if (this._queryResult == null) {
                                            $(".extra_details").remove();
                                            this._queryResult = new L.DCI.QueryResult();
                                        }
                                        this._queryResult.showTo('空间查询');
                                        this._showResult();
                                    }
                                }
                            }, this);
                        }
                        else {
                            this._count--;
                        }
                    } else {
                        this._count--;
                        if (this._count == 0) {
                            if (this._results.length == 0) {
                                //this._queryResult.load(this._results);
                            }
                            var obj = $('.result-list-group-loadflash');
                            L.dci.app.util.hideLoadFlash(obj);
                        }
                    }
                }, this);

                this._mousedown = null;
                this._mouseup = null;
            }
        },
        _callback_polyline: function (evt, _map) {
            var _this = _map._spatialIdentify;
            //弹出面板
            if (_this._queryResult == null)
                _this._queryResult = new L.DCI.QueryResult();
            _this._queryResult.showTo('属性查询');
            //显示加载动画
            var obj = $('.result-list-group-loadflash');
            L.dci.app.util.showLoadFlash(obj);

            _this.clear();
            var map = _map.getMap();
            _this._count = _map.getLayers().length;
         
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && (layer.options.name == undefined ||
                    (layer.options.name && layer.options.name.indexOf("影像图") == -1))) {
                    
                    var lay = new L.Polyline(evt);

                    var identify = layer.identify()
                        .on(map)
                        .setGeometry(lay, true)
                        .tolerance(_this._tolerance);
                    
                    if (layer.options.opacity && layer.options.opacity != 0) {
                        if (layer.options.layers) {
                            identify.layers('visible:' + layer.options.layers.join(','));
                        } else {
                            identify.layers('visible');
                        }
                        identify.run(function (error, featureCollection, response) {
                            _this._count--;
                            if (response && response.results)
                                _this._results = _this._results.concat(response.results);
                            if (_this._count == 0)
                                _this._showResult();
                            //L.dci.app.tool["spatialQueryPolyline"]();
                            _this._map.activate(L.DCI.Map.StatusType.POLYLINE_SELECT, _this._callback_polyline, _this.precall, _this);
                            _this._map.setCursorImg(_this._clsName + ".cur");
                        }, _this);
                    }
                    else {
                        _this._count--;
                    }
                } else {
                    _this._count--;
                    if (_this._count == 0) {
                        if (_this._results.length == 0) {
                            _this._queryResult.load(_this._results);
                        }
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.hideLoadFlash(obj);
                       
                    }
                }
            }, _this);

           
            //_this.activate(L.DCI.Map.StatusType.POLYLINE);
            //_this._map.activate(L.DCI.Map.StatusType.POLYLINE_SELECT, _this._callback_polyline, _this.precall, _this);
            //_this._map.setCursorImg(_this._clsName + ".cur");
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
                    for (i = 0; i < this._results.length; i++) {
                        var feature = this._results[i];
                        var geo = L.dci.app.util.highLight(this._map, feature, true, false);
                        this._feature.push(geo);
                    }
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

    return L.DCI.SpatialIdentify;
});