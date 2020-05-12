/**
*可用地存量分析模块类
*@module modules.analysis
*@class DCI.LandBalance
*@constructor initialize
*@extends Class
*/
define("analysis/landstock", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "library/echarts",
    "analysis/addcad",
    "analysis/gpHandler",
    "query/contain",
    "util/txls"
], function (L) {
    L.DCI.LandStock = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'LandStock',
        layerid: '可用地存量分析',
        /**
        *整体布局
        *@property tempHtml
        *@type {String}
        */
        tempHtml: '<div class="ydph-content">'
                    + '<div class="ydph-nav-wrap"></div>'
                    + '<div class="landst-table-wrap"></div>'
                    + '<div class="ydph-chart-wrap"></div>'
                + '</div>'
                + '<div class="ydph-loadflash">'
                    + '<div class="loadingFlash"><span class="icon-loading"></span>'
                    + '</div>'
                    + '<div class="loadingText">服务器正在处理请求，请耐心等待...</div>'
                + '</div>',
        /**
        *tabs1页面数据
        *@property tabsData1
        *@type {Object}
        *@private
        */
        tabsData1: null,      //tabs1页面数据
        /**
        *table数据
        *@property tableData
        *@type {Object}
        *@private
        */
        tableData: null,      //table数据
        pieOption: null,      //饼状图参数
        barOption: null,      //柱状图参数

        planTotalArea: 0,       //规划用地总面积
        chartColors: ['#ff6464', '#ff9664', '#ffcd64', '#e6f03c', '#5af0a0', '#5af0e6', '#78c8f0', '#7882f0', '#b478f0', '#f078dc'],
        url: '',             //图层服务地址
        layerIndex: 0,        //图层索引
        query_geo: null,     //查询范围
        //范围
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
        *初始化
        *@method initialize
        */
        initialize: function () {

            L.DCI.App.pool.get('LeftContentPanel').show(this,
                function () {
                    _this.getTabsData1();
                    //_this._moveMap();
                });

            //绘图工具
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //清除地图其他操作
            this.map.clear();
            this._polygon = new L.DCI.DrawPolygons(this.map.map);


            this.addService();      //加载地图
            var _this = this;
            
            $(".leftcontentpanel-title>span:first").html("可用地存量分析");         //标题
            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.tempHtml);
            //滚动条
            $(".ydph-content").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //获取行政区划信息
            //this.getTabsData1();
            //插入tab整体布局
            this.setTabsHTML();
            //this.setTabs1();        //填充tab1

            //tab按钮点击事件
            $(".ydph-nav-btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.clickTabBtn(e); });
            ////行政区域---点击事件
            //$(".ydph-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
            //自定义区域---点击事件
            $("#QYHZ").on('click', { context: this }, function (e) { e.data.context.clickBtnEvent(e); });
            //范围线上传---点击事件
            $(".ydph-nav-collapse-wrap #RNW-FWXSC2>.btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });
            $("#FWXSC").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });

            //输出表格
            $(".landst-table-wrap .print").on('click', { context: this }, function (e) { e.data.context.printExcel(e); });

            //导出excel方法
            var _this = this;
            $("#toxls").on('click', { context: this }, function (e) {
                L.txls = new L.DCI.TXls();
                $('#toxls').removeClass('collapsed');
                L.txls.converttoxls(".landst-table-wrap");

            });
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
            L.dci.app.pool.remove('LandStock');
        },

        /**
        *调整地图位置
        *@method _moveMap
        */
        _moveMap: function () {
            //$("#menu_FullExtent").click();
            $(".leaflet-control-pan-left")[0].click();
        },

        /**
        *加载专题服务
        *@method addService
        */
        addService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            this.url = Project_ParamConfig.landLayers[0].url;
            this.layerIndex = Project_ParamConfig.landLayers[0].layerIndex;
            L.esri.dynamicMapLayer(this.url, { id: '可用地存量分析', layers: [this.layerIndex] }).addTo(map);
        },
        /**
        *删除专题服务
        *@method deleteService
        */
        deleteService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id == "可用地存量分析" && layer.options.id != null) {
                    map.removeLayer(layer.options.id);
                }
            });
        },

        /**
        *插入tab整体布局
        *@method setTabsHTML
        *@private
        */
        setTabsHTML: function () {
            //tab页整体布局
            var tabHtml = '<div class="ydph-nav-btn-wrap">'
                            + '<button class="btn" href="#RNW-XZQY1" data-toggle="wz-collapse" aria-controls="RNW-XZQY1" aria-expanded="true">行政区域</button>'
                            + '<button class="btn" id="QYHZ">区域绘制</button>'
                            + '<button class="btn" id="FWXSC" href="#RNW-FWXSC2" data-toggle="wz-collapse" aria-controls="RNW-FWXSC2" aria-expanded="true">范围线上传</button>'
                            + '<div>'
                                + '<span class="icon-downloadicon" id="toxls" title="导出Excel文件"></span>'
                            + '</div>'
                            + '<div>'
                                + '<span class="acharts-charts-tool icon-business-analysis" title="显示统计图"></span>'
                            + '</div>'
                        + '</div>'
                        + '<div class="ydph-nav-collapse-wrap"></div>';

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
                                + '<button class="btn pointBtn">点选</button>'
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
            $(".ydph-nav-wrap").html(tabHtml);
            $(".ydph-nav-collapse-wrap").append(tabHtml1);
            $(".ydph-nav-collapse-wrap").append(tabHtml2);
            $(".ydph-nav-collapse-wrap").append(tabHtml3);

            //添加图表切换按钮点击事件
            $(".acharts-charts-tool").on('click', function () {
                if ($(".acharts-charts-tool").hasClass("icon-Viewform")) {
                    $(".acharts-charts-tool").removeClass("icon-Viewform");
                    $(".acharts-charts-tool").addClass("icon-business-analysis");
                    $(".acharts-charts-tool").attr("title", "显示统计图");
                    $(".ydph-chart-wrap").css({ "display": "none" });
                    $(".landst-table-wrap").css({ "display": "block" });
                } else {
                    $(".acharts-charts-tool").removeClass("icon-business-analysis");
                    $(".acharts-charts-tool").addClass("icon-Viewform");
                    $(".acharts-charts-tool").attr("title", "显示数据表");
                    $(".landst-table-wrap").css({ "display": "none" });
                    $(".ydph-chart-wrap").css({ "display": "block" });
                }
            });
        },
        /**
        *获取tab1数据
        *@method getTabsData1
        *@private
        */
        getTabsData1: function () {

            L.dci.app.services.baseService.getXingzheng({
                context: this,
                success: function (res) {
                    this.tabsData1 = null;
                    this.tabsData1 = {
                        "district": Project_ParamConfig.xingzhengConfig.xzqh,
                        "towns": [
                        ]
                    };
                    for (var rn in res) {
                        this.tabsData1.towns.push(res[rn].RegionName);
                    }
                    this.setTabs1();
                    //行政区域---点击事件
                    $(".ydph-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".ydph-nav-collapse-wrap .RN-district-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".ydph-nav-collapse-wrap .RN-district-item")[0].click();
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "行政区划信息获取失败，请检查该服务。");
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
        /**
        *隐藏图表
        *@method offContent
        */
        offContent: function () {
            $(".landst-table-wrap").css({ "display": "none" });
            $(".ydph-chart-wrap").css({ "display": "none" });
        },
        /**
        *填充图表并显示
        *@method showContent
        *@private
        */
        showContent: function () {
            //插入table整体布局
            this.setTableHTML();
            //插入charts整体布局
            this.setChartsHTML();
            //动态设置pie容器的高度
            var currentHeight = $("#ydph-pie").height();
            var length = this.tableData.length;
            var height = currentHeight + length * 18;
            $("#ydph-pie").css("height", height);

            $(".landst-table-wrap").css({ "display": "block" });
            $(".ydph-chart-wrap").css({ "display": "block" });

            this.setTable(this.tableData);
            this.setPieOptions(this.tableData, '城市建设用地统计');
            this.setPie();
            this.setBarContent();

            //隐藏统计图
            $(".ydph-chart-wrap").css({ "display": "none" });
            //$(".acharts-charts-tool").click();

            //展开或隐藏table
            $(".landst-talbe-body").on('click', '.hastables', { context: this }, function (e) { e.data.context.showTrEvent(e); });
            $(".landst-talbe-body").on('click', '.colspan3', { context: this }, function (e) { e.data.context.clickTrEvent(e); });
            //点击表头，回复显示所有类型地块
            $(".landst-talbe-head .colspan3").on('click', { context: this }, function (e) { e.data.context.landType(e); });
        },
        /**
        *插入table整体布局
        *@method setTableHTML
        *@private
        */
        setTableHTML: function () {
            var html = '<div class="landst-talbe-head">'
                        + '<table class="table table-bordered" id="landstTable1">'
                            + '<thead>'
                                + '<tr>'
                                    + '<th rowspan="2" class="colspan1"></th>'
                                    + '<th rowspan="2" class="colspan2">用地代码</th>'
                                    + '<th rowspan="2" class="colspan3">用地名称</th>'
                                    + '<th rowspan="2" class="colspan4">可用地总面积(m²)</th>'
                                    + '<th rowspan="2" class="colspan5">面积比例(%)</th>'                                    
                                + '</tr>'
                            + '</thead>'
                        + '</table>'
                    + '</div>'
                    + '<div class="landst-talbe-body">'
                        + '<table class="table table-bordered firsttable" id="landstTable">'
                            + '<tbody class="landst-talbe-tbody">'
                            + '</tbody>'
                        + '</table>'
                      + '</div>'
                      + '<div class="print"><span class="icon-Viewform"></span></div>'
                      + '</div>';

            $(".landst-table-wrap").html(html);

            //滚动条
            $(".landst-talbe-body").mCustomScrollbar({
                theme: "minimal-dark"
            });
        },
        /**
        *插入图表整体布局
        *@method setChartsHTML
        *@private
        */
        setChartsHTML: function () {
            var html = '<div id="ydph-pie" class="chart-item leftpie">'
                     + '</div>'
                     + '<div id="ydph-bar" class="chart-item rightbar">'
                        + '<div class="barcontainer tab-content">'
                        + '</div>'
                        + '<div class="bartabs">'
                            + '<ul>'
                            + '</ul>'
                        + '</div>'
                        + '<div class="barUnit">单位：平方米(m²)</div>'
                     + '</div>';

            $(".ydph-chart-wrap").html(html);
        },
        /**
        *填充table
        *@method setTable
        *param data{Array}
        *@private
        */
        setTable: function (data) {
            var container = ".landst-talbe-tbody";
            $(container).html("");
            //计算城市用地总面积
            var totalArea_plan = 0;
            for (var i = 0; i < this.tableData.length; i++) {
                //统计一级数据和
                var data = this.tableData;
                totalArea_plan += data[i].area;
            }
            var _totalArea_plan = totalArea_plan / 100;


            //插入一级（tr）数据并显示
            for (var i = 0; i < data.length; i++) {
                var tr = '';
                if (data[i].items.length == 0) {//普通的一级tr
                    var scale = data[i].scale.substring(0, data[i].scale.length - 1);
                    tr = '<tr class="levelOne" level="1" dataid="' + data[i].MARK + '" pid="" gpid="">'
                        + '<td class="colspan1"></td>'
                        + '<td class="colspan2">' + data[i].MARK + '</td>'
                        + '<td class="colspan3">' + data[i].name + '</td>'
                        + '<td class="colspan4">' + data[i].area + '</td>'
                        + '<td class="colspan5">' + (data[i].area / _totalArea_plan).toFixed(2) + '</td>'
                      + '</tr>';
                    $(container).append(tr);
                }
                else {//含二级元素的一级tr
                    var scale = data[i].scale.substring(0, data[i].scale.length - 1);
                    tr = '<tr class="hastables levelOne" level="1" dataid="' + data[i].MARK + '" pid="" gpid="">'
                        + '<td class="colspan1 signOne">+</td>'
                        + '<td class="colspan2">' + data[i].MARK + '</td>'
                        + '<td class="colspan3">' + data[i].name + '</td>'
                        + '<td class="colspan4">' + data[i].area + '</td>'
                        + '<td class="colspan5">' + (data[i].area / _totalArea_plan).toFixed(2) + '</td>'
                      + '</tr>';
                    $(container).append(tr);

                    //插入二级（tr）数据并隐藏
                    var secondData = data[i].items;
                    for (var j = 0; j < secondData.length; j++) {
                        var secondTr = '';
                        if (secondData[j].items.length == 0) {//普通的二级tr
                            var scale = secondData[j].scale.substring(0, secondData[j].scale.length - 1);
                            secondTr = '<tr class="levelTwo" level="2" dataid="' + secondData[j].MARK + '" pid="' + data[i].MARK + '" gpid="' + data[i].MARK + '" style="display:none;">'
                                        + '<td class="colspan1"></td>'
                                        + '<td class="colspan2">' + secondData[j].MARK + '</td>'
                                        + '<td class="colspan3">' + secondData[j].name + '</td>'
                                        + '<td class="colspan4">' + secondData[j].area + '</td>'
                                        + '<td class="colspan5">' + (secondData[j].area / _totalArea_plan).toFixed(2) + '</td>'
                                     + '</tr>';
                            $(container).append(secondTr);
                        }
                        else {//含三级元素的二级tr
                            var scale = secondData[j].scale.substring(0, secondData[j].scale.length - 1);
                            secondTr = '<tr class="hastables levelTwo" level="2" dataid="' + secondData[j].MARK + '" pid="' + data[i].MARK + '" gpid="' + data[i].MARK + '" style="display:none;">'
                                        + '<td class="colspan1 signTwo">+</td>'
                                        + '<td class="colspan2">' + secondData[j].MARK + '</td>'
                                        + '<td class="colspan3">' + secondData[j].name + '</td>'
                                        + '<td class="colspan4">' + secondData[j].area + '</td>'
                                        + '<td class="colspan5">' + (secondData[j].area / _totalArea_plan).toFixed(2) + '</td>'
                                    + '</tr>';
                            $(container).append(secondTr);

                            //插入三级（tr）数据并隐藏
                            var thirdData = secondData[j].items;
                            for (var k = 0; k < thirdData.length; k++) {
                                var thirdTr = '';
                                var scale = thirdData[k].scale.substring(0, secondData[j].scale.length - 1);
                                thirdTr = '<tr class="levelThree" level="3" dataid="' + thirdData[k].MARK + '" pid="' + secondData[j].MARK + '" gpid="' + data[i].MARK + '" style="display:none;">'
                                            + '<td class="colspan1"></td>'
                                            + '<td class="colspan2">' + thirdData[k].MARK + '</td>'
                                            + '<td class="colspan3">' + thirdData[k].name + '</td>'
                                            + '<td class="colspan4">' + thirdData[k].area + '</td>'
                                            + '<td class="colspan5">' + (thirdData[k].area / _totalArea_plan).toFixed(2) + '</td>'
                                        + '</tr>';
                                $(container).append(thirdTr);
                            }
                        }
                    }
                }
            }
            this.insertTrTotal();
        },
        /**
        *插入合计
        *@method insertTrTotal
        *@private
        */
        insertTrTotal: function () {
            var totalArea_plan = 0;
            var totalArea_current = 0;      //现状的  目前没数据
            var areaScale_plan = 0;
            var areaScale_current = 0;      //现状的  目前没数据
            var perCapita_plan = 0;
            var perCapita_current = 0;      //现状的  目前没数据
            for (var i = 0; i < this.tableData.length; i++) {
                //统计一级数据和
                var data = this.tableData;
                var scale1 = parseFloat(data[i].scale.substring(0, data[i].scale.length - 1));
                totalArea_plan += data[i].area;
                totalArea_current += 0;
                areaScale_plan += scale1;
                areaScale_current += 0;
                perCapita_plan += data[i].popuarea;
                perCapita_current += 0;
                if (data[i].items.length > 0) {
                    //统计二级数据和
                    var data2 = data[i].items;
                    for (var j = 0.; j < data2.length; j++) {
                        var scale2 = parseFloat(data2[j].scale.substring(0, data2[j].scale.length - 1));
                        //totalArea_plan += data2[j].area;
                        totalArea_current += 0;
                        areaScale_plan += scale2;
                        areaScale_current += 0;
                        perCapita_plan += data2[j].popuarea;
                        perCapita_current += 0;

                        if (data2[j].items.length > 0) {
                            //统计三级数据和
                            var data3 = data2[j].items;
                            for (var k = 0; k < data3.length; k++) {
                                var scale3 = parseFloat(data3[k].scale.substring(0, data3[k].scale.length - 1));
                                //totalArea_plan += data3[k].area;
                                totalArea_current += 0;
                                areaScale_plan += scale3;
                                areaScale_current += 0;
                                perCapita_plan += data3[k].popuarea;
                                perCapita_current += 0;
                            }
                        }
                    }
                }
            }

            var tr = '<tr>'
                         + '<td colspan="3">总计</td>'
                         + '<td class="colspan4">' + totalArea_plan.toFixed(2) + '</td>'
                         + '<td class="colspan6">' + 100 + '</td>'
                       + '</tr>';
            var container = ".landst-talbe-tbody";
            $(container).append(tr);

            this.planTotalArea = totalArea_plan;
        },
        /**
        *设置pie的参数
        *@method setPieOptions
        *@private
        */
        setPieOptions: function (tableData, title) {
            this.pieOption = null;
            var legendData = [];
            var pieData = [];
            for (var i = 0; i < tableData.length; i++) {
                legendData.push(tableData[i].MARK + ' ' + tableData[i].name);
                pieData.push({ "value": tableData[i].area, "name": tableData[i].MARK + ' ' + tableData[i].name });
            }

            this.pieOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}<br/>用地总面积：{c}(m²)"
                },
                title: {
                    text: title,
                    subtext: '',
                    x: 'center'
                },
                legend: {
                    show: true,
                    x: 'center',
                    y: 'bottom',
                    orient: 'vertical',  // horizontal
                    data: legendData
                },
                color: this.chartColors,
                series: [
                    {
                        type: 'pie',
                        radius: '70px',
                        center: ['50%', '150px'],
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'outer',
                                    formatter: function (params) {
                                        return (params.percent - 0) + '%';
                                    }
                                },
                                labelLine: {
                                    show: true,
                                    length: 1
                                }
                            }
                        },
                        data: pieData
                    }
                ]
            };


        },
        /**
        *填充pie
        *@method setPie
        *@private
        */
        setPie: function () {
            var chart = echarts.init(document.getElementById('ydph-pie'));
            chart.setOption(this.pieOption);
        },
        /**
        *设置柱状图表
        *@method setBarContent
        *@private
        */
        setBarContent: function () {
            //清空
            var btn = '.bartabs>ul';
            var bar = '.barcontainer';
            $(bar).html("");
            $(btn).html("");

            var barHtml = '';
            var btnHtml = '';
            for (var i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].items.length > 0) {
                    var data = this.tableData[i];
                    var id = data.MARK + data.name;
                    barHtml = '<div class="tab-pane fade" id="' + id + '"></div>';
                    btnHtml = '<li><a href="#' + id + '" data-toggle="tab"></a></li>';
                    //插入html
                    $(bar).append(barHtml);
                    $(btn).append(btnHtml);
                    //绑定图标
                    this.setBarOptions(data.items, data.name, i);
                    $(".bartabs>ul>li:last>a").tab('show');
                    this.setBar(id);
                }
            }
            //显示第一个tab
            $(".bartabs>ul>li:first>a").tab('show');
            $(".bartabs>ul>li:first>a").addClass('active');

            //bar
            $(".bartabs>ul>li>a").on('click', { context: this }, function (e) { e.data.context.clickBarLinkEvent(e); });
        },
        /**
        *设置bar的参数
        *@method setBarOptions
        *@param tableData{Array}
        *@param title{String}
        *@param i{Number}
        *@private
        */
        setBarOptions: function (tableData, title, i) {
            var planTotalArea = this.planTotalArea;
            var titleName = title + '统计';
            var color = [];
            color.push(this.chartColors[i]);
            var dataName = [];
            var dataValue = [];
            for (var i = 0; i < tableData.length; i++) {
                dataName.push(tableData[i].name);
                dataValue.push(tableData[i].area);
            }

            this.barOption = {
                title: {
                    text: titleName,
                    x: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    show: true,
                    textStyle: {
                        align: 'center'
                    },
                    formatter: "{b}<br/>用地总面积：{c}(m²)"

                },
                color: color,

                xAxis: [
                    {
                        type: 'value',
                        splitNumber: 3
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        data: dataName
                    }
                ],
                series: [
                    {
                        //name: '2011年',
                        type: 'bar',
                        data: dataValue,
                        barMaxWidth: 30,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    position: 'right',
                                    formatter: function (params) {
                                        return (params.value / planTotalArea * 100).toFixed(2) + '%';
                                    },
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                    }
                ]
            };

        },
        /**
        *填充bar
        *@method setBar
        *@param id{String}
        *@private
        */
        setBar: function (id) {
            var chart = echarts.init(document.getElementById(id));
            chart.setOption(this.barOption);
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
                var text = $(e.target).text();
                switch (text) {
                    //case '行政区域':
                    //    $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                    //    break;
                    case '区域绘制':
                        $('.ydph-nav-collapse-wrap .active').removeClass(box_active);
                        break;
                    case '范围线上传':
                        $('.ydph-nav-collapse-wrap .active').removeClass(box_active);
                        //$(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                        //$(href).children().children("button").removeClass(btn_active);
                        break;
                    default: //行政区域
                        $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                        break;
                }
            }
        },
        /**
        *点击行政区域标签事件 
        *@method clickLiEvent
        *@param e{Object}
        *@private
        */
        clickLiEvent: function (e) {
            //关闭下拉列表
            $(".ydph-nav-btn-wrap .collapsed").click();

            //判断是否包含该属性值
            var bool = e.target.className.indexOf("RN-district-item");
            if (bool != -1) {
                $('.RN-town-item').removeClass("active");
                this.text = Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue;
                $(".ydph-nav-btn-wrap button")[0].innerHTML = "行政区域";
            } else {
                $('.RN-district-item').removeClass("active");
                this.text = $(e.target).text();
                $(".ydph-nav-btn-wrap button")[0].innerHTML = $(e.target).html();
            }
            this.RegionFeature = null;

            var li_active = "active";
            $(e.target).siblings("li").removeClass(li_active).end().addClass(li_active);

            var text = this.text;
            //显示正在加载
            this.showLoading();

            //查询行政边界
            var currentData = [];
            var url = Project_ParamConfig.xingzhengConfig.xingzheng_layer.url;
            var id = Project_ParamConfig.xingzhengConfig.xingzheng_layer.field;
            var layerIndex = Project_ParamConfig.xingzhengConfig.xingzheng_layer.layerIndex;
            var query = new L.esri.Tasks.find(url);
            query.params.sr = Project_ParamConfig.xingzhengConfig.xingzheng_layer.sr;
            query.layers(layerIndex).text(text).fields(id);
            query.run(function (error, featureCollection, response) {
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
                if (featureCollection != null) {
                    var feature = featureCollection.features[0];
                    this.RegionFeature = feature;
                    var hlLayer = map.getHighLightLayer();
                    hlLayer.clearLayers();

                    var Region = $(".district-content .active");
                    if (Region.length != 1) {
                        //参数配置

                        geo = L.dci.app.util.unproject(map, feature, "Polygon");

                        highlightPolygonSymbol = {
                            color: '#ff5f00',
                            weight: 3,
                            opacity: 0.7,
                            fill: true,
                            fillColor: '#ffb400',
                            fillOpacity: 0.3,
                            CANVAS: true
                        };
                        geo.setStyle(highlightPolygonSymbol);
                        hlLayer.addLayer(geo);
                    }
                    //读取缓存结果
                    var id = this.id + "-" + this.text;//缓存Key 类ID+名称
                    L.dci.app.services.baseService.getCache({
                        context: this,
                        key: id,
                        success: function (res) {
                            if (res == null) {
                                this._executeAnalyze();
                            } else {
                                this.hideLoading();
                                this.tableData = JSON.parse(res);
                                if (this.tableData.length > 0) {
                                    this.showContent();
                                }
                            }
                        }
                    });                     
                } else {
                    this.offContent();
                    L.dci.app.util.dialog.alert("温馨提示", "没有区域查询结果");
                }
            }, this);


        },


        /**
        *执行分析服务 
        *@method _executeAnalyze
        *@private
        */
        _executeAnalyze: function () {
            if (Project_ParamConfig.landuseStockConfig.PreResult) {
                this.ajax = new L.DCI.Ajax();
                var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/";
                var newUrl = url
                    + "analysis/landbpre/read/lst/" + this.text;

                this.ajax.get(newUrl, null, true, this, function (res) {
                    this.hideLoading();
                    if (res[0].name == "无结果") {
                        this.offContent();
                        L.dci.app.util.dialog.alert("温馨提示", "没有用地平衡查询结果");
                    } else {
                        this.tableData = res;
                        this.showContent();
                    }
                }, function () {
                });
            } else {
                var coordinates = this.RegionFeature.geometry.coordinates;
                for (var i = 0; i < coordinates[0].length; i++) {
                    var cache = coordinates[0][i][0];
                    coordinates[0][i][0] = coordinates[0][i][1];
                    coordinates[0][i][1] = cache;
                }
                var lay = L.polygon(coordinates);

                var featureSet = new L.DCI.FeatureSet();
                featureSet.features = [lay];
                this.in_region = featureSet;
                Project_ParamConfig.landuseStockConfig.inputParams.In_region = this.in_region;
                this.getService();

            };
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

            //关闭下拉列表
            //$(".ydph-nav-btn-wrap .collapsed").click();

            //var text = $(e.target).text();
            //switch (text) {
            //    case '添加CAD':
            //        if (this._addcads == null)
            //            this._addcads = new L.DCI.AddCad();
            //        this._addcads.addcad();
            //        break;
            //    case '添加SHP':
            //        if (this._addcads == null)
            //            this._addcads = new L.DCI.AddCad();
            //        this._addcads.addshp();
            //        break;
            //    default:
            //        break;
            //}
        },
        //自定义事件
        clickBtnEvent: function (e) {

        },
        /**
        *展开或隐藏表格
        *@method showTrEvent
        *@param e{Object}
        *@private
        */
        showTrEvent: function (e) {
            var tr_active = 'tractive';
            var sign_active = 'signactive';
            if ($(e.target).parent('.hastables').hasClass(tr_active)) {
                //隐藏
                $(e.target).parent('.hastables').removeClass(tr_active);
                $(e.target).parent('.hastables').children().first().text("+");
                $(e.target).parent('.hastables').children().first().removeClass(sign_active);      //标记颜色改变

                var level = $(e.target).parent('.hastables').attr('level');
                var id = $(e.target).parent('.hastables').attr('dataid');
                var pid = $(e.target).parent('.hastables').attr('pid');
                var trlevel = parseInt(level);
                if (trlevel == 2) {
                    //隐藏三级元素
                    $(".landst-talbe-tbody>tr[pid='" + id + "']").css("display", "none");

                }
                else {
                    //隐藏二级和三级元素
                    $(".landst-talbe-tbody>tr.hastables[pid='" + id + "']").removeClass(tr_active);
                    $(".landst-talbe-tbody>tr.hastables[pid='" + id + "']").children().first().text("+");
                    $(".landst-talbe-tbody>tr.hastables[pid='" + id + "']").children().first().removeClass(sign_active);
                    $(".landst-talbe-tbody>tr[gpid='" + id + "']").css("display", "none");
                }
            }
            else {
                //显示
                $(e.target).parent('.hastables').addClass(tr_active);
                $(e.target).parent('.hastables').children().first().text("-");
                $(e.target).parent('.hastables').children().first().addClass(sign_active);      //标记颜色改变
                var pid = $(e.target).parent('.hastables').attr('dataid');
                $(".landst-talbe-tbody>tr[pid='" + pid + "']").css("display", "table-row");       //显示下级元素
            }
        },
        //输出表格
        printExcel: function (e) {
            //alert("表格输出");
            //$('#landstTable').tableExport({ type: 'excel', escape: 'false' });
        },
        /**
        *点击bar链接按钮
        *@method clickBarLinkEvent
        *@param e{Object}
        *@private
        */
        clickBarLinkEvent: function (e) {
            if (!$(e.target).hasClass("active")) {
                var aEle = $(".bartabs").find("a");
                for (var i = 0; i < aEle.length; i++) {
                    $(aEle[i]).removeClass("active");
                }
                $(e.target).addClass("active");
            }
        },

        /**
        *点击表格行
        *@method clickTrEvent
        *@param e{Object}
        *@private
        */
        clickTrEvent: function (e) {
            if (!$(e.target).hasClass("selected")) {
                var aEle = $(".landst-talbe-body").find(".colspan3");
                for (var i = 0; i < aEle.length; i++) {
                    $(aEle[i]).removeClass("selected");
                }
                $(e.target).addClass("selected");
            }


            var array = [];
            var obj = $(e.target).parent();
            if (obj.hasClass("hastables")) {
                var level = obj.attr("level");
                switch (level) {
                    case "1":
                        //插入第一层用地代码
                        var id = obj.attr("dataid");
                        array.push(id);
                        //通过第一层用地代码去查找子层其它的用地代码
                        var ele = $(".landst-talbe-tbody>tr[gpid='" + id + "']");
                        for (var i = 0; i < ele.length; i++) {
                            var childrenId = $(ele[i]).attr("dataid");
                            array.push(childrenId);
                        }
                        break;;
                    case "2":
                        //插入第二层用地代码
                        var id = obj.attr("dataid");
                        array.push(id);
                        //通过第二层用地代码去查找第三层的用地代码
                        var ele = $(".landst-talbe-tbody>tr[pid='" + id + "']");
                        for (var i = 0; i < ele.length; i++) {
                            var childrenId = $(ele[i]).attr("dataid");
                            array.push(childrenId);
                        }
                        break;
                    case "3":
                        var id = obj.attr("dataid");
                        array.push(id);
                        break;
                    default:
                        break;
                }

            } else {
                var id = obj.attr("dataid");
                array.push(id);
            }
        },

        /**
        *点击表头，恢复显示所有用地类型地块
        *@method landType
        *@param e{Object}
        *@private
        */
        landType: function (e) {
            var aEle = $(".landst-talbe-body").find(".colspan3");
            for (var i = 0; i < aEle.length; i++) {
                $(aEle[i]).removeClass("selected");
            }
            //this.DefLayer(false, 0);
        },

        /**
        *筛选显示地图要素
        *@method DefLayer
        *@param array{Array}
        *@param index{Number}
        *@private
        */
        DefLayer: function (array, index) {
            var index = index;

            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();

            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id == "用地存量分析") {
                    //设置图层透明度
                    //layer.setOpacity(0.5);
                    if (array) {
                        var layerDefs = { 0: "YDDM like '" + array[index] + "%'" };
                    } else {
                        var layerDefs = false;
                    }
                    layer.setLayerDefs(layerDefs);
                }
            }, this);
        },


        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getService: function () {
            var url = Project_ParamConfig.landuseStockConfig.url;
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(Project_ParamConfig.landuseStockConfig.url,
                Project_ParamConfig.landuseStockConfig.inputParams,
                Project_ParamConfig.landuseStockConfig.outParams,
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
        returnGPData: function(res) {
            //隐藏正在加载
            this.hideLoading();
            var value = res.value;
            if (value == "[]" || value == "]" || value == null) {
                this.offContent();
                L.dci.app.util.dialog.alert("温馨提示", "没有查询结果");
            } else {
                this.tableData = value;
                if (this.tableData.length > 0) {
                    this.showContent();
                }
            }
            var id = this.id + "-" + this.text;//缓存Key 类ID+名称
            //缓存结果
            L.dci.app.services.baseService.addCache({
                context: this,
                key: id,
                value: JSON.stringify(this.tableData)
            });
        },
        /**
        *返回的GP图片信息
        *@method resultImageLayerHandler
        *@private
        */
        resultImageLayerHandler: function () {
            //alert("GP2");
        },
        /**
        *返回的错误信息
        *@method errorHandler
        *@private
        */
        errorHandler: function () {
            //隐藏正在加载
            this.hideLoading();
            L.dci.app.util.dialog.alert("温馨提示", "查找不到服务!");
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
            this.showLoading();

            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay2];
            this.in_region = featureSet;

            Project_ParamConfig.landuseStockConfig.inputParams.In_region = this.in_region;
            this.getService();
        },

        /**
        *获取上传的CAD范围
        *@method getCADRegion
        *@param lay{Object} 
        *@private
        */
        getCADRegion: function (lay) {
            //显示正在加载
            this.showLoading();
            //CAD文件获取到的坐标值x,y是反的，需要转换
            var CadPath = lay.geometry.paths[0]

            for (var i = 0; i < CadPath.length; i++) {
                var x = CadPath[i][0];
                var y = CadPath[i][1];
                CadPath[i][0] = y;
                CadPath[i][1] = x;
            }

            var lay2 = L.polygon(CadPath);

            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay2];
            this.in_region = featureSet;

            Project_ParamConfig.landuseStockConfig.inputParams.In_region = this.in_region;
            this.getService();
        },
        /**
        *获取上传的SHP范围
        *@method getSHPRegion
        *@param lay{Object} 
        *@private
        */
        getSHPRegion: function (lay) {
            //显示正在加载
            this.showLoading();
            var lay2 = L.polygon(lay.geometry.rings[0]);

            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay2];
            this.in_region = featureSet;
            Project_ParamConfig.landuseStockConfig.inputParams.In_region = this.in_region;
            this.getService();
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
        *@method getSHPRegion
        *@param lay{Object} 
        *@private
        */
        getDrawPolygonsRegion: function (lay) {
            //关闭下拉列表
            $(".ydph-nav-btn-wrap .collapsed").click();

            //显示正在加载
            this.showLoading();
            //var geometry = lay.toGeoJSON().geometry;
            //$('#QYHZ').removeClass('collapsed');
            this._polygon.disable();
            //参数配置
            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay];
            this.in_region = featureSet;
            Project_ParamConfig.landuseStockConfig.inputParams.In_region = this.in_region;
            this.getService();
        },

        /**
        *显示正在加载图标
        *@method showLoading
        *@private
        */
        showLoading: function () {
            $(".ydph-loadflash").css("z-index", "0");
        },
        /**
        *隐藏正在加载图标
        *@method hideLoading
        *@private
        */
        hideLoading: function () {
            $(".ydph-loadflash").css("z-index", "-1");
        }

    });
    return L.DCI.LandStock;
});
