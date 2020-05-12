/**
*地图类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/map", [
    "leaflet",
    "core/dcins",
    "proj4",
    "leaflet/proj4leaflet",
    "leaflet/esri",
    "leaflet/CRS2379",
    "bmap/foldcontrol",
    "core/symbol",
    "bmap/toolbar",
    "controls/groupedlayer",
    "data/ajax",
    "util/dialog",
    "bmap/business"
], function (L) {

    L.DCI.BMap.Map = L.Class.extend({

        /**
        *html模版
        *@property layoutHtml
        *@type {String}
        *@private
        */
        layoutHtml: '<div id="bmap-layout-top-left" class="no-print" style="position:relative;display:inline-block;vertical-align:top;height:auto;top:5px;left:5px;z-index:9"></div>'
                 + '<div id="bmap-layout-top-right" class="no-print" style="position:relative;display:inline-block;height:auto;top:0px;left:0px;z-index:10;float:right;"></div>',

        /**
        *map对象
        *@property map
        *@type {Object}
        *@private
        */
        map: null,

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'bmap',

        /**
        *
        *@property projectLatlng
        *@type {Object}
        *@private
        */
        projectLatlng: null,

        /**
        *是否全屏状态
        *@property fullScreen
        *@type {Enum}
        *@private
        */
        fullScreen: false,

        /**
        *高亮图层
        *@property _highLightLayer
        *@type {Object}
        *@private
        */
        _highLightLayer: null,

        /**
        *屏幕状态，false为小屏，true为全屏
        *@property _currentScreen
        *@type {Enum}
        *@private
        */
        _currentScreen: false,   //屏幕状态，false为小屏，true为全屏

        /**
        *屏幕状态是否改变
        *@property _screenChange
        *@type {Enum}
        *@private
        */
        _screenChange: false,

        /**
        *默认打开小屏宽度
        *@property _oldWidth
        *@type {Number}
        *@private
        */
        _oldWidth: 350,

        /**
        *默认打开小屏高度
        *@property _oldHeight
        *@type {Number}
        *@private
        */
        _oldHeight: 450,

        /**
        *
        *@property _currentHightGeo
        *@type {Object}
        *@private
        */
        _currentHightGeo:null,

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
        *初始化
        *@method initialize
        *@param id{String} 容器id
        *@param sClass{String} 
        *@param lClass{String} 
        *@param type{String} 
        */
        initialize: function (id, sClass, lClass, type) {
            this.ajax = new L.DCI.Ajax();
            this.container = document.getElementById(id);
            this.container.innerHTML = this.layoutHtml;

            if (this.cuOptions.type == "tile") {
                var crs = new L.Proj.CRS(this.cuOptions.baseCrs.code, this.cuOptions.baseCrs.defs, {
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
            } else if (this.cuOptions.type == "vector") {
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
            var centerPoint = bounds.getCenter();

            this.options = L.setOptions(this, {
                crs: crs,
                continuousWorld: true
            });

            this.map = L.map(this.container, this.options);
            this.map.options.baseLayer = this.cuOptions.baseLayer.url;
            this.map.setView(centerPoint, this.cuOptions.zoom);

            if (this._baseLayer) {
                this._baseLayer.addTo(this.map);
            } else {
                var _this = this;
                var t = setInterval($.proxy(function () {
                    if (_this._baseLayer) {
                        clearInterval(t);
                        _this._baseLayer.addTo(_this.map);
                    }
                }, this), 300);
            }

            this.map.whenReady(function () {
                this._addDefControls(id, sClass, lClass);
            }, this);

            this._highLightLayer = new L.layerGroup();
            this._highLightLayer.addTo(this.map);
            this.hideSomeButton();    //默认隐藏部分功能按钮
            this.map.on('resize', this.resizeScreen, this);
        },

        /**
        *当屏幕变小时隐藏功能按钮
        *@method hideSomeButton
        */
        hideSomeButton: function () {
            //$(".bmap.toolbar").find("span.active").removeClass("active");
            var Eles = $(".bmap.toolbar").find("span:gt(2)");
            for (var i = 0; i < Eles.length; i++) {
                $(Eles[i]).hide();
            }
        },

        /**
        *当屏幕变大时显示功能按钮
        *@method showSomeButton
        */
        showSomeButton: function () {
            var Eles = $(".bmap.toolbar").find("span:gt(2)");
            for (var i = 0; i < Eles.length; i++) {
                var title = $(Eles[i]).attr("title");
                switch (businessType)
                {
                    case "GHBZ":
                        if ((title != "项目查看") || ($($(".bmap.toolbar").find("span[title='现势浏览']")).hasClass("selected")))
                            $(Eles[i]).show();
                        break;
                    case "YWSP":
                        if (title == "属性查询" || title == "打印")
                            $(Eles[i]).show();
                        break;
                    default:
                        break;
                }
            }
        },

        /**
        *监听地图在oa上的显示大小，
        *若在oa上显示的宽度小于250，不给予属性查询和打印的功能显示
        *@method resizeScreen
        */
        resizeScreen: function () {
            var toolbar = L.dci.app.pool.get("Toolbar");
            var width = $(".bmapbody").width();
            var height = $(".bmapbody").height();
            if (width < this._oldWidth || height < this._oldHeight) {//小屏
                var num = $(".icon-arrows").attr("data-info");
                if (num == 0) {
                    $(".result-list-group-button .icon-arrows").attr("data-info", "1").css("-webkit-transform", "rotate(0deg)");
                }
                $(".rightpanel").css({ "display": "none", "right": "-300px" });
                //$(".result-list-group").html('');
                this.hideSomeButton();
                this.map.getContainer().style.cursor = "pointer";
            }
            if (width > this._oldWidth && height > this._oldHeight) {//大屏
                $(".rightpanel").css("display", "block");
                this.showSomeButton();
            }
        },

        /**
        *
        *@method _addDefControls
        */
        _addDefControls: function (id, sClass, lClass) {
            var topLeftPanel = $(this.container).find('#bmap-layout-top-left')[0];
            var topRightPanel = $(this.container).find('#bmap-layout-top-right')[0];

            this.controls.toolbar = new L.DCI.BMap.Toolbar({ mapContainer: id });
            L.dci.app.pool.add(this.controls.toolbar);
            topLeftPanel.appendChild(this.controls.toolbar.getBody(this.map));

            var baseLayersArr = { "底图切换": {} };
            baseLayersArr["底图切换"][this.cuOptions.baseLayer.name] = this._baseLayer;
            for (var i = 0; i < this.cuOptions.changeLayers.length; i++) {
                var baseObj = this.cuOptions.changeLayers[i];
                if (baseObj.tiled) {
                    baseLayersArr["底图切换"][baseObj.name] = new L.esri.Layers.TiledMapLayer(baseObj.url, {
                        id: "basemap_" + i,
                        name: baseObj.name,
                        img: "images/controls/grouplayer/" + baseObj.img,
                        tileSize: baseObj.tileSize,
                        origin: [baseObj.origin[0], baseObj.origin[1]],
                        zIndex: 1,
                        position: 'back',
                        continuousWorld: true
                    });
                } else {
                    baseLayersArr["底图切换"][baseObj.name] = new L.esri.Layers.DynamicMapLayer(baseObj.url, {
                        img: "images/controls/grouplayer/" + baseObj.img,
                        position: 'back',
                        layers: baseObj.layerIndex
                    });
                }
            }

            var groupedOverlays = { "快捷添加图层": {} };
            for (var i = 0; i < this.cuOptions.themLayers.length; i++) {
                var obj = this.cuOptions.themLayers[i];
                groupedOverlays["快捷添加图层"][obj.name] =
                    new L.esri.DynamicMapLayer(obj.url, {
                        id: "thememap_" + i,
                        name: obj.name, layers: obj.layerIndex,
                    });
            }
            this.controls.layers = new L.DCI.Controls.GroupedLayers(baseLayersArr, groupedOverlays, null);
            var layerBody = this.controls.layers.getBody(this.map);
            $(layerBody).addClass('bmap-control-layers');
            topLeftPanel.appendChild(layerBody);

            $(".leaflet-control-layers-list").click(function (e) {
                e.stopPropagation();   //停止事件冒泡
            });
            $(".leaflet-control-layers-list").dblclick(function (e) {
                e.stopPropagation();   //停止事件冒泡
            });
        },

        /**
        *获取地图对象
        *@method getMap
        */
        getMap: function () {
            return this.map;
        },

        /**
        *获取高亮图层对象
        *@method getHighLightLayer
        */
        getHighLightLayer: function () {
            return this._highLightLayer;
        },

        /**
        * 在地图上显示项目信息
        * 根据传递进来的业务编号查询到相关联的项目，并将项目信息显示在在地图上
        * id:业务编号
        *@method getCaseInfo
        */
        getCaseInfo: function (layer, id) {
            if (id == null) return;
            var _this = this;
            this._highLightLayer.clearLayers();
            var symbol = new L.DCI.Symbol();
            var find = new L.esri.Tasks.Find(layer.url);
            find.layers(layer.options.layers.join(',')).text(id).fields("CASE_ID").returnGeometry(true).spatialReference(this.map.options.crs.code);
            find.run(function (error, featureCollection, response) {
                if (response == null || response.results == null || response.results.length == 0) return;
                var geoFirst = null;
                for (var k = 0; k < response.results.length; k++) {
                    var geometry = response.results[k].geometry;
                    var array = geometry.rings[0];
                    var rings = [];
                    for (var i = 0; i < array.length; i++) {
                        var pnt = _this.map.options.crs.projection.unproject(L.point(array[i]));
                        rings.push(pnt);
                    }
                    var geo = L.polygon(rings);
                    if (k == 0) geoFirst = geo;
                    geo.setStyle(symbol.highlightPolygonSymbol);
                    _this._highLightLayer.addLayer(geo);
                }
                if (geoFirst) {
                    var latlng = geoFirst.getBounds().getCenter();
                    _this.projectLatlng = latlng;
                    var zoom = Math.floor(_this.cuOptions.maxZoom / 2);
                    _this.map.setView(latlng, zoom);
                }
            }, this);
        },

        /**
        * 在地图上显示项目范围线项目
        * id:项目编号
        *@method getProjectInfo
        */
        getProjectInfo: function (id) {
            if (id == null) return;
            var defaultLayer = this.cuOptions.themLayers[0];
            var index = 0;
            this.xmyztObj = L.esri.dynamicMapLayer(defaultLayer.url, { layers: [index] });
            var _this = this;
            this._highLightLayer.clearLayers();
            var symbol = new L.DCI.Symbol();
            this.xmyztObj.metadata(function (error, metadata) {
                if (metadata == null) return;
                var layers = [];
                for (var i = 0; i < metadata.layers.length; i++) {
                    if (metadata.layers[i].name == "项目范围线") {
                        layers.push(metadata.layers[i].id);
                        this.xmyztObj.setLayers(layers);
                        break;
                    }
                }
                if (layers.length == 0) return;
                var find = new L.esri.Tasks.Find(this.xmyztObj.url);
                find.layers(layers.join(',')).text(id).fields("PROJECTID").returnGeometry(true).spatialReference(this.map.options.crs);
                find.run(function (error, featureCollection, response) {
                    if (response == null || response.results == null || response.results.length == 0) return;
                    var geoFirst = null;
                    for (var k = 0; k < response.results.length; k++) {
                        var geometry = response.results[k].geometry;
                        var array = geometry.rings[0];
                        var rings = [];
                        for (var i = 0; i < array.length; i++) {
                            var pnt = _this.map.options.crs.projection.unproject(L.point(array[i]));
                            rings.push(pnt);
                        }
                        var geo = L.polygon(rings);
                        if (k == 0) geoFirst = geo;
                        geo.setStyle(symbol.highlightPolygonSymbol);
                        _this._highLightLayer.addLayer(geo);
                    }
                    if (geoFirst) {
                        var latlng = geoFirst.getBounds().getCenter();
                        _this.projectLatlng = latlng;
                        var zoom = Math.floor(_this.cuOptions.maxZoom / 2);
                        _this.map.setView(latlng, zoom);
                    }
                });
            }, this);
        },

        /**
        * 设置地图显示的中心点及地图级别
        * latlngy:坐标值
        * zoom:地图缩放级别
        *@method setView
        */
        setView: function (latlng, zoom) {
            this.map.setView(latlng, zoom);
            return this.map;
        },

        /**
        * 属性展示栏
        *@method showAttribute
        */
        showAttribute: function () {
            var html = '<div class="rightpanel no-print">'
                        + '<div class="rightpanel-content">'
                        + '<div class="result-list-group-button">'
                            + '<div class="button"><span class="icon-arrows" data-info="1"></span></div>'
                        + '</div>'
                        + '<div class="result-list-group" id="right-panel-body"></div>'
                        + '</div>'
                      + '</div>';
            var bodyObj = $("body");
            bodyObj.append(html);
            var _this = this;
            $(".result-list-group-button .button").click(function () {
                var num = $(this).children().attr("data-info");
                if (num == 0)
                    _this.hide();
                else
                    _this.show();
            });
        },

        /**
        * 隐藏右边面板
        *@method hide
        */
        hide: function () {
            $(".result-list-group-button .icon-arrows").attr("data-info", "1").css("-webkit-transform", "rotate(0deg)");
            $(".rightpanel").animate({ right: '-300px' }, "fast");
        },

        /**
        * 显示右边面板
        *@method show
        */
        show: function () {
            $(".result-list-group-button .icon-arrows").attr("data-info", "0").css("-webkit-transform", "rotate(180deg)");
            $(".rightpanel").animate({ right: '0px' }, "fast");
        },


        /**
        * 获取运维端配置的案件业务信息
        *@method getBusinessInfo
        *@param projectId{String}  项目编号projectId
        *@param btmId{String}  业务编号btmId
        *@param caseId{String}  案件编号caseId
        */
        getBusinessInfo: function (projectId, btmId, caseId) {
            var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/manage/layerContrast/base/oa/" + btmId;
            var dciajax = new L.DCI.Ajax();
            var dcidialog = new L.DCI.Dialog();
            dciajax.get(url, null, true, this, function (data) {
                businessProjectData = null;
                businessProjectData = data;
                businessType = data.Key2;
                //默认添加服务
                this.addDefaultFeatures(data.Values, projectId,caseId);

            }, function (e) {
                dcidialog.error("提示", "获取案件的业务信息发生错误");
            });
        },

        /**
        * 加载默认图集
        *@method addDefaultFeatures
        *@param data{Object}  数据集
        *@param projectId{String}  项目编号projectId
        *@param caseId{String}  案件编号caseId
        */
        addDefaultFeatures: function (data, projectId, caseId) {
            if (data == undefined || data.length == 0) {
                console.log("没有绑定默认添加图集");
                return;
            }
            var count = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].layerType == "1")count++;
            }
            var _this = this;
            var opacity = 1;
            if (businessType == "GHBZ") opacity = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].layerType == "1") {
                    var layer = new L.esri.DynamicMapLayer(data[i].url, {
                        id: "浏览版业务默认加载图集" + i,
                        name: data[i].name,
                        layers: [data[i].layerIndex],
                        opacity: opacity
                    });
                    layer.addTo(this.map);
                    layer.on("load", function() {
                        count--;
                        if (count == 0) {
                            switch (businessType) {
                                case 'GHBZ':
                                    //定位，编制业务是用projectid来定位
                                    _this.addHighLightLayer("XMBM", projectId);  //添加高亮图层并定位
                                    //获取编制业务初始化信息
                                    _this.getDefaultAllBzBusinessInfo("0", caseId);    //初始化时，项目名称项直接赋值为0，只需传案件编码case_id
                                    break;
                                case 'YWSP':
                                    _this.getCaseInfo(layer, caseId);   //获取业务审批项目信息，审批业务是用caseid来定位
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                } else if (data[i].layerType == "2") {
                    var url = data[i].url;
                    var name = data[i].name;
                    var type = data[i].layerType;
                    var dymicLayer = new L.esri.Layers.DynamicMapLayer(url);
                    dymicLayer.metadata(function (error, metadata) {
                        layer = new L.esri.Layers.TiledMapLayer(url, {
                            id:"浏览版业务默认加载图集" + i,
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
        * 获取项目名称其所有编制方案信息(默认状态获取的数据，即初始化)
        *@method getDefaultAllBzBusinessInfo
        *@param planName{String}    项目名称
        *@param id{String}          案件编码caseId
        */
        getDefaultAllBzBusinessInfo: function (planName, id) {
            var url = Project_ParamConfig.defaultCoreServiceUrl + '/cpzx/bmap/bz/business/' + id + '/' + planName;
            this.ajax.get(url, null, true, this, function (data) {
                var objs = data;
                if (objs == null || objs == "") {
                    //清空容器内容,显示无数据
                    $(".result-list-group").html('<div style="display:table;width:100%;height:100%;"><p style="display:table-cell;text-align:center;vertical-align:middle;">无数据</p></div>');
                    return;
                }
                var businessResult = new L.DCI.BMap.QueryBusinessResult();
                L.dci.app.pool.add(businessResult);
                businessResult.load(objs, true);
                refreshData = objs;
            },
                function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("请求服务失败");
                }
             );
        },

        /**
        * 获取项目名称其所有编制方案信息（点击查询项目按钮）
        *@method getAllBzBusinessInfo
        *@param planName{String}    项目名称
        *@param id{String}          案件编码caseId
        */
        getAllBzBusinessInfo: function (planName, id) {
            var url = Project_ParamConfig.defaultCoreServiceUrl + '/cpzx/bmap/bz/business/' + id + '/' + planName;
            this.ajax.get(url, null, true, this,
                function (data) {
                    var objs = data;
                    if (objs == undefined || objs == "") {
                        //清空容器内容,显示无数据
                        $($(".result-list-group")[0]).html('<div style="display:table;width:100%;height:100%;"><p style="display:table-cell;text-align:center;vertical-align:middle;">无数据</p></div>');
                        var btnObj = $($(".result-list-group-button .button")[0]);
                        if (!btnObj.hasClass("selected")) {
                            btnObj.addClass("selected").siblings().removeClass("selected");
                        }
                        return;
                    }
                    if (!L.dci.app.pool.has("QueryBusinessResult")) {
                        var businessResult = new L.DCI.BMap.QueryBusinessResult();
                        L.dci.app.pool.add(businessResult);
                    }
                    L.dci.app.pool.get("QueryBusinessResult").load(objs, false);

                },
                function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("请求服务失败");
                }
             );
        },

        /**
        * 转换坐标系
        *@method unproject
        *@param map{Object}         bmap类对象
        *@param feature{String}     feature数据
        *@param geoType{String}     类型
        */
        unproject: function (map, feature, geoType) {
            try {
                var pnts = [], geo = null;
                var _map = map.getMap();
                switch (geoType) {
                    case "esriGeometryPolygon"://面
                    case "Polygon":
                        var paths = feature.geometry.rings == null ? feature.geometry.coordinates[0] : feature.geometry.rings[0];
                        for (var i = 0; i < paths.length; i++) {
                            var pnt = _map.options.crs.projection.unproject(L.point(paths[i]));
                            pnts.push([pnt.lat, pnt.lng]);
                        }
                        geo = L.polygon(pnts);
                        break;
                    case "esriGeometryPolyline"://线
                    case "Polyline":
                        var paths = feature.geometry.paths == null ? feature.geometry.coordinates[0] : feature.geometry.paths[0];
                        for (var i = 0; i < paths.length; i++) {
                            var pnt = _map.options.crs.projection.unproject(L.point(paths[i]));
                            pnts.push([pnt.lat, pnt.lng]);
                        }
                        geo = L.polyline(pnts);
                        break;
                    case "esriGeometryPoint"://点
                    case "Point":
                        var pnt = _map.options.crs.projection.unproject(L.point(feature.geometry.x, feature.geometry.y));
                        pnts.push([pnt.lat, pnt.lng]);
                        var latlng = L.latLng(pnts[0][0], pnts[0][1]);
                        geo = L.marker(latlng);
                        break;
                }
            } catch (e) {
                throw "unproject:" + e;
            }
            return geo;
        },

        /**
        * 查询
        *@method queryField
        *@param fields{String}     查询字段
        *@param projectId{String}     字段匹配值
        */
        queryField:function(field,value)
        {
            if (field == "" || field == undefined || value=="" || value == undefined)
            {
                return;
            }
            var data = businessProjectData.Obj;
            var queryUrl = data.url;
            var layerIndex = data.layerIndex == "" ? "0" : data.layerIndex;
            var find = L.esri.Tasks.find(queryUrl);
            find.layers(layerIndex)
                .text(value)
                .fields(field);
            find.params.sr = "";
            find.run(function (error, featureCollection, response) {
                if (error)
                {
                    //console.log(error.message);
                }
                else
                {
                    var length = response.results.length;
                    if (length > 0)
                    {
                        var type = response.results[0].geometryType;
                        var featureData = response.results[0];
                        var map = L.dci.app.pool.get('bmap');
                        var geo = map.unproject(map, featureData, type);
                        this.location(geo, type);
                        this._currentHightGeo = { geo: geo, type: type };

                        //除了以上定位还可以调用下面的方法
                        //var projectId = response.results[0].attributes["项目编码"];
                        //this.addHighLightLayer("XMBM", projectId);
                    }
                }
            }, this);
        },

        /**
        * 添加高亮图层
        *@method addHighLightLayer
        *@param fields{String}     查询字段
        *@param projectId{String}     字段匹配值
        */
        addHighLightLayer: function (fields, projectId) {
            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();

            //businessProjectData为全局变量
            var data = businessProjectData.Obj;
            if (data == null) {
                console.log("没有绑定默认定位图层");
            }
            else {
                var queryUrl = data.url;
                var layerIndex = data.layerIndex == "" ? "0" : data.layerIndex;
                var find = L.esri.Tasks.find(queryUrl);
                find.layers(layerIndex)
                    .text(projectId)
                    .fields(fields);
                find.params.sr = "";
                find.run(function (error, featureCollection, response) {
                    if (error) {
                        //console.log(error.message);
                    }
                    else {
                        var length = response.results.length;
                        if (length > 0) {
                            var type = response.results[0].geometryType;
                            var featureData = response.results[0];
                            var map = L.dci.app.pool.get('bmap');
                            var geo = map.unproject(map, featureData, type);
                            this.location(geo, type);
                            this._currentHightGeo = { geo: geo, type: type };
                        }
                    }
                }, this);
            }
        },

        /**
        * 定位
        *@method location
        *@param geo{Object}     空间几何数据
        *@param type{String}    类型
        */
        location: function (geo, type) {
            var map = L.dci.app.pool.get('bmap');
            var _map = map.getMap();
            var latlng = '';
            if (type == "esriGeometryPolygon") {
                latlng = geo.getBounds().getCenter();
                var style = {
                    color: '#ff5f00',
                    weight: 3,
                    opacity: 1,
                    fill: true,
                    fillColor: '#ffdc00',
                    fillOpacity: 0.5,
                    CANVAS: true
                };
                geo.setStyle(style);
            }
            else if (type == "esriGeometryPolyline") {
                var paths = geo.getLatLngs();
                latlng = paths[Math.round(paths.length / 2)];
                geo.setStyle(this._symbol.highlightPolylineSymbol);
            } else {
                latlng = L.latLng(geo.x, geo.y);
                geo.setStyle(this._symbol.highlightPointSymbol);
            }
            //待图加载完才定位，否则会导致地图丢失
            _map.whenReady(function () {
                map.getHighLightLayer().addLayer(geo);
                _map.fitBounds(geo);
            }, this);
            setTimeout(function() {
                _map.invalidateSize(false);
            }, 500);
        },

        /**
        * 设置图层透明度
        *@method setLayerOpacity
        *@param url{Object}     服务地址
        *@param opacity{String}    透明度值
        */
        setLayerOpacity: function (url, opacity) {
            this._map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer") {
                    var num = layer.options.id.indexOf("浏览版");
                    var urlResult = layer.url.indexOf(url);
                    if (num >= 0 && urlResult >= 0) {
                        layer.setOpacity(0);
                    }
                }
            }, this);
            layer.setOpacity(opacity);
        },

        /**
        * 
        *@method showMark
        */
        showMark:function() {
            if (this._currentHightGeo != null) {
                this.location(this._currentHightGeo.geo, this._currentHightGeo.type);
            }
        },

        /**
        * 
        *@method clearMark
        */
        clearMark:function() {
            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();
            this._currentHightGeo = null;
        }

    });
    return L.DCI.BMap.Map;
});