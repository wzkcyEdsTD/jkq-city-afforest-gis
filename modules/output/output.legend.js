/**
*地图打印图例类
*@module modules.output
*@class DCI.OutputLegend
*@constructor initialize
*/
define("output/legend", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.OutputLegend = L.Class.extend({

        /**
        *保存所有的图层，以及图例 
        *@property layers
        *@type {Object}
        */
        layers: null,
        /**
        *保存所有图例
        *@property legends
        *@type {Object}
        */
        legends: null,

        legendshow: null,

        currentLayers:null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (map, container, legendshow) {
            this.map = map;
            this.layers = {};
            this.legends = [];
            this.currentLayers = [];
            this.legendshow = legendshow;
            this.container = L.DomUtil.create('div', 'output-legend-control', container);
            this.body = $("<div id = 'legend-ul-pr' class='body'></div>");

            $(this.container).append(this.body);

            this.map.on('layeradd layerremove', this._layerAdd, this);

            //this._legendAdd();

            return this.container;
        },
        /**
        *添加图层触发
        *@method _layerAdd
        *@private
        */
        _layerAdd: function (o) {
            var eventType = o.type;
            if (!o.layer.options || !o.layer.options.id) return;
            if (eventType == 'layeradd') {
                if (!this.layers[o.layer.options.id]) {
                    this._legend(o.layer);
                    this.currentLayers[o.layer.options.id]=o.layer;
                } else {
                    this.layers[o.layer.options.id].show = true;
                    this._setLegend();
                }
            } else {
                if (!this.layers[o.layer.options.id]) return;
                this.layers[o.layer.options.id].show = false;
                this._setLegend();
            }
        },
        /**
        *添加图例
        *@method _legendAdd
        *@private
        */
        _legendAdd: function () {
            this.map.eachLayer(function (layer) {
                if (layer.options && layer.options.id&&layer.options.id!="baseLayer") {
                    this._legend(layer);
                }
            }, this);
        },
        /**
        *请求图例
        *@method _legend
        *@private
        */
        _legend: function (layer) {
            L.esri.request(layer.url + 'legend', {}, function (error, response) {
                if (error) {
                    console.log(error);
                } else {
                    var _layers = response.layers;
                    if (_layers.length == 0) return;
                    this.layers[layer.options.id] = { value: _layers, show: true };
                    this._setLegend(_layers,layer);

                }
            }, this);
        },
        /**
        *保存图例
        *@method _setLegend
        *@param layer {String} 图层
        *@private
        */
        _setLegend: function (layer,mapLayer) {
            if (!layer) {
                this.legends = [];
                this.legendshow.clear();
                for (var i in this.layers) {
                    if (this.layers[i].show) {
                        var _layers = this.layers[i].value;
                        for (var j = 0, k = _layers.length; j < k; j++) {
                            var addedLayer = this.currentLayers[i];
                            var layerIndex = addedLayer.options.layers[0];
                            if (_layers[j].legend && layerIndex == _layers[j].layerId) {
                                for (var l = 0, m = _layers[j].legend.length; l < m; l++) {
                                    this.legends.push(_layers[j].legend[l]);
                                    this.legendshow.addLegend(_layers[j].legend[l]);
                                }
                            }
                        }
                    }
                }

            } else {
                var layerIndex = mapLayer.options.layers[0];
                for (var j = 0, k = layer.length; j < k; j++) {
                    if (layer[j].legend && layerIndex == layer[j].layerId) {
                        for (var l = 0, m = layer[j].legend.length; l < m; l++) {
                            if (layer[j].legend[l].label == "" || layer[j].legend[l].label == '<all other values>')
                                layer[j].legend[l].label = layer[j].layerName;
                            else
                                layer[j].legend[l].label = layer[j].layerName + "_" + layer[j].legend[l].label;
                            this.legends.push(layer[j].legend[l]);
                            this.legendshow.addLegend(layer[j].legend[l]);
                        }
                    }
                }
            }
            //更新图例
            this._showLegend(this._getLegend());
        },
        //前面都是初始化
        /**
        *添加图例
        *@method _getLegend
        *@private
        */
        _getLegend: function () {
            var legends = [];

            var legend = [];
            var end = this.legends.length;
            var k = 0;
            var kmax = parseInt(end / 3) + 1;
            var kle =end % 3;
            for (var i = 0; i < end; i++) {
                var label = this.legends[i].label;
                var src = 'data:' + this.legends[i].contentType + ';base64,' + this.legends[i].imageData;
                var li = '<li><input type="checkbox" checked="checked" class="legend_checkbox" id="legend_checkbox_' + i.toString() + '"/>' +
                    '<img src=' + src + ' ></img><label  title =" ' + label + '">' + label + '</label></li>';

                legend.push(li);
                k++;
                if ((k == kmax && kle > 0) || (k == kmax - 1 && kle <= 0) || i == end - 1) {
                    var ul = $('<ul class = "ul-legend" >' + legend.join(' ') + '</ul>');
                    legends.push(ul);
                    k = 0;
                    kle--;
                    legend = [];
                    continue;
                }
            }
            
            return legends;
        },
        /**
        *显示图例
        *@method _showLegend
        *@private
        */
        _showLegend: function (array) {
            if (!array) return;
            this.body.html(array);
            $(".legend_checkbox").on("click", { obj: this }, this.checkChange);
        },
        /**
        *勾选触发
        *@method checkChange
        *@private
        */
        checkChange: function (e) {
            var i = parseInt(e.currentTarget.id.substr(16));
            if (e.currentTarget.checked)
                e.data.obj.legendshow.addLegend(e.data.obj.legends[i]);
            else
                e.data.obj.legendshow.removeLegend(e.data.obj.legends[i]);
        }
    });
    L.dci.outputlegend = function (map,container,legendshow) {
        return new L.DCI.OutputLegend(map,container,legendshow);
    }

    //========================================================================================

    L.DCI.OutputLegendShow = L.Class.extend({

        //保存所有图例
        legends: null,

        initialize: function (container) {

            this.legends = [];

            this.container = L.DomUtil.create('div', 'output-legend-show', container);
            this.body = $("<div id = 'legend-ul-pr-show' class='body-show'></div>");

            $(this.container).append(this.body);

            return this.container;
        },
        indexOf: function (legend) {
            var i = 0;
            for (; i < this.legends.length; i++) {
                if (this.legends[i].label == legend.label) break;
            }
            if (i == this.legends.length) return -1;
            return i;
        },
        addLegend: function (legend) {
            if (this.indexOf(legend) == -1) {
                this.legends.push(legend);
                this.updateShow();
            }
        },
        removeLegend: function (legend) {
            var i = this.indexOf(legend);
            if (i != -1) {
                this.legends.splice(i, 1);
                this.updateShow();
            }
        },
        clear: function () {
            this.legends.splice(0, this.legends.length);
            this.updateShow();
        },
        updateShow: function () {

            var legends = [];

            var legend = [];
            var end = this.legends.length > 9 ? 9 : this.legends.length;
            var k = 0;
            var kmax = parseInt(end / 3) + 1;
            var kle = end % 3;
            for (var i = 0; i < end; i++) {
                var label = this.legends[i].label;
                var src = 'data:' + this.legends[i].contentType + ';base64,' + this.legends[i].imageData;
                var li = '<li><img src=' + src + ' ></img><label  title =" ' + label + '">' + label + '</label></li>';

                legend.push(li);
                k++;
                if ((k == kmax && kle > 0) || (k == kmax - 1 && kle <= 0) || i == end - 1) {
                    var ul = $('<ul class = "ul-legend-show" >' + legend.join(' ') + '</ul>');
                    legends.push(ul);
                    k = 0;
                    kle--;
                    legend = [];
                    continue;
                }
            }
            this.body.html(legends);
        }
    });
    L.dci.outputlegendshow = function (container) {
        return new L.DCI.OutputLegendShow(container);
    }
});