/*
类名：项目查看类
说明：
*/
define("query/projectquery", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "query/resultpanel"
], function (L) {
    L.DCI.ProjectQuery = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "projectQuery",
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
        _clsName: '项目查询',
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
        addProjectLayer: function () {
            var _this = this;
            var map = this._map.map;
            var featureArr = [];
            //this._featureLayer = L.esri.featureLayer(Project_ParamConfig.projectLayer[0].featureUrl).addTo(map);
			this._featureLayer = L.esri.featureLayer(Project_ParamConfig.projectLayer[0].featureUrl,
			{ 
				simplifyFactor: 0.5, 
				precision: 5, 
				style: function (feature) { 
					if(feature.properties["STATUS"] == 0){
						return {color: 'red', weight: 2 }; 
					} 
					else if(feature.properties["STATUS"] == 1){ 
						return { color: 'green', weight: 2 }; 
					} 
					else if(feature.properties["STATUS"] == 3){ 
						return { color: 'blue', weight: 2 }; 
					} 
					else { 
						return { color: 'white', weight: 2 }; 
					} 
				} 
			}).addTo(map);
            this._featureLayer.on("click", function (res) {
				var options = {
					opacity: 1,
					layers: [0]
                };
				 var layer = L.esri.dynamicMapLayer(Project_ParamConfig.projectLayer[0].url, options);
				  var identify = layer.identify()
                                .on(map)
                                .at(res.latlng)
                                .tolerance(4);
				identify.run(function (error, featureCollection, response) {
					
					if (response && response.results){
						if (_this._queryResult == null){
							_this._queryResult = new L.DCI.QueryResult();
							_this._queryResult.showTo('项目查询');
							//显示加载动画
							var obj = $('.result-list-group-loadflash');
							L.dci.app.util.showLoadFlash(obj);
							_this._queryResult._showType = "project";
							_this._queryResult.load(response.results);
							//隐藏加载动画
							var obj = $('.result-list-group-loadflash');
							L.dci.app.util.hideLoadFlash(obj);
							_this._queryResult._showType = "";
						}
					}
						
					
				}, this);
				/*
                var query = new L.esri.Tasks.query(Project_ParamConfig.projectLayer[0].url);
                query.nearby(res.latlng);
                query.run(function (error, featureCollection, response) {
                    //这里有两种情况：一个多边形和多个多边形
                    if (response.features && response.features.length >0) {
                        //弹出面板
                        if (_this._queryResult == null)
                            _this._queryResult = new L.DCI.QueryResult();
                        _this._queryResult.showTo('项目查询');
                        //显示加载动画
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.showLoadFlash(obj);
                        _this._queryResult._showType = "project";
                        _this._queryResult.load(response.features);
                        //隐藏加载动画
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.hideLoadFlash(obj);
                        _this._queryResult._showType = "";
                    }
                 });
				 */
            });
            
        },
        /**
        *开始查询
        *@method startQuery
        */
        startQuery: function () {
            var _this = this;
            var queryParam = $.trim($("#projectName").val());
			var projectJssj1 = $.trim($("#projectJssj1").val());
			var projectJssj2 = $.trim($("#projectJssj2").val());
            if (queryParam=="" && projectJssj1=="" && projectJssj2=="") {
                L.dci.app.util.dialog.alert("提示", "请填写查询参数");
                return;
            }
            //弹出面板
            if (this._queryResult == null)
                this._queryResult = new L.DCI.QueryResult();
            this._queryResult.showTo('项目查询');
            //显示加载动画
            var obj = $('.result-list-group-loadflash');
            L.dci.app.util.showLoadFlash(obj);
            var query = new L.esri.Tasks.query(Project_ParamConfig.projectLayer[0].url+"/0");
			var queryStr="1=1";
			if(queryParam!=""){
				queryStr+=" and GGSSMIS.V_BS_JSXMYHXM.XMMC like '%" + queryParam + "%'";
			}
			if(projectJssj1!=""){
				queryStr+=" and GGSSMIS.V_BS_JSXMYHXM.JSSJ >= date '"+projectJssj1+"'"; 
			}
			if(projectJssj2!=""){
				queryStr+=" and GGSSMIS.V_BS_JSXMYHXM.JSSJ <= date '"+projectJssj2+"'"; 
			}
            query.where(queryStr);
            query.run(function (error, featureCollection, response) {
                //这里有两种情况：一个多边形和多个多边形
                //if (response.features && response.features.length>0) {
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
							"layerName":"项目范围",
							"value":feature.attributes[response.displayFieldName]
						}
						features.push(newFeature);
						var geo = L.dci.app.util.highLight(_this._map, newFeature, true, false);
                        _this._feature.push(geo);
					}
                    _this._queryResult._showType = "project";
                    _this._queryResult.load(features);
                    
                //}
				
				//隐藏加载动画
                var obj = $('.result-list-group-loadflash');
                L.dci.app.util.hideLoadFlash(obj);
                _this._queryResult._showType = "";
            });
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
            //this._results = [];
        }

    });
    return L.DCI.ProjectQuery;
});