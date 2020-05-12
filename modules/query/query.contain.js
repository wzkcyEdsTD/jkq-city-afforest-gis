/*
类名：查询模块类
说明：弹出框模板html、id querycontain
引用类库：'leaflet'
"plugins/scrollbar":滚动条插件
*/

define("query/contain", [
    'leaflet',
    "core/dcins",
    "leaflet/draw",
    "plugins/icheck",
    "plugins/scrollbar",
    "analysis/addcad"
], function (L) {
    L.DCI.Contain = L.Class.extend({

        /*弹出样式模板HTML*/
        html: '<div id="query-choose-contain-id" class="query-choose-contain">'
              + '<div id="query-choose-header-contain-id"  class="query-choose-header-contain">'
              + '<span>分区查询</span>'
              + '<span class="icon-close2 query-choose-contain-close "></span>'
              + '</div>'
			  + '<div class="choose-style-choose">'
              + '<span class="choose-style-choose-name"></span>'
			  + '</div>'
              + '<div class="choose-style-choose-cs">'
              + '<span class="choose-style-choose-cs-name"></span>'
			  + '</div>'
			  + '<div class="choose-test-choose">'
              + '<span></span>'
			  + '<select>'
              + '</select>'
			  + '</div>'
              + '<span class="choose-attribute-choose-name"></span>'
              + '<div class="choose-attribute-choose">'
			  + '</div>'
			  + '<button>确定</button>'
		      + '</div>',

        /*类ID*/
        id: 'querycontain',

        /*选取服务地址*/
        url: '',

        /*地图*/
        _map: '',

        /*传出查询参数*/
        data: {
            query_style: null,        //选取方式
            query_geo: null,           //选取区域
            query_content: null,     //查询范围
            query_attribute: [],    //查询属性
        },

        _polygon: null,

        /*初始化*/
        initialize: function (_returndata) {
            if ($('.query-choose-contain').length == 0 && _returndata) {
                var _this = this;
                this._returndata = _returndata;
                $(".out-container").append(this.html);
                L.dci.app.util._drag("query-choose-contain-id", "query-choose-header-contain-id");   //拖拽方法
                $.get('modules/query/query.contain.xml', function (d) {         //读取配置文件
                    $(d).find('choose').each(function () {
                        var i = 0;
                        var _html = '';
                        $('.choose-style-choose span').html($(this).attr('name') + '：');
                        $(this).find('contain').each(function () {
                            i++;
                            if (i == 1) {
                                _html = _html + ' <a style="margin-left:5px;"><span class="' + $(this).attr('class') + '"></span><span style="margin-left: 5px;margin-right: 25px;">' + $(this).attr('name') + '</span></a>';
                            }
                            else {
                                _html = _html + ' <a><span class="' + $(this).attr('class') + '"></span><span style="margin-left: 5px;margin-right: 25px;">' + $(this).attr('name') + '</span></a>';
                            }
                        });
                        $('.choose-style-choose').append(_html);
                    });

                    $(d).find('choosecs').each(function () {
                        var i = 0;
                        var _html = '';
                        $('.choose-style-choose-cs span').html($(this).attr('name') + '：');
                        $(this).find('contain').each(function () {
                            i++;
                            if (i == 1) {
                                _html = _html + ' <a style="margin-left:5px;"><span class="' + $(this).attr('class') + '"></span><span style="margin-left: 5px;margin-right: 9px;">' + $(this).attr('name') + '</span></a>';
                            }
                            else {
                                _html = _html + ' <a><span class="' + $(this).attr('class') + '"></span><span style="margin-left: 5px;margin-right: 11px;">' + $(this).attr('name') + '</span></a>';
                            }
                        });
                        $('.choose-style-choose-cs').append(_html);
                    });

                    $(d).find('attribute').each(function () {
                        var i = 0;
                        var _html = '';
                        $('.choose-attribute-choose-name').html($(this).attr('name') + '：');
                        $(this).find('name').each(function () {
                            i++;
                            _html = _html + '<div class="choose-attribute-checkbox"><input type="checkbox"><span>' + $(this).attr('name') + '</span></div>';
                        });
                        $('.choose-attribute-choose').append(_html);
                        $(".choose-attribute-choose").mCustomScrollbar({
                            theme: "minimal-dark"
                        });
                        $('.choose-attribute-choose').find('input').each(function () {
                            $(this).iCheck({
                                checkboxClass: 'icheckbox_flat-red',
                            });
                        });
                    });

                    $(d).find('thirdchoose').each(function () {
                        var j = 0;
                        var _html_1 = '';
                        $('.choose-test-choose span').html($(this).attr('name') + '：');
                        _this.query = L.esri.Tasks.query($(this).attr('url'));
                        $(this).find('name').each(function () {
                            j++;
                            _html_1 = _html_1 + ' <option value ="' + j + '">' + $(this).attr('name') + '</option>';
                        });
                        $('.choose-test-choose select').append(_html_1);
                    });
                });


                $('.query-choose-contain-close').on('click', { obj: this }, this.close);
                $('.query-choose-contain button').on('click', { obj: this }, this.chooseresult);
                $('.choose-style-choose').off('click', 'a', { obj: this }, this.tool);
                $('.choose-style-choose').on('click', 'a', { obj: this }, this.tool);
                $('.choose-style-choose-cs').off('click', 'a', { obj: this }, this._tool);
                $('.choose-style-choose-cs').on('click', 'a', { obj: this }, this._tool);
            }
        },

        /*关闭弹出窗体*/
        close: function (o) {
            var _this = o.data.obj;
            var obj = document.getElementById("query-choose-contain-id"); //解决浏览器兼容问题
            obj.parentNode.removeChild(obj);
            //$("#query-choose-contain-id").parent().parent().remove();
            if (_this.map)
                _this._map.activate(L.DCI.Map.StatusType.PAN, null, null, _this);

            for (var tool in _this.tools)
            {
                if (_this.tools[tool] != null) _this.tools[tool].disable();
            }
            _this._returndata(_this.data);
        },

        /*传输选择参数*/
        chooseresult: function (o) {
            var _this = o.data.obj;
            _this.data.query_attribute = [];
            $('.choose-attribute-choose').find('input').each(function () {
                if ($(this).is(':checked')) {
                    _this.data.query_attribute.push($(this).parent().parent().children().eq(1).html());
                }
            });
            var name = $(".choose-test-choose select option:selected").text();
            //_this.query.where("NAME='" + name + "'").run(function (error, featureCollection, response) {
            //    _this.data.query_content = featureCollection.features[0].geometry;
            //    return _this.data;
            //});
            _this.close(o);
        },

        /*标绘方式*/
        tool: function (o) {
            L.DomEvent.stopPropagation(o);
            var _this = o.data.obj;
            var name = $(o.currentTarget).children().eq(1).html();
            for (var i = 0; i < $(o.currentTarget).parent().children().length; i++) {
                if ($(o.currentTarget).parent().children().eq(i).hasClass('choose-style-choose-click'))
                    $(o.currentTarget).parent().children().eq(i).removeClass('choose-style-choose-click');
            }
            $(o.currentTarget).addClass('choose-style-choose-click');
            var mpgroup = L.DCI.App.pool.get("MultiMap");
            var map = mpgroup.getActiveMap();
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            switch (name) {
                case "点选择":
                    var _point = new L.DCI.DrawPoints(map.map);
                    _point.enable();
                    _this.data.query_style = '点选择';
                    break;
                case "线选择":
                    var _polyline = new L.DCI.DrawPolylines(map.map);
                    _polyline.enable();
                    _this.data.query_style = '线选择';
                    break;
                case "面选择":
                    _this._polygon = new L.DCI.DrawPolygons(map.map);
                    _this._polygon.enable();
                    _this.data.query_style = '面选择';
                    break;

            }
        },


        /*文件选取方式*/
        _tool: function (o) {
            L.DomEvent.stopPropagation(o);
            var _this = o.data.obj;
            var name = $(o.currentTarget).children().eq(1).html();
            for (var i = 0; i < $(o.currentTarget).parent().children().length; i++) {
                if ($(o.currentTarget).parent().children().eq(i).hasClass('choose-style-choose-click'))
                    $(o.currentTarget).parent().children().eq(i).removeClass('choose-style-choose-click')
            }
            $(o.currentTarget).addClass('choose-style-choose-click');
            var mpgroup = L.DCI.App.pool.get("MultiMap");
            var map = mpgroup.getActiveMap();
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            _this._map = map;
            switch (name) {
                case "CAD选择":
                    if (this._addcads == null)
                        this._addcads = new L.DCI.AddCad();
                    this._addcads.addcad();
                    map.activate(L.DCI.Map.StatusType.SELECT, _this.findcscontain, _this.precall, _this);
                    break;
                case "SHP选择":
                    if (this._addcads == null)
                        this._addcads = new L.DCI.AddCad();
                    this._addcads.addshp();
                    map.activate(L.DCI.Map.StatusType.SELECT, _this.findcscontain, _this.precall, _this);
                    break;
            }
            L.dci.app.util._drag("query-choose-contain-id", "query-choose-header-contain-id");
        },

        findcscontain: function (evt) {
            var _this = this;
            if (this.url) {
                L.esri.Tasks.identifyFeatures(this.url)
                .on(this._map.map)
                .at(evt.latlng)
                .tolerance(5)
                .run(function (error, featureCollection, response) {
                    if (featureCollection && featureCollection.features.length > 0) {
                        _this.data.query_geo = featureCollection.features[0].geometry;
                        _this._map.getHighLightLayer().clearLayers();
                        L.dci.app.util.highLight(_this._map, response.results[0], true, true);
                    }
                });
            }
        },

        precall: function () {

        },
    });


    L.DCI.DrawPoints = L.Draw.Marker.extend({

        lays: null,
        options: {
            clickable: false
        },
        addHooks: function () {
            this.options.icon = new L.Icon({
                iconUrl: L.DCI.App.symbol.pointSymbol.iconUrl,
                iconSize: L.DCI.App.symbol.pointSymbol.iconSize,
                iconAnchor: [L.DCI.App.symbol.pointSymbol.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol.iconSize[1] + 10]
            });
            this.options.opacity = L.DCI.App.symbol.pointSymbol.opacity;
            L.Draw.Marker.prototype.addHooks.call(this);

            if (this._map) {
                this._map.on('click', this._onClick, this);
                this._map.on('mouseup', this._exist, this);
            }
        },

        removeHooks: function () {
            L.Draw.Marker.prototype.removeHooks.call(this);

            //!\ Still useful when control is disabled before any drawing (refactor needed?)
            this._map.off('click', this._onClick, this);
            this._map.off('mouseup', this._exist, this);
        },
        _exist: function (e) {
            if (e.originalEvent.button == 2) {
                this.disable();
            }
            else {
                this._poly = L.marker(e.latlng, this.options);
                this._poly.options.icon = new L.Icon({
                    iconUrl: L.DCI.App.symbol.pointSymbol.iconUrl,
                    iconSize: L.DCI.App.symbol.pointSymbol.iconSize,
                    iconAnchor: [L.DCI.App.symbol.pointSymbol.iconSize[0] / 2, L.DCI.App.symbol.pointSymbol.iconSize[1]]
                });
                //多屏同步显示
                if (this._poly) {
                    var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                    for (var q = 0; q < mapGroup.length; q++) {
                        var qmap = mapGroup[q].getMap();
                        if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                        var lay = L.marker(this._poly._latlng, this._poly.options);
                        this.lays[q].addLayer(lay);
                        //this.lays[q].addTo(qmap);
                        mapGroup[q].clear();
                        mapGroup[q].getHighLightLayer().addLayer(lay);
                        L.DCI.App.pool.get("querycontain").data.query_geo = lay;
                    }
                }

            }
        },
        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },

        _onClick: function (e) {

        }
    });

    /*绘制线*/
    L.DCI.DrawPolylines = L.Draw.Polyline.extend({

        lays: null,
        options: {
            repeatMode: true,
            showLength: false, // Whether to display distance in the tooltip
            clickable: false
        },
        addHooks: function () {
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polylineSymbol.color,
                weight: L.DCI.App.symbol.polylineSymbol.weight,
                opacity: L.DCI.App.symbol.polylineSymbol.opacity,
                clickable: false
            };
            L.Draw.Polyline.prototype.addHooks.call(this);
            if (this._map) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);

                this._markers = [];
                this._map.on('click', this._onClick, this);
                this._mouseMarker.on('contextmenu', function () { this.disable(); }, this);
                this._startShape();
            }
        },

        removeHooks: function () {
            L.Draw.Polyline.prototype.removeHooks.call(this);

            this._clearHideErrorTimeout();

            //!\ Still useful when control is disabled before any drawing (refactor needed?)
            this._map.off('mousemove', this._onMouseMove);
            this._clearGuides();
            this._container.style.cursor = '';

            this._removeShape();

            this._map.off('click', this._onClick, this);
        },

        _startShape: function () {
            this._drawing = true;
            this._poly = new L.Polyline([], this.options.shapeOptions);

            this._container.style.cursor = 'crosshair';

            this._updateTooltip();
            this._map.on('mousemove', this._onMouseMove, this);
        },

        _finishShape: function () {
            this._drawing = false;

            this._cleanUpShape();
            this._clearGuides();

            this._updateTooltip(this.fylatlng);

            this._map.off('mousemove', this._onMouseMove, this);
            this._container.style.cursor = '';

            //多屏同步显示
            if (this._poly) {
                var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                for (var q = 0; q < mapGroup.length; q++) {
                    var qmap = mapGroup[q].getMap();
                    if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                    var lay = L.polyline(this._poly._latlngs, this._poly.options);
                    this.lays[q].addLayer(lay);
                    //this.lays[q].addTo(qmap);
                    mapGroup[q].clear();
                    mapGroup[q].getHighLightLayer().addLayer(lay);
                    L.DCI.App.pool.get("querycontain").data.query_geo = lay;
                }
            }
            L.Draw.Polyline.prototype._finishShape.call(this);
        },
        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },
        _onZoomEnd: function () {
            L.Draw.Polyline.prototype._onZoomEnd.call(this);
            this._updateTooltip(this.fylatlng);
        },
        _onMouseMove: function (e) {
            L.Draw.Polyline.prototype._onMouseMove.call(this, e);
            this.fylatlng = e.latlng;
        },
        _removeShape: function () {
            if (!this._poly)
                return;
            this._map.removeLayer(this._poly);
            delete this._poly;
            this._markers.splice(0);
            this._markerGroup.clearLayers();
        },

        _onClick: function (e) {
            if (!this._drawing) {
                this._removeShape();
                this._startShape();
                return;
            }
        },

        _getTooltipText: function () {
            var labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);
            if (!this._drawing) {
                labelText.text = '点击完成绘制';
            }
            return labelText;
        },
        _onMouseDown: function (e) {
            if (e.originalEvent.button == 2) return;
            L.Draw.Polyline.prototype._onMouseDown.call(this, e);
        },

        _onMouseUp: function (e) {
            if (e.originalEvent.button == 2) return;
            L.Draw.Polyline.prototype._onMouseUp.call(this, e);
        }
    });

    /*绘制面类*/
    L.DCI.DrawPolygons = L.Draw.Polygon.extend({

        lays: null,
        options: {
            repeatMode: true,
            showArea: false,
            clickable: false
        },
        addHooks: function () {
            this.options.shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: L.DCI.App.symbol.polygonSymbol.fill,
                fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                clickable: false
            };
            L.Draw.Polygon.prototype.addHooks.call(this);
            if (this._map) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);

                this._markers = [];
                this._map.on('click', this._onClick, this);
                this._mouseMarker.on('contextmenu', function () { this.disable(); }, this);
                this._startShape();
            }
        },

        removeHooks: function () {
            L.Draw.Polygon.prototype.removeHooks.call(this);

            this._clearHideErrorTimeout();

            //!\ Still useful when control is disabled before any drawing (refactor needed?)
            this._map.off('mousemove', this._onMouseMove);
            this._clearGuides();
            this._container.style.cursor = '';

            this._removeShape();

            this._map.off('click', this._onClick, this);
        },

        _startShape: function () {
            this._drawing = true;
            this._poly = new L.Polygon([], this.options.shapeOptions);

            this._container.style.cursor = 'crosshair';

            this._updateTooltip();
            this._map.on('mousemove', this._onMouseMove, this);
        },

        _finishShape: function () {
            this._drawing = false;
            this._cleanUpShape();
            this._clearGuides();

            this._updateTooltip(this.fylatlng);

            this._map.off('mousemove', this._onMouseMove, this);
            this._container.style.cursor = '';

            //多屏同步显示
            if (this._poly) {
                var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                for (var q = 0; q < mapGroup.length; q++) {
                    var qmap = mapGroup[q].getMap();
                    if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                    var lay = L.polygon(this._poly._latlngs, this._poly.options);
                    this.lays[q].addLayer(lay);
                    //this.lays[q].addTo(qmap);
                    mapGroup[q].clear();
                    mapGroup[q].getHighLightLayer().addLayer(lay);

                    if (L.dci.app.pool.has("querycontain") == true) {
                        L.DCI.App.pool.get("querycontain").data.query_geo = lay;
                    }
                    //用地平衡分析调用
                    if (L.dci.app.pool.has("LandBalance") == true) {
                        L.dci.app.pool.get("LandBalance").getDrawPolygonsRegion(lay);
                    }

                    //用地开发强度评价调用
                    if (L.dci.app.pool.has("LandStrength") == true) {
                        L.dci.app.pool.get("LandStrength").getDrawPolygonsRegion(lay);
                    }
                    //可用地存量
                    if (L.dci.app.pool.has("LandStock") == true) {
                        L.dci.app.pool.get("LandStock").getDrawPolygonsRegion(lay);
                    }
                    //公服设施分析
                    if (L.dci.app.pool.has("PublicService") == true) {
                        L.dci.app.pool.get("PublicService").getDrawPolygonsRegion(lay);
                    }
                    //冲突分析调用
                    if (L.dci.app.pool.has("ConflictAnalysis") == true) {
                        L.dci.app.pool.get("ConflictAnalysis").getDrawPolygonsRegion(lay);
                    }
                }
            }
            L.Draw.Polyline.prototype._finishShape.call(this);

            //去掉多边形绘制状态
            L.DCI.App.pool.get('querycontain')._polygon.disable();
            $(".query-choose-contain .choose-style-choose>a:last-child").removeClass("choose-style-choose-click");

        },
        clear: function () {
            if (this.lays == null) return;
            //多屏同步显示
            for (var q = 0; q < this.lays.length; q++) {
                this.lays[q].clearLayers();
            }
        },
        _onZoomEnd: function () {
            L.Draw.Polyline.prototype._onZoomEnd.call(this);
            this._updateTooltip(this.fylatlng);
        },

        _onMouseMove: function (e) {
            L.Draw.Polyline.prototype._onMouseMove.call(this, e);
            this.fylatlng = e.latlng;
        },

        _removeShape: function () {
            if (!this._poly)
                return;
            this._map.removeLayer(this._poly);
            delete this._poly;
            this._markers.splice(0);
            this._markerGroup.clearLayers();


        },

        _onClick: function (e) {
            if (!this._drawing) {
                this._removeShape();
                this._startShape();
                return;
            }
        },

        _getTooltipText: function () {
            var labelText = L.Draw.Polygon.prototype._getTooltipText.call(this);
            if (!this._drawing) {
                labelText.text = '点击完成绘制';
            }
            return labelText;
        },

        _getMeasurementString: function () {
            return;
            var area = this._area;

            if (!area) {
                return null;
            }

            return L.GeometryUtil.readableArea(area, true);
        },

        _vertexChanged: function (latlng, added) {
            var latLngs = this._poly.getLatLngs();
            this._area = L.GeometryUtil.geodesicArea(latLngs);
            L.Draw.Polyline.prototype._vertexChanged.call(this, latlng, added);
        },
        _onMouseDown: function (e) {
            if (e.originalEvent.button == 2) return;
            L.Draw.Polyline.prototype._onMouseDown.call(this, e);
        },

        _onMouseUp: function (e) {
            if (e.originalEvent.button == 2) return;
            L.Draw.Polyline.prototype._onMouseUp.call(this, e);
        }
    });
    return L.DCI.Contain;
});

