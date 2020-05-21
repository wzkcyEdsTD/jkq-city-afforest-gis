/// <reference path="G:\zmc\01开发区市政\DCI.Client\library/leaflet/leaflet.curve.js" />
/// <reference path="../library/leaflet/leaflet.curve.js" />
/**
*地图类
*@module core
*@class DCI.Map
*@constructor initialize
*@extends DCI.BaseObject
*/
define("core/map", [
    "leaflet",
    "core/dcins",
    "leaflet/CRS2379",
    "leaflet/draw",
    "leaflet/esri",
    "leaflet/proj4leaflet",
    "leaflet/contextmenu",
    "leaflet/wmts",
    "core/baseobject",
    "controls/minimap",
    "controls/scalebar",
    "controls/navigation",
    "controls/measure",
    "controls/legend",
    "controls/groupedlayer",
    "controls/draw",
    "controls/layertab",
    "controls/timeslider",
    "output/print",
    "query/identify",
    "query/spatialIdentify"
], function (L) {

    L.DCI.Map = L.DCI.BaseObject.extend({
        /**
        *地图对象
        *@property map
        *@type {Object}
        */
        map: null,
        /**
        *地图容器
        *@property _container
        *@type {Object}
        *@private
        */
        _container: null,
        /**
        *回调函数
        *@property _callback
        *@type {Object}
        *@private
        */
        _callback: null,
        /**
        *事件
        *@property _events
        *@type {Object}
        *@private
        */
        _events: [],
        /**
        *当前鼠标状态
        *@property _status
        *@type {Object}
        *@private
        */
        _status: null,
        /**
        *底图ID
        *@property _baseLayerId
        *@type {Object}
        *@private
        */
        _baseLayerId: 'baseLayer',
        /**
        *底图
        *@property _baseLayer
        *@type {Object}
        *@private
        */
        _baseLayer: null,
        /**
        *属性查询
        *@property _identify
        *@type {Object}
        *@private
        */
        _identify: null,
        /**
       *空间查询
       *@property _spatialIdentify
       *@type {Object}
       *@private
       */
        _spatialIdentify: null,
        /**
        *地图查询
        *@property _query
        *@type {Object}
        *@private
        */
        _query: null,
        /**
         *高亮图层
         *@property _highLightLayer
         *@type {Object}
         *@private
         */
        _highLightLayer: null,
        /**
         *临时图标图层
         *@property _labelLayer
         *@type {Object}
         *@private
         */
        _labelLayer: null,
         /**
         *高亮图层集合
         *@property _HLLayer
         *@type {Object}
         *@private
         */
        _HLLayer:[],
        /**
        *气泡
        *@property _popup
        *@type {Object}
        *@private
        */
        _popup: null,
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            zoomControl: false,
            zoomAnimationThreshold: 10,
            attributionControl: false,
            baseLayerUrl: null,  //底图地址
        },
        /**
        *绘图工具
        *@property _drawTools
        *@type {Object}
        *@private
        */
        _drawTools: {
            circle: null,
            polyline: null,
            polygon: null,
            point: null,
            rectangle: null,
            marker: null
        },
        /**
        *地图绘制
        *@property _drawTool
        *@type {Object}
        *@private
        */
        _drawTool: null,
        /**
        *测量
        *@property _measureTool
        *@type {Object}
        *@private
        */
        _measureTool: null,
        /**
        *控件
        *@property controls
        *@type {Object}
        */
        controls: {
            miniMap: null,  //鹰眼
            scaleBar: null, //比例尺
            contextmenu: null,
            print: null,
            opacity: null,    //透明度
            legend: null     //图例
        },
        /**
        *shp临时数据
        *@property shpLayerGroups
        *@type {Object}
        */
        shpLayerGroups: [], //shap
        /**
        *CAD临时数据
        *@property cadLayerGroups
        *@type {Object}
        */
        cadLayerGroups: [], //cad
        /**
        *shp临时数据
        *@property _shpLayerGroups
        *@type {Object}
        *@private
        */
        _shpLayerGroups: [],
        /**
        *CAD临时数据
        *@property _cadLayerGroups
        *@type {Object}
        *@private
        */
        _cadLayerGroups: [],
        /**
        *缓冲区请求URL
        *@property _queryBufferUrl
        *@type {Object}
        *@private
        */
        _queryBufferUrl: null,
        /**
       *缓冲区请求范围
       *@property _tolance
       *@type {Object}
       *@private
       */
        _tolance: null,
        /**
        *初始化
        *@method initialize
        *@param options {Object} 地图配置
        */
        initialize: function (options) {
            L.DCI.BaseObject.prototype.initialize.call(this);

            this._shpLayerGroups = [];
            this._cadLayerGroups = [];

            this.container = document.getElementById(options.container);
            this.id = options.id;
            //==========================设置坐标系========================/
            var crs = null;
            if (options.baseLayer.type == "tile") {
                crs = new L.Proj.CRS(options.baseCrs.code, options.baseCrs.defs, {
                    origin: options.baseLayer.origin,
                    resolutions: options.baseLayer.resolutions
                });

                if (options.baseLayer.layerType && options.baseLayer.layerType == 4) {
                    var url = options.baseLayer.url + "/WMTS";
                    this.getWmtsInfo(url, function (data) {
                        var level = data.level;
                        var latlng = data.latlng;
                        var lat = latlng.substr(0, latlng.indexOf(" "));
                        var lng = latlng.substr(latlng.indexOf(" ") + 1, latlng.length - latlng.indexOf(" "));
                        var m_matrixIds = new Array(level);
                        for (var i = 0; i < 22; i++) {
                            m_matrixIds[i] = {
                                identifier: "" + i,
                                topLeftCorner: new L.LatLng(lat, lng)
                            };
                        }

                        var newOptions = {
                            style: data.style,
                            zIndex: 1,
                            matrixIds: m_matrixIds,
                            tileSize: data.tileSize,
                            tilematrixSet: data.tilematrixSet,
                            format: data.format,
                            id: this._baseLayerId,
                            maxZoom: options.maxZoom,
                            img: options.baseLayer.img,
                            tileSize: options.tileSize,
                            continuousWorld: true
                        };
                        this._baseLayer = L.tileLayer.wmts(url, newOptions);
                    });
                } else {
                    this._baseLayer = new L.esri.Layers.TiledMapLayer(options.baseLayer.url, {
                        id: this._baseLayerId,
                        maxZoom: options.maxZoom,
                        img: options.baseLayer.img,
                        tileSize: options.tileSize,
                        continuousWorld: true
                    });
                }
            } else {
                crs = L.CRS.EPSG2379;
                this._baseLayer = L.esri.dynamicMapLayer(options.baseLayer.url, {
                    id: this._baseLayerId,
                    img: options.baseLayer.img,
                    continuousWorld: true
                });
            }

            //============================设置坐标系======================/

            //============================设置显示中心====================/
            var minPoint = crs.projection.unproject(L.point(options.baseLayer.fullextent[0], options.baseLayer.fullextent[1]));
            var maxPoint = crs.projection.unproject(L.point(options.baseLayer.fullextent[2], options.baseLayer.fullextent[3]));
            var bounds = L.latLngBounds(minPoint, maxPoint);
            //var centerPoint = bounds.getCenter();
			//因为底图的范围变大了,中心位置显示有问题,直接用坐标定位.bychenx2019/07/30
			 var centerPoint = crs.projection.unproject(L.point(513130.463, 3081806.786));
            //============================设置显示中心=======================/

            this.options = L.setOptions(this, options);
            this.options = L.setOptions(this, {
                crs: crs,
                continuousWorld: true
            });
            //=============================初始化Map============================/
            this._addContextmenu();
            this.map = L.map(this.container, this.options);
            this.map.options.baseLayerUrl = options.baseLayer.url;
            this.map.setView({ lat: 27.970294330371438, lng: 120.69105770072038 }, options.zoom);

            //=======================添加底图 this._baseLayer 存在异步请求的情况=================/
            if (this._baseLayer) {
                this._baseLayer.addTo(this.map);
            } else {
                var t = setInterval($.proxy(function () {
                    if (this._baseLayer) {
                        clearInterval(t);
                        this._baseLayer.addTo(this.map);
                    }
                }, this), 300);
            }

            this.map.whenReady(function () {
                this._getInitExtent();
                this._addDefaultControls();
                if (L.dci.app.initZoom.center!=""){
                    var center = L.dci.app.initZoom.center.split(',');
                    var zoom = L.dci.app.initZoom.zoom;
                    var pnt = L.latLng(center[0], center[1]);
                    this.map.setView(pnt, zoom);
                    this.getBusinessInfo(L.dci.app.initZoom.btmId, L.dci.app.initZoom.caseId);
                }
            }, this);
            //======================初始化Map======================/

            //======================保存视图=========================/
            this._viewHistory = [{ center: centerPoint, zoom: options.zoom }];
            this._curIndx = 0;
            this.map.on('click', (e) => {
                !this._spatialIdentify && (this._spatialIdentify = new L.DCI.SpatialIdentify(this));
                this._spatialIdentify._callback(e);
            }, this);
            this.map.on('moveend', this._updateHistory, this);
            //=========================保存视图=======================/

            this._highLightLayer = new L.layerGroup();
            this._highLightLayer.addTo(this.map);

            this._labelLayer = new L.layerGroup();
            this._labelLayer.addTo(this.map);

            this._geoJsonLayerGroup = new L.geoJson();
            this._geoJsonLayerGroup.addTo(this.map);
            this._popup = L.popup({
                maxHeight: '200px',
                keepInView: false
            });

        },

        /**
        *激活鼠标状态
        *@method activate
        *@param type {string} 鼠标状态类型
        *@param callback {Object}  回调函数
        *@param precall {Object} 激活后执行函数
        *@param context {Object} 当前上下文
        */
        activate: function (type, callback, precall, context) {
            this.deactivate();
            this.setCursor(type);
            if (type == L.DCI.Map.StatusType.SELECT) {//选择
                if (callback != undefined) {
                    this._callback = callback;
                    this._events.push({ "event": this.map.on("click", this._callback, context), "type": type, mapType: 'click' });
                }
            }
             //框选
            else if (type == L.DCI.Map.StatusType.RECT_SELECT) {
                if (callback != undefined) {
                    this._callback = callback;
                    //调用绘图工具
                    if (this._drawTool == null)
                        this._drawTool = L.dci.draw(this.map);
                    this._drawTool.clear();
                    this._drawTool.rectangleIdentify();
                    //鼠标落下事件
                    this._events.push({
                        "event": this.map.on("mousedown", function (e) {
                            if (e.originalEvent.button == 0) {   //如果为鼠标左键
                                this._callback(e);
                                
                            }
                        }, context), "type": type, mapType: 'mousedown'
                    });
                    //鼠标收起事件
                    this._events.push({
                        "event": this.map.on("mouseup", function (e) {
                            if (e.originalEvent.button == 0) {   //如果为鼠标左键
                                this._callback(e);
                            }
                        }, context), "type": type, mapType: 'mouseup'
                    });
                }
            }
            //点选
            else if (type == L.DCI.Map.StatusType.POINT_SELECT) {
                if (callback != undefined) {
                    this._callback = callback;
                    //调用绘图工具
                    if (this._drawTool == null)
                        this._drawTool = L.dci.draw(this.map);
                    this._drawTool.clear();
                    this._drawTool.pointIdentify();
                    //鼠标落下事件
                    this._events.push({
                        "event": this.map.on("mousedown", function (e) {
                            if (e.originalEvent.button == 0) {   //如果为鼠标左键
                                this._callback(e);
                            }
                        }, context), "type": type, mapType: 'mousedown'
                    });
                    //鼠标收起事件
                    this._events.push({
                        "event": this.map.on("mouseup", function (e) {
                            if (e.originalEvent.button == 0) {   //如果为鼠标左键
                                this._callback(e);
                            }
                        }, context), "type": type, mapType: 'mouseup'
                    });
                }
            }
            
            //线选
            else if (type == L.DCI.Map.StatusType.POLYLINE_SELECT) {
                if (callback != undefined) {
                    this._callback = callback;
                    //调用绘图工具
                    if (this._drawTool == null)
                        this._drawTool = L.dci.draw(this.map, this);
                    this._drawTool.clear();
                    this._drawTool.polylineIdentify();
                }
            }
            // 线选 缓冲区
            else if (type == L.DCI.Map.StatusType.POLYLINE_SELECT_BUFFER) {
                this._tolance = context["_tolance"];
                //console.log(this._tolance);
                if (callback != undefined) {
                    this._callback = callback;
                    //调用绘图工具
                    if (this._drawTool == null) 
                        this._drawTool = L.dci.draw(this.map, this);
                
                    this._drawTool.clear();
                    this._drawTool.polylineIdentifyBuffer();
                }
            }
            //统计多边形选
            else if (type == L.DCI.Map.StatusType.POLYGON_STATISTICS) {

                //调用绘图工具
                if (this._drawTool == null)
                    this._drawTool = L.dci.draw(this.map);
                this._drawTool.polygonStatistics();

            }
            else if (type == L.DCI.Map.StatusType.PAN) {

            } else if (type == L.DCI.Map.StatusType.ZOOM_IN) {
                this.map.zoomIn();
            } else if (type == L.DCI.Map.StatusType.ZOOM_OUT) {//缩放
                this.map.zoomOut();
            } else {//绘制
                switch (type) {
                    case L.DCI.Map.StatusType.POINT: //点
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.point();
                        break;
                    case L.DCI.Map.StatusType.POINTTEXT: //标注
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.pointtext();
                        break;
                    case L.DCI.Map.StatusType.POLYLINE: //线
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.polyline();
                        break;
                    case L.DCI.Map.StatusType.CIRCLE: //圆
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.circle();
                        break;
                    case L.DCI.Map.StatusType.RECTANGLE: //矩形
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.rectangle();
                        break;
                    case L.DCI.Map.StatusType.POLYGON: //面
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.polygon();
                        break;

                    case L.DCI.Map.StatusType.MEASURELEN: //测距
                        if (this._measureTool == null)
                            this._measureTool = L.dci.measure(this.map);
                        this._measureTool.distance();
                        break;
                    case L.DCI.Map.StatusType.MEASUREAREA: //测面积
                        if (this._measureTool == null)
                            this._measureTool = L.dci.measure(this.map);
                        this._measureTool.area();
                        break;
                    default:
                        break;
                }
                if (callback != undefined) {
                    this._callback = callback;
                    this._events.push({ "event": this.map.on("draw:created", this.draw, context), "type": type, mapType: 'draw:created' });
                }
            }
            if (precall != null)
                precall();

            this.status = type;
        },
        /**
        *空间查询（线选） 的回调参数
        *@method polylineIdentifyCallBack
        *@param intersects {objectt} 线坐标的数组
        */
        polylineIdentifyCallBack: function (intersects) {
            this._callback(intersects, this);
        },
        /**
        *线选缓冲区 的回调参数
        *@method polylineIdentifyCallBackBuffer
        *@param intersects {objectt} 线坐标的数组
        */
        polylineIdentifyCallBackBuffer: function (intersects) {
            this._callback(intersects, this);
            //console.log("polylineIdentifyCallBackBuffer");
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var path = "[[";
            var len = intersects.length;
            for (var i = 0; i < len; i++) {
                var newlatlng = map.options.crs.project(new L.LatLng(intersects[i].lat, intersects[i].lng));
                path = path + "[" + newlatlng.x + "," + newlatlng.y + "]"
                if (i != len - 1) path = path + ",";
            }
            path = path + "]]"
            this.ajax = new L.DCI.Ajax();
            var newUrl = Project_ParamConfig.geometryServerUrl + "/buffer";
            var queryJson = {
                geometries: '{"geometryType": "esriGeometryPolyline","geometries": [{"paths":' + path + ',"spatialReference": {"wkid": 102100, "latestWkid": 4326}}]}',
                inSR: 102100,
                distances: this._tolance,
                outSR: 102100,
                unit: 9001,
                f: "pjson"
            }

            this.ajax.get(newUrl, queryJson, true, this, function (res) {
                if (res) {
                    var rings = res["geometries"][0]["rings"][0];
                    var shapeOptions = {
                        color: L.DCI.App.symbol.polylineSymbol.color,
                        weight: 1,
                        dashArray: "40",
                        opacity: .7,
                        fill: false
                    };
                  
                    //console.log(rings);
         
                    // 画回折线
                    var qmap = map.getMap();
                    var lay = L.polyline(intersects, shapeOptions);
                    this._highLightLayer.addLayer(lay);
                    this._highLightLayer.addTo(qmap);

                    ResultsBuffers = rings;
                    // 温州2000坐标转经纬坐标
                    var len = rings.length;
                    var ringsTrans = [];
                    for (var i = 0; i < len ; i++) {
                        ringsTrans[i] = map.options.crs.projection.unproject(L.point(rings[i]));
                    }
                   
                    shapeOptions.fill = true;
                    var lay = L.polygon(ringsTrans, shapeOptions);
                    this._highLightLayer.addLayer(lay);
                    this._highLightLayer.addTo(qmap);

                }
            }, function (err) {
                console.log(err);
            });
        },


        /**
        *重置鼠标状态
        *@method deactivate
        */
        deactivate: function () {
            for (var tool in this._drawTools) {
                if (this._drawTools[tool] != null) this._drawTools[tool].disable();
            }
            if (this._measureTool) this._measureTool.disable();
            if (this._drawTool) { this._drawTool.disable(); }
            for (var i = 0; i < this._events.length; i++) {
                this.map.off(this._events[i].mapType);
            }
            this._callback = null;
            this._events = [];
            this.setCursor(L.DCI.Map.StatusType.PAN);

        },

        /**
        *获取地图对象
        *@method getMap
        *@return {Object} map对象
        */
        getMap: function () {
            return this.map;
        },

        /**
        *获取图层集合
        *@method getLayers
        *@return {Array} 图层列表
        */
        getLayers: function () {
            var lyArr = [];
            this.map.eachLayer(function (layer) {
                lyArr.push(layer);
            });
            return lyArr;
        },

        /**
        *添加Shp要素
        *@method addShp
        *@param id {String} 需要添加的shp要素的id
        */
        addShp: function (id) {
            var _layer = null;
            var layer = null;
            for (var i = 0, item; item = this._shpLayerGroups[i++];) {
                if (item.groupId == id) {
                    _layer = item;
                    layer = item.group;
                    break;
                }
            }
            if (!_layer) {
                for (var j = 0, item2; item2 = this.shpLayerGroups[j++];) {
                    if (item2.groupId == id) {
                        layer = {};
                        $.extend(layer, item2);
                        layer.group = item2.group.clone();
                        item2["visible_" + this.id] = true;

                        this.map.addLayer(layer.group);
                        this._shpLayerGroups.push(layer);
                        break;
                    }
                }
            }
            return layer;
        },

        /**
        *添加Cad要素
        *@method addCad
        *@param id {String} 需要添加的Cad要素的id
        */
        addCad: function (id) {
            var _layer = null;
            var layer = null;

            for (var i = 0, item; item = this._cadLayerGroups[i++];) {
                if (item.groupId == id) {
                    _layer = item;
                    layer = item.group;
                    break;
                }
            }
            if (!_layer) {
                for (var j = 0, item2; item2 = this.cadLayerGroups[j++];) {
                    if (item2.groupId == id) {
                        layer = {};
                        $.extend(layer, item2);
                        layer.group = item2.group.clone();
                        item2["visible_" + this.id] = true;

                        this.map.addLayer(layer.group);
                        this._cadLayerGroups.push(layer);
                        break;
                    }
                }
            }
            return layer;
        },
        /**
        *移除Shp要素
        *@method removeShp
        *@param id {String} 需要移除的shp要素的id
        */
        removeShp: function (id) {
            //var map = L.dci.app.pool.get('map');
            for (var i = 0, item; item = this._shpLayerGroups[i++];) {
                if (id == item.groupId) {
                    this.map.removeLayer(item.group);
                    this._shpLayerGroups.splice(i - 1, 1);
                    break;
                }
            }

            for (var j = 0, item2; item2 = this.shpLayerGroups[j++];) {
                if (item2.groupId == id) {
                    item2["visible_" + this.id] = false;
                    break;
                }
            }
        },
        /**
        *移除所有Shp要素
        *@method removeAllShp
        */
        removeAllShp: function () {
            for (var i = 0, item; item = this._shpLayerGroups[i++];) {
                this.map.removeLayer(item.group);
                this._shpLayerGroups.splice(i - 1, 1);
            }
            for (var j = 0, item2; item2 = this._shpLayerGroups[j++];) {
                item2["visible_" + this.id] = false;
            }
        },
        /**
        *移除所有Cad要素
        *@method removeAllCad
        */
        removeAllCad: function () {
            for (var i = 0, item; item = this._cadLayerGroups[i++];) {
                this.map.removeLayer(item.group);
                this._cadLayerGroups.splice(i - 1, 1);
            }
            for (var j = 0, item2; item2 = this.cadLayerGroups[j++];) {
                item2["visible_" + this.id] = false;
            }
        },
        /**
        *移除Cad要素
        *@method removeShp
        *@param id {String} 需要移除的Cad要素的id
        */
        removeCad: function (id) {
            for (var i = 0, item; item = this._cadLayerGroups[i++];) {
                if (id == item.groupId) {
                    this.map.removeLayer(item.group);
                    this._cadLayerGroups.splice(i - 1, 1);
                    break;
                }
            }
            for (var j = 0, item2; item2 = this.cadLayerGroups[j++];) {
                if (item2.groupId == id) {
                    item2["visible_" + this.id] = false;
                    break;
                }
            }
        },
        /*绘制事件回调*/
        draw: function (geo) {

        },

        /**
        *获取地图鼠标状态
        *@method getCurrentStatus
        */
        getCurrentStatus: function () {
            return this._status;
        },

        /**
        *设置当前底图
        *@method setBaseLayer
        *@param layer {Object} 图层
        */
        setBaseLayer: function (layer) {
            if (layer != this._baseLayer) {
                this._baseLayer = layer;
                this.options.baseLayer = layer.url;
            }
        },

        /**
        *获取当前底图
        *@method getBaseLayer
        *@return {Object} 图层
        */
        getBaseLayer: function () {
            return this._baseLayer;
        },

        /**
        *设置右键菜单
        *@method _addContextmenu
        *@private
        */
        _addContextmenu: function () {
            if (this.options.contextmenu == true && this.controls.contextmenu == null) {
                var data = L.dci.app.menu.getContextMenu(this);
                this.options = L.setOptions(this, {
                    contextmenu: true,
                    contextmenuWidth: 140,
                    contextmenuItems: data
                });
            }
        },
        /**
        *添加地图控件
        *@method _addDefaultControls
        *@private
        */
        _addDefaultControls: function () {
            //鹰眼
            if (this.options.miniMapControl == true && this.controls.miniMap == null) {
                var miniLayer = null;
                if (this.options.baseLayer.type == "tile") {
                    miniLayer = new L.esri.Layers.TiledMapLayer(this.options.baseLayer.url, {
                        tileSize: this.options.tileSize,
                        continuousWorld: true
                    });
                } else {
                    miniLayer = L.esri.dynamicMapLayer(this.options.baseLayer.url, {
                        continuousWorld: true
                    });
                }
                this.controls.miniMap = L.dci.minimap(miniLayer, { toggleDisplay: true }).addTo(this.map);
            }
            //切换工具
            if (this.options.layerSwitchControl && this.controls.layerswitch == null) {

                var baseLayersArr = { "底图切换": {} };
                baseLayersArr["底图切换"][this.options.baseLayer.name] = this._baseLayer;

                for (var i = 0; i < this.options.changeLayers.length; i++) {
                    var baseObj = this.options.changeLayers[i];
                    if (baseObj.tiled) {
                        baseLayersArr["底图切换"][baseObj.name] = new L.esri.Layers.TiledMapLayer(baseObj.url, {
                            //id: "basemap_" + i,
                            id: "basemap-" + i,
                            name: baseObj.name,
                            img: "images/controls/grouplayer/" + baseObj.img,
                            tileSize: baseObj.tileSize,
                            origin: [baseObj.origin[0], baseObj.origin[1]],
                            zIndex: 1,
                            continuousWorld: true
                        });
                    } else {
                        baseLayersArr["底图切换"][baseObj.name] = new L.esri.Layers.DynamicMapLayer(baseObj.url, {
                            //id: "basemap_" + i,
                            id: "basemap-" + i,
                            img: "images/controls/grouplayer/" + baseObj.img,
                            layers: baseObj.layerIndex
                        });
                    }
                }

                var groupedOverlays = { "快捷添加图层": {} };
                for (var i = 0; i < this.options.themLayers.length; i++) {
                    var obj = this.options.themLayers[i];
                    groupedOverlays["快捷添加图层"][obj.name] =
                        new L.esri.DynamicMapLayer(obj.url, {
                            id: "thememap_" + i,
                            name: obj.name, layers: [obj.index]
                        });
                }
                var layerControl = L.dci.groupedLayers(baseLayersArr, groupedOverlays, null);
                this.map.addControl(layerControl);
            }

            if (this.options.layerTabControl && this.layertab == null) {
                this.layertab = L.dci.layertab(this);
                L.DCI.App.pool.add(this.layertab);
                this.map.addControl(this.layertab);
            }
            this.controls.print = L.dci.print();

            //=========================添加时间轴==============================/
            if (this.options.timesliderControl == true) {
                this.controls.timeslider = new L.DCI.Controls.TimeSlider(this.options);
                this.map.addControl(this.controls.timeslider);
            }
            //=========================图例==============================/
            if (this.controls.legend == null) {
                this.controls.legend = L.dci.legend({
                    isshow: false
                });
                this.map.addControl(this.controls.legend);
            }
            
            $(".leaflet-control-layers-list").click(function (e) {
                e.stopPropagation();   //停止事件冒泡
            });
            $(".leaflet-control-layers-list").dblclick(function (e) {
                e.stopPropagation();   //停止事件冒泡
            });
        },

        /**
        *获取控件集合
        *@method getControls
        *@return {Object} 控件集合
        */
        getControls: function () {
            return this.controls;
        },

        /**
        *清空地图
        *@method clear
        */
        clear: function () {
            this.deactivate();
            if (this._drawTool) this._drawTool.clear();
            this.setCursor(L.DCI.Map.StatusType.PAN);
            if (this._identify) this._identify.clear();
            if (this._spatialIdentify) this._spatialIdentify.clear();
            if (this._query) this._query.clear();
            if (this._popup) this.map.removeLayer(this._popup);
            if (this._highLightLayer) this._highLightLayer.clearLayers();
            if (this._labelLayer) this._labelLayer.clearLayers();
            if (this._geoJsonLayerGroup) this._geoJsonLayerGroup.clearLayers();
            this.clearAllHLLayer();
            this.removeAllCad();
            this.removeAllShp();
        },
        /**
        *获取地图气泡
        *@method getPopup
        *@return {Object} 气泡对象
        */
        getPopup: function () {
            return this._popup;
        },
        /**
        *获取初始化地图范围
        *@method _getInitExtent
        *@private
        */
        _getInitExtent: function () {
            this.center = this.map.getCenter();
            this.zoom = this.map.getZoom();
        },

        /**
        *全图
        *@method zoomToFullExtent
        */
        zoomToFullExtent: function () {
            this.map.setView(this.center, this.zoom);
        },

        /**
        *设置鼠标状态
        *@method setCursor
        *@param type {Object} 鼠标状态类型
        *@param cursorImg {String} 鼠标图片地址
        */
        setCursor: function (type) {
            if (type == L.DCI.Map.StatusType.PAN) {
                this.map.getContainer().style.cursor = "";
            } else {
                this.map.getContainer().style.cursor = "default";
            }
        },

        /**
        *设置鼠标状态样式
        *@method setCursorImg
        *@param type {Object} 鼠标状态类型
        *@param cursorImg {String} 鼠标图片地址
        */
        setCursorImg: function (cursorImg) {
            if (cursorImg != undefined)
                this.map.getContainer().style.cursor = "url(themes/default/images/cursor/"+cursorImg+"),auto";
            else
                this.map.getContainer().style.cursor = "";
        },
        /**
        *设置图例
        *@method legend
        */
        legend: function () {
            if (!this._legend) {
                this._legend = L.dci.legend();
                this._legend.addTo(this.map);
            } else {
                this._legend.show();
            }

        },

        /**
        *前一视图
        *@method goBack
        */
        goBack: function () {
            if (this._curIndx != 0) {
                this.map.off('moveend', this._updateHistory, this);
                this.map.once('moveend', function () { this.map.on('moveend', this._updateHistory, this); }, this);
                this._curIndx--;
                var view = this._viewHistory[this._curIndx];
                if (view) this.map.setView(view.center, view.zoom);
            }
        },
        /**
        *后一视图
        *@method goForward
        */
        goForward: function () {
            if (this._curIndx != this._viewHistory.length - 1) {
                this.map.off('moveend', this._updateHistory, this);
                this.map.once('moveend', function () { this.map.on('moveend', this._updateHistory, this); }, this);
                this._curIndx++;
                var view = this._viewHistory[this._curIndx];
                if (view) this.map.setView(view.center, view.zoom);
            }
        },
        /**
        *更新当前视图
        *@method _updateHistory
        */
        _updateHistory: function () {
            var newView = { center: this.map.getCenter(), zoom: this.map.getZoom() };
            var insertIndx = this._curIndx + 1;
            this._viewHistory.splice(insertIndx, this._viewHistory.length - insertIndx, newView);
            this._curIndx++;
        },

        /**
        *判断专题是否存在
        *@method hasLayer
        *@param id {String} 专题ID
        *@return {bool}
        */
        hasLayer: function (id) {
            for (var i = 0; i < this._layerInfo.length; i++) {
                if (this._layerInfo[i].id == id) {
                    return true;
                }
            }
            return false;
        },

        /**
        *叠加专题
        *@method addLayer
        *@param url {String} 专题服务地址
        *@param options {Object} 专题配置
        *@return {Object} 返回叠加的专题对象
        */
        addLayer: function (url, options) {
            var layer = null;
            if (options.layerType == "2") {//切图
                var dymicLayer = new L.esri.Layers.DynamicMapLayer(url);
                dymicLayer.metadata(function (error, metadata) {
                    layer = new L.esri.Layers.TiledMapLayer(url, {
                        id: options.id,
                        name: options.name,
                        layerType: options.layerType,
                        tileSize: metadata.tileInfo.rows,
                        zIndex: 1,
                        proxyUrl:options.proxyUrl,
                        origin: [metadata.tileInfo.origin.x, metadata.tileInfo.origin.y],
                        continuousWorld: true
                    }).addTo(this.map);
                }, this);
            } else if (options.layerType == "4") {//wmts
                this.getWmtsInfo(url, function (data) {
                    var level = data.level;
                    var latlng = data.latlng;
                    var lat = latlng.substr(0, latlng.indexOf(" "));
                    var lng = latlng.substr(latlng.indexOf(" ") + 1, latlng.length - latlng.indexOf(" "));
                    var m_matrixIds = new Array(level);
                    for (var i = 0; i < 22; i++) {
                        m_matrixIds[i] = {
                            identifier: "" + i,
                            topLeftCorner: new L.LatLng(lat, lng)
                        };
                    }

                    var newOptions = L.dci.app.util.mergesOptions(options, {
                        style: data.style,
                        zIndex: 1,
                        matrixIds: m_matrixIds,
                        continuousWorld: true,
                        tileSize: data.tileSize,
                        layerType: options.layerType,
                        proxyUrl: options.proxyUrl,
                        tilematrixSet: data.tilematrixSet,
                        format: data.format
                    });
                    layer = L.tileLayer.wmts(url, newOptions).addTo(this.map);
                });
            } else if (options.layerType == "3") {//wms
                L.dci.app.util.mergesOptions(options, {
                    format: "image/png",
                    tileSize: this.options.tileSize,
                    continuousWorld: true,
                    layerType: options.layerType,
                    proxyUrl: options.proxyUrl,
                    zIndex: 1,
                    layers: options.layers
                });
                layer = L.tileLayer.wms(url, options).addTo(this.map);
            } else {//矢量图
                layer = L.esri.dynamicMapLayer(url, options);
                layer.addTo(this.map);
            }

            if (layer == null) {
                L.dci.app.util.hideLoading();
            } else {
                //加载完之后
                layer.on("load", function () {
                    L.dci.app.util.hideLoading();
                }, this);
            }
            return layer;
        },

        /**
        *获取wmts图层参数信息
        *@method getWmtsInfo
        *@param url {String} WMTS专题服务地址
        *@param success {Object} 回调函数
        */
        getWmtsInfo: function (url, success) {
            L.dci.app.services.baseService.getWmtsInfo({
                url: url,
                context: this,
                success: function (o) {
                    var obj = o;
                    var data;
                    data = {
                        'level': parseFloat(obj.level),
                        'latlng': obj.topLeftCorner,
                        'tileSize': parseFloat(obj.tileSize),
                        'tilematrixSet': obj.tileMatrixSet,
                        'style': obj.style,
                        'format': obj.format
                    }
                    success.call(this, data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dci.app.util.dialog.error("温馨提示","WMTS服务异常");
                }
            });
        },
        /**
        *获取专题
        *@method getLayer
        *@param id {String} 专题ID
        *@return {Object} 专题对象
        */
        getLayer: function (id) {
            var layer = null;
            this.map.eachLayer(function (_layer) {
                if (_layer.options && _layer.options.id && _layer.options.id == id) {
                    layer = _layer;
                    return false;
                }
            });
            return layer;
        },

        /**
        *删除图层
        *@method removeLayer
        *@param id {String} 专题ID
        */
        removeLayer: function (id) {
            this.map.eachLayer(function (layer) {
                if (layer.options && layer.options.id) {
                    if (layer.options.id == id) {
                        this.map.removeLayer(layer);
                        return;
                    }
                }
            }, this);
        },
        /**
        *闪烁
        *@method flicker
        *@param layers {Array} 要素数组
        *@param opacity {Number} 透明度
        */
        flicker: function (layers, opacity) {
            if (layers.length == 0) return;
            var _this = this;
            var count = 0;

            if (this._flicker) {
                clearInterval(this._flicker);
                this._flicker = null;

                for (var i = 0; i < this._flickerGeo.length; i++) {
                    this._flickerGeo[i].setStyle({ fillOpacity: opacity });
                }
            }
            this._flicker = setInterval(function () {
                _this._flickerGeo = null;
                _this._flickerGeo = layers;

                if (count == 5) {
                    clearInterval(_this._flicker);
                    _this._flicker = null;
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].setStyle({ fillOpacity: opacity });
                    }
                    return;
                }
                if (count % 2 != 0) {
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].setStyle({ fillOpacity: opacity });
                    }
                }
                else {
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].setStyle({ fillOpacity: 0.5 });
                    }
                }
                count++;
            }, 250);
        },
        /**
        *获取高亮图层
        *@method getHighLightLayer
        *@return {Object} 返回图层对象
        */
        getHighLightLayer: function () {
            return this._highLightLayer;
        },
        /**
        *获取图层
        *@method getLabelLayer
        *@return {Object} 返回图层对象
        */
        getLabelLayer: function () {
            return this._labelLayer;
        },
        /**
        *第二版获取高亮图层方法，防止互斥
        *@method getHLLayer
        *@name {String} 高亮图层名
        */
        getHLLayer: function (name) {
            //this['_HLLayer_' + name] = new L.layerGroup();
            //this['_HLLayer_' + name].addTo(this.map);
            //return this['_HLLayer_' + name];
            if (!this['_HLLayer_' + name]) {
                this['_HLLayer_' + name] = new L.layerGroup();
            }            
            this['_HLLayer_' + name].addTo(this.map);
            return this['_HLLayer_' + name];
        },

        /**
        *Map清除第二版高亮图层方法，防止互斥
        *@method clearHLLayer
        *@name {String} 高亮图层名
        */
        clearHLLayer: function (name) {
            if (this['_HLLayer_' + name]) {
                this['_HLLayer_' + name].clearLayers();
            }
            //this._highLightLayer2.clearLayers();
        },


        /**
        *清除所有第二版高亮图层
        *@method clearAllHLLayer
        */
        clearAllHLLayer: function () {
            for (var HL in this) {
                if (HL.indexOf("_HLLayer_") != -1) {
                    this[HL].clearLayers()
                }
            }
        },

        /**
        *属性查询
        *@method identify
        */
        identify: function () {
            if (this._identify == null)
                this._identify = new L.DCI.Identify(this);
            this._identify.active();
        },
        /**
        *模糊查询
        *@method query
        */
        query: function (key) {
            if (this._query == null)
                this._query = new L.DCI.QuickQuery(this);
            this._query.query(key);
        },
        /**
        *获取属性查询对象
        *@method getIdentify
        *@return {Object} 属性查询对象
        */
        getIdentify: function () {
            return this._identify;
        },

        /**
        *销毁
        *@method destroy
        */
        destroy: function () {
            if (this.controls != null) {
                for (var i = this.controls.length - 1; i >= 0; --i) {
                    this.controls[i].destroy();
                }
                this.controls = null;
            }
        },


        getBusinessInfo: function (key, id) {
            var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/manage/layerContrast/base/oa/" + key;
            var dciajax = new L.DCI.Ajax();
            dciajax.get(url, null, true, this, function (data) {
                //默认添加服务
                this.addBasicLayer(data.Values, id);
            });
        },

        addBasicLayer: function (data, id) {
            var count = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].layerType == "1")count++;
            }
            var opacity = 1;
            for (var i = 0; i < data.length; i++) {
                if (data[i].layerType == "1") {
                    var layer = new L.esri.DynamicMapLayer(data[i].url, {
                        id: "浏览版业务默认加载图集" + i,
                        name: data[i].name,
                        layers: [data[i].layerIndex],
                        opacity: opacity
                    });
                    layer.addTo(this.map);
                } else if (data[i].layerType == "2") {
                    var url = data[i].url;
                    var name = data[i].name;
                    var type = data[i].layerType;
                    var dymicLayer = new L.esri.Layers.DynamicMapLayer(url);
                    dymicLayer.metadata(function(error, metadata) {
                        layer = new L.esri.Layers.TiledMapLayer(url, {
                            id: "浏览版业务默认加载图集" + i,
                            name: name,
                            layerType: type,
                            tileSize: metadata.tileInfo.rows,
                            zIndex: 1,
                            origin: [metadata.tileInfo.origin.x, metadata.tileInfo.origin.y],
                            continuousWorld: true
                        }).addTo(this.map);
                    }, this);
                }
            }
        },
        /**
       *空间查询 bychenx
       *修改时间2017/12/19
       *用于地图首页的空间查询，包括点选，框选，线选（查询、结果显示参考identity）
       *@method _spatialIdentify
       */
        spatialIdentify: function (type) {
            if (this._spatialIdentify == null)
                this._spatialIdentify = new L.DCI.SpatialIdentify(this);
            this._spatialIdentify.active(type);
        },

    });

    /**
    *鼠标状态
    *@class DCI.Map.StatusType
    *@static
    */
    L.DCI.Map.StatusType = {
        /**
        *查询
        *@property SELECT
        *@type {String}
        *@final
        */
        SELECT: "select",
        /**
        *框选查询、统计
        *@property RECT_SELECT
        *@type {String}
        *@final
        */
        RECT_SELECT: "rect_select",
        /**
        *点选查询、统计
        *@property POINT_SELECT
        *@type {String}
        *@final
        */
        POINT_SELECT: "point_select",
        /**
        *线选查询、统计
        *@property POLYLINE_SELECT
        *@type {String}
        *@final
        */
        POLYLINE_SELECT: "polyline_select",
        /**
        *线选查询、统计_缓冲区
        *@property POLYLINE_SELECT_Buffer
        *@type {String}
        *@final
        */
        POLYLINE_SELECT_BUFFER: "polyline_buffer_select",
        /**
        *多边形统计
        *@property POLYLINE_SELECT
        *@type {String}
        *@final
        */
        POLYGON_STATISTICS:"polygon_statistics",
        /**
        *移动
        *@property PAN
        *@type {String}
        *@final
        */
        PAN: "pan",
        /**
        *放大
        *@property ZOOM_IN
        *@type {String}
        *@final
        */
        ZOOM_IN: "zoom_in",
        /**
        *缩小
        *@property ZOOM_OUT
        *@type {String}
        *@final
        */
        ZOOM_OUT: "zoom_out",
        /**
        *圆形
        *@property CIRCLE
        *@type {String}
        *@final
        */
        CIRCLE: "circle",
        /**
        *点
        *@property POINT
        *@type {String}
        *@final
        */
        POINT: "point",
        /**
        *多边形
        *@property POLYGON
        *@type {String}
        *@final
        */
        POLYGON: "polygon",
        /**
        *折线
        *@property POLYLINE
        *@type {String}
        *@final
        */
        POLYLINE: "polyline",
        /**
        *矩形
        *@property RECTANGLE
        *@type {String}
        *@final
        */
        RECTANGLE: "rectangle",
        /**
        *测距
        *@property MEASURELEN
        *type {String}
        *@final
        */
        MEASURELEN: "measurelen",
        /**
        *测面积
        *@property MEASUREAREA
        *@type {String}
        *@final
        */
        MEASUREAREA: 'meausrearea'
    };
});
