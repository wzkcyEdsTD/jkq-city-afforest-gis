/**
*系统全局对象类
*@module core
*@class DCI.Application
*@constructor initialize
*@extends DCI.BaseObject
*/
define("splitscreen/application", [
    "leaflet",
    "leaflet/esri",
    "core/dcins",
    "core/pool",
    "util/base",
    "core/symbol",
    "splitscreen/map",
    "splitscreen/compareResult"
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
        *工具
        *@property util
        *@type {Object}
        */
        util: null,


        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {},



        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            /*设置请求跨域*/
            L.esri.get = L.esri.Request.get.JSONP;
            //L.esri.post = L.esri.Request.post.JSONP;
            //L.esri.request = L.esri.Request.get.JSONP;

            try
            {
                this.options = options;
                this.pool = new L.DCI.Pool();
                this.util = new L.DCI.Util();
                this.symbol = new L.DCI.Symbol();
                document.body.innerHTML += this.getBodyHtml(options);
                this.body = $("#centerpanel");
                this.body.html(this.getMapHtml());
                var map = new L.DCI.SplitScreen.Map();
                this.pool.add(map);
                map.addDefaultLayer();
            } catch (e)
            {
                L.dci.log.showLog(e.message);
            }
        },

        /**
        *初始化界面
        *
        *@method init
        */
        init: function (type) {
            switch (type)
            {
                case '成果对比':
                    var compareResult = new L.DCI.SplitScreen.CompareResult();
                    break;
                default:
                    break;
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
            html.push('<div class="out-container">');
            html.push('<div class="row leftpanel" id="leftpanel"></div>');
            html.push('<div class="row mappanel mapone" id="centerpanel"></div>');
            html.push('</div>');
            return html.join("");
        },

        /**
        *获取地图分屏布局
        *
        *@method getMapHtml
        *@return {String} 返回界面布局标签
        */
        getMapHtml:function(){
            var html = [];
            html.push('<div id="mapone" class="col-sm-6"><div class="mapTool"><div></div><span class="icon-close1 closeScreen"></span></div></div>'); 
            html.push('<div id="maptwo" class="col-sm-6"><div class="mapTool"><div></div><span class="icon-close1 closeScreen"></span></div></div>');
            html.push('<div id="mapthree" class="col-sm-6"><div class="mapTool"><div></div><span class="icon-close1 closeScreen"></span></div></div>');
            html.push('<div id="mapfour" class="col-sm-6"><div class="mapTool"><div></div><span class="icon-close1 closeScreen"></span></div></div>');
            return html.join("");
        }
    });

    return L.DCI.Application;
});
