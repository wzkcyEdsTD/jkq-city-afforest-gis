/**
*地图打印类
*@module modules.output
*@class DCI.Print
*@constructor initialize
*/
define("output/print", [
    "leaflet",
    "core/dcins",
    "core/map",
    "plugins/print",
    "output/legend",
    "leaflet/label",
    "common/plotting"
], function (L) {

    L.DCI.Print = L.Class.extend({
        /**
       *打印类型
       *@property model
       *@type {Object}
       */
        model: null,
        /**
       *地图对象
       *@property _map
       *@type {Object}
       *@private
       */
        _map: null,
        /**
       *容器
       *@property _container
       *@type {Object}
       *@private
       */
        _container: null,
        /**
       *图层控件
       *@property _layerControl
       *@type {Object}
       *@private
       */
        _layerControl: null,
        /**
       *图例
       *@property _legend
       *@type {Object}
       *@private
       */
        _legend: null,
        /**
       *图例设置
       *@property _legendset
       *@type {Object}
       *@private
       */
        _legendset: null,
        isinfotemp: true,

        username: "",
        printtime: "",
        /**
        *显示选择界面
        *@method show
        */
        show: function () {
            var user = L.dci.app.util.user.getCurUser();
            if (user) this.username = user.name;
            var date = new Date();
            this.printtime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            this.model = L.DomUtil.get("print_model");
            if (this.model == null) {
                this.model = L.DomUtil.create("div", "print_model", document.body);
                this.model.id = "print_model";
                //居中
                var l = parseInt(document.body.clientWidth / 2 - 200);
                var t = parseInt(document.body.clientHeight / 2 - 150);
                $("#print_model").css("left", l);
                $("#print_model").css("top", t);
                this.modelUi();
            }
            else {
                $("#print_model").show();
            }
        },
        /**
        *创建界面
        *@method modelUi
        */
        modelUi: function () {
            var html = [];
            html.push('<div class="panel panel-default"  style="height:100%;border-radius:4px;">');
            html.push('<div class="panel-heading" id="panel-heading" style="border-top-left-radius:4px;border-top-right-radius:4px;>');
            html.push('<h3 class="panel-title" style="cursor:default;">请选择打印模板</h3>');
            html.push('<span class="icon-close2 print_model_close" id="print_model_close" ></span>');
            html.push('</div>');
            html.push('<div class="panel-body">');
            html.push('<div class="print_model_blank"></div>');
            html.push('<div class="print_model_info"><span class="icon-flag"></span><span class="icon-edit"></span></div>');
            html.push('<div class="print_model_blank_text">空白模板</div>');
            html.push('<div class="print_model_info_text">基本信息模板</div>');
            html.push('<div class="print_model_ok"><button type="button" class="btn btn-info" id="print_model_ok">确定</button></div>');
            html.push('</div>');
            this.model.innerHTML = html.join('');

            L.dci.app.util._drag("print_model", "panel-heading");

            $("#print_model_close").on("click", { obj: this }, function () {
                $("#print_model").hide();
            });
            $(".print_model_blank").on("click", { obj: this }, function (e) {
                $(".print_model_blank").css("border-color", "#f05028");
                $(".print_model_info").css("border-color", "#a0a0a0");
                $(".print_model_info .icon-flag").css("color", "#a0a0a0");
                e.data.obj.isinfotemp = false;
            });
            $(".print_model_info").on("click", { obj: this }, function (e) {
                $(".print_model_info").css("border-color", "#f05028");
                $(".print_model_info .icon-flag").css("color", "#f05028");
                $(".print_model_blank").css("border-color", "#a0a0a0");
                e.data.obj.isinfotemp = true;
            });
            $("#print_model_ok").on("click", { obj: this }, function (e) {
                $("#print_model").hide();
                if (e.data.obj.isinfotemp) {
                    e.data.obj.preview();
                }
                else {
                    e.data.obj.previewblank();
                }
                e.stopPropagation();
            });
        },

        //==========================================================================================
        /**
        *空白模板预览
        *@method previewblank
        */
        previewblank: function () {
            this._containerblank = L.DomUtil.get("print_container_blank");
            this._mapblank = L.DCI.App.pool.get("print_map_obj_blank");
            if (this._containerblank == null) {
                this._containerblank = L.DomUtil.create("div", "print_container", document.body);
                this._containerblank.id = "print_container_blank";
                this._setUiBlank();
                this._mapblank = this._addMap("print_map_obj_blank", "print_map_blank");
            } else {
                $("#print_container_blank").show();
            }
            this._setMap(this._mapblank,"print_map_obj_blank");
        },
        /**
        *空白模板预览界面
        *@method _setUiBlank
        *@private
        */
        _setUiBlank: function () {
            var content = L.DomUtil.create("div", "print_content_blank", this._containerblank);
            content.id = "print_content_blank";

            var con = L.DomUtil.create("div", "print_map_blank", content);
            con.id = "print_map_blank";

            var bt = L.DomUtil.create("div", "no-print print_button_blank", content);
            html = [];
            html.push('<button type="button" class="btn btn-default" id="print_close_blank">取消</button>');
            html.push('<button type="button" class="btn btn-info" id="print_todo_blank">打印</button>');

            bt.innerHTML = html.join('');

            $("#print_todo_blank").click(function () {
                $("#print_content_blank").print();
            });
            $("#print_close_blank").click(function () {
                $("#print_container_blank").hide();
            });
        },
        /**
        *添加地图
        *@method _addMap
        *@private
        */
        _addMap: function (mapId,containerId) {
            try {
                var map = new L.DCI.Map({
                    id: mapId,
                    container: containerId,
                    navigationControl: false,
                    panControl: false,
                    zoomControl: false,
                    defaultExtentControl: false,
                    miniMapControl: false,
                    scalebarControl: false,
                    layerSwitchControl: false,
                    loadingControl: false,
                    sidebarControl: false,
                    timesliderControl:false,
                    contextmenu: false,

                    baseCrs: Project_ParamConfig.crs,
                    baseLayer: Project_ParamConfig.baseLayer,
                    changeLayers: Project_ParamConfig.changeLayers,
                    tileSize: Project_ParamConfig.baseLayer.tileSize || 512,
                    minZoom: Project_ParamConfig.baseLayer.minZoom || 0,
                    maxZoom: Project_ParamConfig.baseLayer.maxZoom || 10,
                    zoom: Project_ParamConfig.baseLayer.zoom || 0
                });
                L.DCI.App.pool.add(map);
                return map;
            } catch (e) {
            }
        },

        //==========================================================================================
        /**
        *预览界面
        *@method preview
        */
        preview: function () {
            this._container = L.DomUtil.get("print_container");
            this._map = L.DCI.App.pool.get("print_map_obj");
            this._legend = L.DCI.App.pool.get("print_legend_obj");
            this._legendset = L.DCI.App.pool.get("print_legendset_obj");
            this._layerControl = L.DCI.App.pool.get("print_layers_obj");
            if (this._container == null) {
                this._container = L.DomUtil.create("div", "print_container", document.body);
                this._container.id = "print_container";
                this._setUi();
                this._map=this._addMap("print_map_obj", "print_map");
                this._addLegend();
            } else {
                $("#print_container").show();
            }
            this._setLegend();
            this._setMap(this._map,"print_map_obj");

        },
        /**
        *设置界面
        *@method _setUi
        *@private
        */
        _setUi: function () {
            var content = L.DomUtil.create("div", "print_content", this._container);
            content.id = "print_conent";
            var control = L.DomUtil.create("div", "print_control", this._container);
            control.id = "print_control";
            control.style.display = "none";

            var title = L.DomUtil.create("div", "print_title", content);
            title.id = "print_title";
            var html = [];
            html.push('<div class="input-group"><input type="text" class="form-control" placeholder="请输入地图名称" id="print_text" style="width:100%;box-shadow:none;font-size:20px;" /></div>');
            title.innerHTML = html.join('');
            var con = L.DomUtil.create("div", "print_map", content);
            con.id = "print_map";

            var bz = L.DomUtil.create("div", "print_bz", content);
            bz.id = "print_bz";

            var bt = L.DomUtil.create("div", "no-print print_button", content);
            html = [];
            html.push('<button type="button" class="btn btn-default" id="print_close">取消</button>');
            html.push('<button type="button" class="btn btn-info" id="print_todo">打印</button>');

            bt.innerHTML = html.join('');

            //打印人，打印时间
            var info = L.DomUtil.create("div", "print_info", bz);
            info.id = "print_info";
            html = [];
            html.push('<div style="margin-top:15px;margin-left:5px;"><font style="color:gray;">打印人：</font><br/>' + this.username + '</div>');
            html.push('<p />');
            html.push('<div style="margin-top:5px;margin-left:5px;"><font style="color:gray;">打印时间：</font><br/>' + this.printtime + '</div>');
            info.innerHTML = html.join('');

            //图例
            var legend = L.DomUtil.create("div", "print_legend", bz);
            legend.id = "print_legend";
            var lab = L.DomUtil.create("div", "print_legend_lab", legend);
            lab.id = "print_legend_lab";
            lab.innerHTML = "图<br/>例";
            var leg = L.DomUtil.create("div", "print_legend_leg", legend);
            leg.id = "print_legend_leg";

            var legendset = L.DomUtil.create("div", "print_legendset", control);
            legendset.id = "print_legendset";
            var setlab = L.DomUtil.create("div", "print_legendset_lab", legendset);
            setlab.id = "print_legendset_lab";
            setlab.innerHTML = "请选择要显示的图例";
            var setleg = L.DomUtil.create("div", "print_legendset_leg", legendset);
            setleg.id = "print_legendset_leg";

            var close = L.DomUtil.create("div", "print-close icon-close2", control);
            close.id = "print_close_control";
            //var textset = L.DomUtil.create("div", "print_textset", control);
            //textset.id = "print_textset";
            //html = [];
            //html.push('<textarea class="form-control" id="print_textarea" rows="3" placeholder="请输入备注信息"></textarea>');
            //textset.innerHTML = html;

            $("#print_todo").click(function () {
                $("#print_conent").print();
            });
            $("#print_close").click(function () {
                $("#print_container").hide();
            });

            $("#print_legend_lab").click(function() {
                $("#print_control").css("display", "");
            });

            $("#print_close_control").click(function () {
                $("#print_control").css("display", "none");
            });
        },
        /**
        *添加图例
        *@method _addLegend
        *@private
        */
        _addLegend: function () {
            //添加图例
            var legend = L.DomUtil.get("print_legend_leg");
            this._legend = L.dci.outputlegendshow(legend);
            this._legend.id = "print_legend_obj";
            L.DCI.App.pool.add(this._legend);

            var legendset = L.DomUtil.get("print_legendset_leg");
            this._legendset = L.dci.outputlegend(this._map.map, legendset, this._legend);
            this._legendset.id = "print_legendset_obj";
            L.DCI.App.pool.add(this._legendset);
        },
        /**
        *设置图例
        *@method _setLegend
        *@private
        */
        _setLegend: function () {
            if (this._legend)
                this._legend.body.html('');
            if (this._legendset)
                this._legendset.body.html('');
        },
        /**
        *设置地图
        *@method _setMap
        *@private
        */
        _setMap: function (mapObj,id) {
            if (document.getElementById("print_text"))
                document.getElementById("print_text").value = "";
            var activeMap = L.DCI.App.pool.get("MultiMap").getActiveMap().getMap();
            var zoom = activeMap.getZoom();
            var center = activeMap.getCenter();
            var printLayer = L.DCI.App.pool.get(id).getHighLightLayer();
            printLayer.clearLayers();
            if (this._layerControl != null)
                this._layerControl.clearLayer();
            mapObj.map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id != null) {
                    mapObj.map.removeLayer(layer);
                }
            }, this);
            mapObj.map.whenReady(function () {
                mapObj.map.setView(center, zoom);
                activeMap.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != "baseLayer" && layer.options.id != null) {
                        var url = layer.url;
                        var options = {
                            id: "print_" + layer.options.id,
                            opacity: layer.options.opacity,
                            layers: layer.options.layers,
                            layerType: layer.options.layerType,
                            name: layer.options.name
                        }
                        var lay = null;
                            lay = L.esri.dynamicMapLayer(url, options);
                            lay.addTo(mapObj.map);
                        //if (layer.options.layerType == "1") {
                        //    lay = L.esri.dynamicMapLayer(url, options);
                        //    lay.addTo(mapObj.map);
                        //} else {
                        //    lay = new L.esri.Layers.TiledMapLayer(url, { id: options.id, name: options.name, tileSize: layer.tileSize, continuousWorld: true });
                        //    lay.addTo(mapObj.map);
                        //}
                        //添加到图层列表
                        this.addToLayerList(mapObj,options.name, lay);
                    } else if (layer._latlng || layer._latlngs) {
                        //点图层显示不出来，单独重新创建
                        var geoType = layer.toGeoJSON().geometry.type;
                        if (geoType=="Point" && layer._icon) {
                            var _poly = L.marker(layer._latlng);
                            if (layer.options.mypopup) {
                                _poly.options.icon = new L.Icon({
                                    iconUrl: layer.options.icon.options.iconUrl,
                                    iconSize: L.DCI.App.symbol.pointSymbol_2.iconSize,
                                    iconAnchor: [L.DCI.App.symbol.pointSymbol_2.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol_2.iconSize[1]]
                                });
                                _poly.options.mypopup._tooltip = layer.options.mypopup._tooltip;
                            }
                            else {
                                _poly.options.icon = new L.Icon({
                                    iconUrl: L.DCI.App.symbol.pointSymbol.iconUrl,
                                    iconSize: L.DCI.App.symbol.pointSymbol.iconSize,
                                    iconAnchor: [L.DCI.App.symbol.pointSymbol.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol.iconSize[1]]
                                });
                            }
                            _poly.addTo(mapObj.map);
                            //if (layer.options.mypopup._titles!=null &&　layer.options.mypopup._titles != "") {
                            //    var plotting = new L.DCI.plotting();
                            //    plotting.showtooltip(layer, mapObj.map);
                            //}
                        }
                        else if (geoType == "Point" && layer._radius) {
                            L.circle(layer.getLatLng(), layer.getRadius(), layer.options).addTo(printLayer);
                        }
                        else if (geoType == "Polygon") {
                            L.polygon(layer.getLatLngs(), layer.options).addTo(printLayer);
                        }
                        else if (geoType == "LineString") {
                            L.polyline(layer.getLatLngs(), layer.options).addTo(printLayer);
                        }
                    }
                }, this);
            }, this);
        },
        /**
        *添加图层到列表中
        *@method addToLayerList
        *@param name {String} 图层名称
        *@param lay {Object} 图层
        */
        addToLayerList: function (mapObj, name, lay) {
            //图层列表
            var layer = { "图层": {} };
            layer["图层"][name] = lay;
            if (this._layerControl == null) {
                this._layerControl = L.dci.groupedLayers({}, layer, null);
                this._layerControl.id = "print_layers_obj";
                mapObj.map.addControl(this._layerControl);
                L.DCI.App.pool.add(this._layerControl);
                $(".leaflet-control-layers-toggle").addClass("no-print");
            } else {
                this._layerControl.addOverlay(lay, name);
            }
        }
    });

    L.dci.print = function () {
        return new L.DCI.Print();
    }
})