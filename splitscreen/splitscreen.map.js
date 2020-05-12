/**
*分屏地图类
*@module splitScreen
*@class DCI.SplitScreen
*@constructor initialize
*/
define("splitscreen/map", [
    "leaflet",
    "core/dcins",
    "proj4",
    "leaflet/proj4leaflet",
    "leaflet/esri",
    "leaflet/CRS2379",
    "core/symbol",
    "controls/groupedlayer",
    "data/ajax",
    "util/dialog",
], function (L) {
    L.DCI.SplitScreen.Map = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'SplitScreen',


        /**
        *mapOne对象
        *@property mapOne
        *@type {Object}
        *@private
        */
        mapOne: null,

        /**
        *mapTwo对象
        *@property mapTwo
        *@type {Object}
        *@private
        */
        mapTwo: null,

        /**
        *mapThree对象
        *@property mapThree
        *@type {Object}
        *@private
        */
        mapThree: null,

        /**
        *mapFour对象
        *@property mapFour
        *@type {Object}
        *@private
        */
        mapFour: null,

        /**
        *
        *@property container
        *@type {Object}
        *@private
        */
        container: null,

        /**
        *
        *@property zoomControl
        *@type {Object}
        *@private
        */
        zoomControl: null,

        /**
        *
        *@property scaleControl
        *@type {Object}
        *@private
        */
        scaleControl: null,

        /**
        *
        *@property controls
        *@type {Object}
        *@private
        */
        controls: {
            layers: null,
            toolbar: null,
            scale: null,
            print: null,
            fold: null
        },

        /**
        *
        *@property options
        *@type {Object}
        *@private
        */
        options: {
            crs: null,
            continuousWorld: true,
            zoomControl: false,
            attributionControl: false,
            foldClickEvent: null,
            closeClickEvent: null,
            inertia: true,
            expend: null
        },

        /**
        *
        *@property cuOptions
        *@type {Object}
        *@private
        */
        cuOptions: {
            baseCrs: Project_ParamConfig.crs,
            baseLayer: Project_ParamConfig.baseLayer,//底图
            themLayers: Project_ParamConfig.bmapLayers,//专题图层
            changeLayers: Project_ParamConfig.changeLayers,//切换图层

            type: Project_ParamConfig.baseLayer.type,
            tileSize: Project_ParamConfig.baseLayer.tileSize || 512,
            minZoom: Project_ParamConfig.baseLayer.minZoom || 0,
            maxZoom: Project_ParamConfig.baseLayer.maxZoom || 10,
            zoom: Project_ParamConfig.baseLayer.zoom || 0
        },

        /**
        *默认加载数据
        *@property initData
        *@type {Object}
        *@private
        */
        initData: null,

        /**
        *默认分屏（0为默认状态不加载数据，大于0则从菜单栏添加数据同时分屏）
        *@property splitNum
        *@type {Number}
        *@private
        */
        splitNum:0,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            //获取初始化数据
            if (localStorage.splitScreenInitData != null || localStorage.splitScreenInitData != undefined)
            {
                this.initData = JSON.parse(localStorage.splitScreenInitData);
                //插入左边栏菜单
                this.title = this.initData.title;
                this.menus = this.initData.menus;
                this.data = this.initData.datas;
                this.defaultAddLayer = this.initData.defaultAddLayer;
                $("#leftpanel").html(this.getLeftMenuHtml(this.title, this.menus));

                //菜单事件
                $("#leftpanel").on('click', 'li:not(".active")', { context: this }, function (e) {e.data.context.open(e);});
                $("#leftpanel").on('click', 'li.active', { context: this }, function (e) { e.data.context.close(e); });
                //屏幕关闭事件
                $("#centerpanel").on('click', 'span.closeScreen', { context: this }, function (e) { e.data.context.closeScreen(e); });

            }
            this.ajax = new L.DCI.Ajax();
            //四个屏添加地图
            this.mapOne = this.createMap("mapone");
            this.mapTwo = this.createMap("maptwo");
            this.mapThree = this.createMap("mapthree");
            this.mapFour = this.createMap("mapfour");

            this._highLightLayer = new L.layerGroup();
            this._highLightLayer.addTo(this.mapOne);
            this._highLightLayer.addTo(this.mapTwo);
            this._highLightLayer.addTo(this.mapThree);
            this._highLightLayer.addTo(this.mapFour);

            this.mapOne.on('movestart', this.mapOneMoveStart,this );
            this.mapTwo.on('movestart', this.mapTwoMoveStart, this);
            this.mapThree.on('movestart', this.mapThreeMoveStart, this);
            this.mapFour.on('movestart', this.mapFourMoveStart, this);
        },

        /**
       * 创建地图对象
       *@method createMap
       */
       createMap: function (container) {
            var crs = null;
            this._baseLayer = null;
            this.centerPoint = null;
            var mapObj = null;

            if (this.cuOptions.type == "tile")
            {
                crs = new L.Proj.CRS(this.cuOptions.baseCrs.code, this.cuOptions.baseCrs.defs, {
                    origin: this.cuOptions.baseLayer.origin,
                    resolutions: this.cuOptions.baseLayer.resolutions
                });
                this._baseLayer = new L.esri.Layers.TiledMapLayer(this.cuOptions.baseLayer.url, {
                    id: 'baseLayer',
                    img: this.cuOptions.baseLayer.img,
                    maxZoom: this.cuOptions.maxZoom,
                    tileSize: this.cuOptions.tileSize,
                    continuousWorld: true
                });
            } else if (this.cuOptions.type == "vector")
            {
                crs = L.CRS.EPSG2379;
                this._baseLayer = L.esri.dynamicMapLayer(this.cuOptions.baseLayer.url, {
                    id: "baseLayer",
                    img: this.cuOptions.baseLayer.img,
                    continuousWorld: true
                });
            }
            var minPoint = crs.projection.unproject(L.point(this.cuOptions.baseLayer.fullextent[0], this.cuOptions.baseLayer.fullextent[1]));
            var maxPoint = crs.projection.unproject(L.point(this.cuOptions.baseLayer.fullextent[2], this.cuOptions.baseLayer.fullextent[3]));
            var bounds = L.latLngBounds(minPoint, maxPoint);
            this.centerPoint = bounds.getCenter();

            this.options = L.setOptions(this, {
                crs: crs,
                continuousWorld: true
            });
            mapObj = L.map(container, this.options);
            mapObj.options.baseLayer = this.cuOptions.baseLayer.url;
            this.setView(mapObj,this.centerPoint, this.cuOptions.zoom);

            if (this._baseLayer)
            {
                this._baseLayer.addTo(mapObj);
            } else
            {
                var _this = this;
                var t = setInterval($.proxy(function () {
                    if (_this._baseLayer)
                    {
                        clearInterval(t);
                        _this._baseLayer.addTo(mapObj);
                    }
                }, this), 300);
            }

            return mapObj;
       },

      /**
      * 设置地图显示的中心点及地图级别
      *@method setView
      *@param mapObj{Object} 地图对象
      *@param latlng{Object} 坐标值
      *@param zoom{Number} 地图缩放级别
      */
       setView: function (mapObj, latlng, zoom) {
           mapObj.setView(latlng, zoom);
       },

      /**
      * 分屏
      *@method split
      *@param num{Number} 分屏数目
      */
       split: function (num) {
           var containerObj = $("#centerpanel");
           var eles = containerObj.find("div.leaflet-container");
           var id1 = $(eles[0]).attr("id");
           var id2 = $(eles[1]).attr("id");
           var id3 = $(eles[2]).attr("id");
           var id4 = $(eles[3]).attr("id");
           containerObj.removeClass("mapone maptwo mapthree mapfour");
           switch (num)
           {
               case 0:
               case 1:
                   containerObj.addClass("mapone");
                   this.getMapById(id1).invalidateSize();
                   break;
               case 2:
                   containerObj.addClass("maptwo");
                   this.getMapById(id1).invalidateSize();
                   this.getMapById(id2).invalidateSize();
                   break;
               case 3:
                   containerObj.addClass("mapthree");
                   this.getMapById(id1).invalidateSize();
                   this.getMapById(id2).invalidateSize();
                   this.getMapById(id3).invalidateSize();
                   break;
               case 4:
                   containerObj.addClass("mapfour");
                   this.getMapById(id1).invalidateSize();
                   this.getMapById(id2).invalidateSize();
                   this.getMapById(id3).invalidateSize();
                   this.getMapById(id4).invalidateSize();
                   break;
               default:
                   break;
           }
       },

        /**
       * 默认添加的服务图层
       *@method addDefaultLayer
       */
       addDefaultLayer: function () {
           //当数组不为空时，给四个分屏添加默认图层
           if (this.defaultAddLayer.length > 0)
           {
               var data = this.defaultAddLayer;
               for (var i = 0; i < data.length; i++)
               {
                   var name = "默认添加的" + data[i].name;
                   var url = data[i].url;
                   var layerIndex = data[i].layerIndex;
                   var opacity = data[i].opacity;
                   var layer = L.esri.dynamicMapLayer(url, { layers: [layerIndex], id: name, opacity: opacity });
                   var layer2 = L.esri.dynamicMapLayer(url, { layers: [layerIndex], id: name, opacity: opacity });
                   var layer3 = L.esri.dynamicMapLayer(url, { layers: [layerIndex], id: name, opacity: opacity });
                   var layer4 = L.esri.dynamicMapLayer(url, { layers: [layerIndex], id: name, opacity: opacity });
                   layer.addTo(this.mapOne);
                   layer2.addTo(this.mapTwo);
                   layer3.addTo(this.mapThree);
                   layer4.addTo(this.mapFour);
               }
           }
       },

        /**
       * 通过容器id获取map对象
       *@method getMapById
       *@param id{String} 地图对象容器id
       */
       getMapById: function (id) {
           var mapObj = null;
           switch (id)
           {
               case 'mapone':
                   mapObj = this.mapOne;
                   break;
               case 'maptwo':
                   mapObj = this.mapTwo;
                   break;
               case 'mapthree':
                   mapObj = this.mapThree;
                   break;
               case 'mapfour':
                   mapObj = this.mapFour;
                   break;
               default:
                   break;
           }
           return mapObj;
       },

      /**
      * 恢复初始化的地图
      *@method recoverMap
      *@param mapObj{Object} 地图对象
      */
       recoverMap:function(mapObj){
           mapObj.eachLayer(function (layer) {
               if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer")
               {
                   var num = layer.options.id.indexOf("默认");
                   if(num <= -1)
                       mapObj.removeLayer(layer);
               }
           }, this);
       },

      /**
      * 设置左边菜单的布局
      *@method getLeftMenuHtml
      *@param title{String} 标题
      *@param menus{Array} 菜单名数据集
      */
        getLeftMenuHtml: function (title, menus) {
            var liHtml = '';
            for (var i = 0; i < menus.length; i++)
            {
                liHtml += '<li><span></span><span class="icon-pitch-on"></span><span>' + menus[i] + '</span></li>';
            }

            var html = '<p>' + title + '</p>'
                       + '<ul>'
                        + liHtml
                      + '</ul>';
            return html;
        },
        /**
        *添加图集
        *@method addLayers
        */
        addLayers:function(datas,splitNum){
            var containerObj = $("#centerpanel");
            var eles = containerObj.find("div.leaflet-container");
            var id1 = $(eles[0]).attr("id");
            var id2 = $(eles[1]).attr("id");
            var id3 = $(eles[2]).attr("id");
            var id4 = $(eles[3]).attr("id");
            var mapObj = null;
            switch (splitNum)
            {
                case 1:
                    mapObj = this.getMapById(id1);
                    break;
                case 2:
                    mapObj = this.getMapById(id2);
                    break;
                case 3:
                    mapObj = this.getMapById(id3);
                    break;
                case 4:
                    mapObj = this.getMapById(id4);
                    break;
                default:
                    break;
            }

            for (var i = 0; i < datas.length; i++)
            {
                var name = datas[i].name;
                var url = datas[i].url;
                var layerIndex = datas[i].layerIndex;
                var layer = L.esri.dynamicMapLayer(url, { layers: [layerIndex], id: name });
                layer.addTo(mapObj);
            }
        },

        /**
        *打开菜单
        *@method open
        */
        open: function (e) {
            var containerObj = $("#centerpanel");
            var eles = containerObj.find("div.leaflet-container");
            if (this.splitNum >= 4) return;
            var ele = e.currentTarget;
            $(ele).addClass("active");
            this.splitNum += 1;
            this.split(this.splitNum);
            var index = $(e.currentTarget).index();
            var name = $(ele).children("span:last-child").html();
            var html = '<span class="mapToolName">' + name + '</span>';
            switch (this.splitNum)
            {
                case 1:
                    $(eles[0]).children(".mapTool").children("div").html(html);
                    break;
                case 2:
                    $(eles[1]).children(".mapTool").children("div").html(html);
                    break;
                case 3:
                    $(eles[2]).children(".mapTool").children("div").html(html);
                    break;
                case 4:
                    $(eles[3]).children(".mapTool").children("div").html(html);
                    break;
                default:
                    break;
            }
            if (this.data.length > 0)
            {
                if(this.data[index].length>0)
                    this.addLayers(this.data[index], this.splitNum);
            }
            
        },
        /**
        *关闭菜单
        *@method close
        */
        close: function (e) {
            var ele = e.currentTarget;
            var ele = e.currentTarget;
            var name = $(ele).children("span:last-child").html();
            var eles = $("#centerpanel").find("span.mapToolName");
            for (var i = 0; i < eles.length; i++)
            {
                var mapToolName = $(eles[i]).html();
                if (name == mapToolName)
                {
                    $(eles[i]).parent().siblings().click();
                    break;
                }
            }
        },
        /**
        *取消菜单的勾选项
        *@method cancelSelected
        *@param mapToolName{String} 菜单名称
        */
        cancelSelected: function (mapToolName) {
            var eles = $("#leftpanel").find("li");
            for (var i = 0; i < eles.length; i++)
            {
                var name = $(eles[i]).children("span:last-child").html();
                if (name == mapToolName)
                {
                    $(eles[i]).removeClass("active");
                    break;
                }
            }
        },
        /**
        *关闭具体分屏
        *@method closeScreen
        */
        closeScreen: function (e) {
            var containerId = $(e.currentTarget).parents(".leaflet-container").attr("id");
            var mapToolName = $(e.currentTarget).siblings().children(".mapToolName").html();
            this.cancelSelected(mapToolName);
            var _this = this;
            _this.splitNum -= 1;
            switch (containerId)
            {
                case 'mapone':
                    $("#mapone>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#mapone"));
                    _this.recoverMap(_this.mapOne);
                    break;
                case 'maptwo':
                    $("#maptwo>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#maptwo"));
                    _this.recoverMap(_this.mapTwo);
                    break;
                case 'mapthree':
                    $("#mapthree>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#mapthree"));
                    _this.recoverMap(_this.mapThree);
                    break;
                case 'mapfour':
                    $("#mapfour>div.mapTool>div").html("");
                    $("#centerpanel>div:last-child").after($("#mapfour"));
                    _this.recoverMap(_this.mapFour);
                    break;
                default:
                    break;
            }
            _this.split(_this.splitNum);
        },
        /**
        *mapOne对象的移动开始事件
        *@method mapOneMoveStart
        */
        mapOneMoveStart: function () {
            this.mapOne.on('moveend', this.mapOneMoveEnd, this);
            this.mapTwo.off('moveend', this.mapTwoMoveEnd, this);
            this.mapThree.off('moveend', this.mapThreeMoveEnd, this);
            this.mapFour.off('moveend', this.mapFourMoveEnd, this);
        },
        /**
        *mapTwo对象的移动开始事件
        *@method mapTwoMoveStart
        */
        mapTwoMoveStart: function () {
            this.mapOne.off('moveend', this.mapOneMoveEnd, this);
            this.mapTwo.on('moveend', this.mapTwoMoveEnd, this);
            this.mapThree.off('moveend', this.mapThreeMoveEnd, this);
            this.mapFour.off('moveend', this.mapFourMoveEnd, this);
        },
        /**
        *mapThree对象的移动开始事件
        *@method mapThreeMoveStart
        */
        mapThreeMoveStart: function () {
            this.mapOne.off('moveend', this.mapOneMoveEnd, this);
            this.mapTwo.off('moveend', this.mapTwoMoveEnd, this);
            this.mapThree.on('moveend', this.mapThreeMoveEnd, this);
            this.mapFour.off('moveend', this.mapFourMoveEnd, this);
        },
        /**
        *mapFour对象的移动开始事件
        *@method mapFourMoveStart
        */
        mapFourMoveStart: function () {
            this.mapOne.off('moveend', this.mapOneMoveEnd, this);
            this.mapTwo.off('moveend', this.mapTwoMoveEnd, this);
            this.mapThree.off('moveend', this.mapThreeMoveEnd, this);
            this.mapFour.on('moveend', this.mapFourMoveEnd, this);
        },
        /**
        *mapOne对象的移动结束事件
        *@method mapOneMoveEnd
        */
        mapOneMoveEnd: function (e) {
            var conterPoin = this.mapOne.getCenter();
            var mapZoom = this.mapOne.getZoom();
            this.setSyncView(conterPoin, mapZoom);
        },
        /**
        *mapTwo对象的移动结束事件
        *@method mapTwoMoveEnd
        */
        mapTwoMoveEnd: function (e) {
            var conterPoin = this.mapTwo.getCenter();
            var mapZoom = this.mapTwo.getZoom();
            this.setSyncView(conterPoin, mapZoom);
        },
        /**
        *mapThree对象的移动结束事件
        *@method mapThreeMoveEnd
        */
        mapThreeMoveEnd: function (e) {
            var conterPoin = this.mapThree.getCenter();
            var mapZoom = this.mapThree.getZoom();
            this.setSyncView(conterPoin, mapZoom);
        },
        /**
        *mapFour对象的移动结束事件
        *@method mapFourMoveEnd
        */
        mapFourMoveEnd: function (e) {
            var conterPoin = this.mapFour.getCenter();
            var mapZoom = this.mapFour.getZoom();
            this.setSyncView(conterPoin, mapZoom);
        },
        /**
        *同步设置分屏地图显示的中心点及地图级别
        *@method setSyncView
        */
        setSyncView: function (latlng, zoom) {
            var id1 = $("#centerpanel>div:eq(0)").attr("id");
            var id2 = $("#centerpanel>div:eq(1)").attr("id");
            var id3 = $("#centerpanel>div:eq(2)").attr("id");
            var id4 = $("#centerpanel>div:eq(3)").attr("id");
            var mapObj1 = this.getMapById(id1);
            var mapObj2 = this.getMapById(id2);
            var mapObj3 = this.getMapById(id3);
            var mapObj4 = this.getMapById(id4);
            switch (this.splitNum)
            {
                case 1:
                    this.setView(mapObj1, latlng, zoom);
                    break;
                case 2:
                    this.setView(mapObj1, latlng, zoom);
                    this.setView(mapObj2, latlng, zoom);
                    break;
                case 3:
                    this.setView(mapObj1, latlng, zoom);
                    this.setView(mapObj2, latlng, zoom);
                    this.setView(mapObj3, latlng, zoom);
                    break;
                case 4:
                    this.setView(mapObj1, latlng, zoom);
                    this.setView(mapObj2.latlng, zoom);
                    this.setView(mapObj3, latlng, zoom);
                    this.setView(mapObj4, latlng, zoom);
                    break;
                default:
                    break;
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
            if (map == null)
            {
                throw "unproject:map对象不能为空";
            }
            if (feature == null)
            {
                throw "unproject:feature不能为空";
            }
            var type = geoType != null ? geoType : feature.geometryType;
            if (type == null)
            {
                throw "unproject:geometry类型不能为空";
            }
            try
            {
                var pnts = [], geo = null;
                switch (type)
                {
                    case "esriGeometryPolygon"://面
                    case "Polygon":
                        var paths = feature.geometry.rings == null ? feature.geometry.coordinates : feature.geometry.rings;
                        for (var i = 0; i < paths.length; i++)
                        {
                            var pnts2 = [];
                            for (var j = 0; j < paths[i].length; j++)
                            {
                                var pnt = map.options.crs.projection.unproject(L.point(paths[i][j]));
                                pnts2.push([pnt.lat, pnt.lng]);
                            }
                            pnts.push(pnts2);
                        }
                        geo = L.polygon(pnts);
                        break;
                    case "esriGeometryPolyline"://线
                    case "Polyline":
                        var paths = feature.geometry.paths == null ? feature.geometry.coordinates : feature.geometry.paths;
                        if (paths.length > 1)
                        {
                            for (var i = 0; i < paths.length; i++)
                            {
                                var pnts2 = [];
                                for (var j = 0; j < paths[i].length; j++)
                                {
                                    var pnt = map.options.crs.projection.unproject(L.point(paths[i][j]));
                                    pnts2.push([pnt.lat, pnt.lng]);
                                }
                                pnts.push(pnts2);
                            }
                            geo = L.multiPolyline(pnts);
                        } else
                        {
                            var paths2 = paths[0];
                            for (var i = 0; i < paths2.length; i++)
                            {
                                var pnt = map.options.crs.projection.unproject(L.point(paths2[i]));
                                pnts.push([pnt.lat, pnt.lng]);
                            }
                            geo = L.polyline(pnts);
                        }
                        break;
                    case "esriGeometryPoint"://点
                    case "Point":
                        var pnt = map.options.crs.projection.unproject(L.point(feature.geometry.x, feature.geometry.y));
                        pnts.push([pnt.lat, pnt.lng]);
                        var latlng = L.latLng(pnts[0][0], pnts[0][1]);
                        geo = L.marker(latlng);
                        break;
                    case "MultiPolygon":
                        var coors = feature.geometry.coordinates;
                        for (var i = 0; i < coors.length; i++)
                        {
                            for (var j = 0; j < coors[i].length; j++)
                            {
                                var pnts2 = [];
                                for (var k = 0; k < coors[i][j].length; k++)
                                {
                                    var pnt = map.options.crs.projection.unproject(L.point(coors[i][j][k]));
                                    pnts2.push([pnt.lat, pnt.lng]);
                                }
                                pnts.push(pnts2);
                            }
                            geo = L.multiPolygon(pnts);
                        }
                        break;
                }
            } catch (e)
            {
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
            if (map == null)
            {
                throw "highLight:map对象不能为空";
            }
            if (feature == null)
            {
                throw "highLight:feature不能为空";
            }
            var hlLayer = map.getHighLightLayer();
            if (hlLayer == null)
            {
                throw "highLight:未在map中找到highlight layer";
            }
            var type = geoType == null ? feature.geometryType : geoType;
            if (type == null || type == "")
            {
                throw "unproject:geometry类型不能为空";
            }
            var geo = null;
            try
            {
                if (isCrs)//如果需要转化坐标
                    geo = this.unproject(map, feature, type);
                else
                    geo = feature;
                switch (type)
                {
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
            } catch (e)
            {
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
            if (map == null)
            {
                throw "zoomTo:map对象不能为空";
            }
            if (feature == null)
            {
                throw "zoomTo:feature不能为空";
            }
            try
            {
                var geo = null, type = "";
                if (geoType != null)
                    type = geoType;
                else
                    type = feature.geometryType == null ? feature.toGeoJSON().geometry.type : feature.geometryType;
                if (type == null || type == "")
                {
                    throw "zoomTo:geometry类型不能为空";
                }
                var maxZoom = map.getMaxZoom();
                if (isCrs)
                    geo = this.unproject(map, feature, type);
                else
                    geo = feature;
                switch (type)
                {
                    case "esriGeometryPolygon":
                    case "esriGeometryPolyline":
                    case "LineString":
                    case "PolygonString":
                    case "Polygon":
                    case "Line":
                        map.fitBounds(geo.getBounds());
                        break;
                    case "esriGeometryPoint"://点
                    case "PointString"://点
                    case "Point"://点
                        if (maxZoom != null && maxZoom > 0)
                            map.setView(geo, maxZoom / 2);
                        else
                            map.panTo(geo);
                        break;
                }
            } catch (e)
            {
                throw "zoomTo:" + e;
            }
            return geo;
        },

    });
    return L.DCI.SplitScreen.Map;
});