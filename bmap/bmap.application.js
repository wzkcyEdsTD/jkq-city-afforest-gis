/**
*Application类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/application", [
    "leaflet",
    "core/dcins",
    "core/symbol",
    "core/pool"
], function (L) {

    L.DCI.BMap.Application = L.Class.extend({

        /**
        *缓冲池对象
        *@property pool
        *@type {Object}
        *@private
        */
        pool: null,

        /**
        *符号对象
        *@property symbol
        *@type {Object}
        */
        symbol: null,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.pool = new L.DCI.Pool();
            this.symbol = new L.DCI.Symbol();
            /*设置请求跨域*/
            L.esri.get = L.esri.Request.get.JSONP;
            L.esri.post = L.esri.Request.get.JSONP;
            L.esri.request = L.esri.Request.get.JSONP;
        },
    });

    return L.DCI.BMap.Application;
});
