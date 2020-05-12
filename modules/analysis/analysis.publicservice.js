/**
*公共服务设施分析
*@module modules.analysis
*@class DCI.PublicService
*@constructor initialize
*@extends Class
*/
define("analysis/publicservice", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "analysis/addcad",
    "analysis/gpHandler",
    "query/contain",
    "util/txls"
], function (L) {
    L.DCI.PublicService = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'PublicService',
        layerid: '公共服务设施分析',
        /**
        *整体布局
        *@property tempHtml
        *@type {String}
        */
        tempHtml: '<div class="gfss-content">'
                    + '<div class="gfss-nav-wrap"></div>'
                    + '<div class="gfss-table-wrap"></div>'
                    + '<div class = "loadPanle"  style = "display:none">'
                    + '<div class="loadingFlash"><span class="icon-loading"></span></div>'
                    + '</div>'
                    
                    + '<div class="analysis-service-container-radius" style = "display:none">'
                        + '<span><label id="analysis-service-type"></label>服务半径</span>'
                        + '<div id="analysis-service-scrollBar">'
                           + '<div id="analysis-service-scrollTrack"></div>'
                           + '<div id="analysis-service-scrollThumb"><span id = "barTxt"><span id="analysis-service-scrollBarTxt">300</span>米</span></div>'
                           + '<div class = "scale">'
                                + '<span style="left: 0%"><ins style="margin-left: 0px;">0</ins></span>'
                                + '<span style="left: 25%"><ins style="margin-left: -12px;">500</ins></span>'
                                + '<span style="left: 50%"><ins style="margin-left: -12px;">1000</ins></span>'
                                + '<span style="left: 75%"><ins style="margin-left: -12px;">1500</ins></span>'
                                + '<span style="left: 100%"><ins style="margin-left: -17px;">2000</ins></span>'                           
                           +'</div>'
                        + '</div>'
                        + '<input class = "analysis-radius" id="bufferinput" type="number" name="buffer" min="1" max="2000"></input><span>米</span>'
                        + '<span class="icon-loading  bufferLoading" style = "display:none"></span>'
                      + '</div>'
                      
                      + '<div class ="analysis-service-result" style = "display:none" >'
                            + '<div class ="analysis-service-result_tab" >'
                                + '<div class = "analysis-service-label">覆盖面积（㎡）</div>'
                                + '<div class = "analysis-service-key analysis-service-cover">--</div>'
                            + '</div>'
                                + '<div class ="analysis-service-result_tab" >'
                            + '<div class = "analysis-service-label">重叠面积（㎡）</div>'
                                + '<div class = "analysis-service-key analysis-service-overlap">--</div>'
                            + '</div>'
                            + '<div class ="analysis-service-result_tab" >'
                                + '<div class = "analysis-service-label">重叠率</div>'
                                + '<div class = "analysis-service-key analysis-service-rate">--</div>'
                            + '</div>'
                      +'</div>'
                      
                + '</div>'
                + '<div class="gfss-loadflash">'
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
        *是否正在执行异步请求
        *@property asynBool
        *@type {Boolean}
        *@private
        */
        asynBool: false,      //table数据


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

            //this.addService();      //加载地图
            var _this = this;
            
            $(".leftcontentpanel-title>span:first").html("公共服务设施分析");         //标题
            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.tempHtml);
            //滚动条
            $(".gfss-content").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //获取行政区划信息
            //this.getTabsData1();
            //插入tab整体布局
            this.setTabsHTML();
            //this.setTabs1();        //填充tab1
            //tab按钮点击事件
            $(".gfss-nav-btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.clickTabBtn(e); });
            ////行政区域---点击事件
            //$(".gfss-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
            //自定义区域---点击事件
            $("#QYHZ").on('click', { context: this }, function (e) { e.data.context.clickBtnEvent(e); });
            //范围线上传---点击事件
            $(".gfss-nav-collapse-wrap #RNW-FWXSC2>.btn-wrap>button").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });
            $("#FWXSC").on('click', { context: this }, function (e) { e.data.context.rangLineUpload(e); });

            //输出表格
            $(".gfss-table-wrap .print").on('click', { context: this }, function (e) { e.data.context.printExcel(e); });

            this.In_distances = 500
            this._scrollBar_maxValue = 2000
            this.scrollBar_Initialize();

            //导出excel方法
            var _this = this;
            $("#toxls").on('click', { context: this }, function (e) {
                L.txls = new L.DCI.TXls();
                $('#toxls').removeClass('collapsed');
                L.txls.converttoxls(".gfss-table-wrap");

            });
        },

        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            this.draw_disable();
            this.clearHL();
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };

            L.DCI.AddCad.prototype.removerCAD();
            L.dci.app.pool.remove('PublicService');
        },

        /*
       *滑动条-模块方法
       *****************************************************************************/
        /**
        *初始化滑动条
        *@method scrollBar_Initialize
        */
        scrollBar_Initialize: function () {
            
            this.setScrollBarValue(this.In_distances);
            $("#analysis-service-scrollBar").on('mousedown',
                { context: this }, function (e) { e.data.context.mouseDownEvent(e); });
            $("#analysis-service-scrollBar").on('mouseup',
                { context: this }, function (e) { e.data.context.mouseUpEvent(); });
            $("#analysis-service-scrollBar").on('click',
                { context: this }, function (e) { e.data.context.clickEvent(e); });
        },
        /**
       *通过透明度值设置滑动条值
       *@method setScrollBarValue
       *@param value {Number} 透明度值
       */
        setScrollBarValue: function (value) {
            this._currentX = $("#analysis-service-scrollBar").width() * (value / this._scrollBar_maxValue);
            $("#analysis-service-scrollTrack").css("width", this._currentX + 2 + "px");
            $("#analysis-service-scrollThumb").css("margin-left", this._currentX + "px");

            $("#analysis-service-scrollBarTxt").text(value);
        },
        mouseOutEvent: function () {
            this._valite = false;
        },
        /**
        *按下滑块事件
        *@method mouseDownEvent
        *@param e {Object} 事件回调对象
        */
        mouseDownEvent: function (e) {
            var ele = $("#analysis-service-scrollThumb");
            if ($(e.target).is(ele)) {
                this._valite = true;
                this._currentWidth = $("#analysis-service-scrollTrack").width();
                $(".analysis-service-container-radius").on('mousemove',
                    { context: this }, function (e) { e.data.context.mousemoveEvent(e) });
            }
        },

        /**
        *鼠标移动
        *@method mousemoveEvent
        *@param e {Object} 事件回调对象
        */
        mousemoveEvent: function (e) {
            if (this._valite == false) return;
            var moveWidth = event.clientX - $("#analysis-service-scrollBar").offset().left;
            var barWidth = $("#analysis-service-scrollBar").width();
            if (moveWidth <= 0) {
                moveWidth = 0;
                $("#analysis-service-scrollTrack").css("width", "0px");
                $("#analysis-service-scrollThumb").css("margin-left", "0px");
            }
            else if (moveWidth >= barWidth) {
                moveWidth = barWidth;
                $("#analysis-service-scrollTrack").css("width", barWidth + "px");
                $("#analysis-service-scrollThumb").css("margin-left", barWidth - 4 + "px");
            }
            else {
                $("#analysis-service-scrollTrack").css("width", moveWidth + 4 + "px");
                $("#analysis-service-scrollThumb").css("margin-left", moveWidth + "px");
            }

            var curRadius = Math.round(moveWidth / barWidth * this._scrollBar_maxValue);
            $("#analysis-service-scrollBarTxt").text(curRadius);
            this.In_distances = curRadius;
            document.getElementById("bufferinput").value = this.In_distances;
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };
            this.showBuffer(curRadius);
        },
        /**
      *松开滑块
      *@method mouseUpEvent
      *@param e {Object} 事件回调对象
      */
        mouseUpEvent: function (e) {
            this._valite = false;
            $(".analysis-service-container-radius").off('mousemove',
                { context: this }, function (e) { e.data.context.mousemoveEvent() });

            this.BufferAnalysis();
        },
        /**
      *鼠标点击
      *@method clickEvent
      *@param e {Object} 事件回调对象
      */
        clickEvent: function (e) {
            var moveWidth = event.clientX - $("#analysis-service-scrollBar").offset().left;
            var barWidth = $("#analysis-service-scrollBar").width();
            if (moveWidth <= 0) {
                moveWidth = 0;
                $("#analysis-service-scrollTrack").css("width", "0px");
                $("#analysis-service-scrollThumb").css("margin-left", "0px");
            }
            else if (moveWidth >= barWidth) {
                moveWidth = barWidth;
                $("#analysis-service-scrollTrack").css("width", barWidth + "px");
                $("#analysis-service-scrollThumb").css("margin-left", barWidth - 4 + "px");
            }
            else {
                $("#analysis-service-scrollTrack").css("width", moveWidth + 4 + "px");
                $("#analysis-service-scrollThumb").css("margin-left", moveWidth + "px");
            }

            var curRadius = Math.round(moveWidth / barWidth * this._scrollBar_maxValue);
            $("#analysis-service-scrollBarTxt").text(curRadius);
            this.In_distances = parseFloat(curRadius);
            document.getElementById("bufferinput").value = this.In_distances;

            this.BufferAnalysis();
            //this.getBufferService(); 

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
        *插入tab整体布局
        *@method setTabsHTML
        *@private
        */
        setTabsHTML: function () {
            //tab页整体布局
            var tabHtml = '<div class="gfss-nav-btn-wrap">'
                            + '<button class="btn" href="#RNW-XZQY1" data-toggle="wz-collapse" aria-controls="RNW-XZQY1" aria-expanded="true">行政区域</button>'
                            + '<button class="btn" id="QYHZ">区域绘制</button>'
                            + '<button class="btn" id="FWXSC" href="#RNW-FWXSC2" data-toggle="wz-collapse" aria-controls="RNW-FWXSC2" aria-expanded="true">范围线上传</button>'
                            + '<div>'
                                + '<span class="icon-downloadicon" id="toxls" title="导出Excel文件"></span>'
                            + '</div>'
                        + '</div>'
                        + '<div class="gfss-nav-collapse-wrap"></div>';

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
            $(".gfss-nav-wrap").html(tabHtml);
            $(".gfss-nav-collapse-wrap").append(tabHtml1);
            $(".gfss-nav-collapse-wrap").append(tabHtml2);
            $(".gfss-nav-collapse-wrap").append(tabHtml3);
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
                    $(".gfss-nav-collapse-wrap .RN-town-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    $(".gfss-nav-collapse-wrap .RN-district-item").on('click', { context: this }, function (e) { e.data.context.clickLiEvent(e); });
                    this.getFacility();
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "行政区划信息获取失败，请检查该服务。");
                }
            });
        },

        /**
        *获取tab1数据
        *@method getTabsData1
        *@private
        */
        getFacility: function () {
            L.dci.app.services.baseService.getFacility({
                context: this,
                success: function (res) {
                    this.tableData = res;
                    $(".gfss-nav-collapse-wrap .RN-district-item")[0].click();
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
            $(".gfss-table-wrap").css({ "display": "none" });
            $(".analysis-service-container-radius").css({ "display": "none" });
            $(".analysis-service-result").css({ "display": "none" });
        },
        /**
        *填充图表并显示
        *@method showContent
        *@private
        */
        showContent: function () {
            //插入table整体布局
            this.setTableHTML();
            $(".gfss-table-wrap").css({ "display": "block" });

            this.setTable(this.tableData);

            //展开或隐藏table
            $(".gfss-talbe-body").on('click', '.hastables', { context: this }, function (e) { e.data.context.showTrEvent(e); });
            $(".gfss-talbe-body").on('click', '.levelTwo', { context: this }, function (e) { e.data.context.showTwoEvent(e); });

        },
        /**
        *插入table整体布局
        *@method setTableHTML
        *@private
        */
        setTableHTML: function () {
            var html = '<div class="gfss-talbe-head">'
                        + '<table class="table table-bordered" id="gfssTable1">'
                            + '<thead>'
                                + '<tr>'
                                    + '<th rowspan="2" class="colspan1"></th>'
                                    + '<th rowspan="2" class="colspan2">设施编码</th>'
                                    + '<th rowspan="2" class="colspan3">设施名称</th>'
                                    + '<th colspan="3" class="colspan456">数量</th>'
                                    + '<th colspan="3" class="colspan789">用地面积(m²)</th>'
                                    + '<th colspan="3" class="colspan101112">建筑面积(m²)</th>'
                                + '</tr>'
                                + '<tr>'
                                    + '<th class="colspan4">规划</th>'
                                    + '<th class="colspan5">条件</th>'
                                    + '<th class="colspan6">现状</th>'
                                    + '<th class="colspan7">规划</th>'
                                    + '<th class="colspan8">条件</th>'
                                    + '<th class="colspan9">现状</th>'
                                    + '<th class="colspan10">规划</th>'
                                    + '<th class="colspan11">条件</th>'
                                    + '<th class="colspan12">现状</th>'
                                + '</tr>'
                            + '</thead>'
                        + '</table>'
                    + '</div>'
                    + '<div class="gfss-talbe-body">'
                        + '<table class="table table-bordered firsttable" id="gfssTable">'
                            + '<tbody class="gfss-talbe-tbody">'
                            + '</tbody>'
                        + '</table>'
                      + '</div>'
                      + '<div class="print"><span class="icon-Viewform"></span></div>'
                      + '</div>';

            $(".gfss-table-wrap").html(html);

            //滚动条
            $(".gfss-talbe-body").mCustomScrollbar({
                theme: "minimal-dark"
            });
        },

        /**
        *填充table
        *@method setTable
        *param data{Array}
        *@private
        */
        setTable: function (data) {
            var container = ".gfss-talbe-tbody";
            $(container).html("");

            //插入一级（tr）数据并显示
            for (var i = 0; i < data.length; i++) {
                var tr = '';
                if (data[i].Values.length == 0) {//普通的一级tr
                    tr = '<tr class="levelOne" level="1" dataid="' + data[i].Key + '" pid="" gpid="">'
                        + '<td class="colspan1"></td>'
                        + '<td class="colspan2"> - </td>'
                        + '<td class="colspan3">' + data[i].Key + '</td>'
                        + '<td class="colspan4">' + data[i].gh_num + '</td>'
                        + '<td class="colspan5">' + data[i].tj_num + '</td>'
                        + '<td class="colspan6">' + data[i].xz_num + '</td>'
                        + '<td class="colspan7">' + (data[i].gh_space == undefined?"":data[i].gh_space) + '</td>'
                        + '<td class="colspan8">' + (data[i].tj_space == undefined?"":data[i].tj_space) + '</td>'
                        + '<td class="colspan9">' + (data[i].xz_space == undefined?"":data[i].xz_space) + '</td>'
                        + '<td class="colspan10">' + (data[i].gh_area == undefined?"":data[i].gh_area) + '</td>'
                        + '<td class="colspan11">' + (data[i].tj_area == undefined?"":data[i].tj_area) + '</td>'
                        + '<td class="colspan12">' + (data[i].xz_area == undefined ? "" : data[i].xz_area) + '</td>'
                      + '</tr>';
                    $(container).append(tr);
                }
                else {//含二级元素的一级tr
                    tr = '<tr class="hastables levelOne" level="1" dataid="' + data[i].Key + '" pid="' + data[i].Key + '" gpid="">'
                        + '<td class="colspan1 signOne">+</td>'
                        + '<td class="colspan2"> • </td>'
                        + '<td class="colspan3">' + data[i].Key + '</td>'
                        + '<td class="colspan4">' + data[i].gh_num + '</td>'
                        + '<td class="colspan5">' + data[i].tj_num + '</td>'
                        + '<td class="colspan6">' + data[i].xz_num + '</td>'
                        + '<td class="colspan7">' + (data[i].gh_space == undefined ? "" : data[i].gh_space) + '</td>'
                        + '<td class="colspan8">' + (data[i].tj_space == undefined ? "" : data[i].tj_space) + '</td>'
                        + '<td class="colspan9">' + (data[i].xz_space == undefined ? "" : data[i].xz_space) + '</td>'
                        + '<td class="colspan10">' + (data[i].gh_area == undefined ? "" : data[i].gh_area) + '</td>'
                        + '<td class="colspan11">' + (data[i].tj_area == undefined ? "" : data[i].tj_area) + '</td>'
                        + '<td class="colspan12">' + (data[i].xz_area == undefined ? "" : data[i].xz_area) + '</td>'
                      + '</tr>';
                    $(container).append(tr);

                    //插入二级（tr）数据并隐藏
                    var secondData = data[i].Values;
                    for (var j = 0; j < secondData.length; j++) {
                        var secondTr = '';
                        secondTr = '<tr class="levelTwo" level="2" psName="' + secondData[j].Name + '" psRadius="' + secondData[j].Radius + '" dataid="' + secondData[j].Code + '" pid="' + data[i].Key + '" gpid="' + data[i].Key + '" style="display:none;">'
                                    + '<td class="colspan1"></td>'
                                    + '<td class="colspan2">' + secondData[j].Code + '</td>'
                                    + '<td class="colspan3">' + secondData[j].Name + '</td>'
                                    + '<td class="colspan4">' + secondData[j].gh_num + '</td>'
                                    + '<td class="colspan5">' + secondData[j].tj_num + '</td>'
                                    + '<td class="colspan6">' + secondData[j].xz_num + '</td>'
                                    + '<td class="colspan7">' + (secondData[j].gh_space == undefined ? "" : secondData[j].gh_space) + '</td>'
                                    + '<td class="colspan8">' + (secondData[j].tj_space == undefined ? "" : secondData[j].tj_space) + '</td>'
                                    + '<td class="colspan9">' + (secondData[j].xz_space == undefined ? "" : secondData[j].xz_space) + '</td>'
                                    + '<td class="colspan10">' + (secondData[j].gh_area == undefined ? "" : secondData[j].gh_area) + '</td>'
                                    + '<td class="colspan11">' + (secondData[j].tj_area == undefined ? "" : secondData[j].tj_area) + '</td>'
                                    + '<td class="colspan12">' + (secondData[j].xz_area == undefined ? "" : secondData[j].xz_area) + '</td>'
                                 + '</tr>';
                        $(container).append(secondTr);
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
            
            var tr = '<tr>'
                         + '<td colspan="3">总计</td>'
                         + '<td class="colspan4">'+ this.gh_num_all +'</td>'
                         + '<td class="colspan5">' + this.tj_num_all + '</td>'
                         + '<td class="colspan6">' + this.xz_num_all + '</td>'
                         + '<td class="colspan7"></td>'
                         + '<td class="colspan8"></td>'
                         + '<td class="colspan9"></td>'
                         + '<td class="colspan10"></td>'
                         + '<td class="colspan11"></td>'
                         + '<td class="colspan12"></td>'
                       + '</tr>';
            var container = ".gfss-talbe-tbody";
            $(container).append(tr);

            //this.planTotalArea = totalArea_plan;
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
                        $('.gfss-nav-collapse-wrap .active').removeClass(box_active);
                        break;
                    case '范围线上传':
                        $('.gfss-nav-collapse-wrap .active').removeClass(box_active);
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
            $(".gfss-nav-btn-wrap .collapsed").click();

            $(".analysis-service-container-radius").css({ "display": "none" });
            $(".analysis-service-result").css({ "display": "none" });

            //判断是否包含该属性值
            var bool = e.target.className.indexOf("RN-district-item");
            if (bool != -1) {
                $('.RN-town-item').removeClass("active");
                var text = Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue;
                $(".gfss-nav-btn-wrap button")[0].innerHTML = "行政区域";
            } else {
                $('.RN-district-item').removeClass("active");
                var text = $(e.target).text();
                $(".gfss-nav-btn-wrap button")[0].innerHTML = text;
            }
            this.RegionFeature = null;
            //清除缓冲分析结果图层
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };            

            $(".analysis-service-container-radius").css({ "display": "none" });
            $(".analysis-service-result").css({ "display": "none" });

            var li_active = "active";
            $(e.target).siblings("li").removeClass(li_active).end().addClass(li_active);

            //显示正在加载
            this.showLoading();

            //查询行政边界
            var currentData = [];
            var url = Project_ParamConfig.xingzhengConfig.xingzheng_layer.url;
            var id = Project_ParamConfig.xingzhengConfig.xingzheng_layer.field;
            var layerIndex = Project_ParamConfig.xingzhengConfig.xingzheng_layer.layerIndex;
            var query = new L.esri.Tasks.find(url);
            query.layers(layerIndex).text(text).fields(id);
            query.params.outSr = query.params.inSr = Project_ParamConfig.xingzhengConfig.xingzheng_layer.sr;
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
                            fillOpacity: 0.2,
                            CANVAS: true
                        };
                        geo.setStyle(highlightPolygonSymbol);
                        hlLayer.addLayer(geo);
                    }


                    if (Project_ParamConfig.PublicServiceConfig.PreResult) {

                        //this.offContent();
                        //this.hideLoading();
                        //L.dci.app.util.dialog.alert("错误提示", "结果请求错误");
                        var feature2 = this.RegionFeature;
                        var coordinates = feature2.geometry.coordinates;
                        for (var i = 0; i < coordinates[0].length; i++) {
                            var cache = coordinates[0][i][0];
                            coordinates[0][i][0] = coordinates[0][i][1];
                            coordinates[0][i][1] = cache;
                        }
                        var lay = L.polygon(coordinates);

                        var featureSet = new L.DCI.FeatureSet();
                        featureSet.features = [lay];
                        this.in_region = featureSet;
                        Project_ParamConfig.PublicServiceConfig.inputParams.In_Region = this.in_region;


                        this.ajax = new L.DCI.Ajax();
                        var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/";
                        var newUrl = url
                            + "analysis/landbpre/read/lpu/" + text;

                        this.ajax.get(newUrl, null, true, this, function (res) {
                            this.hideLoading();
                            if (res[0].name == "无结果") {
                                this.offContent();
                                L.dci.app.util.dialog.alert("温馨提示", "没有公服设施分析结果");
                            } else {
                                var value = res;
                                this.rebuildData(value);
                                if (this.tableData.length > 0) {
                                    this.showContent();
                                }                                    
                            }
                        }, function () {
                            
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
                        Project_ParamConfig.PublicServiceConfig.inputParams.In_Region = this.in_region;
                        this.getService();

                    };
                } else {
                    this.offContent();
                    L.dci.app.util.dialog.alert("温馨提示", "没有区域查询结果");
                }
            }, this);


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
            //$(".gfss-nav-btn-wrap .collapsed").click();

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
                var trlevel = parseInt(level);
                //隐藏二级和三级元素
                $(".gfss-talbe-tbody>tr.hastables[pid='" + id + "']").removeClass(tr_active);
                $(".gfss-talbe-tbody>tr.hastables[pid='" + id + "']").children().first().text("+");
                $(".gfss-talbe-tbody>tr.hastables[pid='" + id + "']").children().first().removeClass(sign_active);
                $(".gfss-talbe-tbody>tr[gpid='" + id + "']").css("display", "none");                    

            }
            else {
                //显示
                $(e.target).parent('.hastables').addClass(tr_active);
                $(e.target).parent('.hastables').children().first().text("-");
                $(e.target).parent('.hastables').children().first().addClass(sign_active);      //标记颜色改变
                var dataid = $(e.target).parent('.hastables').attr('dataid');
                $(".gfss-talbe-tbody>tr[pid='" + dataid + "']").css("display", "table-row");       //显示下级元素
            }
        },

        /**
        *执行公服设施缓冲分析
        *@method showTwoEvent
        *@param e{Object}
        *@private
        */
        showTwoEvent: function (e) {
            this.In_distances = e.currentTarget.attributes.psradius.value;
            document.getElementById("bufferinput").value = this.In_distances;
            this.key = e.currentTarget.attributes.psname.value;
            
            //规划点在第四列，所以childNodes[3]；
            var ps_num = e.currentTarget.childNodes[3].textContent;
            

            $("#analysis-service-type")[0].textContent = "「" + this.key + "」"
            $(".analysis-service-container-radius").css({ "display": "block" });
            $(".analysis-service-result").css({ "display": "block" });

            $('.loadPanle').css({ "display": "none" });
            //$(".bufferLoading").css({ "display": "none" });
            //显示分析结果面板及“加载中”标识

            var _this = this;
            document.getElementById("bufferinput").onkeydown = function (e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    _this.EnterBuffer();
                    return false;
                }
            };

            this.setScrollBarValue(this.In_distances);
            this.in_region;

            if (ps_num != "0") {
                var query = new L.esri.Tasks.query(Project_ParamConfig.PublicServiceConfig.buffer_query);

                query.where("name='" + this.key + "'");

                if (this.in_region.features[0]._parts) {
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var coordinates = this.in_region.features[0]._latlngs;
                    for (var i = 0; i < coordinates.length; i++) {
                        var lng = coordinates[i].lng;
                        var lat = coordinates[i].lat;
                        var point = map.options.crs.projection.project(L.latLng(lat, lng));
                        coordinates[i] = { "lng": point.x, "lat": point.y };
                        //coordinates[i] = [coordinates[i][1], coordinates[i][0]];
                    }
                    this.in_region.features[0]._latlngs = coordinates;
                    this.in_region.features[0]._parts = 0;
                };
                

                query.within(this.in_region.features[0]);
                query.params.outSr = query.params.inSr = Project_ParamConfig.xingzhengConfig.xingzheng_layer.sr;
                query.run(function (error, featureCollection, response) {
                    console.log('Found ' + featureCollection.features.length + ' features');
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    this.HLLayer = map.getHLLayer("publicService");
                    //HLLayer.clearHLLayer("publicService");
                    this.HLLayer.clearLayers("publicService");
                    var hlLayer = map.getHighLightLayer();
                    hlLayer.clearLayers();
                    this.PS_features = response.features;

                    this.BufferAnalysis();

                }, this);
            } else {
                if (this.HLLayer) {
                    this.HLLayer.clearLayers("publicService");
                };
                $('.loadPanle').css({ "display": "none" });
                $(".bufferLoading").css({ "display": "none" });

                $(".analysis-service-container-radius").css({ "display": "block" });
                $(".analysis-service-result").css({ "display": "block" });

                this.hideLoading();
                $(".analysis-service-cover")[0].textContent = "0";
                $(".analysis-service-overlap")[0].textContent = "0";
                $(".analysis-service-rate")[0].textContent = "0";

            };
                  
        },

        EnterBuffer: function () {
            this.In_distances = document.getElementById("bufferinput").value;
            this.scrollBar_Initialize();
            this.BufferAnalysis();
        },


        BufferAnalysis: function () {

            $(".bufferLoading").css({ "display": "block" });
            $(".analysis-service-cover")[0].textContent = "--";
            $(".analysis-service-overlap")[0].textContent = "--";
            $(".analysis-service-rate")[0].textContent = "--";
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };
            this.showBuffer(this.In_distances);

            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var featureSet = new L.DCI.FeatureSet();            
            var features = this.PS_features;
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                geo = L.dci.app.util.unproject(map, feature, "esriGeometryPoint");

                featureSet.features.push(geo);
            }
            Project_ParamConfig.PublicServiceConfig.buffer_inputParams.Gh_publicservices = featureSet;
            Project_ParamConfig.PublicServiceConfig.buffer_inputParams.Distance = this.In_distances;
            this.getBufferService();
        },

        showBuffer: function (radius) {
            var features = this.PS_features;
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                geo = L.dci.app.util.unproject(map, feature, "esriGeometryPoint");
                var cir = L.circle(geo._latlng, radius);

                polygonSymbol = {
                    color: '#ff5f00',
                    weight: 1,
                    opacity: 0.8,
                    fill: true,
                    fillColor: '#ffdc00',
                    fillOpacity: 0.5
                };
                cir.setStyle(polygonSymbol);

                this.highlightPointSymbol = {
                    icon: L.icon({
                        iconUrl: 'themes/default/images/marker-icon.png',
                        iconSize: [9, 14],
                    }),
                    opacity: 1
                };
                geo.setIcon(this.highlightPointSymbol.icon);
                this.HLLayer.addLayer(geo);
                this.HLLayer.addLayer(cir);
            }
        },


        //输出表格
        printExcel: function (e) {
            //alert("表格输出");
            //$('#gfssTable').tableExport({ type: 'excel', escape: 'false' });
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
                var aEle = $(".gfss-talbe-body").find(".colspan3");
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
                        var ele = $(".gfss-talbe-tbody>tr[gpid='" + id + "']");
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
                        var ele = $(".gfss-talbe-tbody>tr[pid='" + id + "']");
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
            //20150902 lir
            //this.DefLayer(array, 0);
        },

        /**
        *点击表头，恢复显示所有用地类型地块
        *@method landType
        *@param e{Object}
        *@private
        */
        landType: function (e) {
            var aEle = $(".gfss-talbe-body").find(".colspan3");
            for (var i = 0; i < aEle.length; i++) {
                $(aEle[i]).removeClass("selected");
            }
            this.DefLayer(false);
        },
                       
        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getService: function () {
            var url = Project_ParamConfig.PublicServiceConfig.url;
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(Project_ParamConfig.PublicServiceConfig.url,
                Project_ParamConfig.PublicServiceConfig.inputParams,
                Project_ParamConfig.PublicServiceConfig.outParams,
                $.proxy(this.returnGPData, this),
                $.proxy(this.resultImageLayerHandler, this),
                $.proxy(this.errorHandler, this));
        },

        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getBufferService: function () {
            //GP
            var buffer_url = Project_ParamConfig.PublicServiceConfig.buffer_url;
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(buffer_url,
                Project_ParamConfig.PublicServiceConfig.buffer_inputParams,
                Project_ParamConfig.PublicServiceConfig.buffer_outParams,
                $.proxy(this.BufferreturnGPData, this),
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
            $(".analysis-service-container-radius").css({ "display": "none" });
            $(".analysis-service-result").css({ "display": "none" });

            //隐藏正在加载
            this.hideLoading();
            var value = res.value;
            if (value == "[]" || value == "]" || value == null) {
                this.offContent();
                L.dci.app.util.dialog.alert("温馨提示", "没有查询结果");
            } else {
                this.rebuildData(value);
                if (this.tableData.length > 0) {
                    this.showContent();
                }
            }
        },
        /**
        *重构返回的GP结果
        *@method returnGPData
        *@param res{Object} Json格式结果
        *@private
        */
        rebuildData: function (value) {
            //this.tableData = JSON.parse(value);
            this.GPData = value;
            if (this.GPData.length != 0) {
                gh_result = this.GPData[0].Gh_result;
                tj_result = this.GPData[1].Tj_result;
                xz_result = this.GPData[2].Xz_result;
            }
            this.gh_num_all = 0;
            this.tj_num_all = 0;
            this.xz_num_all = 0;

            for (var i = 0; i < this.tableData.length; i++) {
                var midValue = this.tableData[i].Values;
                this.tableData[i].gh_num = 0;
                this.tableData[i].tj_num = 0;
                this.tableData[i].xz_num = 0;
                for (var j = 0 ; j < midValue.length ; j++) {
                    var midName = midValue[j].Name;
                    this.tableData[i].Values[j].gh_num = 0;
                    this.tableData[i].Values[j].tj_num = 0;
                    this.tableData[i].Values[j].xz_num = 0;
                    for (var k = 0 ; k < gh_result.length ; k++) {
                        if (gh_result[k].name == midName) {
                            this.tableData[i].Values[j].gh_num = gh_result[k].num;
                        }
                    }
                    for (var k = 0 ; k < tj_result.length ; k++) {
                        if (tj_result[k].name == midName) {
                            this.tableData[i].Values[j].tj_num = tj_result[k].num;
                        }
                    }
                    for (var k = 0 ; k < xz_result.length ; k++) {
                        if (xz_result[k].name == midName) {
                            this.tableData[i].Values[j].xz_num = xz_result[k].num;
                        }
                    }
                    this.tableData[i].gh_num += this.tableData[i].Values[j].gh_num;
                    this.tableData[i].tj_num += this.tableData[i].Values[j].tj_num;
                    this.tableData[i].xz_num += this.tableData[i].Values[j].xz_num;
                }
                this.gh_num_all += this.tableData[i].gh_num;
                this.tj_num_all += this.tableData[i].tj_num;
                this.xz_num_all += this.tableData[i].xz_num;
            }
        },
        /**
        *处理返回的GP结果
        *@method returnGPData
        *@param res{Object} Json格式结果
        *@private
        */
        BufferreturnGPData: function (res) {
            //隐藏正在加载
            this.asynBool = false;
            $('.loadPanle').css({ "display": "none" });
            $(".bufferLoading").css({ "display": "none" });

            $(".analysis-service-container-radius").css({ "display": "block" });
            $(".analysis-service-result").css({ "display": "block" });

            this.hideLoading();
            var value = res.value;
            if (value == "[]" || value == "]" || value == null) {
                this.offContent();
                L.dci.app.util.dialog.alert("温馨提示", "没有查询结果");
            } else {                
                $(".analysis-service-cover")[0].textContent = value.cover;
                $(".analysis-service-overlap")[0].textContent = value.Overlap;
                $(".analysis-service-rate")[0].textContent = value.Overlap_rate;

                }
        },

        /**
        *清除缓冲图层
        *@method clearBuffer
        *@private
        */
        clearBuffer: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id == "公服设施缓冲分析" && layer.options.id != null) {
                    map.removeLayer(layer.options.id);
                }
            });
        },

        /**
        *返回的GP图片信息
        *@method resultImageLayerHandler
        *@private
        */
        resultImageLayerHandler: function (jobinfo) {

            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id == "公服设施缓冲分析" && layer.options.id != null) {
                    map.removeLayer(layer.options.id);
                }
            });

            var hlLayer = map.getHighLightLayer();
            hlLayer.eachLayer(function (layer) {
                layer.options.fill = false;
            }); 

            var url = jobinfo.url;
            var layerIndex = 1;
            L.esri.dynamicMapLayer(url, { id: '公服设施缓冲分析', opacity: 0.6 }).addTo(_map);
            //L.dci.app.util.dialog.alert("温馨提示", "执行成功");
        },

        /**
        *加载专题服务
        *@method addService
        */
        addService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            var add_url = Project_ParamConfig.PublicServiceConfig.buffer_map;
            var layerIndex = Project_ParamConfig.PublicServiceConfig.buffer_map_layerId;
            L.esri.dynamicMapLayer(add_url, { id: '配套设施 ', layers: [layerIndex] }).addTo(map);

            //$("#legend-control").css('left', ' 720px');
        },
        /**
        *删除专题服务
        *@method deleteService
        */
        deleteService: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id == "配套设施 " && layer.options.id != null) {
                    map.removeLayer(layer.options.id);
                }
            });
        },

        /**
        *筛选显示地图要素
        *@method DefLayer
        *@param array{Array}
        *@param index{Number}
        *@private
        */
        DefLayer: function (key) {
            if (key == false) {
                key == "*";
            }
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();

            var layerIndex = Project_ParamConfig.PublicServiceConfig.buffer_map_layerId;

            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id == "配套设施") {
                    //设置图层透明度
                    //layer.setOpacity(0.5);
                    if (array) {
                        var layerDefs = { layerIndex: "NAME like '" + key };
                    } else {
                        var layerDefs = false;
                    }
                    layer.setLayerDefs(layerDefs);
                }
            }, this);
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

            Project_ParamConfig.PublicServiceConfig.inputParams.In_Region = this.in_region;
            this.getService();
        },

        /**
        *获取上传的CAD范围
        *@method getCADRegion
        *@param lay{Object} 
        *@private
        */
        getCADRegion: function (lay) {
            //清楚上一次buffer结果
            this.draw_disable();
            this.clearHL();
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };
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

            Project_ParamConfig.PublicServiceConfig.inputParams.In_Region = this.in_region;
            //Project_ParamConfig.gfssfxConfig.inputParams.in_kg_layer = arg[0];
            //Project_ParamConfig.gfssfxConfig.inputParams.in_mark = arg[1].in_mark;
            //Project_ParamConfig.gfssfxConfig.inputParams.in_population = arg[1].in_population;
            this.getService();
        },
        /**
        *获取上传的SHP范围
        *@method getSHPRegion
        *@param lay{Object} 
        *@private
        */
        getSHPRegion: function (lay) {
            //清楚上一次buffer结果
            this.draw_disable();
            this.clearHL();
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };
            L.DCI.AddCad.prototype.removerCAD();
            //显示正在加载
            this.showLoading();
            var lay2 = L.polygon(lay.geometry.rings[0]);

            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay2];
            this.in_region = featureSet;
            Project_ParamConfig.PublicServiceConfig.inputParams.In_Region = this.in_region;
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
            $(".gfss-nav-btn-wrap .collapsed").click();

            //清楚上一次buffer结果
            if (this.HLLayer) {
                this.HLLayer.clearLayers("publicService");
            };
            L.DCI.AddCad.prototype.removerCAD();
            //显示正在加载
            this.showLoading();
            //var geometry = lay.toGeoJSON().geometry;
            $('#QYHZ').removeClass('collapsed');
            this._polygon.disable();
            //参数配置

            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay];
            this.in_region = featureSet;
            Project_ParamConfig.PublicServiceConfig.inputParams.In_Region = this.in_region;
            this.getService();
        },

        /**
        *显示正在加载图标
        *@method showLoading
        *@private
        */
        showLoading: function () {
            $(".gfss-loadflash").css("z-index", "0");
        },
        /**
        *隐藏正在加载图标
        *@method hideLoading
        *@private
        */
        hideLoading: function () {
            $(".gfss-loadflash").css("z-index", "-1");
        },

    });
    return L.DCI.PublicService;
});
