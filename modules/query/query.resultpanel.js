/**
*查询结果类
*@module modules.query
*@class DCI.QueryResult
*@constructor initialize
*/
define("query/resultpanel", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "plugins/scrollbar",
    "layui/layui"
	//"library/layer",
], function (L) {
    L.DCI.QueryResult = L.Class.extend({
        /**
        *界面主体
        *@property temphtml
        *@type {String}
        */
        temphtml: '<div class="resultselect qrtab selected" data-info=""><div class = "textContent">全局搜索</div></div>'
                    + '<div class="queryresult-content">'
                        + '<div class="querydiv"></div>'
                        + '<div class="resultselect-choice">'
                            + '<ul></ul>'
                        + '</div>'
                        + '<div class="queryresult-querypage">'
                            + '<div class="querypage"></div>'
                        + '</div>'
                    + '</div>'
                    + '<div class="queryresult-data-container" style="display:none">'
                        + '<div class="content"></div>'
                        + '<div class="bottom"></div>'
                    + '</div>',
        /**
       *类标识
       *@property id
       *@type {String}
       */
        id: 'ResultPanel',
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
        *@type {Number}
        *@private
        */
        _showPageNum: '',
        /**
        *页码总数
        *@property _pageNumCount
        *@type {Number}
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

        _selectDivHeight: '',
        _queryDivHeight: '',
        _queryDivWidth: '',
        _detailsHeight: '',

        _showType:'',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._container = L.DomUtil.create("div", 'control-queryresult', null);
            $(this._container).html(this.temphtml);
        },

        /**
        *显示内容到容器中
        *@method showTo
        */
        showTo: function (clsName) {
            var param = {
                context: this,
                title: clsName,
                selected: true,
                index: 0
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
        *初始化
        *@method load
        *@param features {Object} 要素
        */
        load: function (features) {
            try {
                //$(this._container).html(this.temphtml);
                var quicksearch = $(".qrtop-right");
                if (quicksearch.length == 0) {
                    $(this._container).html(this.temphtml);
                } else {
                    var queryContent = '<div class="querydiv"></div>'
                                                    + '<div class="resultselect-choice">'
                                                        + '<ul></ul>'
                                                    + '</div>'
                                                    + '<div class="queryresult-querypage">'
                                                        + '<div class="querypage"></div>'
                                                    + '</div>';
                }

                $(".queryresult-content").html(queryContent);
                this._currentSelectedObj = features[0];
                this._listNum = features.length;                //数据总数
                this.showCount(this._listNum);                  //显示总数
                var result = this.splitFeatures(features);      //总数据拆分
                this.showList(result);                          //显示列表对象

                if (features.length > 0) {
                    this.getPageData(features, 1);                  //获取第1页数据（显示布局、页码布局）
                }
                else {
                    this.showEmptyResult();
                }

            } catch (e) {
                throw e;
            }
        },

        /**
        *设置class = datails-table-info 的Div的高度
        *@method setDetailsDivHeight
        *@private
        */
        setDetailsDivHeight: function () {
            var height = $(".datails-table").height();
            this._detailsHeight = height - 50;
            $(".datails-table-info").css("height", this._detailsHeight);
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
        *设置页码总数
        *@method setPageNum
        *@param listNum {Number} 结果数目
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
        *@param num {Number} 结果数目
        */
        showCount: function (num) {
            $(".countNum").html(num);
        },
        /**
        *总数据拆分
        *@method splitFeatures
        *@param features {Array} 要素结果集
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
                            var obj = features[j];
                            array.push(obj);
                        }
                    }
                    var resultObj = array;
                    resultArray.push(resultObj);
                }

                //保存所有的数据集
                var featureObj = features;
                resultArray.push(featureObj);
            }

            return resultArray;
        },
        /**
        *显示列表对象（option数组最后一个是总的数据集）
        *@method showList
        */
        showList: function (option) {
            var length = option.length;
            var resultsum = "";
            var obj = $(".resultselect-choice>ul");
            var liHtml = '';
            if (length > 0) {
                resultsum = "全部(" + option[length - 1].length + ") ";
                $(".textContent").text(resultsum);
                $(".resultselect").attr("data-info", length - 1);
                var FindSpan = $("#resultselect-span").length;
                if (FindSpan == 0) {
                    var span = '<span id="resultselect-span" class="icon-arrows-down"></span>';
                    $(".resultselect").append(span);
                }                
                liHtml = liHtml + '<li data-info="' + (length - 1) + '">全部(' + option[length - 1].length + ')</li>';
                for (var i = 0; i < length - 1; i++) {
                    liHtml += '<li data-info="' + i + '">' + option[i][0].layerName + '(' + option[i].length + ')' + '</li>';
                }
                obj.html(liHtml);

            } else {
                resultsum = "全部（0)";
                $(".textContent").text(resultsum);
                $(".resultselect").attr("data-info", -1);
            }

            //初始化
            //$(".resultselect").unbind();
            $(".resultselect").on("click", { context: this }, function (e) {
                e.stopPropagation();
                e.data.context.switchTab(e);
            });
            //列表选项
            $(".resultselect-choice>ul").on('click', 'li', { context: this }, function (e) {
                e.data.context.changeSelect(e, option);
            });
        },
        /**
        *选择切换时触发
        *@method switchTab
        *@private
        */
        switchTab: function (e) {
            var eleActive = 'active';
            var tab = $(".resultselect-choice");
            tab.slideToggle("fast");
        },
        /**
        *选择改变时触发
        *@method changeSelect
        *@private
        */
        changeSelect: function (e, option) {
            this.option = option;
            var tab = $(".resultselect-choice");            
            var targetObj = $(e.target);
            //选中后更改父标题
            $(".textContent")[0].textContent = e.target.textContent;

            var eleActive = 'active';
            if (targetObj.hasClass(eleActive) == false) {
                targetObj.siblings().removeClass(eleActive);
                targetObj.addClass(eleActive);
                //传入查询条件
                var i = $(targetObj[0]).attr("data-info");
                this.getPageData(option[i], 1);
            }
            tab.animate({ height: 'toggle' }, 100);
            $("#resultselect-span").removeClass().addClass("icon-arrows-down");
            tab.removeClass(eleActive);

        },

        /**
        *获取第几页数据
        *@method getPageData
        *@private
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
        *@param data {Array} 数据
        *@private
        */
        showPage: function (data) {
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
				var className="resultselect-list-view";
				if (this._showType == "project"){
					className="resultselect-list-view-project";
				}
				listHtml += '<div class="resultselect-list" data-info="' + i + '">'
					+ '<div class="resultselect-list-title">'
					+ '<table><tbody>'
					+ '<tr><td>' + attI + '：</td><td>' + data[i].value + '</td></tr>'
					+ '<tr><td>所属图层：</td><td>' + data[i].layerName + '</td></tr>'
					+ '</tbody></table>'
					+ '</div>'
					+ '<div class="resultselect-list-body">'
						//+ '<div class="markdiv"><span class="marker-icon icon-location" data-info="' + i + '" marked="false" id="' + data[i].attributes["OBJECTID"] + '"></span></div>'
						+ '<div class="view"><span class="'+className+'" data-info="' + i + '">详情</span></div>'
					+ '</div>'
				+ '</div>';
               /*
                if (this._showType == "project") {
                    
                    listHtml += '<div class="resultselect-list-project" data-info="' + i + '">'
                       + '<div class="resultselect-list-title">'
                       + '<table><tbody>'
                       + '<tr><td>项目名称：</td><td>' + data[i].attributes["GGSSMIS.V_BS_JSXMYHXM.XMMC"] + '</td></tr>'
                       //+ '<tr><td>所属图层：</td><td>' + data[i].layerName + '</td></tr>'
                       + '</tbody></table>'
                       + '</div>'
                       + '<div class="resultselect-list-body">'
                           //+ '<div class="markdiv"><span class="marker-icon icon-location" data-info="' + i + '" marked="false" id="' + data[i].attributes["OBJECTID"] + '"></span></div>'
                           + '<div class="view"><span class="resultselect-list-view-project" data-info="' + i + '">详情</span></div>'
                       + '</div>'
                   + '</div>';
                }
                else {
                    var attI = "项目编码";
                    for (var att in data[i].attributes) {
                        if (data[i].value == data[i].attributes[att]) {
                            attI = att;
                            break;
                        }
                    }
                    listHtml += '<div class="resultselect-list" data-info="' + i + '">'
                        + '<div class="resultselect-list-title">'
                        + '<table><tbody>'
                        + '<tr><td>' + attI + '：</td><td>' + data[i].value + '</td></tr>'
                        + '<tr><td>所属图层：</td><td>' + data[i].layerName + '</td></tr>'
                        + '</tbody></table>'
                        + '</div>'
                        + '<div class="resultselect-list-body">'
                            //+ '<div class="markdiv"><span class="marker-icon icon-location" data-info="' + i + '" marked="false" id="' + data[i].attributes["OBJECTID"] + '"></span></div>'
                            + '<div class="view"><span class="resultselect-list-view" data-info="' + i + '">详情</span></div>'
                        + '</div>'
                    + '</div>';
                }
                */
            }
            $(".querydiv").html(listHtml);

            //滚动条
            $(".querydiv").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //触发定位
            //$(".marker-icon").click(function () {
            //    var mark = $(this).attr("marked");
            //    if (mark == "false") {
            //        $(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
            //        $(this).css("color", "red").attr("marked", "true");
            //        var i = $(this).attr("data-info");
            //        var dataObj = data[i];
            //        _this.location(dataObj);
            //        _this._currentSelectedObj = dataObj;
            //    }
            //    else if (mark == "true") {
            //        $(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
            //        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //        map.getHighLightLayer().clearLayers();
            //        _this._currentSelectedObj = null;
            //    }
            //});
			//点击列表项
				$(".resultselect-list").click(function () {
					//$(this).addClass("selected");
					var num = $(this).attr("data-info");
					var dataObj = data[num];
					_this.location(dataObj);
					_this._currentSelectedObj = dataObj;
					
					if (!$(this).hasClass("selected")) {
						$(".control-queryresult .queryresult-content .selected").removeClass("selected");
						$(this).addClass("selected");
					}
				});
			if (this._showType == "project"){
				//项目详情
				$(".resultselect-list-view-project").click(function () {
					var num = $(this).attr("data-info");
					var dataObj = data[num];
					_this.projectDetailsHtml(dataObj);
					_this.location(dataObj);
					_this._currentSelectedObj = dataObj;
					return false;
				});
			}
			else{
				//详情
				$(".resultselect-list-view").click(function () {
					var num = $(this).attr("data-info");
					var dataObj = data[num];
					if(dataObj.layerName=='项目路段'){
					    _this.projectDetailsHtml(dataObj);
					    _this.location(dataObj);
					    _this._currentSelectedObj = dataObj;
					    return false;
					}
					else if (dataObj.layerName == "地名地址") {
					    _this.addressDetailsHtml(dataObj);
					    _this.location(dataObj);
					    _this._currentSelectedObj = dataObj;
					    return false;
					}
					else{
					    _this.detailsHtml(dataObj);
					    _this.location(dataObj);
					    _this._currentSelectedObj = dataObj;
					    return false;
					}
					
				});
			}
			//选中列表的第一项
			$(".resultselect-list:first-child").addClass("selected");
        },
        /**
        *分页布局
        *@method showPagePanel
        *@param currentPage {Number} 当前页
        *@param maxPageNum {Number} 最多显示页码个数
        *@param pageAcount {Number} 页码总个数
        *@private
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
                        if (currentPage == 1) {//当前页面为第一页时，点上一页没效
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
        *设置页码布局
        *@method showPagePanel
        *@param currentPage {Number} 当前页
        *@param maxPageNum {Number} 最多显示页码个数
        *@param pageAcount {Number} 页码总个数
        *@return {String} 返回列表标签
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
        *@param obj {Object} 定位要素
        */
        location: function (obj, isZoom) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
            var type = obj.geometryType;
            var latlng = '';
            if (isZoom == undefined) isZoom = true;
            var geo = L.dci.app.util.highLight(map, obj, true, false);
            if (isZoom == undefined || isZoom == true) {
                if (type == "esriGeometryPolygon") {
                    latlng = geo.getBounds().getCenter();
                }
                else if (type == "esriGeometryPolyline") {
                    var paths = geo.getLatLngs();
                    latlng = paths[Math.round(paths.length / 2)];
                } else {
                    latlng = L.latLng(geo._latlng.lat, geo._latlng.lng);
                }
                map.map.setView(latlng);
                //var popupHtml = this.openPopup(obj);
                //var marker = L.marker(latlng)
                //        .setIcon(L.dci.app.symbol.highlightPointSymbol.icon)
                //        .bindPopup(popupHtml)
                //        .openPopup();
                //map.getHighLightLayer().addLayer(marker);
            }
        },
		/*
        locationProject: function (obj, isZoom) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
            var latlng = '';
            if (isZoom == undefined) isZoom = true;
            var pnts = [], geo = null;
            var shapeOptions = {
                color: L.DCI.App.symbol.polygonSymbol.color,
                weight: L.DCI.App.symbol.polygonSymbol.weight,
                opacity: L.DCI.App.symbol.polygonSymbol.opacity,
                fill: L.DCI.App.symbol.polygonSymbol.fill,
                fillColor: L.DCI.App.symbol.polygonSymbol.fillColor, //same as color by default
                fillOpacity: L.DCI.App.symbol.polygonSymbol.fillOpacity,
                clickable: true,
                declaredClass: 'DrawPolygon',
            };
            if (obj.type && obj.type == "Feature") {
                var paths = obj.geometry.coordinates[0];
                for (var i = 0; i < paths.length; i++) {
                    pnts.push([paths[i][1], paths[i][0]]);
                }
            }
            else {
                var paths = obj.geometry.rings;
                for (var i = 0; i < paths.length; i++) {
                    var pnts2 = [];
                    for (var j = 0; j < paths[i].length; j++) {
                        var pnt = map.options.crs.projection.unproject(L.point(paths[i][j]));
                        pnts2.push([pnt.lat, pnt.lng]);
                    }
                    pnts.push(pnts2);
                }
            }
            geo = L.polygon(pnts, shapeOptions);
            var hlLayer = map.getHighLightLayer();
            hlLayer.clearLayers();
            hlLayer.addLayer(geo);
            //var geo = L.dci.app.util.highLight(map, obj, true, isZoom);
            if (isZoom == undefined || isZoom == true) {
                latlng = geo.getBounds().getCenter();
                map.map.setView(latlng, 16);
            }
        },
		*/
        /**
        *打开气泡
        *@method openPopup
        *@param obj {Object} 要素
        */
        openPopup: function (obj) {
            var html2 = '';
            var count = 0;
            for (var att in obj.attributes) {
                if (L.dci.app.util.isContain(att)) continue;
                if (obj.attributes[att] != "" && obj.attributes[att].toLowerCase() != "null") {
                    html2 += '<tr class="proTr"><td class="proTd">' + att + '</td><td>' + obj.attributes[att] + '</td></tr>';
                    count++;
                    if (count == 5) break;
                }
            }

            var html = '<div class="dataInfo">'
                        + '<table>'
                            + '<tbody>'
                                + html2
                            + '</tbody>'
                        + '</table>'
                        + '</div>';
            return html;
        },
        /**
        *详情布局
        *@method detailsHtml
        *@param obj {Object} 要素
        */
        detailsHtml: function (obj) {
            var trHtml = '';
            var _this = this;
			//显示加载动画
			var loadingObj = $('.result-list-group-loadflash');
			L.dci.app.util.showLoadFlash(loadingObj);
            //获取属性
            for (var att in obj.attributes) {
                if (L.dci.app.util.isContain(att) == true)
                    continue;
                var value = L.dci.app.util.isNull(obj.attributes[att]);
                trHtml += '<tr class="datails-table-info-tr"><td class="key">' + att + '</td><td class="key-value">' + value + '</td></tr>';
            }

            // 加载图片
            //var _imgStr = _this.loadImg(obj.attributes["照片"]);
            _this.loadImg(obj.attributes["照片编号"], obj.layerName, function (_imgStr) {
				 //console.log("_imgStr:" + _imgStr);
				 var OBJCODE=obj.attributes["标识码"]== undefined ? obj.attributes["OBJCODE"] : obj.attributes["标识码"];
				 //_this.getYhList(OBJCODE, function (yhListStr) {
					//console.log("yhListStr:" + yhListStr);
					var html = "<div class='rightpanel-details-info'>"
					+ '<div class="details-title">'
						+ '<div class="return"><span class="icon-return"></span></div>'
						+ '<a id="details-title-link" href=# title="">'
						+ '<div class="details-title-name" style= "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ">' + obj.value + '---' + obj.layerName + '</div>'
						+ '</a>'
						//+ '<div class="details-title-mark"><span class="details-marker-icon icon-location" marked="false" id="' + obj.attributes["OBJECTID"] + '"></span></div>'
					+ '</div>'
					+ '<div class="datails-table">'
						+ '<ul class="nav nav-tabs" role="tablist">'
						+ '<li role="presentation" class="active"><a href="#datails-table-info" aria-controls="datails-table-info" role="tab" data-toggle="tab">详情</a></li>'
						/*+ '<li role="presentation"><a href="#yhList" aria-controls="yhList" role="tab" data-toggle="tab">养护列表</a></li>'*/
						+ '<li role="presentation"><a href="#loadImg" aria-controls="loadImg" role="tab" data-toggle="tab">图片</a></li>'
						+ '</ul>'
						+ '<div class="tab-content" style="margin-left: 10px;">'
							+ ' <div role="tabpanel" class="tab-pane datails-table-info active" id="datails-table-info">'
							//+ '<div class="datails-table-info">'
							+ '<table>'
							+ trHtml
							+ '</table>'
							+ '</div>'
							//养护列表
							/*+ '<div role="tabpanel" class="tab-pane datails-table-info" id="yhList" OBJCODE="' + obj.attributes["OBJCODE"] + '">'
							+ yhListStr
							+ '</div>'*/;
					html = html
						+ '<div role="tabpanel" class="tab-pane datails-table-info" id="loadImg" OBJCODE="' + obj.attributes["OBJCODE"] + '">'
						+ _imgStr
						+ '</div>'

							+ '</div>'
							+ '</div>'
						+ '<div>';
				   
					var container = $(".result-list-group[index=0]");
					$(container).children().detach();
					$(container).html(html);
					_this.setDetailsDivHeight();
					//滚动条
					$(".datails-table-info").mCustomScrollbar({
						theme: "minimal-dark"
					});
					//返回
					$(".rightpanel-details-info .return>span").click(function () {
						var eleActive = 'active';
						var tab = $(".resultselect-choice");
						if (tab.hasClass(eleActive)) {
							tab.removeClass(eleActive);
							tab.animate({ height: 'toggle' }, 100);
							$("#resultselect-span").removeClass().addClass("icon-arrows-down");
						}
						$(".result-list-group[index=0]").html(_this._container);
						var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
						map.getHighLightLayer().clearLayers();
						_this._currentSelectedObj = null;
					});
					//当鼠标悬停在details-title-name时，显示完整文本
					$("#details-title-link").on("mouseover", function (e) {
						$("#details-title-link").attr("title", obj.value);
					});
					//定位
					//$(".details-title-mark .icon-location").click(function () {
					//	var markStatus = $(this).attr("marked");
					//	var id = $(this).attr("id");
					//	if (markStatus == "false") {
					//		$(this).css("color", "red").attr("marked", "true");
					//		$(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
					//		$(".marker-icon[id=" + id + "]").css("color", "red").attr("marked", "true");
					//		_this.location(obj);
					//		_this._currentSelectedObj = obj;
					//	}
					//	else if (markStatus == "true") {
					//		$(this).css("color", "#d2d2d2").attr("marked", "false");
					//		$(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
					//		var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
					//		map.getHighLightLayer().clearLayers();
					//		_this._currentSelectedObj = null;
					//	}
					//});
					//点击照片，放大轮播
					$("#projectYhzp").click(function(){
						var picUrl=$(this).attr("picUrl");
						var picUrlArr=picUrl.split("$");
						_this.showPicPane(picUrlArr);
					});
					//关闭加载动画
					L.dci.app.util.hideLoadFlash(loadingObj);
				//});
			});
        },

        /**
        *获取养护列表
        *@method getYhList
        *@param OBJCODE {String} 惟一值
        *@param callback {Object} 回调函数
        */
        getYhList: function (OBJCODE,callback) {
            //var newUrl = "http://localhost/KFQSZ/MaintainManage/getYhjlinfo?OBJCODE={F0DD76F3-196F-4ABD-9559-BBEF580EF768}";
            this.ajax = new L.DCI.Ajax();
            var url = Project_ParamConfig.getYhListUrl;
            //var param = "{'OBJCODE':'" + OBJCODE + "'}";
            //console.log("url:" + url);
            //console.log("param: " + param);
            this.ajax.post(url, {"objcode":OBJCODE}, true, this, function (res) {
                var returnStr = '';
                if (res && res.length > 0) {
                    returnStr = '<table><tr class="datails-table-info-tr"><th class="key">序号</th><th class="key">项目名称</th>'
                        + '<th class="key">养护单位</th><th class="key">养护时间</th></tr>';
                    for(var i in res){
                        returnStr += '<tr class="datails-table-info-tr">'
                            + '<td class="key-value-yhlb">' + res[i].id + '</td><td class="key-value-yhlb"> <a target="_blank" href="'+Project_ParamConfig.oaSystemUrl+'/Business/BusinessInfo_SP?BIMID='+res[i].xmid+'">' + res[i].xmmc + '</a></td>'
                             + '<td class="key-value-yhlb">' + res[i].yhdw + '</td><td class="key-value-yhlb">' + res[i].yhsj + '</td>'
                            + '</tr>';
                    }
                    returnStr += '</table>';
                }
                else {
                    returnStr = "暂无养护信息。";
                }
                if (callback) {
                    callback(returnStr);
                }
              
            }, function (err) {
				if(err.status==403){
					L.dci.app.util.dialog.alert("提示", "登录超时");
					location.href ="/GGSS/JGSP/User/Login";
				}
				else{
					//L.dci.app.util.dialog.alert("提示", "服务查询出错");
					if (callback) {
						callback("查询出错");
					}
				}
            });
    
        },

        /**
       *加载图片
       *@method loadImg
       *@param OBJCODE {String} 惟一值
       *@param callback {Object} 回调函数
       */
        loadImg: function (picUrl,layerName,callback) {
            const imgConfig = {
                '古树名木点': 'gsmm',
                '公园配套设施': 'gyptss',
                '行道树调查': 'hds',
                '问题行道树': 'wthds'
            };
            const folder = imgConfig[layerName];
            const returnStr = picUrl && folder ? picUrl.split(';').map(v => `<img style='width:100%;margin-bottom:6px;' src='${Project_ParamConfig.imgHost}/${folder}/${v.toLowerCase().includes('.jpg') ? v : `${v}.jpg`}' />`).join('') : '暂无图片';
            return callback(`<div>${returnStr}</div>`);
        },
		/**
        *图片轮播
        *@method detailsHtml
        *@param obj {Object} 要素
        */
		showPicPane:function(picUrlArr){
			var content='<div id="carousel-projectYhzp" class="carousel slide" data-ride="carousel" style="width:100%;height:96%;">'
			    +'<ol class="carousel-indicators">';
			for(var i in picUrlArr){
				if(i==0){
					content+='<li data-target="#carousel-projectYhzp" data-slide-to="0" class="active"></li>';
				}
				else{
					content+='<li data-target="#carousel-projectYhzp" data-slide-to="'+i+'"></li>';
				}
			}
			content+='</ol>';
			content+='<div class="carousel-inner" role="listbox" style="width:100%;height:100%;">';
			for(var j in picUrlArr){
				if(j==0){
					content+='<div class="item active" style="width:100%;height:100%;">';
				}
				else{
					content+='<div class="item" style="width:100%;height:100%;">';
				}
				var imgUrl=Project_ParamConfig.getYhImgUrl + '/' + picUrlArr[j];
				content+='<img src="'+imgUrl+'" alt="" style="width:100%;height:100%;">'
				  +'<div class="carousel-caption">'
				  +'</div>'
				+'</div>';
			}	
			content+='</div>';
			content+='<a class="left carousel-control" href="#carousel-projectYhzp" role="button" data-slide="prev">'
				+'<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'
				+'<span class="sr-only">Previous</span>'
			  +'</a>'
			  +'<a class="right carousel-control" href="#carousel-projectYhzp" role="button" data-slide="next">'
				+'<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>'
				+'<span class="sr-only">Next</span>'
			  +'</a>'
			+'</div>'; 
			this.toolBox("图片展示", content);
		},
		/**
        *高亮当前高亮对象
        *@method detailsHtml
        *@param obj {Object} 要素
        */
        showMarks: function () {
            if (this._currentSelectedObj != null) {
                this.location(this._currentSelectedObj, false);
            }
        },
        /**
        *详情布局
        *@method detailsHtml
        *@param obj {Object} 要素
        */
        projectDetailsHtml: function (obj) {
            var trHtml = '';
            var _this = this;
            //获取属性
            for (var att in obj.attributes) {
                if (L.dci.app.util.isContain(att) == true)
                    continue;
                var value = L.dci.app.util.isNull(obj.attributes[att]);
				if(att=="建设时间"){
					var da =new Date(value);
					var year=da.getFullYear()
					var month = da.getMonth()+1;
					var date = da.getDate();
					value=[year,month,date].join('-');
				}
                trHtml += '<tr class="datails-table-info-tr"><td class="key">' + att + '</td><td class="key-value">' + value + '</td></tr>';
            }
            var html = "<div class='rightpanel-details-info'>"
                + '<div class="details-title">'
                + '<div class="return"><span class="icon-return"></span></div>'
                + '<a id="details-title-link" href=# title="">'
                + '<div class="details-title-name" style= "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ">项目详情</div>'
                + '</a>'
                //+ '<div class="details-title-mark"><span class="details-marker-icon icon-location" marked="false" id="' + obj.attributes["OBJECTID"] + '"></span></div>'
                + '</div>'
                + '<div class="datails-table">'
                + '<div class="datails-table-info" style="margin-left: 10px;">'
                + '<table>'
                + trHtml
                + '</table>'
				+ '<button type="button" id="projectDetailBtn" class="btn btn-primary" style="float:right;margin-top: 10px;margin-right: 20px;" projectBMID='+obj.attributes["ID"]+'>项目详情</button>'
                + '</div>'
                + '</div>'
                + '<div>';
            var container = $(".result-list-group[index=0]");
            $(container).children().detach();
            $(container).html(html);
            _this.setDetailsDivHeight();
            //滚动条
            $(".datails-table-info").mCustomScrollbar({
                theme: "minimal-dark"
            });
			//弹出项目详情面板
			$("#projectDetailBtn").click(function(){
				
				var bmId=$(this).attr("projectBMID");
				_this.showProjectDetailPane(bmId);
			});
            //返回
            $(".rightpanel-details-info .return>span").click(function () {
                var eleActive = 'active';
                var tab = $(".resultselect-choice");
                if (tab.hasClass(eleActive)) {
                    tab.removeClass(eleActive);
                    tab.animate({ height: 'toggle' }, 100);
                    $("#resultselect-span").removeClass().addClass("icon-arrows-down");
                }
                $(".result-list-group[index=0]").html(_this._container);
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                map.getHighLightLayer().clearLayers();
                _this._currentSelectedObj = null;
            });
            //当鼠标悬停在details-title-name时，显示完整文本
            $("#details-title-link").on("mouseover", function (e) {
                $("#details-title-link").attr("title", obj.value);
            });
            //定位
            //$(".details-title-mark .icon-location").click(function () {
            //    var markStatus = $(this).attr("marked");
            //    var id = $(this).attr("id");
            //    if (markStatus == "false") {
            //        $(this).css("color", "red").attr("marked", "true");
            //        $(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
            //        $(".marker-icon[id=" + id + "]").css("color", "red").attr("marked", "true");
            //        _this.location(obj);
            //        _this._currentSelectedObj = obj;
            //    }
            //    else if (markStatus == "true") {
            //        $(this).css("color", "#d2d2d2").attr("marked", "false");
            //        $(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
            //        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //        map.getHighLightLayer().clearLayers();
            //        _this._currentSelectedObj = null;
            //    }
            //});


        },
        /**
        **显示项目的审批流程信息面板
        **/
		showProjectDetailPane:function(bmId){
		
			var html = '';
            html += '<Iframe src="'+Project_ParamConfig.oaSystemUrl+'/YWSP/Business/BusinessInfo_SP?BIMID='+bmId+'" width="100%" height="90%" scrolling="" frameborder="x" name="main"></iframe>';
			  this.toolBox("项目详情", html);
		},
        /**
        **地名地址详情面板
        **/
		addressDetailsHtml: function (obj) {
		    var trHtml = '';
		    var _this = this;
		    //获取属性
		    for (var att in obj.attributes) {
		        if (L.dci.app.util.isContain(att) == true)
		            continue;
		        var value = L.dci.app.util.isNull(obj.attributes[att]);
		        
		        trHtml += '<tr class="datails-table-info-tr"><td class="key">' + att + '</td><td class="key-value">' + value + '</td></tr>';
		    }
		    var html = "<div class='rightpanel-details-info'>"
                + '<div class="details-title">'
                + '<div class="return"><span class="icon-return"></span></div>'
                + '<a id="details-title-link" href=# title="">'
                + '<div class="details-title-name" style= "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ">地名地址详情</div>'
                + '</a>'
                //+ '<div class="details-title-mark"><span class="details-marker-icon icon-location" marked="false" id="' + obj.attributes["OBJECTID"] + '"></span></div>'
                + '</div>'
                + '<div class="datails-table">'
                + '<div class="datails-table-info" style="margin-left: 10px;">'
                + '<table>'
                + trHtml
                + '</table>'
                + '</div>'
                + '</div>'
                + '<div>';
		    var container = $(".result-list-group[index=0]");
		    $(container).children().detach();
		    $(container).html(html);
		    _this.setDetailsDivHeight();
		    //滚动条
		    $(".datails-table-info").mCustomScrollbar({
		        theme: "minimal-dark"
		    });
		    
		    //返回
		    $(".rightpanel-details-info .return>span").click(function () {
		        var eleActive = 'active';
		        var tab = $(".resultselect-choice");
		        if (tab.hasClass(eleActive)) {
		            tab.removeClass(eleActive);
		            tab.animate({ height: 'toggle' }, 100);
		            $("#resultselect-span").removeClass().addClass("icon-arrows-down");
		        }
		        $(".result-list-group[index=0]").html(_this._container);
		        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
		        map.getHighLightLayer().clearLayers();
		        _this._currentSelectedObj = null;
		    });
		    //当鼠标悬停在details-title-name时，显示完整文本
		    $("#details-title-link").on("mouseover", function (e) {
		        $("#details-title-link").attr("title", obj.value);
		    });
		    //定位
		    //$(".details-title-mark .icon-location").click(function () {
		    //    var markStatus = $(this).attr("marked");
		    //    var id = $(this).attr("id");
		    //    if (markStatus == "false") {
		    //        $(this).css("color", "red").attr("marked", "true");
		    //        $(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
		    //        $(".marker-icon[id=" + id + "]").css("color", "red").attr("marked", "true");
		    //        _this.location(obj);
		    //        _this._currentSelectedObj = obj;
		    //    }
		    //    else if (markStatus == "true") {
		    //        $(this).css("color", "#d2d2d2").attr("marked", "false");
		    //        $(".marker-icon").css("color", "#d2d2d2").attr("marked", "false");
		    //        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
		    //        map.getHighLightLayer().clearLayers();
		    //        _this._currentSelectedObj = null;
		    //    }
		    //});
		},
		toolBox: function (title, html, eleObj,callback) {
            //定义一个随机数
            var num = Math.ceil(Math.random() * 100);
            var ele = $(".toolbox");
            for (i = 0; i < ele.length; i++) {
                var titleName = $(ele[i]).children("p").children("span:first").html();
                if (titleName == title)
                    return;
            }
            var id = "toolbox" + num;
            var titleId = "toolbox" + num + "_title";

            var boxHtml = '<div id="' + id + '" class="toolbox" style="width:1200px;height:800px;">'
                            + '<p id="' + titleId + '"><span>' + title + '</span><span class="icon-close2 close_toolbox"></span></p>'
                            + '<div>'
                                + html
                            + '</div>'
                        + '</div>'

            $("body").append(boxHtml);
			var windowWidth = $("body").width();
			var windowHeight = $("body").height();
			if(windowWidth>=1200){
				var left=(windowWidth-1200)/2;
				$("#" + id).css("left",  left+"px");
			}
			else{
				$("#" + id).css("width",  (windowWidth-100)+"px");
				$("#" + id).css("left",  "50px");
			}
            if(windowHeight>=800){
				$("#" + id).css("height",  (windowHeight-100)+"px");
				$("#" + id).css("top",  "50px");
			}
			else{
				var top=(windowHeight-800)/2;
				$("#" + id).css("top",  top+"px");
			}
			//添加可拖动事件
            L.dci.app.util._drag(id, titleId);
            $("#" + id).on('click', 'span.close_toolbox', function () {
                $("#" + id).remove();
                if (callback) {
                    callback();
                }
            });
        }

    });
    return L.DCI.QueryResult;
});