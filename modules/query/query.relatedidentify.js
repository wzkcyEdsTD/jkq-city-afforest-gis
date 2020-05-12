/*
类名：相关查询
说明：
*/
define("query/relatedidentify", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "query/resultpanel"
], function (L) {
    L.DCI.RelatedIdentify = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "relatedidentify",
        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map: null,

        /**
        *查询容差
        *@property _tolerance
        *@type {Number}
        *@private
        */
        _tolerance: 5,
        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: '相关查询',
        /**
       *查询结果集
       *@property _results
       *@type {Arrat}
       *@private
       */
        _results: [],
        /**
        *显示结果
        *@property _feature
        *@type {Array}
        *@private
        */
        _feature: [],
        /**
       *当前地图图层数量
       *@property _count
       *@type {Number}
       *@private
       */
        _count: 0,

        /**
       *html模板
       *@property temp
       *@type {String}
       *@private
       */
        temp: '<div class="regulatoryplan active">'
                + '<div class="top"></div>'
                + '<div class="searchBar"><input type="text"/><span>搜索</span></div>'
                + '<div class="content"></div>'
                + '<div class="bottom"></div>'
             + '</div>'
             + '<div class="regulatoryplan-detail">'
                + '<div class="regulatoryplan-detail-title">'
                    + '<span class="turnback icon-return"></span>'
                    + '<div class="titlecontent"></div>'
                + '</div>'
                + '<div class="regulatoryplan-detail-content"></div>'
             + '</div>',

        /**
        *html详情模板
        *@property detailTemp
        *@type {String}
        *@private
        */
        detailTemp: '<div class="regulatoryplan-detail-content-temple">'
                        + '<div>'
                            + '<span class="title"></span>'
                            + '<span class="operate" data-info="">查看附件</span>'
                        + '</div>'
                        + '<table class="table table-bordered">'
                            + '<tbody class="regulatoryplan-detail-content-tbody"></tbody>'
                        + '</table>'
                  + '</div>',

        /**
        *初始化
        *@method initialize
        */
        initialize: function (map) {
            this._map = map;
            this._config = Project_ParamConfig.relatedIdentifyConfig;
            this._container = L.DomUtil.create("div", 'relatedIdentifyContainer', null);
            $(this._container).html(this.temp);
            this.showTo();
            this.insertAllStatus();
            $('.regulatoryplan .content').mCustomScrollbar({ theme: 'minimal-dark' });          //滚动条
            $('.regulatoryplan-detail-content').mCustomScrollbar({ theme: 'minimal-dark' });    //滚动条
        },

        /**
       *获取内容模版
       *@method getBody
       *@return {String} 内容模版
       */
        getBody: function () {
            return this._container;
        },
        /**
        *插入全部状态内容
        *@method insertAllStatus
        */
        insertAllStatus: function () {
            var containerObj = $(".regulatoryplan>.top");
            var trHtml = '';
            trHtml += '<span class="active">全部</span>';
            for (var i = 0; i < this._config.length; i++) {
                trHtml += '<span>' + this._config[i].name + '</span>';
            }
            trHtml += '<span class="search icon-search-icon"></span>';
            containerObj.html(trHtml);
        },
        /**
       *激活属性查询功能
       *@method active
       */
        active: function () {
            this.clear();
            this._map.activate(L.DCI.Map.StatusType.SELECT, this._callback, null, this);
            //this._map.setCursorImg(this._clsName + ".cur");
        },

        /**
        *查询执行函数
        *@method active
        *@private
        */
        _callback: function (evt) {
            this.clear();
            this._count = this._config.length;
            for (var i = 0; i < this._config.length; i++) {
                var identify = L.esri.Tasks.identifyFeatures(this._config[i].url)
                    .on(this._map.map)
                    .at(evt.latlng)
                    .tolerance(this._tolerance)
                    .layers("all:"+this._config[i].layerIndex);

                identify.run(function (error, featureCollection, response) {
                    this._count--;
                    if (error == null) {
                        this._results = this._results.concat(response.results);
                    }
                    if (this._count == 0)
                        this._showResult();
                }, this);
            }
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
                index: 0
            }
            L.dci.app.pool.get("rightPanel").loadByOption(param);
        },

        /**
        *清除结果
        *@method clear
        */
        clear: function () {
            this._map.getHighLightLayer().clearLayers();
            if (this._feature && this._feature.length > 0) {
                if (this._feature[0] != null) {
                    this._map.getHighLightLayer().removeLayer(this._feature[0]);
                }
                this._feature = [];
            }
            this._results = [];
            this._count = 0;
        },

        /**
        *显示结果
        *@method _showResult
        *@private
        */
        _showResult: function () {
            try {
                //$(".result-list-group-button .button:last-child").click();
                if (this._results.length > 0) {
                    var feature = this._results[0];
                    var geo = L.dci.app.util.highLight(this._map, feature, true, false);
                    this._feature.push(geo);
                }
                this.insertContent(this._results);
                L.dci.app.pool.get("rightPanel").show();
            } catch (e) {
                L.dci.app.util.dialog.error("错误提示", e);
            }
        },
        /**
        *插入控制性详细规划内容
        *@method insertContent
        */
        insertContent: function (data) {
            //清空内容区域和页码区域
            var containerObj = $(".regulatoryplan .content .mCSB_container");
            containerObj.html("");
            $('.regulatoryplan .bottom').html("");
            //判断是否有匹配数据
            if (data == null || data.length == 0) {
                var html = '<p class="emptyResult">没有匹配的数据</p>';
                containerObj.html(html);
            }
            else {
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    var trHtml = '';
                    var obj = data[i];
                    for (var att in obj.attributes) {//遍历要插入的字段信息
                        for (var i = 0; i < this._config[0].displayShortAttributes.length; i++) {
                            if (att == this._config[0].displayShortAttributes[i].name) {
                                trHtml += '<tr><td>' + this._config[0].displayShortAttributes[i].alias + ':</td><td>' + obj.attributes[att] + '</td></tr>';
                                continue;
                            }
                        }   
                    }
                    html += '<div class="percontent" style="height:90px;">'
                        + '<div class="pic1">'
                        + '</div>'
                        + '<div class="percontent-content">'
                        + '<table>'
                        + '<tbody>'
                        + trHtml
                        + '</tbody>'
                        + '</table>'
                        + '</div>'
                        + '<div class="operation">'
                        + '<span class=""></span>'
                        + '<span class="viewDetail">详情</span>'
                        + '</div>'
                        + '</div>';
                    
                }
                containerObj.html(html);

                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.regulatoryplan .bottom'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });
            }
        }
    });
    return L.DCI.RelatedIdentify;
});