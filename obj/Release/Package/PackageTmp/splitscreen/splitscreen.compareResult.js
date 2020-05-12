/**
*成果对比类
*@module splitScreen
*@class DCI.SplitScreen.CompareResult
*@constructor initialize
*/
define("splitscreen/compareResult", [
    "leaflet",
    "leaflet/esri"
], function (L) {

    L.DCI.SplitScreen.CompareResult = L.Class.extend({
        /**
        *分屏地图类对象
        *@method map
        */
        map: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.map = L.dci.app.pool.get('SplitScreen');
            if(localStorage.splitScreenDefLayerData != null || localStorage.splitScreenDefLayerData != undefined)
                this.data = JSON.parse(localStorage.splitScreenDefLayerData);

            //取消默认的事件
            $("#leftpanel").off('click', 'li:not(".active")');
            $("#centerpanel").off('click', 'span.closeScreen');
            //重新绑定事件
            $("#leftpanel").on('click', 'li:not(".active")', { context: this }, function (e) { e.data.context.open(e); });
            $("#centerpanel").on('click', 'span.closeScreen', { context: this }, function (e) { e.data.context.closeScreen(e); });

            var num = this.map.initData.splitNum;
            var eles = $("#leftpanel").find("li");
            for (var i = 0; i < eles.length; i++)
            {
                if (i < num)
                {
                    $(eles[i]).click();
                }
            }
            var selectedObj = this.data.selectedObj;
            var geo = this.map.unproject(this.map.mapOne, selectedObj, selectedObj.geometry.type);
            this.latlng = geo.getBounds().getCenter();
        },
        /**
        *打开菜单
        *@method open
        */
        open: function (e) {
            var containerObj = $("#centerpanel");
            var eles = containerObj.find("div.leaflet-container");
            if (this.map.splitNum >= 4) return;
            var ele = e.currentTarget;
            $(ele).addClass("active");
            this.map.splitNum += 1;
            this.map.split(this.map.splitNum);
            var name = $(ele).children("span:last-child").html();
            var index = $(e.currentTarget).index();
            var id = "";
            var mapObj = null;
            var html = '<span class="mapToolName">' + name + '</span>';
            switch (this.map.splitNum)
            {
                case 1:
                    $(eles[0]).children(".mapTool").children("div").html(html);
                    id = $(eles[0]).attr("id");
                    mapObj = this.map.getMapById(id);
                    break;
                case 2:
                    $(eles[1]).children(".mapTool").children("div").html(html);
                    id = $(eles[1]).attr("id");
                    mapObj = this.map.getMapById(id);
                    break;
                case 3:
                    $(eles[2]).children(".mapTool").children("div").html(html);
                    id = $(eles[2]).attr("id");
                    mapObj = this.map.getMapById(id);
                    break;
                case 4:
                    $(eles[3]).children(".mapTool").children("div").html(html);
                    id = $(eles[3]).attr("id");
                    mapObj = this.map.getMapById(id);
                    break;
                default:
                    break;
            }

            var datas = this.data.datas;
            var _this = this;
            var myVar = setInterval(function () {
                _this.DefLayer(datas[index], mapObj);
                clearInterval(myVar);
            }, 1000);


            var myVar2 = setInterval(function () {
                _this.setSyncView(_this.latlng);
                clearInterval(myVar2);
            }, 2000);
        },
        /**
        *关闭具体分屏
        *@method closeScreen
        */
        closeScreen: function (e) {
            var containerId = $(e.currentTarget).parents(".leaflet-container").attr("id");
            var mapToolName = $(e.currentTarget).siblings().children(".mapToolName").html();
            this.map.cancelSelected(mapToolName);
            this.map.splitNum -= 1;
            switch (containerId)
            {
                case 'mapone':
                    $("#mapone>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#mapone"));
                    this.recoverMap(this.map.mapOne);
                    break;
                case 'maptwo':
                    $("#maptwo>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#maptwo"));
                    this.recoverMap(this.map.mapTwo);
                    break;
                case 'mapthree':
                    $("#mapthree>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#mapthree"));
                    this.recoverMap(this.map.mapThree);
                    break;
                case 'mapfour':
                    $("#mapfour>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#mapfour"));
                    this.recoverMap(this.map.mapFour);
                    break;
                default:
                    break;
            }
            this.map.split(this.map.splitNum);
        },
        /**
      * 恢复初始化的地图
      *@method recoverMap
      *@param mapObj{Object} 地图对象
      */
        recoverMap: function (mapObj) {
            mapObj.eachLayer(function (layer) {
                if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer")
                {
                    var num = layer.options.id.indexOf("默认");
                    if (num <= -1)
                        mapObj.removeLayer(layer);

                    var num2 = layer.options.id.indexOf("编制一张图的");
                    if (num2 >= 0)
                        layer.setOpacity(0);
                }
            }, this);
        },

        /**
        *同步设置分屏地图显示的中心点及地图级别
        *@method setSyncView
        *@param latlng{Object} 中心点
        */
        setSyncView: function (latlng) {
            var id1 = $("#centerpanel>div:eq(0)").attr("id");
            var id2 = $("#centerpanel>div:eq(1)").attr("id");
            var id3 = $("#centerpanel>div:eq(2)").attr("id");
            var id4 = $("#centerpanel>div:eq(3)").attr("id");
            var mapObj1 = this.map.getMapById(id1);
            var mapObj2 = this.map.getMapById(id2);
            var mapObj3 = this.map.getMapById(id3);
            var mapObj4 = this.map.getMapById(id4);
            switch (this.map.splitNum)
            {
                case 1:
                    var zoom1 = Math.round(mapObj1.getMaxZoom() / 4);
                    mapObj1.setView(latlng, zoom1);
                    break;
                case 2:
                    var zoom1 = Math.round(mapObj1.getMaxZoom() / 4);
                    mapObj1.setView(latlng, zoom1);
                    var zoom2 = Math.round(mapObj2.getMaxZoom() / 4);
                    mapObj2.setView(latlng, zoom2);
                    break;
                case 3:
                    var zoom1 = Math.round(mapObj1.getMaxZoom() / 4);
                    mapObj1.setView(latlng, zoom1);
                    var zoom2 = Math.round(mapObj2.getMaxZoom() / 4);
                    mapObj2.setView(latlng, zoom2);
                    var zoom3 = Math.round(mapObj3.getMaxZoom() / 4);
                    mapObj3.setView(latlng, zoom3);
                    break;
                case 4:
                    var zoom1 = Math.round(mapObj1.getMaxZoom() / 4);
                    mapObj1.setView(latlng, zoom1);
                    var zoom2 = Math.round(mapObj2.getMaxZoom() / 4);
                    mapObj2.setView(latlng, zoom2);
                    var zoom3 = Math.round(mapObj3.getMaxZoom() / 4);
                    mapObj3.setView(latlng, zoom3);
                    var zoom4 = Math.round(mapObj4.getMaxZoom() / 4);
                    mapObj4.setView(latlng, zoom4);
                    break;
                default:
                    break;
            }
        },

        /**
        *筛选显示地图要素(编制业务)
        *@method DefLayer
        *@private
        */
        DefLayer: function (objData, mapObj) {
            var data = Project_ParamConfig.bzOneMapConfig.detailConfig;

            //通过后台服务获取到的编制项目数据，可配变量如以下：
            var AREA = objData.AREA;
            var CASE_ID = objData.CASE_ID;
            var COMMENTS = objData.COMMENTS;
            var ENDTIME = objData.ENDTIME;
            var OBJECTID = objData.OBJECTID;
            var PASSDATE = objData.PASSDATE;
            var PLANDATE = objData.PLANDATE;
            var PLANNAME = objData.PLANNAME;
            var PLANSEQ = objData.PLANSEQ;
            var PLANTYPE = objData.PLANTYPE;
            var PLANUNIT = objData.PLANUNIT;
            var REMARK = objData.REMARK;
            var STARTTIME = objData.STARTTIME;

            for (var i = 0; i < data.length; i++)
            {
                var url = data[i].url;
                var defLayer = data[i].defLayer;
                mapObj.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer")
                    {
                        var num = layer.options.id.indexOf("编制一张图的");
                        var urlResult = layer.url.indexOf(url);
                        if (num >= 0 && urlResult >= 0)
                        {
                            var deflayer = JSON.stringify(defLayer);
                            deflayer = deflayer.replace(/th_AREA/g, AREA);
                            deflayer = deflayer.replace(/th_CASE_ID/g, CASE_ID);
                            deflayer = deflayer.replace(/th_ENDTIME/g, ENDTIME);
                            deflayer = deflayer.replace(/th_OBJECTID/g, OBJECTID);
                            deflayer = deflayer.replace(/th_PASSDATE/g, PASSDATE);
                            deflayer = deflayer.replace(/th_PLANDATE/g, PLANDATE);
                            deflayer = deflayer.replace(/th_PLANNAME/g, PLANNAME);
                            deflayer = deflayer.replace(/th_PLANSEQ/g, PLANSEQ);
                            deflayer = deflayer.replace(/th_PLANTYPE/g, PLANTYPE);
                            deflayer = deflayer.replace(/th_PLANUNIT/g, PLANUNIT);
                            deflayer = deflayer.replace(/th_REMARK/g, REMARK);
                            deflayer = deflayer.replace(/th_STARTTIME/g, STARTTIME);
                            deflayer = JSON.parse(deflayer);
                            var layerDefs = deflayer;
                            layer.setLayerDefs(layerDefs);
                            layer.setOpacity(1);
                        }
                    }
                }, this);
            }

        },
    });
    return L.DCI.SplitScreen.CompareResult;
});