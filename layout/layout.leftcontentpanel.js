/**
*左边内容模版布局类
*@module layout
*@class DCI.Layout.LeftContentPanel
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/leftcontentpanel", [
    "leaflet",
    "core/dcins",
    "layout/base",
    "analysis/landbalance",
    "analysis/landstrength"
], function (L) {

    L.DCI.Layout.LeftContentPanel = L.DCI.Layout.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'LeftContentPanel',

        /**
        *内容模版
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="leftcontentpanel-content" id = "lcp">'
                    + '<div>'
                        + '<div class="leftcontentpanel-title">'
                            + '<span>标题</span>'
                            + '<span class="icon-close1"></span>'
                        + '</div>'
                        + '<div class="leftcontentpanel-body">'
                        + '</div>'
                    + '</div>'
               + '</div>',

        /**
         *初始化
         *@method initialize
         */
        initialize: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                this.dom = $(".out-container");
                this.dom.append(this.tempHtml);
            }
            $(".leftcontentpanel-content .icon-close1").on('click', { context: this }, function (e) { e.data.context.close(e); });
        },

         /**
         *关闭
         *@method close
         */
        close: function (e) {
            var title = $(".leftcontentpanel-title>span:first").text();
            this.hide();
            if (this.contentObject) {
                this.contentObject.leftClose();
                this.contentObject = null;
            }
        },

        /**
         *隐藏
         *@method hide
         */
        hide: function () {
            var _this = this;
            var mapWidth = $("#map-main").width() + 30;
            $("#map-main").css('width', mapWidth + 700);
            $("#map-main").animate({ left: '0px' }, "slow", null);
            $(".leftcontentpanel-content").animate({ left: '-700px' }, "slow", function () {
                var mpgroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                for (var i = 0; i < mpgroup.length; i++) {
                    mpgroup[i].map.invalidateSize(false);
                }
                _this._showMenu();
            });
        },

        /**
         *显示
         *@method show
         */
        show: function (object, callback) {            
            if (this.contentObject) {
                var mapWidth = $("#map-main").width() + 30;
                $("#map-main").css('width', mapWidth + 700);
                if (this.contentObject != object) {
                    this.contentObject.leftClose();
                }
            }
            this.contentObject = object;
            this._closeMenu();
            //$("#map-main").css({ "position": "absolute", "right": "0px", "width": "auto" });
            $("#map-main").animate({ left: '700px' }, "slow", function () {
                //调整地图宽度
                var mapWidth = $("#map-main").width()+30;
                $("#map-main").css('width', mapWidth - 700);
                var mpgroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                for (var i = 0; i < mpgroup.length; i++) {
                    mpgroup[i].map.invalidateSize(false);
                }
            });
            $(".leftcontentpanel-content").animate({ left: '0px' }, "slow", function () {
                if (callback) {
                    callback.call();
                }
            });            
        },
        /**
        *关闭菜单和调整工具栏
        *@method _closeMenu
        */
        _closeMenu: function () {
            //隐藏菜单栏
            var left = $("#shrinknenu").offset().left;
            if (left > 100)
            {
                $("#shrinknenu").click();
            }
        },

        /**
        *显示菜单和调整工具栏
        *@method _showMenu
        */
        _showMenu: function () {
            ////显示菜单栏
            //var left = $("#shrinknenu").offset().left;
            //if (left < 100)
            //{
            //    $("#shrinknenu").click();
            //}
        }
    });
    return L.DCI.Layout.LeftContentPanel;
});