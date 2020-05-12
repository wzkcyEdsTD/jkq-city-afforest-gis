/**
*地图分屏类
*@module core
*@class DCI.MultiMap
*@constructor initialize
*@extends DCI.BaseObject
*/
define("core/multimap", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "core/map",
    "query/projectidentify",
], function (L) {
    L.DCI.MultiMap = L.DCI.BaseObject.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'MultiMap',
        /**
        *当前活跃Map对象
        *@property _activeMap
        *@type {Object}
        */
        _activeMap: null,
        /**
        *之前活跃Map对象
        *@property _oldActiveMap
        *@type {Object}
        */
        _oldActiveMap: null,

        /**
        *map的目的元素
        *@property _mapContainer
        *@type {Object}
        */
        _mapContainer: {
            containerOne: null,
            containerTow: null,
            containerThree: null,
            containerFour: null
        },

        /**
        *map对象集合
        *@property _objMap
        *@type {Object}
        */
        _objMap: {
            mapOne: null,
            mapTow: null,
            mapThree: null,
            mapFour: null
        },

        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            this._mapContainer.containerOne = 'map-main';
            this._mapContainer.containerTow = 'map-tow';
            this._mapContainer.containerThree = 'map-three';
            this._mapContainer.containerFour = 'map-four';          
            //用于标识状态
            this.preSplit = 'one';

            this.mapMoveOne = false;
            this.mapMoveTow = false;
            this.mapMoveThree = false;
            this.mapMoveFour = false;

            /*当前活跃地图窗口改变事件*/
            this._activeMapChange = $.Event('activeMapChange.fy.split');

            this._objMap.mapOne = this._getNewMap({ obj: 'map', id: 'map', container: 'map-main' });
            this._activeMap = this._objMap.mapOne;
            this._oldActiveMap = this._objMap.mapOne;
        },

        /**
        *生成地图对象
        *@method _getNewMap
        *@param options {Object} 配置对象
        *@return {Object} 返回Map对象
        *@private
        */
        _getNewMap: function (options) {
            if (options.id == "map") {
                options.obj = new L.DCI.Map({
                    id: options.id,
                    navigationControl: Project_ParamConfig.controls.navigationControl,
                    defaultExtentControl: Project_ParamConfig.controls.defaultExtentControl,
                    miniMapControl: Project_ParamConfig.controls.miniMapControl,
                    scalebarControl: Project_ParamConfig.controls.scalebarControl,
                    layerSwitchControl: Project_ParamConfig.controls.layerSwitchControl,
                    loadingControl: Project_ParamConfig.controls.loadingControl,
                    panControl: Project_ParamConfig.controls.panControl,
                    contextmenu: Project_ParamConfig.controls.contextmenu,
                    fullscreenControl: Project_ParamConfig.controls.fullscreenControl,
                    layerTabControl: Project_ParamConfig.controls.layerTabControl,
                    //timesliderControl: Project_ParamConfig.controls.timesliderControl,

                    baseCrs: Project_ParamConfig.crs,
                    baseLayer: Project_ParamConfig.baseLayer,//底图
                    themLayers: Project_ParamConfig.themLayers,//专题图层
                    changeLayers: Project_ParamConfig.changeLayers,//切换图层
                    timeLayers: Project_ParamConfig.timeLayers,//时间轴地图
                    container: options.container,
                    tileSize: Project_ParamConfig.baseLayer.tileSize || 512,
                    minZoom: Project_ParamConfig.baseLayer.minZoom || 0,
                    maxZoom: Project_ParamConfig.baseLayer.maxZoom || 10,
                    zoom: Project_ParamConfig.baseLayer.zoom || 0
                });
            } else {
                options.obj = new L.DCI.Map({
                    id: options.id,
                    navigationControl: false,
                    defaultExtentControl: false,
                    miniMapControl: false,
                    scalebarControl: false,
                    //layerSwitchControl: false,
					layerSwitchControl: Project_ParamConfig.controls.layerSwitchControl,
                    loadingControl: false,
                    panControl: false,
                    layerTabControl: true,
                    fullscreenControl:false,
                    contextmenu: Project_ParamConfig.controls.contextmenu,
                    timesliderControl: Project_ParamConfig.controls.timesliderControl,
					
                    baseCrs: Project_ParamConfig.crs,
                    baseLayer: Project_ParamConfig.baseLayer,//底图
                    themLayers: Project_ParamConfig.themLayers,//专题图层
                    changeLayers: Project_ParamConfig.changeLayers,//切换图层
                    timeLayers: Project_ParamConfig.timeLayers,//时间轴地图
                    container: options.container,
                    tileSize: Project_ParamConfig.baseLayer.tileSize || 512,
                    minZoom: Project_ParamConfig.baseLayer.minZoom || 0,
                    maxZoom: Project_ParamConfig.baseLayer.maxZoom || 10,
                    zoom: Project_ParamConfig.baseLayer.zoom || 0
                });
            }
            L.DCI.App.pool.add(options.obj);

            $("#main-loading").css("display", "none");
            return options.obj;
        },
        /**
        *返回全部map对象
        *@method getMapGroup
        *@return {Object} 返回Map对象集合
        */
        getMapGroup: function () {
            var obj = null;
            var objMapGroup = [];
            for (obj in this._objMap) {
                if (this._objMap[obj]) {
                    objMapGroup.push(this._objMap[obj]);
                }
            }
            return objMapGroup;
        },
        /**
        *获取当前激活Map对象
        *@method getActiveMap
        *@return {Object} 返回Map对象
        */
        getActiveMap: function () {
            return this._activeMap;
        },

        hiddenTool: function () {
            var fenxi = $('.dropdown-toggle');
            for (var i = 0 ; i < fenxi.length; i++) {
                var tool = fenxi[i];
                if (tool.textContent == "分析") {
                    $(tool).css("display", "none");
                }
            };
            $('.feature').css("display", "none");
            //点击目录树
            if ($('#mapset-101')[0].className.indexOf("select") == -1) {
                $('#check-101')[0].click();
            }
            $('#li_PojectIdentify').addClass("hid");
        },

        showTool: function () {
            var fenxi = $('.dropdown-toggle');
            for (var i = 0 ; i < fenxi.length; i++) {
                var tool = fenxi[i];
                if (tool.textContent == "分析") {
                    $(tool).css("display", "block")
                }
            };
            $('.feature').css("display", "block"); 
            $('#li_PojectIdentify').removeClass("hid")
        },
               

        /**
        *分屏
        *@method splitMap
        *@param splitNum {Number} 分屏数，值为1~4之间
        */
        splitMap: function (splitNum) {

            var hid = false;

            this._activeMap = this._objMap.mapOne;
            var $map_panel = $('#centerpanel');

            if (splitNum != "splitOne") {
                var projectIdentify;
                if (L.dci.app.pool.has("projectIdentify") == false) {
                    var mapGroup = L.DCI.App.pool.get("MultiMap");
                    var map = mapGroup.getActiveMap();
                    projectIdentify = new L.DCI.ProjectIdentify(map);
                    L.dci.app.pool.add(projectIdentify);
                } else {
                    projectIdentify = L.dci.app.pool.get("projectIdentify");
                }
                projectIdentify.deactivate();
            }

            switch (splitNum) {
                case 'splitOne':
                    //显示分析工具集
                    hid = false;
                    if (this.preSplit == "one") return;
                    $map_panel.removeClass('map_tow map_three map_four');
                    $($map_panel[0].childNodes[0]).removeClass("map_active");
                    this.preSplit = "one";
                    this._clearMap("splitOne");
                    this._activeMap = this._objMap.mapOne;
                    this._oldActiveMap = this._objMap.mapOne;
                    //返回第一屏恢复工具可用状态
                    this.enabledTool();
                    break;
                case 'splitTow':
                    if (this.preSplit == "tow") return;
                    $map_panel.removeClass('map_three map_four').addClass('map_tow');
                    this.preSplit = "tow";
                    this._crearMapObj('tow');
                    this._clearMap("splitTow");
                    //隐藏分析工具集
                    hid = true;
                    //返回第一屏恢复工具可用状态
                    this.enabledTool();
                    break;
                case 'splitThree':
                    if (this.preSplit == "three") return;
                    $map_panel.removeClass('map_tow map_four').addClass('map_three');
                    this.preSplit = "three";
                    this._crearMapObj('three');
                    this._clearMap("splitTree");
                    //隐藏分析工具集
                    hid = true;
                    //返回第一屏恢复工具可用状态
                    this.enabledTool();
                    break;
                case 'splitFour':
                    if (this.preSplit == "four") return;
                    $map_panel.removeClass('map_tow map_three').addClass('map_four');
                    this.preSplit = "four";
                    this._crearMapObj('four');
                    this._clearMap("splitFour");
                    //隐藏分析工具集
                    hid = true;
                    //返回第一屏恢复工具可用状态
                    this.enabledTool();
                    break;
            }
            this._splitControlsView(splitNum);
            this._invalidateSize();

            //if (hid) {
            //    this.hiddenTool();
            //} else {
            //    this.showTool();
            //}

            if (splitNum == "splitOne") {
                $(document).trigger(this._activeMapChange, this._activeMap);
                return;
            }
            this._addclickEvent();
        },
        /**
        *分屏状态，某些控件不许显示
        *@method _splitControlsView
        *@param type {String} 分屏类型
        *@private
        */
        _splitControlsView: function (type) {
            var dcimap = L.DCI.App.pool.get("map");
            if (type == 'splitOne') {
                dcimap.controls.legend.shower();
                //dcimap.controls.miniMap.shower();
            } else {
                dcimap.controls.legend.hidden();
                //dcimap.controls.miniMap.hidden();
            }
        },
        /**
        *实例化map对象
        *@method _crearMapObj
        *@param splitNun {String} 分屏类型
        *@private
        */
        _crearMapObj: function (splitNun) {
            var tow = false, three = false, four = false;
            switch (splitNun) {
                case 'tow':
                    tow = true;
                    break;
                case 'three':
                    tow = true;
                    three = true;
                    break;
                case 'four':
                    tow = true;
                    three = true;
                    four = true;
                    break;
            }
            if (!this._objMap.mapTow && tow) { this._objMap.mapTow = this._getNewMap({ obj: 'mapTow', id: 'mapTow', container: this._mapContainer.containerTow, center: this._objMap.mapOne.map.getCenter(), zoom: this._objMap.mapOne.map.getZoom() }); }
            if (!this._objMap.mapThree && three) { this._objMap.mapThree = this._getNewMap({ obj: 'mapThree', id: 'mapThree', container: this._mapContainer.containerThree, center: this._objMap.mapOne.map.getCenter(), zoom: this._objMap.mapOne.map.getZoom() }) }
            if (!this._objMap.mapFour && four) { this._objMap.mapFour = this._getNewMap({ obj: 'mapFour', id: 'mapFour', container: this._mapContainer.containerFour, center: this._objMap.mapOne.map.getCenter(), zoom: this._objMap.mapOne.map.getZoom() }) }
        },

        /**
        *添加事件
        *@method _addclickEvent
        *@private
        */
        _addclickEvent: function () {
            if (this._objMap.mapOne) { this._objMap.mapOne.map.on('mouseover', this._mouseoverEventOne, this); }
            if (this._objMap.mapTow) { this._objMap.mapTow.map.on('mouseover', this._mouseoverEventTow, this); }
            if (this._objMap.mapThree) { this._objMap.mapThree.map.on('mouseover', this._mouseoverEventThree, this);}
            if (this._objMap.mapFour) { this._objMap.mapFour.map.on('mouseover', this._mouseoverEventFour, this);}
            if (this._objMap.mapOne) { this._objMap.mapOne.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objMap.mapTow) { this._objMap.mapTow.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objMap.mapThree) { this._objMap.mapThree.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objMap.mapFour) { this._objMap.mapFour.map.on('mouseout', this._mouseoutEvent, this); }

            if (this._objMap.mapOne && !this.clickOne) { this._objMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true; }
            if (this._objMap.mapTow && !this.clickTow) { this._objMap.mapTow.map.on('click', this._clickEventTow, this); this.clickTow = true; }
            if (this._objMap.mapThree && !this.clickTree) { this._objMap.mapThree.map.on('click', this._clickEventThree, this); this.clickTree = true; }
            if (this._objMap.mapFour && !this.clickFour) { this._objMap.mapFour.map.on('click', this._clickEventFour, this); this.clickFour = true; }

            //初始化 触发click
            this._objMap.mapOne.map.fireEvent('click');
        },

        /**
        *特定地图绑定事件
        *@method _readdclickEvent
        *@private
        */
        _readdclickEvent: function (map) {

            switch (map.options.id) {
                case 'map':
                    this.clickOne = false;
                    break;
                case 'mapTow':
                    this.clickTow = false;
                    break;
                case 'mapThree':
                    this.clickTree = false;
                    break;
                case 'mapFour':
                    this.clickFour = false;
                    break;
                default:
                    break;

            };
            if (this._objMap.mapOne && !this.clickOne && (this.preSplit !="one"))
            {
                this._objMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true;
            }
            if (this._objMap.mapTow && !this.clickTow)
            {
                this._objMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true;
                this._objMap.mapTow.map.on('click', this._clickEventTow, this); this.clickTow = true;
            }
            if (this._objMap.mapThree && !this.clickTree)
            {
                this._objMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true;
                this._objMap.mapTow.map.on('click', this._clickEventTow, this); this.clickTow = true;
                this._objMap.mapThree.map.on('click', this._clickEventThree, this); this.clickTree = true;
            }
            if (this._objMap.mapFour && !this.clickFour)
            {
                this._objMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true;
                this._objMap.mapTow.map.on('click', this._clickEventTow, this); this.clickTow = true;
                this._objMap.mapThree.map.on('click', this._clickEventThree, this); this.clickTree = true;
                this._objMap.mapFour.map.on('click', this._clickEventFour, this); this.clickFour = true;
            }

        },


        /**
        *鼠标移进第一个分屏
        *@method _mouseoverEventOne
        *@private
        */
        _mouseoverEventOne: function () {
            if (this.mapMoveOne) { return; }
            this._clearMove();
            this._objMap.mapOne.map.on('moveend', this._moveEndOne, this);
            //初始化触发moveend
            this._objMap.mapOne.map.fireEvent('moveend');

            this.mapMoveOne = true;
            this._activeMap = this._objMap.mapOne;
        },

        /**
        *鼠标移进第二个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventTow: function () {
            if (this.mapMoveTow) { return; }
            this._clearMove();
            this._objMap.mapTow.map.on('moveend', this._moveEndTow, this);

            this.mapMoveTow = true;
            this._activeMap = this._objMap.mapTow;
        },

        /**
        *鼠标移进第三个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventThree: function () {
            if (this.mapMoveThree) { return; }
            this._clearMove();
            this._objMap.mapThree.map.on('moveend', this._moveEndThree, this);

            this.mapMoveThree = true;
            this._activeMap = this._objMap.mapThree;
        },
        /**
        *鼠标移进第四个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventFour: function () {
            if (this.mapMoveFour) { return; }
            this._clearMove();
            this._objMap.mapFour.map.on('moveend', this._moveEndFour, this);

            this.mapMoveFour = true;
            this._activeMap = this._objMap.mapFour;
        },
        /**
        *鼠标移出屏幕
        *@method _mouseoutEvent
        *@private
        */
        _mouseoutEvent: function () {
            this._activeMap = this._oldActiveMap;
        },
        /**
        *鼠标移出分屏
        *@method _invalidateSize
        *@private
        */
        _invalidateSize: function () {
            if (this._objMap.mapOne) { this._objMap.mapOne.map.invalidateSize({ animate: false }); }
            if (this._objMap.mapTow) { this._objMap.mapTow.map.invalidateSize({ animate: false }); }
            if (this._objMap.mapThree) { this._objMap.mapThree.map.invalidateSize({ animate: false });}
            if (this._objMap.mapFour) { this._objMap.mapFour.map.invalidateSize({ animate: false }); }
        },
        /**
        *鼠标点击第一个分屏
        *@method _clickEventOne
        *@private
        */
        _clickEventOne: function () {
            //返回第一屏恢复工具可用状态
            this.enabledTool();

            this._activeMap = this._objMap.mapOne;
            this._oldActiveMap = this._objMap.mapOne;
            this._addMapLable(this._mapContainer.containerOne);

            //触发自定义事件 标识当前活跃地图窗口改变
            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第二个分屏
        *@method _clickEventTow
        *@private
        */
        _clickEventTow: function () {
            //非第一屏情况下禁用部分工具
            this.disabledTool();

            this._activeMap = this._objMap.mapTow;
            this._oldActiveMap = this._objMap.mapTow;
            this._addMapLable(this._mapContainer.containerTow);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第三个分屏
        *@method _clickEventThree
        *@private
        */
        _clickEventThree: function () {
            //非第一屏情况下禁用部分工具
            this.disabledTool();

            this._activeMap = this._objMap.mapThree;
            this._oldActiveMap = this._objMap.mapThree;
            this._addMapLable(this._mapContainer.containerThree);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第四个分屏
        *@method _clickEventFour
        *@private
        */
        _clickEventFour: function () {
            //非第一屏情况下禁用部分工具
            this.disabledTool();

            this._activeMap = this._objMap.mapFour;
            this._oldActiveMap = this._objMap.mapFour;
            this._addMapLable(this._mapContainer.containerFour);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },

        /**
        *返回第一屏恢复工具可用状态
        *@method enabledTool
        *@private
        */
        enabledTool: function () {
            //工具栏上的按钮事件
            $("#toolbar").unbind();
            $('#toolbar > div > a').unbind();
            var _this = L.dci.app.pool.get("toolbar");
            $('#toolbar').on('click', 'a', { obj: _this }, _this.tool);
            var toolObjs = $('#toolbar a');
            for (var i = 0; i < toolObjs.length; i++) {
                $(toolObjs[i]).removeClass("disabled");
            }
        },
        /**
        *非第一屏情况下禁用部分工具
        *@method disabledTool
        *@private
        */
        disabledTool: function () {
            if ($('#toolbar .hasDropMenu > a').hasClass("active")) {
                $('#toolbar .hasDropMenu > a').removeClass("active");   //关掉分析下拉框
            }
            $('#print_model_close').click();   //关掉图片输出
            $('#djcad #close').click();   //关掉数据叠加
            //关掉除分屏外所有打开的工具箱
            var toolboxObjs = $(".toolbox");
            for (var j = 0; j < toolboxObjs.length; j++) {
                if ($($(toolboxObjs[j]).find("span")[0]).html() != "分屏") {
                    $(toolboxObjs[j]).find(".close_toolbox").click();
                }
            }
            //工具栏上的按钮事件
            $("#toolbar").unbind();
            var _this = L.dci.app.pool.get("toolbar");
            var toolObjs = $('#toolbar > div > a');
            for (var i = 0; i < toolObjs.length; i++) {
                var toolName = $(toolObjs[i]).find("span")[1].innerHTML;
                if (toolName != "" && toolName != "分屏" && toolName != "空间查询") {
                    if (!$(toolObjs[i]).hasClass("disabled")) {
                        $(toolObjs[i]).addClass("disabled");
                    }
                } else {
                    $(toolObjs[i]).on('click', { obj: _this }, _this.tool);
                }
            }
        },
        /**
        *清除mvoe事件监听
        *@method _clearMove
        *@private
        */
        _clearMove: function () {
            if (this.mapMoveOne) { this._objMap.mapOne.map.off('moveend', this._moveEndOne, this); this.mapMoveOne = false; }
            if (this.mapMoveTow) { this._objMap.mapTow.map.off('moveend', this._moveEndTow, this); this.mapMoveTow = false; }
            if (this.mapMoveThree) { this._objMap.mapThree.map.off('moveend', this._moveEndThree, this); this.mapMoveThree = false; }
            if (this.mapMoveFour) { this._objMap.mapFour.map.off('moveend', this._moveEndFour, this); this.mapMoveFour = false; }
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndOne
        *@private
        */
        _moveEndOne: function () {
            var conterPoin = this._objMap.mapOne.map.getCenter();
            var mapZoom = this._objMap.mapOne.map.getZoom();
            this._mapSerView({ one: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndTow
        *@private
        */
        _moveEndTow: function () {
            var conterPoin = this._objMap.mapTow.map.getCenter();
            var mapZoom = this._objMap.mapTow.map.getZoom();
            this._mapSerView({ tow: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndThree
        *@private
        */
        _moveEndThree: function () {
            var conterPoin = this._objMap.mapThree.map.getCenter();
            var mapZoom = this._objMap.mapThree.map.getZoom();
            this._mapSerView({ three: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndFour
        *@private
        */
        _moveEndFour: function () {
            var conterPoin = this._objMap.mapFour.map.getCenter();
            var mapZoom = this._objMap.mapFour.map.getZoom();
            this._mapSerView({ four: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *设置map的bounds
        *@method _mapSerView
        *@private
        */
        _mapSerView: function (options) {
            var _options = { one: true, tow: true, three: true, four: true };
            $.extend(_options, options);

            if (this._objMap.mapOne && _options.one) {
                this._objMap.mapOne.map.setView(_options.conter, _options.zoom);
            };
            if (this._objMap.mapTow && _options.tow) {
                this._objMap.mapTow.map.setView(_options.conter, _options.zoom);
            };
            if (this._objMap.mapThree && _options.three) {
                this._objMap.mapThree.map.setView(_options.conter, _options.zoom);
            };
            if (this._objMap.mapFour && _options.four) {
                this._objMap.mapFour.map.setView(_options.conter, _options.zoom);
            };
        },
        /**
        *清除之前分屏的状态
        *@method _clearMap
        *@private
        */
        _clearMap: function (split) {
            switch (split) {
                case "splitOne":
                    /*移除事件*/
                    if (this.mapMoveOne) {
                        this._objMap.mapOne.map.off('moveend', this._moveEndOne, this);
                        this.mapMoveOne = false;
                    }
                    this._objMap.mapOne.map.off('click', this._clickEventOne, this);
                    this.clickOne = false;
                    if (this._objMap.mapTow) {
                        this.mapMoveTow = false;
                        this.clickTow = false;
                        this.clearLayerStatus(this._objMap.mapTow);
                        this._objMap.mapTow.map.clearAllEventListeners();
                        this._objMap.mapTow.map.remove();
                        this._objMap.mapTow.map = null;
                        this._objMap.mapTow = null;
                        L.DCI.App.pool.remove('mapTow');
                        L.DCI.App.pool.get("layerTab")._tab[1] = [];
                    }
                    if (this._objMap.mapThree) {
                        this.mapMoveThree = false;
                        this.clickTree = false;
                        this.clearLayerStatus(this._objMap.mapThree);
                        this._objMap.mapThree.map.clearAllEventListeners();
                        this._objMap.mapThree.map.remove();
                        this._objMap.mapThree.map = null;
                        this._objMap.mapThree = null;
                        L.DCI.App.pool.remove('mapThree');
                        L.DCI.App.pool.get("layerTab")._tab[2] = [];
                    }
                    if (this._objMap.mapFour) {
                        this.mapMoveFour = false;
                        this.clickFour = false;
                        this.clearLayerStatus(this._objMap.mapFour);
                        this._objMap.mapFour.map.clearAllEventListeners();
                        this._objMap.mapFour.map.remove();
                        this._objMap.mapFour.map = null;
                        this._objMap.mapFour = null;
                        L.DCI.App.pool.remove('mapFour');
                        L.DCI.App.pool.get("layerTab")._tab[3] = [];
                    }
                    break;
                case "splitTow":
                    if (this._objMap.mapThree) {
                        this.mapMoveThree = false;
                        this.clickTree = false;
                        this.clearLayerStatus(this._objMap.mapThree);
                        this._objMap.mapThree.map.clearAllEventListeners();
                        this._objMap.mapThree.map.remove();
                        this._objMap.mapThree.map = null;
                        this._objMap.mapThree = null;
                        L.DCI.App.pool.remove('mapThree');
                        L.DCI.App.pool.get("layerTab")._tab[2] = [];
                    }
                    if (this._objMap.mapFour) {
                        this.mapMoveFour = false;
                        this.clickFour = false;
                        this.clearLayerStatus(this._objMap.mapFour);
                        this._objMap.mapFour.map.clearAllEventListeners();
                        this._objMap.mapFour.map.remove();
                        this._objMap.mapFour.map = null;
                        this._objMap.mapFour = null;
                        L.DCI.App.pool.remove('mapFour');
                        L.DCI.App.pool.get("layerTab")._tab[3] = [];
                    }
                    break;
                case "splitTree":
                    if (this._objMap.mapFour) {
                        this.mapMoveFour = false;
                        this.clickFour = false;
                        this.clearLayerStatus(this._objMap.mapFour);
                        this._objMap.mapFour.map.clearAllEventListeners();
                        this._objMap.mapFour.map.remove();
                        this._objMap.mapFour.map = null;
                        this._objMap.mapFour = null;
                        L.DCI.App.pool.remove('mapFour');
                        L.DCI.App.pool.get("layerTab")._tab[3] = [];
                    }
                    break;
            }
        },
        /**
        *添加标识
        *@method _addMapLable
        *@private
        */
        _addMapLable: function (mapContainer) {
            var mapContainer = document.getElementById(mapContainer);
            var $mapContainer = $(mapContainer);
            $mapContainer.parent().find('.map_active').removeClass('map_active');
            $mapContainer.addClass("map_active");
        },
        getType: function () {
            return "DCI.MultiMap";
        },
        /**
        *当分屏切换时，将关掉屏幕中加载的图层状态改变（若主屏中也添加了该图层则不改变状态）
        *@method clearLayerStatus
        *@private
        */
        clearLayerStatus: function (targetMap) {
            var mapOneLayers = this._objMap.mapOne.getLayers();
            var layers = targetMap.getLayers();
            for(var i in layers){
                var layer = layers[i];
                var isSame = false;
                if (layer.options && layer.options.id && layer.options.id != "baseLayer") {
                    if (mapOneLayers && mapOneLayers.length > 0) {
                        for (var j in mapOneLayers) {
                            var mapOneLayer = mapOneLayers[j];
                            if (layer.options && layer.options.id && mapOneLayer.options && mapOneLayer.options.id && layer.options.id == mapOneLayer.options.id) {
                                isSame = true;
                            }
                        }
                        //当二屏、三屏、四屛有和一屏一样的图层时，当恢复时不更改图层状态
                        if (!isSame) {
                            this.changeLayerStatus(layer);
                        }
                    }
                    else {
                        this.changeLayerStatus(layer);
                    }
                }
            }
        },
        changeLayerStatus: function (layer) {
            var id =layer.id;
            var menuId=layer.options.id.substr(layer.options.id.indexOf("-")+1,layer.options.id.length);
            L.DCI.App.leftPanel._setMenuStyleById(menuId, false);
        }
    });
    return L.DCI.MultiMap;
});