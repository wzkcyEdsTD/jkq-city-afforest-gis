/**
*绿地变化分析模块类
*@module modules.analysis
*@class DCI.GreenSpaceAnalysis
*@constructor initialize
*@extends Class
*/

var ResultsBuffers = []

define("analysis/greenSpaceAnalysis", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "analysis/gpHandler"
   
    
], function (L) {
    L.DCI.GreenSpaceAnalysis = L.Class.extend({

        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'greenSpaceAnalysis',
        /**
         *地图对象
         *@property _map
         *@type {Object}
         *@private
         */
        _map: null,
		_featureISend:1,
        _featureLayer: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (map) {
            this._map = map;
            
        },
        /**
        *开始分析
        *@method startAnalyze
        */
        startAnalyze: function () {
			this._featureISend=0;
            var _this = this;
            var map = this._map.map;
            var featureArr = [];

            //var ldmBgsj1 = "2014/1/1";
            var queryStr = "1=1";
            var ldmBgsj1 = $.trim($("#ldmBgsj1").val());
            var ldmBgsj2 = $.trim($("#ldmBgsj2").val());
            //////////////////
            $("body").append("<div id='layerDiv' style='width:100%;height:100%;position: fixed;top: 0;left: 0;background: #000;opacity: .5;z-index:2000'>"+
                                "<p style='text-align: center;line-height: "+$(window).height()+"px;color: #fff;font-size: 18px;'>分析中...</p></div>")

            //绿都分析
            GreenChangeArea(ldmBgsj1,ldmBgsj2);
            if (ldmBgsj1!="") {
                queryStr += " and CHDATE >= date '" + ldmBgsj1 + "'";
            }
            if (ldmBgsj2 != "") {
                queryStr += " and CHDATE <= date '" + ldmBgsj2 + "'";
            }
            if (this._featureLayer != null) {
                this._map.map.removeLayer(this._featureLayer);
                this._featureLayer = null;
            }
            this._featureLayer = L.esri.featureLayer(Project_ParamConfig.ldbhfxLayers + "/0",
            {
                simplifyFactor: 0.5,
                precision: 5,
                style: function (feature) {
                    if (feature.properties["UPDATESTATE"] == "A") {
                        return { color: 'red', weight: 5 };
                    }
                    else if (feature.properties["UPDATESTATE"] == "D") {
                        return { color: 'green', weight: 5 };
                    }
                    else if (feature.properties["UPDATESTATE"] == "U") {
                        return { color: 'blue', weight: 5 };
                    }
                    else {
                        return { color: 'white', weight: 5 };
                    }
                },
                where: queryStr
            }).addTo(this._map.map);
         
            
			this._featureLayer.on("load", function() {
				_this._featureISend=1;
                $("#layerDiv").remove();
			});
            this._featureLayer.on("click", function (res) {
                var options = {
                    opacity: 1,
                    layers: [0]
                };
                var layer = L.esri.dynamicMapLayer(Project_ParamConfig.ldbhfxLayers, options);
                var identify = layer.identify()
                              .on(map)
                              .at(res.latlng)
                              .tolerance(4);
                identify.run(function (error, featureCollection, response) {

                    if (response && response.results) {
                        if (_this._queryResult == null) {
                            _this._queryResult = new L.DCI.QueryResult();

                        }
                        _this._queryResult.showTo('绿地面');
                        //显示加载动画
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.showLoadFlash(obj);
                        _this._queryResult.load(response.results);
                        //隐藏加载动画
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.hideLoadFlash(obj);
                    }
                }, this);

            });
        },
        /**
        *清除结果
        *@method clear
        */
        clear: function () {
            this._map.getHighLightLayer().clearLayers();
            if (this._featureLayer!=null) {
			if(this._featureISend==1){
                this._map.map.removeLayer(this._featureLayer);
				}
                //this._featureLayer=null;
            }
            //this._results = [];
        }
    });
    return L.DCI.GreenSpaceAnalysis;
});
function GreenChangeArea(ldmBgsj1,ldmBgsj2)
{
    var url = Project_ParamConfig.getGreenChangeArea;
    $("#GreenChangeArea").remove();
    $.ajax({
        type: 'POST',
        url: url,
        data: { 'sjstart': ldmBgsj1, 'sjend': ldmBgsj2},
        dataType: 'json',
        success: function (data) { 
            if(data=="")
            {
                $("#ldxz").text("0㎡");
                $("#ldbg").text("0㎡");
                $("#ldsc").text("0㎡");
            }else
            {
                $("#ldxz").text(Number(data[0].greenarea).toFixed(2)+"㎡");
                $("#ldbg").text(Number(data[2].greenarea).toFixed(2)+"㎡");
                $("#ldsc").text(Number(data[1].greenarea).toFixed(2)+"㎡");
            }
            
        }
    });
}