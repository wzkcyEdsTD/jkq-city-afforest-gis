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
            name: null,//服务名称
            layerType: null//服务类型
        },
        /**
        *存放年份数组
        */
        yearArr: [],
        /**
        *当前时间轴显示年份
        */
        yearcurrent: [],
        /**
        *当前时间轴未显示年份，大于当前时间轴最大年份
        */
        yearShowup: [],
        /**
        *当前时间轴未显示年份，小于当前时间轴最小年份
        */
        yearShowdown: [],
        /**
        *选择图层类型集合
        **/
        _layers: [],
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
            //var date = new Date();
            //var lastyear = date.getFullYear();
            //this.options.maxNum = lastyear;
            //this.options.minNum = 2000;
            this.parameters = L.setOptions(this, options);
            this.addparameters = {};
        },
        /**
       *添加到地图
       *@method onAdd
       *@param map {Object} 地图对象
       */
        onAdd: function (map) {
            this._map = map;
            this.layers = {};
            this.yearArr = [];
            this._creatUi();
            this._initYearSelector(this.yearArr);
            return this.container;
        },
        /**
        *创建主视图
        *@method _creatUi
        *@private
        *先创建地图选择_creatLayerSelect后你创建时间轴_initYearSelector()
        */
        _creatUi: function () {
            var mapId = this._map.options.id;
            var conclass = 'timeslider-control';
            this.container = L.DomUtil.create('div', conclass);
            this.container.id = mapId + "-timeslider-control";
            this.container.style.display = 'none';
            var link = this._layersLink = L.DomUtil.create('a', conclass + '-toggle', this.container);
            
            //link.id = mapId + '$' + conclass + '-toggle';
            link.id =  conclass + '-toggle';
            link.href = '#';
            link.title = '时间轴展示';
            this.silider = $('<div style="display:none;" id="' + mapId + '-time-selector" class="time-selector"><div class="yearselector-container"><span id="preYear-select" class="yearselector-switch icon-arrows"></span><div class="yearselector-axis" id="' + mapId + '-yearselector-axis"></div><span id="nextYear-select" class="yearselector-switch icon-arrows-right"></span></div></div>');
            this.typegroup = $('<div id="type-select" class="type-group-selector"></div>');
            var tipHtml = $('<span class="timeslider-tip"></span>');
            $(this.container).append(this.silider);
            $(this.silider).append(this.typegroup);
            $(this.silider).append(tipHtml);
            this._creatLayerSelect(this.parameters);
            this._initYearSelector(this.yearArr);
            var preYear = $(this.silider).find('.icon-arrows')[0];
            var nextYear = $(this.silider).find('.icon-arrows-right')[0];
            L.DomEvent.on(link, 'click', this._expandOrCollapse, this);
            L.DomEvent.on(preYear, 'click', this._preYearClick, this);
            L.DomEvent.on(nextYear, 'click', this._nextYearClick, this);
            L.DomEvent.addListener(link, 'click', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.addListener(link, 'dblclick', function (e) { L.DomEvent.stopPropagation(e); });
        },
        /**
        *展开或隐藏控件
        *@method _expandOrCollapse
        *@private
        */
        _expandOrCollapse: function () {
            var mapId = this._map.options.id;
            //判断是否打开了地图切换，若打开则关闭。二者为互斥事件
            var basemapEle = $("#" + mapId + "-baselayer-control");
            if (basemapEle.hasClass("leaflet-control-layers-open")) {
                basemapEle.removeClass("leaflet-control-layers-open");
                $("#" + mapId + "-baselayer-control .leaflet-control-layers-list").fadeOut(500);
            }
            //展开时间轴面板
            
            if (L.DomUtil.hasClass(this.container, 'time-selector-open')) {
                L.DomUtil.removeClass(this.container, 'time-selector-open');
                $("#" + mapId + "-time-selector").fadeOut(500);
            }
            else {
                L.DomUtil.addClass(this.container, 'time-selector-open');
                $("#" + mapId + "-time-selector").fadeIn(600);
            }
            //将打开时间轴的窗口选中
            switch (mapId) {
                case 'map':
                    L.DCI.App.pool.get('MultiMap')._clickEventOne();
                    break;
                case 'mapTow':
                    L.DCI.App.pool.get('MultiMap')._clickEventTow();
                    break;
                case 'mapThree':
                    L.DCI.App.pool.get('MultiMap')._clickEventThree();
                    break;
                case 'mapFour':
                    L.DCI.App.pool.get('MultiMap')._clickEventFour();
                    break;
                default:
                    break;

            };
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
                    this._layers = options.timeLayers[0].layers;
                    //this.addparameters.layerType =  _layer.layerType;
                    var layerarr = this.parameters.timeLayers[0].layers;
                    for (var j = 0; j < layerarr.length; j++) {
                        if (Number(layerarr[j].year)) {
                            this.yearArr.push(layerarr[j].year);
                            //this.yearArr[j] = layerarr
                            [j].year;
                        }
                    }
                }
                this._getYear(this.yearArr);
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
        获取不同服务类型最大最小年
        *@_yearArr
        */
        _getYear: function (_yearArr) {
            var max = _yearArr[0];
            var min = _yearArr[0];
            for (var i = 0; i < _yearArr.length; i++) {
                if (_yearArr[i] > max) {
                    max = _yearArr[i];
                }
            }
            for (var i = 0; i < _yearArr.length; i++) {
                if (_yearArr[i] < min) {
                    min = _yearArr[i];
                }
            }
            this.options.maxNum = max;
            this.options.minNum = min;

        },
        /**
        计算剩余年份
        *@_yearcurrent
        *@_yearArr
        */
        _countyearShow: function (_yearcurrent, _yearArr) {
            this.yearShowup = [];
            this.yearShowdown = [];
            if (_yearcurrent.length < _yearArr.length) {
                var yearShow_length = _yearArr.length - _yearcurrent.length;
                this._getYear(_yearcurrent);
                for (var i = 0; i < _yearArr.length; i++) {
                    if (_yearArr[i] > this.options.maxNum) {
                        this.yearShowup.push(_yearArr[i]);
                    }
                    else if (_yearArr[i] < this.options.minNum) {
                        this.yearShowdown.push(_yearArr[i]);
                    }
                }
            }
        },
        /**
        *服务类型选择change事件
        *@method _inputClick
        *@private
        */
        _inputClick: function () {
            var contain = $(".type-group-selector");
            this.yearArr = [];
            this.yearcurrent = [];

            var input;
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            inputs = this.container.getElementsByTagName('input');
            inputsLen = inputs.length;
            for (var i = 0; i < inputsLen; i++) {
                input = inputs[i];
                if (input.checked) {
                    this.addparameters.type = this.parameters.timeLayers[i].id;
                    this._layers = this.parameters.timeLayers[i].layers;
                    var layerarr = this.parameters.timeLayers[i].layers;
                    for (var j = 0; j < layerarr.length; j++) {
                        if (Number(layerarr[j].year)) {
                            this.yearArr.push(layerarr[j].year);
                            //this.yearArr[j] = layerarr [j].year;
                        }

                    }
                    this._getYear(this.yearArr);
                    this._initYearSelector(this.yearArr);
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
        _initYearSelector: function (_yeararr) {
            if (_yeararr.length > this.options.numCount) {
                var _arr = [];
                _yeararr.sort(function (a, b) { return b - a; });
                for (var i = 0; i < this.options.numCount; i++) {
                    _arr[i] = _yeararr[i];
                }
                _arr.sort();
                this._createYearBlocks(_arr, _arr[_arr.length - 1]);
            } else {
                this._createYearBlocks(_yeararr, _yeararr[_yeararr.length - 1]);
            }
        },
        /**
        *创建年份界面
        *@method _createYearBlocks
        *@private
        */
        _createYearBlocks: function (yeararr, current) {
            for (var j = 0; j < this._layers.length; j++) {
                if (this._layers[j].year == current) {
                    this.addparameters.layerType = this._layers[j].layerType;
                }
            }
            this.yearcurrent = [];
            var mapId = this._map.options.id;
            //var $yearAxis = $(this.container).find('.yearselector-axis');
            var $yearAxis = $(this.container).find('#' + mapId + '-yearselector-axis');
            $yearAxis.children().remove();
            var arrlength = 0;
            if (yeararr.length > this.options.numCount)
                arrlength = this.options.numCount;
            else {
                arrlength = yeararr.length;
            }
            for (var i = 0; i <= arrlength - 1; i++) {
                this.yearcurrent[i] = yeararr[i];
                var $yearBlock = $(this.yearSelectorHtml);
                var $year = $yearBlock.find('.yearselector-year');
                $year.attr('value', yeararr[i]);
                $year.html(yeararr[i]);
                $yearAxis.append($yearBlock);
                L.DomEvent.on($yearBlock[0], 'click', this._yearClick, this);
                if (yeararr[i] == current) {
                    $year.addClass('selected');
                    this.addparameters.year = yeararr[i];
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
            if (year != '') {
                this.addparameters.year = year;
                for (var j = 0; j < this._layers.length; j++) {
                    if (this._layers[j].year == year) {
                        this.addparameters.layerType = this._layers[j].layerType;
                    }
                }

            } else {
                L.dci.app.util.dialog.alert("温馨提示", "未选中年份数据！");
            }
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
            //if (this.addparameters.year <= this.options.maxNum) {
            this.yearArr.sort();
            this._countyearShow(this.yearcurrent, this.yearArr);
            this._getYear(this.yearcurrent);
            if (this.addparameters.year < this.options.maxNum) {
                for (var k = 0; k < this.yearcurrent.length; k++) {
                    if (this.yearcurrent[k] == this.addparameters.year) {
                        this.addparameters.year = this.yearcurrent[k + 1];
                        break;
                    }
                }
            } else {
                if (this.yearShowup.length > 0) {
                    this._getYear(this.yearShowup);
                    this.addparameters.year = this.options.minNum;
                }

            }
            $(this.container).find('.yearselector-year.selected').removeClass('selected');
            var selector = ".yearselector-year [value=" + this.addparameters.year + "]";
            var yearBlock = $(this.container).find(selector);
            if (yearBlock.length < 1) {
                if (this.yearShowup.length > 0) {
                    this._createYearBlocks(this.yearShowup, this.addparameters.year);
                }
            }
            else {
                $(yearBlock).addClass('selected');
            }
            this._addLayer();
            // }
        },
        /**
        *上一年事件
        *@method _preYearClick
        *@private
        */
        _preYearClick: function () {
            //if (this.addparameters.year >= this.options.minNum) {
            this.yearArr.sort();
            this._countyearShow(this.yearcurrent, this.yearArr);
            this._getYear(this.yearcurrent);
            if (this.addparameters.year > this.options.minNum) {
                for (var k = 0; k < this.yearcurrent.length; k++) {
                    if (this.yearcurrent[k] == this.addparameters.year) {
                        this.addparameters.year = this.yearcurrent[k - 1];
                        break;
                    }
                }
            } else {
                if (this.yearShowdown.length > 0) {
                    this._getYear(this.yearShowdown);
                    this.addparameters.year = this.options.maxNum;
                }
            }
            $(this.container).find('.yearselector-year.selected').removeClass('selected');
            var selector = ".yearselector-year[value=" + this.addparameters.year + "]";
            var yearBlock = $(this.container).find(selector);
            if (yearBlock.length < 1) {
                if (this.yearShowdown.length > 0) {
                    if (this.yearShowdown.length > this.options.numCount) {
                        var _arr = [];
                        this.yearShowdown.sort(function (a, b) { return b - a; });
                        for (var i = 0; i < this.options.numCount; i++) {
                            _arr[i] = this.yearShowdown[i];
                        }
                        _arr.sort();
                        this._createYearBlocks(_arr, this.addparameters.year);
                    } else {
                        this._createYearBlocks(this.yearShowdown, this.addparameters.year);
                    }
                }
            } else {
                $(yearBlock).addClass('selected');
            }
            this._addLayer();
            // }
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
                    server: 1,
                    layerName: this.addparameters.name,
                    name: this.addparameters.name + '-' + this.addparameters.year,
                    layerType: this.addparameters.layerType
                });
            }
            else {

                this.addLayerToMap(this.addparameters.url, {
                    id: this.addparameters.type,
                    opacity: 1,
                    server: 1,
                    proxyUrl: this.addparameters.url,
                    layerName: this.addparameters.name,
                    name: this.addparameters.name + '-' + this.addparameters.year,
                    layerType: this.addparameters.layerType
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
                L.dci.app.util.dialog.alert("温馨提示", "该年份数据未配置或不存在！");
                L.dci.app.util.hideLoading();
            }
        },

    });
    return L.DCI.Controls.TimeSlider;

});


