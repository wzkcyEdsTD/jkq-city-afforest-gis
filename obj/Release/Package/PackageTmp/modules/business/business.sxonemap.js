/**
*时限一张图类
*@module modules.business
*@class DCI.Business.SXOneMap
*@constructor initialize
*/
define("business/sxonemap", [
    "leaflet",
    "leaflet/esri",
    "core/dcins",
    "data/ajax",
    "controls/dlLegend",
    "controls/paging",
    "plugins/pagination"
], function (L) {
    L.DCI.Business.SXOneMap = L.DCI.Layout.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "business-sxonemap",

        /**
        *模块名称
        *@property _clsName
        *@type {String}
        *@private
        */
        _clsName: '时限一张图',

        /**
        *保存当前页的数据
        *@property _currentData
        *@type {Array}
        *@private
        */
        _currentData: [],

        /**
        *保存总的数据
        *@property _allData
        *@type {Array}
        *@private
        */
        _allData: [],

        /**
        *上下文对象
        *@property _this
        *@type {Array}
        *@private
        */
        _this: null,

        /**
        *分页控件对象
        *@property paging
        *@type {Object}
        *@private
        */
        paging: null,

        /**
        *总共有多少页数据
        *@property pageNum
        *@type {Number}
        *@private
        */
        pageNum: 0,

        /**
        *当前显示页码
        *@property currentPage
        *@type {Number}
        *@private
        */
        currentPage: 1,

        /**
        *每页最多显示个数
        *@property pageSize
        *@type {Number}
        *@private
        */
        pageSize: 5,


        /**
        *每页最多显示内容个数
        *@property maxShowContentNum
        *@type {Number}
        *@private
        */
        maxShowContentNum: 10,

        /**
        *保存查看的详情的项目当前页索引号(默认值为-1)
        *@property detailDataIndex
        *@type {Number}
        *@private
        */
        detailDataIndex: -1,

        /**
        *查询条件
        *@property wherehttp://localhost/DCI.Client/modules/login
        *@type {String}
        *@private
        */
        where: '0',

        /**
        *查询模版
        *@property whereQueryUrlTemplet
        *@type {String}
        *@private
        */
        whereQueryUrlTemplet: 'query?text=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&objectIds=&time=&returnCountOnly=false&returnIdsOnly=false&returnGeometry=true&maxAllowableOffset=&outSR=&outFields=&f=pjson&where=',

        /**
        *整体内容模版
        *@property filterHtmlTemplet
        *@type {String}
        *@private
        */
        filterHtmlTemplet: '<div class="business-sxonemap-abstract-container">'
                                 + '<div class="business-sxonemap-filter-container">'
                                     + '<table>'
                                     + '</table>'
                                 + '</div>'
                                 + '<div class="business-sxonemap-data-container">'
                                 + '</div>'
                                 + '<div id="business-sxonemap-paging" class="bottom"></div>'
                            + '</div>',
        /**
        *具体项目内容模版
        *@property projHtmlTemplet
        *@type {String}
        *@private
        */
        projHtmlTemplet: '<div class="min_pic"></div>'
                        + '<div style="float:right;width:70px;"><input type="button" value="查看业务"/></div>'
                        + '<div class="sxonemap-data-item" style="width:100%;">'
                        + '</div>',

        /**
        *初始化
        *@method initialize
        *@param layer{Object} 图层对象
        *@param options{Object} 配置参数对象
        */
        initialize: function (layer, options) {
            this._clsName = Project_ParamConfig.sxOneMapConfig.name;
            this._this = this;
            //this._layer = layer;
            this._dciAjax = new L.DCI.Ajax();
            var dciMap = L.DCI.App.pool.get("map");
            //var layid = options.layerid;
            //this.lay = dciMap.getLayer(layid);
            this._map = dciMap.getMap();
            this._createUi();
            /*获取图层数据*/
            this.showTo();
        },

        /**
        *显示内容到容器中
        *@method showTo
        */
        showTo: function () {
            var param = {
                context: this,
                title: this._clsName,
                selected: true,
                index: 1
            }
            L.dci.app.pool.get("rightPanel").loadByOption(param);
        },
        /**
        *获取内容模版
        *@method getBody
        *@return {Object} 内容容器对象
        */
        getBody: function () {
            return this._container;
        },

        /**
        *插入内容容器
        *@method addTo
        *@param container {Object} 内容容器对象
        */
        addTo: function (container) {
            if (container != null && container.length > 0)
                this._parentContainer = container[0];
            else
                this._parentContainer = container;

            $(this._parentContainer).html('');
            this._parentContainer.appendChild(this._container);
        },

        /**
        *移除内容容器
        *@method remove
        */
        remove: function () {
            this._parentContainer.removeChild($(this._parentContainer).find('.business-sxonemap-container')[0]);
        },

        /**
        *创建面板视图
        *@method _createUi
        */
        _createUi: function () {
            var context = this;
            this._container = L.DomUtil.create("div", 'business-sxonemap-container', null);
            $(this._container).html(this.filterHtmlTemplet);
            this._requestFilter();
            this._requestProjectList(1, this.maxShowContentNum, '0');
        },

        /**
        *请求服务获取条件过滤参数
        *@method _requestFilter
        */
        _requestFilter: function () {
            var data = [{ "key": "", "value": "全部" },
                        { "key": "SXQK='超时'", "value": "超时案件" },
                        { "key": "SXQK='即将超时'", "value": "即将超时案件" },
                        { "key": "SXQK='正常办理'", "value": "正常案件" }];
            this._fillCheckFilters(data);
        },

        /**
        *请求服务获取项目数据
        *@method _requestProjectList
        *@param page {Number} 请求页码
        *@param size {Number} 最多显示内容个数
        *@param where {String} 查询条件
        */
        _requestProjectList: function (page, size, where) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();

            L.dci.app.services.businessService.getProjects({
                page: page,
                size: size,
                where: where,
                context: this,
                success: this._fillProjectList
            });
        },

        /**
        *根据ID查询项目
        *@method queryProjectByIds
        *@param items{Array} 结果数组
        */
        queryProjectByIds: function (items) {
            var checkTds = $(this._container).find('.business-sxonemap-filter-container td');
            $(checkTds).removeClass("business-sxonemap-filter-container-td-selected");
            $(this._container).find('.business-sxonemap-filter-container td:first-child').addClass("business-sxonemap-filter-container-td-selected");
            if (items.length == 0)
            {
                //状态信息
                this.detailDataIndex = -1;

                $(".business-sxonemap-data-container")[0].innerHTML = '<div class="tip">无匹配数据<div>';
                return;
            }
            this._currentSelectedObj = items[0];
            var ids = [];
            for (var i = 0; i < items.length; i++) {
                ids.push(items[i].attributes[Project_ParamConfig.sxOneMapConfig.queryAttribute]);
            }
            L.dci.app.services.businessService.querySxProjectByIds({
                ids:ids,
                context: this,
                success: function(res) {
                    this._fillProjectList(res);

                    //高亮列表栏项
                    var selecteds = $(".business-sxonemap-data-item-container");
                    var projectId;
                    for (var i = 0; i < selecteds.length; i++) {
                        projectId = $.trim($(selecteds[i]).attr("data-projectid"));
                        if (projectId == ids[0]) {
                            $(selecteds[i]).addClass("business-sxonemap-data-item-container-selected");
                            this.detailDataIndex = i;
                            break;
                        }
                    }

                }
            });
        },

        /**
        *填充下拉过滤选择值
        *@method _fillCheckFilters
        *@param data {Number} 请求获取到的数据
        */
        _fillCheckFilters: function (data) {
            if (data != null && data.length > 0) {
                var html = "";
                for (var i = 0; i < data.length; i++) {
                    var filter = data[i];
                    var label = filter.value;
                    var key = filter.key;
                    html = html + '<td tag="' + key + '">' + label + '</td>';
                }
                var table = $(this._container).find('.business-sxonemap-filter-container table')[0];
                $(table).html("<tr>" + html + "</table>");
                var checkTds = $(this._container).find('.business-sxonemap-filter-container td');
                /*注册过滤条件点击事件*/
                if (checkTds != null && checkTds.length > 0)
                for (var j = 0; j < checkTds.length; j++) {
                    if (j == 0)
                        $(checkTds[j]).addClass("business-sxonemap-filter-container-td-selected");
                    L.DomEvent.on(checkTds[j], 'click', this._checkFilterClick, this);
                }
            }
        },

        /**
        *填充项目列表数据
        *@method _fillCheckFilters
        *@param data {Number} 请求获取到的数据
        */
        _fillProjectList: function (data) {
            //恢复默认值
            this.detailDataIndex = -1;


            var dataContainer = $(this._container).find('.business-sxonemap-data-container')[0];
            if (data.data != null && data.data.length >= 0)
                $(dataContainer).html('');
            dataContainer = this.refushDatac(dataContainer);

            var primaryKey = data.primaryKey;
            var totalCount = data.totalCount; 
            this.pageNum = Math.ceil(totalCount / this.maxShowContentNum);
            if (totalCount > 0) {
                for (var i = 0; i < data.data.length; i++) {
                    var projContainer = L.DomUtil.create("div", "business-sxonemap-data-item-container", dataContainer);
                    $(projContainer).html(this.projHtmlTemplet);
                    var pContainer = $(projContainer).find("div")[2];
                    var element = data.data[i];
                    $(projContainer).attr("number", i);
                    $(projContainer).attr("data-caseid", element[primaryKey]);
                    $(projContainer).attr("data-projectid", element["XMBH"]);
                    var phtml = "";
                    for (var j = 0; j < data.fieldSet.length; j++) {
                        if (data.fieldSet.name=="XMBH")continue;
                        var name = data.fieldSet[j].name;
                        var alias = data.fieldSet[j].alias;
                        var value = element[name];
                        if (value != null && value.length > 0) {
                            phtml = phtml + '<p><span>' + alias + '：</span><span>' + value + '</span></p>';
                        }
                    }
                    $(pContainer).html(phtml);
                    var details = $(projContainer).find("input[type=button]")[0];
                    $(details).attr("tag", primaryKey + "='" + element[primaryKey] + "'");
                }

                var buttons = $(dataContainer).find("input[type=button]");
                var locations = $(dataContainer).find(".icon-location");
                for (var j = 0; j < buttons.length; j++)
                    L.DomEvent.on(buttons[j], 'click', this._projectDetailsClick, this);
                for (var img = 0; img < locations.length; img++)
                    L.DomEvent.on(locations[img], 'click', this._projectLocationClick, this);

                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('#business-sxonemap-paging'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });
            } else {
                $(".business-sxonemap-data-container")[0].innerHTML = '<div class="tip">无匹配数据<div>';
            }
            $(".business-sxonemap-data-item-container").on('click', { context: this }, function (e) {
                var _this = e.data.context;
                if ($(e.currentTarget).hasClass("business-sxonemap-data-item-container")) {
                    if ($(e.currentTarget).hasClass("business-sxonemap-data-item-container-selected")) {

                    } else {
                        $(".business-sxonemap-data-item-container").removeClass("business-sxonemap-data-item-container-selected");
                        $(e.currentTarget).addClass("business-sxonemap-data-item-container-selected");
                    }
                    var id = $(e.currentTarget).attr("data-projectid");
                    _this.detailDataIndex =parseInt($(e.currentTarget).attr("number"));
                    _this._zoomTo(id);
                    e.stopPropagation();
                }
            });

            //滚动条
            $(dataContainer).mCustomScrollbar({
                theme: "minimal-dark"
            });
        },

        /**
        *重新生成内容容器对象
        *@method refushDatac
        *@param dataContainer {Object} 内容容器对象
        *@return {Object} 内容容器对象
        */
        refushDatac: function (dataContainer) {
            $(dataContainer).remove();
            var container = $(this._container).find('.business-sxonemap-abstract-container')[0];
            dataContainer = L.DomUtil.create("div", 'business-sxonemap-data-container', container);

            $('#business-sxonemap-paging').html("");
            return dataContainer;
        },

        /**
        *切换过滤值
        *@method _checkFilterClick
        */
        _checkFilterClick: function (e) {
            var checkTds = $(this._container).find('.business-sxonemap-filter-container td');
            $(checkTds).removeClass("business-sxonemap-filter-container-td-selected");
            $(e.target).addClass("business-sxonemap-filter-container-td-selected");

            var tag = $(e.target).attr('tag');
            this.where = tag == "" ? 0 : tag;
            this.currentPage = 1;
            this._requestProjectList(this.currentPage, this.maxShowContentNum, this.where);
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
            //地图过滤
            //var def = { "0": this.where };
            //this.lay.setLayerDefs(def);
        },

        /**
        *查看业务点击事件
        *@method _projectDetailsClick
        */
        _projectDetailsClick: function (e) {
            var tag = $(e.target).attr("tag");
            var caseId = tag.split('=')[1];
            caseId = caseId.replace("'", "");
            caseId = caseId.replace("'", "");
            L.dci.app.util.tool.autoLogin(caseId);
            e.stopPropagation();
        },


        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this._requestProjectList(this.currentPage, this.maxShowContentNum, this.where);
        },


        /**
        *高亮
        *@method _fitMapBound2QueryFeatures
        *@param content{Object} 
        *@param obj{Object} 数据集
        */
        _fitMapBound2QueryFeatures: function (content, obj) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.clear();
            var type = obj.geometryType;
            if (obj.features != null && obj.features.length > 0) {
                var feature = obj.features[0];
                L.dci.app.util.highLight(map, feature, true, true, type);
            }
        },
        /**
        *根据当前ID定位项目
        *@method _zoomTo
        *@param value{Array}ID数组
        */
        _zoomTo: function (value) {
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                if (layer.options
                    && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && layer.options.name == this._clsName) {
                    layer.metadata(function (error, metadata) {
                        if (metadata == null) return;
                        var layers = [];
                        for (var i = 0 ; i < metadata.layers.length; i++) {
                            layers.push(metadata.layers[i].id.toString());
                        }
                        L.dci.app.util.locate.doFind(layer.url, layers, Project_ParamConfig.sxOneMapConfig.zoomItemName, value, function (featureCollection, response) {
                            this._currentSelectedObj = featureCollection;
                        });
                    }, this);
                }
            }, this);
        },

        /**
        *隐藏当前高亮对象
        *@method showMarks
        */
        hideMarks: function () {
            if (this.detailDataIndex == -1) return;
            var ele = $(".business-sxonemap-container").find("div.business-sxonemap-data-item-container")[this.detailDataIndex];
            $(ele).removeClass("selected");
        },

        /**
        *高亮当前高亮对象
        *@method showMarks
        */
        showMarks: function () {
            if (this.detailDataIndex == -1) return;
            var ele = $(".business-sxonemap-container").find("div.business-sxonemap-data-item-container")[this.detailDataIndex];
            $(ele).click();
        }
    });

    return L.DCI.Business.SXOneMapMap;
});

