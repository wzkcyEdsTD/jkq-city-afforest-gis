/**
*时间轴控件
*@module controls
*@class DCI.Controls.TimeSlider
*@extends L.Control
*/
define("controls/timeslider", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Controls.TimeSlider = L.Control.extend({
        /**
        *配置集合
        *@property options
        *@type {Object}
        */
        options: {
            position: "topright",
            collapsed: true,
            numCount: 5,//显示年份个数
            minNum: 0,//最小年份
            maxNum: 100//最大年份
        },
        parameters: null,

        addparameters: {
            year: null,//年份
            type: null,//勾选的服务类型
            url: null,  //服务url
            name: null//服务名称
        },
        /**
        *时间选择html
        *@property yearSelectorHtml
        *@type {String}
        */
        yearSelectorHtml: '<div class="yearselector-block">'
            + '<span class="yearselector-year"></span>'
            + '<span class="yearselector-pin"></span>'
            + '</div>',

        /**
       *初始化
       *@method initialize
       */
        initialize: function (options) {
            var date = new Date();
            var lastyear = date.getFullYear();
            this.options.maxNum = lastyear;
            this.options.minNum = 2000;
            this.parameters = L.setOptions(this, options);
            this.addparameters = {};
        },
        /**
       *添加到地图
       *@method onAdd
       *@param map {Object} 地图对象
       */
        onAdd: function (map) {
            // this._map = map;
            //this.layers = {};
           
            this._creatUi();
            this._initYearSelector();
            return this.container;

        },
        /**
        *创建主视图
        *@method _creatUi
        *@private
        */
        _creatUi: function () {
            var conclass = 'timeslider-control';
            this.container = L.DomUtil.create('div', conclass);
            this.container.id = "timeslider-control";
            var link = this._layersLink = L.DomUtil.create('a', conclass + '-toggle', this.container);
            link.href = '#';
            link.title = '时间轴展示';

            this.silider = $('<div id="time-selector" class="time-selector"><div class="yearselector-container"><span id="preYear-select" class="yearselector-switch icon-arrows"></span><div class="yearselector-axis"></div><span id="nextYear-select" class="yearselector-switch icon-arrows-right"></span></div></div>');
            this.typegroup = $('<div id="type-select" class="type-group-selector"></div>');
            var tipHtml = $('<span class="timeslider-tip"></span>');

            $(this.container).append(this.silider);
            $(this.silider).append(this.typegroup);
            $(this.silider).append(tipHtml);


            this._initYearSelector();
            this._creatLayerSelect(this.parameters);
            var preYear = $(this.silider).find('.icon-arrows')[0];
            var nextYear = $(this.silider).find('.icon-arrows-right')[0];

            L.DomEvent.on(link, 'click', this._expandOrCollapse, this);
            L.DomEvent.on(preYear, 'click', this._preYearClick, this);
            L.DomEvent.on(nextYear, 'click', this._nextYearClick, this);

            L.DomEvent.addListener(link, 'click', function (e) {
                L.DomEvent.stopPropagation(e);
            });
            L.DomEvent.addListener(link, 'dblclick', function (e) {
                L.DomEvent.stopPropagation(e);
            });

        },

        /**
        *展开或隐藏控件
        *@method _expandOrCollapse
        *@private
        */
        _expandOrCollapse: function () {
            //判断是否打开了地图切换，若打开则关闭。二者为互斥事件
            var basemapEle = $(".baselayer-control");
            if (basemapEle.hasClass("leaflet-control-layers-open"))
            {
                basemapEle.removeClass("leaflet-control-layers-open");
                $(".baselayer-control .leaflet-control-layers-list").fadeOut(500);
            }


            if (L.DomUtil.hasClass(this.container, 'time-selector-open'))
            {
                L.DomUtil.removeClass(this.container, 'time-selector-open');
                $("#time-selector").fadeOut(500);
            }
            else
            {
                L.DomUtil.addClass(this.container, 'time-selector-open');
                $("#time-selector").fadeIn(600);
            }
                
        },


        /**
        *创建图层选择菜单
        *@method _creatLayerSelect
        *@private
        */
        _creatLayerSelect: function (options) {
            for (var i = 0; i < options.timeLayers.length; i++) {
                var label = document.createElement("label");
                var input = document.createElement("input");
                input.type = 'radio';
                input.name = options.id + '-' + 'radio';
                if (i == 0) {
                    input.checked = true;
                    this.addparameters.type = options.timeLayers[0].id;
                }
                input.className = 'radio-type-selector';
                var span = document.createElement("span");
                span.innerHTML = '' + options.timeLayers[i].name;
                label.appendChild(input);
                label.appendChild(span);
                $(this.typegroup).append(label);
                L.DomEvent.on(input, 'click', this._inputClick, this);
            }


        },
        /**
        *服务类型选择change事件
        *@method _inputClick
        *@private
        */
        _inputClick: function () {
            var input;
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            inputs = this.container.getElementsByTagName('input');
            inputsLen = inputs.length;
            for (var i = 0; i < inputsLen; i++) {
                input = inputs[i];
                if (input.checked) {
                    this.addparameters.type = this.parameters.timeLayers[i].id;
                    if (this._map.getLayer(this.parameters.timeLayers[i].id) == null) {
                        this._addLayer();
                    }
                }
                else if (!input.checked && this._map.getLayer(this.parameters.timeLayers[i].id) != null) {
                    this._map.removeLayer(this.parameters.timeLayers[i].id);
                }

            }
        },
        /**
        *时间选择器初始化
        *@method _inputClick
        *@private
        */
        _initYearSelector: function () {
            var endNum = this.options.maxNum;
            var startNum = this.options.maxNum - this.options.numCount + 1;
            if (startNum < this.options.minNum)
                startNum = this.options.minNum;

            this.parameters.year = endNum;
            this._createYearBlocks(startNum, endNum, this.parameters.year);
        },
        /**
        *创建年份界面
        *@method _createYearBlocks
        *@private
        */
        _createYearBlocks: function (start, end, current) {
            var $yearAxis = $(this.container).find('.yearselector-axis');
            $yearAxis.children().remove();
            for (var i = start; i <= end; i++) {
                var $yearBlock = $(this.yearSelectorHtml);
                var $year = $yearBlock.find('.yearselector-year');
                $year.attr('value', i);
                $year.html(i);
                $yearAxis.append($yearBlock);
                L.DomEvent.on($yearBlock[0], 'click', this._yearClick, this);
                if (i == current) {
                    $year.addClass('selected');
                    this.addparameters.year = i;
                }
            }

        },
        /**
        *点击年份切换
        *@method _yearClick
        *@private
        */
        _yearClick: function (e) {
            var year = e.target.innerHTML;
            this.addparameters.year = year;
            /*高亮显示选中的年份*/
            $(this.container).find('.yearselector-year.selected').removeClass('selected');
            $(e.target).addClass('selected');
            this._addLayer();
        },
        /**
        *下一年事件
        *@method _nextYearClick
        *@private
        */
        _nextYearClick: function () {
            if (this.addparameters.year < this.options.maxNum) {
                this.addparameters.year = parseInt(this.addparameters.year) + 1;
                $(this.container).find('.yearselector-year.selected').removeClass('selected');
                var selector = ".yearselector-year[value=" + this.addparameters.year + "]";
                var yearBlock = $(this.container).find(selector);
                if (yearBlock.length < 1) {
                    var end = this.addparameters.year + this.options.numCount - 1;
                    if (end > this.options.maxNum)
                        end = this.options.maxNum;

                    var start = end - this.options.numCount + 1;
                    if (end > this.options.maxNum)
                        end = this.options.maxNum;

                    this._createYearBlocks(start, end, this.addparameters.year);
                }
                else {
                    $(yearBlock).addClass('selected');
                }
                this._addLayer();
            }
        },
        /**
        *上一年事件
        *@method _preYearClick
        *@private
        */
        _preYearClick: function () {
            if (this.addparameters.year > this.options.minNum) {
                this.addparameters.year = this.addparameters.year - 1.0;

                $(this.container).find('.yearselector-year.selected').removeClass('selected');
                var selector = ".yearselector-year[value=" + this.addparameters.year + "]";
                var yearBlock = $(this.container).find(selector);
                if (yearBlock.length < 1) {
                    var start = this.addparameters.year - this.options.numCount + 1;
                    if (start < this.options.minNum)
                        start = this.options.minNum;

                    var end = start + this.options.numCount - 1;
                    if (end > this.options.maxNum)
                        end = this.options.maxNum;

                    this._createYearBlocks(start, end, this.addparameters.year);
                } else {
                    $(yearBlock).addClass('selected');
                }
                this._addLayer();
            }
        },
        /**
        *叠加图层服务
        *@method _addLayer
        *@private
        */
        _addLayer: function () {
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
           for (var i = 0; i < this.parameters.timeLayers.length; i++) {
                if (this.addparameters.type == this.parameters.timeLayers[i].id) {
                    this.addparameters.name = this.parameters.timeLayers[i].name;
                    for (var j = 0; j < this.parameters.timeLayers[i].layers.length; j++) {
                        if (this.parameters.timeLayers[i].layers[j].year == this.addparameters.year) {
                            this.addparameters.url = this.parameters.timeLayers[i].layers[j].url;
                            break;
                        }
                        else {
                            this.addparameters.url = null;
                        }
                    }
                }
            }
            if (this._map.getLayer(this.addparameters.type) != null) {
                this._map.removeLayer(this.addparameters.type);
                this.addLayerToMap(this.addparameters.url, {
                    id: this.addparameters.type,
                    opacity: 1,
                    proxyUrl: this.addparameters.url,
                    server:1,
                    layerName: this.addparameters.name,
                    name: this.addparameters.name + '-' + this.addparameters.year
                });
            }
            else {

                this.addLayerToMap(this.addparameters.url, {
                    id: this.addparameters.type,
                    opacity: 1,
                    server:1,
                    proxyUrl: this.addparameters.url,
                    layerName: this.addparameters.name,
                    name: this.addparameters.name+'-'+ this.addparameters.year

            });
            }
        },
        /**
        *叠加服务到地图
        *@method addLayerToMap
        *@param url {String} 服务地址
        *@param options {Object} 配置集
        */
        addLayerToMap: function (url, options) {
            L.dci.app.util.showLoading();
            if (url != null) {
                this._map.addLayer(url, options);
            }
            else {
                L.dci.app.util.dialog.error("提示", "该年份数据未配置或不存在！");
                L.dci.app.util.hideLoading();
            }
        },

    });
    return L.DCI.Controls.TimeSlider;

});


