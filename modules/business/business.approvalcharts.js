/**
*用地审批分析类
*@module modules.business
*@class DCI.Business.ApprovalCharts
*@constructor initialize
*@extends DCI.Layout
*/
define("business/approvalcharts", [
    "leaflet",
    "core/dcins",
    "layout/base",
    "data/ajax",
    "library/echarts",
    "plugins/scrollbar"
], function (L) {
    L.DCI.Business.ApprovalCharts = L.DCI.Layout.extend({
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

        id:"ApprovalCharts",

        /**
        *统计图X轴数据类，0为用地类型，1为行政区
        *@property xAxisParameters
        *@type {Object}
        */
        xAxisParameters: {
            land: 0,
            admin: 1
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
        *html模板
        *@property htmlTemplete
        *@type {Object}
        */
        htmlTemplete:
                    '<div class="acharts">'
                       + '<div class="acharts-yselector-container">'
                            + '<span class="acharts-yselector-switch icon-arrows"></span>'
                            + '<div class="acharts-yselector-axis"></div>'
                            + '<span class="acharts-yselector-switch icon-arrows-right"></span>'
                        + '</div>'
                        + '<table class="acharts-tselector-table">'
                          + '<tr>'
                                + '<td colspan="6" mode="1" value="1" class="margin">上半年</td>'
                                + '<td colspan="6" mode="1" value="2" class="margin">下半年</td>'
                            + '</tr>'
                          + '<tr>'
                                + '<td colspan="3" mode="2" value="1" class=" margin">第一季度</td>'
                                + '<td colspan="3" mode="2" value="2" class="margin">第二季度</td>'
                                + '<td colspan="3" mode="2" value="3" class="margin">第三季度</td>'
                                + '<td colspan="3" mode="2" value="4" class="margin">第四季度</td>'
                            + '</tr>'
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
                        + '</table>'
                        + '<div class="acharts-cswitch-container">'
                            + '<input type="button" mode="0" value="按照用地类型" class="acharts-cswitch-switch selected" />'
                            + '<input type="button" mode="1" value="按照行政区划" class="acharts-cswitch-switch" />'
                        + '</div>'
                        + '<div class="acharts-charts-container">'
                            + '<div class="acharts-charts-tcontainer">'
                                + '<span class="acharts-charts-tool icon-Viewform mode" title="显示数据表"></span>'
                                //+ '<span class="acharts-charts-tool icon-exportform" id="acharts-export" title="导出数据"></span>'
                           + '</div>'
                            + '<div id="business-approval-charts-bar"></div>'
                            + '<div id="business-approval-charts-pie"></div>'
                            + '<table class="acharts-charts-table hidden" id="acharts-charts-table">'
                                + '<thead></thead>'
                                + '<tbody></tbody>'
                           + '</table>'
                        + '</div>'
                        //+ '<span class="acharts-close icon-close1" />'
                    + '</div>',

        /**
        *年份选择器中年份块html模板
        *@property yearSelectorHtml
        *@type {Object}
        */
        yearSelectorHtml:
                         '<div class="acharts-yselector-block">'
                            + '<span class="acharts-yselector-year"></span>'
                            + '<span class="acharts-yselector-pin"></span>'
                        + '</div>',
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            numCount: 10,/*年份选择轴上显示多少个年份*/
            minNum: 0,/*最小年份*/
            maxNum: 100,/*最大年份*/
            areaMmultiple: 0.000001/*面积倍数，服务返回数据为平方米，在界面上要显示为平方千米*/
        },

        /**
        *初始化
        *@method initialize
        *@param options {Object} 配置参数
        */
        initialize: function (options) {

            L.setOptions(this, options);
            this._dciAjax = new L.DCI.Ajax();
            var date = new Date();
            /*设定年份选择器的范围为当前年份到2000年*/
            var lastYear = date.getFullYear();
            this.options.maxNum = lastYear;
            this.options.minNum = 2000;
        },

        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {

            L.dci.app.pool.remove('ApprovalCharts');
        },

        /**
        *将内容添加到界面上
        *@method addTo
        *@param selector {Object} 父级容器的过滤条件，如 '#div-id'、.'div-class'
        */
        addTo: function (selector) {
            this._parent = $(selector)[0];
            if (this._parent != null) {
                var $parent = $(this._parent);
                if ($parent.find('.leftcontentpanel-body').length > 0)
                    $parent.find('.leftcontentpanel-body').remove();
                this._createUi();
                this._parent.appendChild(this._container);
                this._initCharts();
            }

        },

        /**
        *显示内容
        *@method show
        */
        show: function () {
            this._parent = $('body')[0];
            var $parent = $(this._parent);
            if ($parent.find('.acharts').length > 0)
                $parent.find('.acharts').remove();
            this._createUi();

            //this._parent.appendChild(this._container);
            this._initCharts();
            this.requestData();
        },

        /**
        *请求统计图数据
        *@method requestData
        */
        requestData: function () {
            var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/static/landuse/";
            if (this.parameters.xAxisMode == this.xAxisParameters.admin) {
                url = url
                    + "region/" + this.parameters.year
                    + "/" + this.parameters.timeMode
                    + "/" + this.parameters.timeVlaue;
            } else {
                url = url
                    + "type/" + this.parameters.year
                    + "/" + this.parameters.timeMode
                    + "/" + this.parameters.timeVlaue;
            }
            this._dciAjax.get(url, null, true, this, this.fillCharts, function () {
                L.dci.app.util.dialog.error("温馨提示", "获取统计图数据发生错误");
            });
        },

        /**
        *插入数据表
        *@method _createDataTable
        *@param data {Object}  获取到的统计图数据
        */
        _createDataTable: function (data) {
            var $head = $(this._container).find('.acharts-charts-table thead');
            var $body = $(this._container).find('.acharts-charts-table tbody');
            var headHtml = '<tr><td>名称</td>';
            var bodyHtml = '';
            for (var i = 0; i < data.length; i++)
                headHtml = headHtml + '<td>' + data[i].name + '</td>';
            headHtml = headHtml + "</tr>";

            var set_0 = data[0].data;
            var set_1 = data[1].data;
            var set_2 = data[2].data;

            for (var i = 0; i < set_0.length; i++) {
                var name = '', v0 = '', v1 = '', v2 = '', v3 = '';
                name = set_0[i].name;

                if (data[0].name != '业务量')
                    v0 = set_0[i].value = set_0[i].value * this.options.areaMmultiple;
                else
                    v0 = set_0[i].value;

                if (set_1[i].name == name) {
                    if (data[1].name != '业务量')
                        v1 = set_1[i].value = set_1[i].value * this.options.areaMmultiple;
                    else
                        v1 = set_1[i].value;
                } else {
                    for (var j; j < set_1.length; j++) {
                        if (set_1[j].name == name) {
                            if (data[1].name != '业务量')
                                v1 = set_1[j].value = set_1[j].value * this.options.areaMmultiple;
                            else
                                v1 = set_1[j].value;
                            break;
                        }
                    }
                }

                if (set_2[i].name == name) {
                    if (data[2].name != '业务量')
                        v2 = set_2[i].value = set_2[i].value * this.options.areaMmultiple;
                    else
                        v2 = set_2[i].value;
                } else {
                    for (var j; j < set_2.length; j++) {
                        if (set_2[j].name == name) {
                            if (data[2].name != '业务量')
                                v2 = set_2[j].value = set_2[j].value * this.options.areaMmultiple;
                            else
                                v2 = set_2[j].value;

                            break;
                        }
                    }
                }
                bodyHtml = bodyHtml + '<tr><td>' + name + '</td><td>' + v0 + '</td><td>' + v1 + '</td><td>' + v2 + '</td></tr>';
            }
            $head.html(headHtml);
            $body.html(bodyHtml);
        },

        /**
       *填充图表
       *@method fillCharts
       *@param data {Object}  获取到的统计图数据
       */
        fillCharts: function (data) {
            if (data != null) {
                if (data instanceof Array) {
                    var chartTitle = this._stitchTitle();
                    var pieSeries = [];
                    var barSeries = [];
                    var legend = [];
                    this._createDataTable(data);
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if (item.name == '用地面积') {
                            barSeries[0] = item;
                            for (var j = 0; j < item.data.length; j++) {
                                var obj = item.data[j];
                                legend[j] = obj.name;
                            }
                        } else if (item.name == '建筑面积') {
                            barSeries[1] = item;
                        } else if (item.name == '业务量') {
                            pieSeries[0] = item;
                        }
                    }

                    this._pieOptionTemplete.title.text = chartTitle + '业务量统计';
                    this._pieOptionTemplete.series = pieSeries;
                    var pieItemStyle = {
                        normal: {
                            label: {
                                formatter: "{a}{b} : {c}({d}%)"
                            }
                        }
                    };
                    for (var p = 0; p < this._pieOptionTemplete.series.length; p++) {
                        this._pieOptionTemplete.series[p].type = 'pie';
                        this._pieOptionTemplete.series[p].radius = '40%';
                        this._pieOptionTemplete.series[p].center = ['50%', '50%'];

                        this._pieOptionTemplete.series[p].itemStyle = pieItemStyle;
                    }

                    this._barOptionTemplete.title.text = chartTitle + '用地分类统计';
                    this._barOptionTemplete.legend.data = ['用地面积', '建筑面积'];
                    this._barOptionTemplete.xAxis[0].data = legend;
                    this._barOptionTemplete.series = barSeries;
                    for (var b = 0; b < this._barOptionTemplete.series.length; b++) {
                        this._barOptionTemplete.series[b].type = 'bar';
                        this._barOptionTemplete.series[b].clickable = false;
                    }

                    this._initCharts();
                    this._charts_pie.setOption(this._pieOptionTemplete, true);
                    this._charts_bar.setOption(this._barOptionTemplete, true);

                    $('.acharts').mCustomScrollbar({ theme: 'minimal-dark' });
                    return;
                } else {
                    if (data.error != null) {
                        L.dci.app.util.dialog.error("温馨提示", "获取统计图数据失败");
                        return;
                    }
                }
                L.dci.app.util.dialog.error('温馨提示', '获取统计图数据失败');
            }
        },

        /**
        *初始化柱图与饼图，给柱图绑定点击处理事件
        *@method _initCharts
        */
        _initCharts: function () {
            this._charts_bar = echarts.init(document.getElementById('business-approval-charts-bar'));
            this._charts_pie = echarts.init(document.getElementById('business-approval-charts-pie'));
            var context = this;
            this._charts_bar.on("click", function (param) {
                var name = param.name;
                var selector = '.acharts-cswitch-switch[value='
                context.parameters.landUse = '';
                context.parameters.region = '';

                if (context.parameters.xAxisMode == context.xAxisParameters.admin) {
                    context.parameters.xAxisMode = context.xAxisParameters.land;
                    context.parameters.region = name;
                    context.parameters.landUse = '';
                } else {
                    context.parameters.xAxisMode = context.xAxisParameters.admin;
                    context.parameters.landUse = name;
                    context.parameters.region = '';
                }

                $(context._container).find('.acharts-cswitch-switch.selected').removeClass('.selected');
                selector = selector + context.parameters.xAxisMode + ']';
                $(context._container).find(selector).addClass('selected');
                context.requestData();
            });
        },

        /**
        *创建主视图内容
        *@method _createUi
        *@return {Object} this._container对象
        */
        _createUi: function () {         


            L.DCI.App.pool.get('LeftContentPanel').show(this,function () { });
            $(".leftcontentpanel-title>span:first").html("用地审批分析");         //标题
            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.htmlTemplete);

            this._container = this.dom[0];
            var $container = $(this._container);

            this._initYearSelector(this.dom[0]);
            var preYear = $container.find('.icon-arrows')[0];
            var nextYear = $container.find('.icon-arrows-right')[0];
            L.DomEvent.on(nextYear, 'click', this._nextYearClick, this);
            L.DomEvent.on(preYear, 'click', this._preYearClick, this);

            var tds = $container.find('td');
            for (var t = 0; t < tds.length; t++) {
                L.DomEvent.on(tds[t], 'click', this._timeModeClick, this);
            }

            var chartSwitchs = $container.find('.acharts-cswitch-switch');
            this.parameters.xAxisMode = $(chartSwitchs[0]).attr('mode');
            for (var s = 0; s < chartSwitchs.length; s++) {
                L.DomEvent.on(chartSwitchs[s], 'click', this._chartSwitchClick, this);
            }

            //var closeButton = $container.find('.acharts-close');
            //L.DomEvent.on(closeButton[0], 'click', this._closeClick, this);

            var tableButton = $container.find('.icon-Viewform');
            //var exportButton = $container.find('.icon-exportform');
            L.DomEvent.on(tableButton[0], 'click', this._tableClick, this);
            //L.DomEvent.on(exportButton[0], 'click', this.exportClick, this);
            return this._container;
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
        },

        /**
        *创建时间轴
        *@method _createYearBlocks
        *@param start {String}     时间轴开始年份
        *@param end {String}       时间轴结束年份
        *@param current {String}   当前显示年份
        */
        _createYearBlocks: function (start, end, current) {
            var $yearAxis = $(this._container).find('.acharts-yselector-axis');
            $yearAxis.children().remove();
            for (var i = start; i <= end; i++) {
                var $yearBlock = $(this.yearSelectorHtml);
                var $year = $yearBlock.find('.acharts-yselector-year');
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
            var year = e.target.innerHTML;
            this.parameters.year = year;
            this.parameters.timeMode = this.timeParameters.year;
            this.parameters.timeVlaue = '0';

            $(this._container).find('td.selected').removeClass('selected');
            /*年份数据被修改,修改UI上的当前年份*/
            $(this._container).find('.acharts-yselector-year.selected').removeClass('selected');
            $(e.target).addClass('selected');

            this.requestData();
        },

        /**
        *上一年点击事件
        *@method _preYearClick
        */
        _preYearClick: function () {
            if (this.parameters.year > this.options.minNum) {
                this.parameters.year = this.parameters.year - 1.0;
                this.parameters.timeMode = this.timeParameters.year;
                this.parameters.timeVlaue = '0';

                $(this._container).find('td.selected').removeClass('selected');
                $(this._container).find('.acharts-yselector-year.selected').removeClass('selected');
                var selector = ".acharts-yselector-year[value=" + this.parameters.year + "]";
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
                this.requestData();
            }
        },

        /**
        *下一年点击事件
        *@method _preYearClick
        */
        _nextYearClick: function () {
            if (this.parameters.year < this.options.maxNum) {
                this.parameters.year = parseInt(this.parameters.year) + 1;
                this.parameters.timeMode = this.timeParameters.year;
                this.parameters.timeVlaue = '0';

                $(this._container).find('td.selected').removeClass('selected');
                $(this._container).find('.acharts-yselector-year.selected').removeClass('selected');
                var selector = ".acharts-yselector-year[value=" + this.parameters.year + "]";
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

                this.requestData();
            }
        },

        /**
        *时间模式点击事件
        *@method _timeModeClick
        */
        _timeModeClick: function (e) {
            var timeMode = $(e.target).attr('mode');
            var timeValue = $(e.target).attr('value');

            /*时间发行变化*/
            $(this._container).find('td.selected').removeClass('selected');
            $(e.target).addClass('selected');

            this.parameters.timeMode = timeMode;
            this.parameters.timeVlaue = timeValue;
            this.requestData();
        },

        /**
        *时间范围点击事件，年、季度、月份被点击后调用
        *@method _chartSwitchClick
        */
        _chartSwitchClick: function (e) {
            this.parameters.landUse = '0';
            this.parameters.region = '0';
            var $switch = $(e.target);
            var mode = $switch.attr('mode');
            $('.acharts-cswitch-switch.selected').removeClass('selected');
            $switch.addClass('selected');
            this.parameters.xAxisMode = mode;
            this.requestData();
        },

        /**
        *关闭
        *@method _tableClick
        */
        _tableClick: function (e) {
            this._switchViewMode(e.target);

        },

        /**
        *导出事件
        *@method exportClick
        */
        exportClick: function () {
        },

        /**
        *构造图表标题
        *@method _stitchTitle
        *@return {String} 返回图表标题内容，如2011年第一季度0审批
        */
        _stitchTitle: function () {
            var subject = '';
            var year = this.parameters.year + "年";
            var mtime = '';

            if (this.parameters.xAxisMode == this.xAxisParameters.admin) {
                subject = this.parameters.landUse;
            } else if (this.parameters.xAxisMode == this.xAxisParameters.land) {
                subject = this.parameters.region;
            }

            if (this.parameters.timeMode == this.timeParameters.hyear) {
                switch (this.parameters.timeVlaue) {
                    case "1":
                        mtime = '上半年';
                        break;
                    case "2":
                        mtime = '下半年';
                        break;
                }
            } else if (this.parameters.timeMode == this.timeParameters.quarter) {
                switch (this.parameters.timeVlaue) {
                    case "1":
                        mtime = '第一季度';
                        break;
                    case "2":
                        mtime = '第二季度';
                        break;
                    case "3":
                        mtime = '第三季度';
                        break;
                    case "4":
                        mtime = '第四季度';
                        break;
                }
            } else if (this.parameters.timeMode == this.timeParameters.month) {
                if (this.parameters.timeVlaue == '0') {
                    mtime = '';
                }else{
                    mtime = this.parameters.timeVlaue + '月';
                }
               
            }
            if (subject == '0') subject = '';
            return year + mtime + subject + '审批';
        },

        /**
        *选择视图模式（图表或表格）
        *@method exportClick
        *@param element {Object} 事件元素
        */
        _switchViewMode: function (element) {
            if ($('#business-approval-charts-bar').hasClass('hidden')) {
                $('#business-approval-charts-bar').removeClass('hidden');
                $('#business-approval-charts-pie').removeClass('hidden');
                $('.acharts-charts-tool.mode').removeClass('icon-business-analysis');
                $('.acharts-charts-table').addClass('hidden');
                $('.acharts-charts-tool.mode').addClass('icon-Viewform');

                this._charts_pie.resize();
                this._charts_bar.resize();
                element.title = '显示数据表';
            } else {
                $('.acharts-charts-table').removeClass('hidden');
                $('.acharts-charts-tool.mode').removeClass('icon-Viewform');
                $('#business-approval-charts-bar').addClass('hidden');
                $('#business-approval-charts-pie').addClass('hidden');
                $('.acharts-charts-tool.mode').addClass('icon-business-analysis');

                element.title = '显示统计图';
            }
        },

        /**
        *导出表格
        *@method _exportTable
        */
        _exportTable: function () {
            var curTbl = $(this._container).find('.acharts-charts-table')[0];
            var oXL = new ActiveXObject("Excel.Application");
            //创建AX对象excel 
            var oWB = oXL.Workbooks.Add();
            //获取workbook对象 
            var xlsheet = oWB.Worksheets(1);
            //激活当前sheet 
            var sel = document.body.createTextRange();
            sel.moveToElementText(curTbl);
            //把表格中的内容移到TextRange中 
            sel.select();
            //全选TextRange中内容 
            sel.execCommand("Copy");
            //复制TextRange中内容  
            xlsheet.Paste();
            //粘贴到活动的EXCEL中       
            oXL.Visible = true;
            //设置excel可见属性

            var company = document.getElementById("DropDownList_fac").value;
            if (company == "Baidu") {
                company = "百度";
            }
            else if (company == "Google") {
                company = "谷歌";
            }
            else {
                company = "晴琦专属";
            }

            try {
                var fname = oXL.Application.GetSaveAsFilename(company + "将Table导出到Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
            } catch (e) {
                print("Nested catch caught " + e);
            } finally {
                oWB.SaveAs(fname);

                oWB.Close(savechanges = false);
                //xls.visible = false;
                oXL.Quit();
                oXL = null;
                //结束excel进程，退出完成
                //window.setInterval("Cleanup();",1);
                //idTmr = window.setInterval("Cleanup();", 1);

            }
        },

        /**
        *饼状图配置
        *@property _pieOptionTemplete
        *@type {Object}
        */
        _pieOptionTemplete: {
            title: {
                text: ''
            },

            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },

            toolbox: {
                show: false,
                feature: {
                    dataView: { show: true, readOnly: false },
                    saveAsImage: { show: true }
                }
            },

            calculable: true,
            series: null
        },

        /**
        *柱状图配置
        *@property _barOptionTemplete
        *@type {Object}
        */
        _barOptionTemplete: {
            title: {
                text: ''
            },

            tooltip: {
                trigger: 'axis'
            },

            toolbox: {
                show: false,
                feature: {
                    dataView: { show: true, readOnly: false },
                    saveAsImage: { show: true }
                }
            },

            grid: { borderColo: '#ebebeb' },
            calculable: true,
            legend: { x: 'center', y: '32px', data: null },
            xAxis: [{
                axisLine: {
                    lineStyle: {
                        color: '#d2d2d2',
                        width: 1,
                        type: 'solid'
                    }
                },
                axisLabel: {
                    clickable: true,
                    textStyle: { color: '#acacac' }
                },
                type: 'category',
                data: null
            }],
            yAxis: [{
                axisLine: {
                    lineStyle: {
                        color: '#d2d2d2',
                        width: 1,
                        type: 'solid'
                    }
                },

                type: 'value',
                name: '面积',
                axisLabel: {
                    formatter: '{value} ' + 'km²'
                }
            }],
            series: null
        },
    });

    return L.DCI.Business.ApprovalCharts;
});