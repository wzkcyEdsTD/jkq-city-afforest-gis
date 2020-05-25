/**
*Left布局类
*@module layout
*@class DCI.Layout.LeftPanel
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/leftpanel", [
    "leaflet",
    "leafletHeat",
    //"leaflet/heatmap",
    //"leaflet/leafletheatmap",
    "core/dcins",
    "layout/base",
    "plugins/mousewheel",
    "query/resultpanel",
    "plugins/scrollbar",
    "tables/dataTables",
], function (L, heatmap, HeatmapOverlay) {

    L.DCI.Layout.LeftPanel = L.DCI.Layout.extend({
        /**
        *内容模版
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div>'
                    + '<div id="leftpanelcontent" class="leftpanelcontent">'
                        + '<div id="leftpanelcontent_base" class="leftpanelcontent_base">'
                            + '<ul class="leftpanelcontent_base_sub"></ul>'
                            //+ '<div class="leftpanelcontent_base_class"><ul id="leftpanelcontent_base_class_ul"></ul></div>'
                        + '</div>'
                        + '<div id="leftpanelcontent_subject" class="leftpanelcontent_subject">'
                            + '<ul></ul>'
                        + '</div>'
                    + '</div>'
                    + '<div id="shrinknenu" class="shrinknenu icon-previous-page open"></div>'
                + '</div>',
        /**
        *专题目录
        *@property _data
        *@type {Array}
        *@private
        */
        _data: null,//专题目录
        /**
        *CAD临时数据
        *@property _cadData
        *@type {Object}
        *@private
        */
        _cadData: null,//cad临时数据
        /**
        *临时查询结果
        *@property _selectFeatures
        *@type {Object}
        *@private
        */
        _selectFeatures: null,//临时查询结果
        /**
        *要素类型
        *@property _fea_type
        *@type {Object}
        *@private
        */
        _fea_type: "",
        /**
        *要素类型
        *@property _fea_type
        *@type {Object}
        *@private
        */
        _table:null,
        /**
        *已打开主题集的专题名称
        *@property _subjectFeatureName
        *@type {Object}
        *@private
        */
        _subjectFeatureName: [],
       
        
        _heatmapLayer:null,
        _heatmapLayerId: null,
        /**
        *初始化
        *@method initialize        
        *@private
        */
        initialize: function () {
            L.DCI.Layout.prototype.initialize.call(this);
            this.id = "leftPanel";
            this._data = null;
            this._popup = null;
            this.getData();
			window.fename=[];

            //this.itemStatus = {};
            this.l_file_src = []; //临时CAD
            this.l_file_name = []; //临时CAD图层名
            this.l_file_src_s = []; //临时SHP
            this.l_file_name_s = []; //临时SHP图层名

            $(document).on('activeMapChange.fy.split', this.activeMapChange);
            //展开或隐藏菜单栏
            $("#leftpanel").on('click', 'div.shrinknenu', { context: this }, function (e) {
                e.data.context._shrinkMenu(e)
            });
        },
        /**
        *默认加载的图层
        *@method getfeaType        
        *@private
        */
        getfeaType: function () {
            _fea_type = document.location.search.substr(1).split('&');
            _fea_type = _fea_type[0].split('=')[1];
            var bz_id = 0;
            var ss_id = 0;
            var ph_id = 0;
            var data = this._data.subjectData;
            if (data.length == 0) return;
            for (var i = 0; i < data.length; i++) {
                if (data[i]["FEATURENAME"] == "编制一张图")
                    bz_id = data[i]["FEATUREID"];
                else if (data[i]["FEATURENAME"] == "项目一张图")
                    ss_id = data[i]["FEATUREID"];
                else if (data[i]["FEATURENAME"] == "批后一张图")
                    ph_id = data[i]["FEATUREID"];
            }
            switch (_fea_type) {
                case "bz":
                    //"编制一张图";
                    $("#layer-subject-" + bz_id).click();
                    break;
                case "ss":
                    // "实施一张图";
                    $("#layer-subject-" + ss_id).click();
                    break;
                case "ph":
                    //  "批后一张图";
                    $("#layer-subject-" + ph_id).click();
                    break;
            }
        },
        /**
        *获取目录数据
        *@method getDataObj        
        *@private
        */
        getDataObj: function () {
            return this._data;
        },
        /**
        *展开或隐藏菜单栏
        *@method _shrinkMenu
        *@private
        */
        _shrinkMenu: function (e) {
            var obj = $(e.currentTarget);
            var leftPaneObj = obj.parents(".leftpanel");
            var mapControlObj = $("#map-main .leaflet-control-container .leaflet-left");
            if (obj.hasClass("open")) {//隐藏
                obj.removeClass("open");
                obj.removeClass("icon-previous-page").addClass("icon-next-page");
                leftPaneObj.animate({
                    left: "-185px"
                }, "fast");
                mapControlObj.animate({
                    left: "0px"
                }, "fast");
            }
            else {//展开
                obj.addClass("open");
                obj.removeClass("icon-next-page").addClass("icon-previous-page");
                leftPaneObj.animate({
                    left: "15px"
                }, "fast");
                mapControlObj.animate({
                    left: "195px"
                }, "fast");
            }
        },
        /**
        *活跃地图窗口改变事件
        *@method activeMapChange
        *@private
        */
        activeMapChange: function () {
            /*当前活跃地图窗口*/
            var acriveMap = arguments[1].map;
            var mapId = acriveMap.options.id;
            //主题集菜单
            var subjectEle = $("#leftpanelcontent_subject").find(".subjectFeature");
            subjectEle.each(function () { $(this).removeClass("active"); });
            //地图集下的三级菜单
            var baseLayerEle = $("#leftpanelcontent_base").find(".baseFeatureLayer");
            baseLayerEle.each(function () { $(this).removeClass("active"); });
            acriveMap.eachLayer(function (layer) {
                if (mapId == 'map') {
                    subjectEle.each(function () {
                        var id = "layer-" + $(this)[0].id.split('-')[2];
                        if (layer.options && layer.options.id == id) {
                            $(this).addClass("active");
                        }
                    });
                }

                baseLayerEle.each(function () {
                    var id = "layer-" + $(this)[0].id.split('-')[2];
                    if (layer.options && layer.options.id == id) {
                        $(this).addClass("active");
                    }
                });
            });
        },
        /**
        *获取专题目录
        *@method getData        
        *@private
        */
        getData: function () {
            L.dci.app.services.baseService.getFeatures({
                context: this,
                userId: L.dci.app.util.user.getCurUser().id,
                success: function (res) {
                    if (res == null || res.length == 0) {
                        L.dci.app.util.dialog.alert("提示", "没有专题访问权限");
                        return;
                    }
                    this._dataClassification(res);
                    this._setFeatureHtml();
                    this.getfeaType();//用于加载默认图层 
                }
            });
        },
        /**
        *数据分级处理
        *@method _dataClassification
        *@param data{Array}
        *@private
        */
        _dataClassification: function (data) {
            var featureData = {
                baseData: {
                    mapsetSub: [],
                    mapsetClass: [],
                    mapsetLayer: []
                },
                subjectData: []
            };
            var mapsetCatalog = [], mapsetSub = [], mapsetClass = [], mapsetLayer = [];

            for (var i = 0; i < data.length; i++) {
                if (data[i]["FEATURETYPE"] == "mapset_catalog") {
                    mapsetCatalog.push(data[i]);
                    var featureid = data[i]["FEATUREID"];
                    for (var k = 0; k < data.length; k++) {
                        //构建地图集数据
                        if (data[k]["FEATUREPARENTID"] == featureid) {
                            featureData.baseData.mapsetSub.push(data[k]);
                        }
                    }
                }
            };

            for (var i = 0; i < data.length; i++) {
                if (data[i]["FEATURENAME"] == "主题集") {
                    var zhutifid = data[i]["FEATUREID"]
                };
                if (data[i]["FEATURENAME"] == "地图集") {
                    var ditufid = data[i]["FEATUREID"]
                }
            };

            for (var i = 0; i < data.length; i++) {
                var status = [false, false, false, false];
                //构建主题集数据
                if (data[i]["FEATUREPARENTID"] == zhutifid) {
                    data[i]["status"] = status;
                    featureData.subjectData.push(data[i]);
                    continue;
                }
                if (data[i]["FEATUREPARENTID"] == ditufid) {
                    continue;
                }

                //构建地图集数据
                if (data[i]["FEATURETYPE"] == "mapset_class") {
                    //data[i]["status"] = status;
                    featureData.baseData.mapsetClass.push(data[i]);
                }
                else if (data[i]["FEATURETYPE"] == "mapset_layer") {
                    data[i]["status"] = status;
                    featureData.baseData.mapsetLayer.push(data[i]);
                }
                else { }
            }
            this._data = null;
            this._data = featureData;
        },

        /**
        *设置菜单界面
        *@method _setFeatureHtml
        *@private
        */
        _setFeatureHtml: function () {
            var _this=this;
            this.body = $("#leftpanel");
            this.body.html(this.tempHtml);
            $("#leftpanelcontent").height(($(document).height() - 160) + "px");
            //当没有地图集和主题集权限时,菜单栏显示为空白
            if (this._data.subjectData.length == 0 && this._data.baseData.mapsetSub.length == 0) {
                $("#leftpanelcontent").addClass("subject");
                return;
            }

            //当没有地图集权限时,菜单栏只显示主题集菜单
            if (this._data.subjectData.length > 0 && this._data.baseData.mapsetSub.length == 0) {
                var html = '<span class="full">主题集</span>'
                $("#leftpanel>div>p").html(html);
                $("#leftpanelcontent").addClass("subject");
                this._insertSubjectMenu();
                return;
            }

            //当没有主题集权限时,菜单栏只显示地图集菜单
            if (this._data.subjectData.length == 0 && this._data.baseData.mapsetSub.length > 0) {
                //var html = '<span class="full"><img src="themes/default/images/layout/index/dt.png">&nbsp;&nbsp;地图集1</span>'
                var html = '<span class="full"><div class="switch-box-layerSwitch layerShowTypeSwitch">' +
		            '<input id="layerShowType" class="switch-box-input" type="checkbox"/>'+
                '<label>图集</label>'+
                '<label for="layerShowType" class="switch-box-slider" style="margin-left:10px;"></label>' +
                '<label for="layerShowType" class="switch-box-label">热力图</label>' +
                '</div></span>';
                $("#leftpanel>div>p").html(html);
                $("#leftpanelcontent").addClass("base");
                this._insertBaseMenu();
                //热力图和图集切换
                $("#layerShowType").click(function () {
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    if ($("#layerShowType").is(":checked")) {
                        //切换至叠加热力图
                        _this.removeLayers();
                    }
                    else {
                        //切换至叠加图层
                        if (_this._heatmapLayer!=null) {
                            map.map.removeLayer(_this._heatmapLayer);
                            L.dci.app.pool.get("leftPanel")._setMenuStyleById(_this._heatmapLayerId, false);
                            _this._heatmapLayer = null;
                            _this._heatmapLayerId = null;
                        }
                    }
                });
                return;
            }

            //当同时享有地图集和主题集权限时
            if (this._data.subjectData.length > 0 && this._data.baseData.mapsetSub.length > 0) {
                var html = '<span>地图集</span><span class="active">主题集</span>'
                $("#leftpanel>div>p").html(html);
                $("#leftpanelcontent").addClass("subject");
                this._insertBaseMenu();
                this._insertSubjectMenu();
            }
        },

        
		/**
		**左侧地图清单按钮bychenx
		**/
		_insertBaseMenu: function () {
            //插入地图集一级菜单
            var mapsetClassHtml = this._creatMapsetSubHtml(this._data.baseData.mapsetSub);
            $(".leftpanelcontent_base_sub").html(mapsetClassHtml);
            //绑定地图集一级菜单事件
			
            $(".leftpanelcontent_base_sub").on('click', 'li:not(".active")>a', { context: this }, function (e) { e.data.context._changeSubMenu(e); });
			$(".leftpanelcontent_base_sub").on('click', 'li.active>a', { context: this }, function (e) {e.data.context._cloaeSubMenu(e); });

            //给地图集一级菜单栏添加滚动条，并隐藏滚动条拖动条
            $('.leftpanelcontent_base_sub').mCustomScrollbar({ theme: 'minimal-dark', axis: "y" });
            

            //插入地图集二三级菜单
            //获取默认的一级第一项菜单的专题id
            var id = this._data.baseData.mapsetSub[0].FEATUREID;
            var objData = this._getDataByMapsetSubId(id);
            var mapsetClassAndLayerHtml = this._creatMapsetClassAndLayerHtml(objData.mapsetClass, objData.mapsetLayer);
         
            //$(".baseFeatureSub.active").parent().children(".leftpanelcontent_base_class").find("ul").html(mapsetClassAndLayerHtml);
            $(".baseFeatureSub.active").children(".leftpanelcontent_base_class").find("ul").html(mapsetClassAndLayerHtml);
            //给地图集二级菜单栏添加滚动条，并隐藏滚动条拖动条
            $('.leftpanelcontent_base_class').mCustomScrollbar({ theme: 'minimal-dark', axis: "y" });
            ////绑定地图集二级菜单事件
            $(".leftpanelcontent_base_class").on('mouseenter', '.baseFeatureClass', { context: this }, function (e) { e.data.context._showLayerMenu(e); });
            $(".leftpanelcontent_base_class").on('mouseleave', '.baseFeatureClass', { context: this }, function (e) { e.data.context._hideLayerMenu(e); });


            //刷新三级菜单的高度
            //this.refreshBaseMenuHeight();
            //绑定地图集三级菜单事件
            $("#leftpanelcontent_base").on('click', 'li.baseFeatureLayer[data-info="map-layer"] .hk-bg', { context: this }, function (e) { e.data.context._addBaseLayer(e); });
            $("#leftpanelcontent_base").on('click', 'li.baseFeatureLayer[data-info="map-layer"] .baseFeatureLayerDetails', { context: this }, function (e) { e.data.context._addBaseTable(e); });
            $('#leftpanelcontent_base').on('click', 'li.baseFeatureLayer[data-info="map-layer_l"]', { context: this }, this._addLayer_lin);
            $('#leftpanelcontent_base').on('click', 'li.baseFeatureLayer[data-info="map-layer_l_s"]', { obj: this }, this._addLayer_lin_s);
        
		},
        /**
        *插入主题集菜单
        *@method _insertSubjectMenu
        *@private
        */
        _insertSubjectMenu: function () {
            $("#leftpanelcontent").addClass("subject");
            //插入主题集菜单
            var subjectHtml = this._creatSubjectHtml(this._data.subjectData);
            $("#leftpanelcontent_subject>ul").html(subjectHtml);
            //绑定主题集或地图集tab切换
            $("#leftpanel>div>p").on('click', 'span:not(".active")', { context: this }, function (e) { e.data.context._showMenuType(e); });
            //绑定主题集菜单事件
            $("#leftpanelcontent_subject").on('click', 'li', { context: this }, function (e) { e.data.context._addSubjectLayer(e); });
            //给主题集菜单栏添加滚动条，并隐藏滚动条拖动条
            $('#leftpanelcontent_subject>ul').mCustomScrollbar({ theme: 'minimal-dark', axis: "y" });
        },


        /**
        *构建主题集菜单html
        *@method _creatSubjectHtml
        *@private
        */
        _creatSubjectHtml: function (data) {
            var html = '';
            for (var i = 0; i < data.length; i++) {
                var picName = 'themes/default/images/layout/';

                switch (data[i]["FEATURENAME"]) {
                    case "项目一张图":
                        picName += "xiangmu-icon.png";
                        break;
                    case "编制一张图":
                        picName += "bianzhi-icon.png";
                        break;
                    case "时限一张图":
                        picName += "shixian-icon.png";
                        break;
                    case "批后一张图":
                        picName += "pihou-icon.png";
                        break;
                    default:
                        picName += "default.png";
                        break;
                };

                html += '<li class="subjectFeature" id="layer-subject-' + data[i]["FEATUREID"] + '" name="' + data[i]["FEATURENAME"] + '"><img class="subjectFeature_picture"  src="' + picName + '"><p>' + data[i]["FEATURENAME"] + '</p></li>'
            }
            return html;
        },

        /**
        *构建地图集一级菜单html
        *@method _creatMapsetSubHtml
        *@private
        */
		_creatMapsetSubHtml: function (data) {
            var html = '<ul>';
            for (var i = 0; i < data.length; i++) {
                if (i == 0)
                    html += '<li class="baseFeatureSub active" id="layer-base-' + data[i]["FEATUREID"] + '"><a>' + data[i]["FEATURENAME"] +
                        '<span><img src="themes/default/images/layout/index/top.png"></span>' +
                        '</a><div class="leftpanelcontent_base_class active"><ul class="leftpanelcontent_base_class_ul"></ul></div></li>';
                else
                    html += '<li class="baseFeatureSub" id="layer-base-' + data[i]["FEATUREID"] + '"><a>' + data[i]["FEATURENAME"] +
                       '<span><img src="themes/default/images/layout/index/down.png"></span>' +
                       '</a><div class="leftpanelcontent_base_class"><ul class="leftpanelcontent_base_class_ul"></ul></div></li>';
            }
            html += '</ul>';
            return html;
        },
        /**
        *构建地图集二三级菜单html
        *@method _creatMapsetClassAndLayerHtml
        *@private
        */
        _creatMapsetClassAndLayerHtml: function (data1, data2) {
            var map = L.dci.app.pool.get('map');
            var mId = L.DCI.App.pool.get('MultiMap').getActiveMap().id;
            var visible = "visible_" + mId;
            var html = '';
            //构建一个二级菜单的同时构建其子菜单，即三级菜单
            for (var i = 0; i < data1.length; i++) {
                var picName = 'themes/default/images/layout/' + data1[i]["IMAGENAME"];
                var id = data1[i]["FEATUREID"];
                var name = data1[i]["FEATURENAME"];
                html += '<li class="baseFeatureClass" id="layer-base-' + data1[i]["FEATUREID"] + '" data-info="map-class"><img class="baseFeatureClass_picture" src="' + picName + '"><p>' + data1[i]["FEATURENAME"] + '</p>';
                if (name == "SHP加载数据")
                    html += '<ul id="shpUL">';
                else if (name == "CAD加载数据")
                    html += '<ul id="cadUL">';
                else
                    html += '<ul>';
                //先求各个二级专题含有的三级专题数据集
                var data = [];
                for (var j = 0; j < data2.length; j++) {
                    if (id == data2[j]["FEATUREPARENTID"])
                        data.push(data2[j]);
                }
                const FEATUREPARENTID = data1[0].FEATUREPARENTID;
                var num = data.length;
                for (var k = 0; k < data.length; k++) {
                    html += `<li class="baseFeatureLayer" id="layer-base-${data[k]["FEATUREID"]}" title="${data[k]["FEATURENAME"]}" data-info="map-layer" data-FEATUREPARENTID="${FEATUREPARENTID}">${~[2059, 1819].indexOf(FEATUREPARENTID)  ? `<span class="hk-bg"><span class="hk"></span></span>` : ``}<div class="baseFeatureLayerTitle"><i>${data[k]["FEATURENAME"]}</i><span class="baseFeatureLayerDetails">属性</span></div></li>`;
                }
                if (name == "SHP加载数据") {
                    $.each(map.shpLayerGroups, function (a, group) {
                        if (group[visible] == false || group[visible] == undefined) {
                            html += '<li class="baseFeatureLayer" id="layer-base-' + group.groupId + '" title = ' + group.name + ' data-info="map-layer_l_s"><span class="hk-bg"><span class="hk"></span></span><div class="baseFeatureLayerTitle">' + group.name + '</div></li>';
                        } else {
                            html += '<li class="baseFeatureLayer active" id="layer-base-' + group.groupId + '" title = ' + group.name + ' data-info="map-layer_l_s"><span class="hk-bg"><span class="hk"></span></span><div class="baseFeatureLayerTitle">' + group.name + '</div></li>';
                        }
                    });
                }
                if (name == "CAD加载数据") {
                    $.each(map.cadLayerGroups, function (b, group) {
                        if (group[visible] == false || group[visible] == undefined) {
                            html += '<li class="baseFeatureLayer" id="layer-base-' + group.groupId + '" title ="' + group.name + '" data-info="map-layer_l"><span class="hk-bg"><span class="hk"></span></span><div class="baseFeatureLayerTitle">' + group.name + '</div></li>';
                        } else {
                            html += '<li class="baseFeatureLayer active" id="layer-base-' + group.groupId + '" title ="' + group.name + '" data-info="map-layer_l"><span class="hk-bg"><span class="hk"></span></span><div class="baseFeatureLayerTitle">' + group.name + '</div></li>';
                        }
                    });
                }
                html += '</ul>';
                html += '</li>';
            }

            return html;

        },
        /**
        *通过一级菜单的专题id来获取其二三级菜单的数据
        *@method getDataByMapsetSubId
        *@private
        */
        _getDataByMapsetSubId: function (id) {
            var baseData = this._data.baseData;
            var classData = [];
            var layerData = [];
            for (var i = 0; i < baseData.mapsetClass.length; i++) {
                if (id == baseData.mapsetClass[i]["FEATUREPARENTID"]) {
                    var FEATUREID = baseData.mapsetClass[i]["FEATUREID"];
                    classData.push(baseData.mapsetClass[i]);
                    for (var j = 0; j < baseData.mapsetLayer.length; j++) {
                        if (FEATUREID == baseData.mapsetLayer[j]["FEATUREPARENTID"])
                            layerData.push(baseData.mapsetLayer[j]);
                    }
                }
            }

            var objData = {
                "mapsetClass": classData,
                "mapsetLayer": layerData
            };
            return objData;
        },
        /**
        *切换主题集和地图集tab事件
        *@method _showMenuType
        *@private
        */
        _showMenuType: function (e) {
            var text = $(e.currentTarget).text();
            $(e.currentTarget).addClass("active").siblings().removeClass("active");
            switch (text) {
                case '地图集':
                    $("#leftpanelcontent").addClass("base").removeClass("subject");
                    break;
                case '主题集':
                    $("#leftpanelcontent").addClass("subject").removeClass("base");
                    break;
                default:
                    break;
            }
        },
        /**
        *切换地图集一级菜单tab事件
        *@method _showMenuType
        *@private
        */
        _changeSubMenu: function (e) {
            var id = $(e.currentTarget).parent().attr("id").split("-")[2];
            $(e.currentTarget).parent().siblings().each(function () {
                if ($(this).hasClass("active")) {
                    $(this).children("a").children().children("img").attr("src", "themes/default/images/layout/index/down.png");
                }
            });
            $(e.currentTarget).children().find("img").attr("src", "themes/default/images/layout/index/top.png");
            $(e.currentTarget).parent().addClass("active");
            $(e.currentTarget).parent().siblings().removeClass("active");
            $(e.currentTarget).parent().siblings().children(".leftpanelcontent_base_class").removeClass("active");
            $(e.currentTarget).parent().children(".leftpanelcontent_base_class").addClass("active");
            var objData = this._getDataByMapsetSubId(id);
            var mapsetClassAndLayerHtml = this._creatMapsetClassAndLayerHtml(objData.mapsetClass, objData.mapsetLayer);
            $(e.currentTarget).parent().children(".leftpanelcontent_base_class").find("ul").html(mapsetClassAndLayerHtml);
            //刷新菜单状态
            this.refreshMenuStatus();
        },
		/**
        *切换地图集一级菜单tab事件,关闭当前打开的图集目录
        *@method _showMenuType
        *@private
        */
		_cloaeSubMenu:function(e){
			$(e.currentTarget).children().children("img").attr("src", "themes/default/images/layout/index/down.png");
			$(e.currentTarget).parent().removeClass("active");
			$(e.currentTarget).parent().children(".leftpanelcontent_base_class").removeClass("active");
		},
        /**
        *显示三级菜单
        *@method _showLayerMenu
        *@private
        */
        _showLayerMenu: function (e) {
            e.stopPropagation();
            var liEle = $(e.currentTarget).find("li");
            if (liEle.length > 0) {
                // $(".leftpanelcontent_base_class").css("width", "200px");
                $(e.currentTarget).children("ul").addClass("active");
            }

        },
        /**
        *隐藏三级菜单
        *@method _hideLayerMenu
        *@private
        */
        _hideLayerMenu: function (e) {
            e.stopPropagation();
            $(".leftpanelcontent_base_class").css("width", "");
            var liEle = $(e.currentTarget).find("li");
            if (liEle.length > 0) {
                $(e.currentTarget).children("ul").removeClass("active");
            }
        },
        /**
        *刷新菜单状态
        *@method refreshMenuStatus
        *@private
        */
        refreshMenuStatus: function () {
            /*当前活跃地图窗口*/
            var acriveMap = L.dci.app.pool.get('MultiMap').getActiveMap();
            var map = acriveMap.map;
            var mapId = acriveMap.options.id;
            //主题集菜单
            var subjectEle = $("#leftpanelcontent_subject").find(".subjectFeature");
            subjectEle.each(function () { $(this).removeClass("active"); });
            //地图集下的三级菜单
            var baseLayerEle = $("#leftpanelcontent_base").find(".baseFeatureLayer");
            baseLayerEle.each(function () {
                var type = $(this).attr("data-info");
                if (type != "map-layer_l" && type != "map-layer_l_s") {
                    $(this).removeClass("active");
                    $(this).find(".hk").animate({ left: "0px" }, 100);
                    $(this).find(".hk-bg").css("background-color", "#ddd");
                }
            });
            map.eachLayer(function (layer) {
                if (mapId == 'map') {
                    subjectEle.each(function () {
                        var id = "layer-" + $(this)[0].id.split('-')[2];
                        if (layer.options && layer.options.id == id) {
                            $(this).addClass("active");
                            $(this).find(".hk").animate({ left: "22px" }, 100);
                            $(this).find(".hk-bg").css("background-color", "#1492ff");
                        }
                    });
                }

                baseLayerEle.each(function () {
                    var id = "layer-" + $(this)[0].id.split('-')[2];
                    if (layer.options && layer.options.id == id) {
                        $(this).addClass("active");
                        $(this).find(".hk").animate({ left: "22px" }, 100);
                        $(this).find(".hk-bg").css("background-color", "#1492ff");
                    }
                });
            });
        },
        /**
        *刷新菜单高度
        *@method refreshBaseMenuHeight
        *@private
        */
        refreshBaseMenuHeight: function () {
            var height = $("#leftpanelcontent").height();
            $(".leftpanelcontent_base_class .mCSB_container>ul").css("min-height", height);
        },
        /**
        *添加主题集里的专题
        *@method _addSubjectLayer
        *@private
        */
        _addSubjectLayer: function (e) {
            var map = L.dci.app.pool.get('MultiMap').getActiveMap();
            var mapId = map.id;
            var target = e.currentTarget;
            var type = target.id.split("-")[1];
            var id = target.id.split("-")[2];
            var featurename = $(target).attr("name");
            //主题集菜单栏数据只允许在第一屏添加
            if (mapId != 'map')
                L.dci.app.util.dialog.alert("提示", '专题集里的专题仅限在第一屏使用');
            else {
                if ($(target).hasClass("active")) {//删除专题
                    //去掉状态
                    $(target).removeClass("active");
                    //移除主题集名称集
                    for (var i = 0; i < this._subjectFeatureName.length; i++) {
                        if (featurename == this._subjectFeatureName[i]) {
                            this._subjectFeatureName.splice(i, 1);
                            break;
                        }
                    }
                    //更新右边功能显示面板功能状态
                    L.dci.app.pool.get('rightPanel').showOneMapFunctionStatus();
                    L.dci.app.tool.removeOneMap(featurename);
                    this.layerRemove(id, target);
                }
                else {//添加专题
                    L.dci.app.pool.get('rightPanel').clearOldStatusInfo(1);
                    L.dci.app.pool.get('rightPanel').clearOldStatusInfo(0);
                    $(target).addClass("active");
                    this._subjectFeatureName.push(featurename);
                    //更新右边功能显示面板功能状态
                    var rightpanle = L.dci.app.pool.get('rightPanel');
                    var context = '<div style="width: 100%;padding: 10px;border-bottom: 1px solid #d2d2d2; font-size:24px">' + featurename + '</div>';
                    var title = featurename;
                    var index = 1;
                    rightpanle.load(context, title, index);
                    rightpanle.showOneMapFunctionStatus(featurename);

                    L.dci.app.tool.addOneMap(featurename);
                    this.layerAdd(id, target);
                }

            }
        },
        /**
        *添加表格
        *@method _addBaseTable
        *@private
        */
        _addBaseTable: function (e) {
            const _this = this;
            const target = $(e.currentTarget).parent().parent(".baseFeatureLayer")[0];
            const id = target.id.split("-")[2];
            const FEATUREPARENTID = $(target).attr("data-FEATUREPARENTID");
            console.log(id, FEATUREPARENTID)
            L.dci.app.services.baseService.getFeatureLayerById({
                id,
                context: _this,
                success: function (res) {
                    if (res != "0" && res.length > 0) {
                        _this._table && _this._table.doDestroy();
                        _this._table = new L.DCI.DataTables(id, res[0], FEATUREPARENTID);
                    } else {
                        L.dci.app.util.dialog.alert("提示", "该服务已被禁用");
                    }
                }
            });
        },
        /**
        *添加地图集里的三级专题菜单,叠加服务（分为图集叠加和热力图叠加）
        *@method _addBaseLayer
        *@private
        */
        _addBaseLayer: function (e) {
            var target = $(e.currentTarget).parent(".baseFeatureLayer")[0];
            var id = target.id.split("-")[2];
            if ($(target).hasClass("active")) {
                $(target).find(".hk").animate({ left: "0px" }, 100);
                $(target).find(".hk-bg").css("background-color", "#ddd");
                $(target).removeClass("active");
                if ($("#layerShowType").is(":checked")) {
                    //移除热力图
                    if (this._heatmapLayer != null) {
                        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                        map.map.removeLayer(this._heatmapLayer);
                        this._heatmapLayer = null;
                        this._heatmapLayerId = null;
                    }
                }
                else {
                    //移除图层
                    this.layerRemove(id, target);
                }
            }
            else {
                $(target).find(".hk").animate({ left: "22px" }, 100);
                $(target).find(".hk-bg").css("background-color", "#1492ff");
                $(target).addClass("active");
                if ($("#layerShowType").is(":checked")) {
                    //叠加热力图
                    this.heatLayerAdd(id, target);
                }
                else {
                    //叠加图层
                    this.layerAdd(id, target);
                    this.layerTableAdd(id, target);
                }
            }
        },
        /**
        *在切换至热力图状态时，将图层全部清除
        *@method removeLayers
        *@private
        */
        removeLayers:function(){
            var layerTab = L.DCI.App.pool.get("layerTab");
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var layerCount = layerTab._layers.length;
            if (layerTab._layers.length != 0) {
                for (var i = 0; i < layerCount;i++) {
                    var id = layerTab._layers[0].id;
                    //id = id.substr(id.indexOf("-") + 1, id.length);
                    //var name = layerTab._layers[i].name;
                    map.removeLayer(id);
                    var lpId = id.split('-')[1];
                    L.dci.app.pool.get("leftPanel")._setMenuStyleById(lpId, false);
                }
             }
        },
        /**
        *通过map对象id来获取对应状态索引值
        *@method getStatusIndexByMapId
        *@private
        */
        getStatusIndexByMapId: function (id) {
            var index = 0;
            switch (id) {
                case 'map':
                    break;
                case 'mapTow':
                    index = 1;
                    break;
                case 'mapThree':
                    index = 2;
                    break;
                case 'mapFour':
                    index = 3;
                    break;
                default:
                    break;
            }
            return index;
        },

        /**
        *修改数据中当前图层的状态
        *@method setLayerStatus
        *@param id{String}
        *@param status{String}
        *@private
        */
        setLayerStatus: function (id, status) {
            var map = L.dci.app.pool.get('MultiMap').getActiveMap();
            var mapId = map.id;
            if (mapId == 'map') {
                for (var i = 0; i < this._data.length; i++) {
                    if (id == this._data[i]["FEATUREID"]) {
                        this._data[i]["status"] = status;
                        break;
                    }
                }
            }

        },
        /**
         * 添加图层为点数据时,叠加表格展示
         * @param {any} id
         * @param {any} target
         */
        layerTableAdd: function (id, target) {
            
        },
        /**
        *添加图层
        *@method layerAdd
        *@param id{String}
        *@param target{Object}
        *@private
        */
        layerAdd: function (id, target) {
            var _this = this;
            L.dci.app.util.showLoading();

            feaId = "layer-" + id;
            //$.cookie(feaId, null);
            var layerRes = $.cookie(feaId);
            if (layerRes != null && layerRes != "null") {
                layerRes = JSON.parse(layerRes);
                this._layerAdd(layerRes, id);
            } else {
                L.dci.app.services.baseService.getFeatureLayerById({
                    id: id,
                    context: _this,
                    success: function (res) {
                        if (res != "0" && res.length > 0) {
                            _this._layerAdd(res, id);
                            $.cookie(feaId, JSON.stringify(res));
                        } else {
                            L.dci.app.util.dialog.alert("提示", "该服务已被禁用");
                            //若服务无法添加则，将菜单的状态去掉
                            _this._setMenuStyleById(id, false);
                            L.dci.app.util.hideLoading();
                        }
                    }
                });
            }
        },
        /**
        *添加图层图层
        *@method _layerAdd
        *@param res{Object}
        *@private
        */
        _layerAdd: function (res, id) {
            var map = L.dci.app.pool.get('MultiMap').getActiveMap();
		   	//if(Project_ParamConfig.prolayname.includes(res[0].FeatureName)){
			//	$(".pro-lay").show();	
			//     window.fename.push(res[0].FeatureName);				
			//	var data=window.fename;
			//	var _this=this;
			//	$(".pro-lay").on('click', { context: this }, function (e) {
			//		_this.proquery(data);
			//		});
			//}
            var feaId = "", featurename = "", layerName = "", url = "", index = "", newUrl = "", layerType = "";
            var layers = [];
            for (var i = 0; i < res.length; i++) {
                resourceId = res[i]["ResourceId"];
                url = res[i]["Url"];
                index = res[i]["LayerIndex"];
                layerType = res[i]["LayerType"];
                layerName = res[i]["LayerName"];
                featurename = res[i]["FeatureName"];
                feaId = "layer-" + id;

                if (Project_ParamConfig.isProxy == "true")
                    newUrl = Project_ParamConfig.defaultProxy + "/" + url;
                else
                    newUrl = url;
                if (index == "" || index == null) {
                    options = {
                        id: feaId,
                        opacity: 1,
                        proxyUrl: newUrl,
                        server: res.length,
                        layerType: layerType,
                        layerName: layerName,
                        name: featurename
                    }
                } else {
                    options = {
                        id: feaId,
                        opacity: 1,
                        layers: [index],
                        server: res.length,
                        proxyUrl: newUrl,
                        layerName: layerName,
                        layerType: layerType,
                        name: featurename
                    }
                    layers.push({ layer: url, layerid: feaId });
                }
                map.addLayer(newUrl, options);
            }
        },
        /**
           *添加热力图
           *@method heatLayerAdd
           *@param id{String}
           *@param target{Object}
           *@private
         */
        heatLayerAdd: function (id, target) {
            var _this = this;
            L.dci.app.util.showLoading();
            L.dci.app.pool.get("leftPanel")._setMenuStyleById(this._heatmapLayerId, false);
            feaId = "layer-" + id;
            var layerRes = $.cookie(feaId);
            if (layerRes != null && layerRes != "null") {
                layerRes = JSON.parse(layerRes);
                this._heatLayerAdd(layerRes, id);
            } else {
                L.dci.app.services.baseService.getFeatureLayerById({
                    id: id,
                    context: _this,
                    success: function (res) {
                        if (res != "0" && res.length > 0) {
                            _this._heatLayerAdd(res, id);
                            $.cookie(feaId, JSON.stringify(res));
                        } else {
                            L.dci.app.util.dialog.alert("提示", "该服务已被禁用");
                            //若服务无法添加则，将菜单的状态去掉
                            _this._setMenuStyleById(id, false);
                            L.dci.app.util.hideLoading();
                        }
                    }
                });
            }
        },
        /**
        *添加图层图层
        *@method _layerAdd
        *@param res{Object}
        *@private
        */
        _heatLayerAdd: function (res, id) {
            var _this = this;
            
            var feaId = "", featurename = "", layerName = "", url = "", index = "", newUrl = "", layerType = "";
            var layers = [];
            for (var i = 0; i < res.length; i++) {
                resourceId = res[i]["ResourceId"];
                url = res[i]["Url"];
                index = res[i]["LayerIndex"];
                layerName = res[i]["LayerName"];
                featurename = res[i]["FeatureName"];
                feaId = "heatLayer-" + id;
                url = url + "/" + index;
                if (Project_ParamConfig.isProxy == "true")
                    newUrl = Project_ParamConfig.defaultProxy + "/" + url;
                else
                    newUrl = url;
                //查询数据坐标点
                var query = L.esri.Tasks.query(newUrl);
                var whereArr ="1=1";

                query.where(whereArr);
                query.returnGeometry = true;
                query.fields(["OBJECTID"]);
                //query.params.outSr = xingzheng_layer.sr;
                query.run(function (error, featureCollection, response) {
                    var map = L.dci.app.pool.get('MultiMap').getActiveMap();
                    var data=[];
                    if (response && response.geometryType == "esriGeometryPolyline") {
                        for (var j in response.features) {
                            var feature = response.features[j];
                            var polyline = L.multiPolyline(feature.geometry.paths);
                            var center = polyline.getBounds().getCenter();
                            var point = L.point(center.lat, center.lng);
                            var latlng = map.options.crs.projection.unproject(point);
                            data.push([latlng.lat, latlng.lng]);
                        }
                    }
                    else if (response && response.geometryType == "esriGeometryPolygon") {
                        for (var j in response.features) {
                            var feature = response.features[j];
                            var polygon = L.polygon(feature.geometry.rings);
                            var center = polygon.getBounds().getCenter();
                            var point = L.point(center.lat, center.lng);
                            var latlng = map.options.crs.projection.unproject(point);
                            data.push([latlng.lat, latlng.lng]);
                        }
                    }
                    else if (response && response.geometryType == "esriGeometryPoint") {
                        for (var j in response.features) {
                            var geometry = response.features[j].geometry;
                            var latlng = map.options.crs.projection.unproject(geometry);
                            data.push([latlng.lat, latlng.lng]);
                            //data.push([geometry.x, geometry.y,1]);
                        }
                    }
                    if (_this._heatmapLayer == null) {
                        _this._heatmapLayer = L.heatLayer(data, {
                            minOpacity: 0.5,
                            radius: 12,
                        }).addTo(map.map);
                    }
                    else {
                        _this._heatmapLayer.setLatLngs(data);
                    }
                    _this._heatmapLayerId = id;
                    L.dci.app.util.hideLoading();
                }, this);
                
            }
        },
	   /**
       *图层查项目
       *@method proquery
       */
        // proquery: function (data) {
		//	this.len=[];
        //    for (var i = 0; i < data.length; i++) {
        //        var url = "http://192.168.39.34/Services/v1/cpzx/analysis/landbpre/Getprolay/" + data[i];
        //        $.ajax({
        //            async: false,
        //            url: url,
        //            dataType: "json",
        //            type: "get",
        //            context: this,
        //            cache: false,
        //            success: function (res) {
        //              this.len.push(JSON.parse(res))
        //            }
        //        })
        //    }
        //    if (this._queryResult == null)
        //        this._queryResult = new L.DCI.QueryOut();
		//	var _this = this; 
        //    this._queryResult.showTo('规划文本');
        //    this._queryResult.prolayPage(_this.len);
        //},

        /**
        *移除图层
        *@method layerRemove
        *@param id{String}
        *@param target{Object}
        *@private
        */
        layerRemove: function (id, target) {
            var map = L.dci.app.pool.get('MultiMap').getActiveMap();
            //this._setMenuStyle(target, false);
            map.removeLayer("layer-" + id);
        },
        /**
        *设置地图集里三级菜单的状态
        *@method _setMenuStyle
        *@param id{String}
        *@param status{String}
        *@private
        */
        _setMenuStyle: function (target, status) {
            if (target == null) return;
            if (status) {
                $(target).addClass("active");
            }
            else {
                $(target).removeClass("active");
            }
        },

        /**
        *通过专题id设置地图集里三级菜单的状态
        *@method _setMenuStyleById
        *@param id{String}
        *@param status{String}
        *@private
        */
        _setMenuStyleById: function (id, status) {
            var ele = $("#leftpanelcontent_base").find(".baseFeatureLayer");
            if (ele.length == 0) return;
            if (status) {
                for (var i = 0; i < ele.length; i++) {
                    var feaId = $(ele[i]).attr("id").split("-")[2];
                    if (id == feaId) {
                        $(ele[i]).addClass("active");
                        $(ele[i]).find(".hk").animate({ left: "22px" }, 100);
                        $(ele[i]).find(".hk-bg").css("background-color", "#1492ff");
                    }
                }
            }
            else {
                for (var i = 0; i < ele.length; i++) {
                    var feaId = $(ele[i]).attr("id").split("-")[2];
                    if (id == feaId) {
                        $(ele[i]).removeClass("active");
                        $(ele[i]).find(".hk").animate({ left: "0px" }, 100);
                        $(ele[i]).find(".hk-bg").css("background-color", "#ddd");
                    }
                }
            }
        },

        /**
        *通过专题名称可以删除专题集里的专题（提供给右边展示面板类调用）
        *@method removeLayerByName
        *@param name{String}
        *@private
        */
        removeLayerByName: function (name) {
            var ele = $("#leftpanelcontent_subject").find(".subjectFeature");
            if (ele.length == 0) return;
            var id = "";
            for (var i = 0; i < ele.length; i++) {
                var feaName = $(ele[i]).attr("name");
                if (name == feaName) {
                    id = $(ele[i]).attr("id");
                    $("#" + id).click();
                    break;
                }
            }
        },





        /**
        *图例
        *@method legendDeta
        *@param event{Object}
        *@private
        */
        legendDeta: function (event) {
            var type = event.type;
            var target = $(this).data('info');
            if (target == 'legend') {
                var legend = L.DCI.App.pool.get('legend');
                if (type == "mouseenter") {
                } else if (type == "mouseleave") {
                } else {
                    var map = L.dci.app.pool.get('map');
                    map.legend();
                }
            } else { }
        },


        /**
        *添加图层
        *@method _addLayer
        *@param o{Object}
        *@private
        */
        _addLayer: function (o) {
            var target = o.currentTarget;
            var context = o.data.obj;
            if (target.id != null) {
                var id = target.id.split('-')[1];
                if (target.style.color == "red") {
                    context.layerRemove(id, target);
                } else {
                    context.layerAdd(id, target);
                }
            }
        },
        /**
        *添加CAD临时图层
        *@method _addLayer_lin
        *@param o{Object}
        *@private
        */
        _addLayer_lin: function (o) {
            var target = o.currentTarget;
            var dciMap = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _map = L.dci.app.pool.get("map");
            if (target.id != null) {
                var id = target.id.split('-')[2];
                if ($(target).hasClass("active")) {
                    dciMap.removeCad(id);
                    $(target).removeClass("active");
                } else {
                    var layer = null;
                    $.each(dciMap._cadLayerGroups, function (i, group) {
                        if (group.groupId == id) {
                            layer = group.group;
                            return false;
                        }
                    });
                    if (layer) return;
                    $.each(_map.cadLayerGroups, function (i, group) {
                        if (group.groupId == id) {
                            layer = group.group;
                            return false;
                        }
                    });
                    if (!layer) return;
                    dciMap.addCad(id);
                    $(target).addClass("active");
                }
            }
        },
        /**
        *添加SHP临时图层
        *@method _addLayer_lin_s
        *@param o{Object}
        *@private
        */
        _addLayer_lin_s: function (o) {
            var target = o.currentTarget;
            var dciMap = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _map = L.dci.app.pool.get("map");
            if (target.id != null) {
                var id = target.id.split('-')[2];
                if ($(target).hasClass("active")) {
                    dciMap.removeShp(id);
                    $(target).removeClass("active");
                } else {
                    var layer = null;
                    $.each(dciMap._shpLayerGroups, function (i, group) {
                        if (group.groupId == id) {
                            layer = group.group;
                            return false;
                        }
                    });
                    if (layer) return;
                    $.each(_map.shpLayerGroups, function (i, group) {
                        if (group.groupId == id) {
                            layer = group.group;
                            return false;
                        }
                    });
                    if (!layer) return;
                    dciMap.addShp(id);
                    $(target).addClass("active");
                }
            }
        },
        /**
        *临时图层定位
        *@method loctation
        *@param dymap{Object}
        *@param dciMap{Object}
        *@private
        */
        loctation: function (dymap, dciMap) {
            var bounds;
            dymap.metadata(function (error, metadata) {
                var i = metadata.layers.length - 1;
                var s = i.toString();
                var query = new L.esri.Tasks.Find(dymap.url);
                query.layers(s).text('1').fields("FID");
                query.run(function (error, featureCollection, response) {
                    if (response == null || response.results == null || response.results.length == 0) return null;
                    var obj = response.results[0];
                    var type = obj.geometryType;
                    L.dci.app.util.zoomTo(dciMap, obj, true, type);
                });
            });
            return bounds;
        },

    });
    return L.DCI.LeftPanel;
});