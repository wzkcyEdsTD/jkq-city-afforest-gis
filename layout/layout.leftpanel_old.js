/**
*Left布局类
*@module layout
*@class DCI.Layout.LeftPanel
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/leftpanel", [
    "leaflet",
    "core/dcins",
    "layout/base",
    "plugins/mousewheel",
    "query/resultpanel",
    "plugins/scrollbar"
], function (L) {

    L.DCI.Layout.LeftPanel = L.DCI.Layout.extend({
        /**
        *内容模版
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div>'
                    + '<p></p>'
                    + '<div id="shrinknenu" class="shrinknenu icon-previous-page open"></div>'
                    + '<div id="leftpanelcontent" class="leftpanelcontent">'
                        + '<div id="leftpanelcontent_base" class="leftpanelcontent_base">'
                            + '<ul class="leftpanelcontent_base_sub"></ul>'
                            + '<div class="leftpanelcontent_base_class"><ul id="leftpanelcontent_base_class_ul"></ul></div>'
                        + '</div>'
                        + '<div id="leftpanelcontent_subject" class="leftpanelcontent_subject">'
                            + '<ul></ul>'
                        + '</div>'
                    + '</div>'
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
        *已打开主题集的专题名称
        *@property _subjectFeatureName
        *@type {Object}
        *@private
        */
        _subjectFeatureName: [],



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
            if (obj.hasClass("open"))
            {//隐藏
                obj.removeClass("open");
                obj.removeClass("icon-previous-page").addClass("icon-next-page");
                leftPaneObj.animate({
                    left: "-137px"
                }, "fast");
                mapControlObj.animate({
                    left: "0px"
                }, "fast");
            }
            else
            {//展开
                obj.addClass("open");
                obj.removeClass("icon-next-page").addClass("icon-previous-page");
                leftPaneObj.animate({
                    left: "15px"
                }, "fast");
                mapControlObj.animate({
                    left: "150px"
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
                if (mapId == 'map')
                {
                    subjectEle.each(function () {
                        var id = "layer-" + $(this)[0].id.split('-')[2];
                        if (layer.options && layer.options.id == id)
                        {
                            $(this).addClass("active");
                        }
                    });
                }

                baseLayerEle.each(function () {
                    var id = "layer-" + $(this)[0].id.split('-')[2];
                    if (layer.options && layer.options.id == id)
                    {
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
                        L.dci.app.util.dialog.alert("温馨提示", "您没有专题访问权限");
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

            for (var i = 0; i < data.length; i++)
            {
                var status = [false, false, false, false];
                //构建主题集数据
                if (data[i]["FEATUREPARENTID"] == zhutifid)
                {
                    data[i]["status"] = status;
                    featureData.subjectData.push(data[i]);
                    continue;
                }
                if (data[i]["FEATUREPARENTID"] == ditufid)
                {
                    continue;
                }

                //构建地图集数据
                if (data[i]["FEATURETYPE"] == "mapset_class")
                {
                    //data[i]["status"] = status;
                    featureData.baseData.mapsetClass.push(data[i]);
                }
                else if (data[i]["FEATURETYPE"] == "mapset_layer")
                {
                    data[i]["status"] = status;
                    featureData.baseData.mapsetLayer.push(data[i]);
                }
                else
                { }
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
            this.body = $("#leftpanel");
            this.body.html(this.tempHtml);

            //当没有地图集和主题集权限时,菜单栏显示为空白
            if (this._data.subjectData.length == 0 && this._data.baseData.mapsetSub.length == 0)
            {
                $("#leftpanelcontent").addClass("subject");
                return;
            }

            //当没有地图集权限时,菜单栏只显示主题集菜单
            if (this._data.subjectData.length > 0 && this._data.baseData.mapsetSub.length == 0)
            {
                var html = '<span class="full">主题集</span>'
                $("#leftpanel>div>p").html(html);
                $("#leftpanelcontent").addClass("subject");
                this._insertSubjectMenu();
                return;
            }

            //当没有主题集权限时,菜单栏只显示地图集菜单
            if (this._data.subjectData.length == 0 && this._data.baseData.mapsetSub.length > 0)
            {
                var html = '<span class="full">地图集</span>'
                $("#leftpanel>div>p").html(html);
                $("#leftpanelcontent").addClass("base");
                this._insertBaseMenu();
                return;
            }

            //当同时享有地图集和主题集权限时
            if (this._data.subjectData.length > 0 && this._data.baseData.mapsetSub.length > 0)
            {
                var html = '<span>地图集</span><span class="active">主题集</span>'
                $("#leftpanel>div>p").html(html);
                $("#leftpanelcontent").addClass("subject");
                this._insertBaseMenu();
                this._insertSubjectMenu();
            } 
        },

        /**
        *插入地图集菜单
        *@method _insertBaseMenu
        *@private
        */
        _insertBaseMenu: function () {
            //插入地图集一级菜单
            var mapsetClassHtml = this._creatMapsetSubHtml(this._data.baseData.mapsetSub);
            $(".leftpanelcontent_base_sub").html(mapsetClassHtml);
            //绑定地图集一级菜单事件
            $(".leftpanelcontent_base_sub").on('click', 'li:not(".active")', { context: this }, function (e) { e.data.context._changeSubMenu(e); });

            //给地图集一级菜单栏添加滚动条，并隐藏滚动条拖动条
            $('.leftpanelcontent_base_sub').mCustomScrollbar({ theme: 'minimal-dark', axis: "y" });


            //插入地图集二三级菜单
            //获取默认的一级第一项菜单的专题id
            var id = this._data.baseData.mapsetSub[0].FEATUREID;
            var objData = this._getDataByMapsetSubId(id);
            var mapsetClassAndLayerHtml = this._creatMapsetClassAndLayerHtml(objData.mapsetClass, objData.mapsetLayer);
            $(".leftpanelcontent_base_class>ul").html(mapsetClassAndLayerHtml);
            
            $('.leftpanelcontent_base_layer').mCustomScrollbar({ theme: 'minimal-dark', axis: "y" });
            //给地图集二级菜单栏添加滚动条，并隐藏滚动条拖动条
            $('.leftpanelcontent_base_class').mCustomScrollbar({ theme: 'minimal-dark', axis: "y" });
            ////绑定地图集二级菜单事件
            $(".leftpanelcontent_base_class").on('mouseenter', '.baseFeatureClass', { context: this }, function (e) { e.data.context._showLayerMenu(e); });
            $(".leftpanelcontent_base_class").on('mouseleave', '.baseFeatureClass', { context: this }, function (e) { e.data.context._hideLayerMenu(e); });



            this.refreshBaseMenuHeight();
            //绑定地图集三级菜单事件
            $("#leftpanelcontent_base").on('click', 'li.baseFeatureLayer[data-info="map-layer"]', { context: this }, function (e) { e.data.context._addBaseLayer(e); });
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
            for (var i = 0; i < data.length; i++)
            {
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
            var html = '';
            for (var i = 0; i < data.length; i++)
            {
                if (i == 0)
                    html += '<li class="baseFeatureSub active" id="layer-base-' + data[i]["FEATUREID"] + '"><a>' + data[i]["FEATURENAME"] + '</a></li>'
                else
                    html += '<li class="baseFeatureSub" id="layer-base-' + data[i]["FEATUREID"] + '"><a>' + data[i]["FEATURENAME"] + '</a></li>'
            }
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
            for (var i = 0; i < data1.length; i++)
            {
                var picName = 'themes/default/images/layout/' + data1[i]["IMAGENAME"];
                var id = data1[i]["FEATUREID"];
                var name = data1[i]["FEATURENAME"];
                html += '<li class="baseFeatureClass" id="layer-base-' + data1[i]["FEATUREID"] + '" data-info="map-class"><img class="baseFeatureClass_picture" src="' + picName + '"><p>' + data1[i]["FEATURENAME"] + '</p>';
                if(name == "SHP加载数据")
                    html += '<ul class="leftpanelcontent_base_layer" id="shpUL">';
                else if (name == "CAD加载数据")
                    html += '<ul class="leftpanelcontent_base_layer" id="cadUL">';
                else
                    html += '<ul class="leftpanelcontent_base_layer">';
                //先求各个二级专题含有的三级专题数据集
                var data = [];
                for (var j = 0; j < data2.length; j++)
                {
                    if (id == data2[j]["FEATUREPARENTID"])
                        data.push(data2[j]);
                }
                var num = data.length;
                for (var k = 0; k < data.length; k++)
                {
                    html += '<li class="baseFeatureLayer" id="layer-base-' + data[k]["FEATUREID"] + '" title="' + data[k]["FEATURENAME"] + '" data-info="map-layer"><span class="icon-pitch-on"></span><span>' + data[k]["FEATURENAME"] + '</span></li>';
                }
                if (name == "SHP加载数据")
                {
                    $.each(map.shpLayerGroups, function (a, group) {
                        if (group[visible] == false || group[visible] == undefined)
                        {
                            html +='<li class="baseFeatureLayer" id="layer-base-' + group.groupId + '" title = ' + group.name + ' data-info="map-layer_l_s"><span class="icon-pitch-on"></span><span>' + group.name + '</span></li>';
                        } else
                        {
                            html += '<li class="baseFeatureLayer active" id="layer-base-' + group.groupId + '" title = ' + group.name + ' data-info="map-layer_l_s"><span class="icon-pitch-on"></span><span>' + group.name + '</span></li>';
                        }
                    });
                }
                if (name == "CAD加载数据")
                {
                    $.each(map.cadLayerGroups, function (b, group) {
                        if (group[visible] == false || group[visible] == undefined)
                        {
                            html += '<li class="baseFeatureLayer" id="layer-base-' + group.groupId + '" title ="' + group.name + '" data-info="map-layer_l"><span class="icon-pitch-on"></span><span>' + group.name + '</span></li>';
                        } else
                        {
                            html += '<li class="baseFeatureLayer active" id="layer-base-' + group.groupId + '" title ="' + group.name + '" data-info="map-layer_l"><span class="icon-pitch-on"></span><span>' + group.name + '</span></li>';
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
            for (var i = 0; i < baseData.mapsetClass.length; i++)
            {
                if (id == baseData.mapsetClass[i]["FEATUREPARENTID"])
                {
                    var FEATUREID = baseData.mapsetClass[i]["FEATUREID"];
                    classData.push(baseData.mapsetClass[i]);
                    for (var j = 0; j < baseData.mapsetLayer.length; j++)
                    {
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
            switch (text)
            {
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
            var id = $(e.currentTarget).attr("id").split("-")[2];
            $(e.currentTarget).addClass("active").siblings().removeClass("active");
            var objData = this._getDataByMapsetSubId(id);
            var mapsetClassAndLayerHtml = this._creatMapsetClassAndLayerHtml(objData.mapsetClass, objData.mapsetLayer);
            $(".leftpanelcontent_base_class .mCSB_container>ul").html(mapsetClassAndLayerHtml);
            //刷新菜单状态
            this.refreshMenuStatus();
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
                $(".leftpanelcontent_base_class").css("width", "270px");
                $(".leftpanel > div").css("width", "302px");
                $(e.currentTarget).children("ul").addClass("active");
            }else {
                //L.dci.app.util.dialog.alert("温馨提示", "无下拉数据");
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
            $(".leftpanel > div").css("width", "152px");
            var liEle = $(e.currentTarget).find("li");
            if (liEle.length > 0)
            {
                $(e.currentTarget).children("ul").removeClass("active");
            }
        },
        /**
        *刷新菜单状态
        *@method refreshMenuStatus
        *@private
        */
        refreshMenuStatus:function(){
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
                if (type != "map-layer_l" && type !="map-layer_l_s")
                    $(this).removeClass("active");
            });
            map.eachLayer(function (layer) {
                if (mapId == 'map')
                {
                    subjectEle.each(function () {
                        var id = "layer-" + $(this)[0].id.split('-')[2];
                        if (layer.options && layer.options.id == id)
                        {
                            $(this).addClass("active");
                        }
                    });
                }

                baseLayerEle.each(function () {
                    var id = "layer-" + $(this)[0].id.split('-')[2];
                    if (layer.options && layer.options.id == id)
                    {
                        $(this).addClass("active");
                    }
                });
            });
        },
        /**
        *刷新菜单高度
        *@method refreshBaseMenuHeight
        *@private
        */
        refreshBaseMenuHeight:function(){
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
                L.dci.app.util.dialog.alert("温馨提示", "主题集仅限在第一屏使用");
            else
            {
                if ($(target).hasClass("active"))
                {//删除专题
                    //去掉状态
                    $(target).removeClass("active");
                    //移除主题集名称集
                    for (var i = 0; i < this._subjectFeatureName.length; i++)
                    {
                        if (featurename == this._subjectFeatureName[i])
                        {
                            this._subjectFeatureName.splice(i, 1);
                            break;
                        }  
                    }
                    //更新右边功能显示面板功能状态
                    L.dci.app.pool.get('rightPanel').showOneMapFunctionStatus();
                    L.dci.app.tool.removeOneMap(featurename);
                    this.layerRemove(id, target);
                }
                else
                {//添加专题
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
        *添加地图集里的三级专题菜单
        *@method _addBaseLayer
        *@private
        */
        _addBaseLayer: function (e) {
            var target = e.currentTarget;
            var id = target.id.split("-")[2];
            if ($(target).hasClass("active"))
            {
                $(target).removeClass("active");
                this.layerRemove(id, target);
            }
            else
            {
                $(target).addClass("active");
                this.layerAdd(id, target);
            }                
        },
        /**
        *通过map对象id来获取对应状态索引值
        *@method getStatusIndexByMapId
        *@private
        */
        getStatusIndexByMapId: function (id) {
            var index = 0;
            switch (id)
            {
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
            if (mapId == 'map')
            {
                for (var i = 0; i < this._data.length; i++)
                {
                    if (id == this._data[i]["FEATUREID"])
                    {
                        this._data[i]["status"] = status;
                        break;
                    }
                }
            }

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
                            L.dci.app.util.dialog.alert("温馨提示", "该服务已被禁用");
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
                        name: featurename,
                        bboxSR:2379,
                        imageSR: 4326,
                    }
                    layers.push({ layer: url, layerid: feaId });
                }
                map.addLayer(newUrl, options);
            }
        },

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
            if (status)
            {
                $(target).addClass("active");
            }
            else
            {
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
            if (status)
            {
                for (var i = 0; i < ele.length; i++)
                {
                    var feaId = $(ele[i]).attr("id").split("-")[2];
                    if (id == feaId)
                    {
                        $(ele[i]).addClass("active");
                    }
                }
            }
            else
            {
                for (var i = 0; i < ele.length; i++)
                {
                    var feaId = $(ele[i]).attr("id").split("-")[2];
                    if (id == feaId)
                    {
                        $(ele[i]).removeClass("active");
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
            for (var i = 0; i < ele.length; i++)
            {
                var feaName = $(ele[i]).attr("name");
                if (name == feaName)
                {
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
                if ($(target).hasClass("active"))
                {
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