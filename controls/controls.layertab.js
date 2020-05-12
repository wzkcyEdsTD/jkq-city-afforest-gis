/**
*图层Tab页切换类
*@module controls
*@class DCI.Controls.LayerTab
*@extends L.Control
*/
define("controls/layertab", [
    "leaflet",
    "core/dcins",
    "plugins/rotate",
    "plugins/icheck",
    "controls/indexandopacity"
], function (L) {
    L.DCI.Controls.LayerTab = L.Control.extend({
        /**
        *类标识
        *@property id
        *@type {String}
        */
        id: 'layerTab',
        /**
        *tab页个数
        *@property _tabs
        *@type {Array}
        *@private
        */
        _tabs: [],
        /**
        *tab页个数
        *@property _tab
        *@type {Array}
        *@private
        */
        _tab: [[], [], [], []],
        /**
        *专题列表类
        *@property _layerIndexAndOpacity
        *@type {Object}
        *@private
        */
        _layerIndexAndOpacity: null,

        /**
        *一张图专题前缀名称
        *@property _layerStraxName
        *@type {Object}
        *@private
        */
        _layerStraxName:'一张图',
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            position: 'topleft'
        },
        /**
        *初始化
        *@method initialize
        */
        initialize: function (map) {
            this._dciMap = map;
        },
        /**
        *添加到地图
        *@method onAdd
        *@param map {String} 地图对象
        */
        onAdd: function (map) {
            this._layers = [];
            this._server = [];
            this._isexpand = true;
            this._map = map;
            if (this._map.options.container == "map-main")
                this._linecount = 5;
            else
                this._linecount = 2;

            var className = 'leaflet-control-layertab';
            this.container = L.DomUtil.create('div', className);
            this.container.id = "layertab-tabs-" + this._map.options.container;

            this._map.on('layeradd', this.addLayer, this);
            this._map.on('layerremove', this.removeLayer, this);

            //分屏事件
            this._map.on('resize', this.screenChange, this);

            L.DomEvent.disableClickPropagation(this.container);
            L.DomEvent.on(this.container, 'mousewheel', L.DomEvent.stopPropagation);
            L.DomEvent.on(this.container, 'click', L.DomEvent.stopPropagation);
            L.DomEvent.on(this.container, 'contextmenu', L.DomEvent.stopPropagation);
            return this.container;
        },

        /**
        *屏幕数量发生改变
        *@method screenChange
        *@param e {Object} 事件回调对象
        */
        screenChange: function (e) {
            var count = this._linecount;
            if (Math.abs(e.oldSize.x - e.newSize.x * 2) < 10) {
                //屏幕变小
                this._linecount = 2;
            } else if (Math.abs(e.newSize.x - e.oldSize.x * 2) < 20) {
                //屏幕变大
                this._linecount = 5;
            } else {
                return;
            }
            //if (count != this._linecount)
            //    this.showToTable(false);
            if (count != this._linecount) {
                //if (this._linecount == 2) {
                //    $(".leaflet-control-layertab-more span").rotate({ animateTo: 0, duration: 300 });
                //    this._isexpand = false;
                //    this.showToTable(false);                    
                //} else if (this._linecount == 5) {
                //$(".leaflet-control-layertab-more span").rotate({ animateTo: 90, duration: 300 });
                if (this._more != null) {
                    $("#" + this._more.id + " span").rotate({ animateTo: 90, duration: 300 });
                    this._isexpand = true;
                    this.showToTable(true);
                    for (var x = 0; x < this._layers.length; x++) {
                        if (x < this._linecount) {
                            $(this._tab[0][x]).hide();
                            $(this._tab[0][x]).show(300).css('display', 'inline-block');
                        }
                    }
                }                
            }
        },
        /**
        *添加图层
        *@method addLayer
        *@param e {Object} 事件回调对象
        */
        addLayer: function (e) {
            if (e.layer.options == null) return;
            var id = e.layer.options.id;
            var name = e.layer.options.name;
            var url = e.layer.options.proxyUrl;
            if (id == null || name == null) return;
            if (id.indexOf("baseLayer") > -1) return;
            //地图切换时，不对tab做任何操作
            if (id.indexOf("basemap") > -1) return;
            //添加一张图时，不对tab做任何操作
            if (name.indexOf("一张图") > -1) return;
            var layerindex = "";
            var layername = "";
            if (e.layer.options.layerType == 1) {
                layerstyle = "feature";
                if (e.layer.options.layers)
                    layerindex = e.layer.options.layers[0].split(',');
                else
                    layerindex = '';
                layername = e.layer.options.layerName.split(',');
            }
            else if (e.layer.options.layerType == 2) {
                layerstyle = "tile";
                layerindex = e.layer.options.layers;
                layername = e.layer.options.name;
            }
            else if (e.layer.options.layerType == 4) {
                layerstyle = "wmts";
                layerindex = e.layer.options.layers;
                layername = e.layer.options.layerName;
            }
            var isHave = false;

            for (var i = 0; i < this._layers.length; i++) {
                if (this._layers[i].id == id) {
                    this._layers[i].server.push({ layerindex: layerindex, layername: layername, url: url });
                    isHave = true;
                    break;
                }
            }
            if (isHave == false) {
                this._layers.push({ layerstyle: layerstyle, id: id, name: name, server: [] });
                if (this._layers.length == 0) {
                    this._layers[0].server.push({ layerindex: layerindex, layername: layername, url: url });
                }
                else {
                    this._layers[this._layers.length - 1].server.push({ layerindex: layerindex, layername: layername, url: url });
                }
            }
            if (this._layers[this._layers.length - 1].server.length == e.layer.options.server || layerstyle == "tile") {
                this._isaddlay = true;
                this.statu = 'add';
                this.map_contain = this._map.options.container.split('-')[1];
                this.showToTable();
                this._isaddlay = false;
            }
        },
        /**
        *删除图层
        *@method removeLayer
        *@param e {Object} 事件回调对象
        */
        removeLayer: function (e) {
            if (e.layer.options == null) return;
            var id = e.layer.options.id;
            if (id == null) return;
            if (id.indexOf("baseLayer") > -1) return;
            //地图切换时，不对tab做任何操作
            if (id.indexOf("basemap") > -1) return;
            var i = 0;
            for (; i < this._layers.length; i++) {
                if (this._layers[i].id == id) break;
            }
            if (i < this._layers.length) {
                this._layers.splice(i, 1);
                var m = null;
                if (this.map_contain == "main") {
                    m = 0;
                }
                else if (this.map_contain == "tow") {
                    m = 1;
                }
                else if (this.map_contain == "three") {
                    m = 2;
                }
                else if (this.map_contain == "four") {
                    m = 3;
                }
                this.hideTab(this._tab[m][i], null, m);
            }
            if (this._layerIndexAndOpacity)
                this._layerIndexAndOpacity.removeFeature({
                    "map": this.map_contain,
                    "id": id,
                    "name": e.layer.options.name
                });
            //判断第一屏的tab页个数是否等于0，等于0则隐藏专题列表按钮
            if (this._tab[0].length == 0) {
                if (L.dci.app.pool.has("layerIndexAndOpacity") == true) {
                    if(this._layerIndexAndOpacity)this._layerIndexAndOpacity.hideBtn();
                }
            }
        },
        /**
        *获取图层
        *@method getLayers
        *@param url {String} 服务地址
        *@param id {String} 图层ID
        *@param name {String} 图层名称
        *@param isHave {Bool} 是否存在
        */
        getLayers: function (url, id, name, isHave) {
            if (url) {
                var _url = url.split(':')[2];
                _url = 'http:' + _url + '?f=json&pretty=true';
                var _this = this;
                this._dciAjax = new L.DCI.Ajax();
                this._dciAjax.request(_url, null, null, function (data) {
                    for (var i = 0; i < _this._layers.length; i++) {
                        if (_this._layers[i].id == id) {
                            isHave = true;
                            break;
                        }
                    }
                    if (isHave == false) {
                        _this._layers.push({ id: id, name: name, layers: data.layers });
                        _this._isaddlay = true;

                        _this.showToTable();
                        _this._isaddlay = false;
                    }
                }, function () {
                    L.dci.app.util.dialog.alert("提示", "获取图层信息失败");
                });
            }
        },
        /**
        *显示Tab
        *@method showToTable
        *@param animat {Bool} 是否使用动画
        */
        showToTable: function (animat) {
            if (this._linecount == 2) {
                $(this.container).css("left", 114);
                $(this.container).css("width", 400);
            }
            else {
                $(this.container).css("left", 110);
                $(this.container).css("width", 940);
            }
            var m = null;
            if (this.map_contain == "main") {
                m = 0;
            }
            else if (this.map_contain == "tow") {
                m = 1;
            }
            else if (this.map_contain == "three") {
                m = 2;
            }
            else if (this.map_contain == "four") {
                m = 3;
            }
            //修改循环条件来生成所有tab
            //for (var x = 0; (this._isexpand || x < this._linecount) && x < this._layers.length; x++) {
            for (var x = 0; x < this._layers.length; x++) {
                if (this._tab[m].length != 0) {
                    var ihas = false;
                    for (var i = 0; i < this._tab[m].length; i++) {
                        var _id = this._tab[m][i].id.split('_')[0];
                        if (this._layers[x].id == _id) {
                            ihas = true;
                            break;
                        }
                    }
                    if (ihas == false) {
                        this.creattab(x, m);
                    }
                }
                else {
                    this.creattab(x, m);
                }
            }
            if (animat == false) {
                for (var x = 0; x < this._layers.length; x++) {
                    if (x >= this._linecount) {
                        $(this._tab[m][x]).show();
                        $(this._tab[m][x]).hide(300);
                    }
                }
            }
            else if (animat == true) {
                for (var x = 0; x < this._layers.length; x++) {
                    if (x >= this._linecount) {
                        $(this._tab[m][x]).hide();
                        $(this._tab[m][x]).show(300).css('display', 'inline-block');
                    }
                }
            }
            this.showMore();
        },
        /**
        *创建Tab
        *@method creattab
        *@param x {Number} 图层索引
        *@param m {Number} 在Tab数组中的索引
        */
        creattab: function (x, m) {
            var name = this._layers[x].name;
            var id = this._layers[x].id;
            var server = this._layers[x].server;
            var layerstyle = this._layers[x].layerstyle;
            var _this = this;
            var tabcontainer;
            var map = L.dci.app.pool.get('MultiMap').getActiveMap();
            if (name.indexOf(this._layerStraxName) > -1 && map.id == "map") {
                $(".leaflet-control-layertab-tab-selected").removeClass("leaflet-control-layertab-tab-selected");
                tabcontainer = L.DomUtil.create('div', 'leaflet-control-layertab-tab leaflet-control-layertab-tab-selected', this.container);
            } else
                tabcontainer = L.DomUtil.create('div', 'leaflet-control-layertab-tab', this.container);
            
            tabcontainer.id = id + "_layertab-" + this._map.options.container;
            this._tab[m].push(tabcontainer);
            this._tabs.push(tabcontainer);
            var html = $('<div class="leaflet-tpggle-layers leaflet-control-layertab-tab-toggle"></div><div class="leaflet-control-layertab-tab-text" data-toggle="tooltip" title="' + name + '">' + name + '</div>');
            $(tabcontainer).append(html);
            var tabclose = L.DomUtil.create('div', 'leaflet-control-layertab-tab-close', tabcontainer);
            tabclose.id = id + "_layertab-close-" + this._map.options.container;
            html = $('<span class="icon-close2" style="background:white;color:#787878;border-radius:2px;" onmouseover="this.style.backgroundColor=\'red\';this.style.color=\'white\'" onmouseout="this.style.backgroundColor=\'white\';this.style.color=\'#787878\'" ></span>');
            $(tabclose).append(html);
            $(tabcontainer).hide();
            $(tabcontainer).show(300);

            $('.leaflet-control-layertab-tab-text', $(tabcontainer)).on("click", {context:this},this._tabItemClick);
            //绑定每个tab的删除事件
            $("#" + id + "_layertab-close-" + this._map.options.container).on("click", { obj: this }, function (e) {
                //显示第一个被隐藏的tab
                var getDisplayEl = $(this).parents('.leaflet-control-layertab-tab');
                while ((getDisplayEl.next('div').hasClass('leaflet-control-layertab-tab') || getDisplayEl.next('div').hasClass('leaflet-control-layertab-more')) && (getDisplayEl.css('display') != 'none')) {
                    getDisplayEl = getDisplayEl.next('div');
                }
                if (getDisplayEl.hasClass('leaflet-control-layertab-tab') && getDisplayEl.css('display') == 'none') {
                    getDisplayEl.show(300);
                }

                var id = e.currentTarget.id.split('_')[0];
                e.data.obj.removeFromMap(id, name);
                //删除专题列表里的专题
                if (e.data.obj._map.options.container == "map-main")
                {
                    L.dci.app.pool.get("layerIndexAndOpacity").removeFeature({ "map": this.map_contain, "id": id, "name": name });
                }
                var lpId = id.split('-')[1];
                L.dci.app.pool.get("leftPanel")._setMenuStyleById(lpId, false);
            });

            this.addtoggletable(server, name, _this, $(tabcontainer).children().eq(0), layerstyle);
            $(tabcontainer).children().eq(0).on('click', { obj: this, m: m }, this.showtab);
            this._map.on('click', function () {
                for (var i = 0; i < this._tab[m].length; i++) {
                    if ($(this._tab[m][i]).children().eq(3).css('display') == 'block') {
                        $(this._tab[m][i]).children().eq(3).hide(300);
                    }
                }
            }, this);

            //判断第一屏的tab页个数是否大于0，大于0则显示专题列表按钮
            if (this._map.options.container == "map-main") {
                if (this._tab[0].length > 0) {
                    if (this._layerIndexAndOpacity == null) {
                        this._layerIndexAndOpacity = new L.DCI.Controls.LayerIndexAndOpacity();
                    }
                    this._layerIndexAndOpacity.showBtn();
                    this._layerIndexAndOpacity.addFeature(id, name);
                }
            }

        },

        /**
        *tab点击事件回调
        *@method _tabItemClick
        *@private
        */
        _tabItemClick: function (e) {
            if (e.currentTarget.innerText.indexOf(e.data.context._layerStraxName) > -1) {
                if ($(e.currentTarget).parent().hasClass("leaflet-control-layertab-tab-selected")) return;
                $(".leaflet-control-layertab-tab-selected").removeClass("leaflet-control-layertab-tab-selected");
                $(e.currentTarget).parent().addClass("leaflet-control-layertab-tab-selected");
                L.dci.app.pool.get("rightPanel").loadByName(e.currentTarget.innerText);
            }
        },

        /**
        *根据名称选中项
        *@method selectTabByName
        *@param name{String} 名称
        */
        selectTabByName: function(name) {
            $(".leaflet-control-layertab-tab-selected").removeClass("leaflet-control-layertab-tab-selected");
            var tabs = $(".leaflet-control-layertab-tab-text");
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].innerText == name) {
                    $(tabs[i]).parent().addClass("leaflet-control-layertab-tab-selected");
                    break;
                }
            }
        },
        /**
        *清除选中项
        *@method clearTabSelected
        */
        clearTabSelected: function() {
            $(".leaflet-control-layertab-tab-selected").removeClass("leaflet-control-layertab-tab-selected");
        },
        /**
        *图层名称太长时处理
        *@method _jugelongstring
        *@param str {String} 图层名称
        *@return {String} 处理后的图层名称
        *@private
        */
        _jugelongstring: function (str) {
            var _str = '';
            if (str.length > 10) {
                _str = str.substring(0, 9) + '...';
            }
            else {
                _str = str;
            }
            return _str;
        },
        /**
        *显示当前触发的tab
        *@method showtab
        */
        showtab: function (o) {
            $(this).toggleClass("leaflet-control-layertab-tab-toggle leaflet-control-layertab-tab-toggle-c");
            var _this = o.data.obj;
            var m = o.data.m;
            for (var i = 0; i < _this._tab[m].length; i++) {
                $(_this._tab[m][i]).children().eq(3).hide(300);
            }
            if ($(this).parent().children().eq(3).css('display') == 'block') {
                $(this).parent().children().eq(3).hide(300);
            }
            else {
                $(this).parent().children().eq(3).show(300);
            }
        },
        /**
        *添加切换按钮
        *@method addtoggletable
        */
        addtoggletable: function (server, name, _this_, obj, layerstyle) {
            var _this = obj;
            if ($(_this).parent().children().eq(3).length == 0) {
                if (layerstyle == "feature") {
                    var html = '<div class="layer-choose-tab leaflet-control-layertab-hide" >';
                    var n = 0;
                    for (var i = 0; i < server.length; i++) {
                        for (var j = 0; j < server[i].layerindex.length; j++) {
                            var html = html + '<div class="layer-choose-tab-children"><input serverindex="' + i + '" layerindex="' + server[i].layerindex[j] + '"  type="checkbox" checked="checked"><span title="' + server[i].layername[j] + '">' + _this_._jugelongstring(server[i].layername[j]) + '</span></div>';
                            n++;
                        }
                    }
                    html = html + '</div>';
                    $(_this).parent().append(html);
                    _this_.featurechecked(n, _this, _this_, server);
                }

                else {
                    var html = '<div class="layer-choose-tab leaflet-control-layertab-hide" >'
                            + '<div class="layer-choose-tab-children"><input type="checkbox" checked="checked"><span>' + name + '</span></div>'
                            + '</div>';
                    $(_this).parent().append(html);
                    _this_.tilechecked(_this, _this_, server);
                }
                $('.layer-choose-tab').find('input').each(function () {
                    $(this).iCheck({
                        checkboxClass: 'icheckbox_flat-red',
                    });
                });
                if ($(_this).parent().children().eq(3).height() > 121) {
                    $(_this).parent().children().eq(3).height(121);
                    $(_this).parent().children().eq(3).children('.layer-choose-tab-children').css('margin-left', '-20px');
                    $(_this).parent().children().eq(3).mCustomScrollbar({
                        theme: "minimal-dark",
                    });
                }
            }
            else {
                $(_this).parent().children().eq(3).remove();
            }
        },
        tilechecked: function (_this, _this_, server) {
            var inp = $(_this).parent().find('input')[0];
            $(inp).on('ifChanged', function () {
                if ($(this).is(':checked')) {
                    _this_.showtileFromMap(server);
                } else {
                    _this_.hidetileFromMap(server);
                }
            });

        },

        featurechecked: function (n, _this, _this_, server) {
            for (var i = 0; i < n; i++) {
                var inp = $(_this).parent().find('input')[i];
                $(inp).on('ifChanged', function () {
                    var n = i;
                    var _servers = server[$(this).attr('serverindex')];
                    if ($(this).is(':checked')) {
                        _servers.layerindex.push($(this).attr('layerindex'));
                    } else {
                        var _server = [];
                        for (var j = 0; j < _servers.layerindex.length; j++) {

                            if (_servers.layerindex[j] != $(this).attr('layerindex')) {
                                _server.push(_servers.layerindex[j]);
                            }
                        }
                        _servers.layerindex = _server;
                    }
                    if (_servers.layerindex.length == 0) {
                        _this_.hideFromMap(_servers);
                    } else {
                        _this_.refreshFromMap(_servers);
                    }
                });
            }
        },
        /**
        *删除图层
        *@method removeFromMap
        *@param id {String} 图层ID
        *@param name {String} 图层名称
        */
        removeFromMap: function (id, name) {
            var map = this._map;
            var _this = this;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.id && layer.options.id == id) {
                    map.removeLayer(layer);
                    var lpId = id.split('-')[1];
                    L.dci.app.pool.get("leftPanel").setLayerStatus(lpId, false);
                    if (_this._dciMap.id == "map")
                        L.dci.app.tool.removeOneMap(name);
                    return;
                }
            });
        },
        hidetileFromMap: function (server) {
            var map = this._map;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.proxyUrl && layer.options.proxyUrl == server[0].url) {
                    layer.setOpacity(0);
                }
            });
        },

        showtileFromMap: function (server) {
            var map = this._map;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.proxyUrl && layer.options.proxyUrl == server[0].url) {
                    layer.setOpacity(1);
                }
            });
        },
        /**
        *隐藏图层
        *@method hideFromMap
        *@param server {Object} 图层
        */
        hideFromMap: function (server) {
            var map = this._map;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.proxyUrl && layer.options.proxyUrl == server.url) {
                    layer.setOpacity(0);
                }
            });
        },
        /**
        *更新地图
        *@method refreshFromMap
        *@param server {Object} 图层
        */
        refreshFromMap: function (server) {
            var map = this._map;
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.proxyUrl && layer.options.proxyUrl == server.url) {
                    layer.setOpacity(1);
                    layer.setLayers(server.layerindex);
                    return;
                }
            });
        },
        /**
        *显示更多处理
        *@method showMore
        */
        showMore: function () {
            if (this._layers.length > this._linecount) {
                if (this._more == null) {
                    //create
                    this._more = L.DomUtil.create('div', 'leaflet-control-layertab-more', this.container);
                    this._more.id = 'leaflet-control-layertab-more' + this._map.options.container;
                    var html = '<span class="icon-arrows-right" style="margin-top: 9px; margin-left: 10px; float: left;"></span>';
                    this._more.innerHTML = html;
                    $(this._more).hide();
                    $(this._more).show(300);
                    //$(".leaflet-control-layertab-more span").rotate({ animateTo: 90, duration: 300 });
                    $("#"+this._more.id+" span").rotate({ animateTo: 90, duration: 300 });
                    //单击事件，展开
                    L.DomEvent.on(this._more, 'click', function (e) {
                        if (this._isexpand == false) {
                            //var html = '<span class="icon-arrows-down" style="margin-top: 9px; margin-left: 10px; float: left;"></span>';
                            //this._more.innerHTML = html;
                            //$(".leaflet-control-layertab-more span").rotate({ animateTo: 90, duration: 300 });
                            $("#" + this._more.id + " span").rotate({ animateTo: 90, duration: 300 });
                            this._isexpand = true;
                            this.showToTable(true);
                        } else {
                            //var html = '<span class="icon-arrows-right" style="margin-top: 9px; margin-left: 10px; float: left;"></span>';
                            //this._more.innerHTML = html;
                            //$(".leaflet-control-layertab-more span").rotate({ animateTo: 0, duration: 300 });
                            $("#" + this._more.id + " span").rotate({ animateTo: 0, duration: 300 });
                            this._isexpand = false;
                            this.showToTable(false);
                        }


                    }, this);
                }
                else {
                    $(this._more).show(300);
                }
            } else {
                if (this._more != null) {
                    //隐藏tab展开按钮并恢复展开状态
                    $(this._more).hide();
                    //$(".leaflet-control-layertab-more span").rotate({ animateTo: 90, duration: 300 });
                    $("#" + this._more.id + " span").rotate({ animateTo: 90, duration: 300 });
                    this._isexpand = true;
                }
            }
        },
        /**
        *隐藏Tab
        *@method hideTab
        *@param tab {String} tab的ID
        *@param animat {Bool} 是否动画
        *@param m {Number} tab的索引
        */
        hideTab: function (tab, animat, m) {
            if (tab) {
                this.statu = 'delete';
                tab.obj = this;
                var i = 0;
                for (; i < this._tab[m].length; i++) {
                    if (this._tab[m][i].id == tab.id) break;
                }
                if (i < this._tab[m].length) {
                    this._tab[m].splice(i, 1);
                }
                $(tab).hide(300, function () {
                    this.obj.showToTable();
                });
                $(tab).remove();
            } else {
                for (var i = 0; i < this._tab[m].length; i++) {
                    if (i >= this._linecount && animat == true) {
                        $(this._tab[m][i]).obj = this;
                        $(this._tab[m][i]).hide(300, function () { $(this.obj._tab[m][i]).remove(); });
                    }
                    else {
                        $(this._tab[m][i]).hide();
                        $(this._tab[m][i]).remove();
                    }
                }
            }
        },

        /**
        *获取当前类类型
        *@method getType
        */
        getType: function () {
            return "L.DCI.LayerTab";
        }
    });

    L.dci.layertab = function (options) {
        return new L.DCI.Controls.LayerTab(options);
    };
});