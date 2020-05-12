/**
*动态图层图例样式
*@module controls
*@class DCI.Controls.DynamicLayerLegend
*@extends L.Control
*/
define("controls/dlLegend", [
    "leaflet",
    "leaflet/esri",
    "core/dcins",
    "data/ajax"
], function (L) {
    L.DCI.Controls.DynamicLayerLegend = L.Control.extend({
        htmlTemp: '<div class="controls-dynamiclayerlegend-nav-container">'
                    + '<div></div>'
                    + '<span>关闭</span>'
                    + '</div>'
                + '<div class="controls-dynamiclayerlegend-features-container"></div>',
        options: {
            layers: {},
            position: 'bottomright',
            currentLayer: ""
        },

        initialize: function (options) {
            this._layerMetadatas = {};
            this._layerDefs = "";
            L.setOptions(this, options);
            for (var name in this.options.layers) {
                var layer = this.options.layers[name];
                var obj = { "layer": layer };
                obj.layer = layer;
                this._layerMetadatas[name] = obj;
                var url = layer.url + "/" + layer.options.layers[0] + "?f=json&pretty=true";
                this._requestDefinition(name);
            }
        },

        onAdd: function (map) {
            return this.createUi(map);
        },
        onRemove: function (map) {

        },
        createUi: function (map) {
            this._map = map;
            var container = this._container = L.DomUtil.create('div', 'controls-dynamicLayerLegend-container', null);
            var $container = $(container);
            $container.html(this.htmlTemp);
            if (this._layerMetadatas != null) {
                var layerTabHtml = "";
                for (var i in this._layerMetadatas)
                    layerTabHtml += "<span>" + i + "</span>";
                var layerTabContainer = $container.find(".controls-dynamiclayerlegend-nav-container div");
                layerTabContainer.html(layerTabHtml);

                var closeSpan = $container.find('.controls-dynamiclayerlegend-nav-container > span')[0];
                L.DomEvent.on(closeSpan, 'click', this._closeClick, this);

                var layerTabs = $container.find('.controls-dynamiclayerlegend-nav-container div span');
                for (var n = 0; n < layerTabs.length; n++)
                    L.DomEvent.on(layerTabs[n], 'click', this._layerClick, this);

                /*设置当前图层*/
                var layerName = $container.find('.controls-dynamiclayerlegend-nav-container div span:first-child')[0].innerHTML;
                this.setCurrentLayer(layerName);
            }
            return container;
        },
        /*设置当前图层*/
        setCurrentLayer: function (layerName) {
            if (this._currentLayerName != layerName) {
                this._currentLayerName = layerName;
                this._layerDefs = "";
                var tabs = $(this._container).find('.controls-dynamiclayerlegend-nav-container div span');
                $(tabs).removeClass('controls-dynamiclayerlegend-nav-item-selected');
                for (var cname in this._layerMetadatas)
                    if (this._map.hasLayer(this._layerMetadatas[cname].layer))
                        this._map.removeLayer(this._layerMetadatas[cname].layer);

                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    if (tab.innerHTML == layerName) {
                        $(tab).addClass('controls-dynamiclayerlegend-nav-item-selected');
                        var currentLayer = this._layerMetadatas[layerName].layer;

                        var childLayer = currentLayer.getLayers()[0];
                        var layerDefsObj = {};
                        layerDefsObj[childLayer] = "";
                        currentLayer.setLayerDefs(layerDefsObj);

                        if (!this._map.hasLayer(currentLayer))
                            currentLayer.addTo(this._map);

                        var legends = this._layerMetadatas[layerName].legends;
                        if (legends != null) {
                            this._createLegendUi(legends, this);
                        } else {
                            this._requestLegend(currentLayer);
                        }
                        break;
                    }
                }
            }
        },
        _createLegendUi: function (legends, content) {
            var html = "";
            for (var j = 0; j < legends.length; j++) {
                var legend = legends[j];
                var label = legend.label.replace("\u003c", '').replace("\u003e", '');
                var contentType = legend.contentType;
                var imageData = legend.imageData;
                var src = "data:" + contentType + ";base64," + imageData;
                var div = L.DomUtil.create("div");
                var html = html + '<div><input type="checkbox" checked tag="' + label + '"/><img src="' + src + '" /><span>' + label + '</span></div>';
            }
            var $div = $(content._container).find('.controls-dynamiclayerlegend-features-container');
            $div.html(html);

            var checkBoxes = $(content._container).find('.controls-dynamiclayerlegend-features-container div input');
            for (var n = 0; n < checkBoxes.length; n++) {
                L.DomEvent.on(checkBoxes[n], 'click', content._legendChange, content);
            }
        },
        /*请求图层图例数据*/
        _requestLegend: function (layer) {
            var content = this;
            var url = layer.url + "/legend?f=json&pretty=true";
            $.ajax({
                url: url,
                data: null,
                async: false,
                dataType: "jsonp",
                success: function (data) {
                    for (var i = 0; i < data.layers.length; i++) {
                        var layer = data.layers[i];
                        if (layer.layerName == content._currentLayerName) {
                            //加载当前图层的图例
                            var legends = layer.legend;
                            content._layerMetadatas[content._currentLayerName].legends = legends;
                            content._createLegendUi(legends, content);
                            break;
                        }
                    }
                },
                error: function () { }
            });
        },
        /*获取图层渲染设置信息*/
        _requestDefinition: function (layerName) {
            var layer = this.options.layers[layerName];
            var url = layer.url + "/" + layer.options.layers[0] + "?f=json&pretty=true";
            var content = this;
            $.ajax({
                url: url,
                data: null,
                async: false,
                dataType: "jsonp",
                success: function (data) {
                    var definitionExpression = data.definitionExpression;
                    var type = data.drawingInfo.renderer.type;
                    var filed = data.drawingInfo.renderer.field1;
                    var uniqueValueInfos = data.drawingInfo.renderer.uniqueValueInfos;
                    var renderer = { "type": type, "field": filed, "uniques": uniqueValueInfos }
                    content._layerMetadatas[layerName].renderer = renderer;
                },

                error: function () {

                }
            });
        },
        _error: function (e) {

        },
        _layerClick: function (e) {
            var layerName = e.target.innerHTML;
            this.setCurrentLayer(layerName);
        },
        _closeClick: function (e) {
            $(this._container).remove();
        },
        _legendChange: function (e) {
            var c = e.target.checked;
            var tag = $(e.target).attr("tag");
            var metadata = this._layerMetadatas[this._currentLayerName];
            var layer = metadata.layer;
            var renderer = metadata.renderer;
            if (renderer.type == "uniqueValue") {
                var field = renderer.field;
                var checkboxs = $(this._container).find('.controls-dynamiclayerlegend-features-container div input');

                if (checkboxs != null && checkboxs.length > 0) {
                    var layerDefs = "";
                    for (var c = 0; c < checkboxs.length; c++) {
                        var checkbox = checkboxs[c];
                        if (checkbox.checked) {
                            var value = this._getUiqueRenderValue($(checkbox).attr("tag"), renderer.uniques);
                            if (value != null) {
                                var def = field + "='" + value + "'";
                                layerDefs = layerDefs + " or " + def;
                                layerDefs = layerDefs.trim();
                            }
                        }
                    }

                    if (layerDefs.indexOf("or") == 0)
                        layerDefs = layerDefs.substring(2, layerDefs.length).trim();

                    if (layerDefs.lastIndexOf("or") == layerDefs.length - 2)
                        layerDefs = layerDefs.substring(0, layerDefs.lastIndexOf('or'));

                    this._layerDefs = layerDefs = layerDefs.trim();
                    if (layerDefs != null && layerDefs.length > 0) {
                        var childLayer = layer.getLayers()[0];
                        var layerDefsObj = {};
                        layerDefsObj[childLayer] = layerDefs;
                        layer.setLayerDefs(layerDefsObj);
                    }
                }
            }
        },
        _getUiqueRenderValue: function (label, uniques) {
            for (var i = 0; i < uniques.length; i++) {
                var unique = uniques[i];
                if (unique.label == label) {
                    return unique.value;
                }
            }
        }
    });
    return L.DCI.Controls.DynamicLayerLegend;
});