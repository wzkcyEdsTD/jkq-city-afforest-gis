require.config({
    paths: {
        "jquery": '../library/jquery/jquery-1.11.1.min',
        "bootstrap": "../library/bootstrap/bootstrap.min",
        "leaflet": '../library/leaflet/leaflet',
        "echarts": "../library/echarts/echarts",
        "data/ajax": "../data/data.ajax",
        
        "core/dcins": "../core/core.namespace",
        "util/dialog": '../util/util.dialog',
        "util/log": '../util/util.log',
        "util/user": '../util/util.user',
        "util/base": '../util/util.base',
        "util/tool": '../util/util.tool',
        "util/locate": '../util/util.locate',

        "plugins/scrollbar": "../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.min",
        "plugins/cookie": "../plugins/jquery.cookie",
        "plugins/form": '../plugins/jquery.form',
        "plugins/bxslider": '../plugins/jquery.bxslider/jquery.bxslider',

        "login/settings": '../modules/login/login.settings'
    },
    shim: {
        "bootstrap": { deps: ['jquery'] },
        "plugins/scrollbar": { deps: ['jquery'] },
        "plugins/bxslider": { deps: ['jquery'] },
        "plugins/form": { deps: ['jquery'] },

        "util/locate": { deps: ['leaflet'] }
    }
});

//========================加载后执行===========================//

/**
*home布局类
*@module layout
*@class DCI.Home
*@constructor initialize
*/
require([
    "leaflet",
    "jquery",
    "bootstrap",
    "echarts",
    "core/dcins",
    "data/ajax",
    "util/base",
    "plugins/form",
    "plugins/scrollbar",
    "login/settings"
], function (L) {
    L.DCI.Home = L.Class.extend({

        /**
        *配置
        *@property options
        *@type {Object}
        *@private
        */
        options: {
            //areaMmultiple: 0.000001,/*面积倍数，服务返回数据为平方米，在界面上要显示为平方千米*/
            areaMmultiple: 1,  /*面积倍数，服务返回数据为平方米，在界面上要显示为平方米*/
        },

        /**
        *配置-获取哪一年的统计数据
        *@property parameters
        *@type {Object}
        *@private
        */
        parameters: {
            /*获取哪一年的统计数据*/
            year: 2013
        },

        /**
        *统计图X轴数据类，0为用地类型，1为行政区
        *@property xAxisParameters
        *@type {Object}
        *@private
        */
        xAxisParameters: {
            land: 0
        },

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.ajax = new L.DCI.Ajax();
            this.services = Project_ParamConfig.defaultCoreServiceUrl;
        },

        /**
        *加载数据
        *@method load
        */
        load: function () {
            this.getPrjInfo("sy", function (res) {
                this.caption = res[0].value;
                this.getPrjInfo("kg");
                this.getPrjInfo("fg");
                this.getPrjInfo("dx");
                this.getPrjInfo("zx");
            });
            this._initCharts();
            this._requestData();
        },

        /**
        *获取项目数据
        *@method load
        *@param type{String} 类型
        *@param success{function} 回调函数
        */
        getPrjInfo: function (type, success) {
            var url = this.services + "/cpzx/static/landuse/area/";
            var error = function (e, info) {
                L.dci.util.dialog.error("温馨提示", "获取项目失败");
            }
            switch (type) {
                case "kg":
                    url = url + "kg";
                    this.ajax.get(url, null, true, this, function (res) {
                        this.setChart(type, res, this.caption);
                    }, function (e) {
                        L.dci.util.dialog.error("温馨提示", "未能获取控规统计信息");
                        //error(e, "未能获取控规统计信息");
                    });
                    break;
                case "fg":
                    url = url + "fg";
                    this.ajax.get(url, null, true, this, function (res) {
                        this.setChart(type, res, this.caption);
                    }, function (e) {
                        L.dci.util.dialog.error("温馨提示", "未能获取分规统计信息");
                        //error(e, "未能获取分规统计信息");
                    });
                    break;
                case "dx":
                    url = url + "500";
                    this.ajax.get(url, null, true, this, function (res) {
                        this.setChart(type, res, this.caption);
                    }, function (e) {
                        L.dci.util.dialog.error("温馨提示", "未能获取1：500地形统计信息");
                        //error(e, "未能获取1：500地形统计信息");
                    });
                    break;
                case "zx":
                    url = url + "zg";
                    this.ajax.get(url, null, true, this, function (res) {
                        this.setChart(type, res, this.caption);
                    }, function (e) {
                        L.dci.util.dialog.error("温馨提示", "未能获取总规统计信息");
                        //error(e, "未能获取总规统计信息");
                    });
                    break;
                case "sy":
                    url = url + "xzqh";
                    this.ajax.get(url, null, true, this, success, function (e) {
                        L.dci.util.dialog.error("温馨提示", "未能获取按行政区划统计用地信息");
                        //error(e, "未能获取按行政区划统计用地信息");
                    });
                    break;
            }

        },


        /**
        *设置图表
        *@method setChart
        *@param type{String} 类型
        *@param res{Object} 数据集
        *@param cap{Number} 数据
        */
        setChart: function (type, res, cap) {
            var names = ["other", type];
            var v = parseFloat(res[0].value / 1000000).toFixed(1);
            var t = (parseFloat(cap / 1000000)).toFixed(1);
            var contain = $("#prj-info-chart-" + type).next().children().children();
            contain[0].innerHTML = v + "km<sup>2</sup>";
            contain[1].innerHTML = t + "km<sup>2</sup>";
            var value = parseFloat(res[0].value / cap).toFixed(2);
            var values = [];
            values.push(value);
            values.push(1 - value);
            var option = this.getPieChartOptions(names, values);
            var chart = echarts.init(document.getElementById('prj-info-chart-' + type));
            chart.setOption(option);
        },

        /**
        *获取配置项
        *@method getPieChartOptions
        *@param names{String} 名称集
        *@param values{Object} 数值集
        */
        getPieChartOptions: function (names, values) {
            var labelTop = {
                normal: {
                    color: 'rgba(0,0,0,0.4)',
                    labelLine: {
                        show: false
                    },
                    label: {
                        show:false
                    }
                }
            };
            var labelFromatter = {
                normal: {
                    label: {
                        formatter: function (params) {
                            return (params.value * 100).toFixed(1) + '%';
                        },
                        textStyle: {
                            baseline: 'middle',
                            color: '#fff'
                        }
                    }
                },
            }
            var labelBottom = {
                normal: {
                    color: '#fff',
                    label: {
                        show: true,
                        position: 'center'
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                    color: 'rgba(0,0,0,0)'
                }
            };
            var radius = [30, 26];
            var option = {
                series: [
                    {
                        type: 'pie',
                        center: ['50%', '50%'],
                        radius: radius,
                        itemStyle: labelFromatter,
                        data: [
                             { name: names[0], value: values[0], itemStyle: labelBottom },
                             { name: names[1], value: values[1], itemStyle: labelTop }
                        ]
                    }
                ]
            };
            return option;
        },

        /**
        *初始化柱图，给柱图绑定点击处理事件
        *@method _initCharts
        */
        _initCharts: function () {
            this._chart_bar_ydlx = echarts.init(document.getElementById("chart-ydlx"));
            this._chart_bar_sp = echarts.init(document.getElementById("chart-sp"));
            this._chart_bar_xzq = echarts.init(document.getElementById("chart-xzq"));
            this._chart_bar_kg = echarts.init(document.getElementById("chart-kg"));
        },

        /**
        *请求统计图数据
        *@method _requestData
        */
        _requestData: function () {
            var newUrl = this.services + "/cpzx/static/landuse/project/area";
            this.ajax.get(newUrl, null, true, this, function (res) {

                var indicartorHtml = '';
                for (var i = 0; i < res.length; i++) {
                    res[i].value = (res[i].value * this.options.areaMmultiple).toFixed(4);
                    var alias = res[i].name;
                    var value = res[i].value;
                    if (value != null) {
                        indicartorHtml = indicartorHtml + '<tr><td class="key">';
                        indicartorHtml = indicartorHtml + alias + '</td><td class="key-value">';
                        indicartorHtml = indicartorHtml + value + '</td><tr>';
                    }

                }
                this._projectCharts(res, "bar", this._chart_bar_sp);
                var tablecontent = $("#acharts-charts-table-sp");
                var chartcontent = $("#chart-sp");
                var tbale = $("#acharts-charts-table-sp").find("tbody")[0];
                $(".title-sp span").on('click',
                    { chartcontent: chartcontent, tablecontent: tablecontent }, this.toggletableorchart);
                $(tbale).append(indicartorHtml);
            });
            var url = this.services + "/cpzx/static/landuse/type";
            newUrl = url + "/" + this.parameters.year + "/0/0";

            this.ajax.get(newUrl, null, true, this, function (res) {

                var indicartorHtml = '';
                for (var i = 0; i < res[0].data.length; i++) {
                    res[0].data[i].value = (res[0].data[i].value * this.options.areaMmultiple).toFixed(4);
                    var alias = res[0].data[i].name;
                    var value = res[0].data[i].value;
                    if (value != null) {
                        indicartorHtml = indicartorHtml + '<tr><td class="key">';
                        indicartorHtml = indicartorHtml + alias + '</td><td class="key-value">';
                        indicartorHtml = indicartorHtml + value + '</td><tr>';
                    }

                }
                for (var j = 0; j < res[1].data.length; j++) {
                    res[1].data[j].value = (res[1].data[j].value * this.options.areaMmultiple).toFixed(4);
                }
                //
                this._fillCharts(res, "bar", this._chart_bar_ydlx);
                var tablecontent = $("#acharts-charts-table-ydlx");
                var chartcontent = $("#chart-ydlx");
                var tbale = $("#acharts-charts-table-ydlx").find("tbody")[0];
                $(".title-ydlx span").on('click',
                    { chartcontent: chartcontent, tablecontent: tablecontent }, this.toggletableorchart);
                $(tbale).append(indicartorHtml);

                var indicartorHtml = '';
                for (var i = 0; i < res[2].data.length; i++) {
                    var alias = res[2].data[i].name;
                    var value = res[2].data[i].value;
                    if (value != null) {
                        indicartorHtml = indicartorHtml + '<tr><td class="key">';
                        indicartorHtml = indicartorHtml + alias + '</td><td class="key-value">';
                        indicartorHtml = indicartorHtml + value + '</td><tr>';
                    }

                }
                this._fillCharts(res, "pie", this._chart_bar_kg);
                var tablecontent = $("#acharts-charts-table-kg");
                var chartcontent = $("#chart-kg");
                var tbale = $("#acharts-charts-table-kg").find("tbody")[0];
                $(".title-kg span").on('click',
                    { chartcontent: chartcontent, tablecontent: tablecontent }, this.toggletableorchart);
                $(tbale).append(indicartorHtml);
            });
            newUrl = this.services + "/cpzx/static/landuse/region/" + this.parameters.year + "/0/0";

            this.ajax.get(newUrl, null, true, this, function (res) {

                var indicartorHtml = '';
                for (var i = 0; i < res[0].data.length; i++) {
                    res[0].data[i].value = (res[0].data[i].value * this.options.areaMmultiple).toFixed(4);
                    var alias = res[0].data[i].name;
                    var value = res[0].data[i].value;
                    if (value != null) {
                        indicartorHtml = indicartorHtml + '<tr><td class="key">';
                        indicartorHtml = indicartorHtml + alias + '</td><td class="key-value">';
                        indicartorHtml = indicartorHtml + value + '</td><tr>';
                    }

                }
                for (var j = 0; j < res[1].data.length; j++) {
                    res[1].data[j].value = (res[1].data[j].value * this.options.areaMmultiple).toFixed(4);
                }
                this._fillCharts(res, "bar", this._chart_bar_xzq);
                var tablecontent = $("#acharts-charts-table-xzq");
                var chartcontent = $("#chart-xzq");
                var tbale = $("#acharts-charts-table-xzq").find("tbody")[0];
                $(".title-xzq span").on('click',
                    { chartcontent: chartcontent, tablecontent: tablecontent }, this.toggletableorchart);
                $(tbale).append(indicartorHtml);
            });
        },

        /**
        *切换表格或图标
        *@method toggletableorchart
        */
        toggletableorchart: function (o) {
            var chartcontent = o.data.chartcontent;
            var tablecontent = o.data.tablecontent;
            if ($(chartcontent).hasClass('hides')) {
                $(this).addClass('icon-Viewform');
                $(this).removeClass('icon-business-analysis');
                $(chartcontent).removeClass('hides');
                $(tablecontent).addClass('hides');
            }
            else {
                $(this).removeClass('icon-Viewform');
                $(this).addClass('icon-business-analysis');
                $(chartcontent).addClass('hides');
                $(tablecontent).removeClass('hides');
            }

        },

        /**
        *生成chart
        *@method _fillCharts
        *@param data{String} 数据集
        *@param type{String} 类型
        *@param chart{Object}图表对象
        */
        _fillCharts: function (data, type, chart) {
            if (data != null) {
                if (data instanceof Array) {
                    var pieSeries = [];
                    var barSeries = [];
                    var legend = [];
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
                    if (type == "pie") {
                        this._pieOptionTemplete.series = pieSeries;
                        for (var p = 0; p < this._pieOptionTemplete.series.length; p++) {
                            this._pieOptionTemplete.series[p].type = 'pie';
                            this._pieOptionTemplete.series[p].radius = '50%';
                            this._pieOptionTemplete.series[p].center = ['50%', '50%'];
                        }
                        chart.setOption(this._pieOptionTemplete, true);
                    } else {
                        this._barOptionTemplete.legend.data = ['用地面积', '建筑面积'];
                        this._barOptionTemplete.xAxis[0].data = legend;
                        this._barOptionTemplete.series = barSeries;
                        for (var b = 0; b < this._barOptionTemplete.series.length; b++) {
                            this._barOptionTemplete.series[b].type = 'bar';
                            this._barOptionTemplete.series[b].clickable = false;
                        }
                        chart.setOption(this._barOptionTemplete, true);
                    }
                    return;
                } else {
                    if (data.error != null) {
                        L.dci.util.dialog.error("温馨提示", "获取数据失败");
                        return;
                    }
                }
                L.dci.util.dialog.error("温馨提示", '获取统计图数据失败');
            }
        },

        /**
        *项目chart
        *@method _projectCharts
        *@param data{String} 数据集
        *@param type{String} 类型
        *@param chart{Object}图表对象
        */
        _projectCharts: function (data, type, chart) {
            if (data != null) {
                if (data instanceof Array) {
                    var names = [];
                    var values = [];
                    for (var i = 0; i < data.length; i++) {
                        names.push(data[i].name);
                        values.push(data[i].value);
                    }
                    var option = {
                        tooltip: {
                            trigger: 'axis'
                        },
                        calculable: true,
                        xAxis: [
                            {
                                type: 'category',
                                data: names
                            }
                        ],
                        yAxis: [
                            {
                                axisLine: {
                                    lineStyle: {
                                        color: '#d2d2d2',
                                        width: 1,
                                        type: 'solid'
                                    }
                                },
                                name: '面积',
                                type: 'value',
                                axisLabel: {
                                    formatter: function (value) { return (value) + "m²"; }
                                }
                            }
                        ],
                        series: [
                            {
                                name: '面积',
                                type: 'bar',
                                data: values
                            }
                        ]
                    };
                    chart.setOption(option, true);
                }
            }
        },

        /**
        *饼状图配置
        *@property _pieOptionTemplete
        *@type {Object}
        *@private
        */
        _pieOptionTemplete: {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            calculable: true,
            series: {
                itemStyle: {
                    normal: {
                        label: {
                            position: 'inner',
                            formatter: function (params) {
                                return (params.percent - 0).toFixed(0) + '%';
                            }
                        },
                        labelLine: {
                            show: true
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: "{b}\n{d}%"
                        }
                    }

                }
            }
        },

        /**
        *柱状图配置
        *@property _barOptionTemplete
        *@type {Object}
        *@private
        */
        _barOptionTemplete: {
            tooltip: {
                trigger: 'axis'
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
                    formatter: function (value) { return (value) + "m²"; }
                }
            }],
            series: null
        }
    });

    $(document).ready(function () {
        L.dci.app = {};
        L.dci.app.util = new L.DCI.Util();
        var user = L.dci.app.util.user;
        var userName = user.getCurUserDisplayName();
        var userId = user.getCurUserId();
        var path = user._userImages;
        $(".user-img").attr("src", Project_ParamConfig.defaultUserImages + path);
        document.title = Project_ParamConfig.title + "-首页";

        /******** 鼠标经过离开div动态变色效果*********/
        $(".center-panel-menu-item").mouseenter(function (event) {
            $(this).children().children().eq(0).stop().animate({ width: "100%" }, 200);
            $(this).children().children().eq(0).css({ "border-top-right-radius": "4px", "border-bottom-right-radius": "4px" });
            $(this).children().children().eq(1).css({ "color": "#fff" });
        });
        $(".center-panel-menu-item").mouseleave(function (event) {
            $(this).children().children().eq(1).css({ "color": "#505050" });
            $(this).children().children().eq(0).stop().animate({ width: "16px" }, 200);
            $(this).children().children().eq(0).css({ "border-top-right-radius": "0px", "border-bottom-right-radius": "0px" });
        });
        /******用户设置界面js控制******/
        $(".center-userset-panel-close").on("click", function () {
            $(".center-userset-panel").css({ "display": "none" });
            $("#imgreset>span").css({ "border-bottom": "0px" });
        });

        $("#setbutton").on("click", function () {
            this._loginsettings = new L.DCI.LoginSettings();
        });
        $("#quitbutton").on("click", function () {
            L.dci.app.util.dialog.confirm("温馨提示", "确认要退出系统？", function () {
                location.href = "login.aspx";
            });

        });
        var home = new L.DCI.Home();
        home.load();
       
        $("#user-name").html(userName);
        //滚动条
        $(".center-panel-content").mCustomScrollbar({
            theme: "minimal-dark"
        });
        
        var ajax = new L.DCI.Ajax();
        var services = Project_ParamConfig.defaultCoreServiceUrl;
        var url = services + '/cpzx/manage/user/ywxt/access/' + userId;
        ajax.requestText(url, null, true, this, function (res) {
            if (res.toLowerCase() == "true") {
                $("#manageSystem").show();
                $("#manageSystem").on("click", function() {
                    L.dci.app.util.tool.autoOpenManageWindow("manage.aspx", user.getToken());
                });
            } else {
                $("#manageSystem").hide();
            }
        });
    });
});


