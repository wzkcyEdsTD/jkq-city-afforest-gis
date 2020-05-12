/**
*市政设施统计分析模块类
*@module modules.analysis
*@class DCI.FacilitiesStatistics
*@constructor initialize
*@extends Class
*/

var ResultsBuffers = []
var featureLayer,Psum,Pcount,Page, totalPage,pageInfo;
define("analysis/facilitiesStatistics", [
    "leaflet",
    'rqtext!../../components/tcxz.vue.html',
    'rqtext!../../components/xzqh.vue.html',
    'rqtext!../../components/ydlx.vue.html',
    "core/dcins",
    "plugins/scrollbar",
    "analysis/gpHandler"
   
    
], function (L, tcxz, xzqh, ydlx) {
    L.DCI.FacilitiesStatistics = L.Class.extend({

        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'FacilitiesStatistics',
        /**
          *专题目录
          *@property _data
          *@type {Array}
          *@private
          */
        _data: null,//专题目录
        /**
          *统计的参数
          *@property _data
          *@type {Array}
          *@private
          */
        _tjParam: null,
        /**
          *按字段统计时选择的图层地址
          *@property _queryLayerUrl
          *@type {String}
          *@private
          */
        _queryLayerUrl:null,
        /**
       *鼠标落下点坐标
       *@property _mousedown
       *@type {Object}
       *@private
       */
        _mousedown: null,
        /**
       *鼠标落下前一点坐标
       *@property _mousedown
       *@type {Object}
       *@private
       */
        _mousedownPrev: null,
        /**
        *鼠标收起点坐标
        *@property _mouseup
        *@type {Object}
        *@private
        */
        _mouseup: null,
        _geometry:null,
        _drawType: null,
        _count: 0,
        _tolance: null,
        /**
        *查询结果集
        *@property _results
        *@type {Arrat}
        *@private
        */
        _results: [],
        /**
        *查询结果集
        *@property _results
        *@type {Arrat}
        *@private
        */
        _resultsLayerName: [],
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.getServiceList();
            
        },
        
        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            L.dci.app.pool.remove('FacilitiesStatistics');
        },
        /**
        *获取服务列表
        *@method getServiceList
        **/
        getServiceList: function () {
            L.dci.app.services.baseService.getFeatures({
                context: this,
                userId: L.dci.app.util.user.getCurUser().id,
                success: function (res) {
                    if (res == null || res.length == 0) {
                        L.dci.app.util.dialog.alert("提示", "没有专题访问权限");
                        return;
                    }
                    this._dataClassification(res);
                    L.DCI.App.pool.get('LeftContentPanel').show(this, this.buildPanel(this));
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "图层列表信息获取失败，请检查该服务。");
                }
            });
        },
        _dataClassification: function (data) {
            var featureData = {
                baseData: {
                    mapsetSub: [],
                    mapsetClass: [],
                    mapsetLayer: []
                },
                subjectData: []
            };
            var mapsetCatalog = [], mapsetSub = [], mapsetClass = [], mapsetLayer = [];

            for (var i = 0; i < data.length; i++) {
                if (data[i]["FEATURETYPE"] == "mapset_catalog") {
                    mapsetCatalog.push(data[i]);
                    var featureid = data[i]["FEATUREID"];
                    for (var k = 0; k < data.length; k++) {
                        //构建地图集数据
                        if (data[k]["FEATUREPARENTID"] == featureid) {
                            featureData.baseData.mapsetSub.push(data[k]);
                        }
                    }
                }
            };
            for (var j in featureData.baseData.mapsetSub) {
                var status = [false, false, false, false];
                var mapsetSubId = featureData.baseData.mapsetSub[j]["FEATUREID"];
                for (var k in data) {
                    if (data[k]["FEATUREPARENTID"] == mapsetSubId && data[k]["FEATURETYPE"] == "mapset_class") {
                        featureData.baseData.mapsetClass.push(data[k]);
                    }
                }
            }
            
            for (var j in featureData.baseData.mapsetClass) {
                var status = [false, false, false, false];
                var mapsetClassId = featureData.baseData.mapsetClass[j]["FEATUREID"];
                for (var k in data) {
                    if (data[k]["FEATUREPARENTID"] == mapsetClassId && data[k]["FEATURETYPE"] == "mapset_layer") {
                        data[k]["status"] = status;
                        featureData.baseData.mapsetLayer.push(data[k]);
                    }
                }
            }
          
            this._data = null;
            this._data = featureData;
        },


        /**
        *构建面板
        *@method buildPanel
        **/
        buildPanel: function (obj) {

            var _this = obj;
            //alert("调用成功");
            $(".leftcontentpanel-title>span:first").html("统计分析");         //标题
            this.dom = $(".leftcontentpanel-body");
            this.dom.html('');
            this.dom.append(tcxz);
            
            for (var j in _this._data.baseData.mapsetSub) {
                var mapsetLayer = _this._data.baseData.mapsetSub[j];
                $("#tjTypeSelect").append("<option value='" + mapsetLayer.FEATUREID + "'>" + mapsetLayer.FEATURENAME + "</option>");
            }
            for(var i in _this._data.baseData.mapsetLayer){
                var mapsetLayer = _this._data.baseData.mapsetLayer[i];
                $("#layerSelect").append("<option value='" + mapsetLayer.FEATUREID + "'>" + mapsetLayer.FEATURENAME + "</option>");
            }
            $("input[name='statisticType']").click(function(){
                if (this.id == "zdtjRadios") {
                    //$(".statisticsSelect").removeAttr("disabled");
                    //$("#tjTypeSelect").attr("disabled", "disabled");
                    $("#lxtjRadios-content").hide();
                    $("#zdtjRadios-content").show();
                }
                else {
                    //$(".statisticsSelect").attr("disabled", "disabled");
                    //$("#tjTypeSelect").removeAttr("disabled");
                    $("#lxtjRadios-content").show();
                    $("#zdtjRadios-content").hide();
                }
            });
            $("#layerSelect").change(function () {
                if (this.value == "-1") {
                    $("#groupByFieldSelect").empty();
                    $("#groupByFieldSelect").append("<option value='-1'>请选择</option>");
                    $("#statisticsFieldSelect").empty();
                    $("#statisticsFieldSelect").append("<option value='-1'>请选择</option>");
                }
                else {
                    _this.getLayerInfo(this.value);
                }
            });
            /*鼠标点击下去的时候，决定是否选中*/
            $("input[name='drawType']").bind("mousedown", function (event) {
                var radioChecked = $(this).prop("checked");
                $(this).prop('checked', !radioChecked);
                var drawType = $("input[name='drawType']:checked").val();
                _this._drawType = drawType;
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                if (!radioChecked) {//选中
                    $(".option-content").hide();
                    $("#" + this.id + "-content").show();
                    //if (this.id == "kxfwOption") {
                    //    //默认触发绘制矩形
                    //    $("#kxfwOption-content").show();
                    //    //$("#info").removeAttr("disabled");
                    //}
                    //else {
                    //    $("#info").attr("disabled", "disabled");
                    //}
                }
                else {
                    $(".option-content").hide();
                    map.deactivate();
                }
                return false;
            });

            /*阻止click事件默认行为*/
            $("input[name='drawType']").click(function (event) {
                return false;
            });
            
            $("#drawGeo").click(function () {
                _this._geometry = null;
                ResultsBuffers = [];  // 清空缓冲区全局变量
                var drawType = $("input[name='drawType']:checked").val();
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                var hlLayer = map.getHighLightLayer();
                hlLayer.clearLayers();
                if (drawType) {
                    var tolance = null;
                    if (drawType == "dxfw") {
                        tolance = $("#dxfwInput").val();
                        if (tolance == null||tolance=="") {
                            L.dci.app.util.dialog.alert("温馨提示", "请填写参数“点选范围值”");
                            return false;
                        }
                        else {
                            _this._tolance = tolance;
                            map.activate(L.DCI.Map.StatusType.POINT_SELECT, _this._callback, _this.precall, _this);
                        }
                    }
                    else if (drawType == "kxfw") {
                        var checked = $("#info").is(":checked");
                        if (checked) {
                            map.activate(L.DCI.Map.StatusType.POLYGON_STATISTICS, _this._callback, _this.precall, _this);
                        }
                        else {
                            map.activate(L.DCI.Map.StatusType.RECT_SELECT, _this._callback, _this.precall, _this);
                        }
                    }
                    else if (drawType == "xxfw") {
                        tolance = $("#xxfwInput").val();
                        if (tolance == null || tolance == "") {
                            L.dci.app.util.dialog.alert("温馨提示", "请填写参数“线选范围值”");
                            return false;
                        }
                        else {
                            _this._tolance = tolance;
                            map.activate(L.DCI.Map.StatusType.POLYLINE_SELECT_BUFFER, _this._callback, _this.precall, _this);
                        }
                    }
                    //else if (drawType == "sjfw") {
                    //    tolance = $("#sjfwInput").val();
                    //    if (tolance == null || tolance == "") {
                    //        L.dci.app.util.dialog.alert("温馨提示", "请填写参数“数据范围值”");
                    //        return false;
                    //    }
                    //    else {
                    //        this._tolance = tolance;
                    //        $("#info").attr("disabled", "disabled");
                    //        map.activate(L.DCI.Map.StatusType.POLYLINE, _this._callback, _this.precall, _this);
                    //    }
                    //}
                }
                else {
                    L.dci.app.util.dialog.alert("温馨提示", "请选择绘制范围类型");
                    return false;
                }
                
               
            });

            $("#tongji").click(function () {
                _this.tongji();
            });
            //滚动条
            $(".alPanel").mCustomScrollbar({
                theme: "minimal-dark"
            });

            ////滚动条
            //$(".lpcover").mCustomScrollbar({
            //    theme: "minimal-dark"
            //});

        },
        getDrawPolygonsRegion: function (lay) {
            this._geometry = lay;
        },
    
        _callback: function (evt) {
 
            if (evt.type == "mousedown") {
                this._mousedown = evt.latlng;   //设置鼠标落下坐标
            } else if (evt.type == "mouseup" && this._mousedown != null) {
                this._mouseup = evt.latlng;   //设置鼠标收起坐标
                
                //this.clear();
                
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                var _map = map.map;
                var _this = this;
                if (this._mousedown.lat == this._mouseup.lat && this._mousedown.lng == this._mouseup.lng && _this._drawType=="dxfw") {   //如果为点选
                    var shapeOptions = {
                        color: L.DCI.App.symbol.polygonSymbol.color,
                        weight: L.DCI.App.symbol.polygonSymbol.weight,
                        opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                        fill: L.DCI.App.symbol.polygonSymbol.fill,
                        fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                        fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                        clickable: true,
                        declaredClass: 'DrawCircle'
                    };
                    var lay = new L.Circle(new L.LatLng(this._mousedown.lat, this._mousedown.lng), this._tolance, shapeOptions);
                    var hlLayer = map.getHighLightLayer();
                    hlLayer.clearLayers();
                    hlLayer.addLayer(lay);
                    this._geometry = lay;
                   
                    //var geo = L.dci.app.util.highLight(map, lay, true, false);
                    //this._feature.push(geo);
                } 
                else {   //如果为框选
                    var bounds = L.latLngBounds(this._mousedown, this._mouseup);
                    var lay = new L.Rectangle(bounds);
                    this._geometry = lay;
                } 

                this._mousedown = null;
                this._mouseup = null;
               
            }
        },

        getLayerInfoCallback: function (layer, callback) {
            var _this = this;
            //L.dci.app.util.showLoading();
			var id=layer.FEATUREID
            feaId = "layer-" + id;
            var layerRes = $.cookie(feaId);
            if (layerRes != null && layerRes != "null") {
                layerRes = JSON.parse(layerRes);
                if (callback) {
                    callback(layerRes);
                }
            } else {
                L.dci.app.services.baseService.getFeatureLayerById({
                    id: id,
                    context: _this,
                    success: function (res) {
                        if (res != "0" && res.length > 0) {
                            if (callback) {
                                callback(res);
                            }
                            $.cookie(feaId, JSON.stringify(res));
                        } else {
                            if (callback) {
                                callback(null);
                            }
                        }
                    }
                });
            }
        },
        getLayerInfo: function (id) {
            var _this = this;
            //L.dci.app.util.showLoading();

            feaId = "layer-" + id;
            var layerRes = $.cookie(feaId);
            if (layerRes != null && layerRes != "null") {
                layerRes = JSON.parse(layerRes);
                this._getLayerInfo(layerRes, id);
            } else {
                L.dci.app.services.baseService.getFeatureLayerById({
                    id: id,
                    context: _this,
                    success: function (res) {
                        if (res != "0" && res.length > 0) {
                            _this._getLayerInfo(res, id);
                            $.cookie(feaId, JSON.stringify(res));
                        } else {
                            L.dci.app.util.dialog.alert("提示", "该服务已被禁用");
                            //L.dci.app.util.hideLoading();
                        }
                    }
                });
            }
        },
        _getLayerInfo: function (res, id) {
            for (var i = 0; i < res.length; i++) {
                resourceId = res[i]["ResourceId"];
                url = res[i]["Url"];
                index = res[i]["LayerIndex"];
                layerType = res[i]["LayerType"];
                layerName = res[i]["LayerName"];
                featurename = res[i]["FeatureName"];
                feaId = "layer-" + id;
                this.ajax = new L.DCI.Ajax();
                this._queryLayerUrl = url + "/" + index;
                var newUrl = url + "/" + index + "?f=pjson";
                    

                this.ajax.get(newUrl, null, true, this, function (res) {
                    var fields = res.fields;
                    for (var j in fields) {
                        var field = fields[j];
                        if (field.type != "esriFieldTypeOID" && field.type != "esriFieldTypeDate" && field.type != "esriFieldTypeDate"
                            && field.type != "esriFieldTypeGeometry") {
                            if (field.name == "SHAPE_Length ") {
                                $("#groupByFieldSelect").append("<option value='" + field.name + "'>长度</option>");
                            }
                            else {
                                $("#groupByFieldSelect").append("<option value='" + field.name + "'>" + field.alias + "</option>");
                            }
                        }
                        if (field.type == "esriFieldTypeDouble" || field.type == "esriFieldTypeSmallInteger") {
                            if (field.name == "SHAPE_Length ") {
                                $("#statisticsFieldSelect").append("<option value='" + field.name + "'>长度</option>");
                            }
                            else {
                                $("#statisticsFieldSelect").append("<option value='" + field.name + "'>" + field.alias + "</option>");
                            }
                        }
                    }
                    
                }, function (err) {
                    L.dci.app.util.dialog.alert("提示", "服务查询出错");
                    //L.dci.app.util.hideLoading();
                });
                
            }
           
        },
        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            this._alReset();
            L.dci.app.pool.remove('FacilitiesStatistics');
        },

                
        _getParam: function () {
            //统计类型
            var statisticType = $("input[name='statisticType']:checked").val();
            var statisticsLayer = null, groupByField = null, statisticsField = null, statisticsLayerType=null;
            if (statisticType == "zdtj") {
                statisticsLayer = $("#layerSelect").val();
                groupByField = $("#groupByFieldSelect").val();
                statisticsField = $("#statisticsFieldSelect").val();
                if (statisticsLayer == "-1") {
                    L.dci.app.util.dialog.alert("温馨提示", "请选择参数“选择图层”");
                    return false;
                }
                if (groupByField == "-1") {
                    L.dci.app.util.dialog.alert("温馨提示", "请选择参数“分类字段”");
                    return false;
                }
                if (statisticsField == "-1") {
                    L.dci.app.util.dialog.alert("温馨提示", "请选择参数“统计字段”");
                    return false;
                }
            }
            else {
                statisticsLayerType = $("#tjTypeSelect").val();
                if (statisticsLayerType == "-1") {
                    L.dci.app.util.dialog.alert("温馨提示", "请选择参数“统计类型”");
                    return false;
                }
            }
            
            //空间查询方式选择
            var drawType = $("input[name='drawType']:checked").val();
            var tolance = null;
            if (drawType == "dxfw") {
                tolance = $("#dxfwInput").val();
                if (tolance==null) {
                    L.dci.app.util.dialog.alert("温馨提示", "请填写参数“点选范围值”");
                    return false;
                }
            }
            else if (drawType == "kxfw") {
                var checked = $("#info").is(":checked");
                drawType = checked == true ? "dbx" : "jx";
            }
            else if (drawType == "xxfw") {
                tolance = $("#xxfwInput").val();
                if (tolance == null) {
                    L.dci.app.util.dialog.alert("温馨提示", "请填写参数“线选范围值”");
                    return false;
                }
            }
            else if (drawType == "sjfw") {
                tolance = $("#sjfwInput").val();
                if (tolance == null) {
                    L.dci.app.util.dialog.alert("温馨提示", "请填写参数“数据范围值”");
                    return false;
                }
            }
            
            
            var tjParam = {};
            tjParam.statisticType = statisticType;
            tjParam.statisticsLayerType = statisticsLayerType;
            tjParam.statisticsLayer = statisticsLayer;
            tjParam.groupByField = groupByField;
            tjParam.statisticsField = statisticsField;
            tjParam.drawType = drawType;
            tjParam.tolance = tolance;
            this._tjParam = tjParam;

            
            return true;
        },
        //统计
        tongji: function () {
            var _this = this;
            //统计前重置筛选结果
            this._alReset();
            if (this._getParam()) {
                //显示loading
                var obj = $('.tjresult');
                this._loading(obj);
                var tjParam = this._tjParam;
                this.ajax = new L.DCI.Ajax();
                var layerList=[];
                if (tjParam.statisticType == "lxtj") {
                    //按照类型统计
                    var statisticsLayerType = tjParam.statisticsLayerType;
                    for (var i in this._data.baseData.mapsetClass) {
                        if (this._data.baseData.mapsetClass[i].FEATUREPARENTID == statisticsLayerType) {
                            var FEATUREID = this._data.baseData.mapsetClass[i].FEATUREID;
                            for (var j in this._data.baseData.mapsetLayer) {
                                if (FEATUREID == this._data.baseData.mapsetLayer[j].FEATUREPARENTID) {
                                    layerList.push(this._data.baseData.mapsetLayer[j]);
                                }
                            }
                        }
                    }
                    if (layerList.length == 0) {
                        L.dci.app.util.dialog.alert("温馨提示", "没有统计的市政设施");
                        var obj = $('.tjresult');
                        this._loaded(obj);
                        return;
                    }
                    else {
                        this._count = layerList.length;
                        for (var k in layerList) {
                            this.getLayerInfoCallback(layerList[k], function (layerInfo) {
								
                                for (var i = 0; i < layerInfo.length; i++) {
                                    var resourceId = layerInfo[i]["ResourceId"];
                                    var url = layerInfo[i]["Url"];
                                    var index = layerInfo[i]["LayerIndex"];
                                    var featureName = layerInfo[i]["FeatureName"];
                                    _this._resultsLayerName.push(featureName);
                                    var newUrl = url + "/" + index + "/query";
									var outStatisticsStr="";
									var queryJson = {
                                        where: "1=1",
                                        text: "",
                                        objectIds: "",
                                        time: "",
                                        geometry: "",
                                        geometryType: "",
                                        inSR: "",
                                        spatialRel: "esriSpatialRelIntersects",
                                        //spatialRel: "esriSpatialRelEnvelopeIntersects",
                                        relationParam: "",
                                        outFields: "*",
                                        returnGeometry: true,
                                        maxAllowableOffset: "",
                                        geometryPrecision: "",
                                        outSR: "",
                                        returnIdsOnly: false,
                                        returnCountOnly: false,
                                        orderByFields: "",
                                        groupByFieldsForStatistics: "",
                                        outStatistics: "",
                                        returnZ: false,
                                        returnM: false,
                                        gdbVersion: "",
                                        returnDistinctValues: false,
                                        f: "pjson"
                                    };
                                    var geometryType = "", geometry = "", distance = "";
                                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                                    var wkid = 'PROJCS["wenzhou2000", GEOGCS["GCS_China_Geodetic_Coordinate_System_2000", DATUM["D_China_2000", SPHEROID["CGCS2000", 6378137.0, 298.257222101]], PRIMEM["Greenwich", 0.0], UNIT["Degree", 0.0174532925199433]], PROJECTION["Gauss_Kruger"], PARAMETER["False_Easting", 500000.0], PARAMETER["False_Northing", 0.0], PARAMETER["Central_Meridian", 120.666666666667], PARAMETER["Scale_Factor", 1.0], PARAMETER["Latitude_Of_Origin", 0.0], UNIT["Meter", 1.0]]';

                                    if (tjParam.drawType) {
                                        //点选
                                        if (tjParam.drawType == "dxfw") {
                                            queryJson.geometryType = "esriGeometryPolygon";
                                            var bounds = _this._geometry.getBounds();
                                            var northEast = _this._geometry.getBounds()._northEast;
                                            northEast = map.options.crs.project(northEast);
                                            var southWest = _this._geometry.getBounds()._southWest;

                                            southWest = map.options.crs.project(southWest);
                                            queryJson.geometry = '{"spatialReference":{"wkid":null},"rings":[[[' + northEast.x + ',' + southWest.y + '],' +
                                                '[' + northEast.x + ',' + northEast.y + '],[' + southWest.x + ',' + northEast.y + '],' +
                                            '[' + southWest.x + ',' + southWest.y + ']]]}';
                                            //queryJson.geometry= '{"spatialReference":{"wkid":null},"rings":[[[511978.8124614804,3082451.4829386654],[511978.0152823652,3083255.1399848303],[513009.05137609865,3083256.2068547728],[513009.91717466706,3082452.549624147],[511978.8124614804,3082451.4829386654]]]}';
                                        }
                                        if (tjParam.drawType == "jx" || tjParam.drawType == "dbx") {
                                            queryJson.geometryType = "esriGeometryPolygon";
                                            queryJson.geometry = '{"spatialReference":{"wkid":null},"rings":[[';
                                            var latLngs = _this._geometry.getLatLngs();
                                            for (var i in latLngs) {
                                                var latLng = latLngs[i];
                                                latLng = map.options.crs.project(latLng);
                                                queryJson.geometry += '[' + latLng.x + ',' + latLng.y + '],';
                                            }
                                            queryJson.geometry.substr(1, queryJson.geometry.length - 1);
                                            queryJson.geometry += ']]}';
                                        }
                                        if (tjParam.drawType == "xxfw") {
                                            queryJson.geometryType = "esriGeometryPolygon";
                                            queryJson.geometry = '{"spatialReference":{"wkid":null},"rings":[[';
                                            
                                            var latLngs = ResultsBuffers;
                                            var len = latLngs.length;
                                            for (var i = 0; i < len ; i++) {
                                                queryJson.geometry += '[' + latLngs[i][0] + ',' + latLngs[i][1] + '],';
                                            }
                                            queryJson.geometry.substr(1, queryJson.geometry.length - 1);
                                            queryJson.geometry += ']]}';
                                            console.log(queryJson);
                                        }
                                    }
                                    //console.log(queryJson);
                                   _this.queryByLx(newUrl, queryJson,featureName);
                                }
                            });
                            
                         }
                    }
                }
                else if (tjParam.statisticType == "zdtj") {
                    //按照字段统计
                    var newUrl = this._queryLayerUrl + "/query";
                    var outStatistics = [{
                        "statisticType": "sum",
                        "onStatisticField": tjParam.statisticsField,
                        "outStatisticFieldName": "sum"
                    },
                    {
                        "statisticType": "count",
                        "onStatisticField": "OBJECTID",
                        "outStatisticFieldName": "count"
                    }];
                    var outStatisticsStr = JSON.stringify(outStatistics);
                    var queryJson = {
                        where: "1=1",
                        text: "",
                        objectIds: "",
                        time: "",
                        geometry: "",
                        geometryType: "esriGeometryPolygon",
                        inSR: "",
                        spatialRel: "esriSpatialRelIntersects",
                        //spatialRel: "esriSpatialRelEnvelopeIntersects",
                        relationParam: "",
                        outFields: "",
                        returnGeometry: false,
                        maxAllowableOffset: "",
                        geometryPrecision: "",
                        outSR: "",
                        returnIdsOnly: true,
                        returnCountOnly: false,
                        orderByFields: "",
                        groupByFieldsForStatistics: "",
                        outStatistics: "",
                        returnZ: false,
                        returnM: false,
                        gdbVersion: "",
                        returnDistinctValues: false,
                        f: "pjson"
                    };
                    var geometryType = "", geometry = "", distance="";
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var wkid = 'PROJCS["wenzhou2000", GEOGCS["GCS_China_Geodetic_Coordinate_System_2000", DATUM["D_China_2000", SPHEROID["CGCS2000", 6378137.0, 298.257222101]], PRIMEM["Greenwich", 0.0], UNIT["Degree", 0.0174532925199433]], PROJECTION["Gauss_Kruger"], PARAMETER["False_Easting", 500000.0], PARAMETER["False_Northing", 0.0], PARAMETER["Central_Meridian", 120.666666666667], PARAMETER["Scale_Factor", 1.0], PARAMETER["Latitude_Of_Origin", 0.0], UNIT["Meter", 1.0]]';

                    if (tjParam.drawType) {
                        //点选
                        if (tjParam.drawType == "dxfw") {
                            queryJson.geometryType = "esriGeometryPolygon";
                            var bounds = this._geometry.getBounds();
                            var northEast = this._geometry.getBounds()._northEast;
                            northEast = map.options.crs.project(northEast);//将经纬坐标转换为温州2000坐标
                            var southWest = this._geometry.getBounds()._southWest;
                           
                            southWest = map.options.crs.project(southWest);
                            queryJson.geometry = '{"spatialReference":{"wkid":null},"rings":[[[' + northEast.x+ ','+southWest.y+'],' +
                                '[' + northEast.x + ',' + northEast.y + '],[' + southWest.x + ',' + northEast.y + '],' +
                            '[' + southWest.x + ',' + southWest.y + ']]]}';

                            //queryJson.geometry= '{"spatialReference":{"wkid":null},"rings":[[[511978.8124614804,3082451.4829386654],[511978.0152823652,3083255.1399848303],[513009.05137609865,3083256.2068547728],[513009.91717466706,3082452.549624147],[511978.8124614804,3082451.4829386654]]]}';
                        }
                        if (tjParam.drawType == "jx" || tjParam.drawType == "dbx") {
                            queryJson.geometryType = "esriGeometryPolygon";
                            queryJson.geometry = '{"spatialReference":{"wkid":null},"rings":[[';
                            var latLngs = this._geometry.getLatLngs();
                            for(var i  in latLngs){
                                var latLng = latLngs[i];
                                latLng = map.options.crs.project(latLng);
                                queryJson.geometry += '[' + latLng.x + ',' + latLng.y + '],';
                            }
                            queryJson.geometry.substr(1, queryJson.geometry.length-1);
                            queryJson.geometry +=']]}';
                        }
                        if (tjParam.drawType == "xxfw") {
                            queryJson.geometryType = "esriGeometryPolygon";
                            queryJson.geometry = '{"spatialReference":{"wkid":null},"rings":[[';

                            var latLngs = ResultsBuffers;
                            var len = latLngs.length;
                            for (var i = 0; i < len ; i++) {
                                queryJson.geometry += '[' + latLngs[i][0] + ',' + latLngs[i][1] + '],';
                            }
                            queryJson.geometry.substr(1, queryJson.geometry.length - 1);
                            queryJson.geometry += ']]}';
                            console.log(queryJson);
                        }
                    }
                    this.ajax.get(newUrl, queryJson, true, this, function (res) {
						//debugger;
						var objectIds=res.objectIds;
						totalPage= Math.ceil(objectIds.length / 1000);
						pageInfo = {
							objectIds: objectIds,
							totalRecords: objectIds.length,
							totalPages: Math.ceil(objectIds.length / 1000),
							currentPage: 0,
							recordsPerPage: 1000
						};
						Page=0;
						Psum=0;
						Pcount=0;
						var begin = pageInfo.recordsPerPage * (Page);
						var end = begin + pageInfo.recordsPerPage;
						var ids=pageInfo.objectIds.slice(begin, end);
						//queryTT2(featureLayer,arrayUtils,ids);
						_this.queryByIds(ids);
						/*
                        _this.showResult(res);
                        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                        map.deactivate();
                        //$("input[name='drawType']").prop('checked', false);
                        //$("#info").attr("disabled", "disabled");
                        var obj = $('.tjresult');
                        _this._loaded(obj);
						*/
                    }, function (err) {
                        L.dci.app.util.dialog.alert("提示", "服务查询出错");
                        //L.dci.app.util.hideLoading();
                        var obj = $('.tjresult');
                        _this._loaded(obj);
                    });
                }
            }
        },
		queryByIds:function(ids){
			var _this=this;
			//var query = new L.esri.Tasks.query(this._queryLayerUrl);
			//query.where("objectId in ("+ids+")");
			var tjParam=this._tjParam;
			var outStatistics = [{
				"statisticType": "sum",
				"onStatisticField": tjParam.statisticsField,
				"outStatisticFieldName": "sum"
			},
			{
				"statisticType": "count",
				"onStatisticField": "OBJECTID",
				"outStatisticFieldName": "count"
			}];
			var newUrl = this._queryLayerUrl + "/query";
			var outStatistics = [{
				"statisticType": "sum",
				"onStatisticField": tjParam.statisticsField,
				"outStatisticFieldName": "sum"
			},
			{
				"statisticType": "count",
				"onStatisticField": "OBJECTID",
				"outStatisticFieldName": "count"
			}];
			var outStatisticsStr = JSON.stringify(outStatistics);
			var queryJson = {
				where: "objectId in ("+ids+")",
				text: "",
				objectIds: "",
				time: "",
				geometry: "",
				geometryType: "",
				inSR: "",
				spatialRel: "",
				//spatialRel: "esriSpatialRelEnvelopeIntersects",
				relationParam: "",
				outFields: "*",
				returnGeometry: false,
				maxAllowableOffset: "",
				geometryPrecision: "",
				outSR: "",
				returnIdsOnly: false,
				returnCountOnly: false,
				orderByFields: "",
				//groupByFieldsForStatistics: tjParam.groupByField,
				groupByFieldsForStatistics: "",
				outStatistics: outStatisticsStr,
				returnZ: false,
				returnM: false,
				gdbVersion: "",
				returnDistinctValues: false,
				f: "pjson"
			};
			this.ajax.get(newUrl, queryJson, true, this, function (res) {
						//debugger;
						Psum+= res.features[0].attributes.SUM;
						Pcount+= res.features[0].attributes.COUNT;
						Page++;
						if(totalPage>Page){
							var begin = pageInfo.recordsPerPage * (Page);
							var end = begin + pageInfo.recordsPerPage;
						    var ids=pageInfo.objectIds.slice(begin, end);
							_this.queryByIds(ids);
						}
						else{
							 //alert("Psum="+Psum+",Pcount="+Pcount+",Page="+Page);
							 var content = '<table class="table table-bordered"><thead><tr>';
							 content += '<th>统计名称</th><th>个数</th><th>面积</th></tr>';
							 content += '<tr><td>'+ $("#layerSelect").find("option:selected").text()+'</td>';
							 content += '<td>'+Pcount+'</td>';
							 content += '<td>'+Psum+'</td>';
							 content += '</tr>';
							 content += '</table>';
							 $("#tjresult").append(content);
							 $("input[name='drawType']").removeAttr("checked");
							 var obj = $('.tjresult');
							_this._loaded(obj);
						}
						
						/*
                        _this.showResult(res);
                        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                        map.deactivate();
                        //$("input[name='drawType']").prop('checked', false);
                        //$("#info").attr("disabled", "disabled");
                        var obj = $('.tjresult');
                        _this._loaded(obj);
						*/
                    }, function (err) {
                        L.dci.app.util.dialog.alert("提示", "服务查询出错");
                        //L.dci.app.util.hideLoading();
                        var obj = $('.tjresult');
                        _this._loaded(obj);
                    });
			
		},
		queryByLx:function(newUrl, queryJson,featureName){
			var _this=this;
			 this.ajax.get(newUrl, queryJson, true, this, function (res) {
				_this._count--;
				
				if (res.features.length>0){
					res.featureName=featureName;
					_this._results.push(res);
				}
				if (_this._count == 0) {
					var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
					map.deactivate();
					//$("input[name='drawType']").prop('checked', false);
					//$("#info").attr("disabled", "disabled");
					_this.showResult_lx();
					var obj = $('.tjresult');
					_this._loaded(obj);
				}
			 }, function (err) {
				L.dci.app.util.dialog.alert("提示", "服务查询出错");
				//L.dci.app.util.hideLoading();
				var obj = $('.tjresult');
				_this._loaded(obj);
			});
		},
        showResult: function (res) {
            var fields=res.fields;
           
            var content = '<table class="table table-bordered"><thead><tr>';
            for (var i in fields) {
                var value = fields[i].alias;
                if (value.toLowerCase() == "count") {
                    content += '<th>个数</th>';
                }
                else if (value.toLowerCase() == "sum") {
                    content += '<th>统计值</th>';
                }
                else if (value.toLowerCase() == "type") {
                    content += '<th>分类</th>';
                }
                else{
                    content += '<th>'+value+'</th>';
                }
            }
            content += '</tr>';
            var features = res.features;
            for(var j in features){
                var feature = features[j];
                content += '<tr>';
                for (var k in fields) {
                    var fieldValue=feature.attributes[fields[k].name]
                    if (this.isNumber(fieldValue)) {
                        content += '<td>' + Math.round(fieldValue * 100) / 100 + '</td>';
                    }
                    else {
                        content += '<td>' + fieldValue + '</td>';
                    }
                }
                content += '</tr>';
            }
            content += '</table>';
            $("#tjresult").append(content);
			$("input[name='drawType']").removeAttr("checked");
        },
        showResult_lx: function () {
            var results = this._results;
            var resultsLayerName = this._resultsLayerName;
            var content = '<table class="table table-bordered"><thead><tr>';
            content += '<th>市政设施类型</th><th>个数</th><th>面积（㎡）</th><th>长度（m）</th>';
            content += '</tr>';
            for (var j in results) {
				var result=results[j];
				var count=0,area=0,length=0;
				for(var k in result.features){
					count=result.features.length;
					if(result.geometryType=="esriGeometryPolygon"){
						area+=result.features[k].attributes["SHAPE.AREA"];
					}
					else if(result.geometryType=="esriGeometryPolyline"){
						length+=result.features[k].attributes["SHAPE.LEN"];
					}
				}
                content += '<tr>';
                content += '<td>' + result.featureName + '</td>';
                content += '<td>' + count + '</td>';
				content += '<td>' + area.toFixed(2) + '</td>';
				content += '<td>' + length.toFixed(2) + '</td>';
                content += '</tr>';
            }
            content += '</table>';
            $("#tjresult").append(content);
			$("input[name='drawType']").removeAttr("checked");
        },
        isNumber:function(value) {         //验证是否为数字
            var patrn = /^(-)?\d+(\.\d+)?$/;

            if (patrn.exec(value) == null || value == "") {
                return false
            } else {
                return true
            }
        },

        _loading: function (obj) {
            if (obj.find('.loadingblock').length != 0) {
                obj.find('.loadingblock').show();
            }else{
                var html = '<div class="loadingblock"><div class="loadingFlash"><span class="icon-loading"></span></div></div>'
                obj.prepend(html)
                obj.find('.loadingblock').show();
            }
            
        },
        _loaded:function(obj){
            obj.find('.loadingblock').hide();
        },

        _alReset: function () {
            //选址前清空上一次选址结果
            this._results=[];
            this._resultsLayerName = [];
            this._tolance = null;
            this._drawType= null;
            this._count = null;
            $("#tjresult").empty();
			 //$("input[name='drawType']").removeAttr("checked");
			 var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
			 $(".option-content").hide();
            //map.clearHLLayer("buffdk");
            //map.clearHLLayer("dkloc");
            //map.clearHLLayer("auxiXzqh");
            //map.clearHLLayer("auxiliaryloc");
        }

       

    });
    return L.DCI.FacilitiesStatistics;
});


function  queryTT2(featureLayer,arrayUtils,ids){
	debugger;
	   	var queryParams = new esri.tasks.Query();
					queryParams.where ="objectId in ("+ids+")";
					var statDef = new esri.tasks.StatisticDefinition();
					  statDef.statisticType = "SUM";
					  statDef.onStatisticField = "GREENAREA";//统计字段
					  statDef.outStatisticFieldName = "SUM";//自己取名字
					  queryParams.outFields = ["*"];
					  var statDef1 = new esri.tasks.StatisticDefinition();
					  statDef1.statisticType = "COUNT";
					  statDef1.onStatisticField = "GREENAREA";//统计字段
					  statDef1.outStatisticFieldName = "COUNT";//自己取名字
					  queryParams.outFields = ["*"];
					  queryParams.outStatistics = [statDef,statDef1];
					  queryParams.groupByFieldsForStatistics = ["SECONDTYPE"];//分组字段
					  featureLayer.queryFeatures(queryParams, function (featureSet) {
						var data = arrayUtils.map(featureSet.features, function (entry, i) {
						Psum+= entry.attributes.SUM;
						Pcount+= entry.attributes.COUNT;
						Page++;
						if(totalPage>Page){
							var begin = pageInfo.recordsPerPage * (Page);
							var end = begin + pageInfo.recordsPerPage;
						    var ids=pageInfo.objectIds.slice(begin, end);
							queryTT2(featureLayer,arrayUtils,ids,totalPage);
						}
						else{
							 alert("Psum="+Psum+",Pcount="+Pcount+",Page="+Page);
						}
					 });
					});
}