/**
*系统全局对象类
*@module core
*@class DCI.Application
*@constructor initialize
*@extends DCI.BaseObject
*/
define("core/application", [
    "leaflet",
    "core/dcins",
    "core/baseobject",
    "core/pool",
    "core/symbol",
    "data/baseservice",
    "data/services",
    "util/base",
    "core/multimap",
    "common/sview",
    "layout/menu",
    "layout/tool",
    "layout/centerpanel",
    "layout/bottompanel",
    "layout/leftpanel",
    "layout/rightpanel",
    "layout/toppanel"
], function (L) {
    L.DCI.Application = L.DCI.BaseObject.extend({

        /**
        *对象缓冲池
        *@property pool
        *@type {Object}
        */
        pool: null,

        /**
        *符号对象
        *@property symbol
        *@type {Object}
        */
        symbol: null,

        /**
        *信息提示框对象
        *@property dialog
        *@type {Object}
        */
        dialog: null,

        /**
        *菜单处理
        *@property tool
        *@type {Object}
        */
        tool: null,

        /**
        *工具
        *@property util
        *@type {Object}
        */
        util: null,

        /**
        *服务
        *@property services
        *@type {Object}
        */
        services: null,

        /**
        *菜单
        *@property menu
        *@type {Object}
        */
        menu: null,

        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {},

        /**
        *左面板
        *@property leftPanel
        *@type {Object}
        */
        leftPanel: null,

        /**
        *右面板
        *@property rightPanel
        *@type {Object}
        */
        rightPanel: null,
        
        /**
        *中心面板
        *@property centerPanel
        *@type {Object}
        */
        centerPanel: null,

        /**
        *顶面板
        *@property topPanel
        *@type {Object}
        */
        topPanel: null,

        /**
        *底面板
        *@property bottomPanel
        *@type {Object}
        */
        bottomPanel: null,

        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            /*设置请求跨域*/
            L.esri.get = L.esri.Request.get.JSONP;
            //L.esri.post = L.esri.Request.post.JSONP;
            //L.esri.request = L.esri.Request.get.JSONP;

            try {
                this.options = options;
                this.pool = new L.DCI.Pool();
                this.util = new L.DCI.Util();
                this.services = new L.DCI.Services(options);
                this.menu = new L.DCI.Menu(this.util,this.services);
                this.symbol = new L.DCI.Symbol();
                this.tool = new L.DCI.Tool();
                this.pool.add(this.tool);
                //document.body.innerHTML += this.getBodyHtml(options);
            } catch (e) {
                //console.log(e.message);
                L.dci.log.showLog(e.message);
            }
        },

        /**
        *初始化界面
        *
        *@method init
        */
        init: function () {
            try {
                if (this.options.left.visible == true) {
                    this.leftPanel = new L.DCI.Layout.LeftPanel();
                    this.pool.add(this.leftPanel);
                }
                if (this.options.right.visible == true) {
                    this.rightpanel = new L.DCI.Layout.RightPanel();
                    this.pool.add(this.rightpanel);
                } else {
                    $("#centerpanel").css("padding-right", "0px");
                    $("#rightpanel").css("display", "none");
                }
                if (this.options.bottom.visible == true) {
                    this.bottompanel = new L.DCI.Layout.BottomPanel();
                    this.pool.add(this.bottompanel);
                }
                if (this.options.top.visible == true) {
                    this.topPanel = new L.DCI.Layout.TopPanel();
                    this.pool.add(this.topPanel);
                }
                if (this.options.center.visible == true) {
                    this.centerPanel = new L.DCI.Layout.CenterPanel();
                    this.pool.add(this.centerPanel);
                }
                var multiMap = new L.DCI.MultiMap();
                L.dci.app.pool.add(multiMap);

                var sView = new L.DCI.SView();
                L.dci.app.pool.add(sView);

                
            } catch (e) {
                this.util.dialog.error("错误提示","系统初始化异常:"+e.message);
            }
        },

        /**
        *获取界面布局
        *
        *@method getBodyHtml
        *@param options {Object} 上下左右面板显示配置
        *@return {String} 返回界面布局标签
        */
        getBodyHtml: function (options) {
            var html = [];
            html.push('<div class="container-fluid out-container">');
            html.push('<div class="row nav-row toppanel" id="toppanel"></div>');
            html.push('<div class="row leftpanel" id="leftpanel"></div>');
            html.push('<div class="row mappanel" id="centerpanel"></div>');
            if(options.right.visible==true)
                html.push('<div class="row rightpanel" id="rightpanel"></div>');
            html.push('</div>');
            return html.join("");
        }
    });

    return L.DCI.Application;
});
