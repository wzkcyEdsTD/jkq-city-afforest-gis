/**
*用地开发强度评价类
*@module modules.analysis
*@class DCI.LandStrength
*@constructor initialize
*@extends Class
*/
define("analysis/landstrength", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "library/echarts",
    "analysis/addcad",
    "analysis/gpHandler"
], function (L) {
    L.DCI.LandStrength = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'LandStrength',
        /**
        *整体布局
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="ydkfqd-content">'
                    + '<div class="ydkfqd-nav-wrap"></div>'
                    + '<div class="ydkfqd-table-wrap"></div>'
                    + '<div class="ydkfqd-chart-wrap"></div>'
                + '</div>'
                + '<div class="ydkfqd-loadflash">'
                    +'<div class="loadingFlash"><span class="icon-loading"></span>'
                    + '</div>'
                    +'<div class="loadingText">服务器正在处理请求，请耐心等待...</div>'
                + '</div>',
        /**
        *Map对象
        *@property map
        *@type {Object}
        *@private
        */
        map: null,
        /**
        *底图配置列表中的顺序，容积率：2；绿地率：3；建筑密度：4
        *@property lyrIndex
        *@type {number}
        *@private
        */
        lyrIndex: 2,
        /**
        *tabs1页面数据
        *@property tabsData1
        *@type {Object}
        *@private
        */
        tabsData1: null,       //tabs1页面数据
        /**
        *过渡结果数据
        *@property TableData0
        *@type {Object}
        *@private
        */
        TableData0: [[], [], []],
        /**
        *结果数据
        *@property tableData
        *@type {Object}
        */
        tableData: [[], [], []],    //table数据,tableData[0]为容积率，tableData[1]为绿地率,tableData[2]为建筑密度
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
        *专题服务地址
        *@property url
        *@type {Object}
        *@private
        */
        url: '',
        /**
        *当前显示的表title
        *@property currentTitle
        *@type {string}
        *@private
        */
        currentTitle: '容积率',
        /**
        *图表颜色配置
        *@property chartColors
        *@type {Array}
        */
        chartColors: ['#ff6464', '#ff9664', '#ffcd64', '#e6f03c', '#5af0a0', '#5af0e6', '#78c8f0', '#7882f0', '#b478f0', '#f078dc'],
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
        *初始化
        *@method initialize
        */
        initialize: function () {

            //绘图工具
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //清除地图其他操作
            this.map.clear();

            this._polygon = new L.DCI.DrawPolygons(this.map.map);
            //获取行政区划信息
            //this.getTabsData1();

            

            var url_rjl = Project_ParamConfig.landLayers[2].url;
            var index_rjl = Project_ParamConfig.landLayers[2].layerIndex;
            this.lyr_rjl = L.esri.dynamicMapLayer(url_rjl, { id: '用地开发强度评价', layers: [index_rjl] });

            var url_ldl = Project_ParamConfig.landLayers[3].url;
            var index_ldl = Project_ParamConfig.landLayers[3].layerIndex;
            this.lyr_ldl = L.esri.dynamicMapLayer(url_ldl, { id: '用地开发强度评价', layers: [index_ldl] });

            var url_jzmd = Project_ParamConfig.landLayers[4].url;
            var index_jzmd = Project_ParamConfig.landLayers[4].layerIndex;
            this.lyr_jzmd = L.esri.dynamicMapLayer(url_jzmd, { id: '用地开发强度评价', layers: [index_jzmd] });

            this.addService(this.lyr_rjl);

            var _this = this;
            L.DCI.App.pool.get('LeftContentPanel').show(this,
                function () {
                    _this.getTabsData1();
                    //_this._moveMap();
                });
            $(".leftcontentpanel-title>span:first").html("用地开发强度评价");         //标题

            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.tempHtml);

            //滚动条
            $(".ydkfqd-content").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //tab
            this.setTabsHTML();
            
            //this.setTabs1();


            //tab区域切换按钮点击事件
            $(".ydkfqd-nav-btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.clickTabBtn(e); });            
            //自定义区域---点击事件
            $("#QYHZ").on('click', { context: this }, function (e) { e.data.context.clickBtnEvent(e); });
            //范围线上传---点击事件
            $(".ydkfqd-nav-collapse-wrap #RNW-FWXSC2>.btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });
            $("#FWXSC").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });
           
            //输出表格
            $(".ydkfqd-table-wrap .print").on('click', { context: this }, function (e) { e.data.context.printExcel(e); });
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
            L.dci.app.pool.remove('LandStrength');                    
        },

        /**
        *调整地图位置
        *@method _moveMap
        */
        _moveMap: function () {
            $("#menu_FullExtent").click();
            $(".leaflet-control-pan-left")[0].click();
        },

        /**
        *加载专题服务
        *@method addService
        */
        addService: function (layer) {
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //this.url = Project_ParamConfig.landLayers[this.lyrIndex].url;
            //var index = Project_ParamConfig.landLayers[this.lyrIndex].layerIndex;
            //this.baseLyr = L.esri.dynamicMapLayer(this.url, { id: '用地开发强度评价', layers: [index] });
            this.baseLyr = layer;
            this.baseLyr.addTo(this.map.getMap());
        },
        /**
        *删除专题服务
        *@method deleteService
        */
        deleteService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            //var index = Project_ParamConfig.landLayers[this.lyrIndex].layerIndex;
            //var layer = L.esri.dynamicMapLayer(this.url, { id: '用地开发强度评价', layers: [index] });
            map.removeLayer(this.baseLyr.options.id);
            //_map.eachLayer(function (layer) {
            //    if (layer.options && layer.options.id == "用地开发强度评价" && layer.options.id != null)
            //    {
            //        map.removeLayer(layer.options.id);
            //    }
            //});
        },
        /**
        *打开菜单和调整工具栏
        *@method openMenu
        */
        openMenu: function () {
            ////关闭二三级菜单
        },
       /**
       *插入Tabs整体布局
       *@method setTabsHTML
       *@private
       */
        setTabsHTML: function () {
            //tab页整体布局
            var tabHtml = '<div class="ydkfqd-nav-btn-wrap">'
                            + '<button class="btn" href="#RNW-XZQY1" data-toggle="wz-collapse" aria-controls="RNW-XZQY1" aria-expanded="true">行政区域</button>'
                            + '<button class="btn"  data-toggle="wz-collapse" id="QYHZ">区域绘制</button>'
                            + '<button class="btn" id="FWXSC" href="#RNW-FWXSC2" data-toggle="wz-collapse" aria-controls="RNW-FWXSC2" aria-expanded="true">范围线上传</button>'
                            + '<div>'
                                + '<span class="acharts-charts-tool icon-business-analysis" title="显示统计图"></span>'
                        + '</div>'
                        + '</div>'
                        + '<div class="ydkfqd-nav-collapse-wrap"></div>';

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
            $(".ydkfqd-nav-wrap").html(tabHtml);
            $(".ydkfqd-nav-collapse-wrap").append(tabHtml1);
            //$(".ydkfqd-nav-collapse-wrap").append(tabHtml2);
            $(".ydkfqd-nav-collapse-wrap").append(tabHtml3);
            var _this = this;
            //添加图表切换按钮点击事件
            $(".acharts-charts-tool").on('click', function () {
                if ($(".acharts-charts-tool").hasClass("icon-Viewform")) {
                    $(".acharts-charts-tool").removeClass("icon-Viewform");
                    $(".acharts-charts-tool").addClass("icon-business-analysis");
                    $(".acharts-charts-tool").attr("title", "显示统计图");
                    $(".ydkfqd-chart-wrap").css({ "display": "none" });
                    $(".ydkfqd-table-wrap").css({ "display": "block" });
                } else {
                    $(".acharts-charts-tool").removeClass("icon-business-analysis");
                    $(".acharts-charts-tool").addClass("icon-Viewform");
                    $(".acharts-charts-tool").attr("title", "显示数据表");
                    $(".ydkfqd-table-wrap").css({ "display": "none" });
                    $(".ydkfqd-chart-wrap").css({ "display": "block" });

                    switch (_this.currentTitle) {
                        case '容积率':
                            _this.refleshPie(_this.tableData[0], _this.currentTitle);
                            break;
                        case '绿地率':
                            _this.refleshPie(_this.tableData[1], _this.currentTitle);
                            break;
                        case '建筑密度':
                            _this.refleshPie(_this.tableData[2], _this.currentTitle);
                            break;
                        default:
                            break;
                    }
                }
            });
        },
        /**
        *插入Table整体布局
        *@method setTableHTML
        *@private
        */
        setTableHTML:function(){
            var html = '<ul class="nav nav-tabs">'
                        + '<li class="active"><a href="#RJL1" data-toggle="tab" aria-controls="RJL1" aria-expanded="true">容积率</a></li>'
                        + '<li><a href="#LDL2" data-toggle="tab" aria-controls="LDL2" aria-expanded="true">绿地率</a></li>'
                        + '<li><a href="#JZMD3" data-toggle="tab" aria-controls="JZMD3" aria-expanded="true">建筑密度</a></li>'
                     + '</ul>'
                     + '<div class="tab-content">'
                        + '<div class="tab-pane fade active in" id="RJL1" aria-labelledby="RJL1-tab">'
                            + '<table class="table table-bordered" id="rjlTable">'
                                + '<thead>'
                                    + '<tr>'
                                        + '<th class="w103 fwhf">范围划分</th>'
                                        + '<th class="w42">统计数</th>'
                                        + '<th class="w103">统计数占比(%)</th>'
                                        + '<th class="w103">用地面积(m²)</th>'
                                        + '<th class="w103">用地面积占比(%)</th>'
                                        + '<th class="w103">建筑面积(m²)</th>'
                                        + '<th class="w103">建筑面积占比(%)</th>'
                                    +'</tr>'
                                + '</thead>'
                                + '<tbody class="RJL1_body">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'
                        + '<div class="tab-pane fade" id="LDL2" aria-labelledby="LDL2-tab">'
                            + '<table class="table table-bordered" id="ldlTable">'
                                + '<thead>'
                                    + '<tr>'
                                        + '<th class="w103 fwhf">范围划分</th>'
                                        + '<th class="w42">统计数</th>'
                                        + '<th class="w103">统计数占比(%)</th>'
                                        + '<th class="w103">用地面积(m²)</th>'
                                        + '<th class="w103">用地面积占比(%)</th>'
                                        + '<th class="w103">建筑面积(m²)</th>'
                                        + '<th class="w103">建筑面积占比(%)</th>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="LDL2_body">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'
                        + '<div class="tab-pane fade" id="JZMD3" aria-labelledby="JZMD3-tab">'
                            + '<table class="table table-bordered" id="jzmdTable">'
                                + '<thead>'
                                    + '<tr>'
                                        + '<th class="w103 fwhf">范围划分</th>'
                                        + '<th class="w42">统计数</th>'
                                        + '<th class="w103">统计数占比(%)</th>'
                                        + '<th class="w103">用地面积(m²)</th>'
                                        + '<th class="w103">用地面积占比(%)</th>'
                                        + '<th class="w103">建筑面积(m²)</th>'
                                        + '<th class="w103">建筑面积占比(%)</th>'
                                    + '</tr>'
                                + '</thead>'
                                + '<tbody class="JZMD3_body">'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'

                     + '</div>'
                     + '<div class="print"><span class="icon-Viewform"></span></div>';

            $(".ydkfqd-table-wrap").html(html);
        },
        /**
        *插入饼状图整体布局
        *@method setPieHTML
        *@private
        */
        setPieHTML:function(){
            var html = '<div id="ydkfqd-pie1" class="chart-item leftpie">'
                     + '</div>'
                     + '<div id="ydkfqd-pie2" class="chart-item rightpie">'
                     + '</div>';

            $(".ydkfqd-chart-wrap").html(html);
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
                        "district": Project_ParamConfig.ydkfqdpjConfig.xzqh,
                        "towns": [
                        ]
                    };
                    for (var rn in res) {
                        this.tabsData1.towns.push(res[rn].RegionName);
                    };
                    this.setTabs1();
                    //行政区域---点击事件
                    $(".ydkfqd-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".ydkfqd-nav-collapse-wrap .RN-district-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".ydkfqd-nav-collapse-wrap .RN-district-item")[0].click();
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

            if (district != null || district != undefined)
            {
                var html = '<li class="RN-district-item">' + district + '</li>';
                $(".district-content").html(html);
            }

            if (towns.length > 0)
            {
                var Lihtml = '';
                for (var i = 0; i < towns.length && towns[i] != undefined; i++) {
                    Lihtml = Lihtml + '<li class="RN-town-item">' + towns[i] + '</li>';
                }
                $(".town-content").html(Lihtml);
            }
        },

        /**
        *自动获取数组元素个数或对象成员数 
        *@method countOA
        *@param o{Object&Array}
        */
        countOA:function(o){
                var t = typeof o;
                if(t == 'string'){
                    return o.length;
                }else if(t == 'object'){
                    var n = 0;
                    for(var i in o){
                        n++;
                    }
                    return n;
                }
                return false;
            },
        /**
        *获取容积率--table数据
        *@method getTableData_RJL
        *@private
        */
        getTableData_RJL: function () {
            var count_tableData = this.countOA(this.TableData0[0]);
            if (count_tableData != 0) {
                var count_TableData0 = this.TableData0[0].length;
                for (var i = 0; i < count_TableData0 ; i++) {
                    for (var j = 0; j < 6; j++) {
                        if (!this.TableData0[0][i][j]) {
                            this.TableData0[0][i][j] = 0.00;
                        }
                    }
                    this.tableData[0][i] = {
                        "fwhf": this.TableStru[0]["phase"+i],
                        "tjs": parseFloat(this.TableData0[0][i][0]),
                        "tjszb": parseFloat(this.TableData0[0][i][1]),
                        "ydmj": parseFloat(this.TableData0[0][i][2]),
                        "ydmjzb": parseFloat(this.TableData0[0][i][3]),
                        "jzmj": parseFloat(this.TableData0[0][i][4]),
                        "jzmjzb": parseFloat(this.TableData0[0][i][5]),
                        "query_info":this.query_Info[0]["phase"+i]
                    };
                }
            } else {
                var count_TableStru = this.countOA(this.TableStru[0]);
                for (var i = 0; i < count_TableStru; i++) {
                    this.tableData[0][i] = {
                        "fwhf": this.TableStru[0]["phase" + i],
                        "tjs": 0,
                        "tjszb": 0.0,
                        "ydmj": 0.0,
                        "ydmjzb": 0.0,
                        "jzmj": 0.0,
                        "jzmjzb": 0.0
                    };
                }
            }
        },
        /**
        *获取绿地率--table数据
        *@method getTableData_RJL
        *@private
        */
        getTableData_LDL: function () {
            var count_tableData = this.countOA(this.TableData0[1]);
            if (count_tableData != 0) {
                var count_TableData0 = this.TableData0[1.].length;
                for (var i = 0; i < count_TableData0 ; i++) {
                    for (var j = 0; j < 6; j++) {
                        if (!this.TableData0[1][i][j]) {
                            this.TableData0[1][i][j] = 0.00;
                        }
                    }
                    this.tableData[1][i] = {
                        "fwhf": this.TableStru[1]["phase" + i],
                        "tjs": parseFloat(this.TableData0[1][i][0]),
                        "tjszb": parseFloat(this.TableData0[1][i][1]),
                        "ydmj": parseFloat(this.TableData0[1][i][2]),
                        "ydmjzb": parseFloat(this.TableData0[1][i][3]),
                        "jzmj": parseFloat(this.TableData0[1][i][4]),
                        "jzmjzb": parseFloat(this.TableData0[1][i][5]),
                        "query_info": this.query_Info[1]["phase" + i]
                    };
                }
            } else {
                var count_TableStru = this.countOA(this.TableStru[1]);
                for (var i = 0; i < count_TableStru; i++) {
                    this.tableData[1][i] = {
                        "fwhf": this.TableStru[1]["phase" + i],
                        "tjs": 0,
                        "tjszb": 0.0,
                        "ydmj": 0.0,
                        "ydmjzb": 0.0,
                        "jzmj": 0.0,
                        "jzmjzb": 0.0
                    };
                }
            }
        },
        /**
        *获取建筑密度--table数据
        *@method getTableData_JZMD
        *@private
        */
        getTableData_JZMD: function () {
            var count_tableData = this.countOA(this.TableData0[2]);
            if (count_tableData != 0) {
                var count_TableData0 = this.TableData0[2].length;
                for (var i = 0; i < count_TableData0 ; i++) {
                    for (var j = 0; j < 6; j++) {
                        if (!this.TableData0[2][i][j]) {
                            this.TableData0[2][i][j] = 0.00;
                        }
                    }
                    this.tableData[2][i] = {
                        "fwhf": this.TableStru[2]["phase" + i],
                        "tjs": parseFloat(this.TableData0[2][i][0]),
                        "tjszb": parseFloat(this.TableData0[2][i][1]),
                        "ydmj": parseFloat(this.TableData0[2][i][2]),
                        "ydmjzb": parseFloat(this.TableData0[2][i][3]),
                        "jzmj": parseFloat(this.TableData0[2][i][4]),
                        "jzmjzb": parseFloat(this.TableData0[2][i][5]),
                        "query_info": this.query_Info[2]["phase" + i]
                    };
                }
            } else {
                var count_TableStru = this.countOA(this.TableStru[2]);
                for (var i = 0; i < count_TableStru; i++) {
                    this.tableData[2][i] = {
                        "fwhf": this.TableStru[2]["phase" + i],
                        "tjs": 0,
                        "tjszb": 0.0,
                        "ydmj": 0.0,
                        "ydmjzb": 0.0,
                        "jzmj": 0.0,
                        "jzmjzb": 0.0
                    };
                }
            }
        },
        /**
        *填充table--容积率
        *@method setTableRJL
        *@param data{Array}
        *@private
        */
        setTableRJL:function(data){
            var container = ".RJL1_body";
            $(container).html("");

            if (data.length > 0)
            {
                var tjs = 0;
                var tjszb = 0.0;
                var ydmj = 0.0;
                var ydmjzb = 0.0;
                var jzmj = 0.0;
                var jzmjzb = 0.0;
                
                for (var i = 0; i < data.length; i++)
                {
                    var tr = '<tr>'
                                + '<td class="w103 fwhf" query_info="' + data[i].query_info + '">' + data[i].fwhf + '</td>'
                                + '<td class="w42">' + data[i].tjs + '</td>'
                                + '<td class="w103">' + (data[i].tjszb).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].ydmj).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].ydmjzb).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].jzmj).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].jzmjzb).toFixed(2) + '</td>'
                           + '</tr>';
                    $(container).append(tr);
                    tjs += parseInt(data[i].tjs);
                    tjszb += parseFloat(data[i].tjszb);
                    ydmj += parseFloat(data[i].ydmj);
                    ydmjzb += parseFloat(data[i].ydmjzb);
                    jzmj += parseFloat(data[i].jzmj);
                    jzmjzb += parseFloat(data[i].jzmjzb);
                }

                //插入总计
                var trHtml = '<tr>'
                                + '<td class="w103 fwhf">总计</td>'
                                + '<td class="w42">' + tjs + '</td>'
                                + '<td class="w103">' + tjszb.toFixed(2) + '</td>'
                                + '<td class="w103">' + ydmj.toFixed(2) + '</td>'
                                + '<td class="w103">' + ydmjzb.toFixed(2) + '</td>'
                                + '<td class="w103">' + jzmj.toFixed(2) + '</td>'
                                + '<td class="w103">' + jzmjzb.toFixed(2) + '</td>'
                             + '</tr>';
                $(container).append(trHtml);
            }
            else
            {
                var trHtml = '<tr><td rowspan="7">没有数据</td></tr>';
                $(container).append(trHtml);
            }
        },
        /**
        *填充table--绿地率
        *@method setTableLDL
        *@param data{Array}
        *@private
        */
        setTableLDL: function (data) {
            var container = ".LDL2_body";
            $(container).html("");

            if (data.length > 0)
            {
                var tjs = 0;
                var tjszb = 0.0;
                var ydmj = 0.0;
                var ydmjzb = 0.0;
                var jzmj = 0.0;
                var jzmjzb = 0.0;

                for (var i = 0; i < data.length; i++)
                {
                    var tr = '<tr>'
                                + '<td class="w103 fwhf" query_info="' + data[i].query_info + '">' + data[i].fwhf + '</td>'
                                + '<td class="w42">' + data[i].tjs + '</td>'
                                + '<td class="w103">' + (data[i].tjszb).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].ydmj).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].ydmjzb).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].jzmj).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].jzmjzb).toFixed(2) + '</td>'
                           + '</tr>';
                    $(container).append(tr);
                    tjs += parseInt(data[i].tjs);
                    tjszb += parseFloat(data[i].tjszb);
                    ydmj += parseFloat(data[i].ydmj);
                    ydmjzb += parseFloat(data[i].ydmjzb);
                    jzmj += parseFloat(data[i].jzmj);
                    jzmjzb += parseFloat(data[i].jzmjzb);
                }

                //插入总计
                var trHtml = '<tr>'
                                + '<td class="w103 fwhf">总计</td>'
                                + '<td class="w42">' + tjs + '</td>'
                                + '<td class="w103">' + tjszb.toFixed(2) + '</td>'
                                + '<td class="w103">' + ydmj.toFixed(2) + '</td>'
                                + '<td class="w103">' + ydmjzb.toFixed(2) + '</td>'
                                + '<td class="w103">' + jzmj.toFixed(2) + '</td>'
                                + '<td class="w103">' + jzmjzb.toFixed(2) + '</td>'
                             + '</tr>';
                $(container).append(trHtml);
            }
            else
            {
                var trHtml = '<tr><td rowspan="7">没有数据</td></tr>';
                $(container).append(trHtml);
            }
        },
        /**
        *填充table--建筑密度
        *@method setTableJZMD
        *@param data{Array}
        *@private
        */
        setTableJZMD: function (data) {
            var container = ".JZMD3_body";
            $(container).html("");

            if (data.length > 0)
            {
                var tjs = 0;
                var tjszb = 0.0;
                var ydmj = 0.0;
                var ydmjzb = 0.0;
                var jzmj = 0.0;
                var jzmjzb = 0.0;

                for (var i = 0; i < data.length; i++)
                {
                    var tr = '<tr>'
                                + '<td class="w103 fwhf" query_info="' + data[i].query_info + '">' + data[i].fwhf + '</td>'
                                + '<td class="w42">' + data[i].tjs + '</td>'
                                + '<td class="w103">' + (data[i].tjszb).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].ydmj).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].ydmjzb).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].jzmj).toFixed(2) + '</td>'
                                + '<td class="w103">' + (data[i].jzmjzb).toFixed(2) + '</td>'
                           + '</tr>';
                    $(container).append(tr);
                    tjs += parseInt(data[i].tjs);
                    tjszb += parseFloat(data[i].tjszb);
                    ydmj += parseFloat(data[i].ydmj);
                    ydmjzb += parseFloat(data[i].ydmjzb);
                    jzmj += parseFloat(data[i].jzmj);
                    jzmjzb += parseFloat(data[i].jzmjzb);
                }

                //插入总计
                var trHtml = '<tr>'
                                + '<td class="w103 fwhf">总计</td>'
                                + '<td class="w42">' + tjs + '</td>'
                                + '<td class="w103">' + tjszb.toFixed(2) + '</td>'
                                + '<td class="w103">' + ydmj.toFixed(2) + '</td>'
                                + '<td class="w103">' + ydmjzb.toFixed(2) + '</td>'
                                + '<td class="w103">' + jzmj.toFixed(2) + '</td>'
                                + '<td class="w103">' + jzmjzb.toFixed(2) + '</td>'
                             + '</tr>';
                $(container).append(trHtml);
            }
            else
            {
                var trHtml = '<tr><td rowspan="7">没有数据</td></tr>';
                $(container).append(trHtml);
            }
        },
        /**
        *设置pie1的参数
        *@method setPieOptions1
        *@param tableData{Array}
        *@param title{String}
        *@private
        */
        setPieOptions1: function (tableData, title) {
            this.pieOption1 = null;
            var legendData = [];
            var pieData = [];
            for (var i = 0; i < tableData.length; i++)
            {
                legendData.push(tableData[i].fwhf);
                //pieData.push({ "value": tableData[i].ydmjzb, "name": tableData[i].fwhf });
                pieData.push({ "value": tableData[i].ydmj, "name": tableData[i].fwhf });
            }

            this.pieOption1 = {
                tooltip: {
                    show: true,
                    textStyle: {
                        align: 'center'
                    },
                    formatter: "{b}<br/>用地面积：{c}(m²)"  //{b}<br/>{c}(m²)({d}%)
                },
                title: {
                    text: title,
                    subtext: '',
                    x: 'center'
                },
                legend: {
                    x: 'left',
                    y: 'bottom',
                    data: legendData
                },
                color: ['#ff6464', '#ffcd64', '#5af0a0', '#78c8f0', '#f078dc'],
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
        *@param tableData{Array}
        *@param title{String}
        *@private
        */
        setPieOptions2: function (tableData, title) {
            this.pieOption2 = null;
            var legendData = [];
            var pieData = [];
            for (var i = 0; i < tableData.length; i++)
            {
                legendData.push(tableData[i].fwhf);
                pieData.push({ "value": tableData[i].jzmj, "name": tableData[i].fwhf });
            }

            this.pieOption2 = {
                tooltip: {
                    show: true,
                    textStyle: {
                        align: 'center'
                    },
                    formatter: "{b}<br/>建筑面积：{c}(m²)"
                },
                title: {
                    text: title,
                    subtext: '',
                    x: 'center'
                },
                legend: {
                    x: 'center',
                    y: 'bottom',
                    data: legendData
                },
                color: ['#a08cff', '#64c8ff', '#ffbe50', '#ff6464'],
                series: [
                    {
                        type: 'pie',
                        radius: '50%',
                        center: ['50%', '46%'],
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
        setPie1:function(){
            var chart = echarts.init(document.getElementById('ydkfqd-pie1'));
            chart.setOption(this.pieOption1);
        },
        /**
        *填充pie2
        *@method setPie2
        *@private
        */
        setPie2: function () {
            var chart = echarts.init(document.getElementById('ydkfqd-pie2'));
            chart.setOption(this.pieOption2);
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

            if ($(e.target).hasClass(btn_active))
            {
                if ($(e.target).context.innerHTML == "区域绘制") {
                    this._polygon.disable();
                }
                $(e.target).removeClass(btn_active);
                $(href).removeClass(box_active);
            }
            else
            {
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
                switch (text)
                {
                    //case '行政区域':
                    //    $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                    //    break;
                    case '区域绘制':
                        $('.ydkfqd-nav-collapse-wrap .active').removeClass(box_active);
                        //恢复显示所有地块
                        this.deflyr(e);
                        break;
                    case '范围线上传':
                        $('.ydkfqd-nav-collapse-wrap .active').removeClass(box_active);
                        //$(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                        //$(href).children().children("button").removeClass(btn_active);
                        //恢复显示所有地块
                        this.deflyr(e);
                        break;
                    default: //行政区域
                        $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                        break;
                }
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

            //关闭下拉列表
            //$(".ydkfqd-nav-btn-wrap .collapsed").click();

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

        /**
        *点击行政区域标签事件 
        *@method clickLiEvent
        *@param e{Object}
        *@private
        */
        clickLiEvent: function (e) {
            //关闭下拉列表
            $(".ydkfqd-nav-btn-wrap .collapsed").click();

            var bool = e.target.className.indexOf("RN-district-item");
            if (bool != -1) {
                $('.RN-town-item').removeClass("active");
                var text = Project_ParamConfig.ydphfxConfig.xingzheng_layer.districtValue;
                $(".ydkfqd-nav-btn-wrap button")[0].innerHTML = "行政区域";
            } else {
                $('.RN-district-item').removeClass("active");
                var text = $(e.target).text();
                $(".ydkfqd-nav-btn-wrap button")[0].innerHTML = text;
            }
            this.RegionFeature = null;

            var li_active = "active";
            
            $(e.target).siblings("li").removeClass(li_active).end().addClass(li_active);

            //显示正在加载
            this.showLoading();
            //查询行政边界
            var currentData= [];
            var url = Project_ParamConfig.ydkfqdpjConfig.xingzheng_layer.url;
            var id = Project_ParamConfig.ydkfqdpjConfig.xingzheng_layer.field;
            var layerIndex = Project_ParamConfig.ydkfqdpjConfig.xingzheng_layer.layerIndex;
            var query = new L.esri.Tasks.Find(url);
            query.layers(layerIndex).text(text).fields(id);
            query.params.sr = Project_ParamConfig.ydkfqdpjConfig.xingzheng_layer.sr;
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

                    if (Project_ParamConfig.ydkfqdpjConfig.PreResult) {
                        this.ajax = new L.DCI.Ajax();
                        var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/";
                        var newUrl = url
                            + "analysis/landbpre/read/ls/" + text;

                        this.ajax.get(newUrl, null, true, this, function(res) {
                            this.hideLoading();
                            if (res[0].name == "无结果") {
                                this.offContent();
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
                            this.in_region = featureSet;
                            Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.in_region;
                            this.getService();

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
                        this.in_region = featureSet;
                        Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.in_region;
                        this.getService();
                    };
                } else {
                    this.offContent();
                    L.dci.app.util.dialog.alert("温馨提示", "没有区域查询结果");
                }
            }, this);
        },

        //自定义事件
        clickBtnEvent: function (e) {                       
            //this._polygon.enable();
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

        result:function(ss){
            alert(ss);
        },

        /**
        *关闭绘图工具
        *@method draw_disable
        *@private
        */
        draw_disable:function() {
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
            $(".ydkfqd-nav-btn-wrap .collapsed").click();

            //显示正在加载
            this.showLoading();
            //var geometry = lay.toGeoJSON().geometry;
            //取消绘制工具激活状态
            //$('#QYHZ').removeClass('collapsed');
            this._polygon.disable();

            //参数配置
            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay];
            this.in_region = featureSet;
            Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.in_region;
            this.getService();
        },

        //添加cad
        addCad: function () {
            if (this._addcads == null)
                this._addcads = new L.DCI.AddCad();
            this._addcads.addcad();
        },

        //添加shp
        addShp: function () {
            if (this._addcads == null)
                this._addcads = new L.DCI.AddCad();
            this._addcads.addshp();
        },

        /**
        *切换表格
        *@method clickSwitchTable
        *@param e{Object}
        *@private
        */
        clickSwitchTable: function (e) {
            this.deleteService();
            var text = $(e.target).text();
            this.titletext = text;
            switch (text)
            {
                case '容积率':
                    this.lyrIndex = 2;
                    this.addService(this.lyr_rjl);
                    this.refleshPie(this.tableData[0],text);
                    break;
                case '绿地率':
                    this.lyrIndex = 3;
                    this.addService(this.lyr_ldl);
                    this.refleshPie(this.tableData[1], text);
                    break;
                case '建筑密度':
                    this.lyrIndex = 4;
                    this.addService(this.lyr_jzmd);
                    this.refleshPie(this.tableData[2], text);
                    break;
                default:
                    break;
            }
        },

        //输出表格
        printExcel: function (e) {

        },
        /**
        *重新刷新table和pie数据
        *@method reflesh
        *param data{Array}
        *@private
        */
        reflesh: function (data) {            
            this.setTableRJL(data[0]);
            this.setTableLDL(data[1]);
            this.setTableJZMD(data[2]);

            this.setPieOptions1(data[1], '用地面积统计');
            this.setPieOptions2(data[1], '建筑面积统计');
            this.setPie1();
            this.setPie2();
        },
        /**
        *重新刷新pie数据
        *@method reflesh
        *param data{Array}
        *param title{String}
        *@private
        */
        refleshPie: function (data,title) {
            this.setPieOptions1(data, title+'用地面积统计');
            this.setPieOptions2(data, title + '建筑面积统计');
            this.setPie1();
            this.setPie2();
        },
        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getService: function () {

            var url = Project_ParamConfig.ydkfqdpjConfig.url;
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(url, Project_ParamConfig.ydkfqdpjConfig.inputParams, Project_ParamConfig.ydkfqdpjConfig.outParams, $.proxy(this.returnGPData, this), $.proxy(this.resultImageLayerHandler, this), $.proxy(this.errorHandler, this));
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
                this.tableData = [[], [], []];
                this.offContent();
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
            L.dci.app.util.dialog.alert("错误提示", "查找不到服务!");
        },
        /**
        *隐藏图表
        *@method offContent
        */
        offContent:function() {
            $(".ydkfqd-table-wrap").css({ "display": "none" });
            $(".ydkfqd-chart-wrap").css({ "display": "none" });
        },
        /**
        *填充图表并显示
        *@method showContent
        *@private
        */
        showContent: function () {
            $(".ydkfqd-table-wrap").css({ "display": "block" });
            $(".ydkfqd-chart-wrap").css({ "display": "block" });
            //插入table整体布局
            //this.setTableHTML();
            //插入charts整体布局
            //this.setChartsHTML();
            //table
            this.TableStru = Project_ParamConfig.ydkfqdpjConfig.In_otherInfo;
            this.query_Info = Project_ParamConfig.ydkfqdpjConfig.query_Info;
            this.setTableHTML();

            //表格切换按钮事件
            $(".ydkfqd-table-wrap>ul>li>a").on('click', { context: this }, function (e) { e.data.context.clickSwitchTable(e); });
            //pie
            this.setPieHTML();
            //动态设置pie容器的高度
            var currentHeight = $("#ydph-pie").height();
            var length = this.tableData.length;
            var height = currentHeight + length * 18;
            $("#ydph-pie").css("height", height);

            this.getTableData_RJL();
            this.getTableData_LDL();
            this.getTableData_JZMD();

            this.setTableRJL(this.tableData[0]);
            this.setTableLDL(this.tableData[1]);
            this.setTableJZMD(this.tableData[2]);
            
            this.setPieOptions1(this.tableData[0], '容积率用地面积统计');
            this.setPieOptions2(this.tableData[0], '容积率建筑面积统计');
            this.setPie1();
            this.setPie2();

            //隐藏统计图
            $(".ydkfqd-chart-wrap").css({ "display": "none" });
            //$(".acharts-charts-tool").click();

            //表格切换按钮事件
            $(".fwhf").on('click', { context: this }, function (e) { e.data.context.deflyr(e); });
                       
        },

        deflyr: function (e) {
            $('.table-bordered .selected').removeClass("selected");
            if (e.target.attributes.query_info) {
                $(e.target).addClass("selected");
                var query_key = e.target.attributes.query_info.value;
            } else {
                var query_key = false;
            };
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            
            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id == "用地开发强度评价") {
                    //设置图层透明度
                    //layer.setOpacity(0.5);
                    if (query_key) {
                        var indexlyr = Project_ParamConfig.landLayers[this.lyrIndex].layerIndex;
                        var layerDefs = {};
                        layerDefs[indexlyr] = query_key;
                    } else {
                        var layerDefs = false;
                    }
                    layer.setLayerDefs(layerDefs);
                }
            }, this);
            
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

            Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.in_region;
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

            Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.in_region;
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
            Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.in_region;
            this.getService();
        },

        /**
        *显示正在加载图标
        *@method showLoading
        *@private
        */
        showLoading: function () {
            $(".ydkfqd-loadflash").css("z-index", "0");
        },
        /**
        *隐藏正在加载图标
        *@method hideLoading
        *@private
        */
        hideLoading: function () {
            $(".ydkfqd-loadflash").css("z-index", "-1");
        },

    });
    return L.DCI.LandStrength;
});