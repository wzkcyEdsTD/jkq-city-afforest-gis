/**
*右边面板类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/rightpanel", [
    "leaflet",
    "core/dcins",
    "bmap/toolbar"
], function (L) {

    L.DCI.BMap.RightPanel = L.Class.extend({

        /**
        *html总模板
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="rightpanel no-print"><div class="rightpanel-content">'
                    + '<div class="result-list-group-button">'
                        + '<div class="button" data-info="0"><span>编制</span></div>'
                        + '<div class="button" data-info="1" style="padding-top: 0px;margin-top: 8px;"><span class="icon-close2 closeBtn" data-info="0"></span><span>查询</span></div>'
                    + '</div>'
                    + '<div class="result-list-group"></div>'
                    + '<div class="result-list-group"></div>'
                    + '<div class="result-list-group-loading"><div class="loadingFlash"><span class="icon-loading"></span></div></div>'
               + '</div></div>',

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "bmapRightPanel",
        
        /**
        *dom对象容器
        *@property dom
        *@type {Object}
        *@private
        */
        dom: $(".bmapbody"),

        /**
        *dombody对象容器
        *@property dombody
        *@type {Object}
        *@private
        */
        dombody: $(".rightpanel"),

        /**
        *
        *@property _currentIndex
        *@type {Number}
        *@private
        */
        _currentIndex: 0,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.dom.append(this.tempHtml);
            //this.body = $("#right-panel-body1");
            var _this = this;
            $(".rightpanel").css("display", "none");
            $(".result-list-group-button .button").css("display", "none");
            $(".result-list-group-button .button").click(function () {
                var num = $(this).attr("data-info");
                if ($(this).hasClass("selected")) {
                    if ($(".rightpanel").css("right") == "-300px")
                        _this.show();
                    else
                        _this.hide();
                } else {
                    $(".result-list-group-button").find(".button").removeClass("selected");
                    $(this).addClass("selected");
                    $(".result-list-group").css("display", "none");
                    $(_this.getBody(num)).css("display", "");
                    _this._currentIndex = num;
                    var detail = $(".rightpanel-details");
                    if (num == 1 && detail.length > 0 && $(".rightpanel-details").html().length > 0) {
                        $(".rightpanel-details").css("display", "");
                    } else {
                        $(".rightpanel-details").css("display", "none");
                    }
                    L.dci.app.pool.get('bmap').getHighLightLayer().clearLayers();
                    if (num == 0) {
                        L.dci.app.pool.get('bmap').showMark();
                    } else {
                        //L.dci.app.pool.get('bmap').getHighLightLayer().clearLayers();
                        //$(".resultselect-list.selected").click();   //高亮显示状态为选中的查询结果
                    }
                }
            });

            var _this = this;
            $(".result-list-group-button .button .closeBtn").click(function (event) {
                if ($(".rightpanel-details").length > 0)
                    $(".rightpanel-details").remove();
                $($(".result-list-group-button .button")[1]).css("display", "none").removeClass("selected");
                $($(".result-list-group")[1]).css("display", "none");
                //
                var btns = $(".result-list-group-button .button");
                var count = 0;
                for (var i = 0; i < btns.length; i++)
                {
                    var display = $(btns[i]).css("display");
                    if (display != "none")
                        count++;
                }
                if (count == 0)
                {
                    _this.hide();
                }
                else
                {
                    $($(".result-list-group-button .button")[0]).addClass("selected");
                    $($(".result-list-group")[0]).css("display", "");
                    L.dci.app.pool.get('bmap').showMark();
                }

                var map = L.dci.app.pool.get('bmap');
                map.controls.toolbar.removeButtonActiveClass();
                map.getHighLightLayer().clearLayers();

                event.stopPropagation();
            });
        },

        /**
        *获取内容区
        *@method getBody
        */
        getBody: function(index) {
            if (index == null) index = 0;
            return $(".result-list-group")[index];
        },

        /**
        *隐藏
        *@method hide
        */
        hide: function () {
            $(".result-list-group-button .icon-arrows").attr("data-info", "1").css("-webkit-transform", "rotate(0deg)");
            $(".rightpanel").animate({ right: '-300px' }, "fast");
        },

        /**
        *显示
        *@method show
        */
        show: function () {
            $(".result-list-group-button .icon-arrows").attr("data-info", "0").css("-webkit-transform", "rotate(180deg)");
            $(".rightpanel").animate({ right: '0px' }, "fast");
        },

        /**
        *清除内容
        *@method clear
        */
        clear: function () {
            this.body.html(' ');
            this.hide();
        },

        /**
        *加载内容
        *@method load
        */
        load: function (content, index) {
            if (index == null)index = 0;
            this.show();
            this._currentIndex = index;
            $(".result-list-group").css("display", "none");
            var body = this.getBody(index);
            $(body).css("display", "");
            $(".result-list-group-button").find(".button").removeClass("selected");
            var sel = $(".result-list-group-button").find(".button")[index];
            $(sel).addClass("selected");
            $(sel).css("display", "");
            $(body).html(content);
        },

        /**
        *详情展示栏
        *@method details
        */
        details: function () {
            var html = '<div class="rightpanel-details" id="rightpanel-details">'
                            + '<div class="rightpanel-details-info"></div>'
                      + '</div>';
            var bodyObj = $(".rightpanel-content");
            bodyObj.append(html);
        },

        /**
        *显示加载动画
        *@method showLoading
        */
        showLoading: function (classname) {
            $(".result-list-group-loading").css("z-index", "5");
        },

        /**
        *隐藏加载动画
        *@method hideLoading
        */
        hideLoading: function () {
            $(".result-list-group-loading").css("z-index", "-1");
        }
    });
    return L.DCI.BMap.RightPanel;
});