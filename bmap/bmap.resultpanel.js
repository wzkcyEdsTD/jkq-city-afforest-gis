/**
*查询结果类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/resultpanel", [
    "leaflet",
    "leaflet/esri",
    "core/dcins",
    "core/baseobject",
    "core/symbol",
    "plugins/scrollbar"
], function (L) {

    L.DCI.BMap.QueryResult = L.Class.extend({

        /**
        *html模版
        *@property temphtml
        *@type {String}
        *@private
        */
        temphtml: '<div id="control-queryresult">'
                        + '<div class="queryresult-content">'
                            + '<div class="resultselect"></div>'
                            + '<div class="resultselect-more"></div>'
                            + '<div class="querydiv"></div>'
                        + '</div>'
                        + '<div class="queryresult-querypage">'
                            + '<div class="querypage"></div>'
                        + '</div>'
                + '</div>',

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'ResultPanel',

        /**
        *标记类
        *@property _symbol
        *@type {Object}
        *@private
        */
        _symbol: null,

        /**
        *右边面板类
        *@property rightPanle
        *@type {Object}
        *@private
        */
        rightPanle: null,

        /**
        *数据数量
        *@property _listNum
        *@type {String}
        *@private
        */
        _listNum: '',

        /**
        *每页显示个数
        *@property _showListNum
        *@type {Number}
        *@private
        */
        _showListNum: 10,

        /**
        *第几页
        *@property _showPageNum
        *@type {String}
        *@private
        */
        _showPageNum: '',

        /**
        *页码总数
        *@property _pageNumCount
        *@type {String}
        *@private
        */
        _pageNumCount: '',

        /**
        *最多显示页码数
        *@property _showMaxPageNum
        *@type {Number}
        *@private
        */
        _showMaxPageNum: 5, 

        /**
        *拆分数据集（里面包含各个layername名称的数据集）
        *@property _resultData
        *@type {Array}
        *@private
        */
        _resultData: [],  

        /**
        *
        *@property _selectDivHeight
        *@type {String}
        *@private
        */
        _selectDivHeight: '',

        /**
        *
        *@property _queryDivHeight
        *@type {String}
        *@private
        */
        _queryDivHeight: '',

        /**
        *
        *@property _queryDivWidth
        *@type {String}
        *@private
        */
        _queryDivWidth: '',

        /**
        *
        *@property _detailsHeight
        *@type {String}
        *@private
        */
        _detailsHeight: '',

        /**
        *是否第一次加载列表数据
        *@property isFirst
        *@type {boolean}
        *@private
        */
        isFirst: true,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._symbol = new L.DCI.Symbol();
        },

        /**
        *浏览版显示
        *@method showOnBmap
        */
        showOnBmap: function (bodyIndex) {
            this.rightPanle = L.dci.app.pool.get('bmapRightPanel');
            this.rightPanle.load(this.temphtml, bodyIndex);
        },

        /**
        *导入
        *@method load
        */
        load: function (features) {
            isFirst = true;
            this._resultData.length = 0;
            if ($(".rightpanel-details").length > 0)
                $(".rightpanel-details").remove();
            this._listNum = features.length;                //数据总数
            this.showCount(this._listNum);                  //显示总数
            this._resultData = this.splitFeatures(features);      //总数据拆分
            this.showList(this._resultData);                          //显示列表对象
            if (features.length > 0) {
                this.getPageData(features, 1);                  //获取第1页数据（显示布局、页码布局） 
            }
            else {
                this.showEmptyResult();
                //隐藏加载动画
                this.rightPanle.hideLoading();
            }


        },

        /**
        *没有内容时提示
        *@method showEmptyResult
        */
        showEmptyResult: function () {
            var html = '<p class="emptyResult">没有查询结果!</p>';
            var bodyObj = $(".queryresult-content");
            var divObj = $(".querydiv");
            if (divObj.length > 0) {
                $("div").remove(".querydiv");
                bodyObj.append('<div class="querydiv"></div>');
            }
            $(".querydiv").html(html);
        },

        /**
        *设置页码总数  (参数num: 结果数目)
        *@method setPageNum
        */
        setPageNum: function (listNum) {
            if (listNum == 0)
                this._pageNumCount = 0;
            if (listNum > 0)
                this._pageNumCount = Math.ceil(listNum / this._showListNum);
        },

        /**
        *显示总数
        *@method showCount
        */
        showCount: function (num) {
            $(".countNum").html(num);
        },

        /**
        *总数据拆分
        *@method splitFeatures
        */
        splitFeatures: function (features) {
            var layerNameArray = new Array();   //layername名称集
            var resultArray = new Array();      //拆分数据集（里面包含各个layername名称的数据集）

            if (features.length > 0) {
                //获取layername的数组
                for (var i = 0; i < features.length; i++) {
                    var name = features[i].layerName;
                    if (layerNameArray.length == 0)
                        layerNameArray.push(name);
                    else {
                        var num = 1;
                        for (var j = 0; j < layerNameArray.length; j++) {
                            if (name == layerNameArray[j]) {
                                num = 0;
                                break;
                            }
                        }
                        if (num == 1) {
                            layerNameArray.push(name);
                        }
                    }
                }

                //获取每个layername名称的数据集
                for (var i = 0; i < layerNameArray.length; i++) {
                    var array = new Array();
                    for (var j = 0; j < features.length; j++) {
                        if (layerNameArray[i] == features[j].layerName) {
                            var obj = new Object();
                            obj = features[j];
                            array.push(obj);
                        }
                    }

                    var resultObj = new Object();
                    resultObj = array;
                    resultArray.push(resultObj);
                    array = null;
                }

                //保存所有的数据集
                var allResult = new Array();
                for (var i = 0; i < features.length; i++) {
                    allResult.push(features[i]);
                }
                resultArray.push(allResult);
            }
            return resultArray;
        },

        /**
        *字符串长度控制
        *@method controlString
        */
        controlString: function (option) {
            var str = '';
            if (option.length <= 14)   //5
                str = option;
            else
                str = option.substr(0, 12) + '...';   //0,3

            return str;
        },

        /**
        *显示列表对象（option数组最后一个是总的数据集）
        *@method showList
        */
        showList: function (option) {
            var _this = this;
            var resultData = option;
            var featureResult = new Array();
            var length = option.length;
            var emptyNum = 0;
            var mod = length % 3;
            if (mod > 0) {
                emptyNum = 3 - mod;
            }
            if (length > 0) {
                var listHtml = '';
                listHtml += '<div class="resultselect qrtab selected" data-info=' + (length - 1) + '><div class="textContent">全部(' + option[length - 1].length + ') </div><span id="resultselect-span" class="icon-arrows-down"></span></div>';
                listHtml += '<ul class="resultselect-ul">';
                listHtml += '<li class="resultselectActive"><span class="resultselectSpan" data-info=' + (length - 1) + '>全部(' + option[length - 1].length + ')</span></li>';
                for (var i = 0; i < length - 1; i++) {
                    var name = option[i][0].layerName;
                    var strlength = name.length;
                    if (strlength <= 14)
                        listHtml += '<li><span class="resultselectSpan" data-info= ' + i + '>' + option[i][0].layerName + '(' + option[i].length + ')' + '</span></li>';
                    else
                        listHtml += '<li title=' + option[i][0].layerName + '><span class="resultselectSpan" data-info= ' + i + '>' + this.controlString(name) + '(' + option[i].length + ')' + '</span></li>';
                }
                //补空白格
                if (emptyNum > 0) {
                    for (var j = 0; j < emptyNum; j++)
                        listHtml += '<li><p data-info="-1"></p></li>';
                }
                listHtml += '</ul>';
                $(".resultselect").html(listHtml);
            }
            else  //查询内容为空
            {
                var listHtml = '<div class="resultselect qrtab selected" data-info="-1"><div class="textContent">全部(0) </div><span id="resultselect-span" class="icon-arrows-down"></span></div>';
                listHtml += '<ul class="resultselect-ul"><li class="resultselectActive"><span class="resultselectSpan" data-info="-1">全部(0)</span></li><li><p data-info="-1"></p></li><li><p data-info="-1"></p></li></ul>';
                $(".resultselect").html(listHtml);
            }

            //初始化
            $(".resultselectActive").children().css({ "color": "#ffb400" });
            $(".resultselect .resultselect-ul").hide();
            //绑定点击下拉事件
            $(".resultselect .resultselect").click(function(){
                $(".resultselect .resultselect-ul").slideToggle("fast");
            });
            //点击列表对象
            $(".resultselect-ul li").on('click', function (e) {
                $(".resultselect .textContent").html(e.target.innerHTML);
                $(".resultselect .resultselect-ul").hide();
                var obj = L.dci.app.pool.get('ResultPanel');
                var kk = obj._resultData;
                var i = $(this).children().attr("data-info");
                if (i != "-1") {
                    $(".resultselectActive").removeClass("resultselectActive").children().css({ "background-color": "#ffffff", "color": "#000000" });
                    $(this).addClass("resultselectActive").children().css({ "color": "#ffb400" });
                    _this.getPageData(resultData[i], 1);
                }
            });
        },

        /**
        *获取第几页数据
        *@method getPageData
        */
        getPageData: function (features, num) {
            var dataArray = new Array();
            var showNum = this._showListNum;                //每页显示个数
            var length = features.length;                   //总个数
            var limitNum = num * this._showListNum;
            if (length > 0) {
                if (limitNum <= length) {
                    for (var i = (limitNum - showNum) ; i < limitNum; i++) {
                        dataArray.push(features[i]);
                    }
                }
                else if (limitNum > length) {
                    for (var i = ((num - 1) * showNum) ; i < length; i++) {
                        dataArray.push(features[i]);
                    }
                }
            }
            //显示
            this.showPage(dataArray);
            //显示页码
            this.setPageNum(length);         //页码总数
            this.showPagePanel(num, this._showMaxPageNum, this._pageNumCount, features);
        },

        /**
        *显示分页
        *@method showPage
        */
        showPage: function (data) {
            //var kk = data[0];
            var _this = this;
            var bodyObj = $(".queryresult-content");
            var divObj = $(".querydiv");
            if (divObj.length > 0) {
                $("div").remove(".querydiv");
                bodyObj.append('<div class="querydiv"></div>');
            }



            

            var listHtml = "";
            for (var i = 0; i < data.length; i++) {
                var attI = "项目编码";
                for (var att in data[i].attributes) {
                    if (data[i].value == data[i].attributes[att]) {
                        attI = att;
                        break;
                    }
                }
                listHtml += '<div class="resultselect-list" data-info="' + i + '">'
                                + '<div class="resultselect-list-title">'// + data[i].value
                                    + '<table><tbody>'
                                    + '<tr><td>' + attI + '：</td><td>' + data[i].value + '</td></tr>'
                                    + '<tr><td>所属图层：</td><td>' + data[i].layerName + '</td></tr>'
                                    + '</tbody></table>'
                                + '</div>'     //data[i].value   data[i].attributes.项目名称
                                + '<div class="resultselect-list-body">'
                                    //+ '<span class="ViewForm" id="' + data[i].attributes.图文关联ID + '">查看表单</span>'
                                    + '<span class="resultselect-list-view" data-info="' + i + '">详情</span>'
                                + '</div>'
                          + '</div>';
            }
            $(".querydiv").html(listHtml);

            var te = $(".querydiv")[0];

            //滚动条
            $(te).mCustomScrollbar({
                theme: "minimal-dark"
            });

            //隐藏加载动画
            this.rightPanle.hideLoading();

            $(".resultselect-list").click(function () {
                var i = $(this).attr("data-info");
                var dataObj = data[i];
                _this.location(dataObj);
                if (!$(this).hasClass("selected")) {
                    $(".querydiv .selected").removeClass("selected");
                    $(this).addClass("selected");
                }
                //else if ($(this).hasClass("selected")) {
                //    $(this).removeClass("selected");
                //    var map = L.dci.app.pool.get('bmap');
                //    map.getHighLightLayer().clearLayers();
                //}
            });
            //高亮第一项
            var firstObj = $($(".resultselect-list")[0]);
            if (isFirst) {
                firstObj.click();
                isFirst = false;
            } else if (!firstObj.hasClass("selected")) {
                firstObj.addClass("selected");
            }


            //详情
            $(".resultselect-list-view").click(function () {
                var markStatus = $(this).parent().siblings('span').attr("marked");
                var num = $(this).attr("data-info");
                var dataObj = data[num];
                console.log(dataObj.attributes.picture);
                L.dci.app.pool.get("bmapRightPanel").details();
                _this.detailsHtml(dataObj);
                
                if (markStatus == "true")
                {
                    $(".details-marker-icon").attr("marked", "true");
                    $(".details-marker-icon").css("color", "red");
                }
            });

            //查看表单
            $(".ViewForm").click(function () {
                var caseId = $(this).attr("id");    //图文关联id
                L.dci.util.tool.autoLogin(caseId);
            });
        },

        /**
       *分页布局  (currentPage:当前页、maxPageNum：最多显示页码个数、pageAcount：页码总个数)
       *@method showPagePanel
       */
        showPagePanel: function (currentPage, maxPageNum, pageAcount, features) {
            var _this = this;
            var pageHtml = this.setPagePanel(currentPage, maxPageNum, pageAcount);
            //显示页码
            $(".querypage").html(pageHtml);
            $(".pageActive").css({ "background-color": "#ffb400", "color": "#fff" });
            //点击页码
            $(".pagination a").click(function () {
                var text = $(this).attr("data");
                var num = parseInt(text);
                if (num == 0)           //上一页
                {
                    if (!isNaN(currentPage)) {
                        if (currentPage == 1) {      //当前页面为第一页时，点上一页没效
                        }
                        else {
                            var clickNum = currentPage - 1;
                            _this.getPageData(features, clickNum);
                        }
                    }
                }
                else if (num == -1) {    //下一页
                    if (!isNaN(currentPage)) {
                        if (currentPage == pageAcount) {
                        }
                        else {
                            var clickNum = currentPage + 1;
                            _this.getPageData(features, clickNum);
                        }
                    }

                }
                else if (num >= 1 && num <= pageAcount) {
                    if (!isNaN(currentPage)) {
                        if (num != currentPage)
                            _this.getPageData(features, num);
                    }

                }

            });
        },

        /**
       *设置页码布局 (currentPage:当前页、maxPageNum：最多显示页码个数、pageAcount：页码总个数)
       *@method setPagePanel
       */
        setPagePanel: function (currentPage, maxPageNum, pageAcount) {
            var pageHtml = '';
            if (pageAcount >= 2) {
                var html = '';
                if (pageAcount <= maxPageNum) {//当页码总数<最多显示页码个数,显示全部页码
                    for (var i = 1; i <= pageAcount; i++) {
                        if (i == currentPage) {
                            html += '<li><a class="pageActive" href="#" data=' + i + '>' + i + '</a></li>';
                        }
                        else {
                            html += '<li><a href="#" data=' + i + '>' + i + '</a></li>';
                        }
                    }
                }
                else if (pageAcount > maxPageNum) {//当页码总数>最多显示页码个数

                    if (currentPage < maxPageNum - 1) {
                        for (var i = 1; i <= maxPageNum; i++) {
                            if (i == currentPage) {
                                html += '<li><a class="pageActive" href="#" data=' + i + '>' + i + '</a></li>';
                            }
                            else {
                                html += '<li><a href="#" data=' + i + '>' + i + '</a></li>';
                            }
                        }
                    }

                    if (currentPage >= maxPageNum - 1 && currentPage <= pageAcount - 3) {
                        for (var i = currentPage - 2; i <= currentPage + 2; i++) {
                            if (i == currentPage) {
                                html += '<li><a class="pageActive" href="#" data=' + i + '>' + i + '</a></li>';
                            }
                            else {
                                html += '<li><a href="#" data=' + i + '>' + i + '</a></li>';
                            }
                        }
                    }

                    if (currentPage > pageAcount - 3 && currentPage <= pageAcount) {
                        for (var i = pageAcount - 4; i <= pageAcount; i++) {
                            if (i == currentPage) {
                                html += '<li><a class="pageActive" href="#" data=' + i + '>' + i + '</a></li>';
                            }
                            else {
                                html += '<li><a href="#" data=' + i + '>' + i + '</a></li>';
                            }
                        }
                    }

                }

                pageHtml += '<div class="pagination">'
                            + '<ul>'
                                + '<li><a href="#" data="0"><span class="icon-previous-page"></span></a></li>'
                                + html
                                + '<li><a href="#" data="-1"><span class="icon-next-page"></span></a></li>'
                            + '</ul>'
                          + '</div>';
            }
            return pageHtml;
        },

        /**
        *定位
        *@method location
        */
        location: function (obj) {
            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();
            var _map = map.getMap();
            var type = obj.geometryType;
            var latlng = '';
            var geo = this.unproject(map, obj, type);
            if (type == "esriGeometryPolygon") {
                latlng = geo.getBounds().getCenter();
                geo.setStyle(this._symbol.highlightPolygonSymbol);
            }
            else if (type == "esriGeometryPolyline") {
                var paths = geo.getLatLngs();
                latlng = paths[Math.round(paths.length / 2)];
                geo.setStyle(this._symbol.highlightPolylineSymbol);
            } else {
                latlng = L.latLng(geo.x, geo.y);
                geo.setStyle(this._symbol.highlightPointSymbol);
            }

            map.getHighLightLayer().addLayer(geo);
            _map.setView(latlng, map.cuOptions.maxZoom / 2);
        },

        /**
        *详情布局
        *@method detailsHtml
        */
        detailsHtml: function (obj) {
            var trHtml = '';
            var _this = this;
            //获取属性
            for (var att in obj.attributes) {
                if (_this.isContain(att) == true)
                    continue;
                var value = _this.isNull(obj.attributes[att])
                trHtml += '<tr class="datails-table-info-tr"><td class="key">' + att + '</td><td class="key-value">' + value + '</td></tr>'
            }

            var html = '<div class="details-title">'
                            + '<div class="return"><span class="icon-return"></span></div>'
                            + '<div class="details-title-name">' + obj.value + '---' + obj.layerName + '</div>'
                     + '</div>'
                     + '<div class="datails-table">'
                            + '<div class="datails-table-info">'
                                + '<table>'
                                + trHtml
                                + '</table>'
                            + '</div>'
                     + '</div>';

            $(".rightpanel-details-info").html(html);
            //滚动条
            $(".datails-table-info").mCustomScrollbar({
                theme: "minimal-dark"
            });
            //返回
            $(".return>span").click(function () {
                $(".rightpanel-details").remove();
            });
        },

        /**
        *判断是否是不现实的字段
        *@method isContain
        */
        isContain: function (att) {
            var filter = ["objectid", "shape", "shape.len", "shape.area"];
            for (var i = 0; i < filter.length; i++) {
                if (att.toLowerCase() == filter[i])
                    return true;
            }
            return false;
        },

        /**
        *判断是否Null,如果是则为空值
        *@method isNull
        */
        isNull: function (value) {
            var filter = "null";
            if (value.toLowerCase() == filter)
                return " ";
            else
                return value;
        },

        /**
        *转换坐标系
        *@method unproject
        */
        unproject: function (map, feature, geoType) {
            try {
                var pnts = [], geo = null;
                var _map = map.getMap();
                switch (geoType) {
                    case "esriGeometryPolygon"://面
                    case "Polygon":
                        var paths = feature.geometry.rings == null ? feature.geometry.coordinates[0] : feature.geometry.rings[0];
                        for (var i = 0; i < paths.length; i++) {
                            var pnt = _map.options.crs.projection.unproject(L.point(paths[i]));
                            pnts.push([pnt.lat, pnt.lng]);
                        }
                        geo = L.polygon(pnts);
                        break;
                    case "esriGeometryPolyline"://线
                    case "Polyline":
                        var paths = feature.geometry.paths == null ? feature.geometry.coordinates[0] : feature.geometry.paths[0];
                        for (var i = 0; i < paths.length; i++) {
                            var pnt = _map.options.crs.projection.unproject(L.point(paths[i]));
                            pnts.push([pnt.lat, pnt.lng]);
                        }
                        geo = L.polyline(pnts);
                        break;
                    case "esriGeometryPoint"://点
                    case "Point":
                        var pnt = _map.options.crs.projection.unproject(L.point(feature.geometry.x, feature.geometry.y));
                        pnts.push([pnt.lat, pnt.lng]);
                        var latlng = L.latLng(pnts[0][0], pnts[0][1]);
                        geo = L.marker(latlng);
                        break;
                }
            } catch (e) {
                throw "unproject:" + e;
            }
            return geo;
        },

    });
    return L.DCI.BMap.QueryResult;
});