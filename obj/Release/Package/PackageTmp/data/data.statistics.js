/**
*统计服务调用类
*@module data
*@class DCI.StatisticsServices
*@constructor initialize
*/
define("data/statistics", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {

    L.DCI.StatisticsServices = L.Class.extend({
        /**
       *Ajax对象
       *@property ajax
       *@type {Object}
       *@private
       */
        ajax: null,
        /**
        *服务地址
        *@property baseUrl
        *@type {Object}
        *@private
        */
        baseUrl: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (url) {
            this.baseUrl = url;
            this.ajax = new L.DCI.Ajax();
        },

        /**
        *可用地规模统计
        *@method statYdInfo
        *@param options {Object} 参数集
        */
        statYdInfo: function (options) {
            var url = this.baseUrl + "/cpzx/static/mapmonitor/usable/land";
            var param = "{'kgIds':'" + options.kgIds + "','ydIds':'" + options.ydhxIds + "'}";
            return this.ajax.post(url, param, true, options.context, options.success, options.error);
        },

        /**
        *获取配套设施对照表
        *@method getPublicFacility
        *@param options {Object} 参数集
        */
        getPublicFacility: function (options) {
            var url = this.baseUrl + "/cpzx/static/mapmonitor/facility";
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        }
    });

    return L.DCI.StatisticsServices;
});