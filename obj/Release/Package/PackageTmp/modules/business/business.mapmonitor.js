/**
*以图管控模块类
*@module modules.business
*@class DCI.MapMonitor
*@constructor initialize
*@extends Class
*/
define("business/mapmonitor", [
    "leaflet",
    "plugins/scrollbar",
    "library/echarts",
    "data/statistics"
], function (L) {
    L.DCI.MapMonitor = L.Class.extend({

        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'MapMonitor',
        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: '以图管控',
        /**
        *公共服务设施配置表
        *@property _facilityConfig
        *@type {Array}
        *@private
        */
        _facilityConfig:[],
        /**
        *整体布局
        *@property tempHtml
        *@type {String}
        */
        tempHtml: '<div class="ytgk-content">'
                    + '<div class="ytgk-top">'
                        + '<div class="ytgk-top-content ytgk-top-pie">'
                            + '<span>土地使用情况</span>'
                            + '<div id="ytgk-spyd-pie"></div>'
                            //+ '<div id="ytgk-kydcl-pie"></div>'
                        + '</div>'
                        + '<div class="ytgk-top-content ytgk-top-table">'
                            + '<span>单位：平方米</span>'
                            + '<table>'
                                + '<thead><tr><td>规划用地规模</td><td>审批用地规模</td><td>可用地存量规模</td></tr><thead>'
                                + '<tbody id="ytgk-tbody"><tr><td></td><td></td><td></td></tr></tbody>'
                            + '</table>'
                        + '</div>'
                    + '</div>'
                    + '<p>规划指标使用情况</p>'
                    + '<div class="ytgk-bottom">'
                        + '<div class="ytgk-rjl-bar"><header unfold="0"><lable>容积率</lable><span class="icon-arrows-unfold"></span></header><div id="ytgk-rjl-bar"></div></div>'
                        + '<div class="ytgk-ldl-bar"><header unfold="0"><lable>绿地率</lable><span class="icon-arrows-unfold"></span></header><div id="ytgk-ldl-bar"></div></div>'
                        + '<div class="ytgk-jzmd-bar"><header unfold="0"><lable>建筑密度</lable><span class="icon-arrows-unfold"></span></header><div id="ytgk-jzmd-bar"></div></div>'
                        + '<div class="ytgk-gfss-bar"><header unfold="0"><lable>公服设施</lable><span class="icon-arrows-unfold"></span></header><div id="ytgk-gfss-bar"></div></div>'
                    + '</div>'
                + '</div>',

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            L.DCI.App.pool.get('LeftContentPanel').close(this,
            function () {
            });

            this._config = Project_ParamConfig.mapMonitorConfig;
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            $(".leftcontentpanel-title>span:first").html(this._clsName);//标题
            this.dom = $(".leftcontentpanel-body");
            this.dom.html(this.tempHtml);
            //滚动条
            $(".ytgk-content").mCustomScrollbar({
                theme: "minimal-dark"
            });
            //容积率收缩事件
            $(".ytgk-rjl-bar").on('click', 'header', { context: this }, function (e) { e.data.context.rjlClickEvent(e); });
            //容积率收缩事件
            $(".ytgk-ldl-bar").on('click', 'header', { context: this }, function (e) { e.data.context.ldlClickEvent(e); });
            //建筑密度收缩事件
            $(".ytgk-jzmd-bar").on('click', 'header', { context: this }, function (e) { e.data.context.jzmdClickEvent(e); });
            //公服设施收缩事件
            $(".ytgk-gfss-bar").on('click', 'header', { context: this }, function (e) { e.data.context.gfssClickEvent(e); });
            L.dci.app.pool.add(this);
            this._addLayer();
            this._getFacilityConfig();
        },
        /**
        *触发地图点击事件
        *@method active
        */
        active: function () {
            this._addLayer();
            this._map.activate(L.DCI.Map.StatusType.SELECT, this._selectManageCell, null, this);
            this._map.setCursorImg(this._clsName + ".cur");
        },
        /**
        *默认加图
        *@method _addLayer
        */
        _addLayer: function () {
            if (this._layer == null)
                this._layer = this._map.addLayer(this._config.manageCellLayer.url, { layers: this._config.manageCellLayer.layers, id: 'manageCellLayer' });
            else {
                this._map.map.addLayer(this._layer);
            }
        },
        /**
        *退出删除默认加载图
        *@method deleteLayer
        */
        deleteLayer: function () {
            this._map.removeLayer(this._layer.options.id);
            this._layer = null;
            this._map.clear();
        },

        /**
        *获取公共服务设施配置表
        *@method _getFacilityConfig
        */
        _getFacilityConfig:function() {
            if (this._facilityConfig.length == 0) {
                L.dci.app.services.statisticsService.getPublicFacility({
                    context: this,
                    success: function (res) {
                        this._facilityConfig = res;
                    }
                });
            }
        },
        /**
        *查询控制单元
        *@method _selectManageCell
        *@private
        */
        _selectManageCell: function (evt) {
            this._map.getHighLightLayer().clearLayers();
            var latlng = evt.latlng;
            var identify = L.esri.Tasks.identifyFeatures(this._layer.url);
            identify.on(this._map.map);
            identify.at(latlng);
            identify.tolerance(0);
            identify.layers('all');
            identify.run(function (error, featureCollection, response) {
                if (response.results.length > 0) {
                    var feature = featureCollection.features[0];
                    L.dci.app.util.highLight(this._map, response.results[0], true, false);
                    this._getFeatureIds(feature);
                }
            },this);
        },

        /**
        *清空图表内容
        *@method _clearChart
        *@private
        */
        _clearChart: function() {
            var pieData = [[0,0], [0,0]];
            var pieOption2 = this.setPieOptions(pieData[0], "审批用地规模");
            this.setChart("ytgk-spyd-pie", pieOption2);
            //var pieOption3 = this.setPieOptions(pieData[1], "可用地存量规模");
            //this.setChart("ytgk-kydcl-pie", pieOption3);
            //填充表格
            var tableData = [0, 0, 0];
            this.setTable(tableData);

            var data = [
                [0, 0],
                [0, 0]
            ];
            //容积率
            var rjlBarOption = this.setRJLOption(data);
            this.setRJLChart("ytgk-rjl-bar", rjlBarOption);

            data = [
                [0, 0],
                [0, 0]
            ];
            //绿地率
            var ldlBarOption = this.setLDLOption(data);
            this.setLDLChart("ytgk-ldl-bar", ldlBarOption);

            data = [
                [0, 0],
                [0, 0]
            ];
            //建筑密度
            var jzmdBarOption = this.setJZMDOption(data);
            this.setJZMDChart("ytgk-jzmd-bar", jzmdBarOption);
        },
        /**
        *获取在选中的控制单元内的控规和用地红线要素ID
        *@method _getFeatureIds
        *@param feature {Object} 控制单元要素
        *@private
        */
        _getFeatureIds: function (feature) {
            this._getIdsCount = this._config.statLayers.length-1;
            this._KgIds = [];
            this._YdIds = [];
            //规划地块
            var kg = this._config.statLayers[0];
            var query1 = L.esri.Tasks.query(kg.url + "/" + kg.layers[0]);
            query1.within(feature);
            query1.returnGeometry(false);
            query1.params.inSr = this._map.options.crs.code.split(':')[1];
            query1.params.outSr = "";
            query1.ids(function (error, featureCollection) {
                if (featureCollection == null)
                    this._kgIds = "";
                else
                    this._kgIds = featureCollection;
                this._getIdsCount--;
                if (this._getIdsCount == 0) {
                    this._statUsableLand();
                }
            }, this);
            //用地红线
            var yd = this._config.statLayers[1];
            var query2 = L.esri.Tasks.query(yd.url + "/" + yd.layers[0]);
            query2.within(feature);
            query2.returnGeometry(false);
            query2.params.inSr = this._map.options.crs.code.split(':')[1];
            query2.params.outSr = "";
            query2.ids(function (error, featureCollection) {
                if (featureCollection == null)
                    this._ydIds = "";
                else
                    this._ydIds = featureCollection;
                this._getIdsCount--;
                if (this._getIdsCount == 0) {
                    this._statUsableLand();
                }
            }, this);
            //配套设施
            var pt = this._config.statLayers[2];
            var query3 = L.esri.Tasks.query(pt.url + "/" + pt.layers[0]);
            query3.within(feature);
            query3.returnGeometry(false);
            query3.params.inSr = this._map.options.crs.code.split(':')[1];
            query3.params.outSr = "";
            query3.fields(["OBJECTID","CODE"]);
            query3.run(function (error, featureCollection) {
                var dataName = [];
                var dataValue = [];
                for (var i = 0; i < this._facilityConfig.length; i++) {
                    dataName.push(this._facilityConfig[i].Key);
                    dataValue[i] = 0;
                }
                for (var i = 0; i < featureCollection.features.length; i++) {
                    for (var j = 0; j < this._facilityConfig.length; j++) {
                        for (var k=0;k<this._facilityConfig[j].Values.length;k++) {
                            if (this._facilityConfig[j].Values[k]["Code"] == featureCollection.features[i].properties["CODE"]) {
                                dataValue[j]++;
                                continue;
                            }
                        }
                    }
                }
                //公服设施
                var gfssBarOption = this.setGFSSOption(dataName, dataValue);
                this.setGFSSChart("ytgk-gfss-bar", gfssBarOption);
            }, this);
        },

        /**
        *统计用地情况
        *@method _statUsableLand
        *@private
        */
        _statUsableLand: function () {
            L.dci.app.services.statisticsService.statYdInfo({
                kgIds: this._kgIds,
                ydhxIds: this._ydIds,
                context: this,
                success: function (res) {
                    this.getData(res);
                }
            });
        },

        /**
       *获取数据
       *@method getData
       */
        getData: function (res) {
            this._clearChart();
            //填充饼状图
            var valueTd = res[0].Obj;
            var pieData = [valueTd["审批用地规模"],valueTd["可用地存量规模"]];
            var pieOption2 = this.setPieOptions(pieData, "审批用地规模");
            //var pieOption2 = this.setPieOptions(valueTd, "审批用地规模");
            this.setChart("ytgk-spyd-pie", pieOption2);
            //var pieOption3 = this.setPieOptions(pieData[1], "可用地存量规模");
            //this.setChart("ytgk-kydcl-pie", pieOption3);
            //填充表格
            var tableData = [valueTd["规划用地规模"].toFixed(2), valueTd["审批用地规模"].toFixed(2), valueTd["可用地存量规模"].toFixed(2)];
            this.setTable(tableData);

            var valueRjl = res[1].Obj;
            var data = [
                [valueRjl["规划容积率上限"].toFixed(2), valueRjl["剩余容积率上限"].toFixed(2)],
                [valueRjl["规划容积率下限"].toFixed(2), valueRjl["剩余容积率下限"].toFixed(2)]
            ];
            //容积率
            var rjlBarOption = this.setRJLOption(data);
            this.setRJLChart("ytgk-rjl-bar", rjlBarOption);

            var valurLd = res[2].Obj;
            data = [
                [valurLd["规划绿地率上限"].toFixed(2), valurLd["剩余绿地率上限"].toFixed(2)],
                [valurLd["规划绿地率下限"].toFixed(2), valurLd["剩余绿地率下限"].toFixed(2)]
            ];
            //绿地率
            var ldlBarOption = this.setLDLOption(data);
            this.setLDLChart("ytgk-ldl-bar", ldlBarOption);

            var valurJzmd = res[3].Obj;
            data = [
                [valurJzmd["规划建筑密度上限"].toFixed(2), valurJzmd["剩余建筑密度上限"].toFixed(2)],
                [valurJzmd["规划建筑密度下限"].toFixed(2), valurJzmd["剩余建筑密度下限"].toFixed(2)]
            ];
            //建筑密度
            var jzmdBarOption = this.setJZMDOption(data);
            this.setJZMDChart("ytgk-jzmd-bar", jzmdBarOption);

            L.DCI.App.pool.get('LeftContentPanel').show(this,
            function () {
            });
        },

        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            this.deleteLayer();
            L.dci.app.pool.remove('MapMonitor');
        },
        
        /**
        *填充table
        *@method setTable
        *@private
        */
        setTable: function (data) {
            $($("#ytgk-tbody").find("td")[0]).html(data[0]);
            $($("#ytgk-tbody").find("td")[1]).html(data[1]);
            $($("#ytgk-tbody").find("td")[2]).html(data[2]);
        },

        /**
        *设置pie的参数
        *@method setPieOptions
        *@private
        */
        setPieOptions: function (data, title) {
            var pieData = [];
            for (var i = 0; i < data.length; i++)
            {
                if(i==0)
                    pieData.push({ "value": data[i], name: '审批用地规模' });
                if (i == 1)
                    pieData.push({ "value": data[i], name: '可用地存量规模' });
            }

            var pieOption = {
                color: ['#78c8d2', '#ff6464'],
                legend: {
                    orient:'vertical',
                    x: 'right',
                    y: '70px',
                    data: ['审批用地规模', '可用地存量规模']
                },    
                series: [
                    {
                        type: 'pie',
                        radius: '50px',
                        center: ['28%', '45%'],
                        selectedMode: 'single',
                        legendHoverLink: false,
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'inner',
                                    formatter: function (params) {
                                        return (params.percent - 0) + '%';
                                    }
                                },
                                labelLine: {
                                    show: false,
                                    length: 1
                                }
                            },
                            emphasis: {
                                label: {
                                    position: 'inner',
                                    show: false,
                                    formatter: "{b}\n{c}"
                                }
                            }
                        },
                        data: pieData
                    }
                ]
            };
            return pieOption;
        },

        /**
        *填充饼状图
        *@method setChart
        *@private
        */
        setChart: function (id, option) {
            var Chart = echarts.init(document.getElementById(id));
            Chart.setOption(option);
        },

        /**
        *设置容积率柱状图的参数
        *@method setRJLOption
        *@private
        */
        setRJLOption: function (data) {
            var barOption = {
                legend: {
                    itemWidth: 6,
                    itemHeight: 6,
                    x: 'right',
                    y: '8px',
                    data: ['下限', '上限']
                },
                calculable: false,
                color: ['#ffdc64', '#a6dc8c'],
                grid: {
                    x: 60,
                    y: 35,
                    x2: 20,
                    y2: 30,
                },
                xAxis: [
                    {
                        type: 'category',
                        splitLine: { show: false },
                        data: ['规划容积率', '剩余容积率']
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                    }
                ],
                series: [
                    {
                        name: '下限',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 4, 4],
                                label: {
                                    show: true,
                                    position: 'top',
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                        data: data[0]

                    },
                    {
                        name: '上限',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 4, 4],
                                label: {
                                    show: true,
                                    position: 'top',
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                        data: data[1]
                    }
                ]
            };

            return barOption;
        },

        /**
        *设置绿地率柱状图的参数
        *@method setLDLOption
        *@private
        */
        setLDLOption: function (data) {
            var barOption = {
                legend: {
                    itemWidth: 6,
                    itemHeight: 6,
                    x: 'right',
                    y: '8px',
                    data: ['下限', '上限']
                },
                calculable: false,
                color: ['#ffdc64', '#a6dc8c'],
                grid: {
                    x: 60,
                    y: 35,
                    x2: 20,
                    y2: 30
                },
                xAxis: [
                    {
                        type: 'category',
                        splitLine: { show: false },
                        data: ['规划绿地率', '剩余绿地率']
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '下限',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 4, 4],
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: function (params) {
                                        return params.value+"%";
                                    },
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                        data: data[0]

                    },
                    {
                        name: '上限',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 4, 4],
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: function (params) {
                                        return params.value + "%";
                                    },
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                        data: data[1]
                    }
                ]
            };

            return barOption;
        },

        /**
        *设置建筑密度柱状图的参数
        *@method setJZMDOption
        *@private
        */
        setJZMDOption: function (data) {
            var barOption = {
                legend: {
                    itemWidth: 6,
                    itemHeight: 6,
                    x: 'right',
                    y: '8px',
                    data: ['下限', '上限']
                },
                calculable: false,
                color: ['#ffdc64', '#a6dc8c'],
                grid: {
                    x: 60,
                    y: 35,
                    x2: 20,
                    y2: 30
                },
                xAxis: [
                    {
                        type: 'category',
                        splitLine: { show: false },
                        data: ['规划建筑密度', '剩余建筑密度']
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '下限',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 4, 4],
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: function (params) {
                                        return params.value+"%";
                                    },
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                        data: data[0]

                    },
                    {
                        name: '上限',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                barBorderRadius: [4, 4, 4, 4],
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: function (params) {
                                        return params.value + "%";
                                    },
                                    textStyle: {
                                        color: '#000'
                                    }
                                }
                            }
                        },
                        data: data[1]
                    }
                ]
            };

            return barOption;
        },

        /**
        *设置公服设施柱状图的参数
        *@method setGFSSOption4
        *@param {Array} 名称
        *@param {Array} 统计值
        *@private
        */
        setGFSSOption: function (name,value) {
            var barOption = {
                legend: {
                    itemWidth: 6,
                    itemHeight: 6,
                    x: 'right',
                    y: '8px',
                    data: ['总量']
                },
                calculable: false,
                color: ['#ffdc64', '#a6dc8c'],
                grid: {
                    x: 80,
                    y: 35,
                    x2: 10,
                    y2: 30
                },
                xAxis: [
                    {
                        type: 'value'
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        splitLine: { show: false },
                        axisLabel: {
                            rotate: 40,
                            textStyle: {
                                color: '#000',
                                fontWeight: 'bold'
                            }
                        },
                        data: name
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
                                barBorderRadius: [4, 4, 4, 4],
                                label: { show: true, position: 'insideRight', textStyle: { color: '#000' }, }
                            }
                        },
                        data: value
                    }
                ]
            };

            return barOption;
        },

        /**
        *填充容积率柱状图
        *@method setRJLChart
        *@private
        */
        setRJLChart: function (id, option) {
            this.rjlBarObj = echarts.init(document.getElementById(id));
            this.rjlBarObj.setOption(option);
        },

        /**
        *填充绿地率柱状图
        *@method setLDLChart
        *@private
        */
        setLDLChart: function (id, option) {
            this.ldlBarObj = echarts.init(document.getElementById(id));
            this.ldlBarObj.setOption(option);
        },

        /**
        *填充建筑密度柱状图
        *@method setJZMDChart
        *@private
        */
        setJZMDChart: function (id, option) {
            this.jzmdBarObj = echarts.init(document.getElementById(id));
            this.jzmdBarObj.setOption(option);
        },

        /**
        *填充公服设施柱状图
        *@method setGFSSChart
        *@private
        */
        setGFSSChart: function (id, option) {
            this.gfssBarObj = echarts.init(document.getElementById(id));
            this.gfssBarObj.setOption(option);
        },

        /**
        *容积率收缩点击事件
        *@method rjlClickEvent
        *@private
        */
        rjlClickEvent: function (e) {
            var num = $(e.currentTarget).attr("unfold");
            var _this = e.data.context;
            if (num == "0") {
                $(e.currentTarget).attr("unfold", "1");
                $(e.currentTarget).children('span').rotate({ animateTo: 270, duration: 300 });
                $(e.currentTarget).parent().addClass("active");
                $(".ytgk-rjl-bar").animate({
                    width: '660px',
                    height: '500px'
                }, "fast", function () {
                    _this.rjlBarObj.resize();
                });
            }
            else {
                $(e.currentTarget).attr("unfold", "0");
                $(e.currentTarget).children('span').rotate({ animateTo: 90, duration: 300 });
                $(".ytgk-rjl-bar").animate({
                    width: '320px',
                    height: '240px'
                }, "fast", function () {
                    $(this).removeClass("active");
                    _this.rjlBarObj.resize();
                });

            }
        },

        /**
        *绿地率收缩点击事件
        *@method ldlClickEvent
        *@private
        */
        ldlClickEvent: function (e) {
            var num = $(e.currentTarget).attr("unfold");
            var _this = e.data.context;
            if (num == "0") {
                $(e.currentTarget).attr("unfold", "1");
                $(e.currentTarget).children('span').rotate({ animateTo: 360, duration: 300 });
                $(e.currentTarget).parent().addClass("active");
                $(".ytgk-ldl-bar").animate({
                    left: '0px',
                    width: '660px',
                    height: '500px'
                }, "fast", function () {
                    _this.ldlBarObj.resize();
                });
            }
            else {
                $(e.currentTarget).attr("unfold", "0");
                $(e.currentTarget).children('span').rotate({ animateTo: 180, duration: 300 });
                $(".ytgk-ldl-bar").animate({
                    left: '340px',
                    width: '320px',
                    height: '240px'
                }, "fast", function () {
                    $(this).removeClass("active");
                    _this.ldlBarObj.resize();
                });

            }
        },

        /**
        *建筑密度收缩点击事件
        *@method jzmdClickEvent
        *@private
        */
        jzmdClickEvent: function (e) {
            var num = $(e.currentTarget).attr("unfold");
            var _this = e.data.context;
            if (num == "0") {
                $(e.currentTarget).attr("unfold", "1");
                $(e.currentTarget).children('span').rotate({ animateTo: 180, duration: 300 });
                $(e.currentTarget).parent().addClass("active");
                $(".ytgk-jzmd-bar").animate({
                    top: '0px',
                    width: '660px',
                    height: '500px'
                }, "fast", function () {
                    _this.jzmdBarObj.resize();
                });
            }
            else {
                $(e.currentTarget).attr("unfold", "0");
                $(e.currentTarget).children('span').rotate({ animateTo: 0, duration: 300 });
                $(".ytgk-jzmd-bar").animate({
                    top: '260px',
                    width: '320px',
                    height: '240px'
                }, "fast", function () {
                    $(this).removeClass("active");
                    _this.jzmdBarObj.resize();
                });

            }
        },

        /**
        *公服设施收缩点击事件
        *@method gfssClickEvent
        *@private
        */
        gfssClickEvent: function (e) {
            var num = $(e.currentTarget).attr("unfold");
            var _this = e.data.context;
            if (num == "0") {
                $(e.currentTarget).attr("unfold", "1");
                $(e.currentTarget).children('span').rotate({ animateTo: 90, duration: 300 });
                $(e.currentTarget).parent().addClass("active");
                $(".ytgk-gfss-bar").animate({
                    left: '0px',
                    top: '0px',
                    width: '660px',
                    height: '500px'
                }, "fast", function () {
                    _this.gfssBarObj.resize();
                });
            }
            else {
                $(e.currentTarget).attr("unfold", "0");
                $(e.currentTarget).children('span').rotate({ animateTo: 270, duration: 300 });
                $(".ytgk-gfss-bar").animate({
                    left: '340px',
                    top: '260px',
                    width: '320px',
                    height: '240px'
                }, "fast", function () {
                    $(this).removeClass("active");
                    _this.gfssBarObj.resize();
                });

            }
        }

    });
    return L.DCI.MapMonitor;
});