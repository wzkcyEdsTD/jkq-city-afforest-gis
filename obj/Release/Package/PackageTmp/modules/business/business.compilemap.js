/**
*编制一张图（整体情况）类
*@module modules.business
*@class DCI.Business.CompileMap
*@constructor initialize
*/
define("business/compilemap", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "business/regulatoryplan"
], function (L) {
    L.DCI.Business.CompileMap = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "business-compilemap",

        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: null,

        /**
        *保存当前的分页数据
        *@property data
        *@type {Object}
        *@private
        */
        data: null,

        /**
        *控制性详细规划类
        *@property regulatoryplan
        *@type {Object}
        *@private
        */
        regulatoryplan: null,

        /**
        *判断是整体情况或控制性详细规划内容（true为整体情况，反之）
        *@property isContent
        *@type {Boolean}
        *@private
        */
        isContent: true,

        /**
        *html模板
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="compilemap_tab">'
                    + '<span class="active">整体情况</span><span>控制性详细规划</span>'
                 + '</div>'
                 + '<div class="compilemap_tabContent">'
                    + '<div class="compilemap_tabContent1 tabContent active">'
                        + '<div class="total-plan">'
                            + '<span class="title"></span>'
                            + '<div class="summary content"></div>'
                        + '</div>'
                        + '<div class="regulatory-plan">'
                            + '<span class="title active"></span>'
                            + '<div class="summary content"></div>'
                            + '<div class="summary2 content"></div>'
                            + '<table class="table table-bordered">'
                                + '<thead><tr><th class="region">行政区域</th><th>总计</th></tr></thead>'
                                + '<tbody></tbody>'
                            + '</table>'
                        + '</div>'
                        + '<div id="compilePie" class="compilePie"></div>'
                    + '</div>'
                    + '<div class="compilemap_tabContent2 tabContent"></div>'
                 + '</div>',

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._clsName = Project_ParamConfig.bzOneMapConfig.name;
            this._container = L.DomUtil.create("div", 'compilemap', null);
            $(this._container).html(this.tempHtml);
            this.getData();     //获取整体情况数据 
            this.showTo();
            $('.compilemap_tabContent1').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            //tab页切换事件
            $(".compilemap_tab").on('click', 'span', { context: this }, function (e) { e.data.context.chooseTab(e); });
            $(".compilemap_tabContent").on('click', 'span.title.active', { context: this }, function (e) { e.data.context.gotoTab(e); });
        },

        /**
        *获取内容模版
        *@method getBody
        *@return {String} 内容模版
        */
        getBody: function () {
            return this._container;
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
        *获取数据
        *@method getData
        */
        getData: function () {
            var year = Project_ParamConfig.bzOneMapConfig.year;            //时间
            L.dci.app.services.businessService.getCompileMapData({
                year: year,
                context: this,
                success: function (res) {
                    this.data = res;
                    this.insertContent();
                }
            });
        },

        /**
        *获取查询的图层
        *@method getQueryLayer
        *@return {String}可查询的图层地址
        */
        getQueryLayer:function() {
            return Project_ParamConfig.bzOneMapConfig.queryLayer;
        },
        /**
        *插入整体情况内容
        *@method insertContent
        */
        insertContent: function () {
            this.setTotalPlanContent();
            this.setRegulatoryPlanContent();
            //表格隔行着色
            $(".regulatory-plan tbody tr:odd").addClass("trhighlight");
        },

        /**
        *插入总体规划内容
        *@method setTotalPlanContent
        */
        setTotalPlanContent: function () {
            var year = Project_ParamConfig.bzOneMapConfig.year;           //时间
            var city = Project_ParamConfig.bzOneMapConfig.city;           //城市
            var cityProgramming = Project_ParamConfig.bzOneMapConfig.totalProgram.cityProgramming;        //城市总体规划书
            var planningRegion = Project_ParamConfig.bzOneMapConfig.totalProgram.planningRegion;          //规划区域
            var totalArea = parseFloat(this.data.总体规划[0].Values.totalarea / 1000000).toFixed(2);
            var title = '总体规划';
            var summary = year + '年，' + city + '编制完成《' + cityProgramming + '》，规划区为' + planningRegion + '，总面积' + totalArea + '平方公里。';
            $(".total-plan .title").text(title);
            $(".total-plan .summary").html(summary);
        },

        /**
        *插入控制性详细内容
        *@method setRegulatoryPlanContent
        */
        setRegulatoryPlanContent: function () {
            var data = this.data.控制性详细规划;      //控制性详细规划数据信息
            var stageName = [];                       //控制性详细规划的状态名称集
            var total = [];                           //保存当前所有区域的几个阶段的数据值
            var legendData = [];                      //保存每个阶段的总数值
            //插入概述
            var year = Project_ParamConfig.bzOneMapConfig.year;            //时间
            var city = Project_ParamConfig.bzOneMapConfig.city;       //城市
            var totalArea = parseFloat(this.data.控制性详细规划概述1[0].Values.覆盖总面积 / 1000000).toFixed(2);        //覆盖总面积(单位平方公里)
            var finished = parseFloat(this.data.控制性详细规划概述1[0].Values.已编制完成总面积 / 1000000).toFixed(2);        //已编制完成面积
            var working = parseFloat(this.data.控制性详细规划概述1[0].Values.在编总面积 / 1000000).toFixed(2);           //在编面积
            var editing = parseFloat(this.data.控制性详细规划概述1[0].Values.修编总面积 / 1000000).toFixed(2);         //修编面积
            var totalProject = this.data.控制性详细规划概述2[0].Values.控规编制项目总数;      //开展的控规编制项目个数
            var finishedProject = this.data.控制性详细规划概述2[0].Values.已编制完成项目数;    //已编辑完成的项目个数
            var workingProject = this.data.控制性详细规划概述2[0].Values.在编项目数;     //在编的项目个数
            var editingProject = this.data.控制性详细规划概述2[0].Values.修编项目数;     //修编的项目个数
            var pfPoject = this.data.控制性详细规划概述2[0].Values.已批复项目数;     //已批复项目个数

            var title = '控制性详细规划';
            var summary = city + '控制性详细规划编制覆盖' + city + '' + totalArea + '平方公里，其中已编制完成' + finished + '平方公里，在编' + working + '平方公里（包含修编' + editing + '平方公里）。';
            var summary2 = year + '年，' + city + '工开展' + totalProject + '个控规编制项目，其中编制完成' + finishedProject + '个，在编' + workingProject + '个（包含修编' + editingProject + '个），已批复' + pfPoject + '个。';
            $(".regulatory-plan .title").text(title);
            $(".regulatory-plan .summary").html(summary);
            $(".regulatory-plan .summary2").html(summary2);
            //插入表头
            var state = data[0].Values;     //Object类型    {"正在编制": "7","编制完成": "2","已批复": "0"}        
            for (var att in state) {
                stageName.push(att);
            }
            var theadHtml = '</tr>';
            for (var i = 0; i < stageName.length; i++) {
                theadHtml += '<th>' + stageName[i] + '</th>';
            }
            $(".regulatory-plan .region").after(theadHtml);
            //插入表内容
            var trHtml = '';
            if (data.length == 0) {
                var colsNum = stageName.length + 2;
                trHtml = '<tr><td colspan="' + colsNum + '">没有数据!</td></tr>';
                $(".regulatory-plan .table>tbody").html(trHtml);
            }
            else {
                //插入表内容tr
                for (var i = 0; i < data.length; i++) {
                    var tdHtml = '';
                    var totalNum = 0;   //保存每一个区域的项目总数
                    var array = [];     //保存一个区域的几个阶段的数据值和总数
                    for (var att in data[i].Values) {
                        tdHtml += '<td>' + data[i].Values[att] + '</td>';
                        array.push(parseInt(data[i].Values[att]));
                        totalNum += parseInt(data[i].Values[att]);
                    }
                    array.push(totalNum);
                    total.push(array);

                    trHtml += '<tr>'
                                    + '<td>' + data[i].Key + '</td>'
                                    + tdHtml
                                    + '<td>' + totalNum + '</td>'
                                + '</tr>';
                }

                //插入合计tr
                var tdHtml2 = '';
                for (var i = 0; i < stageName.length+1; i++) {
                    var sum = 0;
                    for (var j = 0; j < total.length; j++) {
                        sum += total[j][i];
                    }
                    tdHtml2 += '<td>' + sum + '</td>';
                    if(i<stageName.length)
                        legendData.push(sum);
                }
                trHtml += '<tr>'
                                    + '<td>总计</td>'
                                    + tdHtml2
                                + '</tr>';
                $(".regulatory-plan .table>tbody").append(trHtml);

                //插入饼状图
                //this.setPieOptions(data, stageName, legendData);
                //this.setCompilePie();
                var barOptin = this._setBarOptions(stageName, legendData);
                this._setBar(barOptin);
            }
        },


        /**
        *设置饼状图配置参数
        *@method setPieOptions
        *@param data {Object}       数据信息
        *@param stageName {Object}  阶段名称集
        *@param legendData {Object} 每个阶段的总数值
        */
        setPieOptions: function (data, stageName, legendData) {
            this.pieOptions = null;
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
                series: [
                    {
                        type: 'pie',
                        radius: '75%',
                        center: ['30%', '50%'],
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {
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
        *@method setCompilePie
        */
        setCompilePie: function () {
            var chart = echarts.init(document.getElementById('compilePie'));
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
                    borderWidth: 0,
                },
                yAxis: [
                    {
                        type: 'value',
                        show: false,
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
            var chart = echarts.init(document.getElementById('compilePie'));
            chart.setOption(barOption);
        },




        /**
        *跳转到控制性详细规划
        *@method gotoTab
        */
        gotoTab: function (e) {
            var obj = $(e.target);
            var text = obj.text();
            switch (text) {
                case '控制性详细规划':
                    $(".compilemap_tab").find("span:eq(1)").click();
                    break;
                default:
                    break;
            }
        },


        /**
        *切换tab页
        *@method chooseTab
        */
        chooseTab: function (e) {
            var text = $(e.target).text();
            var obj = $(e.target);
            if (obj.hasClass("active") == false) {
                //显示tab
                $(e.target).siblings().removeClass("active").end().addClass("active");
                
                switch (text) {
                    case '整体情况':
                        //显示整体情况栏
                        $(".compilemap_tabContent1").addClass("active").siblings().removeClass("active");
                        //情况高亮图层（即控制性详细规划在地图上的气泡）
                        var _map = L.DCI.App.pool.get("map");
                        _map.getHighLightLayer().clearLayers();
                        this.hideMarks();
                        this.isContent = true;
                        break;
                    case '控制性详细规划':    
                        //显示详情情况栏
                        this.isContent = false;
                        $(".compilemap_tabContent2").addClass("active").siblings().removeClass("active");
                        
                        if (this.regulatoryplan == null)
                        {
                            this.regulatoryplan = new L.DCI.Business.RegulatoryPlan();
                            $(".compilemap_tabContent2").html(this.regulatoryplan.getBody());
                            this.regulatoryplan.load();
                        }
                        this.showMarks();
                        
                        break;
                    default:
                        break;
                }
            }
        },

        /**
        *根据ID查询项目
        *@method queryProjectByIds
        *@param items{Array} 结果数组
        */
        queryProjectByIds: function (items) {
            if (this.regulatoryplan == null) {
                this.isContent = false;
                this.regulatoryplan = new L.DCI.Business.RegulatoryPlan();
                $(".compilemap_tabContent2").html(this.regulatoryplan.getBody());
                this.regulatoryplan.load(false);
            }
            this.regulatoryplan.queryProjectByIds(items);
        },

        /**
        *删除编制经历的现势图层和历史图层
        *@method deleteLayer
        */
        deleteLayer: function () {
            if (this.regulatoryplan == undefined || this.regulatoryplan == null) return;
            this.regulatoryplan.deleteLayer();
        },

        /**
        *隐藏当前高亮对象
        *@method showMarks
        */
        hideMarks: function () {
            if (this.isContent == false)
            {
                if (this.regulatoryplan != null && this.regulatoryplan.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.regulatoryplan.detailDataIndex);
                    //模拟返回点击事件
                    $(".compilemap_tabContent2").find(".turnback").click();
                    //恢复状态信息
                    this.regulatoryplan.detailDataIndex = detailDataIndex;
                    this.regulatoryplan.isDetail = true;
                }
                if (this.regulatoryplan != null && this.regulatoryplan.isDetail == false)
                {
                    var detailDataIndex = parseInt(this.regulatoryplan.detailDataIndex);
                    //恢复状态信息
                    this.regulatoryplan.detailDataIndex = detailDataIndex;
                }
            }
        },

        /**
        *高亮当前高亮对象
        *@method showMarks
        */
        showMarks: function () {
            if (this.isContent == false)
            {
                if (this.regulatoryplan != null)
                {
                    //当模块不处于整体情况tab中时，判断是处理项目列表栏还是项目详情内容栏
                    if (this.regulatoryplan.isDetail == true)
                    {
                        if (this.regulatoryplan.detailDataIndex == -1) return;
                        var ele = $(".regulatoryplan").find("div.percontent")[this.regulatoryplan.detailDataIndex];
                        $(ele).find(".viewDetail").click();
                    }
                    else
                    {
                        if (this.regulatoryplan.detailDataIndex == -1) return;
                        var ele = $(".regulatoryplan").find("div.percontent")[this.regulatoryplan.detailDataIndex];
                        $(ele).click();
                    }
                }
            }
            
            
        }
    });
    return L.DCI.Business.CompileMap;
});


