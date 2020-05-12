/**
*分析服务调用类
*@module data
*@class DCI.AnalysisServices
*@constructor initialize
*/
define("data/analysis", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {

    L.DCI.AnalysisServices = L.Class.extend({
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

        initialize: function (url) {
            this.baseUrl = url;
            this.ajax = new L.DCI.Ajax();
        },
        /**
        *获取参数字符串
        *@method getParamString
        *@param options {Object} 参数集
        *@return {String} 参数合成字符串
        */
        getParamString: function (options) {
            var param = "";
            for (var att in options) {
                if (att == "context" || att == "success" || att == "error") continue;
                param += att + "=" + options[att] + "&";
            }
            if (param != "") param = param.substring(0, param.length - 1);
            return param;
        },
        /*
        *冲突分析
        *@method conflictAnalysis
        *@param options {Object} 参数集
        */
        conflictAnalysis: function (options) {
            var param = this.getParamString(options);
            var url = this.baseUrl + "/analysisservices/conflictAnalysis?" + param;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

    });

    return L.DCI.AnalysisServices;
});