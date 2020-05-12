/*
类名：属性查询类
说明：
*/
define("query/propertyquery", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "query/resultpanel"
], function (L) {
    L.DCI.PropertyQuery = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "propertyQuery",
        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map: null,
        /**
        *结果显示面板
        *@property _queryResult
        *@type {Object}
        *@private
        */
        _queryResult: null,
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
        _clsName: '属性查询',
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
        
        _featureLayer:null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (map) {
            this._map = map;
           
        },
        
        /**
        *开始查询
        *@method startQuery
        */
        startQuery: function () {
            var _this = this;
            var ztQuery = false;
            this._results = [];
            var queryStr = "1=1";
            var DEPTNAME1, DEPTNAME2, DEPTNAME3, OBJCODE, TYPE, CONTENT, XMID, GGSSUSER, NOTE, ADDRESS, dmdzInput;
            //专题查询
            if ($(".dmdzContent").is(":hidden")) {
                ztQuery = true;
                var layers = _this._map.getLayers();
                var hasQueryLayer = false;
                for(var i in layers){
                    var layer = layers[i];
                    if (layer.options && layer.options.id != "baseLayer"
                        && layer.options.id != null
                        && (layer.options.name == undefined ||
                        (layer.options.name && layer.options.name.indexOf("影像图") == -1))) {
                        hasQueryLayer = true;
                    }
                }
                if (!hasQueryLayer) {
                    L.dci.app.util.dialog.alert("提示", "请选择查询图层");
                    return;
                }
                if ($("#ztcxMore").hasClass("active")) {
                    DEPTNAME1 = $.trim($("#DEPTNAME1").val());
                    DEPTNAME2 = $.trim($("#DEPTNAME2").val());
                    DEPTNAME3 = $.trim($("#DEPTNAME3").val());
                    OBJCODE = $.trim($("#OBJCODE").val());
                    TYPE = $.trim($("#TYPE").val());
                    CONTENT = $.trim($("#CONTENT").val());
                    XMID = $.trim($("#XMID").val());
                    GGSSUSER = $.trim($("#GGSSUSER").val());
                    NOTE = $.trim($("#NOTE").val());
                    ADDRESS = $.trim($("#ADDRESS").val());
                    if (DEPTNAME1 == "" && DEPTNAME2 == "" && DEPTNAME3 == "" && OBJCODE == "" && TYPE == "" && CONTENT == ""
                        && XMID == "" && GGSSUSER == "" && NOTE == "" && ADDRESS == "") {
                        L.dci.app.util.dialog.alert("提示", "请填写查询参数");
                        return;
                    }
                    if (DEPTNAME1 != "") {
                        queryStr += " and DEPTNAME1 like '%" + DEPTNAME1 + "%'";
                    }
                    if (DEPTNAME2 != "") {
                        queryStr += " and DEPTNAME2 like '%" + DEPTNAME2 + "%'";
                    }
                    if (DEPTNAME3 != "") {
                        queryStr += " and DEPTNAME3 like '%" + DEPTNAME3 + "%'";
                    }
                    if (OBJCODE != "") {
                        queryStr += " and OBJCODE  like '%" + OBJCODE + "%'";
                    }
                    if (TYPE != "") {
                        queryStr += " and TYPE  like '%" + TYPE + "%'";
                    }
                    if (CONTENT != "") {
                        queryStr += " and CONTENT   like '%" + CONTENT + "%'";
                    }
                    if (XMID != "") {
                        queryStr += " and XMID  like '%" + XMID + "%'";
                    }
                    if (GGSSUSER != "") {
                        queryStr += " and GGSSUSER  like '%" + GGSSUSER + "%'";
                    }
                    if (NOTE != "") {
                        queryStr += " and NOTE  like '%" + NOTE + "%'";
                    }
                    if (ADDRESS != "") {
                        queryStr += " and ADDRESS  like '%" + ADDRESS + "%'";
                    }
                }
                else {
                    var ZTGJZ = $.trim($("#ZTGJZ").val());
                    if (ZTGJZ == "") {
                        L.dci.app.util.dialog.alert("提示", "请填写查询参数");
                        return;
                    }
                    else {
                        var queryStrTemp = "DEPTNAME1 like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or DEPTNAME2 like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or DEPTNAME3 like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or OBJCODE  like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or TYPE  like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or CONTENT   like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or XMID  like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or GGSSUSER  like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or NOTE  like '%" + ZTGJZ + "%'";
                        queryStrTemp += " or ADDRESS  like '%" + ZTGJZ + "%'";
                        queryStr = queryStrTemp;
                    }
                }
            }
            else {
                dmdzInput = $.trim($("#dmdzInput").val());
                if (dmdzInput == "") {
                    L.dci.app.util.dialog.alert("提示", "请填写查询参数");
                    return;
                }
                else {
                    queryStr += " and ADDRESS like '%" + dmdzInput + "%'";
                }
            }
            //弹出面板
            if (this._queryResult == null)
                this._queryResult = new L.DCI.QueryResult();
            
            //显示加载动画
            var obj = $('.result-list-group-loadflash');
            L.dci.app.util.showLoadFlash(obj);
            var query = null;
           
            if (ztQuery) {
                _this._queryResult.showTo('专题查询');
                var map = this._map.getMap();
                this._count = this._map.getLayers().length;
                var _this = this;
                map.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != "baseLayer"
                        && layer.options.id != null
                        && (layer.options.name == undefined ||
                        (layer.options.name && layer.options.name.indexOf("影像图") == -1))) {
                        if (layer.options.opacity && layer.options.opacity != 0) {
                            if (layer.options.layers) {
                                for (var i in layer.options.layers) {
                                    var query = new L.esri.Tasks.query(layer.options.proxyUrl + "/" + layer.options.layers[i]);
                                    query.where(queryStr);
                                    query.run(function (error, featureCollection, response) {
                                        //这里有两种情况：一个多边形和多个多边形
                                        _this._count--;
                                        var features=[];
                                    	for(var i in response.features){
                                    		var feature=response.features[i];
                                    		var attributes={};
                                    		for(var j in response.fields){
                                    			var field=response.fields[j];
                                    			attributes[field.alias]=feature.attributes[field.name];
                                    		}
                                    		newFeature={
                                    			"attributes":attributes,
                                    			"geometry":feature.geometry,
                                    			"displayFieldName":response.displayFieldName,
                                    			"geometryType":response.geometryType,
                                    			"layerName": feature.attributes["TYPE"],
                                    			"value":feature.attributes[response.displayFieldName]
                                    		}
                                    		features.push(newFeature);
                                    			
                                    		//var geo = L.dci.app.util.highLight(_this._map, newFeature, true, false);
                                            //_this._feature.push(geo);
                                    	}
                                    	_this._results = _this._results.concat(features);
                                    	if (_this._count == 0)
                                    		_this._showResult();

                                    	
                                    });
                                }
                            } 

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
                }, this);
            }
            else {
                _this._queryResult.showTo('地名地址');
                var query = new L.esri.Tasks.query(Project_ParamConfig.dmdzLayers + "/0");
               
                query.where(queryStr);
                query.run(function (error, featureCollection, response) {
                   
                    var features = [];
                    for (var i in response.features) {
                        var feature = response.features[i];
                        var attributes = {};
                        for (var j in response.fields) {
                            var field = response.fields[j];
                            attributes[field.alias] = feature.attributes[field.name];
                        }
                        newFeature = {
                            "attributes": attributes,
                            "geometry": feature.geometry,
                            "displayFieldName": response.displayFieldName,
                            "geometryType": response.geometryType,
                            "layerName": "地名地址",
                            "value": feature.attributes[response.displayFieldName]
                        }
                        features.push(newFeature);
                        var geo = L.dci.app.util.highLight(_this._map, newFeature, true, false);
                        _this._feature.push(geo);
                    }
                    
                    _this._queryResult.load(features);

                   

                    //隐藏加载动画
                    var obj = $('.result-list-group-loadflash');
                    L.dci.app.util.hideLoadFlash(obj);
                    _this._queryResult._showType = "";
                });
            }
           
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
                L.dci.app.util.dialog.error("错误提示", e);
            }
        }

    });
    return L.DCI.ProjectQuery;
});