/**
*项目一张图类
*@module modules.business
*@class DCI.Business.PojectMap
*@constructor initialize
*@extends DCI.Layout
*/
define("business/projectmap", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "layout/base",
    "data/ajax",
    "controls/dlLegend",
    "business/wholelifecycle",
    "plugins/scrollbar",
    "ztree",
    "util/attachment",
    "plugins/pagination",
    "common/businessTemplate"
], function (L) {
    L.DCI.Business.PojectMap = L.DCI.Layout.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "business-projectmap",

        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: '项目一张图',

        /**
        *保存整体情况统计数据
        *@property totalData
        *@type {Object}
        *@private
        */
        totalData: null,

        /**
        *保存当前的分页数据
        *@property data
        *@type {Object}
        *@private
        */
        data: null,

        /**
        *项目阶段类
        *@property phaseClass
        *@type {Object}
        *@private
        */
        phaseClass: null,

        /**
        *项目阶段   (0为全部,1为选址,2为条件,3为用地,4为工程,5为核实)
        *@property phase
        *@type {Number}
        *@private
        */
        phase: 0,

        /**
        *筛选条件   (0为查询全部)
        *@property condition
        *@type {String}
        *@private
        */
        condition: '0',

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
        *整体情况饼状图的颜色数组
        *@property pieColor
        *@type {Array}
        *@private
        */
        pieColor: ['#0082ff', '#148cff', '#2896ff', '#3ca0ff', '#50aaff', '#64b4ff', '#78beff', '#8cc8ff', '#a0d2ff', '#b4dcff', '#c8e6ff', '#dcf0ff', '#f0faff'],    //

        /**
        *业务模版类对象
        *@property businessTemplate
        *@type {Object}
        *@private
        */
        businessTemplate: null,

        _currentSelectedObj: null,

        /**
        *判断是整体情况或详细情况（true为整体情况，反之）
        *@property isContent
        *@type {Boolean}
        *@private
        */
        isContent: true,
        /**
        *保存查看的详情的项目当前页索引号(默认值为-1)
        *@property detailDataIndex
        *@type {Number}
        *@private
        */
        detailDataIndex: -1,

        /**
        *判断是项目列表或项目详情内容（false为项目列表，反之为项目详情）
        *@property isDetail
        *@type {Boolean}
        *@private
        */
        isDetail: false,

        /**
        *html总模板
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="projectmap_tab">'
                    + '<span class="active">整体情况</span><span>详细情况</span>'
                 + '</div>'
                 + '<div class="projectmap_tabContent">'
                    + '<div class="projectmap_tabContent1 tabContent active">'
                        + '<span class="title">建设项目各阶段分布情况</span>'
                        + '<table class="table table-bordered">'
                            + '<thead><tr><th class="region">项目阶段</th><th>个数(个)</th><th>规模(面积/万平方米)</th><th>规模占比(%)</th></tr></thead>'
                            + '<tbody></tbody>'
                        + '</table>'
                        + '<div id="projectPie" class="projectPie"></div>'
                    + '</div>'
                    + '<div class="projectmap_tabContent2 tabContent"></div>'
                 + '</div>',


        /**
        *内容模板
        *@property temp
        *@type {String}
        *@private
        */
        temp: '<div class="projectmapList active">'
                + '<div class="top"></div>'
                + '<div class="searchBar"><input type="text"/><span>搜索</span></div>'
                + '<div class="content"></div>'
                + '<div class="bottom"></div>'
             + '</div>'
             + '<div class="projectmapList-detail">'
                + '<div class="projectmapList-detail-title">'
                    + '<span class="turnback icon-return"></span>'
                    + '<div class="titlecontent"></div>'
                + '</div>'
                + '<div class="projectmapList-detail-content">'
                    + '<p class="projectmapList-detail-content-title">项目信息</p><p class="projectmapList-detail-content-button" data-Id=""><span>查看附件</span><span>项目视图</span></p>'
                    + '<div class="projectmapList-detail-content-projectInfo">'
                        + '<table class="table table-bordered">'
                            + '<tbody class="projectmapList-detail-content-tbody"></tbody>'
                        + '</table>'
                    + '</div>'
                    + '<div class="projectmapList-detail-content-phase"></div>'
                    + '<span class="viewWholeLifeCycle">地块全生命周期</span>'
                + '</div>'
             + '</div>',
        /**
        *初始化
        *@method initialize
        *@param layer{Object} 图层对象
        */
        initialize: function (layer) {
            this._clsName = Project_ParamConfig.xmOneMapConfig.name;
            this.layer = Project_ParamConfig.xmOneMapConfig.url;
            this.layerIndex = 4;
            this._container = L.DomUtil.create("div", 'projectmap', null);
            $(this._container).html(this.tempHtml);
            this._getStatisticsData();     //获取整体情况数据 
            this.showTo();
            $('.projectmap_tabContent1').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            //tab页切换事件
            $(".projectmap_tab").on('click', 'span', { context: this }, function (e) { e.data.context._chooseTab(e); });
        },

        /**
        *显示内容到容器中
        *@method showTo
        */
        showTo: function () {
            var param = {
                context: this,
                title: this._clsName,
                selected: true,
                index: 1
            }
            L.dci.app.pool.get("rightPanel").loadByOption(param);
        },

        /**
        *获取内容模版
        *@method getBody
        *@return {Object} 内容容器对象
        */
        getBody: function () {
            return this._container;
        },

        /**
        *切换tab页
        *@method _chooseTab
        */
        _chooseTab: function (e) {
            var text = $(e.target).text();
            var obj = $(e.target);
            if (obj.hasClass("active") == false) {
                //显示tab
                $(e.target).siblings().removeClass("active").end().addClass("active");
                switch (text) {
                    case '整体情况':
                        this.hideMarks();
                        this.isContent = true;
                        //显示整体情况栏
                        $(".projectmap_tabContent1").addClass("active").siblings().removeClass("active");
                        //清空高亮图层
                        var _map = L.DCI.App.pool.get("map");
                        _map.getHighLightLayer().clearLayers();
                        break;
                    case '详细情况':
                        this.isContent = false;
                        //显示详情情况栏
                        $(".projectmap_tabContent2").addClass("active").siblings().removeClass("active");
                        if ($(".projectmapList").length == 0)
                            this._createUi();
                        this.showMarks();
                        break;
                    default:
                        break;
                }
            }
        },

        /**
        *获取整体情况数据
        *@method _getStatisticsData
        */
        _getStatisticsData: function (e) {
            L.dci.app.services.businessService.getProjectmapStatistics({
                context: this,
                success: function (res) {
                    this.totalData = res;
                    this._insertContent();
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *获取分页数据（控制性详细规划）
        *@method getPageData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param phase {Number}             项目阶段
        *@param condition {String}         查询条件
        */
        _getPageData: function (currentPage, maxShowNum, phase, condition) {
            this._clearHighlight();
            L.dci.app.services.businessService.getProjectmapManageCells({
                page: currentPage,
                maxShowNum: maxShowNum,
                phase: phase,
                condition: condition,
                context: this,
                success: function (res) {
                    //恢复默认值
                    this.detailDataIndex = -1;

                    this.data = null;
                    this.pageNum = 0;
                    this.data = res;
                    this.pageNum = this.data.PageCount;         //一共多少页
                    this._insertProjectListContent();           //加载项目列表内容
                },
                error: function (e) {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *获取项目详情数据
        *@method _getDetailsData
        *@param itemId {String}         项目编号
        */
        _getDetailsData: function (itemId) {
            L.dci.app.services.businessService.getProjectmapDetailsInfo({
                itemId: itemId,
                context: this,
                success: function (res) {
                    this._insertProjectDetailsContent(res);           //加载项目详情内容
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *根据ID查询项目
        *@method queryProjectByIds
        *@param ids{Array} ID数组
        */
        queryProjectByIds: function (items) {
            this.isContent = false;
            $(".projectmap_tab>span:last-child").addClass("active").siblings().removeClass("active");
            $(".projectmap_tabContent2").addClass("active").siblings().removeClass("active");
            if ($(".projectmap_tabContent2").html() == "") {
                this._createUi(false);
            }
            $(".projectmapList .top>span").removeClass("active");
            $(".projectmapList .top>span:first-child").addClass("active");

            if (items.length == 0)
            {
                //状态信息
                this.detailDataIndex = -1;
                this.isDetail = false;

                $(".projectmapList").addClass("active");
                $(".projectmapList-detail").removeClass("active");
                this.data = [];
                this._insertProjectListContent();
                this.deleteLayer();
                return;
            }
            this._currentSelectedObj = items[0];
            var ids = [];
            for (var i = 0; i < items.length; i++) {
                ids.push(items[i].attributes[Project_ParamConfig.xmOneMapConfig.queryAttribute]);
            }
            this.service=L.dci.app.services.businessService.queryXmByIds({
                ids: ids.join(','),
                context: this,
                success: function (res) {
                    this.data = null;
                    this.pageNum = 0;
                    this.data = res;
                    this.pageNum = this.data.PageCount;
                    if (this.data.Count == 1)
                    {
                        //状态信息
                        this.detailDataIndex = 0;
                        this.isDetail = true;

                        $(".projectmapList").removeClass("active");
                        this._insertProjectListContent();
                        $(".projectmapList-detail").siblings().removeClass("active").end().addClass("active");
                        var container = $(".projectmapList-detail-content-tbody");
                        container.html("");
                        var prjectId = $.trim(this.data.Objects[0]["ITEMID"]);
                        var title = this.data.Objects[0]["ITEMNAME"];
                        $(".projectmapList-detail .titlecontent").html(title);
                        $(".projectmapList-detail .projectBtn").attr("data-info", prjectId);
                        this._getDetailsData(prjectId); //获取详情信息
                    } else
                    {
                        //状态信息
                        this.detailDataIndex = -1;
                        this.isDetail = false;

                        $(".projectmapList").siblings().removeClass("active").end().addClass("active");
                        this._insertProjectListContent();
                    }
                    //高亮列表栏项
                    var selecteds = $(".projectmapList .percontent");
                    var projectId;
                    for (var i = 0; i < selecteds.length; i++) {
                        projectId = $.trim($(selecteds[i]).children(".operation").children(".viewDetail").attr("data-projectid"));
                        if (projectId == ids[0])
                        {
                            this.detailDataIndex = i;
                            $(selecteds[i]).addClass("selected");
                            break;
                        }
                    }
                }
            });
        },

        /**
        *插入整体情况内容
        *@method _insertContent
        */
        _insertContent: function () {
            var stageName = [];                       //阶段名称集
            var legendData = [];                      //每个阶段的项目总数

            var totalNum = 0;
            //var totalArea = 0;

            //插入表格统计数据
            var trHtml = '';
            var data = this.totalData;
            //统计总面积
            var totalArea = 0.00;
            for (var i = 0; i < data.length; i++)
            {
                if (data[i].Obj == "" || data[i].Obj == null)
                    totalArea += 0;
                else
                    totalArea += parseFloat(data[i].Obj[1]);
            }

            for (var i = 0; i < data.length; i++) {
                if (data[i].Obj == "" || data[i].Obj == null) {
                    trHtml += "<tr><td>" + data[i].Key + "</td><td>0</td><td>0</td><td>0</td></tr>";
                    stageName.push(data[i].Key);
                    legendData.push(0);
                } else
                {
                    if (data[i].Obj[0] == 0) {
                    } else
                    {
                        var percentage = (parseFloat(data[i].Obj[1]) / totalArea * 100).toFixed(2);
                        trHtml += "<tr><td>" + data[i].Key + "</td><td>" + data[i].Obj[0] + "</td><td>" + (data[i].Obj[1] / 10000).toFixed(2) + "</td><td>"+ percentage +"</td></tr>";
                        totalNum +=parseFloat(data[i].Obj[0]);
                        //totalArea += parseFloat(data[i].Obj[1]);
                        stageName.push(data[i].Key);
                        legendData.push(data[i].Obj[0]);
                    }
                }
            }
            trHtml += "<tr><td>总计</td><td>" + totalNum + "</td><td>" + (totalArea / 10000).toFixed(2) + "</td><td></td></tr>";
            $(".projectmap_tabContent1 table>tbody").html(trHtml);
            //插入饼状图
            //this._setPieOptions(data, stageName, legendData);
            //this._setProjectPie();
            var barOption = this._setBarOptions(stageName, legendData);
            this._setBar(barOption);
        },

        /**
        *设置饼状图配置参数
        *@method _setPieOptions
        *@param data {Object}       数据信息
        *@param stageName {Object}  阶段名称集
        *@param legendData {Object} 每个阶段的总数值
        */
        _setPieOptions: function (data, stageName, legendData) {
            this.pieOptions = null;
            var color = this.pieColor;
            var pieData = [];
            for (var i = 0; i < stageName.length; i++) {
                pieData.push({ "value": legendData[i], "name": stageName[i] });
            }

            this.pieOptions = {
                legend: {
                    x: 'right',
                    y: 'center',
                    orient: 'vertical',  // horizontal
                    data: stageName
                },
                color:color,
                series: [
                    {
                        type: 'pie',
                        radius: '75%',
                        center: ['30%', '50%'],
                        selectedMode: 'single',
                        color: color,
                        itemStyle: {
                            normal: {
                                //borderColor:'#000000',
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false,
                                    length: 0.5
                                }
                            },
                            emphasis: {
                                label: {
                                    position: 'inner',
                                    show: true,

                                    textStyle: {
                                        color: '#000000',
                                        fontWeight: 'bold',
                                        align: 'left'
                                    },
                                    formatter: '{b}\n总数: {c}\n占比: {d}%'
                                }
                            }
                        },
                        data: pieData
                    }
                ]
            };
        },

        /**
        *填充饼状图
        *@method _setProjectPie
        */
        _setProjectPie: function () {
            var chart = echarts.init(document.getElementById('projectPie'));
            chart.setOption(this.pieOptions);
        },


        /**
        *设置饼状图配置参数
        *@method _setBarOptions
        *@param stageName {Object}  阶段名称集
        *@param legendData {Object} 每个阶段的总数值
        */
        _setBarOptions: function (stageName, legendData) {
            var barOption = {
                //legend: {
                //    itemWidth: 6,
                //    itemHeight: 6,
                //    x: 'right',
                //    y: '8px',
                //    data: ['总量']
                //},
                calculable: false,
                color: ['#8ccdf0'],
                grid: {
                    x: 0,
                    y: 35,
                    x2: 0,
                    y2: 30,
                    borderWidth:0,
                },
                yAxis: [
                    {
                        type: 'value',
                        show:false,
                        splitLine: { show: false },
                    }
                ],
                xAxis: [
                    {
                        type: 'category',
                        splitLine: { show: false },
                        axisLabel: {
                            //rotate: 40,
                            textStyle: {
                                color: '#000',
                                fontWeight: 'bold'
                            }
                        },
                        data: stageName
                    }
                ],
                series: [
                    {
                        name: '总量',
                        type: 'bar',
                        stack: '总量',
                        barCategoryGap: '40%',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 0, 0],
                                label: { show: true, position: 'top' }  //, textStyle: { color: '#fff' },
                            },
                            emphasis: {
                                barBorderRadius: [4, 4, 0, 0]
                            }
                        },
                        data: legendData
                    }
                ]
            };

            return barOption;
        },

        /**
        *填充柱状图
        *@method _setBar
        */
        _setBar: function (barOption) {
            var chart = echarts.init(document.getElementById('projectPie'));
            chart.setOption(barOption);
        },


        /**
        *插入项目列表内容
        *@method _insertProjectListContent
        */
        _insertProjectListContent: function () {
            //清空内容区域和页码区域
            var containerObj = $(".projectmap_tabContent2 .content .mCSB_container");
            containerObj.html("");
            $('.projectmap_tabContent2 .bottom').html("");
            var data = this.data.Objects;       //保存具体内容数据
            var columnName = this.data.Columns; //保存列名称
            //判断是否有匹配数据
            if (data == null || data.length == 0) {
                var html = '<p class="emptyResult">没有匹配的数据!</p>';
                containerObj.html(html);
            }
            else {
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    var trHtml = '';
                    var obj = data[i];
                    for (var att in obj) {//遍历要插入的字段信息
                        var key = att;
                        for (var kk in columnName) {//将英文字段名改为对应的中文名
                            if (att == kk) {
                                key = columnName[kk];
                                break;
                            }
                        }
                        //过滤不显示的字段
                        if (!L.dci.app.util.tool.isShowAttribute(Project_ParamConfig.xmOneMapConfig.attributes, att)) {
                            continue;
                        }
                        else {
                            var value = obj[att] == null ? "" : obj[att];
                            trHtml += '<tr><td>' + key + ':</td><td>' + value + '</td></tr>';
                        }
                    }

                    var projectId = data[i]["ITEMID"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectName = data[i]["ITEMNAME"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectPhase = data[i]["PROJECTSTA"];   //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectType = data[i]["XMLX"];         //这里通过key获取对应的值，作为详情按钮的属性保存
                    var number = i;

                    html += '<div class="percontent">'
                                + '<div class="pic1">'
                                + '</div>'
                                + '<div class="percontent-content">'
                                    + '<table>'
                                        + '<tbody>'
                                            + trHtml
                                        + '</tbody>'
                                    + '</table>'
                                + '</div>'
                                + '<div class="operation">'
                                    + '<span class=""></span>'     //这个类看情况添加iconMark
                                    + '<span class="viewDetail" number = ' + number + '  data-projectid="' + projectId + '" data-projectname="' + projectName + '">详情</span>'
                                + '</div>'
                             + '</div>';
                }
                containerObj.html(html);
                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.projectmap_tabContent2 .bottom'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
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
            this._getPageData(page, this.maxShowContentNum, this.phase, this.condition);
        },

        /**
        *清除高亮图层
        *@method _clearHighlight
        */
        _clearHighlight: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
        },

        /**
        *创建项目列表视图
        *@method _createUi
        */
        _createUi: function (isAddData) {
            $(".projectmap_tabContent2").html(this.temp);
            $('.projectmap_tabContent2 .projectmapList .content').mCustomScrollbar({ theme: 'minimal-dark' });          //滚动条
            this._insertAllPhase();
            if (isAddData == undefined || isAddData == true)
                this._getPageData(this.currentPage, this.maxShowContentNum, this.phase, this.condition);

            $('.projectmap_tabContent2 .projectmapList-detail-content').mCustomScrollbar({
                theme: 'minimal-dark',
                callbacks: {
                    onOverflowYNone: function () {
                        $(".viewWholeLifeCycle").css( "margin-top","0px");
                    },
                    whileScrolling: function () {
                        var windowHeight = window.innerHeight;
                        var elePosition = $(".viewWholeLifeCycle").offset().top;
                        var height = elePosition + 30 + 10;
                        if (elePosition > windowHeight - 39 || elePosition < windowHeight - 39)
                        {
                            var a = height - windowHeight;
                            var b = $(".viewWholeLifeCycle").css("margin-top");
                            b = b.replace("px", "");
                            var c = -parseInt(b);
                            var height2 = -(a + c);
                            $(".viewWholeLifeCycle").css("margin-top", height2);
                        }
                    }
                }
            });   //滚动条

            ////点击状态
            $(".projectmap_tabContent2 .top").on('click', 'span:not(:last)', { context: this }, function (e) { e.data.context._switchTab(e); });
            //显示或隐藏搜索栏
            $(".projectmap_tabContent2 .top").on('click', 'span:last', { context: this }, function (e) { e.data.context._showSearch(e); });
            //点击搜索
            $(".projectmap_tabContent2 .searchBar").on('click', 'span', { context: this }, function (e) { e.data.context._clickSearch(e); });
            //搜索(回车键触发)
            $(".projectmap_tabContent2 .searchBar").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    e.data.context._clickSearch(e);
                    return false;
                }
            });

            //点击详情
            $(".projectmap_tabContent2").on('click', 'span.viewDetail', { context: this }, function (e) {
                e.data.context.viewDetail(e);
            });
            //返回按钮
            $(".projectmapList-detail").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });

            //项目信息栏的查看附件
            $(".projectmap_tabContent2").on('click', '.projectmapList-detail-content-button>span:first', { context: this }, function (e) { e.data.context._viewProjectAccessory(e); });
            //项目信息栏的项目视图
            $(".projectmap_tabContent2").on('click', '.projectmapList-detail-content-button>span:last', { context: this }, function (e) { e.data.context._viewProject(e); });
            //地块全生命周期（图文跳转）
            $(".projectmap_tabContent2").on('click', '.viewWholeLifeCycle', { context: this }, function (e) { e.data.context._viewWholeLifeCycle(e); });

            //项目定位
            $(".projectmap_tabContent2").on('click', 'div.percontent', { context: this }, function (e) {
                var _this = e.data.context;
                $(".projectmapList .percontent").removeClass("selected");
                $(e.currentTarget).addClass("selected");
                var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));
                _this.detailDataIndex = $(e.currentTarget).children(".operation").children("span:last-child").attr("number");
                _this._zoomTo(id);
            });
        },


        /**
        *插入全部阶段内容
        *@method _insertAllPhase
        */
        _insertAllPhase: function () {
            var containerObj = $(".projectmapList>.top");
            var data = ["全部", "选址", "条件", "用地", "方案", "工程", "核实"];       //获取所有阶段
            var trHtml = '';

            for (var i = 0; i < data.length; i++) {
                if (data[i] == "全部")
                    trHtml += '<span class="active">全部</span>';
                else
                    trHtml += '<span>' + data[i] + '</span>';
            }
            trHtml += '<span class="search icon-search-icon"></span>';
            containerObj.html(trHtml);
        },

        /**
        *切换项目阶段
        *@method _switchTab
        */
        _switchTab: function (e) {

            var eleActive = 'active';
            var targetObj = $(e.target);
            targetObj.siblings().removeClass(eleActive);
            targetObj.addClass(eleActive);
            var text = targetObj.text();
            //隐藏搜索栏
            this._hideSearch();
            switch (text) {
                case '全部':
                    this.phase = 0;
                    break;
                case '选址':
                    this.phase = 1;
                    break;
                case '条件':
                    this.phase = 2;
                    break;
                case '用地':
                    this.phase = 3;
                    break;
                case '方案':
                    this.phase = 4;
                    break;
                case '工程':
                    this.phase = 5;
                    break;
                case '核实':
                    this.phase = 6;
                    break;
                default:
                    break;
            }
            //恢复当前页为第一页
            this.currentPage = 1;
            this._getPageData(this.currentPage, this.maxShowContentNum, this.phase, "0");
        },

        /**
        *显示搜索栏
        *@method _showSearch
        */
        _showSearch: function (e) {
            if (!$(".projectmapList .searchBar").hasClass("active")) {
                $(".projectmapList .searchBar").addClass("active");
                $(".projectmapList .mCSB_container").addClass("searchBarActive");
                $(".projectmapList .searchBar input").focus();
            }
            else {
                this._hideSearch();
            }
        },

        /**
        *隐藏搜索栏
        *@method _hideSearch
        */
        _hideSearch: function (e) {
            $(".projectmapList>.searchBar>input").val("");
            $(".projectmapList .searchBar").removeClass("active");
            $(".projectmapList .mCSB_container").removeClass("searchBarActive");
            this.condition = 0;
        },

        /**
        *点击搜索
        *@method _clickSearch
        */
        _clickSearch: function (e) {
            var condition = $.trim($(".projectmapList>.searchBar>input").val());
            if (condition == "") {
                this.condition = "0";
            } else {
                condition = condition.replace(/\s/g, "");
                var patt1 = /[^a-zA-Z0-9\u4E00-\u9FA5]/g;    //匹配所有字母数字和中文
                var result = patt1.test(condition);
                if (result == true)
                {
                    L.dci.app.util.dialog.alert("提示", "搜索内容不能包含特殊字符");
                    return;
                }
                else
                    this.condition = condition;
            }
            //恢复当前页为第一页
            this.currentPage = 1;
            this._getPageData(this.currentPage, this.maxShowContentNum, this.phase, this.condition);
        },

        /**
        *详情点击事件
        *@method viewDetail
        *@param e {Object}       event对象
        */
        viewDetail: function (e) {
            //状态为详情内容
            this.isDetail = true;
            //保存当前的项目索引
            this.detailDataIndex = parseInt($(e.target).attr("number"));

            $(".projectmapList-detail").siblings().removeClass("active").end().addClass("active");
            var container = $(".projectmapList-detail-content-tbody");
            container.html("");
            var prjectId = $.trim($(e.target).attr("data-projectid"));
            var title = $(e.target).attr("data-projectname");
            $(".projectmapList-detail .titlecontent").html(title);
            $(".projectmapList-detail .projectmapList-detail-content-button").attr("data-Id", prjectId);
            this._getDetailsData(prjectId); //获取详情信息
        },

        /**
        *返回
        *@method turnBack
        */
        turnBack: function () {
            //状态为项目列表
            this.isDetail = false;
            $(".projectmapList-detail").removeClass("active").siblings().addClass("active");
            //取消原来保留项目选中状态
            var ele = $(".projectmapList").find("div.percontent")[this.detailDataIndex];
            $(ele).removeClass("selected");
            this.detailDataIndex = -1;
            //取消地图气泡选中状态
            $(".leaflet-marker-pane  div").removeClass('actived');
            this.deleteLayer();
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            _map.getHighLightLayer().clearLayers();
        },

        /**
        *插入项目详情内容
        *@method _insertProjectDetailsContent
        *@param data {Object}       数据对象
        */
        _insertProjectDetailsContent: function (data) {
            this.businessTemplate = null;
            this._detailProjectId = "";
            if (data != null) {
                var projectId, projectPhase, projectType;
                var projectHtml = "";
                for (var att in data) {
                    if (att == "项目编号")
                        projectId = data[att];
                    if (att == "项目阶段")
                        projectPhase = data[att];
                    if (att == "项目类型")
                        projectType = data[att];
                    if (att == "项目类型") continue;   //不显示项目类型字段，不过不可以删除，项目阶段类的初始化要使用
                    if (data[att] != "") {
                        projectHtml += "<tr><td>" + att + "</td><td>" + data[att] + "</td></tr>";
                    }
                }
                var tbodyObj = $(".projectmapList-detail table>.projectmapList-detail-content-tbody");
                tbodyObj.html(projectHtml);
            }
            this.queryProjectLatlng(projectId, projectPhase, projectType);
            this._detailProjectId = projectId;
        },

        /**
        *获取项目的空间数据信息
        *@method queryProjectLatlng
        *@param projectId{String} 项目的projectId
        */
        queryProjectLatlng: function (projectId, projectPhase, projectType) {
            this.projectLatlng = null;
            var id = $.trim(projectId);
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var query = new L.esri.Tasks.Find(this.layer);
            query.layers(this.layerIndex).text(id).fields("PROJECTID");
            query.params.sr = "";
            query.run(function (error, featureCollection, response) {
                if (error) {
                    L.dci.app.util.dialog.alert("代码:" + error.code, "详情:" + error.message);
                }
                else {
                    var feature = featureCollection.features[0];
                    var geoType = feature.geometry.type;
                    var geo = L.dci.app.util.unproject(map, feature, geoType);
                    this.projectLatlng = geo.getBounds().getCenter();
                    this.features = null;
                    this.features = featureCollection.features[0];
                    //调用项目阶段类，初始化一个项目阶段类对象，获取对应的html以及事件(参数：项目编号、项目空间数据、项目阶段、项目类型、容器id、功能名称)
                    //this.phaseClass = null;
                    //this.phaseClass = new L.DCI.Common.PojectPhase(id, feature, projectPhase, projectType, ".projectmapList-detail-content-phase", "项目一张图");
                    this.addPhaseContent(id, projectPhase);
                }
            }, this);

        },

        /**
        *添加项目阶段内容
        *@method addPhaseContent
        *@param functionName {String}
        */
        addPhaseContent: function (projectId, projectPhase) {
            this.phaseConfig = null;
            this.phaseConfig = Project_ParamConfig.projectPhaseConfig;
            //获取当前阶段的阶段id，以及所在数组的索引
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                if (projectPhase == this.phaseConfig[i].name)
                {
                    this.currentIndex = i;
                    break;
                }
            }
            //插入阶段的服务
            this.addLayer(this.currentIndex);
            //获取阶段信息
            this.getPhaseData(projectId, this.currentIndex);

        },

        /**
        *添加阶段图层服务
        *@method addLayer
        *@param functionName {String}
        */
        addLayer: function (currentIndex) {
            var url = this.phaseConfig[currentIndex].url;
            var layerIndex = this.phaseConfig[currentIndex].layerIndex;
            var idStr = "项目一张图阶段-" + this.phaseConfig[currentIndex].name;
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _count = _map.getLayers().length;
            var isHas = false;
            _map.map.eachLayer(function (layer) {
                _count--;
                if (layer.options && layer.options.id == idStr)
                {
                    isHas = true;
                    return;
                }
                if (_count == 0 && isHas == false)
                {
                    this.deleteLayer();
                    if (url != "")
                    {
                        _map.addLayer(url, { layers: [layerIndex], id: idStr });
                    }
                }

            }, this);
        },

        /**
        *删除阶段图层服务
        *@method deleteLayer
        */
        deleteLayer: function () {
            if (this.phaseConfig == undefined || this.phaseConfig == null) return;
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                var idStr = "项目一张图阶段-" + this.phaseConfig[i].name;
                _map.removeLayer(idStr);
            }
        },

        /**
        *获取项目阶段信息
        *@method getPhaseData
        *@param projectId {String}              项目PROJECTID
        *@param currentIndex {String}           当前阶段的数组索引
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        */
        getPhaseData: function (projectId, currentIndex) {
            if (currentIndex == 0)
            {
                //查询控规阶段数据,通过项目坐标查询属性信息
                var url = this.phaseConfig[currentIndex].url + '/' + this.phaseConfig[currentIndex].layerIndex;
                var query = L.esri.Tasks.query(url, { proxy: Project_ParamConfig.defaultAjaxProxy });
                query.params.outSr = "";
                query.intersects(this.features);
                query.params.inSr = "";
                query.fields(this.phaseConfig[currentIndex].queryFields);
                query.run(function (error, featureCollection, response) {
                    if (typeof error == "undefined")
                    {
                        var data = featureCollection.features;
                        if (data.length != 0) {
                            this.fillPhaseInfo(data, currentIndex);
                        }
                    }
                }, this);
            }
            else
            {
                //查询其它阶段，通过项目编号projectId查询属性信息
                var url = this.phaseConfig[currentIndex].url + '/' + this.phaseConfig[currentIndex].layerIndex;
                var text = "PROJECTID='" + projectId + "'";
                var query = L.esri.Tasks.query(url);
                query.fields(this.phaseConfig[currentIndex].queryFields);
                query.params.outSr = "";
                query.where(text);
                query.run(function (error, featureCollection, response) {
                    if (typeof error == "undefined")
                    {
                        var data = featureCollection.features;
                        if (data.length != 0) {
                            this.fillPhaseInfo(data, currentIndex);
                        }
                    }
                }, this);
            }
        },

        /**
        *填充项目阶段信息
        *@method fillPhaseInfo
        *@param data {Object}                   项目阶段信息
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        */
        fillPhaseInfo: function (data, currentIndex) {
            if (currentIndex != this.currentIndex) return;
            var queryFields = this.phaseConfig[currentIndex].queryFields;
            var displayFieldsName = this.phaseConfig[currentIndex].displayFieldsName;
            //获取阶段显示名称（这里为鼠标移到数字上显示）
            var phaseNames = [];
            var dataArray = [];
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                phaseNames.push(this.phaseConfig[i].name);
            }
            //构建数据
            if (data != null)
            {
                for (var i = 0; i < data.length; i++)
                {
                    var obj = data[i].properties;
                    var json = {};
                    for (var j = 0; j < queryFields.length; j++)
                    {
                        var displayName = displayFieldsName[j];
                        if (queryFields[j] == "CASE_ID")
                        {
                            var value = obj["CASE_ID"] == null ? "" : obj["CASE_ID"];
                            json["CASE_ID"] = value;
                        }
                        else
                        {
                            var value = obj[queryFields[j]] == null ? "" : obj[queryFields[j]];
                            json[displayName] = value;
                        }
                    }
                    dataArray.push(json);
                }
            }

            var _this = this;
            if (this.businessTemplate == null || this.businessTemplate == undefined)
            {
                this.businessTemplate = new L.DCI.Common.BusinessTemplate({
                    container: '.projectmapList-detail-content-phase',
                    title: '主要指标',
                    names: phaseNames,
                    data: dataArray,
                    index: currentIndex + 1,
                    theme: 'timeline',
                    titleWidth: 70,
                    isAnimate: "true",
                    stepClick: function (e) { _this.stepClickEvent(e); },
                    viewAccessory: function (caseId, e) { _this.viewAccessoryEvent(caseId, e); },
                    viewForm: function (caseId, e) { _this.viewFormEvent(caseId, e); }
                });
            }
            else
            {
                this.businessTemplate.reFillData(dataArray, currentIndex + 1);
            }

        },

        /**
        *主要阶段的阶段点击事件
        *@method stepClickEvent
        */
        stepClickEvent: function (e) {
            var num = parseInt($(e.currentTarget).attr("num"));
            this.deleteLayer();
            //插入阶段的服务
            this.addLayer(num - 1);

            //this.fillPhaseInfo(null, num - 1);
            this.businessTemplate.reFillData([], num);
            this.currentIndex = num - 1;
            this.getPhaseData(this._detailProjectId, num - 1);
        },

        /**
        *主要阶段的查看附件事件
        *@method viewAccessoryEvent
        */
        viewAccessoryEvent: function (caseId, e) {
            //if (caseId == "" || caseId == undefined || caseId == null)
            //    L.dci.app.util.dialog.alert("提示", '未能找到该项目');
            //else
            //    L.dci.app.util.tool.autoLogin(caseId);      

            var caseid = caseId;

            var atta = new L.DCI.Attachment();
            this.attObject = $(".projectmap_tabContent2")[0];
            //{type} pro:项目附件；case:业务附件
            type = "case";
            atta.getDirectory(this.attObject, caseid,null,type);

        },

        /**
        *主要阶段的查看表单事件
        *@method viewFormEvent
        */
        viewFormEvent: function (caseId, e) {
            if (caseId == "" || caseId == undefined || caseId == null)
                L.dci.app.util.dialog.alert("提示", '未能找到该项目');
            else
                L.dci.app.util.tool.autoLogin(caseId);
        },



        /**
    *项目信息栏的项目视图
    *@method _viewProject
    */
        _viewProject: function (e) {
            var ele = $(e.currentTarget);
            var id = $(ele).parent(".projectmapList-detail-content-button").attr("data-Id");
            if (id == "" || id == undefined || id == null)
                L.dci.app.util.dialog.alert("提示", '未能找到该项目');
            else
                L.dci.app.util.tool.autoLogin(id);
        },

        /**
        *项目信息栏的查看附件
        *@method _viewProjectAccessory
        */
        _viewProjectAccessory: function (e) {

            var caseid = e.target.parentElement.getAttribute('data-id');

            var atta = new L.DCI.Attachment();
            this.attObject = $(".projectmap_tabContent2")[0];
            //{type} pro:项目附件；case:业务附件
            type = "pro";
            atta.getDirectory(this.attObject, caseid,null,type);

        },


        /**
        *地块全生命周期点击事件
        *@method _viewWholeLifeCycle
        */
        _viewWholeLifeCycle: function () {
            //项目编号
            var latlng = this.projectLatlng;
            var url = this.layer;
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var wholelifecycle = null;
            if (L.dci.app.pool.has("wholelifecycle") == true)
            {
                L.dci.app.pool.remove("wholelifecycle");

            }
            wholelifecycle = new L.DCI.Business.WholeLifeCycle();
            L.dci.app.pool.add(wholelifecycle);
            wholelifecycle.zgqueryfromProject({ "map": map, "latlng": latlng });
        },


        /**
        *根据当前ID定位项目
        *@method _zoomTo
        *@param value{Array}ID数组
        */
        _zoomTo: function (value) {
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                var _this = this;
                if (layer.options
                    && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && layer.options.name == this._clsName) {
                    layer.metadata(function (error, metadata) {
                        if (metadata == null) return;
                        var layers = [];
                        for (var i = 0 ; i < metadata.layers.length; i++) {
                            if (metadata.layers[i].name == "项目范围线") {
                                layers.push(metadata.layers[i].id.toString());
                            };
                        }
                        L.dci.app.util.locate.doFind(layer.url, layers, Project_ParamConfig.xmOneMapConfig.zoomItemName, value, function (featureCollection, response) {
                            var num = response.results.length;
                            if (num > 0)
                                _this._currentSelectedObj = response.results[0];
                        });
                    }, _this);
                }
            }, this);
        },

        /**
        *隐藏当前高亮对象
        *@method showMarks
        */
        hideMarks: function () {
            if (this.isContent == false)
            {
                if (this.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.detailDataIndex);
                    //模拟返回点击事件
                    $(".projectmap_tabContent2").find(".turnback").click();
                    //恢复状态信息
                    this.detailDataIndex = detailDataIndex;
                    this.isDetail = true;
                }
                else
                {
                    var detailDataIndex = parseInt(this.detailDataIndex);
                    //恢复状态信息
                    this.detailDataIndex = detailDataIndex;
                }
            }
        },

        /**
        *高亮当前高亮对象
        *@method showMarks
        */
        showMarks: function() {
            if (this.isContent == false)
            {
                //当模块不处于整体情况tab中时，判断是处理项目列表栏还是项目详情内容栏
                if (this.isDetail == true)
                {
                    if (this.detailDataIndex == -1) return;
                    var ele = $(".projectmapList").find("div.percontent")[this.detailDataIndex];
                    $(ele).find(".viewDetail").click();
                }
                else
                {
                    if (this.detailDataIndex == -1) return;
                    var ele = $(".projectmapList").find("div.percontent")[this.detailDataIndex];
                    $(ele).click();
                }
            }
        }

    });
    return L.DCI.Business.PojectMap;
});


