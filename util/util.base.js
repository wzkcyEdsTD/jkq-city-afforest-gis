/**
*工具类
*@module util
*@class DCI.Util
*@constructor initialize
*/
define("util/base", [
    "leaflet",
    "core/dcins",
    "util/dialog",
    "util/log",
    "util/user",
    "util/tool",
    "util/locate",
    "plugins/cookie"
], function (L) {
    L.DCI.Util = L.Class.extend({
        /**
        *对话框
        *@property dialog
        *@type {Object}
        */
        dialog: null,
        /**
        *日志
        *@property log
        *@type {Object}
        */
        log: null,
        /**
        *用户
        *@property user
        *@type {Object}
        */
        user: null,

        /**
        *全局工具类
        *@property tool
        *@type {Object}
        */
        tool: null,

        /**
        *查询定位类
        *@property tool
        *@type {Object}
        */
        locate: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.dialog = new L.DCI.Dialog();
            this.user = new L.DCI.User();
            this.log = new L.DCI.Log();
            this.tool = new L.DCI.UtilTool();
            this.locate = new L.DCI.Locate();
        },


        /**
        *移除数组中指定值
        *@method arrayRemove
        *@param arr {Array} 目标数组
        *@param val {value} 要删除的值
        *@return {Object} 返回已经过滤的数组
        */
        arrayRemove: function (arr,val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val)
                    arr.splice(i, 1);
            }
        },

        /**
        *过滤掉不显示字段，返回新的数组
        *@method queryFilter
        *@param data {Array} 需要过滤的数组
        *@return {Object} 返回已经过滤的数组
        */
        queryFilter: function (data) {
            var res = [];
            for (var att in data) {
                if (!this.isContain(att)) {
                    res.push({ name: att, value: data[att] });
                }
            }
            return res;
        },
        /**
        *判断是否是不显示的字段
        *@method isContain
        *@param att {Array} 需要判断的数组
        *@return {Bool} 返回标识是否存在不显示字段的bool值
        */
        isContain: function (att) {
            var filter = ["objectid", "shape", "shape.len", "shape.area", "kfqszsde.ggss_range.objectid"];
            for (var i = 0; i < filter.length; i++) {
                if (att.toLowerCase() == filter[i])
                    return true;
            }
            return false;
        },
        /**
        *判断是否Null,如果是则为空值
        *@method isNull
        *@param value {String} 需要判断的值
        *@return {Bool} 是否==Null的bool值
        */
        isNull: function (value) {
			if($.isNumeric(value)){
				return value;
			}
			else{
				var filter = "null";
				if (value==null||value.toLowerCase() == filter)
					return " ";
				else
					return value;
			}
        },
		isNumber:function(value) {         //验证是否为数字
            var patrn = /^(-)?\d+(\.\d+)?$/;

            if (patrn.exec(value) == null || value == "") {
                return false
            } else {
                return true
            }
        },
        /**
        *坐标转化
        *@method unproject
        *@param map {Object} 高亮要素map
        *@param feature {Object} 要素
        *@param geoType {String} 要素的类型
        *@return {Object} 返回坐标转化后的要素
        */
        unproject: function (map, feature, geoType) {
            if (map == null) {
                throw "unproject:map对象不能为空";
            }
            if (feature == null) {
                throw "unproject:feature不能为空";
            }
            var type = geoType != null ? geoType : feature.geometryType;
            if (type == null) {
                throw "unproject:geometry类型不能为空";
            }
            try {
                var pnts = [], geo = null;
                var _map = map.getMap();
                switch (type) {
                    case "esriGeometryPolygon"://面
                    case "Polygon":
                        var paths = feature.geometry.rings == null ? feature.geometry.coordinates : feature.geometry.rings;
                        for (var i = 0; i < paths.length; i++) {
                            var pnts2 = [];
                            for (var j = 0; j < paths[i].length; j++) {
                                var pnt = _map.options.crs.projection.unproject(L.point(paths[i][j]));
                                pnts2.push([pnt.lat, pnt.lng]);
                            }
                            pnts.push(pnts2);
                        }
                        geo = L.polygon(pnts);
                        break;
                    case "esriGeometryPolyline"://线
                    case "Polyline":
                        var paths = feature.geometry.paths == null ? feature.geometry.coordinates : feature.geometry.paths;
                        if (paths.length > 1) {
                            for (var i = 0; i < paths.length; i++) {
                                var pnts2 = [];
                                for (var j = 0; j < paths[i].length; j++) {
                                    var pnt = _map.options.crs.projection.unproject(L.point(paths[i][j]));
                                    pnts2.push([pnt.lat, pnt.lng]);
                                }
                                pnts.push(pnts2);
                            }
                            geo = L.multiPolyline(pnts);
                        } else {
                            var paths2 = paths[0];
                            for (var i = 0; i < paths2.length; i++) {
                                var pnt = _map.options.crs.projection.unproject(L.point(paths2[i]));
                                pnts.push([pnt.lat, pnt.lng]);
                            }
                            geo = L.polyline(pnts);
                        }
                        break;
                    case "esriGeometryPoint"://点
                    case "Point":
                        var pnt = _map.options.crs.projection.unproject(L.point(feature.geometry.x, feature.geometry.y));
                        pnts.push([pnt.lat, pnt.lng]);
                        var latlng = L.latLng(pnts[0][0], pnts[0][1]);
                        geo = L.marker(latlng);
                        break;
                    case "MultiPolygon":
                        var coors = feature.geometry.coordinates;
                        for (var i = 0; i < coors.length; i++) {
                            for (var j = 0; j < coors[i].length; j++) {
                                var pnts2 = [];
                                for (var k = 0; k < coors[i][j].length; k++) {
                                    var pnt = _map.options.crs.projection.unproject(L.point(coors[i][j][k]));
                                    pnts2.push([pnt.lat, pnt.lng]);
                                }
                                pnts.push(pnts2);
                            }
                            geo = L.multiPolygon(pnts);
                        }
                        break;
                }
            } catch (e) {
                throw "unproject:" + e;
            }
            return geo;
        },
        /**
        *高亮要素
        *@method highLight
        *@param map {Object} 高亮要素map
        *@param feature {Object} 要素
        *@param isCrs {Bool} 是否根据当前map转化坐标
        *@param isZoomTo {Bool} 是否需要定位
        *@param geoType {String} 要素的类型
        *@return {Object} 返回高亮的要素
        */
        highLight: function (map, feature, isCrs, isZoomTo, geoType) {
            if (map == null) {
                throw "highLight:map对象不能为空";
            }
            if (feature == null) {
                throw "highLight:feature不能为空";
            }
            var hlLayer = map.getHighLightLayer();
            if (hlLayer == null) {
                throw "highLight:未在map中找到highlight layer";
            }
            var type = geoType == null ? feature.geometryType : geoType;
            if (type == null || type == "") {
                throw "unproject:geometry类型不能为空";
            }
            var geo = null;
            try {
                if (isCrs)//如果需要转化坐标
                    geo = this.unproject(map, feature, type);
                else
                    geo = feature;
                switch (type) {
                    case "esriGeometryPolygon"://面
                    case "Polygon":
                    case "MultiPolygon":
                        geo.setStyle(L.dci.app.symbol.highlightPolygonSymbol);
                        break;
                    case "esriGeometryPolyline"://线
                    case "Polyline":
                        geo.setStyle(L.dci.app.symbol.highlightPolylineSymbol);
                        break;
                    case "esriGeometryPoint"://点
                    case "Point":
                        geo.setIcon(L.dci.app.symbol.highlightPointSymbol.icon);
                        break;
                }
                hlLayer.addLayer(geo);
                if (isZoomTo) //定位
                    this.zoomTo(map, geo, false);
            } catch (e) {
                throw "高亮显示异常:" + e;
            }
            return geo;
        },
        /**
        *定位
        *@method zoomTo
        *@param map {String} 地图对象
        *@param feature {Object} 要素
        *@param isCrs {Bool} 是否根据当前map转化坐标
        *@return {Object} 返回定位的要素
        */
        zoomTo: function (map, feature, isCrs, geoType) {
            if (map == null) {
                throw "zoomTo:map对象不能为空";
            }
            if (feature == null) {
                throw "zoomTo:feature不能为空";
            }
            try {
                var geo = null, type = "";
                if (geoType != null)
                    type = geoType;
                else
                    type = feature.geometryType == null ? feature.toGeoJSON().geometry.type : feature.geometryType;
                if (type == null || type == "") {
                    throw "zoomTo:geometry类型不能为空";
                }
                var _map = map.getMap();
                var maxZoom = _map.getMaxZoom();
                if (isCrs)
                    geo = this.unproject(map, feature, type);
                else
                    geo = feature;
                switch (type) {
                    case "esriGeometryPolygon":
                    case "esriGeometryPolyline":
                    case "LineString":
                    case "PolygonString":
                    case "Polygon":
                    case "Line":
                        _map.fitBounds(geo.getBounds());
                        break;
                    case "esriGeometryPoint"://点
                    case "PointString"://点
                    case "Point"://点
                        if (maxZoom != null && maxZoom > 0)
                            _map.setView(geo, maxZoom / 2);
                        else
                            _map.panTo(geo);
                        break;
                }
            } catch (e) {
                throw "zoomTo:" + e;
            }
            return geo;
        },

        /**
        *有约束区域拖拽
        *@method _drag
        *@param _body {String} 待移动元素id
        *@param _pannel {String} 约束元素id
        *{_pannel}元素添加 data-drag="drag" data-panel = "_body className"可实现拖动
        */
        _drag: function (_body, _pannel) {
            var dragging = false;
            var iX, iY;
            var pannel = $('#' + _pannel);
            var body = $('#' + _body);
            var uKey = "drag_" + L.stamp(body);

            //pannel.css("cursor", "move");
            pannel.data("drag", "drag");
            pannel.data("panel", uKey);
            body.addClass(uKey);

            if (!this.initDrag)
            {
                this.initDrag = true;

                $(document).mousedown(function (e) {
                    body = null;
                    pannel = null;

                    pannel = $(e.target);
                    pannel = pannel.data("drag") ? pannel : pannel.parent();
                    if (pannel.data("drag") && pannel.data("drag") == "drag" && pannel.data("panel")) { } else { return; }
                    dragging = true;

                    body = pannel.closest('.' + pannel.data("panel"));
                    if (body.length == 0) return;

                    body = body[0];

                    iX = e.clientX;
                    iY = e.clientY;

                    var point = L.DomUtil.getPosition(body);
                    if (point)
                    {
                        iX = iX - point.x;
                        iY = iY - point.y;
                    }
                    //body.setCapture && body.setCapture();
                    return false;
                });

                $(document).mousemove(function (e) {
                    if (dragging && body)
                    {
                        var e = e || window.event;
                        var oX = e.clientX - iX;
                        var oY = e.clientY - iY;

                        var point = L.point(oX, oY);
                        L.DomUtil.setPosition(body, point);
                        return false;
                    }
                });

                $(document).mouseup(function (e) {
                    //var se = document.getElementById(_body);
                    dragging = false;
                    iX = null;
                    iY = null;
                    pannel = null;
                    body = null;
                    uKey = null;
                    //  se.releaseCapture;
                    //e.cancelBubble = true;
                });
            }
        },

        /**
        *显示加载提示
        *@method showLoading
        */
        showLoading: function () {
            L.dci.app.pool.get("map").getMap().loading.addLoader();
        },
        /**
        *关闭加载提示
        *@method hideLoading
        */
        hideLoading: function () {
            L.dci.app.pool.get("map").getMap().loading.removeLoader();
        },

        showPaneloading: function () {
            var loadingHtml =                 + '<div class="ydph-loadflash">'
                    +'<div class="loadingFlash"><span class="icon-loading"></span>'
                    + '</div>'
                    + '<div class="loadingText">服务器正在处理请求，请耐心等待...</div>'
                +'</div>'
        },

        hidePaneloading: function () {
            var loadingHtml = + '<div class="ydph-loadflash">'
                    + '<div class="loadingFlash"><span class="icon-loading"></span>'
                    + '</div>'
                    + '<div class="loadingText">服务器正在处理请求，请耐心等待...</div>'
                + '</div>'
        },

        /**
        *退出系统
        *@method loginOut
        */
        loginOut: function () {
            location.href = "login.aspx";
        },

        /**
        *显示加载动画(rightpanel显示)
        *@method showLoadFlash
        *@param obj {Object} 显示加载动画的标签
        */
        showLoadFlash: function (obj) {
            //var html = '<div class="loadingFlash"><img alt="" src="themes/default/images/controls/loading.gif"/></div>';
            //var obj = $("."+ classname +"");
            //obj.html(html);
            obj.css({ "z-index": "2000" });
        },

        /**
        *隐藏加载动画(rightpanel显示)
        *@method hideLoadFlash
        *@param obj {Object} 显示加载动画的标签
        */
        hideLoadFlash: function (obj) {
            obj.css({ "z-index": "-1" });
        },

        /**
        *属性对象融合
        *@method mergesOptions
        *@param option {Object} 属性对象
        *@param foption {Object} 属性对象
        *@return {Object} 融合后的属性对象
        */
        mergesOptions: function (option, foption) {
            var result = [];
            for (var att in option) {
                result[att] = option[att];
            }
            for (var att in foption) {
                result[att] = foption[att];
            }
            return result;
        },
        /**
        *table转化为Json
        *@method tableToJson
        *@param tableId {String} table的id
        *@return {Object} 转化后的json对象
        */
        tableToJson: function (tableId) {
            var table = document.getElementById(tableId);
            if (table == null) return null;
            var data = [];
            var headers = [];
            for (var i = 0; i < table.rows[0].cells.length; i++) {
                headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
            }
            for (var i = 1; i < table.rows.length; i++) {
                var tableRow = table.rows[i];
                var rowData = {};
                for (var j = 0; j < tableRow.cells.length; j++) {
                    rowData[headers[j]] = tableRow.cells[j].innerHTML;
                }
                data.push(rowData);
            }

            return data;
        },

        /**
        *清除当前选中地图的高亮
        *@method clearSelected
        *@return {Object} 当前激活的地图对象
        */
        clearSelected:function() {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
            return map;
        }

    });
    return L.DCI.Util;
})