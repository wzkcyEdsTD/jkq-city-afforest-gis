/**
*一书两证统计分析类
*@module modules.analysis
*@class DCI.Certificate
*@constructor initialize
*@extends Class
*/
define("analysis/certificate", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "library/echarts",
    "analysis/addcad",
    "analysis/gpHandler",
    "util/txls"
], function (L) {
    L.DCI.Certificate = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'Certificate',
        /**
        *整体布局
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="yslztj-content">'
                    + '<div class="yslztj-nav-wrap"></div>'
                    + '<div class="yslztj-table-wrap">'
                    + '</div>'
                    + '<div class="yslztj-chart-wrap"></div>'
                + '</div>'
                + '<div class="yslztj-loadflash">'
                    + '<div class="loadingFlash"><span class="icon-loading"></span>'
                    + '</div>'
                    + '<div class="loadingText">服务器正在处理请求，预计需要2~3分钟，请耐心等待...</div>'
                + '</div>'
                ,

        /**
        *年份选择器中年份块html模板
        *@property yearSelectorHtml
        *@type {Object}
        */
        yearSelectorHtml:
                         '<div class="yslztj-yselector-block">'
                            + '<span class="yslztj-yselector-year"></span>'
                            + '<span class="yslztj-yselector-pin"></span>'
                        + '</div>',

        /**
        *Map对象
        *@property map
        *@type {Object}
        *@private
        */
        map: null,

        /**
        *底图配置列表中的顺序，选址意见书：5；建设用地规划许可证：6；建设工程规划许可证：7
        *@property lyrIndex
        *@type {number}
        *@private
        */
        lyrIndex: 5,

        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            numCount: 7,/*年份选择轴上显示多少个年份*/
            minNum: 0,/*最小年份*/
            maxNum: 100,/*最大年份*/
            areaMmultiple: 1/*面积倍数，服务返回数据为平方米，如果要在界面上要显示为平方千米，则设为0.000001*/
        },

        /**
        *配置参数
        *@property parameters
        *@type {Object}
        */
        parameters: {
            /*获取哪一年的统计数据*/
            year: 2011,
            /*时间类型，决定传回服务器的timeValue是半年、季度、或者月*/
            timeMode: 0,
            /*时间值*/
            timeVlaue: '0',
            /*X轴类型，统计数据以什么统计，可以是用地类型或者行政区*/
            xAxisMode: 0,
            /*用地类型*/
            landUse: '0',
            /*行政区域*/
            region: '0'
        },

        /**
        *时间数据类型，0年份，1半年，2季度，3月份
        *@property timeParameters
        *@type {Object}
        */
        timeParameters: {
            year: 0,
            hyear: 1,
            quarter: 2,
            month: 3
        },

        /**
        *查询范围
        *@property in_region
        *@type {Object}
        *@private
        */
        selectRegion: {
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
        *行政区域tabs页面数据
        *@property XZQYTabsData
        *@type {Object}
        *@private
        */
        XZQYTabsData: null,       //tabs1页面数据

        /**
        *当前显示的表
        *@property currentTable
        *@type {string}
        *@private
        */
        currentTable: "#XZYJS1",
        /**
        *当前显示的表title
        *@property currentTitle
        *@type {string}
        *@private
        */
        currentTitle: {
            region: "江阴市",
            certificate: "选址意见书",
            countStatistics: "发证数量统计（个）",
            areaStatistics: "发证面积统计（m²）",
        },
        
        /**
        *当前选择的时间
        *@property currentTime
        *@type {string}
        *@private
        */
        currentTime: "2011",

        /**
        *过渡结果数据
        *@property TableData0
        *@type {Object}
        *@private
        */
        //TableData0: [[], [], []],
        TableData0: [{}, {}, {}],
        /**
        *合计结果数据
        *@property sumData
        *@type {Object}
        */
        sumData: [[], [], []],    //table数据,sumData[0]为选址意见书，sumData[1]为建设用地规划许可证,sumData[2]为建设工程规划许可证
        /**
        *pie1参数
        *@property pieOption1
        *@type {Object}
        *@private
        */
        pieOption1: null,      //pie1参数
        /**
        *pie2参数
        *@property pieOption2
        *@type {Object}
        *@private
        */
        pieOption2: null,      //pie2参数


        /**
        *图表颜色配置
        *@property chartColors
        *@type {Array}
        */
        chartColors: ['#ff6464', '#ff9664', '#ffcd64', '#e6f03c', '#5af0a0', '#5af0e6', '#78c8f0', '#7882f0', '#b478f0', '#f078dc'],

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            //选址意见书的底图配置
            var url_xzyjs = Project_ParamConfig.landLayers[5].url;
            var index_xzyjs = Project_ParamConfig.landLayers[5].layerIndex;
            this.lyr_xzyjs = L.esri.dynamicMapLayer(url_xzyjs, { id: '一书三证发证统计', layers: [index_xzyjs] });
            //建设用地规划许可证的底图配置
            var url_ydxkz = Project_ParamConfig.landLayers[6].url;
            var index_ydxkz = Project_ParamConfig.landLayers[6].layerIndex;
            this.lyr_ydxkz = L.esri.dynamicMapLayer(url_ydxkz, { id: '一书三证发证统计', layers: [index_ydxkz] });
            //建设工程规划许可证的底图配置
            var url_gcxkz = Project_ParamConfig.landLayers[7].url;
            var index_gcxkz = Project_ParamConfig.landLayers[7].layerIndex;
            this.lyr_gcxkz = L.esri.dynamicMapLayer(url_gcxkz, { id: '一书三证发证统计', layers: [index_gcxkz] });

            this.addService(this.lyr_xzyjs);

            var _this = this;
            L.DCI.App.pool.get('LeftContentPanel').show(this,
                function () {
                    _this.getXZQYTabsData();
                });
            $(".leftcontentpanel-title>span:first").html("一书两证发证统计");         //标题

            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.tempHtml);         //整体布局

            //滚动条
            $(".yslztj-content").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //tab
            this.setTabsHTML();
            //绑定“行政区域”按钮点击事件
            $(".yslztj-nav-btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.clickTabBtn(e); });
            //绑定“开始统计”按钮点击事件
            $(".yslztj-nav-btn-start>button").on('click', { context: this }, function (e) { e.data.context.requestData(); });
            $(".yslztj-nav-btn-wrap>button").click();

            var date = new Date();   //当前时间
            /*设定年份选择器的范围为当前年份到2000年*/
            var lastYear = date.getFullYear();
            this.options.maxNum = lastYear;
            this.options.minNum = 2000;

            this._container = $(this.dom[0]).find(".yslztj-nav-wrap")[0];
            var $container = $(this._container);

            this._initYearSelector(this.dom[0]);
            var preYear = $container.find('.icon-arrows')[0];
            var nextYear = $container.find('.icon-arrows-right')[0];
            L.DomEvent.on(nextYear, 'click', this._nextYearClick, this);
            L.DomEvent.on(preYear, 'click', this._preYearClick, this);

            var tds = $container.find('td');
            for (var t = 0; t < tds.length; t++) {
                L.DomEvent.on(tds[t], 'click', this._timeModeClick, this);   //绑定时间模式点击事件
            }

            $(".yslztj-nav-btn-start>button").click();   // 开始统计
        },

        /**
        *初始年份选择器
        *@method _initYearSelector
        *@param container {Object}  容器
        */
        _initYearSelector: function (container) {
            var endNum = this.options.maxNum;
            var startNum = this.options.maxNum - this.options.numCount + 1;
            if (startNum < this.options.minNum)
                startNum = this.options.minNum;

            this.parameters.year = endNum;
            this.parameters.timeMode = this.timeParameters.year;
            this._createYearBlocks(startNum, endNum, this.parameters.year);

            this.currentTime = endNum.toString();
            Project_ParamConfig.yslztjConfig.inputParams.NowTime = this.currentTime;
        },

        /**
        *创建时间轴
        *@method _createYearBlocks
        *@param start {String}     时间轴开始年份
        *@param end {String}       时间轴结束年份
        *@param current {String}   当前显示年份
        */
        _createYearBlocks: function (start, end, current) {
            var $yearAxis = $(this._container).find('.yslztj-yselector-axis');
            $yearAxis.children().remove();
            for (var i = start; i <= end; i++) {
                var $yearBlock = $(this.yearSelectorHtml);
                var $year = $yearBlock.find('.yslztj-yselector-year');
                $year.attr('value', i);
                $year.html(i);
                $yearAxis.append($yearBlock);
                L.DomEvent.on($yearBlock[0], 'click', this._yearClick, this);
                if (i == current) {
                    $year.addClass('selected');
                    this.parameters.year = i;
                    this.parameters.timeMode = this.timeParameters.year;
                }
            }
        },

        /**
        *年份点击事件
        *@method _yearClick
        *@param e {Object} event对像
        */
        _yearClick: function (e) {
            $(".yslztj-nav-btn-start>button").css("display", "block");  //显示“开始统计”按钮

            if (!$(e.target).hasClass("selected") || $(this._container).find('td').hasClass('selected')) {
                var year = e.target.innerHTML;
                this.parameters.year = year;
                this.parameters.timeMode = this.timeParameters.year;
                this.parameters.timeVlaue = '0';

                $(this._container).find('td.selected').removeClass('selected');
                /*年份数据被修改,修改UI上的当前年份*/
                $(this._container).find('.yslztj-yselector-year.selected').removeClass('selected');
                $(e.target).addClass('selected');

                //this.currentTime = year.toString();
                //this.requestData();
            }
        },

        /**
        *上一年点击事件
        *@method _preYearClick
        */
        _preYearClick1: function () {
            if (this.parameters.year > this.options.minNum) {
                this.parameters.year = this.parameters.year - 1.0;
                this.parameters.timeMode = this.timeParameters.year;
                this.parameters.timeVlaue = '0';

                $(this._container).find('td.selected').removeClass('selected');
                $(this._container).find('.yslztj-yselector-year.selected').removeClass('selected');
                var selector = ".yslztj-yselector-year[value=" + this.parameters.year + "]";
                var yearBlock = $(this._container).find(selector);
                if (yearBlock.length < 1) {
                    var start = this.parameters.year - this.options.numCount + 1;
                    if (start < this.options.minNum)
                        start = this.options.minNum;

                    var end = start + this.options.numCount - 1;
                    if (end > this.options.maxNum)
                        end = this.options.maxNum;

                    this._createYearBlocks(start, end, this.parameters.year);
                } else {
                    $(yearBlock).addClass('selected');
                }
                //this.requestData();
            }
        },

        /**
        *上一年点击事件
        *@method _preYearClick
        */
        _preYearClick: function () {
            $(".yslztj-nav-btn-start>button").css("display", "block");  //显示“开始分析”按钮

            var obj = $(this._container).find('.yslztj-yselector-year');
            var yeargap = obj[0].innerHTML - this.options.minNum;
            if (yeargap == 0) {
                return;
            } else if (yeargap >= this.options.numCount) {
                var start = parseInt(obj[0].innerHTML) - this.options.numCount;
                var end = parseInt(obj[0].innerHTML) - 1;
                this.parameters.year = end;
                this._createYearBlocks(start, end, this.parameters.year);
            } else {
                var start = parseInt(obj[0].innerHTML) - yeargap;
                var end = start + this.options.numCount - 1;
                if (this.parameters.year > end) {
                    this.parameters.year = end;
                }
                this._createYearBlocks(start, end, this.parameters.year);
            }
            $(this._container).find('td.selected').removeClass('selected');
            //this.requestData();
        },

        /**
        *下一年点击事件
        *@method _preYearClick
        */
        _nextYearClick1: function () {
            if (this.parameters.year < this.options.maxNum) {
                this.parameters.year = parseInt(this.parameters.year) + 1;
                this.parameters.timeMode = this.timeParameters.year;
                this.parameters.timeVlaue = '0';

                $(this._container).find('td.selected').removeClass('selected');
                $(this._container).find('.yslztj-yselector-year.selected').removeClass('selected');
                var selector = ".yslztj-yselector-year[value=" + this.parameters.year + "]";
                var yearBlock = $(this._container).find(selector);
                if (yearBlock.length < 1) {
                    var end = this.parameters.year + this.options.numCount - 1;
                    if (end > this.options.maxNum)
                        end = this.options.maxNum;

                    var start = end - this.options.numCount + 1;
                    if (end > this.options.maxNum)
                        end = this.options.maxNum;

                    this._createYearBlocks(start, end, this.parameters.year);
                } else {
                    $(yearBlock).addClass('selected');
                }

                //this.requestData();
            }
        },

        /**
        *下一年点击事件
        *@method _preYearClick
        */
        _nextYearClick: function () {
            $(".yslztj-nav-btn-start>button").css("display", "block");  //显示“开始分析”按钮

            var obj = $(this._container).find('.yslztj-yselector-year');
            var yeargap = this.options.maxNum - obj[this.options.numCount - 1].innerHTML;
            if (yeargap == 0) {
                return;
            } else if (yeargap >= this.options.numCount) {
                var start = parseInt(obj[this.options.numCount - 1].innerHTML) + 1;
                var end = start + this.options.numCount - 1;
                this.parameters.year = start;
                this._createYearBlocks(start, end, this.parameters.year);
            } else {
                var end = parseInt(obj[this.options.numCount - 1].innerHTML) + yeargap;
                var start = end - this.options.numCount + 1;
                if (this.parameters.year < start) {
                    this.parameters.year = start;
                }
                this._createYearBlocks(start, end, this.parameters.year);
            }
            $(this._container).find('td.selected').removeClass('selected');
            //this.requestData();
        },

        /**
        *时间模式点击事件
        *@method _timeModeClick
        */
        _timeModeClick: function (e) {
            $(".yslztj-nav-btn-start>button").css("display", "block");  //显示“开始分析”按钮

            var timeMode = $(e.target).attr('mode');
            var timeValue = $(e.target).attr('value');

            /*时间发生变化*/
            //$(this._container).find('td.selected').removeClass('selected');
            var selectedObj = $(this._container).find('td.selected');
            if (selectedObj.length > 1) {
                selectedObj.removeClass('selected');
                $(e.target).addClass('selected');
            } else if (selectedObj.length == 1) {
                var selectedObjVal = selectedObj.attr('value');

                var startValue = (parseInt(selectedObjVal) < parseInt(timeValue)) ? parseInt(selectedObjVal) : parseInt(timeValue);
                var endValue = (parseInt(selectedObjVal) > parseInt(timeValue)) ? parseInt(selectedObjVal) : parseInt(timeValue);

                if (startValue != endValue) {
                    var tds = $(this._container).find('td');
                    for (var t = startValue - 1; t < endValue; t++) {
                        $(tds[t]).addClass('selected');
                    }
                } else {
                    $(e.target).removeClass('selected');
                }
            } else {
                $(e.target).addClass('selected');
            }

            this.parameters.timeMode = timeMode;
            this.parameters.timeVlaue = timeValue;
            //this.requestData();
        },

        /**
       *插入Tabs整体布局
       *@method setTabsHTML
       *@private
       */
        setTabsHTML: function () {
            //tab页整体布局
            var tabHtml1 = /*'<div class="yslztj-nav-btn-wrap">'
                            + '<button class="btn SJXZ"  data-toggle="wz-collapse" href="#SJXZ">时间选择</button>'
                        + '</div>'
                        + '<div class="yslztj-nav-collapse-wrap">'
                            + '<div class="wz-collapse" id="SJXZ">'
                                + '<div class="SJXZ btn-wrap">'
                                    +*/ '<div class="yslztj-yselector-container">'
                                        + '<span class="yslztj-yselector-switch icon-arrows"></span>'
                                        + '<div class="yslztj-yselector-axis"></div>'
                                        + '<span class="yslztj-yselector-switch icon-arrows-right"></span>'
                                    + '</div>'
                                    + '<table class="yslztj-tselector-table">'
                                        + '<tr>'
                                            + '<td mode="3" value="1">1月</td>'
                                            + '<td mode="3" value="2">2月</td>'
                                            + '<td mode="3" value="3">3月</td>'
                                            + '<td mode="3" value="4">4月</td>'
                                            + '<td mode="3" value="5">5月</td>'
                                            + '<td mode="3" value="6">6月</td>'
                                            + '<td mode="3" value="7">7月</td>'
                                            + '<td mode="3" value="8">8月</td>'
                                            + '<td mode="3" value="9">9月</td>'
                                            + '<td mode="3" value="10">10月</td>'
                                            + '<td mode="3" value="11">11月</td>'
                                            + '<td mode="3" value="12">12月</td>'
                                        + '</tr>'
                                    + '</table>'/*
                                + '</div>'
                                + '<div class="rhombuss"></div>'
                            + '</div>'
                        + '</div>'*/;

            var tabHtml2 = '<div class="yslztj-nav-btn-wrap">'
                            + '<button class="btn XZQY" href="#RNW-XZQY1" data-toggle="wz-collapse" aria-controls="RNW-XZQY1" aria-expanded="true">行政区域</button>'
                        + '</div>'
                        + '<div class="yslztj-nav-collapse-wrap">'
                            + '<div class="wz-collapse" id="RNW-XZQY1">'
                                + '<div class="district">'
                                    + '<ul class="district-content"></ul>'
                                + '</div>'
                                + '<div class="town">'
                                    + '<ul class="town-content"></ul>'
                                + '</div>'
                                + '<div class="rhombuss"></div>'
                            + '</div>'
                        + '</div>'
                        + '<div class="yslztj-nav-btn-start">'
                            + '<div class="yslztj-table-title">江阴市选址意见书发证数量统计（个）</div>'
                            + '<button class="btn">开始统计</button>'
                        + '</div>';

            //插入tab
            $(".yslztj-nav-wrap").html(tabHtml1);
            $(".yslztj-nav-wrap").append(tabHtml2);

        },

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
                $(e.target).removeClass(btn_active);
                $(href).removeClass(box_active);
            } else {
                $(e.target).addClass(btn_active);
                $(href).addClass(box_active);
            }
            
        },

        /**
        *获取“行政区域”tab数据
        *@method getXZQYTabsData
        *@private
        */
        getXZQYTabsData: function () {
            L.dci.app.services.baseService.getXingzheng({
                context: this,
                success: function (res) {
                    this.XZQYTabsData = {
                        "district": Project_ParamConfig.xingzhengConfig.xzqh,
                        "towns": [
                        ]
                    };
                    for (var rn in res) {
                        this.XZQYTabsData.towns.push(res[rn].RegionName);
                    };
                    this.setXZQYTabs();
                    //行政区域---点击事件
                    $(".yslztj-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".yslztj-nav-collapse-wrap .RN-district-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".yslztj-nav-collapse-wrap .RN-district-item")[0].click();

                    $(".yslztj-nav-btn-start>button").css("display", "none");  //隐藏“开始分析”按钮
                },
                error: function () {
                    L.dci.app.util.dialog.alert("错误提示", "行政区划信息获取失败，请检查该服务。");
                }
            });

        },
        /**
        *填充tab1数据
        *@method setXZQYTabs
        *@private
        */
        setXZQYTabs: function () {
            var district = this.XZQYTabsData.district;
            var towns = this.XZQYTabsData.towns;

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

        /**
        *点击行政区域标签事件 
        *@method clickLiEvent
        *@param e{Object}
        *@private
        */
        clickLiEvent: function (e) {
            $(".yslztj-nav-btn-start>button").css("display", "block");  //显示“开始分析”按钮

            //关闭下拉列表
            //$(".yslztj-nav-btn-wrap .collapsed").click();
            $(e.target).addClass("now");
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var hlLayer = map.getHighLightLayer();

            var bool = e.target.className.indexOf("RN-district-item");
            if (bool != -1) {
                $('.RN-town-item').removeClass("active");
                var text = Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue;
                //$(".yslztj-nav-btn-wrap button.XZQY")[0].innerHTML = "行政区域";
                $(e.target).addClass("active");
                hlLayer.clearLayers();
                $(e.target).removeClass("now");
            } else {
                $('.RN-district-item').removeClass("active");
                var text = $(e.target).text();
                //$(".yslztj-nav-btn-wrap button.XZQY")[0].innerHTML = text;
                if ($(e.target).hasClass("active")) {
                    $(e.target).removeClass("active");

                    var layerId = parseInt($(e.target).attr("layerid"));
                    hlLayer.removeLayer(layerId);
                    $(e.target).removeClass("now");
                    //$('.RN-district-item').find("li").addClass("now");

                    if (!$(e.target).siblings("li").hasClass("active")) {    //如果所有二级区域都未被选中
                        $('.RN-district-item').addClass("active");
                        text = Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue;
                    } else {
                        return;
                    }
                } else {
                    $(e.target).addClass("active");
                }
            }
            this.RegionFeature = null;

            //var li_active = "active";

            //$(e.target).siblings("li").removeClass(li_active).end().addClass(li_active);

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
                    //hlLayer.clearLayers();
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
                        $(".now").attr("layerid", geo._leaflet_id);
                        $(".now").removeClass("now");
                    }
                    /*
                    if (Project_ParamConfig.yslztjConfig.PreResult) {
                        this.ajax = new L.DCI.Ajax();
                        var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/";
                        var newUrl = url
                            + "analysis/landbpre/read/ls/" + text;

                        this.ajax.get(newUrl, null, true, this, function (res) {
                            this.hideLoading();
                            if (res[0].name == "无结果") {
                                //this.offContent();
                                L.dci.app.util.dialog.alert("温馨提示", "没有用地强度查询结果");
                            } else {
                                this.TableData0 = res;
                                this.showContent();
                            }
                        }, function () {

                            var feature = this.RegionFeature;
                            var coordinates = feature.geometry.coordinates;
                            for (var i = 0; i < coordinates[0].length; i++) {
                                var cache = coordinates[0][i][0];
                                coordinates[0][i][0] = coordinates[0][i][1];
                                coordinates[0][i][1] = cache;
                            }
                            var lay = L.polygon(coordinates);

                            var featureSet = new L.DCI.FeatureSet();
                            featureSet.features = [lay];
                            this.selectRegion = featureSet;
                            //Project_ParamConfig.yslztjConfig.inputParams.selectRegion = this.selectRegion;
                            //this.getService();

                        });
                    } else {

                        var coordinates = feature.geometry.coordinates;
                        for (var i = 0; i < coordinates[0].length; i++) {
                            var cache = coordinates[0][i][0];
                            coordinates[0][i][0] = coordinates[0][i][1];
                            coordinates[0][i][1] = cache;
                        }
                        var lay = L.polygon(coordinates);

                        var featureSet = new L.DCI.FeatureSet();
                        featureSet.features = [lay];
                        this.selectRegion = featureSet;
                        //Project_ParamConfig.yslztjConfig.inputParams.selectRegion = this.selectRegion;
                        //this.getService();
                    }
                    */

                } else {
                    //this.offContent();
                    L.dci.app.util.dialog.alert("温馨提示", "没有区域查询结果");
                }
            }, this);
        },

        /**
        *筛选条件改变请求数据
        *@method requestData
        */
        requestData: function () {
            $(".yslztj-nav-btn-start>button").css("display", "none");  //隐藏“开始分析”按钮

            //清空table
            $(".yslztj-table-wrap").html("");

            //获取筛选条件中的时间
            //var currentYear = $(this._container).find('.yslztj-yselector-year.selected').attr("value").toString();
            var currentYear = this.parameters.year.toString();
            if ($(this._container).find('td').hasClass("selected")) {   //如果有月份被选择
                this.currentTime = "";
                var obj = $(this._container).find('td.selected');
                for (var i = 0; i < obj.length; i++) {
                    if ($(obj[i]).attr("value").length == 1) {
                        this.currentTime += currentYear + "-0" + $(obj[i]).attr("value") + ",";
                    } else {
                        this.currentTime += currentYear + "-" + $(obj[i]).attr("value") + ",";
                    }
                }
            } else {
                this.currentTime = currentYear;
            }

            //if ($(".yslztj-loadflash").css("z-index") != "0") {
            this.showLoading()
            //}
            Project_ParamConfig.yslztjConfig.inputParams.NowTime = this.currentTime;

            //获取筛选条件中的区域名
            var regionName = "";
            var regions = $('.RN-town-item.active');
            if (regions.length > 0) {
                for (var j = 0; j < regions.length; j++) {
                    regionName += regions[j].innerHTML;
                    if (j < regions.length - 1) {
                        regionName += ",";
                    }
                }
                if (regions.length == 1) {
                    this.currentTitle.region = regionName;
                } else {
                    this.currentTitle.region = "";
                }
            } else {
                regionName = "all";
                this.currentTitle.region = "江阴市";
            }
            this.currentTitle.certificate = "选址意见书";
            $(".yslztj-table-title").html(this.currentTitle.region + this.currentTitle.certificate + this.currentTitle.countStatistics);
            Project_ParamConfig.yslztjConfig.inputParams.RegionName = regionName;

            //发起请求进行筛选
            this.getService();
        },

        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getService: function () {

            var url = Project_ParamConfig.yslztjConfig.url;
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(url,
                Project_ParamConfig.yslztjConfig.inputParams,
                Project_ParamConfig.yslztjConfig.outParams,
                $.proxy(this.returnGPData, this),
                $.proxy(this.resultImageLayerHandler, this),
                $.proxy(this.errorHandler, this));
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

            if (value == "[]" || value == "[[[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []]]" || value == null) {
                this.sumData = [[], [], []];
                //this.offContent();
                L.dci.app.util.dialog.alert("温馨提示", "未查找到数据!");
            } else {
                //this.TableData0 = JSON.parse(value);
                this.TableData0 = value;
                if (this.TableData0.length > 0) {
                    this.showContent();
                }
            }
        },

        /**
        *填充图表并显示
        *@method showContent
        *@private
        */
        showContent: function () {
            $(".yslztj-table-wrap").css({ "display": "block" });
            $(".yslztj-chart-wrap").css({ "display": "block" });

            $(".leaflet-marker-pane").html("");

            //插入table整体布局
            this.setTableHTML();
            this.sumData = [[], [], []];
            
            for (var j = 0; j < this.TableData0.length; j++) {
                if (j == 0) {
                    var table = this.TableData0[j].XZFT_Result;
                    var tableContainer = $("#XZYJS1 table");
                } else if (j == 1) {
                    var table = this.TableData0[j].GHYD_Result;
                    var tableContainer = $("#YDXKZ2 table");
                } else {
                    var table = this.TableData0[j].GCYD_Result;
                    var tableContainer = $("#GCXKZ3 table");
                }

                var sum_sumCount = 0;
                var sum_sumArea = 0;
                for (var k = 0; k < table.length; k++) {
                    var regionName = table[k].RegionName;
                    var trData = table[k].out_result;

                    if (trData != undefined && trData.length != 0) {

                        if (table[k].RegionName != Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue) {//筛掉全市域数据
                            var nameTr = "<th>行政区域</th>";   //用地性质行
                            var countTr = "<tr><td>" + regionName + "</td>";   //地块数行
                            var areaTr = "<tr><td>" + regionName + "</td>";   //用地面积行

                            //clone最左列，即行政区域名列
                            if (j == 0) {
                                $("#tableClone").find("thead").find("tr").html(nameTr);
                                $("#tableClone").find("tbody").append(countTr + "</tr>");
                            }

                            for (var i = 0; i < trData.length; i++) {
                                nameTr += "<th>" + trData[i].markName + "</th>";
                                countTr += "<td>" + trData[i].markCount + "</td>";
                                areaTr += "<td>" + trData[i].sumArea + "</td>";

                                if (this.sumData[j][i] == undefined) {
                                    this.sumData[j][i] = new Object();
                                    this.sumData[j][i].markCount = 0;
                                    this.sumData[j][i].sumArea = 0;
                                }
                                this.sumData[j][i].markName = trData[i].markName;   //记录用地性质
                                this.sumData[j][i].markCount += parseInt(trData[i].markCount);   //地块数总计
                                this.sumData[j][i].sumArea += parseFloat(trData[i].sumArea);   //用地面积总计
                            }
                            nameTr += "<th>合计</th>";
                            countTr += "<td>"+ table[k].sumCount + "</td></tr>";
                            areaTr += "<td>" + parseInt(table[k].sumArea).toFixed(2) + "</td></tr>";

                            sum_sumCount += parseInt(table[k].sumCount);
                            sum_sumArea += parseInt(table[k].sumArea);

                            if (k == 0) {
                                tableContainer.find("thead").find("tr").html(nameTr);
                            }
                            $(tableContainer[0]).find("tbody").append(countTr);
                            $(tableContainer[1]).find("tbody").append(areaTr);
                        }
                        //生成合计行
                        if ((k == table.length - 1) && table.length > 1) {
                            if (j == 0) {
                                $("#tableClone").find("tbody").append("<tr><td>合计</td></tr>");
                            }

                            var tr_sum0 = "<tr><td>合计</td>";
                            for (var n = 0; n < trData.length; n++) {
                                tr_sum0 += "<td>" + this.sumData[j][n].markCount + "</td>";
                            }
                            tr_sum0 += "<td>" + sum_sumCount + "</td></tr>";
                            $(tableContainer[0]).find("tbody").append(tr_sum0);

                            var tr_sum1 = "<tr><td>合计</td>";
                            for (var n = 0; n < trData.length; n++) {
                                tr_sum1 += "<td>" + this.sumData[j][n].sumArea.toFixed(2) + "</td>";
                            }
                            tr_sum1 += "<td>" + sum_sumArea.toFixed(2) + "</td></tr>";
                            $(tableContainer[1]).find("tbody").append(tr_sum1);
                        }
                    }
                }

            }

            //动态设置table冻结列，即行政区域名列的高度
            var thHeight = $($("#XZYJS1 table > thead > tr > th")[0]).height();
            var tdHeight = $($("#XZYJS1 table > tbody > tr > td")[0]).height();
            $("#tableClone table > thead > tr > th").css("height", thHeight + 10);
            $("#tableClone table > tbody > tr > td").css("height", tdHeight + 2);

            //pie
            this.setPieHTML();
            //动态设置pie容器的高度
            //var currentHeight = $(".yslztj-pie").height();
            //var length = this.sumData.length;
            //var height = currentHeight + length * 18;
            //$(".yslztj-pie").css("height", height);

            this.setPieOptions1(this.sumData[0], '地块数统计');
            this.setPieOptions2(this.sumData[0], '用地面积统计');
            this.setPie1();
            this.setPie2();

            $(".yslztj-chart-wrap").css({ "display": "none" });
        },

        /**
        *插入Table整体布局
        *@method setTableHTML
        *@private
        */
        setTableHTML: function () {
            var html = '<ul class="nav nav-tabs">'
                        + '<li class="active"><a href="#XZYJS1" data-toggle="tab" aria-controls="XZYJS1" aria-expanded="true">选址意见书</a></li>'
                        + '<li><a href="#YDXKZ2" data-toggle="tab" aria-controls="YDXKZ2" aria-expanded="true">建设用地规划许可证</a></li>'
                        + '<li><a href="#GCXKZ3" data-toggle="tab" aria-controls="GCXKZ3" aria-expanded="true">建设工程规划许可证</a></li>'
                     + '</ul>'

                     + '<div class="switch-icon">'
                         + '<span class="icon-downloadicon" id="toxls" title="导出Excel文件"></span>'
                         + '<span class="acharts-charts-tool icon-business-analysis" title="显示统计图"></span>'
                         + '<span class="switch-sum-area land-sum" title="显示用地面积">数量</span>'
                     + '</div>'
                     + '<div class="tab-content">'
                     + '<div class="tab-content">'

                        + '<div class="tab-pane fade active in" id="XZYJS1" aria-labelledby="XZYJS1-tab">'
                            + '<table class="table table-bordered" id="xzyjsTable">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="XZYJS1_body">'
                                + '</tbody>'
                            + '</table>'
                            + '<table class="table table-bordered" id="xzyjsTable2">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="XZYJS1_body">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'

                        + '<div class="tab-pane fade" id="YDXKZ2" aria-labelledby="YDXKZ2-tab">'
                            + '<table class="table table-bordered" id="ydxkzTable">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="YDXKZ2_body">'
                                + '</tbody>'
                            + '</table>'
                            + '<table class="table table-bordered" id="ydxkzTable2">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="YDXKZ2_body">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'

                        + '<div class="tab-pane fade" id="GCXKZ3" aria-labelledby="GCXKZ3-tab">'
                            + '<table class="table table-bordered" id="gcxkzTable">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="GCXKZ3_body">'
                                + '</tbody>'
                            + '</table>'
                            + '<table class="table table-bordered" id="gcxkzTable2">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="GCXKZ3_body">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'

                     + '</div>'
                     + '</div>'

                        + '<div class="tab-pane fade active in" id="tableClone">'
                            + '<table class="table table-bordered">'
                                + '<thead>'
                                    + '<tr>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'

                     + '<div class="print"><span class="icon-Viewform"></span></div>';

            $(".yslztj-table-wrap").html(html);
            //滚动条
            $(".yslztj-table-wrap > .tab-content").mCustomScrollbar({
                theme: "minimal-dark", horizontalScroll: true
            });
            var _this = this;
            //添加nav-tabs标签页切换按钮点击事件
            $(".yslztj-table-wrap .nav-tabs li").on('click', function (e) {
                _this.clickSwitchTable(e);
            });

            //添加图表切换按钮点击事件
            $(".acharts-charts-tool").on('click', function () {
                _this.clickSwitchTableChart();
            });

            //添加地块数、用地面积切换按钮点击事件
            $(".switch-sum-area").on('click', function () {
                _this.clickSwitchSumArea();
            });


            //导出excel方法
            $("#toxls").on('click', { context: this }, function (e) {
                L.txls = new L.DCI.TXls();
                $('#toxls').removeClass('collapsed');

                if ($($(_this.currentTable).find("table")[0]).css("display") == "table") {
                    var container = $(_this.currentTable).find("table")[0];
                } else {
                    var container = $(_this.currentTable).find("table")[1];
                }
                //var container = ".yslztj-table-wrap " + _this.currentTable;
                L.txls.converttoxls(container);

            });
        },

        /**
        *切换图表
        *@method clickSwitchTableChart
        *@param e{Object}
        *@private
        */
        clickSwitchTableChart: function () {
            if ($(".acharts-charts-tool").hasClass("icon-Viewform")) {   //如果当前显示的是统计图
                $(".acharts-charts-tool").removeClass("icon-Viewform");
                $(".acharts-charts-tool").addClass("icon-business-analysis");
                $(".acharts-charts-tool").attr("title", "显示统计图");

                var _this = this;
                //添加地块数、用地面积切换按钮点击事件
                $(".switch-sum-area").on('click', function () {
                    _this.clickSwitchSumArea();
                });
                $(".switch-sum-area").css("background-color", "orange");

                $(".yslztj-chart-wrap").css({ "display": "none" });
                $(".yslztj-table-wrap .tab-content").css({ "display": "block" });
                $("#tableClone").css({ "left": "0px" });
                $(".yslztj-table-wrap .tab-content .mCSB_container").css({ "left": "0px" });
                $(".yslztj-table-wrap .tab-content .mCSB_dragger").css({ "left": "0px" });

            } else {   //如果当前显示的是数据表
                $(".acharts-charts-tool").removeClass("icon-business-analysis");
                $(".acharts-charts-tool").addClass("icon-Viewform");
                $(".acharts-charts-tool").attr("title", "显示数据表");

                $(".switch-sum-area").unbind('click');
                $(".switch-sum-area").css("background-color", "#787878");

                $(".yslztj-table-wrap .tab-content").css({ "display": "none" });
                $("#tableClone").css({ "left": "-180px" });
                //$(this.currentTable).find("table").css({ "display": "none" });
                $(".yslztj-chart-wrap").css({ "display": "block" });

                switch (this.currentTable) {
                    case '#XZYJS1':
                        this.refleshPie(this.sumData[0], this.currentTable);
                        break;
                    case '#YDXKZ2':
                        this.refleshPie(this.sumData[1], this.currentTable);
                        break;
                    case '#GCXKZ3':
                        this.refleshPie(this.sumData[2], this.currentTable);
                        break;
                    default:
                        break;
                }
            }
        },

        /**
        *切换地块数、用地面积表格
        *@method clickSwitchSumArea
        *@param e{Object}
        *@private
        */
        clickSwitchSumArea: function () {
            if ($(".switch-sum-area").hasClass("land-area")) {   //如果当前显示的是用地面积
                $(".switch-sum-area").removeClass("land-area");
                $(".switch-sum-area").addClass("land-sum");
                $(".switch-sum-area").attr("title", "显示用地面积");
                $(".switch-sum-area").html("数量");
                $(".yslztj-table-title").html(this.currentTitle.region + this.currentTitle.certificate + this.currentTitle.countStatistics);

                $($(this.currentTable).find("table")[1]).css({ "display": "none" });
                $($(this.currentTable).find("table")[0]).css({ "display": "table" });
            } else {   //如果当前显示的是地块数
                $(".switch-sum-area").removeClass("land-sum");
                $(".switch-sum-area").addClass("land-area");
                $(".switch-sum-area").attr("title", "显示地块数");
                $(".switch-sum-area").html("面积");
                $(".yslztj-table-title").html(this.currentTitle.region + this.currentTitle.certificate + this.currentTitle.areaStatistics);

                $($(this.currentTable).find("table")[0]).css({ "display": "none" });
                $($(this.currentTable).find("table")[1]).css({ "display": "table" });
            }
        },

        /**
        *切换表格标签页
        *@method clickSwitchTable
        *@param e{Object}
        *@private
        */
        clickSwitchTable: function (e) {
            if (this.currentTable == $(e.currentTarget).find("a").attr("href")) {
                return;
            }

            this.currentTable = $(e.currentTarget).find("a").attr("href");
            this.currentTitle.certificate = $(e.currentTarget).find("a").html();
            $(".yslztj-table-title").html(this.currentTitle.region + this.currentTitle.certificate + this.currentTitle.countStatistics);

            $($(this.currentTable).find("table")[1]).css({ "display": "none" });
            $($(this.currentTable).find("table")[0]).css({ "display": "table" });

            if ($($(this.currentTable).find("table")[0]).find("tr").html() == "") {   //如果当前表格为空，隐藏左边冻结列
                $("#tableClone").css({ "display": "none" });
            } else {
                $("#tableClone").css({ "display": "block" });
            }

            if ($(".switch-sum-area").hasClass("land-area")) {   //如果当前显示的是用地面积，改为默认显示地块数
                $(".switch-sum-area").removeClass("land-area");
                $(".switch-sum-area").addClass("land-sum");
                $(".switch-sum-area").attr("title", "显示用地面积");
                $(".switch-sum-area").html("数量");
                //$(".yslztj-table-title").html(this.currentTitle.region + this.currentTitle.certificate + this.currentTitle.countStatistics);
            }
            if ($(".acharts-charts-tool").hasClass("icon-Viewform")) {   //如果当前显示的是统计图，改为默认显示数据表
                $(".acharts-charts-tool").removeClass("icon-Viewform");
                $(".acharts-charts-tool").addClass("icon-business-analysis");
                $(".acharts-charts-tool").attr("title", "显示统计图");

                $(".yslztj-chart-wrap").css({ "display": "none" });
                $(".yslztj-table-wrap .tab-content").css({ "display": "block" });
                $("#tableClone").css({ "left": "0px" });

                //添加地块数、用地面积切换按钮点击事件
                var _this = this;
                $(".switch-sum-area").on('click', function () {
                    _this.clickSwitchSumArea();
                });
                $(".switch-sum-area").css("background-color", "orange");
            }
            $(".yslztj-table-wrap .tab-content").mCustomScrollbar("scrollTo", "left");
            $(".yslztj-table-wrap .tab-content .mCSB_container").css({ "left": "0px" });
            $(".yslztj-table-wrap .tab-content .mCSB_dragger").css({ "left": "0px" });

            this.deleteService();
            var text = this.currentTable;
            switch (text) {
                case '#XZYJS1':
                    this.lyrIndex = 5;
                    this.addService(this.lyr_xzyjs);
                    //this.refleshPie(this.sumData[0], text);
                    break;
                case '#YDXKZ2':
                    this.lyrIndex = 6;
                    this.addService(this.lyr_ydxkz);
                    //this.refleshPie(this.sumData[1], text);
                    break;
                case '#GCXKZ3':
                    this.lyrIndex = 7;
                    this.addService(this.lyr_gcxkz);
                    //this.refleshPie(this.sumData[2], text);
                    break;
                default:
                    break;
            }
        },

        /**
        *插入饼状图整体布局
        *@method setPieHTML
        *@private
        */
        setPieHTML: function () {
            var html = '<div id="yslztj-pie1" class="yslztj-pie chart-item leftpie">'
                     + '</div>'
                     + '<div id="yslztj-pie2" class="yslztj-pie chart-item rightpie">'
                     + '</div>';

            $(".yslztj-chart-wrap").html(html);
        },

        /**
        *设置pie1的参数
        *@method setPieOptions1
        *@param sumData{Array}
        *@param title{String}
        *@private
        */
        setPieOptions1: function (sumData, title) {
            this.pieOption1 = null;
            var legendData = [];
            var pieData = [];
            for (var i = 0; i < sumData.length; i++) {
                if (sumData[i].markCount != 0) {
                    legendData.push(sumData[i].markName);
                    //pieData.push({ "value": sumData[i].ydmjzb, "name": sumData[i].fwhf });
                    pieData.push({ "value": sumData[i].markCount, "name": sumData[i].markName });
                }
            }

            this.pieOption1 = {
                tooltip: {
                    show: true,
                    textStyle: {
                        align: 'center'
                    },
                    formatter: "{b}<br/>地块数：{c}"  //{b}<br/>{c}({d}%)
                },
                title: {
                    text: title,
                    subtext: '',
                    x: 'center'
                },
                legend: {
                    x: 'left',
                    y: '240px',
                    data: legendData
                },
                color: ['#ff6464', '#ff9664', '#ffcd64', '#e6f03c', '#5af0a0', '#5af0e6', '#78c8f0', '#7882f0', '#b478f0', '#f078dc'],
                series: [
                    {
                        type: 'pie',
                        radius: '50%',
                        center: ['50%', '40%'],
                        //radius: '80px',
                        //center: ['50%', '150px'],
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'outer',
                                    formatter: function (params) {
                                        return (params.percent - 0) + '%'
                                    }
                                },
                                labelLine: {
                                    show: true,
                                    length: 5
                                }
                            }
                            //emphasis: {
                            //    label: {
                            //        position: 'inner',
                            //        show: true,
                            //        formatter: "{b}\n{c}"
                            //    }
                            //}
                        },
                        data: pieData
                    }
                ]
            };

        },
        /**
        *设置pie2的参数
        *@method setPieOptions2
        *@param sumData{Array}
        *@param title{String}
        *@private
        */
        setPieOptions2: function (sumData, title) {
            this.pieOption2 = null;
            var legendData = [];
            var pieData = [];
            for (var i = 0; i < sumData.length; i++) {
                if (sumData[i].sumArea != 0) {
                    legendData.push(sumData[i].markName);
                    pieData.push({ "value": sumData[i].sumArea, "name": sumData[i].markName });
                }
            }

            this.pieOption2 = {
                tooltip: {
                    show: true,
                    textStyle: {
                        align: 'center'
                    },
                    formatter: "{b}<br/>用地面积：{c}(m²)"
                },
                title: {
                    text: title,
                    subtext: '',
                    x: 'center'
                },
                legend: {
                    x: 'left',
                    y: '240px',
                    data: legendData
                },
                color: ['#ff6464', '#ff9664', '#ffcd64', '#e6f03c', '#5af0a0', '#5af0e6', '#78c8f0', '#7882f0', '#b478f0', '#f078dc'],
                series: [
                    {
                        type: 'pie',
                        radius: '50%',
                        center: ['50%', '40%'],
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'outer',
                                    formatter: function (params) {
                                        return (params.percent - 0) + '%'
                                    }
                                },
                                labelLine: {
                                    show: true,
                                    length: 5
                                }
                            }

                        },
                        data: pieData
                    }
                ]
            };
        },
        /**
        *填充pie1
        *@method setPie1
        *@private
        */
        setPie1: function () {
            var chart = echarts.init(document.getElementById('yslztj-pie1'));
            chart.setOption(this.pieOption1);
        },
        /**
        *填充pie2
        *@method setPie2
        *@private
        */
        setPie2: function () {
            var chart = echarts.init(document.getElementById('yslztj-pie2'));
            chart.setOption(this.pieOption2);
        },

        /**
        *重新刷新pie数据
        *@method reflesh
        *param data{Array}
        *param title{String}
        *@private
        */
        refleshPie: function (data, title) {
            this.setPieOptions1(data, '地块数统计');
            this.setPieOptions2(data, '用地面积统计');
            this.setPie1();
            this.setPie2();
        },

        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            this.clearHL();
            this.deleteService();
            L.dci.app.pool.remove('Certificate');
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
        *加载专题服务
        *@method addService
        */
        addService: function (layer) {
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            this.baseLyr = layer;
            this.baseLyr.addTo(this.map.getMap());
        },
        /**
        *删除专题服务
        *@method deleteService
        */
        deleteService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.removeLayer(this.baseLyr.options.id);
        },

        /**
        *显示正在加载图标
        *@method showLoading
        *@private
        */
        showLoading: function () {
            $(".yslztj-loadflash").css("z-index", "0");
        },
        /**
        *隐藏正在加载图标
        *@method hideLoading
        *@private
        */
        hideLoading: function () {
            $(".yslztj-loadflash").css("z-index", "-1");
        },

    });
    return L.DCI.Certificate;
});