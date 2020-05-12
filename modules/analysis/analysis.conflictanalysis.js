/**
*冲突分析类
*@module modules.analysis
*@class DCI.ConflictAnalysis
*@constructor initialize
*@extends Class
*/
define("analysis/conflictanalysis", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "library/echarts",
    "analysis/addcad",
    "analysis/gpHandler",
    "util/txls"
], function (L) {
    L.DCI.ConflictAnalysis = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'ConflictAnalysis',
        /**
        *整体布局
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="ctfx-content">'
                    + '<div class="ctfx-nav-wrap"></div>'
                    + '<div class="ctfx-list-wrap">'
                        + '<div class="top">'
                        + '</div>'
                        + '<div class="content"></div>'
                        + '<div class="bottom"></div>'
                    + '</div>'
                    + '<div class="ctfx-detail-wrap">'
                        + '<div class="title">'
                            + '<span class="turnback icon-return"></span>'
                            + '<div class="titlecontent"></div>'
                        + '</div>'
                        + '<div class="content"></div>'
                    + '</div>'
                + '</div>'
                + '<div class="ctfx-loadflash">'
                    + '<div class="loadingFlash"><span class="icon-loading"></span>'
                    + '</div>'
                    + '<div class="loadingText">服务器正在处理请求，预计需要2~3分钟，请耐心等待...</div>'
                + '</div>',
        /**
        *Map对象
        *@property map
        *@type {Object}
        *@private
        */
        map: null,
        /**
        *底图配置列表中的顺序，控规：0；规划设计条件：1；用地红线：2；工程红线：3
        *@property lyrIndex
        *@type {number}
        *@private
        */
        lyrIndex: 1,
        /**
        *tabs1页面数据
        *@property tabsData1
        *@type {Object}
        *@private
        */
        tabsData1: null,       //tabs1页面数据
        /**
        *查询容差
        *@property _tolerance
        *@type {Number}
        *@private
        */
        _tolerance: 0,
        /**
        *显示结果
        *@property _feature
        *@type {Array}
        *@private
        */
        _feature: [],
        /**
        *查询范围
        *@property in_region
        *@type {Object}
        *@private
        */
        in_region: {
            "spatialReference": {
                "wkid": 0,
                "latestWkid": 0
            },
            "geometryType": "",
            "features": [
                {
                    "geometry": {
                        "rings": [
                            []
                        ],
                        "spatialReference": {
                            "wkid": 0,
                            "latest": 0
                        }
                    }
                }
            ]
        },
        /**
        *总共有多少页数据
        *@property pageNum
        *@type {Number}
        *@private
        */
        pageNum: 0,
        /**
        *当前显示页码
        *@property currentPage
        *@type {Number}
        *@private
        */
        currentPage: 1,
        /**
        *每页最多显示内容个数
        *@property maxShowContentNum
        *@type {Number}
        *@private
        */
        maxShowContentNum: 10,
        /**
        *过渡结果数据
        *@property TableData0
        *@type {Object}
        *@private
        */
        TableData0: {},
        /**
        *列名称数组
        *@property columnNameArray
        *@type {Object}
        *@private
        */
        columnNameArray: [],
        /**
        *判断是项目列表或项目详情内容（false为项目列表，反之为项目详情）
        *@property isDetail
        *@type {Boolean}
        *@private
        */
        isDetail: false,
        /**
        *参考对象高亮图层
        *@property referenceHightLight
        *@type {Array}
        *@private
        */
        referenceHightLight: [],
        /**
        *高亮全部存疑地块的请求结果
        *@property allHighLightResult
        *@type {Array}
        *@private
        */
        allHighLightResult: [],

        _currentSelectedObj: null,
        /**
        *当前结果的参考对象索引
        *@property referenceIndex
        *@type {Int}
        *@private
        */
        referenceIndex: 0,
        /**
        *当前结果的分析对象索引
        *@property analysisIndex
        *@type {Int}
        *@private
        */
        analysisIndex: 1,
        /**
        *当前加载的地图服务
        *@property baseLyrs
        *@type {Array}
        *@private
        */
        baseLyrs: [],
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {

            //绘图工具
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //清除地图其他操作
            this.map.clear();

            this._polygon = new L.DCI.DrawPolygons(this.map.map);

            //控规
            var layer_kg = Project_ParamConfig.conflictLayers[0];
            this.lyr_kg = L.esri.dynamicMapLayer(layer_kg.url, { id: layer_kg.name, layers: [layer_kg.layerIndex] });
            //规划设计条件
            var layer_ghtj = Project_ParamConfig.conflictLayers[1];
            this.lyr_ghtj = L.esri.dynamicMapLayer(layer_ghtj.url, { id: layer_ghtj.name, layers: [layer_ghtj.layerIndex] });
            //用地红线
            var layer_ydhx = Project_ParamConfig.conflictLayers[2];
            this.lyr_ydhx = L.esri.dynamicMapLayer(layer_ydhx.url, { id: layer_ydhx.name, layers: [layer_ydhx.layerIndex] });
            //工程红线
            var layer_gchx = Project_ParamConfig.conflictLayers[3];
            this.lyr_gchx = L.esri.dynamicMapLayer(layer_gchx.url, { id: layer_gchx.name, layers: [layer_gchx.layerIndex] });

            this.addService(this.lyr_ghtj);

            var _this = this;
            L.DCI.App.pool.get('LeftContentPanel').show(this,
                function () {
                    _this.getTabsData1();
                });
            $(".leftcontentpanel-title>span:first").html("冲突分析");         //标题

            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.tempHtml);

            //滚动条
            $(".ctfx-content").mCustomScrollbar({ theme: "minimal-dark" });

            //tab
            this.setTabsHTML();

            //tab区域切换按钮点击事件
            $(".ctfx-nav-btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.clickTabBtn(e); });
            //自定义区域---点击事件
            $("#QYHZ").on('click', { context: this }, function (e) { e.data.context.clickBtnEvent(e); });
            //范围线上传---点击事件
            $(".ctfx-nav-collapse-wrap #RNW-FWXSC2>.btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });
            $("#FWXSC").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });

        },

        /**
        *插入Tabs整体布局
        *@method setTabsHTML
        *@private
        */
        setTabsHTML: function () {
            //tab页整体布局
            var tabHtml = '<div class="ctfx-nav-btn-wrap">'
                            + ' <div class="object-option">'
                                + '<p style="font-size:14px; position:absolute;top:5px; left:0px;">参考对象：</p>'
                                + '<div class="ctfx-op referenceObj" >'
                                    + '<div class="selected-object" ><p id="referenceObj" data-index="0">控规</p></div>'
                                    + '<div class="object-togg"><span class="icon-triangle"></span></div>'
                                    + '<ul class="ctfx-op-list hide">'
                                        + '<li class="ctfx-op-list-item" data-index="0"><p>控规</p></li>'
                                        + '<li class="ctfx-op-list-item" data-index="1"><p>规划设计条件</p></li>'
                                        + '<li class="ctfx-op-list-item" data-index="2"><p>用地红线</p></li>'
                                    + '</ul>'
                                + '</div>'
                                + '<p style="font-size:14px; position:absolute;top:5px; left:230px;">分析对象：</p>'
                                + '<div class="ctfx-op analysisObj" >'
                                    + '<div class="selected-object" ><p id="analysisObj" data-index="1">规划设计条件</p></div>'
                                    + '<div class="object-togg"><span class="icon-triangle"></span></div>'
                                    + '<ul class="ctfx-op-list hide">'
                                        + '<li class="ctfx-op-list-item" data-index="1"><p>规划设计条件</p></li>'
                                        + '<li class="ctfx-op-list-item" data-index="2"><p>用地红线</p></li>'
                                        + '<li class="ctfx-op-list-item" data-index="3"><p>工程红线</p></li>'
                                    + '</ul>'
                                + '</div>'
                            + '</div>'

                            + '<p style="font-size:14px; width: 80px; float: left; margin-top: 5px;">范围选择：</p>'
                            + '<button class="btn" href="#RNW-XZQY1" data-toggle="wz-collapse" aria-controls="RNW-XZQY1" aria-expanded="true">行政区域</button>'
                            + '<button class="btn"  data-toggle="wz-collapse" id="QYHZ">区域绘制</button>'
                            + '<button class="btn" id="FWXSC" href="#RNW-FWXSC2" data-toggle="wz-collapse" aria-controls="RNW-FWXSC2" aria-expanded="true">范围线上传</button>'
                            + '<button class="btn" id="FWXZ" data-toggle="wz-collapse">地图选择</button>'
                            + '<span class="btn" id="startAnalysis">分&nbsp;&nbsp;析</span>'
                        + '</div>'
                        + '<div class="ctfx-nav-collapse-wrap"></div>';

            //tab1布局
            var tabHtml1 = '<div class="wz-collapse" id="RNW-XZQY1">'
                            + '<div class="district">'
                                + '<ul class="district-content"></ul>'
                            + '</div>'
                            + '<div class="town">'
                                + '<ul class="town-content"></ul>'
                            + '</div>'
                            + '<div class="rhombuss"></div>'
                        + '</div>';

            //tab2布局
            var tabHtml2 = '<div class="wz-collapse" id="RNW-ZDYQY2">'
                            + '<div class="btn-wrap">'
                                + '<button class="btn">点选</button>'
                                + '<button class="btn">多边形</button>'
                            + '</div>'
                            + '<div class="rhombuss"></div>'
                        + '</div>';

            //tab3布局
            var tabHtml3 = '<div class="wz-collapse" id="RNW-FWXSC2">'
                            + '<div class="btn-wrap">'
                                + '<button class="btn">添加CAD</button>'
                                + '<button class="btn">添加SHP</button>'
                            + '</div>'
                            + '<div class="rhombuss"></div>'
                          + '</div>';

            //插入tab
            $(".ctfx-nav-wrap").html(tabHtml);
            $(".ctfx-nav-collapse-wrap").append(tabHtml1);
            //$(".ctfx-nav-collapse-wrap").append(tabHtml2);
            $(".ctfx-nav-collapse-wrap").append(tabHtml3);
            //默认选择“控规”和“规划设计条件”
            Project_ParamConfig.ctfxConfig.inputParams.A_JYKG_Layer = Project_ParamConfig.conflictLayers[0].layerPath;
            Project_ParamConfig.ctfxConfig.inputParams.GH_DDT_Layer = Project_ParamConfig.conflictLayers[1].layerPath;

            $(".ctfx-op").bind('click', function () {
                var op_list = this.children[2];
                if (op_list.className.indexOf('hide') > -1) {
                    op_list.className = op_list.className.replace(/(^|\s)hide(\s|$)/, '');
                } else {
                    op_list.className += ' hide';
                }
            });
            var _this = this;
            //参考对象下拉列表点击事件
            $(".referenceObj .ctfx-op-list-item").bind('click', function () {
                var a = $(this).find("p").html();
                var index = $(this).attr("data-index");
                $("#referenceObj").html(a);
                $("#referenceObj").attr("data-index", index);

                switch (a) {
                    case '控规':
                        Project_ParamConfig.ctfxConfig.inputParams.A_JYKG_Layer = Project_ParamConfig.conflictLayers[0].layerPath;
                        break;
                    case '规划设计条件':
                        Project_ParamConfig.ctfxConfig.inputParams.A_JYKG_Layer = Project_ParamConfig.conflictLayers[1].layerPath;
                        break;
                    case '用地红线':
                        Project_ParamConfig.ctfxConfig.inputParams.A_JYKG_Layer = Project_ParamConfig.conflictLayers[2].layerPath;
                        break;
                    default:
                        break;
                }

                var objs = $(".analysisObj .ctfx-op-list-item");
                for (var i = 0; i < objs.length; i++) {
                    if (parseInt($(objs[i]).attr("data-index")) > parseInt($(this).attr("data-index"))) {
                        $(objs[i]).css("display", "block");
                    } else {
                        $(objs[i]).css("display", "none");
                    }
                    if (parseInt($("#analysisObj").attr("data-index")) <= parseInt($(this).attr("data-index"))) {
                        var analysisIndex = parseInt($(this).attr("data-index"));
                        var analysisObj = $(objs[analysisIndex]).find("p").html()
                        $("#analysisObj").html(analysisObj);
                        $("#analysisObj").attr("data-index", analysisIndex + 1);
                        _this.switchService(analysisObj);
                    }
                }
            });
            //分析对象下拉列表点击事件
            $(".analysisObj .ctfx-op-list-item").bind('click', function () {
                var a = $(this).find("p").html();
                var index = $(this).attr("data-index");
                $("#analysisObj").html(a);
                $("#analysisObj").attr("data-index", index);

                var objs = $(".referenceObj .ctfx-op-list-item");
                for (var i = 0; i < objs.length; i++) {
                    if (parseInt($(objs[i]).attr("data-index")) < parseInt($(this).attr("data-index"))) {
                        $(objs[i]).css("display", "block");
                    } else {
                        $(objs[i]).css("display", "none");
                    }
                    if (parseInt($("#referenceObj").attr("data-index")) >= parseInt($(this).attr("data-index"))) {
                        var referenceIndex = parseInt($(this).attr("data-index"));
                        $("#referenceObj").html($(objs[referenceIndex]).find("p").html());
                        $("#referenceObj").attr("data-index", referenceIndex);
                    }
                }
                _this.switchService(a);
            });
            //绑定“分析”按钮点击事件
            $("#startAnalysis").on('click', { context: this }, function (e) {
                _this.getService();
            });
        },
        /**
        *切换地图服务
        *@method switchService
        *@private
        */
        switchService: function (e) {
            this.deleteService();
            switch (e) {
                case '规划设计条件':
                    this.lyrIndex = 1;
                    this.addService(this.lyr_ghtj);
                    Project_ParamConfig.ctfxConfig.inputParams.GH_DDT_Layer = Project_ParamConfig.conflictLayers[1].layerPath;
                    break;
                case '用地红线':
                    this.lyrIndex = 2;
                    this.addService(this.lyr_ydhx);
                    Project_ParamConfig.ctfxConfig.inputParams.GH_DDT_Layer = Project_ParamConfig.conflictLayers[2].layerPath;
                    break;
                case '工程红线':
                    this.lyrIndex = 3;
                    this.addService(this.lyr_gchx);
                    Project_ParamConfig.ctfxConfig.inputParams.GH_DDT_Layer = Project_ParamConfig.conflictLayers[3].layerPath;
                    break;
                default:
                    break;
            }
        },

        /**
        *获取tab1数据
        *@method setPieHTML
        *@private
        */
        getTabsData1: function () {
            L.dci.app.services.baseService.getXingzheng({
                context: this,
                success: function (res) {
                    this.tabsData1 = {
                        "district": Project_ParamConfig.xingzhengConfig.xzqh,
                        "towns": [
                        ]
                    };
                    for (var rn in res) {
                        this.tabsData1.towns.push(res[rn].RegionName);
                    };
                    this.setTabs1();
                    //行政区域---点击事件
                    $(".ctfx-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".ctfx-nav-collapse-wrap .RN-district-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".ctfx-nav-collapse-wrap .RN-district-item")[0].click();
                },
                error: function () {
                    L.dci.app.util.dialog.alert("错误提示", "行政区划信息获取失败，请检查该服务。");
                }
            });

        },
        /**
        *填充tab1数据
        *@method setTabs1
        *@private
        */
        setTabs1: function () {
            var district = this.tabsData1.district;
            var towns = this.tabsData1.towns;

            if (district != null || district != undefined) {
                var html = '<li class="RN-district-item">' + district + '</li>';
                $(".district-content").html(html);
            }

            if (towns.length > 0) {
                var Lihtml = '';
                for (var i = 0; i < towns.length && towns[i] != undefined; i++) {
                    Lihtml = Lihtml + '<li class="RN-town-item">' + towns[i] + '</li>';
                }
                $(".town-content").html(Lihtml);
            }
        },

        /***************************
        *         点击事件
        *****************************/
        /**
        *点击tab按钮事件
        *@method clickTabBtn
        *@param e{Object}
        *@private
        */
        clickTabBtn: function (e) {
            var btn_active = 'collapsed';
            var box_selector = '.wz-collapse';
            var box_active = "active";
            var href = $(e.target).attr("href");

            if ($(e.target).hasClass(btn_active)) {
                if ($(e.target).context.innerHTML == "区域绘制") {
                    this._polygon.disable();
                } else if ($(e.target).context.innerHTML == "地图选择") {
                    this.map.activate(L.DCI.Map.StatusType.PAN);
                }
                $(e.target).removeClass(btn_active);
                $(href).removeClass(box_active);
            }
            else {
                if ($(e.target).context.innerHTML == "区域绘制") {
                    this._polygon.enable();
                } else {
                    this._polygon.disable();
                }
                if ($(e.target).context.innerHTML == "范围线上传") {
                    $(e.target).siblings(".btn").removeClass(btn_active);
                } else {
                    $(e.target).siblings(".btn").removeClass(btn_active).end().addClass(btn_active);
                }
                if ($(e.target).context.innerHTML == "地图选择") {
                    this.map.activate(L.DCI.Map.StatusType.SELECT, this._callback, this.precall, this);
                } else {
                    this.map.activate(L.DCI.Map.StatusType.PAN);
                }
                var text = $(e.target).text();
                switch (text) {
                    //case '行政区域':
                    //    $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                    //    break;
                    case '区域绘制':
                        $('.ctfx-nav-collapse-wrap .active').removeClass(box_active);
                        break;
                    case '范围线上传':
                        $('.ctfx-nav-collapse-wrap .active').removeClass(box_active);
                        break;
                    case '地图选择':
                        $('.ctfx-nav-collapse-wrap .active').removeClass(box_active);
                        break;
                    default: //行政区域
                        $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                        break;
                }
            }
        },

        /**
        *地图选择查询执行函数
        *@method _callback
        *@private
        */
        _callback: function (evt) {
            this.clear();
            var map = this.map.getMap();
            this._count = this.map.getLayers().length;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && (layer.options.name == undefined ||
                    (layer.options.name && layer.options.name.indexOf("影像图") == -1))
                    && layer.url.indexOf(Project_ParamConfig.conflictLayers[1].url) != -1) {

                    var identify = layer.identify()
                        .on(map)
                        .at(evt.latlng)
                        .layers('all:0')
                        .tolerance(this._tolerance);
                    if (layer.options.opacity && layer.options.opacity != 0) {
                        if (layer.getLayers && layer.getLayers()) {
                            //identify.layers('visible:' + layer.getLayers()[0]);
                            var currentLayer = 'visible:' + Project_ParamConfig.conflictLayers[this.lyrIndex].layerIndex;
                            identify.layers(currentLayer);
                            //identify.layers('visible');
                        } else {
                            if (layer.options.layers)
                                identify.layers('visible:' + layer.options.layers.join(','));
                        };
                        //for (var index in layer.options.layerDefs)
                        //{
                        //    if (index == "all")
                        //    {
                        //        identify.layerDef(0, layer.options.layerDefs[index]);
                        //        break;
                        //    }
                        //    else
                        //    {
                        //        identify.layerDef(parseInt(index), layer.options.layerDefs[index]);
                        //    }
                        //}
                        identify.run(function (error, featureCollection, response) {
                            this._count--;
                            if (response && response.results)
                                this._selectedResults = this._selectedResults.concat(response.results);
                            if (this._count == 0)
                                this._showSelectedResult();
                            if (response && response.results) {
                                for (var num = 0; num < response.results.length; num++) {
                                    var coordinates = response.results[num].geometry.rings[0];
                                    for (var i = 0; i < coordinates[0].length; i++) {
                                        var cache = coordinates[0][i][0];
                                        coordinates[0][i][0] = coordinates[0][i][1];
                                        coordinates[0][i][1] = cache;
                                    }
                                    var lay = L.polygon(coordinates);

                                    var featureSet = new L.DCI.FeatureSet();
                                    featureSet.features = [lay];
                                    this.in_region = featureSet;
                                    Project_ParamConfig.ctfxConfig.inputParams.Region_Layer = this.in_region;
                                }
                            }
                        }, this);
                    }
                    else {
                        this._count--;
                    }
                    //if (layer.getLayers && layer.getLayers()) {
                    //    //identify.layers('visible:' + layer.getLayers()[0]);
                    //    identify.layers('visible');
                    //} else {
                    //    if (layer.options.layers)
                    //        identify.layers('visible:' + layer.options.layers.join(','));
                    //};
                    //for (var index in layer.options.layerDefs) {
                    //    identify.layerDef(parseInt(index), layer.options.layerDefs[index]);
                    //}

                } else {
                    this._count--;
                    if (this._count == 0) {
                        if (this._selectedResults.length == 0) {
                            this._queryResult.load(this._selectedResults);
                        }
                        var obj = $('.result-list-group-loadflash');
                        L.dci.app.util.hideLoadFlash(obj);
                    }
                }
            }, this);

        },
        /**
        *清除结果
        *@method clear
        */
        clear: function () {
            this.map.getHighLightLayer().clearLayers();
            if (this._feature && this._feature.length > 0) {
                if (this._feature[0] != null) {
                    this.map.getHighLightLayer().removeLayer(this._feature[0]);
                }
                this._feature = [];
            }
            this._selectedResults = [];
            this._count = 0;
        },
        /**
        *在地图上显示地图选择结果
        *@method _showSelectedResult
        *@private
        */
        _showSelectedResult: function () {
            try {
                if (this._selectedResults.length > 0) {
                    for (i = 0; i < this._selectedResults.length; i++) {
                        var feature = this._selectedResults[i];
                        var geo = L.dci.app.util.highLight(this.map, feature, true, false);
                        this._feature.push(geo);
                    }
                }
            } catch (e) {
                L.dci.app.util.dialog.error("错误提示", e);
            }
        },

        /**
        *点击范围线上传选项事件
        *@method rangLineUpload
        *@param e{Object}
        *@private
        */
        rangLineUpload: function (e) {
            if (this._addcads == null)
                this._addcads = new L.DCI.AddCad();
            this._addcads.adddata_ar(this.getRegion, this);
        },

        /**
        *获取上传范围
        *@method getRegion
        *@param lay{Object} 
        *@private
        */
        getRegion: function (lay) {

            if (lay["caddata"]) {
                lay = lay["caddata"][0];

                var CadPath = lay.geometry.paths[0]

                var lay2 = L.polygon(CadPath);
            }
            if (lay["shpdata"]) {
                lay = lay["shpdata"][0];
                var lay2 = L.polygon(lay.geometry.rings[0]);
            }

            //显示正在加载
            //this.showLoading();

            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay2];
            this.in_region = featureSet;

            Project_ParamConfig.ctfxConfig.inputParams.Region_Layer = this.in_region;
            //this.getService();
        },

        /**
        *点击行政区域标签事件 
        *@method clickLiEvent
        *@param e{Object}
        *@private
        */
        clickLiEvent: function (e) {
            //关闭下拉列表
            $(".ctfx-nav-btn-wrap .collapsed").click();

            var bool = e.target.className.indexOf("RN-district-item");
            if (bool != -1) {
                $('.RN-town-item').removeClass("active");
                var text = Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue;
                $(".ctfx-nav-btn-wrap button")[0].innerHTML = "行政区域";
            } else {
                $('.RN-district-item').removeClass("active");
                var text = $(e.target).text();
                $(".ctfx-nav-btn-wrap button")[0].innerHTML = text;
            }
            this.RegionFeature = null;

            var li_active = "active";

            $(e.target).siblings("li").removeClass(li_active).end().addClass(li_active);

            //显示正在加载
            //this.showLoading();
            //查询行政边界
            var currentData = [];
            var url = Project_ParamConfig.xingzhengConfig.xingzheng_layer.url;
            var id = Project_ParamConfig.xingzhengConfig.xingzheng_layer.field;
            var layerIndex = Project_ParamConfig.xingzhengConfig.xingzheng_layer.layerIndex;
            var query = new L.esri.Tasks.Find(url);
            query.layers(layerIndex).text(text).fields(id);
            query.params.sr = Project_ParamConfig.xingzhengConfig.xingzheng_layer.sr;
            query.run(function (error, featureCollection, response) {
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
                if (featureCollection != null) {
                    var feature = featureCollection.features[0];

                    this.RegionFeature = feature;
                    //参数配置
                    var Region = $(".district-content .active");
                    var hlLayer = map.getHighLightLayer();
                    hlLayer.clearLayers();
                    if (Region.length != 1) {
                        //参数配置                        
                        geo = L.dci.app.util.unproject(map, feature, "Polygon");

                        highlightPolygonSymbol = {
                            color: '#ff5f00',
                            weight: 3,
                            opacity: 0.7,
                            fill: true,
                            fillColor: '#ffb400',
                            fillOpacity: 0.1,
                            CANVAS: true
                        };
                        geo.setStyle(highlightPolygonSymbol);
                        hlLayer.addLayer(geo);
                    }

                    //if (Project_ParamConfig.ctfxConfig.PreResult) {
                    //    this.ajax = new L.DCI.Ajax();
                    //    var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/";
                    //    var newUrl = url
                    //        + "analysis/landbpre/read/ls/" + text;

                    //    this.ajax.get(newUrl, null, true, this, function (res) {
                    //        this.hideLoading();
                    //        if (res[0].name == "无结果") {
                    //            this.offContent();
                    //            L.dci.app.util.dialog.alert("温馨提示", "没有冲突分析查询结果");
                    //        } else {
                    //            this.TableData0 = res;
                    //            this.showContent();
                    //        }
                    //    }, function () {

                    //        var feature = this.RegionFeature;
                    //        var coordinates = feature.geometry.coordinates;
                    //        for (var i = 0; i < coordinates[0].length; i++) {
                    //            var cache = coordinates[0][i][0];
                    //            coordinates[0][i][0] = coordinates[0][i][1];
                    //            coordinates[0][i][1] = cache;
                    //        }
                    //        var lay = L.polygon(coordinates);

                    //        var featureSet = new L.DCI.FeatureSet();
                    //        featureSet.features = [lay];
                    //        this.in_region = featureSet;
                    //        Project_ParamConfig.ctfxConfig.inputParams.Region_Layer = this.in_region;
                    //        //this.getService();

                    //    });
                    //} else {

                        var coordinates = feature.geometry.coordinates;
                        //for (var i = 0; i < coordinates[0].length; i++) {
                        //    var cache = coordinates[0][i][0];
                        //    coordinates[0][i][0] = coordinates[0][i][1];
                        //    coordinates[0][i][1] = cache;
                        //}
                        var lay = L.polygon(coordinates);

                        var featureSet = new L.DCI.FeatureSet();
                        featureSet.features = [lay];
                        this.in_region = featureSet;
                        Project_ParamConfig.ctfxConfig.inputParams.Region_Layer = this.in_region;
                        //this.getService();
                    //};
                } else {
                    //this.offContent();
                    L.dci.app.util.dialog.alert("温馨提示", "没有区域查询结果");
                }
            }, this);
        },

        //自定义事件
        clickBtnEvent: function (e) {
            //this._polygon.enable();
        },

        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            this.draw_disable();
            this.clearHL();
            this.deleteService();
            L.DCI.AddCad.prototype.removerCAD();
            L.dci.app.pool.remove('ConflictAnalysis');
        },

        /**
        *清除高亮图层
        *@method clearHL
        */
        clearHL: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var hlLayer = map.getHighLightLayer();
            hlLayer.clearLayers();
        },

        /**
        *关闭绘图工具
        *@method draw_disable
        *@private
        */
        draw_disable: function () {
            this._polygon.disable();
        },

        /**
        *获取绘制的范围
        *@method getDrawPolygonsRegion
        *@param lay{Object} 
        *@private
        */
        getDrawPolygonsRegion: function (lay) {
            //关闭下拉列表
            $(".ctfx-nav-btn-wrap .collapsed").click();

            //显示正在加载
            //this.showLoading();
            //var geometry = lay.toGeoJSON().geometry;
            //取消绘制工具激活状态
            //$('#QYHZ').removeClass('collapsed');
            this._polygon.disable();

            //参数配置
            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay];
            this.in_region = featureSet;
            Project_ParamConfig.ctfxConfig.inputParams.Region_Layer = this.in_region;
            //this.getService();
        },


        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getService: function () {
            this.referenceObj = $("#referenceObj").html();
            this.analysisObj = $("#analysisObj").html();
            this.referenceIndex = parseInt($("#referenceObj").attr("data-index"));
            this.analysisIndex = parseInt($("#analysisObj").attr("data-index"));

            this.turnBack();
            //清空内容区域和页码区域
            $('.ctfx-list-wrap > div').html("");
            this.currentPage = 1;
            this.showLoading();

            var url = Project_ParamConfig.ctfxConfig.url;
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(url, Project_ParamConfig.ctfxConfig.inputParams, Project_ParamConfig.ctfxConfig.outParams, $.proxy(this.returnGPData, this), $.proxy(this.resultImageLayerHandler, this), $.proxy(this.errorHandler, this));
        },

        /**
        *处理返回的GP结果
        *@method returnGPData
        *@param res{Object} Json格式结果
        *@private
        */
        returnGPData: function (res) {
            //隐藏正在加载
            this.hideLoading();
            var value = res.value;
            //if (value == "[]" || value == "[[[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []]]" || value == null) {
            if (value.length == 0 || value == null) {
                //this.offContent();
                L.dci.app.util.dialog.alert("温馨提示", "未查找到数据!");
            } else {
                //this.TableData0 = JSON.parse(value);
                this.TableData0 = value;
                if (this.TableData0.result.length > 0) {
                    this.showContent();
                }
            }
        },

        /**
        *填充结果并显示
        *@method showContent
        */
        showContent: function () {
            //清空内容区域和页码区域
            $('.ctfx-list-wrap > div').html("");
            var containerObj = $(".ctfx-list-wrap .content");
            var data = this.TableData0.result;       //保存具体内容数据
            var columnName = this.TableData0.attributeconfing; //保存列名称

            var columnNameIndex = 0;
            this.columnNameArray = []
            for (var kk in columnName) {
                this.columnNameArray[columnNameIndex] = kk;
                columnNameIndex++;
            }
            //"attributeconfing": { "ydxz": "用地性质代码", "ydxzmc": "用地性质", "rjlsx": "容积率上限", "rjlxx": "容积率下限", "jzmdsx": "建筑密度上限(%)", "jzmdxx": "建筑密度下限(%)", "ldlsx": "绿地率上限(%)", "ldlxx": "绿地率下限(%)", "jzgd": "建筑高度(m)", "dkmj": "地块面积(㎡)" }
            //columnNameArray = ["ydxz", "ydxzmc", "rjlsx", "rjlxx", "jzmdsx", "jzmdxx", "ldlsx", "ldlxx", "jzgd", "dkmj"];

            //判断是否有匹配数据
            if (data == null || data.length == 0) {
                var html = '<p class="emptyResult">没有存疑地块!</p>';
                containerObj.html(html);
            }
            else {
                var html = '';
                var start = (this.currentPage - 1) * 10;
                var end = ((start + this.maxShowContentNum) < data.length) ? start + this.maxShowContentNum : data.length;
                for (var i = start; i < end; i++) {
                    var trHtml = '';
                    trHtml += '<tr><td>' + '项目编号' + ':</td><td>' + data[i]["xmbh"] + '</td></tr>';
                    trHtml += '<tr><td>' + '项目名称' + ':</td><td>' + data[i]["xmmc"] + '</td></tr>';

                    var projectId = data[i]["xmbh"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectName = data[i]["xmmc"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var objectId = data[i]["FXOBJECTID"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var number = i;

                    html += '<div class="percontent">'
                                //+ '<div class="pic1">'
                                //+ '</div>'
                                + '<div class="percontent-content">'
                                    + '<table>'
                                        + '<tbody>'
                                            + trHtml
                                        + '</tbody>'
                                    + '</table>'
                                + '</div>'
                                + '<div class="operation">'
                                    + '<span class=""></span>'     //这个类看情况添加iconMark
                                    + '<span class="viewDetail" number = ' + number + '  data-projectid="' + projectId + '" data-projectname="' + projectName + '" data-objectid="' + objectId + '">详情</span>'
                                + '</div>'
                             + '</div>';
                }
                containerObj.html(html);
                var topHtml = '<span>存疑地块（' + data.length + '个）</span>'
                            + '<div>'
                                + '<span class="icon-downloadicon" id="toxls" title="导出Excel文件"></span>'
                            + '</div>'
                            + '<div>'
                                + '<span class="icon-location" id="allHighLight" title="高亮全部存疑地块"></span>'
                            + '</div>';
                $('.ctfx-list-wrap .top').html(topHtml);
                this.pageNum = Math.ceil(data.length / 10);
                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.ctfx-list-wrap .bottom'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });

                //点击详情
                $(".ctfx-list-wrap span.viewDetail").on('click', { context: this }, function (e) {
                    e.data.context.viewDetail(e);
                });
                //返回按钮
                $(".ctfx-detail-wrap").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });
                //高亮全部存疑地块
                $("#allHighLight").on('click', { context: this }, function (e) {
                    _this.allHighLight();
                });
                //导出excel方法
                $("#toxls").on('click', { context: this }, function (e) {
                    var data = _this.TableData0.result;       //保存具体内容数据
                    var columnName = _this.TableData0.attributeconfing; //保存列名称


                    var thHtml1 = '<tr><th rowspan="2">项目编号</th><th rowspan="2">项目名称</th>';
                    var maxLength = 2;

                    var tdHtml = '';
                    //for (var m = 0; m < data.length; m++) {
                    //    var ckdkObjs = data[m].ckdksum;
                    //    maxLength = maxLength > (ckdkObjs.length + 1) ? maxLength : (ckdkObjs.length + 1);
                    //}
                    for (var m = 0; m < data.length; m++) {
                        var obj = data[m].fxdk;
                        var ckdkObjs = data[m].ckdksum;
                        maxLength = maxLength > (ckdkObjs.length + 1) ? maxLength : (ckdkObjs.length + 1);

                        tdHtml += '<tr><td>' + data[m]["xmbh"] + '</td><td>' + data[m]["xmmc"] + '</td>';
                        for (var k = 0; k < _this.columnNameArray.length; k++) {
                            var kk = _this.columnNameArray[k];
                            var value = obj[kk] == null ? "" : obj[kk];
                            value = isNaN(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
                            tdHtml += '<td>' + value + '</td>';
                        }
                        
                        for (var j = 0; j < ckdkObjs.length; j++) {
                            for (var k = 0; k < _this.columnNameArray.length; k++) {
                                var kk = _this.columnNameArray[k];
                                var ckdkValue = ckdkObjs[j].ckdk[kk] == null ? "" : ckdkObjs[j].ckdk[kk];
                                ckdkValue = isNaN(parseFloat(ckdkValue)) ? ckdkValue : parseFloat(ckdkValue).toFixed(2);
                                tdHtml += '<td>' + ckdkValue + '</td>';

                            }
                        }
                        tdHtml += '</tr>';
                    }

                    var thHtml2 = '<tr>';
                    for (var n = 0 ; n < maxLength; n++) {
                        if (n == 0) {
                            thHtml1 += '<th colspan="' + _this.columnNameArray.length + '">分析对象</th>';
                        } else {
                            thHtml1 += '<th colspan="' + _this.columnNameArray.length + '">参考对象</th>';
                        }
                        thHtml2
                        for (var k = 0; k < _this.columnNameArray.length; k++) {
                            var kk = _this.columnNameArray[k];
                            thHtml2 += '<th>' + columnName[kk] + '</th>';
                        }
                    }
                    thHtml1 += '</tr>';
                    thHtml2 += '</tr>';


                    var toxlsHtml = '<div class="ctfx-table-sum">'
                                        + '<table>'
                                            + '<thead>'
                                                + thHtml1
                                                + thHtml2
                                            + '</thead>'
                                            + '<tbody>'
                                                + tdHtml
                                            + '</tbody>'
                                        + '</table>'
                                    + '</div>';
                    $(".ctfx-table-sum").remove();
                    $(".leftcontentpanel-body").append(toxlsHtml);

                    L.txls = new L.DCI.TXls();
                    L.txls.converttoxls(".ctfx-table-sum");
                });
            }
        },
        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this.showContent();
        },

        /**
        *详情点击事件
        *@method viewDetail
        *@param e {Object}       event对象
        */
        viewDetail: function (e) {
            //状态为详情内容
            this.isDetail = true;

            $(".ctfx-list-wrap").css("display", "none");
            $(".ctfx-detail-wrap").css("display", "block");
            $(".ctfx-detail-wrap .content").replaceWith('<div class="content"></div>');
            var container = $(".ctfx-detail-wrap .content");
            container.html("");
            var projectId = $.trim($(e.target).attr("data-projectid"));
            var objectId = $.trim($(e.target).attr("data-objectid"));
            var title = $(e.target).attr("data-projectname");
            $(".ctfx-detail-wrap .titlecontent").html(title);
            
            this.deleteService();
            switch (this.referenceIndex) {
                case 0:
                    this.addService(this.lyr_kg);
                    break;
                case 1:
                    this.addService(this.lyr_ghtj);
                    break;
                case 2:
                    this.addService(this.lyr_ydhx);
                    break;
                default:
                    break;
            }
            switch (this.analysisIndex) {
                case 1:
                    this.addService(this.lyr_ghtj);
                    break;
                case 2:
                    this.addService(this.lyr_ydhx);
                    break;
                case 3:
                    this.addService(this.lyr_gchx);
                    break;
                default:
                    break;
            }
            this._zoomTo(objectId, false);

            var detailDataIndex = parseInt($(e.target).attr("number"));
            var data = this.TableData0.result;       //保存具体内容数据
            var columnName = this.TableData0.attributeconfing; //保存列名称

            var thHtml = '<th>分析指标</th>';   //表头
            var thHtmlClone = '<th>分析指标</th>';   //克隆表头
            var trHtml = '';   //表体
            var trHtmlClone = '';   //克隆表体
            var fxdkObj = data[detailDataIndex].fxdk;
            var ckdkObjs = data[detailDataIndex].ckdksum;
            //生成表头
            thHtml += '<th data-xmbh="' + projectId + '" data-objectid="' + objectId + '">分析对象</th>';
            thHtmlClone += '<th data-xmbh="' + projectId + '" data-objectid="' + objectId + '">分析对象</th>';
            for (var i = 0; i < ckdkObjs.length; i++) {
                thHtml += '<th data-xmbh="' + ckdkObjs[i].xmbh + '" data-objectid="' + ckdkObjs[i].CKObjectID + '">参考对象</th>';
            }
            //生成表体
            for (var k = 0; k < this.columnNameArray.length; k++) {
                //将英文字段名改为对应的中文名
                var kk = this.columnNameArray[k];
                var key = columnName[kk];

                trHtml += '<tr><td>' + key + '</td>';
                trHtmlClone += '<tr><td>' + key + '</td>';
                //插入分析对象数据
                var fxdkValue = fxdkObj[kk] == null ? "" : fxdkObj[kk];
                fxdkValue = isNaN(parseFloat(fxdkValue)) ? fxdkValue : parseFloat(fxdkValue).toFixed(2);
                trHtml += '<td>' + fxdkValue + '</td>';
                trHtmlClone += '<td>' + fxdkValue + '</td>';
                //插入参考对象数据
                for (var j = 0; j < ckdkObjs.length; j++) {
                    var ckdkValue = ckdkObjs[j].ckdk[kk] == null ? "" : ckdkObjs[j].ckdk[kk];
                    ckdkValue = isNaN(parseFloat(ckdkValue)) ? ckdkValue : parseFloat(ckdkValue).toFixed(2);
                    trHtml += '<td>' + ckdkValue + '</td>';
                }
                trHtml += '</tr>';
                trHtmlClone += '</tr>';
            }

            var tableHTML = '<table class="table table-bordered">'
                + '<thead>'
                    + '<tr>'
                        + thHtml
                    + '</tr>'
                + '</thead>'
                + '<tbody>'
                    + trHtml
                + '</tbody>'
            + '</table>';
            var tableClone = '<div class="" id="tableClone">'
                + '<table class="table table-bordered">'
                    + '<thead>'
                        + '<tr>'
                            + thHtmlClone
                        + '</tr>'
                    + '</thead>'
                    + '<tbody class="">'
                        + trHtmlClone
                    + '</tbody>'
                + '</table>'
            + '</div>';

            container.html(tableHTML);
            if (ckdkObjs.length < 3) {   //参考对象的数量少于3时
                var thWidth = 480 / (ckdkObjs.length + 2);
                $(".ctfx-detail-wrap table > thead > tr > th").css("width", thWidth);
            } else {
                $(".ctfx-detail-wrap table > thead > tr > th").css("width", 120);
                var contentWidth = 120 * (ckdkObjs.length + 2);
                $(".ctfx-detail-wrap .content table").css("width", contentWidth);
                //滚动条
                $(".ctfx-detail-wrap .content").mCustomScrollbar({
                    theme: "minimal-dark", horizontalScroll: true
                });
                container.append(tableClone);
            }
            
            if (ckdkObjs.length < 3) {
                $(".ctfx-content #tableClone table > thead > tr > th").css("width", thWidth);
                $(".ctfx-content #tableClone").css("width", thWidth * 2);
            } else {
                $(".ctfx-content #tableClone table > thead > tr > th").css("width", 120);
                $(".ctfx-content #tableClone").css("width", 240);
            }
            //动态调整克隆表的行高
            var trObjs = $(".ctfx-detail-wrap table tr");
            var trObjsClone = $(".ctfx-content #tableClone table tr");
            for (var num = 0; num < trObjs.length; num++) {
                $(trObjsClone[num]).css("height", trObjs[num].offsetHeight);
            }

            //点击高亮分析对象或参考对象
            var _this = this;
            $(".ctfx-detail-wrap table > thead > tr > th:first-child ~ th").on('click', { context: this }, function (e) {
                var projectId = $(e.currentTarget).attr("data-xmbh");
                var objectId = $(e.currentTarget).attr("data-objectid");
                if ($(e.currentTarget).html() == "分析对象") {
                    _this._zoomTo(objectId, false);
                } else {
                    _this._zoomTo(objectId, true);
                }
            });
        },

        /**
        *高亮所有存疑地块
        *@method allHighLight
        */
        allHighLight: function () {
            //隐藏内容区域
            $(".ctfx-list-wrap").css("display", "none");
            this.showLoading();
            this.clearHL();
            this.allHighLightResult = [];

            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();

            //var layerId = '冲突分析';
            var layerId = Project_ParamConfig.conflictLayers[this.lyrIndex].name;
            var layerIndex = Project_ParamConfig.conflictLayers[this.lyrIndex].layerIndex;
            var zoomItemName = Project_ParamConfig.conflictLayers[this.lyrIndex].zoomItemName;
            
            var _this = this;
            _map.eachLayer(function (layer) {
                var _this = this;
                if (layer.options
                    && layer.options.id == layerId) {
                    layer.metadata(function (error, metadata) {
                        if (metadata == null) return;
                        var layers = [];
                        for (var i = 0 ; i < metadata.layers.length; i++) {
                            if (metadata.layers[i].id == layerIndex) {
                                layers.push(metadata.layers[i].id.toString());
                            };
                        }
                        for (var i = 0; i < _this.TableData0.result.length; i++) {
                            //var projectId = _this.TableData0.result[i]["xmbh"];
                            var objectId = _this.TableData0.result[i]["FXOBJECTID"];

                            _this.doFindAll(_this.TableData0.result.length, layer.url, layers, zoomItemName, objectId, function (featureCollection, response) {
                                
                            });
                        }
                    }, _this);
                }
            }, this);
        },

        /**
        *执行Find操作
        *@method doFindAll
        *param length {Boolean} 数据量
        *param url {String} 查询的图层地址
        *param layers {Array} 图层索引
        *param field {String} 查询的字段名
        *param data {Object} 查询条件值
        *param callback {Object} 回调函数
        */
        doFindAll: function (length, url, layers, field, data, callback) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var find = L.esri.Tasks.find(url);
            find.layers(layers.join(','));
            find.text(data);
            find.contains(true);
            find.fields(field);
            find.spatialReference(map.options.crs.code.split(':')[1]);

            var _this = this;
            find.run(function (error, featureCollection, response) {
                if (error) {
                    console.log(error);
                    L.dci.app.util.dialog.alert("错误提示", error.message);
                } else {
                    if (callback != null)
                        callback.call(error, featureCollection, response);

                    _this.allHighLightResult[_this.allHighLightResult.length] = featureCollection;

                    if (_this.allHighLightResult.length == length) {
                        for (var j = 0; j < _this.allHighLightResult.length; j++) {
                            var feaResult = _this.allHighLightResult[j].features;
                            if (feaResult.length > 0) {
                                for (var i = 0; i < feaResult.length; i++) {
                                    L.dci.app.util.highLight(map, feaResult[i], true, false, feaResult[i].geometry.type);
                                };
                            };
                        }
                        //显示内容区域
                        $(".ctfx-list-wrap").css("display", "block");
                        _this.hideLoading();
                    }

                };
            });
        },

        /**
        *根据当前ID定位项目
        *@method _zoomTo
        *@param value{Array}ID数组
        *param isReference {Boolean} 是否为参考对象
        */
        _zoomTo: function (value, isReference) {
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            
            if (isReference) {//如果是参考对象
                var layerId = Project_ParamConfig.conflictLayers[this.referenceIndex].name;
                this.layerIndex = Project_ParamConfig.conflictLayers[this.referenceIndex].layerIndex
                this.zoomItemName = Project_ParamConfig.conflictLayers[this.referenceIndex].zoomItemName;
            } else {
                var layerId = Project_ParamConfig.conflictLayers[this.analysisIndex].name;
                this.layerIndex = Project_ParamConfig.conflictLayers[this.analysisIndex].layerIndex;
                this.zoomItemName = Project_ParamConfig.conflictLayers[this.analysisIndex].zoomItemName;
            }
            _map.eachLayer(function (layer) {
                var _this = this;
                if (layer.options && layer.options.id == layerId) {
                    layer.metadata(function (error, metadata) {
                        if (metadata == null) return;
                        var layers = [];
                        for (var i = 0 ; i < metadata.layers.length; i++) {
                            if (metadata.layers[i].id == _this.layerIndex) {
                                layers.push(metadata.layers[i].id.toString());
                            };
                        }
                        _this.doFind(isReference, layer.url, layers, _this.zoomItemName, value, function (featureCollection, response) {
                            //var num = response.results.length;
                            //if (num > 0)
                            //    _this._currentSelectedObj = response.results[0];
                        });
                    }, _this);
                }
            }, this);
        },

        /**
        *执行Find操作
        *@method doFind
        *param isReference {Boolean} 是否为参考对象
        *param url {String} 查询的图层地址
        *param layers {Array} 图层索引
        *param field {String} 查询的字段名
        *param data {Object} 查询条件值
        *param callback {Object} 回调函数
        */
        doFind: function (isReference, url, layers, field, data, callback) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var HLlayers = map.getHighLightLayer();
            if (isReference) {
                for (var k = 0; k < this.referenceHightLight.length; k++) {
                    HLlayers.removeLayer(this.referenceHightLight[k]);
                }
            } else {
                HLlayers.clearLayers();
            }
            var find = L.esri.Tasks.find(url);
            find.layers(layers.join(','));
            find.text(data);
            find.contains(true);
            find.fields(field);
            find.spatialReference(map.options.crs.code.split(':')[1]);
            
            var _this = this;
            find.run(function (error, featureCollection, response) {
                if (error) {
                    console.log(error);
                    L.dci.app.util.dialog.alert("错误提示", error.message);
                } else
                {
                    if (callback != null)
                        callback.call(error, featureCollection, response);

                    var feaResult = featureCollection.features;
                    if (feaResult.length > 0) {
                        for (var i = 0; i < feaResult.length; i++) {
                            if (isReference) {
                                var tempGeo = _this.highLight(map, feaResult[i], true, true, feaResult[i].geometry.type);
                                _this.referenceHightLight[_this.referenceHightLight.length] = tempGeo._leaflet_id;
                            } else {
                                L.dci.app.util.highLight(map, feaResult[i], true, true, feaResult[i].geometry.type);
                            }
                        }
                    } else {
                        L.dci.app.util.dialog.alert("温馨提示", "未查找到相应地块!");
                    }
                }
            });
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
                    geo = L.dci.app.util.unproject(map, feature, type);
                else
                    geo = feature;
                //修改参考对象地图要素的样式
                var refSymbol = jQuery.extend(true, {}, L.dci.app.symbol.highlightPolygonSymbol);
                refSymbol.color = "#fff200";
                refSymbol.fill = false;
                switch (type) {
                    case "esriGeometryPolygon"://面
                    case "Polygon":
                    case "MultiPolygon":
                        geo.setStyle(refSymbol);
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
                    L.dci.app.util.zoomTo(map, geo, false);
            } catch (e) {
                throw "高亮显示异常:" + e;
            }
            return geo;
        },

        /**
        *返回
        *@method turnBack
        */
        turnBack: function () {
            //状态为项目列表
            this.isDetail = false;
            $(".ctfx-list-wrap").css("display", "block");
            $(".ctfx-detail-wrap").css("display", "none");

            this.deleteService();
            this.switchService($("#analysisObj").html());
            var _map = L.DCI.App.pool.get("map");
            _map.getHighLightLayer().clearLayers();
        },

        /**
        *加载专题服务
        *@method addService
        */
        addService: function (layer) {
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var length = this.baseLyrs.length;
            this.baseLyrs[length] = layer;
            this.baseLyrs[length].addTo(this.map.getMap());
        },
        /**
        *删除专题服务
        *@method deleteService
        */
        deleteService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            for (var i = 0; i < this.baseLyrs.length; i++) {
                map.removeLayer(this.baseLyrs[i].options.id);
            }
            this.baseLyrs = [];
        },

        /**
        *显示正在加载图标
        *@method showLoading
        *@private
        */
        showLoading: function () {
            $(".ctfx-loadflash").css("z-index", "0");
        },
        /**
        *隐藏正在加载图标
        *@method hideLoading
        *@private
        */
        hideLoading: function () {
            $(".ctfx-loadflash").css("z-index", "-1");
        },

    });
    return L.DCI.ConflictAnalysis;
});