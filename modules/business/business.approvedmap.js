/**
*批后一张图（整体情况）类
*@module modules.business
*@class DCI.Business.ApprovedMap
*@constructor initialize
*/
define("business/approvedmap", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "library/echarts",
    "business/approvedtracking",
    "business/approvedmapillegalproject"
], function (L) {

    L.DCI.Business.ApprovedMap = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "business-approvedmap",

        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: null,

        /**
        *服务数据
        *@property data
        *@type {Object}
        *@private
        */
        data: null,

        /**
        *批后一张图的批后跟踪类
        *@property approvedMapTracking
        *@type {Object}
        *@private
        */
        approvedMapTracking: null,

        /**
        *批后一张图的违规项目类
        *@property approvedMapIllegal
        *@type {Object}
        *@private
        */
        approvedMapIllegal: null,

        /**
        *tab页索引（0为整体情况，1为批后跟踪情况，2为违规项目情况）
        *@property tabIndex
        *@type {Number}
        *@private
        */
        tabIndex: 0,

        /**
        *饼状图配置
        *@property _pieOptions
        *@type {Object}
        *@private
        */
        _pieOptions: null,

        /**
        *图表用到的颜色集
        *@property chartColors
        *@type {Array}
        *@private
        */
        chartColors: ['#ff6464', '#ff9664', '#ffcd64', '#e6f03c', '#5af0a0', '#5af0e6', '#78c8f0', '#7882f0', '#b478f0', '#f078dc'],

        /**
        *html模板
        *@property temp
        *@type {String}
        *@private
        */
        tempHtml: '<div class="approvedmap_tab">'
                    + '<span class="active">整体情况</span><span>批后跟踪情况</span><span>违规项目情况</span>'
                 + '</div>'
                 + '<div class="approvedmap_tabContent">'
                    + '<div class="approvedmap_tabContent1 tabContent active">'
                        + '<div class="approved-track">'
                            + '<span class="title"></span>'
                            + '<div class="summary approved-track-content"></div>'
                            + '<table class="table table-bordered">'
                                + '<thead><tr><th class="region">行政区域</th><th>联络人</th></thead>'
                                + '<tbody></tbody>'
                            + '</table>'
                    + '<div id="approvedPie" class="approvedPie"></div>'
                        + '</div>'
                        + '<div class="violate-project">'
                            + '<span class="title"></span>'
                            + '<div class="summary approved-track-content"></div>'
                            + '<table class="table table-bordered">'
                                + '<thead><tr><th class="region">行政区域</th><th>负责人</th></tr></thead>'
                                + '<tbody></tbody>'
                            + '</table>'
                            + '<div id="violatePie" class="violatePie"></div>'
                        + '</div>'
                    + '</div>'
                    + '<div class="approvedmap_tabContent2 tabContent"></div>'
                    + '<div class="approvedmap_tabContent3 tabContent"></div>'
                 + '</div>',

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._clsName = Project_ParamConfig.phOneMapConfig.name;
            this._container = L.DomUtil.create("div", 'approvedmap', null);
            $(this._container).html(this.tempHtml);
            this.getData();     //获取整体情况数据 
            this.showTo();
            $('.approvedmap_tabContent1').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            //tab页切换事件
            $(".approvedmap_tab").on('click', 'span', { context: this }, function (e) { e.data.context.chooseTab(e); });
            $(".approvedmap_tabContent1").on('click', 'span.title', { context: this }, function (e) { e.data.context.gotoTab(e); });
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

            //读取缓存结果
            var id = this.id//缓存Key 类ID+名称
            L.dci.app.services.baseService.getCache({
                context: this,
                key: id,
                success: function (res) {
                    if (res == null) {
                        this._executeAnalyze();
                    } else {
                        this.data = JSON.parse(res);
                        this.insertContent();
                    }
                }
            });           
           
        },

        _executeAnalyze: function () {
            var year = Project_ParamConfig.phOneMapConfig.year;//时间
            L.dci.app.services.businessService.getApprovedMapData({
                year: year,
                context: this,
                success: function (res) {
                    this.data = res;
                    this.insertContent();

                    var id = this.id;//缓存Key 类ID+名称
                    //缓存结果
                    L.dci.app.services.baseService.addCache({
                        context: this,
                        key: id,
                        value: JSON.stringify(this.data)
                    });

                }
            });
        },


        /**
        *插入整体情况内容
        *@method insertContent
        */
        insertContent: function () {
            this.setApprovedContent();
            this.setViolateContent();
            //表格隔行着色
            $(".approved-track tbody tr:odd").addClass("trhighlight");
            $(".violate-project tbody tr:odd").addClass("trhighlight");
        },

        /**
        *插入批后跟踪情况内容
        *@method setApprovedContent
        */
        setApprovedContent: function () {
            var stageName = [];                         //保存批后跟踪的阶段名称集
            var legendData = [];                        //保存批后跟踪每个阶段的总数值
            var data = this.data.管理单元信息统计;      //批后跟踪数据信息
            var total = [];                             //保存当前所有区域的几个阶段的数据值
            //插入表头
            var stage = data[0].Values;     //Object类型    {"放验线": "31","标准层": "14","正负零": "74","竣工验收": "80"}        
            for (var att in stage) {
                stageName.push(att);
            }
            var theadHtml = '</tr>';
            for (var i = 0; i < stageName.length; i++) {
                theadHtml += '<th>' + stageName[i] + '</th>';
            }
            $(".approved-track .region").after(theadHtml);


            //插入表内容
            var trHtml = '';
            if (data.length == 0) {//当结果为空时
                var colsNum = stageName.length + 2;
                trHtml = '<tr><td colspan="' + colsNum + '">没有数据!</td></tr>';
                $(".approved-track .table>tbody").html(trHtml);
            }
            else {
                //插入表内容tr
                for (var i = 0; i < data.length; i++) {
                    var tdHtml = '';
                    var array = [];         //保存一个区域的几个阶段的数据值
                    var person = '';        //负责人
                    for (var att in data[i].Values) {
                        tdHtml += '<td>' + data[i].Values[att] + '</td>';
                        array.push(parseInt(data[i].Values[att]));
                    }
                    total.push(array);    //保存所有区域的几个阶段的数据值
                    var trHtml = '<tr>'
                                    + '<td>' + data[i].Key + '</td>'
                                    + tdHtml
                                    + '<td>' + person + '</td>'
                                + '</tr>';
                    $(".approved-track .table>tbody").append(trHtml);
                }
                //插入合计tr
                var tdHtml = '';
                for (var i = 0; i < stageName.length; i++) {
                    var sum = 0;
                    for (var j = 0; j < total.length; j++) {
                        sum += total[j][i];
                    }
                    tdHtml += '<td>' + sum + '</td>';
                    legendData.push(sum);       //保存各阶段总数
                }
                var trHtml = '<tr>'
                                    + '<td>总计</td>'
                                    + tdHtml
                                    + '<td></td>'
                                + '</tr>';
                $(".approved-track .table>tbody").append(trHtml);
            }
            //插入概述
            var year = Project_ParamConfig.phOneMapConfig.year;           //时间
            var city = Project_ParamConfig.phOneMapConfig.city;           //城市
            var finishedProject = Project_ParamConfig.phOneMapConfig.projCount;//发放工程证项目数
            var workingProject = 0;
            for (var i = 0; i < legendData.length; i++) {
                workingProject += legendData[i];
            }
            var title = '批后跟踪情况';
            var summary = year + '年，' + city + '已完成' + finishedProject + '个工程证业务审批，现共有' + workingProject + '个项目处于批后监察阶段。';
            $(".approved-track .title").text(title);
            $(".approved-track .summary").html(summary);
            //插入饼状图
            //this.setPieOptions(data, stageName, legendData);
            //this.setApprovedPie();

            var barOption = this._setBarOptions(stageName, legendData);
            this._setApprovedBar(barOption);
        },

        /**
        *插入违规项目情况内容
        *@method setViolateContent
        */
        setViolateContent: function () {
            var stageName = [];                         //保存违规项目的阶段名称集
            var legendData = [];                        //保存违规项目每个阶段的总数值
            var data = this.data.违规信息统计;          //违规项目数据信息
            var total = [];                             //保存当前所有区域的几个阶段的数据值
            var violateCount = 0;                       //统计总违规项目数
            //插入表头
            var stage = data[0].Values;     //Object类型    {"放验线": "31","标准层": "14","正负零": "74","竣工验收": "80"}        
            for (var att in stage) {
                stageName.push(att);
            }
            var theadHtml = '</tr>';
            for (var i = 0; i < stageName.length; i++) {
                theadHtml += '<th>' + stageName[i] + '</th>';
            }
            $(".violate-project .region").after(theadHtml);
            //插入表内容
            var trHtml = '';
            if (data.length == 0) {
                var colsNum = stageName.length + 2;
                trHtml = '<tr><td colspan="' + colsNum + '">没有数据!</td></tr>';
                $(".violate-project .table>tbody").html(trHtml);
            }
            else {
                //插入表内容tr
                for (var i = 0; i < data.length; i++) {
                    var tdHtml = '';
                    var array = [];         //保存一个区域的几个阶段的数据值
                    var person = '';        //负责人
                    for (var att in data[i].Values) {
                        tdHtml += '<td>' + data[i].Values[att] + '</td>';
                        array.push(parseInt(data[i].Values[att]));
                    }

                    total.push(array);      //保存所有区域的几个阶段的数据值
                    trHtml += '<tr>'
                                    + '<td>' + data[i].Key + '</td>'
                                    + tdHtml
                                    + '<td>' + person + '</td>'
                                + '</tr>';
                }
                //插入合计tr
                var tdHtml2 = '';
                for (var i = 0; i < stageName.length; i++) {
                    var sum = 0;
                    for (var j = 0; j < total.length; j++) {
                        sum += total[j][i];
                    }
                    tdHtml2 += '<td>' + sum + '</td>';
                    legendData.push(sum);
                    violateCount += sum;
                }
                trHtml += '<tr>'
                                    + '<td>总计</td>'
                                    + tdHtml2
                                    + '<td></td>'
                                + '</tr>';
                $(".violate-project .table>tbody").append(trHtml);
            }


            //插入概述
            var city = Project_ParamConfig.phOneMapConfig.city;
            var year = Project_ParamConfig.phOneMapConfig.year;

            var title = '违规项目情况';
            var summary = year + '年，' + city + '共认定违规项目' + violateCount + '例。';
            $(".violate-project .title").text(title);
            $(".violate-project .summary").html(summary);
            //插入饼状图
            //this.setPieOptions(data, stageName, legendData);
            //this.setViolatePie();
            var barOption = this._setBarOptions(stageName, legendData);
            this._setViolateBar(barOption);
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
        *填充批后跟踪情况的饼状图
        *@method setApprovedPie
        */
        setApprovedPie: function () {
            var chart = echarts.init(document.getElementById('approvedPie'));
            chart.setOption(this.pieOptions);
        },

        /**
        *填充违规项目情况的饼状图
        *@method setViolatePie
        */
        setViolatePie: function () {
            var chart = echarts.init(document.getElementById('violatePie'));
            chart.setOption(this.pieOptions);
        },

        /**
        *设置批后跟踪情况的柱状图配置参数
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
        *填充批后跟踪情况的柱状图
        *@method _setBar
        */
        _setApprovedBar: function (barOption) {
            var chart = echarts.init(document.getElementById('approvedPie'));
            chart.setOption(barOption);
        },

        /**
        *填充违规项目情况的柱状图
        *@method _setBar
        */
        _setViolateBar: function (barOption) {
            var chart = echarts.init(document.getElementById('violatePie'));
            chart.setOption(barOption);
        },




        /**
        *跳转到批后跟踪情况或违规项目情况
        *@method gotoTab
        */
        gotoTab: function (e) {
            var obj = $(e.target);
            var text = obj.text();
            switch (text) {
                case '批后跟踪情况':
                    $(".approvedmap_tab").find("span:eq(1)").click();
                    break;
                case '违规项目情况':
                    $(".approvedmap_tab").find("span:eq(2)").click();
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
                        this.hideMarks();
                        this.tabIndex = 0;                  
                        //显示整体情况栏
                        $(".approvedmap_tabContent1").addClass("active").siblings().removeClass("active");
                        //清空高亮图层
                        var _map = L.DCI.App.pool.get("map");
                        _map.getHighLightLayer().clearLayers();
                        break;
                    case '批后跟踪情况':
                        this.tabIndex = 1;
                        //显示批后跟踪情况栏
                        $(".approvedmap_tabContent2").addClass("active").siblings().removeClass("active");
                        //加载内容
                        if (this.approvedMapTracking == null) {
                            this.approvedMapTracking = new L.DCI.Business.ApprovedTracking();
                            $(".approvedmap_tabContent2").html(this.approvedMapTracking.getBody());
                            this.approvedMapTracking.load();
                        }
                        var _map = L.DCI.App.pool.get("map");
                        _map.getHighLightLayer().clearLayers();
                        this.showMarks();
                        break;
                    case '违规项目情况':
                        this.tabIndex = 2;
                        //显示违规项目情况栏
                        $(".approvedmap_tabContent3").addClass("active").siblings().removeClass("active");
                        //加载内容
                        if (this.approvedMapIllegal == null) {
                            this.approvedMapIllegal = new L.DCI.Business.Illegalproject();
                            $(".approvedmap_tabContent3").html(this.approvedMapIllegal.getBody());
                            this.approvedMapIllegal.load();
                        }
                        var _map = L.DCI.App.pool.get("map");
                        _map.getHighLightLayer().clearLayers();
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
            if (this.approvedMapTracking == null) {
                this.approvedMapTracking = new L.DCI.Business.ApprovedTracking();
                this.approvedMapTracking.isDetail = true;
                $(".approvedmap_tabContent2").html(this.approvedMapTracking.getBody());
                this.approvedMapTracking.load(false);
            }
            this.approvedMapTracking.queryByIds(items);
        },

        /**
        *隐藏当前高亮对象
        *@method showMarks
        */
        hideMarks: function () {
            if (this.tabIndex == 1 && this.approvedMapTracking != null)
            {
                if (this.approvedMapTracking.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.approvedMapTracking.detailDataIndex);
                    //模拟返回点击事件
                    $(".approvedmap_tabContent2").find(".turnback").click();
                    //恢复状态信息
                    this.approvedMapTracking.detailDataIndex = detailDataIndex;
                    this.approvedMapTracking.isDetail = true;
                }
                else
                {
                    var detailDataIndex = parseInt(this.approvedMapTracking.detailDataIndex);
                    //恢复状态信息
                    this.approvedMapTracking.detailDataIndex = detailDataIndex;
                }
            }

            if (this.tabIndex == 2 && this.approvedMapIllegal != null)
            {
                if (this.approvedMapIllegal.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.approvedMapIllegal.detailDataIndex);
                    //模拟返回点击事件
                    $(".approvedmap_tabContent3").find(".turnback").click();
                    //恢复状态信息
                    this.approvedMapIllegal.detailDataIndex = detailDataIndex;
                    this.approvedMapIllegal.isDetail = true;
                }
                else
                {
                    var detailDataIndex = parseInt(this.approvedMapIllegal.detailDataIndex);
                    //恢复状态信息
                    this.approvedMapIllegal.detailDataIndex = detailDataIndex;
                }
            }
        },

        /**
        *高亮当前高亮对象
        *@method showMarks
        */
        showMarks: function () {
            if (this.tabIndex == 1 && this.approvedMapTracking != null)
            {
                //当模块处于批后跟踪情况时，判断是处理项目列表栏还是项目详情内容栏
                if (this.approvedMapTracking.isDetail == true)
                {
                    if (this.approvedMapTracking.detailDataIndex == -1) return;
                    var ele = $(".approvedtracking").find("div.percontent")[this.approvedMapTracking.detailDataIndex];
                    $(ele).find(".viewDetail").click();
                }
                else
                {
                    if (this.approvedMapTracking.detailDataIndex == -1) return;
                    var ele = $(".approvedtracking").find("div.percontent")[this.approvedMapTracking.detailDataIndex];
                    $(ele).click();
                }
            }

            if (this.tabIndex == 2 && this.approvedMapIllegal != null)
            {
                //当模块处于违规项目情况时，判断是处理项目列表栏还是项目详情内容栏
                if (this.approvedMapIllegal.isDetail == true)
                {
                    if (this.approvedMapIllegal.detailDataIndex == -1) return;
                    var ele = $(".illegalproject").find("div.percontent")[this.approvedMapIllegal.detailDataIndex];
                    $(ele).find(".viewDetail").click();
                }
                else
                {
                    if (this.approvedMapIllegal.detailDataIndex == -1) return;
                    var ele = $(".illegalproject").find("div.percontent")[this.approvedMapIllegal.detailDataIndex];
                    $(ele).click();
                }
            }
        }


    });
    return L.DCI.Business.ApprovedMap;
});
